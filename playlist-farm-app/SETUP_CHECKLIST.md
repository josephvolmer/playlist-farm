# Setup Checklist

✅ **Dependencies installed!** Now configure your environment to run the app.

## Required Before Running

### 1. ✅ DONE: Dependencies Installed
```bash
pnpm install  # ✅ Completed
```

### 2. ⚠️ TODO: Configure Environment Variables

Edit the `.env` file in the root directory with your real credentials:

#### Required (App won't run without these):

**Database:**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/musicplatform"
```
- Create a PostgreSQL database
- Update with your connection string

**NextAuth Secret:**
```env
NEXTAUTH_SECRET="your-secret-here"
```
- Generate with: `openssl rand -base64 32`

**Spotify API:**
```env
SPOTIFY_CLIENT_ID="your-spotify-client-id"
SPOTIFY_CLIENT_SECRET="your-spotify-client-secret"
```
- Get from: https://developer.spotify.com/dashboard
- Create new app → Copy credentials

**Stripe:**
```env
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```
- Get from: https://dashboard.stripe.com/test/apikeys
- Use TEST mode keys for development

#### Optional (Nice to have):

**Google OAuth:**
```env
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```
- Get from: https://console.cloud.google.com
- Users can still sign up with email/password if you skip this

### 3. ⚠️ TODO: Set Up PostgreSQL Database

**Option A: Local PostgreSQL**
```bash
# Install PostgreSQL (if not already installed)
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb musicplatform
```

**Option B: Cloud Database (Easier)**
- Supabase: https://supabase.com (Free tier available)
- Railway: https://railway.app (Free tier available)
- Neon: https://neon.tech (Free tier available)

Update `DATABASE_URL` in `.env` with your connection string.

### 4. ⚠️ TODO: Run Database Migrations

```bash
npx prisma migrate dev --name init
```

This will:
- Create all database tables
- Generate Prisma Client
- Set up the schema

### 5. ✅ READY: Run the Development Server

```bash
pnpm dev
```

Visit: http://localhost:3000

## Quick Setup Guide for External Services

### Spotify Developer Account (5 minutes)

1. Go to https://developer.spotify.com/dashboard
2. Click "Create app"
3. Fill in:
   - App name: "Music Playlist Platform"
   - App description: "Playlist submission platform"
   - Redirect URI: `http://localhost:3000` (not needed for this app but required)
4. Click "Settings" → Copy:
   - Client ID → `SPOTIFY_CLIENT_ID`
   - Client Secret → `SPOTIFY_CLIENT_SECRET`

### Stripe Account (5 minutes)

1. Go to https://dashboard.stripe.com/register
2. Create account (can skip verification for test mode)
3. Click "Developers" in top right
4. Click "API keys"
5. Copy:
   - Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Secret key → `STRIPE_SECRET_KEY`
6. For webhook secret (needed for payments to work):
   - Click "Webhooks" → "Add endpoint"
   - Endpoint URL: `http://localhost:3000/api/tokens/webhook`
   - Events: Select `payment_intent.succeeded` and `payment_intent.payment_failed`
   - Copy "Signing secret" → `STRIPE_WEBHOOK_SECRET`

   Note: For local development, use Stripe CLI for webhooks:
   ```bash
   stripe listen --forward-to localhost:3000/api/tokens/webhook
   ```

### Google OAuth (Optional, 5 minutes)

1. Go to https://console.cloud.google.com
2. Create new project
3. APIs & Services → OAuth consent screen
4. Configure (External, fill required fields)
5. Credentials → Create OAuth Client ID
6. Application type: Web application
7. Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
8. Copy:
   - Client ID → `GOOGLE_CLIENT_ID`
   - Client Secret → `GOOGLE_CLIENT_SECRET`

## Testing the Platform

### First User (Artist)
1. Visit http://localhost:3000
2. Click "Get Started"
3. Sign up with email/password
4. You'll receive 10 free tokens
5. Try submitting a track!

### Test URLs for Spotify
Use any of these for testing:
- `https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp` (Billie Eilish - Birds of a Feather)
- `https://open.spotify.com/track/1BxfuPKGuaTgP7aM0Bbdwr` (Tame Impala - The Less I Know The Better)
- Any other Spotify track URL you like!

### Create a Curator Account (Optional)
1. Sign up normally
2. Access your database (using Prisma Studio):
   ```bash
   npx prisma studio
   ```
3. Open http://localhost:5555
4. Click "User" table
5. Find your user and change `role` to `CURATOR`
6. Create a playlist in the "Playlist" table with your user ID as `curatorId`
7. Visit http://localhost:3000/curator to review submissions

## Common Issues

### "Can't connect to database"
- Make sure PostgreSQL is running
- Check `DATABASE_URL` format is correct
- Try: `psql -d musicplatform` to test connection

### "Prisma Client not found"
- Run: `npx prisma generate`

### "Spotify API error"
- Check credentials in `.env`
- Make sure you're using the correct Client ID and Secret
- Verify the Spotify track URL is valid

### "Stripe payment not working"
- Use test mode credentials (starting with `sk_test_` and `pk_test_`)
- Set up webhook endpoint
- For local testing, use Stripe CLI

## Next Steps After Setup

1. ✅ App running at http://localhost:3000
2. Create test submissions as an artist
3. Set up curator account to review submissions
4. Customize the platform for your needs
5. Deploy to production (see README.md)

## Need Help?

- Check the full README.md for detailed documentation
- Check QUICKSTART.md for a streamlined setup guide
- Review the Prisma schema: `prisma/schema.prisma`
- Explore the code in `app/` and `components/`

---

**Current Status:**
- ✅ Next.js project created
- ✅ Dependencies installed
- ✅ Prisma schema ready
- ⚠️ Need to configure `.env`
- ⚠️ Need to run database migrations
- ⚠️ Ready to run after configuration!
