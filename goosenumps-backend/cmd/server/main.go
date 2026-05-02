package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/goosenumps/backend/config"
	"github.com/goosenumps/backend/internal/admin"
	"github.com/goosenumps/backend/internal/auth"
	"github.com/goosenumps/backend/internal/email"
	"github.com/goosenumps/backend/internal/merchant"
	"github.com/goosenumps/backend/internal/middleware"
	"github.com/goosenumps/backend/internal/models"
	"github.com/redis/go-redis/v9"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func main() {
	// ── Config ────────────────────────────────────────────
	config.Load()

	// ── Database ──────────────────────────────────────────
	// Support both DATABASE_URL (Railway/Neon) and individual vars
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = fmt.Sprintf(
			"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s TimeZone=Asia/Kolkata",
			config.C.DBHost, config.C.DBPort, config.C.DBUser,
			config.C.DBPassword, config.C.DBName, config.C.DBSSLMode,
		)
	}

	gormLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags),
		logger.Config{SlowThreshold: 200 * time.Millisecond, LogLevel: logger.Warn},
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{Logger: gormLogger})
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	log.Println("✅ Database connected")

	// Auto-migrate
	if err := db.AutoMigrate(
		&models.User{},
		&models.Merchant{},
		&models.Document{},
		&models.AuditLog{},
		&models.MenuItem{},
		&models.Order{},
	); err != nil {
		log.Fatalf("migration failed: %v", err)
	}
	log.Println("✅ Migrations complete")

	// Seed admin
	seedAdmin(db)

	// ── Redis ─────────────────────────────────────────────
	// Support REDIS_URL (Railway/Upstash) or individual vars
	var rdb *redis.Client
	if redisURL := os.Getenv("REDIS_URL"); redisURL != "" {
		opt, err := redis.ParseURL(redisURL)
		if err != nil {
			log.Fatalf("invalid REDIS_URL: %v", err)
		}
		rdb = redis.NewClient(opt)
	} else {
		rdb = redis.NewClient(&redis.Options{
			Addr:     config.C.RedisAddr,
			Password: config.C.RedisPassword,
			DB:       config.C.RedisDB,
		})
	}
	if err := rdb.Ping(context.Background()).Err(); err != nil {
		log.Fatalf("failed to connect to Redis: %v", err)
	}
	log.Println("✅ Redis connected")

	// ── Email ─────────────────────────────────────────────
	email.Init()

	// ── Handlers ──────────────────────────────────────────
	authH     := auth.NewHandler(db, rdb)
	merchantH := merchant.NewHandler(db)
	adminH    := admin.NewHandler(db, rdb)

	// ── Router ────────────────────────────────────────────
	if config.C.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.Default()

	// CORS
	allowedOrigins := []string{
		"http://localhost:5173",
		"http://localhost:5174",
		"http://localhost:5175",
		"http://localhost:3000",
	}
	if config.C.Env == "production" {
		allowedOrigins = []string{
			"https://goosenumps.com",
			"https://www.goosenumps.com",
			"https://admin.goosenumps.com",
		}
	}
	r.Use(cors.New(cors.Config{
		AllowOrigins:     allowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Static uploads
	r.Static("/uploads", config.C.StorageLocalPath)

	// Health
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok", "time": time.Now()})
	})

	api := r.Group("/api/v1")

	// ── Auth routes ───────────────────────────────────────
	authGroup := api.Group("/auth")
	{
		authGroup.POST("/send-otp",      authH.SendOTP)
		authGroup.POST("/verify-otp",    authH.VerifyOTP)
		authGroup.POST("/resend-otp",    authH.ResendOTP)
		authGroup.POST("/set-password",  authH.SetPassword)
		authGroup.POST("/login",         authH.Login)
		authGroup.GET("/me", middleware.AuthRequired(), authH.Me)
	}

	// ── Merchant routes ───────────────────────────────────
	merchantGroup := api.Group("/merchant")
	{
		// Public: submit onboarding
		merchantGroup.POST("/onboard", merchantH.Onboard)
		merchantGroup.POST("/:id/documents", merchantH.UploadDocument)

		// Protected
		protected := merchantGroup.Group("", middleware.AuthRequired(), middleware.MerchantRequired())
		{
			protected.GET("/me",                    merchantH.GetMyProfile)
			protected.GET("/status",                merchantH.GetStatus)
			protected.GET("/orders",                merchantH.GetOrders)
			protected.PATCH("/orders/:id/status",   merchantH.UpdateOrderStatus)
			protected.GET("/menu",                  merchantH.GetMenu)
			protected.POST("/menu",                 merchantH.CreateMenuItem)
			protected.PUT("/menu/:id",              merchantH.UpdateMenuItem)
			protected.DELETE("/menu/:id",           merchantH.DeleteMenuItem)
		}
	}

	// ── Admin routes ──────────────────────────────────────
	adminGroup := api.Group("/admin", middleware.AuthRequired(), middleware.AdminRequired())
	{
		adminGroup.GET("/dashboard",              adminH.Dashboard)
		adminGroup.GET("/merchants",              adminH.ListMerchants)
		adminGroup.GET("/merchants/:id",          adminH.GetMerchant)
		adminGroup.POST("/merchants/:id/approve", adminH.ApproveMerchant)
		adminGroup.POST("/merchants/:id/reject",  adminH.RejectMerchant)
		adminGroup.POST("/merchants/:id/suspend", adminH.SuspendMerchant)
		adminGroup.GET("/pending",                adminH.PendingApplications)
		adminGroup.GET("/audit-logs",             adminH.AuditLogs)
		adminGroup.GET("/analytics",              adminH.Analytics)
	}

	log.Printf("🚀 Server running on :%s", config.C.Port)
	if err := r.Run(":" + config.C.Port); err != nil {
		log.Fatalf("server error: %v", err)
	}
}

func seedAdmin(db *gorm.DB) {
	var count int64
	db.Model(&models.User{}).Where("role = ?", models.RoleAdmin).Count(&count)
	if count > 0 {
		return
	}
	hash, _ := bcrypt.GenerateFromPassword([]byte(config.C.AdminPassword), bcrypt.DefaultCost)
	admin := models.User{
		Email:        config.C.AdminEmail,
		PasswordHash: string(hash),
		Role:         models.RoleAdmin,
		IsVerified:   true,
		IsActive:     true,
	}
	if err := db.Create(&admin).Error; err != nil {
		log.Printf("admin seed error: %v", err)
		return
	}
	log.Printf("✅ Admin seeded: %s", config.C.AdminEmail)
}
