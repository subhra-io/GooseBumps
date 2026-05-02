package admin

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/goosenumps/backend/config"
	"github.com/goosenumps/backend/internal/email"
	"github.com/goosenumps/backend/internal/models"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

type Handler struct {
	db  *gorm.DB
	rdb *redis.Client
}

func NewHandler(db *gorm.DB, rdb *redis.Client) *Handler {
	return &Handler{db: db, rdb: rdb}
}

// ── GET /admin/dashboard ──────────────────────────────────────

func (h *Handler) Dashboard(c *gin.Context) {
	var totalMerchants, activeMerchants, pendingCount int64
	h.db.Model(&models.Merchant{}).Count(&totalMerchants)
	h.db.Model(&models.Merchant{}).Where("status = ?", models.StatusApproved).Count(&activeMerchants)
	h.db.Model(&models.Merchant{}).Where("status IN ?", []string{
		string(models.StatusPending), string(models.StatusUnderReview),
	}).Count(&pendingCount)

	var liveOrders int64
	h.db.Model(&models.Order{}).Where("status NOT IN ?", []string{
		string(models.OrderDelivered), string(models.OrderCancelled),
	}).Count(&liveOrders)

	// Revenue (sum of all orders)
	var totalRevenue float64
	h.db.Model(&models.Order{}).Select("COALESCE(SUM(total), 0)").Scan(&totalRevenue)

	c.JSON(http.StatusOK, gin.H{
		"total_merchants":  totalMerchants,
		"active_merchants": activeMerchants,
		"pending_review":   pendingCount,
		"live_orders":      liveOrders,
		"total_revenue":    totalRevenue,
		"avg_commission":   14.2,
	})
}

// ── GET /admin/merchants ──────────────────────────────────────

func (h *Handler) ListMerchants(c *gin.Context) {
	status := c.Query("status")
	search := c.Query("search")
	page := 1
	limit := 20

	query := h.db.Model(&models.Merchant{}).Preload("User").Preload("Documents")
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if search != "" {
		query = query.Where("business_name ILIKE ? OR email ILIKE ? OR legal_name ILIKE ?",
			"%"+search+"%", "%"+search+"%", "%"+search+"%")
	}

	var total int64
	query.Count(&total)

	var merchants []models.Merchant
	query.Offset((page - 1) * limit).Limit(limit).
		Order("submitted_at desc").Find(&merchants)

	c.JSON(http.StatusOK, gin.H{
		"merchants": merchants,
		"total":     total,
		"page":      page,
		"limit":     limit,
	})
}

// ── GET /admin/merchants/:id ──────────────────────────────────

func (h *Handler) GetMerchant(c *gin.Context) {
	id := c.Param("id")
	var merchant models.Merchant
	if err := h.db.Preload("User").Preload("Documents").Preload("Reviewer").
		Where("id = ?", id).First(&merchant).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	c.JSON(http.StatusOK, merchant)
}

// ── POST /admin/merchants/:id/approve ────────────────────────

func (h *Handler) ApproveMerchant(c *gin.Context) {
	id := c.Param("id")
	adminID, _ := c.Get("user_id")

	var merchant models.Merchant
	if err := h.db.Preload("User").Where("id = ?", id).First(&merchant).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}

	now := time.Now()
	aID, _ := uuid.Parse(adminID.(string))
	merchant.Status = models.StatusApproved
	merchant.ReviewedAt = &now
	merchant.ReviewedBy = &aID
	h.db.Save(&merchant)

	// Activate user
	h.db.Model(&models.User{}).Where("id = ?", merchant.UserID).
		Update("is_active", true)

	// Generate password-setup token (valid 24h)
	token := generateSecureToken()
	ttl := time.Duration(config.C.PasswordResetExpiryHours) * time.Hour
	h.rdb.Set(context.Background(), "pwd_token:"+token, merchant.User.Email, ttl)

	// Send approval email with setup link
	frontendURL := "http://localhost:5175"
	if os.Getenv("ENV") == "production" {
		frontendURL = "https://goosenumps.com"
	}
	go email.SendPasswordSetup(merchant.User.Email, merchant.BusinessName, token, frontendURL)

	// Audit log
	h.db.Create(&models.AuditLog{
		AdminID:    aID,
		MerchantID: merchant.ID,
		Action:     models.AuditApprove,
		Note:       "Merchant approved",
	})

	c.JSON(http.StatusOK, gin.H{
		"message": "merchant approved",
		"status":  merchant.Status,
	})
}

