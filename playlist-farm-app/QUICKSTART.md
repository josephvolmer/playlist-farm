# Quick Start Guide

Get your music playlist submission platform running in minutes!

## Fastest Way to Get Started (5 minutes)

### 1. Install Dependencies

```bash
npm install
# or
bun install
```

### 2. Set Up Environment Variables

Copy the `.env.example` to `.env`:

```bash
cp .env.example .env
```

Then update `.env` with your credentials:

**Required:**
- `DATABASE_URL` - Your PostgreSQL connection string
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `SPOTIFY_CLIENT_ID` & `SPOTIFY_CLIENT_SECRET` - From [Spotify Dashboard](https://developer.spotify.com/dashboard)
- `STRIPE_SECRET_KEY` & `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - From [Stripe Dashboard](https://dashboard.stripe.com)

**Optional:**
- Google OAuth credentials (users can still sign up with email/password)

### 3. Set Up Database

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Run the App

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## What You Get

### For Artists (Default User Role)
1. **Sign Up** - Create account (gets 10 free tokens)
2. **Submit Music** - Paste any Spotify track URL
3. **Find Matches** - Algorithm finds matching playlists
4. **Submit to Playlists** - Select and submit (costs tokens)
5. **Track Progress** - Monitor submission status

### For Curators
To test curator features:

1. Sign up normally
2. In your database, update your user:
   ```sql
   UPDATE users SET role = 'CURATOR' WHERE email = 'your@email.com';
   ```
3. Create a playlist record:
   ```sql
   INSERT INTO playlists (id, spotify_id, name, curator_id, is_active)
   VALUES (gen_random_uuid(), 'spotify_id_here', 'Test Playlist', 'your_user_id', true);
   ```
4. Visit `/curator` to review submissions

## Essential API Endpoints

### Get Spotify Credentials
1. Go to [Spotify for Developers](https://developer.spotify.com/dashboard)
2. Create an app
3. Note the Client ID and Secret

### Get Stripe Credentials
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to Developers → API keys
3. Get test mode keys
4. Set up webhook at `/api/tokens/webhook` for `payment_intent.succeeded` and `payment_intent.payment_failed`

### Google OAuth (Optional)
1. [Google Cloud Console](https://console.cloud.google.com)
2. Create project → Enable Google+ API
3. Create OAuth credentials
4. Add redirect: `http://localhost:3000/api/auth/callback/google`

## Database Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name your_migration_name

# View database
npx prisma studio

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Deploy migrations (production)
npx prisma migrate deploy
```

## Testing the Platform

### As an Artist:
1. Sign up at `/auth`
2. You'll get 10 free tokens
3. Click "New Submission" from dashboard
4. Paste a Spotify track URL (e.g., `https://open.spotify.com/track/...`)
5. Add optional metadata (genres, vibe, similar artists)
6. Click "Find Matching Playlists"
7. Select playlists and submit

### As a Curator:
1. Update your role to CURATOR in database
2. Create playlist records
3. Visit `/curator`
4. Review pending submissions
5. Accept or decline with feedback

## Common Issues

### "Spotify API Error"
- Check your Spotify credentials in `.env`
- Ensure the Spotify track URL is valid
- Verify your app has proper permissions

### "Database Connection Error"
- Verify PostgreSQL is running
- Check `DATABASE_URL` format: `postgresql://user:password@localhost:5432/dbname`
- Run `npx prisma generate`

### "NextAuth Error"
- Generate a new `NEXTAUTH_SECRET` with `openssl rand -base64 32`
- Ensure `NEXTAUTH_URL` matches your domain

### "Stripe Payment Not Working"
- Use Stripe test mode credentials
- Set up webhook endpoint
- Check webhook signing secret

## Project Structure

```
├── app/
│   ├── api/          # API routes
│   ├── auth/         # Authentication page
│   ├── dashboard/    # Artist dashboard
│   ├── curator/      # Curator dashboard
│   └── page.tsx      # Homepage
├── components/
│   ├── dashboard/    # Dashboard components
│   ├── curator/      # Curator components
│   └── ui/           # shadcn/ui components
├── lib/
│   ├── spotify.ts    # Spotify API integration
│   ├── matching.ts   # Playlist matching algorithm
│   ├── stripe.ts     # Stripe integration
│   └── prisma.ts     # Database client
├── prisma/
│   └── schema.prisma # Database schema
└── .env              # Environment variables
```

## Next Steps

### Production Deployment
1. Set up PostgreSQL database (Railway, Supabase, etc.)
2. Update environment variables for production
3. Deploy to Vercel/Railway/Render
4. Set up Stripe webhooks with production URL
5. Configure production Spotify redirect URIs

### Feature Ideas
- Email notifications
- Analytics dashboard
- Advanced search/filtering
- Playlist categories
- User reviews and ratings
- Mobile app
- Automated playlist updates

## Resources

- [Full Documentation](README.md)
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Spotify API Docs](https://developer.spotify.com/documentation/web-api)
- [Stripe Docs](https://stripe.com/docs)

## Support

Need help? Check:
- README.md for detailed documentation
- Prisma schema for database structure
- API routes in `app/api/` for endpoints
- Component files for UI implementation

Happy coding!
