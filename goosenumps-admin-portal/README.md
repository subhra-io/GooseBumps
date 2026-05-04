# Goosenumps Admin Portal

Separate Vercel deployment for the admin control center.

## URL
`https://admin.goosenumps.com`

## How it works
- Same React build as the merchant onboarding frontend
- The app detects the `/admin` path and renders the Admin Login → Admin Dashboard
- Deployed as a separate Vercel project pointing to this folder as root

## Deploy steps
1. Go to vercel.com → Add New Project
2. Import `subhra-io/GooseBumps`
3. Set **Root Directory** to `goosenumps-admin-portal`
4. Add environment variable:
   ```
   VITE_API_URL = https://api.goosenumps.com/api/v1
   ```
5. Deploy
6. Add custom domain: `admin.goosenumps.com`

## Environment Variables
| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://api.goosenumps.com/api/v1` |

## Default credentials
```
Email:    admin@goosenumps.com
Password: (set in Railway env ADMIN_PASSWORD)
```
