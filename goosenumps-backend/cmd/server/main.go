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
	config.Load()

	if config.C.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.Default()

	// ── CORS — allow all origins (tighten after domain confirmed) ──
	r.Use(cors.New(cors.Config{
		AllowAllOrigins:  true,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: false,
		MaxAge:           12 * time.Hour,
	}))

	// ── /health responds immediately — Railway healthcheck passes ──
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok", "time": time.Now()})
	})

	// ── /reset-admin — secured by ADMIN_RESET_SECRET env var ──────
	// Usage: POST /reset-admin {"secret":"YOUR_SECRET","password":"NewPass123!"}
	var dbRef *gorm.DB // will be set after DB connects below
	r.POST("/reset-admin", func(c *gin.Context) {
		secret := os.Getenv("ADMIN_RESET_SECRET")
		if secret == "" {
			c.JSON(http.StatusForbidden, gin.H{"error": "ADMIN_RESET_SECRET not set"})
			return
		}
		var body struct {
			Secret   string `json:"secret"`
			Password string `json:"password"`
		}
		if err := c.ShouldBindJSON(&body); err != nil || body.Secret != secret {
			c.JSON(http.StatusForbidden, gin.H{"error": "invalid secret"})
			return
		}
		if dbRef == nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{"error": "db not ready yet, retry in a few seconds"})
			return
		}
		hash, _ := bcrypt.GenerateFromPassword([]byte(body.Password), bcrypt.DefaultCost)
		result := dbRef.Model(&models.User{}).
			Where("email = ?", config.C.AdminEmail).
			Updates(map[string]interface{}{
				"password_hash": string(hash),
				"is_active":     true,
				"is_verified":   true,
			})
		if result.RowsAffected == 0 {
			a := models.User{
				Email:        config.C.AdminEmail,
				PasswordHash: string(hash),
				Role:         models.RoleAdmin,
				IsVerified:   true,
				IsActive:     true,
			}
			dbRef.Create(&a)
		}
		c.JSON(http.StatusOK, gin.H{
			"message": "admin password updated",
			"email":   config.C.AdminEmail,
		})
	})

	// Static uploads
	r.Static("/uploads", config.C.StorageLocalPath)

	// ── Start HTTP server in background immediately ──────────────
	// This ensures /health responds before DB/Redis connect
	go func() {
		port := config.C.Port
		log.Printf("🚀 HTTP server listening on :%s", port)
		if err := r.Run(":" + port); err != nil {
			log.Fatalf("server error: %v", err)
		}
	}()

	// ── Connect DB (with retries, non-blocking for healthcheck) ──
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

	var db *gorm.DB
	for i := 1; i <= 15; i++ {
		var err error
		db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{Logger: gormLogger})
		if err == nil {
			dbRef = db // make available to reset-admin handler
			log.Println("✅ Database connected")
			break
		}
		log.Printf("⏳ DB attempt %d/15: %v — retrying in 4s", i, err)
		time.Sleep(4 * time.Second)
	}
	if db == nil {
		log.Println("❌ Database unavailable — API routes not registered. Check DATABASE_URL.")
		// Keep server alive so healthcheck keeps passing
		select {}
	}

	// Migrate
	if err := db.AutoMigrate(
		&models.User{},
		&models.Merchant{},
		&models.Document{},
		&models.AuditLog{},
		&models.MenuItem{},
		&models.Order{},
	); err != nil {
		log.Printf("⚠️  Migration warning: %v", err)
	} else {
		log.Println("✅ Migrations complete")
	}
	seedAdmin(db)

	// ── Connect Redis ─────────────────────────────────────────────
	var rdb *redis.Client
	if redisURL := os.Getenv("REDIS_URL"); redisURL != "" {
		opt, err := redis.ParseURL(redisURL)
		if err != nil {
			log.Printf("⚠️  Invalid REDIS_URL: %v", err)
		} else {
			rdb = redis.NewClient(opt)
		}
	} else {
		rdb = redis.NewClient(&redis.Options{
			Addr:     config.C.RedisAddr,
			Password: config.C.RedisPassword,
			DB:       config.C.RedisDB,
		})
	}
	if rdb != nil {
		if err := rdb.Ping(context.Background()).Err(); err != nil {
			log.Printf("⚠️  Redis unavailable: %v — OTP features degraded", err)
			rdb = nil
		} else {
			log.Println("✅ Redis connected")
		}
	}

	// ── Email ─────────────────────────────────────────────────────
	email.Init()

	// ── Register API routes now that DB is ready ─────────────────
	api := r.Group("/api/v1")

	// Auth
	if rdb != nil {
		authH := auth.NewHandler(db, rdb)
		ag := api.Group("/auth")
		ag.POST("/send-otp",     authH.SendOTP)
		ag.POST("/verify-otp",   authH.VerifyOTP)
		ag.POST("/resend-otp",   authH.ResendOTP)
		ag.POST("/set-password", authH.SetPassword)
		ag.POST("/login",        authH.Login)
		ag.GET("/me", middleware.AuthRequired(), authH.Me)
	} else {
		// Login still works without Redis (no OTP needed for login)
		authH := auth.NewHandler(db, nil)
		ag := api.Group("/auth")
		ag.POST("/login", authH.Login)
		ag.GET("/me", middleware.AuthRequired(), authH.Me)
		ag.Any("/send-otp",     unavailable)
		ag.Any("/verify-otp",   unavailable)
		ag.Any("/resend-otp",   unavailable)
		ag.Any("/set-password", unavailable)
	}

	// Merchant
	merchantH := merchant.NewHandler(db)
	mg := api.Group("/merchant")
	mg.POST("/onboard",       merchantH.Onboard)
	mg.POST("/:id/documents", merchantH.UploadDocument)
	mp := mg.Group("", middleware.AuthRequired(), middleware.MerchantRequired())
	mp.GET("/me",                  merchantH.GetMyProfile)
	mp.GET("/status",              merchantH.GetStatus)
	mp.GET("/orders",              merchantH.GetOrders)
	mp.PATCH("/orders/:id/status", merchantH.UpdateOrderStatus)
	mp.GET("/menu",                merchantH.GetMenu)
	mp.POST("/menu",               merchantH.CreateMenuItem)
	mp.PUT("/menu/:id",            merchantH.UpdateMenuItem)
	mp.DELETE("/menu/:id",         merchantH.DeleteMenuItem)

	// Admin
	var adminRdb *redis.Client
	if rdb != nil {
		adminRdb = rdb
	} else {
		// Create a dummy client — admin handler will handle nil gracefully
		adminRdb = redis.NewClient(&redis.Options{Addr: "localhost:6379"})
	}
	adminH := admin.NewHandler(db, adminRdb)
	adg := api.Group("/admin", middleware.AuthRequired(), middleware.AdminRequired())
	adg.GET("/dashboard",              adminH.Dashboard)
	adg.GET("/merchants",              adminH.ListMerchants)
	adg.GET("/merchants/:id",          adminH.GetMerchant)
	adg.POST("/merchants/:id/approve", adminH.ApproveMerchant)
	adg.POST("/merchants/:id/reject",  adminH.RejectMerchant)
	adg.POST("/merchants/:id/suspend", adminH.SuspendMerchant)
	adg.GET("/pending",                adminH.PendingApplications)
	adg.GET("/audit-logs",             adminH.AuditLogs)
	adg.GET("/analytics",              adminH.Analytics)

	log.Printf("✅ All routes registered — server fully ready")

	// Block forever (HTTP server runs in goroutine above)
	select {}
}

func unavailable(c *gin.Context) {
	c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Redis not available — OTP features temporarily disabled"})
}

func seedAdmin(db *gorm.DB) {
	if db == nil {
		return
	}
	var count int64
	db.Model(&models.User{}).Where("role = ?", models.RoleAdmin).Count(&count)
	if count > 0 {
		return
	}
	hash, _ := bcrypt.GenerateFromPassword([]byte(config.C.AdminPassword), bcrypt.DefaultCost)
	a := models.User{
		Email:        config.C.AdminEmail,
		PasswordHash: string(hash),
		Role:         models.RoleAdmin,
		IsVerified:   true,
		IsActive:     true,
	}
	if err := db.Create(&a).Error; err != nil {
		log.Printf("admin seed error: %v", err)
		return
	}
	log.Printf("✅ Admin seeded: %s", config.C.AdminEmail)
}
