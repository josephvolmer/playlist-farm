# Spotify-Only Authentication

The platform now uses **Spotify OAuth as the sole authentication method**. This provides a much better experience for a music-focused platform.

## Why Spotify-Only Auth?

### Benefits
1. **One-Click Login** - Users sign in with their existing Spotify account
2. **No Signup Form** - Accounts auto-created on first login
3. **Native Integration** - Direct access to user's Spotify data
4. **Better UX** - No remembering passwords, no email verification
5. **Rich Features** - Can access user's playlists, saved tracks, and more

### What Changed

#### Before (Multi-Auth):
- Email/password registration
- Google OAuth
- Separate Spotify API for track data
- Manual signup forms

#### After (Spotify-Only):
- **Single button**: "Continue with Spotify"
- Auto-creates account on first login
- Stores Spotify access token for API calls
- Cleaner, simpler experience

## Technical Implementation

### Authentication Flow

1. User clicks "Continue with Spotify"
2. Redirects to Spotify OAuth consent screen
3. User approves permissions
4. Callback to `/api/auth/callback/spotify`
5. System checks if user exists by email
6. If new user → auto-create account with 10 free tokens
7. If existing → sign in
8. Store Spotify access token in session
9. Redirect to dashboard

### Spotify Scopes Requested

```typescript
const SPOTIFY_SCOPES = [
  "user-read-email",              // Get user's email
  "user-read-private",            // Get user profile info
  "playlist-read-private",        // Read user's private playlists
  "playlist-read-collaborative",  // Read collaborative playlists
  "user-library-read",            // Access saved tracks
  "user-top-read",                // Get top artists/tracks
]
```

### Access Token Storage

The Spotify access token is stored in the user's session:

```typescript
session.user.accessToken // Available in all server components
```

This allows you to make authenticated Spotify API calls without separate credentials.

## Setup Instructions

### 1. Update Spotify App Settings

In your [Spotify Developer Dashboard](https://developer.spotify.com/dashboard):

1. Click on your app
2. Go to "Settings"
3. Add Redirect URI:
   ```
   http://localhost:3000/api/auth/callback/spotify
   ```

4. For production, also add:
   ```
   https://yourdomain.com/api/auth/callback/spotify
   ```

### 2. Environment Variables

Only need these Spotify vars (no Google OAuth needed):

```env
SPOTIFY_CLIENT_ID="your-spotify-client-id"
SPOTIFY_CLIENT_SECRET="your-spotify-client-secret"
```

### 3. Test the Flow

1. Visit http://localhost:3000
2. Click "Get Started" or "Sign In"
3. Click "Continue with Spotify"
4. Approve permissions
5. Auto-redirected to dashboard
6. Check database - user was auto-created!

## Using Spotify Access Token

### In Server Components

```typescript
import { auth } from "@/auth"

export default async function Page() {
  const session = await auth()
  const accessToken = session?.user.accessToken

  // Make Spotify API calls
  const response = await fetch("https://api.spotify.com/v1/me/playlists", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  const playlists = await response.json()
  // ...
}
```

### In API Routes

```typescript
import { auth } from "@/auth"

export async function GET(req: Request) {
  const session = await auth()

  if (!session?.user.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Use session.user.accessToken for Spotify API calls
}
```

## Future Features Enabled

With Spotify OAuth, you can now build:

### 1. Browse User's Library
```typescript
// Get user's saved tracks
GET /me/tracks

// Get user's playlists
GET /me/playlists
```

### 2. Track Picker from Library
Instead of pasting URLs, let users browse and select from their Spotify library.

### 3. Playlist Submission for Curators
Curators can link their actual Spotify playlists directly.

### 4. Recently Played
```typescript
// Get recently played tracks
GET /me/player/recently-played
```

### 5. Top Artists/Tracks
```typescript
// Get user's top artists
GET /me/top/artists

// Get user's top tracks
GET /me/top/tracks
```

## Token Refresh

The Spotify access token expires after 1 hour. Currently, the implementation stores the initial token. For production, you should implement token refresh:

```typescript
// In auth.ts jwt callback
async jwt({ token, account }) {
  // Check if token expired
  if (Date.now() < token.accessTokenExpires) {
    return token
  }

  // Refresh the access token
  return refreshAccessToken(token)
}
```

See NextAuth.js docs for full refresh token implementation.

## Database Changes

No schema changes needed! The existing User model works perfectly:

- Email from Spotify → `user.email`
- Display name → `user.name`
- Profile image → `user.image`
- Access token → Stored in JWT session (not DB)

## Removed Components

The following are no longer needed:

- ❌ Email/password registration form
- ❌ Email/password login form
- ❌ Google OAuth provider
- ❌ `/api/auth/register` endpoint
- ❌ Password hashing (bcryptjs)
- ❌ Signup/signin tabs

## Migration Notes

If you had existing users with email/password:

1. They won't be able to login anymore
2. Option 1: Keep both auth methods (add Spotify alongside)
3. Option 2: Force migration (email users asking them to link Spotify)
4. Option 3: Start fresh (this is a new platform)

For this project, we went with Option 3 - Spotify-only from the start.

## Testing Checklist

- [ ] Can sign in with Spotify
- [ ] New user is auto-created
- [ ] User receives 10 free tokens
- [ ] Session contains accessToken
- [ ] Can make Spotify API calls
- [ ] Signout works
- [ ] Can sign back in

## Production Considerations

1. **Token Refresh** - Implement refresh token logic
2. **Error Handling** - Handle Spotify OAuth errors gracefully
3. **Scope Management** - Request minimal scopes needed
4. **Rate Limiting** - Respect Spotify API rate limits
5. **Privacy** - Clear about what data you're accessing

## Documentation

For more Spotify API capabilities:
- [Spotify Web API Reference](https://developer.spotify.com/documentation/web-api)
- [Authorization Guide](https://developer.spotify.com/documentation/web-api/concepts/authorization)
- [NextAuth Spotify Provider](https://next-auth.js.org/providers/spotify)

---

**Status**: ✅ Fully implemented and ready to use!
