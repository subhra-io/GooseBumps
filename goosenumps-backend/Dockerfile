# ── Stage 1: Build ────────────────────────────────────────────
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Install build tools
RUN apk add --no-cache git ca-certificates tzdata

# Download dependencies first (cached layer)
COPY go.mod go.sum ./
RUN go mod download && go mod verify

# Copy all source code
COPY . .

# Build the binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build \
    -ldflags="-w -s -extldflags '-static'" \
    -o /app/server \
    ./cmd/server

# ── Stage 2: Runtime ──────────────────────────────────────────
FROM alpine:3.19

WORKDIR /app

# Security: non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Runtime dependencies
RUN apk add --no-cache ca-certificates tzdata wget
ENV TZ=Asia/Kolkata

# Copy binary from builder
COPY --from=builder /app/server ./server

# Create uploads dir
RUN mkdir -p uploads && chown -R appuser:appgroup /app

USER appuser

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:8080/health || exit 1

ENTRYPOINT ["./server"]
