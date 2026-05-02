# Goosenumps Backend — Go API

## Stack
- **Go 1.22** + Gin (HTTP framework)
- **PostgreSQL** (GORM ORM)
- **Redis** (OTP + password-reset tokens)
- **Resend** (transactional email)
- **JWT** (auth tokens)

## Quick Start

### 1. Install Go
```bash
brew install go
# or download from https://go.dev/dl/
```

### 2. Install PostgreSQL + Redis
```bash
brew install postgresql@16 redis
brew services start postgresql@16
brew services start redis
```

### 3. Create database
```bash
psql postgres -c "CREATE USER goosenumps WITH PASSWORD 'secret';"
psql postgres -c "CREATE DATABASE goosenumps_db OWNER goosenumps;"
```

### 4. Configure environment
```bash
cp .env.example .env
# Edit .env — set RESEND_API_KEY, JWT_SECRET, etc.
```

### 5. Install dependencies & run
```bash
cd goosenumps-backend
go mod tidy
go run ./cmd/server
```

Server starts on **http://localhost:8080**

---

## API Reference

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/auth/send-otp` | Send 6-digit OTP to email |
| POST | `/api/v1/auth/verify-otp` | Verify OTP code |
| POST | `/api/v1/auth/resend-otp` | Resend OTP (rate limited) |
| POST | `/api/v1/auth/set-password` | Set password via token (from email link) |
| POST | `/api/v1/auth/login` | Login → JWT token |
| GET  | `/api/v1/auth/me` | Get current user (auth required) |

### Merchant (public)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/merchant/onboard` | Submit onboarding form |
| POST | `/api/v1/merchant/:id/documents` | Upload KYC document |

### Merchant (authenticated)
| Method | Path | Description |
|--------|------|-------------|
| GET  | `/api/v1/merchant/me` | Get merchant profile |
| GET  | `/api/v1/merchant/status` | Get application status |
| GET  | `/api/v1/merchant/orders` | List orders |
| PATCH| `/api/v1/merchant/orders/:id/status` | Update order status |
| GET  | `/api/v1/merchant/menu` | List menu items |
| POST | `/api/v1/merchant/menu` | Create menu item |
| PUT  | `/api/v1/merchant/menu/:id` | Update menu item |
| DELETE| `/api/v1/merchant/menu/:id` | Delete menu item |

### Admin (admin JWT required)
| Method | Path | Description |
|--------|------|-------------|
| GET  | `/api/v1/admin/dashboard` | Platform KPIs |
| GET  | `/api/v1/admin/merchants` | List all merchants |
| GET  | `/api/v1/admin/merchants/:id` | Get merchant detail |
| POST | `/api/v1/admin/merchants/:id/approve` | Approve → sends password setup email |
| POST | `/api/v1/admin/merchants/:id/reject` | Reject with reason |
| POST | `/api/v1/admin/merchants/:id/suspend` | Suspend merchant |
| GET  | `/api/v1/admin/pending` | Pending applications |
| GET  | `/api/v1/admin/audit-logs` | Audit trail |
| GET  | `/api/v1/admin/analytics` | Revenue analytics |

---

## Flow

```
1. Restaurant fills onboarding form (React)
   → POST /merchant/onboard  (creates User + Merchant, status=under_review)
   → POST /merchant/:id/documents  (upload KYC files)

2. OTP verification
   → POST /auth/send-otp  (Redis stores OTP, email sent via Resend)
   → POST /auth/verify-otp  (marks user.is_verified=true)

3. Admin reviews in Admin Dashboard
   → POST /admin/merchants/:id/approve
     → sets status=approved, is_active=true
     → generates 24h password-setup token in Redis
     → sends email with link: /auth/set-password?token=xxx

4. Merchant clicks email link
   → SetPasswordScreen (React)
   → POST /auth/set-password  (sets password hash, clears token)

5. Merchant logs in
   → POST /auth/login  → JWT token
   → Merchant Dashboard (Orders, Menu, Analytics)
```

---

## Default Admin
```
Email:    admin@goosenumps.com
Password: Admin@123456
```
(seeded automatically on first run)
