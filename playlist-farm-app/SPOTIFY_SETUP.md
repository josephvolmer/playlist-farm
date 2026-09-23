# Spotify App Setup Guide

Complete step-by-step guide to create your Spotify app and get credentials.

## Step 1: Go to Spotify Developer Dashboard

🔗 Visit: **https://developer.spotify.com/dashboard**

## Step 2: Log In

- Click **"Log in"** in the top right corner
- Use your Spotify account (free or premium, both work)
- Don't have a Spotify account? Create one at [spotify.com](https://www.spotify.com)

## Step 3: Create Your App

1. Click the green **"Create app"** button

2. Fill in the form:

   **App name:**
   ```
   PlaylistConnect
   ```
   (or any name you prefer)

   **App description:**
   ```
   Music playlist submission platform
   ```
   (or describe your use case)

   **Website:**
   ```
   http://127.0.0.1:3000
   ```
   (optional for development)

   **Redirect URIs:** ⚠️ **CRITICAL - Must be exact:**
   ```
   http://127.0.0.1:3000/api/auth/callback/spotify
   ```

   ⚠️ **Important Spotify Security Requirements:**
   - ✅ Use `127.0.0.1` (IPv4 loopback address)
   - ✅ Use `http://` for local development
   - ❌ Do NOT use `localhost` (Spotify blocks this)
   - ❌ Do NOT add trailing slash
   - ✅ For production, use HTTPS: `https://yourdomain.com/api/auth/callback/spotify`

   **Which API/SDKs are you planning to use?**
   - ✅ Check **Web API**

3. ✅ Accept the **Developer Terms of Service**

4. Click **"Save"**

## Step 4: Get Your Credentials

1. After creating the app, you'll see your app dashboard
2. Click the **"Settings"** button (top right)
3. You'll see your credentials:

   **Client ID:**
   - This is visible by default
   - Copy the entire string (looks like: `a1b2c3d4e5f6g7h8i9j0...`)

   **Client Secret:**
   - Click **"View client secret"** button
   - Copy the revealed secret (looks like: `z9y8x7w6v5u4t3s2r1q0...`)

⚠️ **Keep these secret!** Never commit them to git or share publicly.

## Step 5: Update Your .env File

1. Open the `.env` file in your project root:
   ```bash
   code .env
   # or
   nano .env
   ```

2. Update these lines with your actual credentials:

   ```env
   # Spotify OAuth (paste your real values)
   SPOTIFY_CLIENT_ID="paste-your-client-id-here"
   SPOTIFY_CLIENT_SECRET="paste-your-client-secret-here"
   ```

3. Also generate a NextAuth secret:
   ```bash
   openssl rand -base64 32
   ```

   Copy the output and add it to `.env`:
   ```env
   NEXTAUTH_SECRET="paste-output-here"
   ```

## Step 6: Verify Your Configuration

Your complete `.env` should look like:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/musicplatform"

# NextAuth
NEXTAUTH_SECRET="J8F3k9mP2nQ5rT8vY1xZ4bC6dE9gH2jK5mN8pR1tV4wX7zA0"
NEXTAUTH_URL="http://127.0.0.1:3000"

# Spotify OAuth
SPOTIFY_CLIENT_ID="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
SPOTIFY_CLIENT_SECRET="z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4"

# Stripe (add these later)
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

## Step 7: Restart Your Server

Important: Changes to `.env` require a server restart:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
pnpm dev
```

## Step 8: Test It Out!

1. Visit **http://127.0.0.1:3000** (note: use 127.0.0.1, not localhost)
2. Click **"Get Started"**
3. Click **"Continue with Spotify"**
4. You should see Spotify's authorization page:
   - Shows what permissions the app is requesting
   - Shows your app name
   - "Agree" or "Cancel" buttons
5. Click **"Agree"**
6. You'll be redirected to your dashboard!
7. New account is automatically created with 10 free tokens

## Common Issues & Solutions

### Error: "Invalid redirect URI"

**Problem:** The redirect URI doesn't match exactly.

**Solution:**
1. Go to Spotify Dashboard → Your App → Settings
2. Check the "Redirect URIs" section
3. Make sure it's exactly: `http://127.0.0.1:3000/api/auth/callback/spotify`
4. No trailing slash, no localhost, exact port number

### Error: "Invalid client"

**Problem:** Client ID or Secret is wrong.

**Solution:**
1. Go back to Spotify Dashboard → Settings
2. Copy Client ID again (might have extra spaces)
3. Click "View client secret" and copy again
4. Paste directly in `.env` without quotes around the value
5. Make sure no extra spaces before/after

### Error: "NEXTAUTH_URL mismatch"

**Problem:** Accessing via localhost instead of 127.0.0.1

**Solution:**
- Always use `http://127.0.0.1:3000` in your browser
- Not `localhost:3000`
- Update bookmarks/links to use 127.0.0.1

### Still seeing "localhost" errors?

**Quick fix:**
```bash
# Update .env
NEXTAUTH_URL="http://127.0.0.1:3000"

# Restart server
pnpm dev

# Use this URL
http://127.0.0.1:3000
```

## Production Setup (Later)

When deploying to production:

1. **Add production redirect URI** in Spotify Dashboard:
   ```
   https://yourdomain.com/api/auth/callback/spotify
   ```

2. **Update .env.production:**
   ```env
   NEXTAUTH_URL="https://yourdomain.com"
   ```

3. **HTTPS is required** for production (Vercel/Railway provide this automatically)

## Visual Checklist

```
☐ Go to developer.spotify.com/dashboard
☐ Log in with Spotify account
☐ Click "Create app"
☐ Fill in app details
☐ Add redirect: http://127.0.0.1:3000/api/auth/callback/spotify
☐ Check "Web API"
☐ Click "Save"
☐ Click "Settings"
☐ Copy Client ID → .env
☐ Click "View client secret" → copy → .env
☐ Generate NEXTAUTH_SECRET → .env
☐ Restart dev server
☐ Test at http://127.0.0.1:3000
```

## Spotify Dashboard Reference

### Where to find what:

**Client ID & Secret:**
```
Dashboard → Your App → Settings → Basic Information
```

**Redirect URIs:**
```
Dashboard → Your App → Settings → Redirect URIs
```

**App Usage Stats:**
```
Dashboard → Your App → Analytics
```

## Security Best Practices

1. ✅ Never commit `.env` to git (it's in `.gitignore`)
2. ✅ Use different credentials for dev/production
3. ✅ Rotate secrets if accidentally exposed
4. ✅ Use environment variables in deployment platforms
5. ✅ Keep Client Secret truly secret

## Need Help?

- **Spotify Documentation:** https://developer.spotify.com/documentation/web-api
- **NextAuth Spotify Provider:** https://next-auth.js.org/providers/spotify
- **Check Browser Console:** Look for specific error messages
- **Check Server Logs:** Terminal where `pnpm dev` is running

---

**Quick Start Summary:**

1. Create app at https://developer.spotify.com/dashboard
2. Add redirect URI: `http://127.0.0.1:3000/api/auth/callback/spotify`
3. Copy Client ID & Secret to `.env`
4. Restart server
5. Visit `http://127.0.0.1:3000`
6. Click "Continue with Spotify"
7. Enjoy! 🎵
