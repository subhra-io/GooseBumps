package storage

import (
	"context"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/google/uuid"
	"github.com/goosenumps/backend/config"
)

// Upload saves a file either locally or to S3/R2.
// Returns (publicURL, storageKey, error).
func Upload(file multipart.File, header *multipart.FileHeader, folder string) (string, string, error) {
	ext := filepath.Ext(header.Filename)
	key := fmt.Sprintf("%s/%s%s", folder, uuid.New().String(), ext)
	ct  := header.Header.Get("Content-Type")
	if ct == "" {
		ct = "application/octet-stream"
	}

	if config.C.StorageType == "s3" {
		url, err := uploadToS3(file, key, ct)
		return url, key, err
	}
	url, err := uploadLocal(file, key)
	return url, key, err
}

// ── Local ─────────────────────────────────────────────────────

func uploadLocal(file multipart.File, key string) (string, error) {
	savePath := filepath.Join(config.C.StorageLocalPath, key)
	if err := os.MkdirAll(filepath.Dir(savePath), 0755); err != nil {
		return "", err
	}
	dst, err := os.Create(savePath)
	if err != nil {
		return "", err
	}
	defer dst.Close()
	if _, err := io.Copy(dst, file); err != nil {
		return "", err
	}
	return "/uploads/" + key, nil
}

// ── S3 / Cloudflare R2 ────────────────────────────────────────

func uploadToS3(file multipart.File, key, contentType string) (string, error) {
	client := newS3Client()
	_, err := client.PutObject(context.Background(), &s3.PutObjectInput{
		Bucket:      aws.String(config.C.S3Bucket),
		Key:         aws.String(key),
		Body:        file,
		ContentType: aws.String(contentType),
	})
	if err != nil {
		return "", fmt.Errorf("s3 upload: %w", err)
	}
	// Public URL — works for R2 public buckets or AWS S3
	url := fmt.Sprintf("https://%s.r2.dev/%s", config.C.S3Bucket, key)
	if config.C.S3Region != "auto" {
		// Standard AWS S3
		url = fmt.Sprintf("https://%s.s3.%s.amazonaws.com/%s", config.C.S3Bucket, config.C.S3Region, key)
	}
	return url, nil
}

func newS3Client() *s3.Client {
	cfg := aws.Config{
		Credentials: credentials.NewStaticCredentialsProvider(
			config.C.S3AccessKey,
			config.C.S3SecretKey,
			"",
		),
		Region: config.C.S3Region,
	}
	// Cloudflare R2 uses a custom endpoint
	if config.C.S3AccountID != "" {
		endpoint := fmt.Sprintf("https://%s.r2.cloudflarestorage.com", config.C.S3AccountID)
		return s3.NewFromConfig(cfg, func(o *s3.Options) {
			o.BaseEndpoint = aws.String(endpoint)
			o.UsePathStyle  = true
		})
	}
	return s3.NewFromConfig(cfg)
}