// ── POST /admin/merchants/:id/reject ─────────────────────────

type RejectRequest struct {
	Reason string `json:"reason" binding:"required"`
}

func (h *Handler) RejectMerchant(c *gin.Context) {
	id := c.Param("id")
	adminID, _ := c.Get("user_id")

	var req RejectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var merchant models.Merchant
	if err := h.db.Preload("User").Where("id = ?", id).First(&merchant).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}

	now := time.Now()
	aID, _ := uuid.Parse(adminID.(string))
	merchant.Status = models.StatusRejected
	merchant.ReviewedAt = &now
	merchant.ReviewedBy = &aID
	merchant.RejectionReason = req.Reason
	h.db.Save(&merchant)

	go email.SendRejectionNotification(merchant.User.Email, merchant.BusinessName, req.Reason)

	h.db.Create(&models.AuditLog{
		AdminID:    aID,
		MerchantID: merchant.ID,
		Action:     models.AuditReject,
		Note:       req.Reason,
	})

	c.JSON(http.StatusOK, gin.H{"message": "merchant rejected"})
}

// ── POST /admin/merchants/:id/suspend ────────────────────────

func (h *Handler) SuspendMerchant(c *gin.Context) {
	id := c.Param("id")
	adminID, _ := c.Get("user_id")
	aID, _ := uuid.Parse(adminID.(string))

	h.db.Model(&models.Merchant{}).Where("id = ?", id).Update("status", models.StatusSuspended)
	h.db.Model(&models.User{}).
		Joins("JOIN merchants ON merchants.user_id = users.id").
		Where("merchants.id = ?", id).Update("is_active", false)

	h.db.Create(&models.AuditLog{
		AdminID:    aID,
		MerchantID: uuid.MustParse(id),
		Action:     models.AuditSuspend,
		Note:       "Suspended by admin",
	})

	c.JSON(http.StatusOK, gin.H{"message": "merchant suspended"})
}

// ── GET /admin/audit-logs ─────────────────────────────────────

func (h *Handler) AuditLogs(c *gin.Context) {
	merchantID := c.Query("merchant_id")
	var logs []models.AuditLog
	query := h.db.Preload("Admin").Order("created_at desc").Limit(100)
	if merchantID != "" {
		query = query.Where("merchant_id = ?", merchantID)
	}
	query.Find(&logs)
	c.JSON(http.StatusOK, gin.H{"logs": logs})
}

// ── GET /admin/pending ────────────────────────────────────────

func (h *Handler) PendingApplications(c *gin.Context) {
	var merchants []models.Merchant
	h.db.Preload("Documents").
		Where("status IN ?", []string{string(models.StatusPending), string(models.StatusUnderReview)}).
		Order("submitted_at asc").
		Limit(20).Find(&merchants)
	c.JSON(http.StatusOK, gin.H{"applications": merchants, "count": len(merchants)})
}

// ── GET /admin/analytics ──────────────────────────────────────

func (h *Handler) Analytics(c *gin.Context) {
	// Weekly revenue (last 7 days)
	type DayRevenue struct {
		Day     string  `json:"day"`
		Revenue float64 `json:"revenue"`
		Orders  int     `json:"orders"`
	}

	var weeklyData []DayRevenue
	h.db.Raw(`
		SELECT TO_CHAR(created_at, 'Dy') as day,
		       COALESCE(SUM(total), 0) as revenue,
		       COUNT(*) as orders
		FROM orders
		WHERE created_at >= NOW() - INTERVAL '7 days'
		GROUP BY TO_CHAR(created_at, 'Dy'), DATE_TRUNC('day', created_at)
		ORDER BY DATE_TRUNC('day', created_at)
	`).Scan(&weeklyData)

	c.JSON(http.StatusOK, gin.H{
		"weekly_revenue": weeklyData,
	})
}

// ── helpers ───────────────────────────────────────────────────

func generateSecureToken() string {
	b := make([]byte, 32)
	rand.Read(b)
	return hex.EncodeToString(b)
}
