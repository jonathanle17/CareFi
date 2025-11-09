# Authentication Architecture

## Overview

CareFi uses **Supabase Auth** with **server-side session management** via `@supabase/ssr`. This document explains how authentication, password storage, and session management work in the application.

---

## Table of Contents

1. [Password Storage Architecture](#password-storage-architecture)
2. [Signup Flow](#signup-flow)
3. [Sign-In Flow](#sign-in-flow)
4. [Session Management](#session-management)
5. [Server-Side Auth Gate](#server-side-auth-gate)
6. [Database Schema](#database-schema)
7. [Security Best Practices](#security-best-practices)
8. [Email Confirmation](#email-confirmation)
9. [Testing Guide](#testing-guide)
10. [Troubleshooting](#troubleshooting)

---

## Password Storage Architecture

### Two-Table Design

CareFi uses a **separation of concerns** approach with two tables:

```
┌─────────────────────────────────────────┐
│         auth.users (Supabase Auth)      │
│  Managed by Supabase - DO NOT ACCESS    │
├─────────────────────────────────────────┤
│  - id (UUID)                            │
│  - email                                │
│  - encrypted_password (bcrypt hash)     │ ← PASSWORD STORED HERE
│  - email_confirmed_at                   │
│  - created_at                           │
│  - last_sign_in_at                      │
│  - etc.                                 │
└─────────────────┬───────────────────────┘
                  │
                  │ Foreign Key (CASCADE DELETE)
                  │
                  ▼
┌─────────────────────────────────────────┐
│    public.user_profiles (Your Table)    │
│  Application-specific metadata          │
├─────────────────────────────────────────┤
│  - id → auth.users.id (PK, FK)          │
│  - email                                │
│  - display_name                         │
│  - onboarding_completed                 │ ← METADATA ONLY
│  - onboarding_completed_at              │
│  - created_at                           │
│  - updated_at                           │
│  ❌ NO PASSWORD FIELD                   │
└─────────────────────────────────────────┘
```

### Why Separate Tables?

1. **Security**:
   - Supabase Auth uses battle-tested bcrypt hashing
   - Automatic security patches and updates
   - Reduced attack surface (one source of truth)

2. **Compliance**:
   - Passwords never appear in application logs
   - No risk of accidentally exposing password hashes
   - Easier to audit (all auth in one place)

3. **Best Practice**:
   - Never duplicate password storage
   - Supabase Auth handles: hashing, salting, timing-attack prevention, password reset, etc.
   - `user_profiles` contains only non-sensitive metadata

### Important: No Password Column

⚠️ **The `user_profiles` table should NEVER have a `password` column.**

If you see a `password` column in your database, remove it:

```sql
ALTER TABLE public.user_profiles DROP COLUMN IF EXISTS password;
```

---

## Signup Flow

### Step-by-Step Process

```
User Submits Form
      ↓
┌─────────────────────────────────────────┐
│  1. Client: POST /api/signup            │
│     { email, password, displayName }    │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  2. Server: Validate Input (Zod)        │
│     - Email format                      │
│     - Password: ≥8 chars, 1 letter, 1#  │
│     - Display name: ≤80 chars           │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  3. Server: Create Auth User            │
│     admin.auth.admin.createUser({       │
│       email, password,                  │
│       email_confirm: true               │
│     })                                  │
│     → Supabase stores hash in auth.users│
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  4. Server: Create User Profile         │
│     INSERT INTO user_profiles {         │
│       id: authUser.id,                  │
│       email, display_name,              │
│       onboarding_completed: false       │
│     }                                   │
│     ❌ NO password field                │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  5. Server: Sign User In                │
│     supabase.auth.signInWithPassword({  │
│       email, password                   │
│     })                                  │
│     → Sets httpOnly session cookies     │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  6. Server: Return Response             │
│     200: { user, session }              │
│     202: { requiresEmailConfirmation }  │
│     409: Email already registered       │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  7. Client: Handle Response             │
│     200 → router.replace('/onboarding') │
│     202 → Show "Check email" message    │
│     409 → Show "Email taken" error      │
└─────────────────────────────────────────┘
```

### Code Reference

**File**: [`app/api/signup/route.ts`](../app/api/signup/route.ts)

```typescript
export const POST = createPostHandler(signupSchema, async (req, body) => {
  const { email, password, displayName } = body;

  console.log('🚀 [SIGNUP] Starting signup process for:', email);

  // Step 1: Create auth user + profile (admin client)
  const user = await createUser(body);
  console.log('✅ [SIGNUP] User created successfully');

  // Step 2: Sign in to establish session (SSR client)
  // NOTE: createServerClient() is async in Next.js 15+
  console.log('🔐 [SIGNUP] Attempting to sign in user...');
  const supabase = await createServerClient();
  const { data: signInData, error: signInError } =
    await supabase.auth.signInWithPassword({ email, password });

  if (signInError) {
    // Handle email confirmation requirement
    if (signInError.message?.includes('Email not confirmed')) {
      console.log('📧 [SIGNUP] Email confirmation required');
      return accepted({ requiresEmailConfirmation: true, message: '...' });
    }
    console.error('❌ [SIGNUP] Unexpected sign-in error:', signInError);
    throw new InternalServerError('...');
  }

  console.log('🎉 [SIGNUP] Sign-in successful! Session established.');
  console.log('🍪 [SIGNUP] Session cookies set by Supabase SSR client');

  // Step 3: Return user + session
  return ok({ user, session: signInData.session });
});
```

---

## Sign-In Flow

### How Users Authenticate

When users sign in (future `/api/login` or `/signin` page), they use their email and password:

```typescript
import { createServerClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const { email, password } = await req.json();

  // NOTE: createServerClient() is async in Next.js 15+
  const supabase = await createServerClient();

  // Supabase Auth verifies password against auth.users
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return fail(401, 'invalid_credentials', 'Invalid email or password');
  }

  // Session cookies are automatically set by @supabase/ssr
  return ok({ user: data.user, session: data.session });
}
```

### What Happens Behind the Scenes

1. **Client** sends email + password to server
2. **Server** calls `signInWithPassword()`
3. **Supabase Auth**:
   - Looks up user by email in `auth.users`
   - Compares password with stored bcrypt hash
   - Generates JWT access token + refresh token
4. **@supabase/ssr**:
   - Sets httpOnly cookies with tokens
   - Cookies are sent with all subsequent requests
5. **Server** returns user data + session

---

## Session Management

### Cookie-Based Sessions

CareFi uses **server-side cookie management** via `@supabase/ssr`:

```typescript
// lib/supabase/server.ts
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Create a Supabase SSR client with cookie-based session management
 * 
 * IMPORTANT: This function is async in Next.js 15+ because cookies() returns a Promise
 * Always use: const supabase = await createServerClient();
 */
export async function createServerClient() {
  // In Next.js 15+, cookies() returns a Promise and must be awaited
  const cookieStore = await cookies();

  return createSupabaseServerClient(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // Ignore if called from Server Component
            console.error('Error setting cookies:', error);
          }
        },
      },
    }
  );
}
```

### Cookie Properties

- **httpOnly**: Cannot be accessed via JavaScript (XSS protection)
- **secure**: Only sent over HTTPS in production
- **sameSite**: CSRF protection
- **Auto-refresh**: Supabase SDK refreshes tokens before expiry

### Session Lifecycle

1. **Sign In**: Cookies set with access token + refresh token
2. **Requests**: Browser automatically sends cookies
3. **Server**: Reads cookies via `createServerClient()`
4. **Verification**: `auth.getUser()` validates token
5. **Refresh**: SDK auto-refreshes before expiration
6. **Sign Out**: Cookies cleared

---

## Server-Side Auth Gate

### Protected Routes

Use server components to gate authenticated pages:

**File**: [`app/onboarding/page.tsx`](../app/onboarding/page.tsx)

```typescript
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

export default async function OnboardingPage() {
  console.log('🔍 [ONBOARDING] Checking authentication...');
  
  // NOTE: createServerClient() is async in Next.js 15+
  const supabase = await createServerClient();

  // Read session from cookies and verify user
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    console.log('❌ [ONBOARDING] Not authenticated, redirecting to login');
    // Not authenticated - redirect to login
    redirect("/login");
  }

  console.log('✅ [ONBOARDING] User authenticated successfully');
  
  // User is authenticated - render page
  return <OnboardingClient user={user} />;
}
```

### Why Server Components?

- **Security**: Auth check happens on server (can't be bypassed)
- **Performance**: No client-side loading states for auth
- **SEO**: Search engines see redirect immediately
- **UX**: Instant redirect (no flash of protected content)

---

## Database Schema

### User Profiles Table

```sql
CREATE TABLE public.user_profiles (
  id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  display_name TEXT NULL,
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  onboarding_completed_at TIMESTAMPTZ NULL,
  email TEXT NULL,

  -- Constraints
  CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT user_profiles_id_fkey
    FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE
);

-- Auto-update updated_at timestamp
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Row Level Security (RLS)

Enable RLS and create policies:

```sql
-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can insert their own profile (during signup)
CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Service role can do anything (for admin operations)
-- This is implicit - service role bypasses RLS
```

### Migration: Remove Password Column

If upgrading from old schema:

```sql
-- Remove password column (if exists)
ALTER TABLE public.user_profiles DROP COLUMN IF EXISTS password;

-- Verify no password column
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_profiles';
```

---

## Security Best Practices

### ✅ DO

- **Use SSR client** for auth operations (sets cookies)
- **Use admin client** only for privileged operations (bypass RLS)
- **Server components** for auth gates
- **Validate input** with Zod schemas
- **httpOnly cookies** for session storage
- **RLS policies** on all user-facing tables
- **Environment variables** for secrets

### ❌ DON'T

- ❌ Store passwords in `user_profiles` (even hashed)
- ❌ Send service role key to client
- ❌ Use client-side auth checks for security
- ❌ Store sessions in localStorage (XSS risk)
- ❌ Log passwords or tokens
- ❌ Bypass RLS unless absolutely necessary
- ❌ Expose `auth.users` table to client

### Password Requirements

- Minimum 8 characters
- At least 1 letter (a-z, A-Z)
- At least 1 number (0-9)
- No maximum length (Supabase handles this)

### Rate Limiting

Consider adding rate limiting to prevent brute-force attacks:

```typescript
// Future enhancement: rate-limit-middleware.ts
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: Request) {
  // Limit to 5 attempts per email per 15 minutes
  await rateLimit(req, { max: 5, window: 15 * 60 * 1000 });

  // ... rest of signup logic
}
```

---

## Email Confirmation

### Configuration

**Supabase Dashboard** → Authentication → Email Auth

Two modes:

#### 1. **Email Confirmation Disabled** (Default for Dev)

- User is auto-confirmed on signup
- `signInWithPassword()` succeeds immediately
- API returns **200** with session
- User redirected to `/onboarding`

#### 2. **Email Confirmation Enabled** (Production)

- User receives confirmation email
- `signInWithPassword()` fails until confirmed
- API returns **202** with `requiresEmailConfirmation: true`
- User sees "Check your email" message
- After confirming, user must go to `/login` to sign in

### Handling Email Confirmation in Code

**File**: [`app/api/signup/route.ts`](../app/api/signup/route.ts)

```typescript
const { data: signInData, error: signInError } =
  await supabase.auth.signInWithPassword({ email, password });

if (signInError) {
  // Check if error is due to unconfirmed email
  if (
    signInError.message?.includes('Email not confirmed') ||
    signInError.message?.includes('confirm your email')
  ) {
    // Return 202 Accepted
    return accepted({
      requiresEmailConfirmation: true,
      message: 'Account created! Please check your email to confirm your account before signing in.',
    });
  }

  // Other errors
  throw new InternalServerError('...');
}
```

**File**: [`app/signup/page.tsx`](../app/signup/page.tsx)

```typescript
if (response.status === 202) {
  // Email confirmation required
  if (data.data?.requiresEmailConfirmation) {
    setConfirmationMessage(data.data.message);
    // Do NOT redirect - user needs to confirm email first
    setIsSubmitting(false);
    return;
  }
}

// Status 200 - automatic sign-in successful
router.replace('/onboarding');
```

### Email Templates

Customize in **Supabase Dashboard** → Authentication → Email Templates:

- **Confirmation Email**: Sent when user signs up
- **Reset Password**: Sent when user requests password reset
- **Magic Link**: Sent for passwordless login (if enabled)

---

## Testing Guide

### Manual Testing Checklist

#### ✅ **Happy Path (Email Confirmation Disabled)**

1. Navigate to `/signup`
2. Enter valid email (e.g., `test@example.com`)
3. Enter valid password (e.g., `Test1234`)
4. Enter display name (e.g., `Test User`)
5. Click "Create account"
6. **Expected**:
   - Button shows "Creating account..."
   - Redirects to `/onboarding`
   - Subtitle shows: "Welcome test@example.com!"
   - Session cookies set (DevTools → Application → Cookies)
   - `sb-<project>-auth-token` cookie present

#### ✅ **Email Confirmation Enabled**

1. Enable email confirmation in Supabase Dashboard
2. Navigate to `/signup`
3. Create account with valid credentials
4. **Expected**:
   - Blue info banner appears
   - Message: "Account created! Please check your email..."
   - Form fields disabled
   - No redirect
   - Email sent to inbox
5. Click confirmation link in email
6. Navigate to `/login` (manually)
7. Sign in with credentials
8. **Expected**: Redirects to `/onboarding`

#### ✅ **Duplicate Email Error**

1. Create account with email `test@example.com`
2. Try to create another account with same email
3. **Expected**:
   - Red error banner
   - Message: "This email is already registered. Please sign in instead."
   - No redirect

#### ✅ **Validation Errors**

**Weak Password**:
- Password: `test` (< 8 chars)
- **Expected**: "Password must be at least 8 characters"

**No Number**:
- Password: `testtest`
- **Expected**: "Password must contain at least one number"

**No Letter**:
- Password: `12345678`
- **Expected**: "Password must contain at least one letter"

**Invalid Email**:
- Email: `notanemail`
- **Expected**: "Please enter a valid email address"

**Long Display Name**:
- Display name: 81+ characters
- **Expected**: "Display name must be 80 characters or less"

#### ✅ **Onboarding Auth Gate**

**Scenario 1: Not Authenticated**
1. Clear cookies (DevTools → Application → Cookies → Delete all)
2. Navigate to `/onboarding` directly
3. **Expected**: Redirects to `/login`

**Scenario 2: Authenticated**
1. Sign up or sign in
2. Navigate to `/onboarding`
3. **Expected**:
   - Onboarding form displays
   - Subtitle shows user email
   - No redirect

### Automated Testing (Future)

```typescript
// __tests__/auth/signup.test.ts
import { POST } from '@/app/api/signup/route';

describe('POST /api/signup', () => {
  it('creates user and returns session on success', async () => {
    const req = new Request('http://localhost:3000/api/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Test1234',
        displayName: 'Test User',
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.user.email).toBe('test@example.com');
    expect(data.data.session.access_token).toBeDefined();
  });

  it('returns 409 for duplicate email', async () => {
    // ... test implementation
  });

  it('returns 400 for invalid input', async () => {
    // ... test implementation
  });
});
```

---

## Troubleshooting

### Issue: "Missing required environment variables"

**Error**:
```
Error: Missing required environment variables: NEXT_PUBLIC_SUPABASE_ANON_KEY
```

**Solution**:
1. Create `.env.local` in project root:
   ```bash
   SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
2. Get keys from Supabase Dashboard → Settings → API
3. Restart dev server: `npm run dev`

---

### Issue: "User redirects to /login even after signup"

**Possible Causes**:
1. Cookies not being set
2. Wrong Supabase URL/keys
3. Browser blocking cookies
4. Not awaiting `createServerClient()` in Next.js 15+

**Solution**:
1. Check DevTools → Application → Cookies
2. Look for `sb-<project>-auth-token`
3. Verify `SUPABASE_URL` matches your project
4. Check browser isn't blocking third-party cookies
5. Verify `createServerClient()` is being awaited: `const supabase = await createServerClient();`
6. Check server logs for authentication status

---

### Issue: "Email not confirmed" error during signup

**Cause**: Email confirmation is enabled in Supabase

**Solution**:
1. **For Dev**: Disable email confirmation:
   - Supabase Dashboard → Authentication → Email Auth
   - Uncheck "Confirm email"
2. **For Production**: This is expected behavior
   - User should see 202 response with blue banner
   - User must check email and confirm
   - Then go to `/login` to sign in

---

### Issue: "Cannot read properties of null (reading 'email')"

**Cause**: Trying to access `user.email` when user is null

**Solution**:
1. Check that auth gate is working:
   ```typescript
   if (!user) {
     redirect("/login");
   }
   ```
2. Verify `createServerClient()` is being used
3. Check that cookies are being sent with request

---

### Issue: "Row Level Security policy violation"

**Error**:
```
new row violates row-level security policy for table "user_profiles"
```

**Cause**: RLS policy doesn't allow insert

**Solution**:
```sql
-- Create or update policy
CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);
```

---

### Issue: "Password column still exists in user_profiles"

**Cause**: Old schema has password column

**Solution**:
```sql
ALTER TABLE public.user_profiles DROP COLUMN IF EXISTS password;
```

---

## Debugging and Logging

### Comprehensive Logging

The application includes detailed logging throughout the authentication flow to help with debugging and monitoring.

#### Server-Side Logs (Terminal)

When a user signs up, you'll see the following logs in your terminal:

```
🚀 [SIGNUP] Starting signup process for: user@example.com
✅ [SIGNUP] User created successfully: {
  userId: "uuid-here",
  email: "user@example.com",
  displayName: "John Doe",
  onboardingCompleted: false
}
🔐 [SIGNUP] Attempting to sign in user to establish session...
🎉 [SIGNUP] Sign-in successful! Session established.
📝 [SIGNUP] Session details: {
  userId: "uuid-here",
  email: "user@example.com",
  access_token: "eyJhbGciOiJIUzI1Ni...",
  refresh_token: "v1.MR5tYxJh_wcBBL...",
  expires_at: 1234567890,
  expires_in: 3600,
  token_type: "bearer"
}
🍪 [SIGNUP] Session cookies should now be set by Supabase SSR client
✨ [SIGNUP] Signup complete! Returning response with session data.
```

When the user is redirected to onboarding:

```
🔍 [ONBOARDING] Checking authentication...
✅ [ONBOARDING] User authenticated successfully: {
  userId: "uuid-here",
  email: "user@example.com",
  emailConfirmed: "2025-11-09T..."
}
```

#### Client-Side Logs (Browser Console)

In the browser console (F12), you'll see:

```
📤 [CLIENT] Sending signup request for: user@example.com
📥 [CLIENT] Received response: {
  status: 200,
  ok: true,
  data: { user: {...}, session: {...} }
}
✅ [CLIENT] Signup successful! Session cookies set.
🍪 [CLIENT] Session data received: {
  userId: "uuid-here",
  email: "user@example.com",
  displayName: "John Doe",
  hasAccessToken: true,
  hasRefreshToken: true,
  expiresAt: 1234567890
}
🚀 [CLIENT] Redirecting to /onboarding...
```

#### Log Prefixes

- 🚀 **Process Start**: Beginning of a major operation
- ✅ **Success**: Operation completed successfully
- ❌ **Error**: Operation failed
- 🔐 **Authentication**: Auth-related operations
- 🍪 **Cookies**: Cookie operations
- 📝 **Details**: Detailed information
- 📤 **Request**: Outgoing request
- 📥 **Response**: Incoming response
- 📧 **Email**: Email-related operations
- 🔍 **Check**: Verification/checking operations

### Inspecting Session Cookies

To verify session cookies are set correctly:

1. **Open DevTools**: F12 or Right-click → Inspect
2. **Navigate to Application tab** (Chrome) or Storage tab (Firefox)
3. **Click Cookies** → `http://localhost:3000`
4. **Look for**: `sb-<project-id>-auth-token`

The cookie should contain:
- **Name**: `sb-xxxxxxxx-auth-token`
- **Value**: Base64-encoded session data
- **HttpOnly**: ✓ (for security)
- **Secure**: ✓ in production
- **SameSite**: Lax or Strict

### Common Log Patterns

#### Successful Signup Flow
```
[CLIENT] 📤 Sending signup request
[SERVER] 🚀 Starting signup process
[SERVER] ✅ User created successfully
[SERVER] 🔐 Attempting to sign in user
[SERVER] 🎉 Sign-in successful
[SERVER] 🍪 Session cookies set
[CLIENT] 📥 Received response (200)
[CLIENT] ✅ Signup successful
[CLIENT] 🚀 Redirecting to /onboarding
[SERVER] 🔍 Checking authentication
[SERVER] ✅ User authenticated successfully
```

#### Email Confirmation Required
```
[CLIENT] 📤 Sending signup request
[SERVER] 🚀 Starting signup process
[SERVER] ✅ User created successfully
[SERVER] 🔐 Attempting to sign in user
[SERVER] 📧 Email confirmation required
[CLIENT] 📥 Received response (202)
[CLIENT] 📧 Email confirmation required
```

#### Authentication Failure
```
[SERVER] 🔍 Checking authentication
[SERVER] ❌ Not authenticated, redirecting to login
```

### Next.js 15+ Compatibility

**IMPORTANT**: In Next.js 15 and later, `cookies()` returns a Promise and must be awaited.

#### Migration from Next.js 14 to 15

**Old (Next.js 14)**:
```typescript
export function createServerClient() {
  const cookieStore = cookies(); // Synchronous
  // ...
}

// Usage
const supabase = createServerClient(); // Synchronous
```

**New (Next.js 15+)**:
```typescript
export async function createServerClient() {
  const cookieStore = await cookies(); // Async - must await
  // ...
}

// Usage
const supabase = await createServerClient(); // Must await
```

#### Error If Not Awaited

If you forget to await, you'll see:

```
Error: Route "/api/signup" used `cookies().getAll`. 
`cookies()` returns a Promise and must be unwrapped with `await`

TypeError: cookieStore.getAll is not a function
```

**Solution**: Always await both `cookies()` and `createServerClient()`:

```typescript
// ✅ CORRECT
const cookieStore = await cookies();
const supabase = await createServerClient();

// ❌ WRONG
const cookieStore = cookies();
const supabase = createServerClient();
```

---

## Summary

### Key Takeaways

1. **Passwords are stored in `auth.users`** (managed by Supabase Auth)
2. **`user_profiles` stores metadata only** (no passwords)
3. **Session management via cookies** (`@supabase/ssr`)
4. **Server components for auth gates** (secure, performant)
5. **Auto sign-in after signup** (unless email confirmation required)
6. **RLS policies protect data** (users can only access own data)

### File Reference

| File | Purpose |
|------|---------|
| [`lib/supabase/server.ts`](../lib/supabase/server.ts) | SSR client with cookie management |
| [`app/api/signup/route.ts`](../app/api/signup/route.ts) | Signup endpoint (create user + sign in) |
| [`app/signup/page.tsx`](../app/signup/page.tsx) | Signup form UI (client component) |
| [`app/onboarding/page.tsx`](../app/onboarding/page.tsx) | Auth gate (server component) |
| [`app/onboarding/OnboardingClient.tsx`](../app/onboarding/OnboardingClient.tsx) | Onboarding form (client component) |
| [`lib/users/service.ts`](../lib/users/service.ts) | User creation logic (no password storage) |
| [`lib/validation/auth.ts`](../lib/validation/auth.ts) | Zod schemas for validation |

### Issue: "cookieStore.getAll is not a function"

**Error**:
```
TypeError: cookieStore.getAll is not a function
    at Object.getAll (lib/supabase/server.ts:68:30)
```

**Cause**: Next.js 15+ requires awaiting `cookies()`, but the code is using it synchronously.

**Solution**:
Update `lib/supabase/server.ts`:

```typescript
// ❌ WRONG (Next.js 14 style)
export function createServerClient() {
  const cookieStore = cookies();
  // ...
}

// ✅ CORRECT (Next.js 15+ style)
export async function createServerClient() {
  const cookieStore = await cookies();
  // ...
}
```

Then update all usages to await:
```typescript
const supabase = await createServerClient();
```

---

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase SSR Guide](https://supabase.com/docs/guides/auth/server-side)
- [Next.js App Router Authentication](https://nextjs.org/docs/app/building-your-application/authentication)
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)

---

## Changelog

### Version 1.1.0 (2025-11-09)
- ✨ Added comprehensive logging throughout signup and auth flow
- 🔧 Updated for Next.js 15+ async `cookies()` API
- 📝 Added debugging section with log examples
- 🐛 Fixed `createServerClient()` to be async
- 📚 Added troubleshooting for Next.js 15 migration

### Version 1.0.0 (2025-11-08)
- 🎉 Initial authentication architecture documentation
- 📖 Documented password storage with Supabase Auth
- 🔐 Explained session management with cookies
- ✅ Added testing guide and troubleshooting

---

**Last Updated**: 2025-11-09
**Version**: 1.1.0
**Author**: CareFi Engineering Team
