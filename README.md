# CAMPUSWARDROBE

A peer-to-peer clothing rental platform for college students in India.

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (Next.js 14)             │
│                    Deployed on Vercel                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │  Auth     │ │ Listings │ │  Admin   │            │
│  │  Pages    │ │ & Rental │ │  Panel   │            │
│  └──────────┘ └──────────┘ └──────────┘            │
└──────────────────┬──────────────────────────────────┘
                   │ HTTPS / REST API
┌──────────────────▼──────────────────────────────────┐
│                Backend (Express + TypeScript)         │
│                Deployed on Render / Railway           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │  Auth    │ │  Booking │ │  Payment │            │
│  │  Module  │ │  Engine  │ │  (Razorpay)│           │
│  └──────────┘ └──────────┘ └──────────┘            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │  Escrow  │ │  Admin   │ │  Email   │            │
│  │  System  │ │  Module  │ │  Service │            │
│  └──────────┘ └──────────┘ └──────────┘            │
└──────────────────┬──────────────────────────────────┘
                   │ Prisma ORM
┌──────────────────▼──────────────────────────────────┐
│            PostgreSQL (Supabase / Neon)               │
│  Users │ Listings │ Bookings │ Payments │ Reviews    │
│  Transactions │ Wallets │ Disputes                   │
└─────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | Next.js 14, TypeScript, TailwindCSS, ShadCN UI |
| Backend    | Express.js, TypeScript, Prisma ORM  |
| Database   | PostgreSQL (Supabase/Neon)          |
| Auth       | JWT + bcrypt                        |
| Payments   | Razorpay (UPI, Cards, NetBanking)   |
| Images     | Cloudinary                          |
| Email      | Nodemailer                          |
| Hosting    | Vercel (FE), Render/Railway (BE)    |

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Razorpay account
- Cloudinary account
- SMTP email credentials

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env  # Fill in your values
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local  # Fill in your values
npm run dev
```

## Deployment

### Backend (Render)
1. Push to GitHub
2. Create new Web Service on Render
3. Set build command: `cd backend && npm install && npx prisma generate`
4. Set start command: `cd backend && npm start`
5. Add environment variables from `.env.example`

### Backend (Railway)
1. Connect GitHub repo
2. Set root directory to `backend`
3. Add environment variables
4. Railway auto-detects Node.js

### Frontend (Vercel)
1. Import repo on Vercel
2. Set root directory to `frontend`
3. Add `NEXT_PUBLIC_API_URL` environment variable
4. Deploy

### Database (Supabase)
1. Create new project on supabase.com
2. Copy connection string from Settings > Database
3. Use as `DATABASE_URL` in backend .env

### Database (Neon)
1. Create new project on neon.tech
2. Copy connection string
3. Use as `DATABASE_URL` in backend .env

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/verify-email/:token` - Verify email
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/profile` - Get profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/upload-avatar` - Upload avatar
- `GET /api/users/wallet` - Get wallet info
- `GET /api/users/:id/public` - Get public profile

### Listings
- `GET /api/listings` - Get all listings (with filters)
- `GET /api/listings/:id` - Get listing detail
- `POST /api/listings` - Create listing
- `PUT /api/listings/:id` - Update listing
- `DELETE /api/listings/:id` - Delete listing
- `GET /api/listings/my` - Get user's listings

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my` - Get user's bookings
- `GET /api/bookings/:id` - Get booking detail
- `PUT /api/bookings/:id/status` - Update booking status
- `POST /api/bookings/:id/complete` - Complete booking

### Payments
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment
- `POST /api/payments/webhook` - Razorpay webhook
- `GET /api/payments/:bookingId` - Get payment info

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/listing/:listingId` - Get listing reviews
- `GET /api/reviews/user/:userId` - Get user reviews

### Admin
- `GET /api/admin/users` - List users
- `GET /api/admin/bookings` - List bookings
- `GET /api/admin/transactions` - List transactions
- `GET /api/admin/disputes` - List disputes
- `PUT /api/admin/disputes/:id/resolve` - Resolve dispute
- `GET /api/admin/analytics` - Revenue analytics
- `PUT /api/admin/listings/:id/flag` - Flag/approve listing

## Testing

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## Scaling Recommendations

1. **CDN**: Use Cloudflare for static assets
2. **Database**: Enable connection pooling (PgBouncer on Supabase)
3. **Caching**: Add Redis for session/listing caching
4. **Queue**: Use BullMQ for background jobs (emails, escrow processing)
5. **Search**: Integrate Algolia or Meilisearch for listing search
6. **Monitoring**: Add Sentry for error tracking
7. **Analytics**: Use PostHog or Mixpanel
8. **Storage**: Migrate to S3 + CloudFront for images
9. **Rate Limiting**: Use Redis-backed rate limiter in production
10. **Load Balancing**: Scale horizontally behind a load balancer

## License

MIT
