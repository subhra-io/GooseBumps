FROM golang:1.24-alpine

WORKDIR /app

RUN apk add --no-cache git ca-certificates tzdata wget

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 go build -o server ./cmd/server

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:$PORT/health || exit 1

CMD ["./server"]
