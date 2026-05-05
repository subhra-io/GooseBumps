package merchant

import (
	"fmt"
	"net/http"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/goosenumps/backend/config"
	"github.com/goosenumps/backend/internal/models"
	"gorm.io/gorm"
)

type Handler struct {
	db *gorm.DB
}

func NewHandler(db *gorm.DB) *Handler {
	return &Handler{db: db}
}

// ── POST /merchant/onboard ────────────────────────────────────
// Submit full onboarding data (called from React after step 4)

type OnboardRequest struct {
	// Business
	BusinessName string  `json:"business_name" binding:"required"`
	LegalName    string  `json:"legal_name"    binding:"required"`
	Category     string  `json:"category"      binding:"required"`
	Email        string  `json:"email"         binding:"required,email"`
	Phone        string  `json:"phone"         binding:"required"`
	Address      string  `json:"address"       binding:"required"`
	City         string  `json:"city"          binding:"required"`
	ZIP          string  `json:"zip"           binding:"required"`
	Lat          float64 `json:"lat"`
	Lng          float64 `json:"lng"`
	MapAddress   string  `json:"map_address"`
	// Banking
	BankName      string `json:"bank_name"      binding:"required"`
	AccountHolder string `json:"account_holder" binding:"required"`
	AccountNumber string `json:"account_number" binding:"required"`
	RoutingCode   string `json:"routing_code"   binding:"required"`
	Currency      string `json:"currency"`
}

func (h *Handler) Onboard(c *gin.Context) {
	var req OnboardRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Create user (unverified, no password yet)
	// Use a placeholder hash since password_hash is NOT NULL in DB
	// Real password will be set after OTP verification via /auth/set-password
	placeholderHash := "$2a$10$placeholder.hash.will.be.replaced.after.otp.verification"
	user := models.User{
		Email:        req.Email,
		PasswordHash: placeholderHash, // set after approval
		Role:         models.RoleMerchant,
		IsVerified:   false,
		IsActive:     false,
	}
	// Upsert user by email
	var existing models.User
	if err := h.db.Where("email = ?", req.Email).First(&existing).Error; err == nil {
		user = existing
	} else {
		if err := h.db.Create(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create user: " + err.Error()})
			return
		}
	}

	now := time.Now()
	merchant := models.Merchant{
		UserID:        user.ID,
		BusinessName:  req.BusinessName,
		LegalName:     req.LegalName,
		Category:      req.Category,
		Email:         req.Email,
		Phone:         req.Phone,
		Address:       req.Address,
		City:          req.City,
		ZIP:           req.ZIP,
		Lat:           req.Lat,
		Lng:           req.Lng,
		MapAddress:    req.MapAddress,
		BankName:      req.BankName,
		AccountHolder: req.AccountHolder,
		AccountNumber: req.AccountNumber, // TODO: encrypt
		RoutingCode:   req.RoutingCode,
		Currency:      req.Currency,
		Status:        models.StatusUnderReview,
		SubmittedAt:   &now,
	}

	// Upsert merchant
	var existingM models.Merchant
	if err := h.db.Where("user_id = ?", user.ID).First(&existingM).Error; err == nil {
		merchant.ID = existingM.ID
		if err := h.db.Save(&merchant).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update merchant: " + err.Error()})
			return
		}
	} else {
		if err := h.db.Create(&merchant).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create merchant: " + err.Error()})
			return
		}
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":     "Application submitted successfully",
		"merchant_id": merchant.ID,
		"status":      merchant.Status,
	})
}

// ── POST /merchant/documents ──────────────────────────────────

