# Music Playlist Submission Platform

A modern web application that connects independent artists with playlist curators, built with Next.js 16, TypeScript, Prisma, and shadcn/ui.

## Features

### For Artists
- **Smart Playlist Matching**: AI-powered algorithm matches your tracks with relevant playlists based on genre, vibe, and similar artists
- **Easy Submissions**: Simple workflow to submit music with Spotify integration
- **Token System**: Fair, transparent pricing with $1 USD per token
- **Automatic Refunds**: Get tokens back if curators don't review within 72 hours
- **Submission Tracking**: Monitor all your submissions and curator feedback in one dashboard

### For Curators
- **Streamlined Review Process**: Review submissions with integrated Spotify playback
- **Playlist Management**: Manage multiple playlists and submission settings
- **Feedback System**: Provide feedback to artists on accepted and declined submissions
- **Time-based Reviews**: 72-hour review window ensures timely responses

### Platform Features
- **Modern UI**: Built with shadcn/ui for a clean, professional interface
- **Secure Authentication**: Email/password and Google OAuth via NextAuth.js
- **Payment Processing**: Stripe integration for token purchases
- **Real-time Notifications**: Stay updated on submission status changes
- **PostgreSQL Database**: Robust data storage with Prisma ORM

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **UI**: shadcn/ui components, Tailwind CSS
- **Authentication**: NextAuth.js v5
- **Database**: PostgreSQL with Prisma ORM
- **Payments**: Stripe
- **External APIs**: Spotify Web API
- **Deployment Ready**: Vercel, Railway, or any Node.js host

## Prerequisites

- Node.js 18+ or Bun
- PostgreSQL database
- Spotify Developer Account
- Stripe Account (for payments)
- Google OAuth credentials (optional, for social login)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/musicplatform"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here-use-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Spotify API
SPOTIFY_CLIENT_ID="your-spotify-client-id"
SPOTIFY_CLIENT_SECRET="your-spotify-client-secret"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

## Setup Instructions

### 1. Clone and Install

```bash
cd magicnothing.xyz
npm install
# or
bun install
```

### 2. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed database with sample data
npx prisma db seed
```

### 3. Spotify API Setup

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Add `http://localhost:3000` to redirect URIs
4. Copy Client ID and Client Secret to `.env`

### 4. Stripe Setup

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Get your API keys from Developers → API keys
3. Set up webhook endpoint at `/api/tokens/webhook`
4. Add webhook signing secret to `.env`

### 5. Google OAuth Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Add credentials to `.env`

### 6. Run Development Server

```bash
npm run dev
# or
bun dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Database Schema

The platform uses the following main models:

- **User**: Artists, curators, and admins
- **Playlist**: Curator-owned playlists
- **Submission**: Track submissions to playlists
- **TokenTransaction**: Token purchases and usage
- **Notification**: User notifications

See `prisma/schema.prisma` for full schema details.

## Key Features Explained

### Playlist Matching Algorithm

The matching algorithm (`lib/matching.ts`) scores playlists based on:
- Genre overlap (highest weight)
- Vibe/description matching
- Similar artist references
- Follower count (sweet spot: 100-50,000)

Matches are categorized as:
- **High Potential**: Score ≥ 20
- **Medium Potential**: Score ≥ 10
- **Exploratory**: Score < 10

### Token System

- Artists purchase tokens at $1 USD per token
- Bulk discounts available (5% off for 200+ tokens)
- Tokens are spent when submitting to playlists
- Automatic refunds if curator doesn't review within 72 hours
- All transactions tracked in database

### Submission Workflow

1. Artist enters Spotify track URL
2. System fetches track metadata from Spotify API
3. Matching algorithm finds relevant playlists
4. Artist selects playlists and confirms (tokens deducted)
5. Curators review within 72 hours
6. Accept: Artist gets added to playlist
7. Decline: Tokens automatically refunded

## API Routes

### Authentication
- `POST /api/auth/register` - Create new account
- `GET/POST /api/auth/[...nextauth]` - NextAuth.js routes

### Submissions
- `POST /api/submissions/find-matches` - Find matching playlists
- `POST /api/submissions/create` - Create new submission

### Tokens
- `POST /api/tokens/create-payment-intent` - Create Stripe payment
- `POST /api/tokens/webhook` - Stripe webhook handler

### Curator
- `POST /api/curator/review` - Accept/decline submission

### Notifications
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications` - Mark as read

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Railway / Render

1. Create PostgreSQL database
2. Set environment variables
3. Deploy from GitHub
4. Run migrations: `npx prisma migrate deploy`

## Cron Jobs (Production)

Set up a cron job to handle expired submissions:

```bash
# Run every hour
0 * * * * curl https://your-domain.com/api/cron/expire-submissions
```

Create `/api/cron/expire-submissions/route.ts` to refund tokens for expired submissions.

## Testing

New users receive 10 free tokens to test the platform.

### Test as Artist:
1. Sign up
2. Submit a track using any Spotify URL
3. View submissions in dashboard

### Test as Curator:
1. Sign up
2. Manually update user role to `CURATOR` in database
3. Create a playlist record in database
4. Review submissions in curator dashboard

## Security Considerations

- All API routes are protected with authentication
- User roles enforce access control (artist vs curator)
- CSRF protection via NextAuth.js
- SQL injection prevention via Prisma
- XSS protection via React
- Environment variables for sensitive data
- Stripe webhook signature verification

## Performance

- Server-side rendering with Next.js App Router
- Database indexing on frequently queried fields
- Spotify API token caching
- Optimized Prisma queries with select/include

## Contributing

This is a demonstration project. For production use, consider:

- Add comprehensive error handling
- Implement rate limiting
- Add email notifications
- Create admin dashboard
- Add analytics tracking
- Implement search and filtering
- Add more payment options
- Mobile app version

## License

MIT License - Feel free to use this project as a template for your own platform!

## Support

For questions or issues:
- Create an issue on GitHub
- Email: support@yourplatform.com

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Music data from [Spotify Web API](https://developer.spotify.com/documentation/web-api/)
- Payments by [Stripe](https://stripe.com/)
