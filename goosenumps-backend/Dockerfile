FROM golang:1.22-alpine

WORKDIR /app

# Build dependencies
RUN apk add --no-cache git ca-certificates tzdata wget

# Cache go modules
COPY go.mod go.sum ./
RUN go mod download

# Copy source
COPY . .

# Build binary
RUN CGO_ENABLED=0 go build -o server ./cmd/server

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:$PORT/health || exit 1

CMD ["./server"]
