package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	Port   string
	Env    string

	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	DBSSLMode  string

	RedisAddr     string
	RedisPassword string
	RedisDB       int

	JWTSecret            string
	JWTExpiryHours       int
	RefreshExpiryDays    int

	OTPExpiryMinutes          int
	OTPLength                 int
	PasswordResetExpiryHours  int

	ResendAPIKey  string
	EmailFrom     string
	EmailFromName string

	StorageType      string
	StorageLocalPath string
	S3Bucket         string
	S3Region         string
	S3AccessKey      string
	S3SecretKey      string
	S3AccountID      string // Cloudflare R2 account ID

	AdminEmail    string
	AdminPassword string
}

var C Config

func Load() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, reading from environment")
	}

	C = Config{
		Port:   getEnv("PORT", "8080"),
		Env:    getEnv("ENV", "development"),

		DBHost:     getEnv("DB_HOST", "localhost"),
		DBPort:     getEnv("DB_PORT", "5432"),
		DBUser:     getEnv("DB_USER", "goosenumps"),
		DBPassword: getEnv("DB_PASSWORD", "secret"),
		DBName:     getEnv("DB_NAME", "goosenumps_db"),
		DBSSLMode:  getEnv("DB_SSLMODE", "disable"),

		RedisAddr:     getEnv("REDIS_ADDR", "localhost:6379"),
		RedisPassword: getEnv("REDIS_PASSWORD", ""),
		RedisDB:       getEnvInt("REDIS_DB", 0),

		JWTSecret:         getEnv("JWT_SECRET", "change-me"),
		JWTExpiryHours:    getEnvInt("JWT_EXPIRY_HOURS", 24),
		RefreshExpiryDays: getEnvInt("REFRESH_TOKEN_EXPIRY_DAYS", 30),

		OTPExpiryMinutes:         getEnvInt("OTP_EXPIRY_MINUTES", 10),
		OTPLength:                getEnvInt("OTP_LENGTH", 6),
		PasswordResetExpiryHours: getEnvInt("PASSWORD_RESET_EXPIRY_HOURS", 24),

		ResendAPIKey:  getEnv("RESEND_API_KEY", ""),
		EmailFrom:     getEnv("EMAIL_FROM", "noreply@goosenumps.com"),
		EmailFromName: getEnv("EMAIL_FROM_NAME", "Goosenumps"),

		StorageType:      getEnv("STORAGE_TYPE", "local"),
		StorageLocalPath: getEnv("STORAGE_LOCAL_PATH", "./uploads"),
		S3Bucket:         getEnv("S3_BUCKET", ""),
		S3Region:         getEnv("S3_REGION", "auto"),
		S3AccessKey:      getEnv("S3_ACCESS_KEY", ""),
		S3SecretKey:      getEnv("S3_SECRET_KEY", ""),
		S3AccountID:      getEnv("S3_ACCOUNT_ID", ""),

		AdminEmail:    getEnv("ADMIN_EMAIL", "admin@goosenumps.com"),
		AdminPassword: getEnv("ADMIN_PASSWORD", "Admin@123456"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func getEnvInt(key string, fallback int) int {
	if v := os.Getenv(key); v != "" {
		if i, err := strconv.Atoi(v); err == nil {
			return i
		}
	}
	return fallback
}
