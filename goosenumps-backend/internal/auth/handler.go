package auth

import (
	"context"
	"crypto/rand"
	"log"
	"math/big"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/goosenumps/backend/config"
	"github.com/goosenumps/backend/internal/email"
	"github.com/goosenumps/backend/internal/middleware"
	"github.com/goosenumps/backend/internal/models"
	"github.com/redis/go-redis/v9"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type Handler struct {
	db  *gorm.DB
	rdb *redis.Client // may be nil if Redis unavailable
}

func NewHandler(db *gorm.DB, rdb *redis.Client) *Handler {
	return &Handler{db: db, rdb: rdb}
}

// ── OTP helpers ───────────────────────────────────────────────

func generateOTP(length int) (string, error) {
	digits := "0123456789"
	otp := make([]byte, length)
	for i := range otp {
		n, err := rand.Int(rand.Reader, big.NewInt(int64(len(digits))))
		if err != nil {
			return "", err
		}
		otp[i] = digits[n.Int64()]
	}
	return string(otp), nil
}

func otpKey(email string) string { return "otp:" + email }
func pwdTokenKey(token string) string { return "pwd_token:" + token }

// ── JWT helper ────────────────────────────────────────────────

func generateJWT(user *models.User) (string, error) {
	exp := time.Now().Add(time.Duration(config.C.JWTExpiryHours) * time.Hour)
	claims := middleware.Claims{
		UserID: user.ID.String(),
		Email:  user.Email,
		Role:   user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(exp),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(config.C.JWTSecret))
}

// ── POST /auth/send-otp ───────────────────────────────────────
// Called after onboarding form submission to verify email

type SendOTPRequest struct {
	Email string `json:"email" binding:"required,email"`
	Name  string `json:"name"`
}

func (h *Handler) SendOTP(c *gin.Context) {
	var req SendOTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	otp, err := generateOTP(config.C.OTPLength)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate OTP"})
		return
	}

	ttl := time.Duration(config.C.OTPExpiryMinutes) * time.Minute
	if err := h.rdb.Set(context.Background(), otpKey(req.Email), otp, ttl).Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to store OTP"})
		return
	}

	if err := email.SendOTP(req.Email, req.Name, otp); err != nil {
		log.Printf("[DEV] OTP send failed for %s: %v\n", req.Email, err)
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "OTP sent",
		"expires_in":  config.C.OTPExpiryMinutes * 60,
		"masked_email": maskEmail(req.Email),
	})
}

// ── POST /auth/verify-otp ─────────────────────────────────────

type VerifyOTPRequest struct {
	Email string `json:"email" binding:"required,email"`
	OTP   string `json:"otp"   binding:"required"`
}

func (h *Handler) VerifyOTP(c *gin.Context) {
	var req VerifyOTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	stored, err := h.rdb.Get(context.Background(), otpKey(req.Email)).Result()
	if err == redis.Nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "OTP expired or not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "redis error"})
		return
	}
	if stored != req.OTP {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid OTP"})
		return
	}

	// Delete OTP after use
	h.rdb.Del(context.Background(), otpKey(req.Email))

	// Mark user as verified
	h.db.Model(&models.User{}).Where("email = ?", req.Email).Update("is_verified", true)

	c.JSON(http.StatusOK, gin.H{"message": "OTP verified", "verified": true})
}

// ── POST /auth/set-password ───────────────────────────────────
// Used after admin approval — token sent via email

type SetPasswordRequest struct {
	Token    string `json:"token"    binding:"required"`
	Password string `json:"password" binding:"required,min=8"`
}

func (h *Handler) SetPassword(c *gin.Context) {
	var req SetPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get email from token
	emailAddr, err := h.rdb.Get(context.Background(), pwdTokenKey(req.Token)).Result()
	if err == redis.Nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "token expired or invalid"})
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to hash password"})
		return
	}

	now := time.Now()
	result := h.db.Model(&models.User{}).Where("email = ?", emailAddr).Updates(map[string]interface{}{
		"password_hash":       string(hash),
		"is_verified":         true,
		"is_active":           true,
		"password_changed_at": now,
	})
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update password"})
		return
	}

	// Delete token
	h.rdb.Del(context.Background(), pwdTokenKey(req.Token))

	c.JSON(http.StatusOK, gin.H{"message": "password set successfully"})
}

// ── POST /auth/login ──────────────────────────────────────────

type LoginRequest struct {
	Email    string `json:"email"    binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func (h *Handler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := h.db.Where("email = ?", req.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}

	if !user.IsActive {
		c.JSON(http.StatusForbidden, gin.H{"error": "account is inactive"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}

	token, err := generateJWT(&user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate token"})
		return
	}

	now := time.Now()
	h.db.Model(&user).Update("last_login_at", now)

	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"user": gin.H{
			"id":    user.ID,
			"email": user.Email,
			"role":  user.Role,
		},
	})
}

// ── POST /auth/resend-otp ─────────────────────────────────────

func (h *Handler) ResendOTP(c *gin.Context) {
	var req SendOTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	// Rate limit: check if OTP already exists with > 9 min TTL
	ttl, _ := h.rdb.TTL(context.Background(), otpKey(req.Email)).Result()
	if ttl > 9*time.Minute {
		c.JSON(http.StatusTooManyRequests, gin.H{"error": "please wait before requesting a new OTP"})
		return
	}
	// Reuse SendOTP logic
	h.SendOTP(c)
}

// ── GET /auth/me ──────────────────────────────────────────────

func (h *Handler) Me(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var user models.User
	if err := h.db.Preload("Merchant").Where("id = ?", userID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}
	c.JSON(http.StatusOK, user)
}

// ── helpers ───────────────────────────────────────────────────

func maskEmail(e string) string {
	for i, ch := range e {
		if ch == '@' {
			prefix := e[:i]
			if len(prefix) <= 2 {
				return e
			}
			return prefix[:2] + "***" + e[i:]
		}
	}
	return e
}