func (h *Handler) UploadDocument(c *gin.Context) {
	merchantID := c.Param("id")
	docType := c.PostForm("type")

	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file required"})
		return
	}
	defer file.Close()

	// Validate type
	validTypes := map[string]bool{
		"business_license": true,
		"tax_id":           true,
		"owner_id_front":   true,
		"owner_id_back":    true,
	}
	if !validTypes[docType] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid document type"})
		return
	}

	// Save file locally
	ext := filepath.Ext(header.Filename)
	storageKey := fmt.Sprintf("%s/%s%s", merchantID, uuid.New().String(), ext)
	savePath := filepath.Join(config.C.StorageLocalPath, storageKey)

	if err := c.SaveUploadedFile(header, savePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save file"})
		return
	}

	mID, _ := uuid.Parse(merchantID)
	doc := models.Document{
		MerchantID: mID,
		Type:       models.DocumentType(docType),
		FileName:   header.Filename,
		FileSize:   header.Size,
		MimeType:   header.Header.Get("Content-Type"),
		StorageKey: storageKey,
		URL:        "/uploads/" + storageKey,
	}

	// Replace existing doc of same type
	h.db.Where("merchant_id = ? AND type = ?", mID, docType).Delete(&models.Document{})
	if err := h.db.Create(&doc).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save document record"})
		return
	}

	c.JSON(http.StatusCreated, doc)
}

// ── GET /merchant/me ──────────────────────────────────────────

func (h *Handler) GetMyProfile(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var merchant models.Merchant
	if err := h.db.Preload("Documents").Where("user_id = ?", userID).First(&merchant).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "merchant not found"})
		return
	}
	c.JSON(http.StatusOK, merchant)
}

// ── GET /merchant/status ──────────────────────────────────────

func (h *Handler) GetStatus(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var merchant models.Merchant
	if err := h.db.Select("id, status, submitted_at, reviewed_at, rejection_reason").
		Where("user_id = ?", userID).First(&merchant).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"status":           merchant.Status,
		"submitted_at":     merchant.SubmittedAt,
		"reviewed_at":      merchant.ReviewedAt,
		"rejection_reason": merchant.RejectionReason,
	})
}

// ── GET /merchant/orders ──────────────────────────────────────

func (h *Handler) GetOrders(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var merchant models.Merchant
	if err := h.db.Where("user_id = ?", userID).First(&merchant).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "merchant not found"})
		return
	}

	var orders []models.Order
	query := h.db.Where("merchant_id = ?", merchant.ID).Order("created_at desc")
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	query.Limit(50).Find(&orders)
	c.JSON(http.StatusOK, gin.H{"orders": orders, "total": len(orders)})
}

// ── PATCH /merchant/orders/:id/status ────────────────────────

type UpdateOrderStatusRequest struct {
	Status models.OrderStatus `json:"status" binding:"required"`
}

func (h *Handler) UpdateOrderStatus(c *gin.Context) {
	orderID := c.Param("id")
	var req UpdateOrderStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.db.Model(&models.Order{}).Where("id = ?", orderID).
		Update("status", req.Status).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "update failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "status updated"})
}

// ── Menu CRUD ─────────────────────────────────────────────────

func (h *Handler) GetMenu(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var merchant models.Merchant
	h.db.Where("user_id = ?", userID).First(&merchant)

	var items []models.MenuItem
	h.db.Where("merchant_id = ?", merchant.ID).Find(&items)
	c.JSON(http.StatusOK, gin.H{"items": items, "total": len(items)})
}

func (h *Handler) CreateMenuItem(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var merchant models.Merchant
	h.db.Where("user_id = ?", userID).First(&merchant)

	var item models.MenuItem
	if err := c.ShouldBindJSON(&item); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	item.MerchantID = merchant.ID
	h.db.Create(&item)
	c.JSON(http.StatusCreated, item)
}

func (h *Handler) UpdateMenuItem(c *gin.Context) {
	itemID := c.Param("id")
	var item models.MenuItem
	if err := h.db.Where("id = ?", itemID).First(&item).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	c.ShouldBindJSON(&item)
	h.db.Save(&item)
	c.JSON(http.StatusOK, item)
}

func (h *Handler) DeleteMenuItem(c *gin.Context) {
	itemID := c.Param("id")
	h.db.Delete(&models.MenuItem{}, "id = ?", itemID)
	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}
