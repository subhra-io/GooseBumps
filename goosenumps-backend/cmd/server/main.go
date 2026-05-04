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

	// ── Start HTTP server immediately so healthcheck passes ──
	// DB and Redis connect in background; routes return 503 until ready
	if config.C.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.Default()

	// ── CORS ─────────────────────────────────────────────
	r.Use(cors.New(cors.Config{
		AllowAllOrigins:  true, // tighten after domain is confirmed
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: false, // must be false when AllowAllOrigins=true
		MaxAge:           12 * time.Hour,
	}))

	// ── Health (always responds, even before DB is ready) ──
	dbReady    := false
	redisReady := false
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":      "ok",
			"time":        time.Now(),
			"db_ready":    dbReady,
			"redis_ready": redisReady,
		})
	})

	// Static uploads
	r.Static("/uploads", config.C.StorageLocalPath)

	// ── Connect DB ────────────────────────────────────────
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
	var rdb *redis.Client

	// Retry DB connection up to 10 times
	for i := 1; i <= 10; i++ {
		var err error
		db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{Logger: gormLogger})
		if err == nil {
			dbReady = true
			log.Println("✅ Database connected")
			break
		}
		log.Printf("⏳ DB attempt %d/10 failed: %v — retrying in 3s", i, err)
		time.Sleep(3 * time.Second)
	}
	if !dbReady {
		log.Println("❌ Could not connect to database — check DATABASE_URL env var")
	}

	if dbReady {
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
	}

	// ── Connect Redis ─────────────────────────────────────
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
			log.Printf("⚠️  Redis not available: %v — OTP features will be degraded", err)
		} else {
			redisReady = true
			log.Println("✅ Redis connected")
		}
	}

	// ── Email ─────────────────────────────────────────────
	email.Init()

	// ── Register API routes (only if DB is ready) ─────────
	api := r.Group("/api/v1")

	// Auth routes (need Redis for OTP)
	authGroup := api.Group("/auth")
	if db != nil && rdb != nil {
		authH := auth.NewHandler(db, rdb)
		authGroup.POST("/send-otp",     authH.SendOTP)
		authGroup.POST("/verify-otp",   authH.VerifyOTP)
		authGroup.POST("/resend-otp",   authH.ResendOTP)
		authGroup.POST("/set-password", authH.SetPassword)
		authGroup.POST("/login",        authH.Login)
		authGroup.GET("/me", middleware.AuthRequired(), authH.Me)
	} else {
		authGroup.Any("/*path", func(c *gin.Context) {
			c.JSON(http.StatusServiceUnavailable, gin.H{"error": "service starting up, please retry"})
		})
	}

	// Merchant routes
	if db != nil {
		merchantH := merchant.NewHandler(db)
		merchantGroup := api.Group("/merchant")
		merchantGroup.POST("/onboard",       merchantH.Onboard)
		merchantGroup.POST("/:id/documents", merchantH.UploadDocument)

		protected := merchantGroup.Group("", middleware.AuthRequired(), middleware.MerchantRequired())
		protected.GET("/me",                  merchantH.GetMyProfile)
		protected.GET("/status",              merchantH.GetStatus)
		protected.GET("/orders",              merchantH.GetOrders)
		protected.PATCH("/orders/:id/status", merchantH.UpdateOrderStatus)
		protected.GET("/menu",                merchantH.GetMenu)
		protected.POST("/menu",               merchantH.CreateMenuItem)
		protected.PUT("/menu/:id",            merchantH.UpdateMenuItem)
		protected.DELETE("/menu/:id",         merchantH.DeleteMenuItem)
	}

	// Admin routes
	if db != nil && rdb != nil {
		adminH     := admin.NewHandler(db, rdb)
		adminGroup := api.Group("/admin", middleware.AuthRequired(), middleware.AdminRequired())
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

	log.Printf("🚀 Server running on :%s (db=%v redis=%v)", config.C.Port, dbReady, redisReady)
	if err := r.Run(":" + config.C.Port); err != nil {
		log.Fatalf("server error: %v", err)
	}
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
