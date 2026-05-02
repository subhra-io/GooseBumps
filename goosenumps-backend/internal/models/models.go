package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ── Base ──────────────────────────────────────────────────────
type Base struct {
	ID        uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (b *Base) BeforeCreate(_ *gorm.DB) error {
	if b.ID == uuid.Nil {
		b.ID = uuid.New()
	}
	return nil
}

// ── Roles ─────────────────────────────────────────────────────
type Role string

const (
	RoleMerchant Role = "merchant"
	RoleAdmin    Role = "admin"
)

// ── User ──────────────────────────────────────────────────────
type User struct {
	Base
	Email          string     `gorm:"uniqueIndex;not null" json:"email"`
	PasswordHash   string     `gorm:"not null" json:"-"`
	Role           Role       `gorm:"default:'merchant'" json:"role"`
	IsVerified     bool       `gorm:"default:false" json:"is_verified"`
	IsActive       bool       `gorm:"default:true" json:"is_active"`
	LastLoginAt    *time.Time `json:"last_login_at"`
	PasswordChangedAt *time.Time `json:"password_changed_at"`

	// Relations
	Merchant *Merchant `gorm:"foreignKey:UserID" json:"merchant,omitempty"`
}

// ── Merchant ──────────────────────────────────────────────────
type MerchantStatus string

const (
	StatusPending  MerchantStatus = "pending"
	StatusUnderReview MerchantStatus = "under_review"
	StatusApproved MerchantStatus = "approved"
	StatusRejected MerchantStatus = "rejected"
	StatusSuspended MerchantStatus = "suspended"
)

type Merchant struct {
	Base
	UserID uuid.UUID `gorm:"type:uuid;not null;uniqueIndex" json:"user_id"`

	// Business Profile
	BusinessName string `json:"business_name"`
	LegalName    string `json:"legal_name"`
	Category     string `json:"category"`
	Email        string `json:"email"`
	Phone        string `json:"phone"`
	Address      string `json:"address"`
	City         string `json:"city"`
	ZIP          string `json:"zip"`
	Lat          float64 `json:"lat"`
	Lng          float64 `json:"lng"`
	MapAddress   string `json:"map_address"`
	LogoURL      string `json:"logo_url"`

	// Banking
	BankName      string `json:"bank_name"`
	AccountHolder string `json:"account_holder"`
	AccountNumber string `json:"-"` // encrypted at rest
	RoutingCode   string `json:"-"`
	Currency      string `json:"currency"`

	// Status
	Status          MerchantStatus `gorm:"default:'pending'" json:"status"`
	SubmittedAt     *time.Time     `json:"submitted_at"`
	ReviewedAt      *time.Time     `json:"reviewed_at"`
	ReviewedBy      *uuid.UUID     `gorm:"type:uuid" json:"reviewed_by"`
	RejectionReason string         `json:"rejection_reason,omitempty"`

	// Relations
	User      User       `gorm:"foreignKey:UserID" json:"-"`
	Documents []Document `gorm:"foreignKey:MerchantID" json:"documents,omitempty"`
	Reviewer  *User      `gorm:"foreignKey:ReviewedBy" json:"reviewer,omitempty"`
}

// ── Document ──────────────────────────────────────────────────
type DocumentType string

const (
	DocBusinessLicense DocumentType = "business_license"
	DocTaxID           DocumentType = "tax_id"
	DocOwnerIDFront    DocumentType = "owner_id_front"
	DocOwnerIDBack     DocumentType = "owner_id_back"
)

type Document struct {
	Base
	MerchantID uuid.UUID    `gorm:"type:uuid;not null;index" json:"merchant_id"`
	Type       DocumentType `json:"type"`
	FileName   string       `json:"file_name"`
	FileSize   int64        `json:"file_size"`
	MimeType   string       `json:"mime_type"`
	StorageKey string       `json:"-"` // internal path/key
	URL        string       `json:"url"`
	IsVerified bool         `gorm:"default:false" json:"is_verified"`
}

// ── OTP / Token ───────────────────────────────────────────────
// Stored in Redis, not DB. Key: otp:{email} Value: {code}

// ── Audit Log ─────────────────────────────────────────────────
type AuditAction string

const (
	AuditApprove  AuditAction = "approve"
	AuditReject   AuditAction = "reject"
	AuditSuspend  AuditAction = "suspend"
	AuditActivate AuditAction = "activate"
)

type AuditLog struct {
	Base
	AdminID    uuid.UUID   `gorm:"type:uuid;not null" json:"admin_id"`
	MerchantID uuid.UUID   `gorm:"type:uuid;not null;index" json:"merchant_id"`
	Action     AuditAction `json:"action"`
	Note       string      `json:"note"`
	Admin      User        `gorm:"foreignKey:AdminID" json:"admin"`
}

// ── Menu Item ─────────────────────────────────────────────────
type MenuItem struct {
	Base
	MerchantID   uuid.UUID `gorm:"type:uuid;not null;index" json:"merchant_id"`
	Name         string    `json:"name"`
	Description  string    `json:"description"`
	Price        float64   `json:"price"`
	Category     string    `json:"category"`
	ImageURL     string    `json:"image_url"`
	IsAvailable  bool      `gorm:"default:true" json:"is_available"`
	IsSpecial    bool      `gorm:"default:false" json:"is_special"`
	LoyaltyTier  string    `json:"loyalty_tier"`
}

// ── Order ─────────────────────────────────────────────────────
type OrderStatus string

const (
	OrderNew        OrderStatus = "new"
	OrderPreparing  OrderStatus = "preparing"
	OrderReady      OrderStatus = "ready"
	OrderDelivering OrderStatus = "out_for_delivery"
	OrderDelivered  OrderStatus = "delivered"
	OrderCancelled  OrderStatus = "cancelled"
)

type Order struct {
	Base
	MerchantID    uuid.UUID   `gorm:"type:uuid;not null;index" json:"merchant_id"`
	OrderRef      string      `gorm:"uniqueIndex" json:"order_ref"`
	CustomerName  string      `json:"customer_name"`
	CustomerPhone string      `json:"customer_phone"`
	Items         string      `json:"items"` // JSON string
	Total         float64     `json:"total"`
	Status        OrderStatus `gorm:"default:'new'" json:"status"`
	Type          string      `json:"type"` // pickup | delivery
	Notes         string      `json:"notes"`
}
