# Installation & Setup Guide

Quick setup guide for the CareFi API foundation.

## Prerequisites

- Node.js 18+ installed
- Supabase account and project
- Package manager (npm, yarn, or pnpm)

## Step 1: Install Dependencies

Install the required packages:

```bash
npm install @supabase/supabase-js bcryptjs zod
npm install -D @types/bcryptjs
```

### Optional Dependencies

For enhanced logging (recommended for production):

```bash
npm install pino pino-pretty
npm install -D @types/pino
```

## Step 2: Configure Environment Variables

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Fill in your Supabase credentials in `.env`:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Where to find these:**
- Go to [Supabase Dashboard](https://app.supabase.com)
- Select your project
- Go to Settings > API
- Copy the "Project URL" and "service_role" key

**SECURITY WARNING:** Never commit `.env` to version control! The service role key bypasses all Row Level Security.

## Step 3: Set Up Database

Run this SQL in your Supabase SQL Editor:

```sql
-- Create user_profiles table
CREATE TABLE public.user_profiles (
  id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  display_name text NULL,
  onboarding_completed boolean NOT NULL DEFAULT false,
  onboarding_completed_at timestamp with time zone NULL,
  email text NULL,
  password text NULL,
  CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT user_profiles_id_fkey FOREIGN KEY (id)
    REFERENCES auth.users (id) ON DELETE CASCADE
);

-- Create updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Create RLS policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id);
```

## Step 4: Verify Installation

1. Start the development server:

```bash
npm run dev
```

2. Test the signup endpoint:

```bash
curl -X POST http://localhost:3000/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123",
    "displayName": "Test User"
  }'
```

Expected response:

```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "email": "test@example.com",
    "displayName": "Test User",
    "onboardingCompleted": false
  }
}
```

3. Verify in Supabase:

- Check `auth.users` table - should see the new user
- Check `user_profiles` table - should see the profile with hashed password

## Step 5: (Optional) Set Up Testing

Install VSCode REST Client extension for interactive API testing:

1. Install extension: `humao.rest-client`
2. Open `examples/rest/signup.http`
3. Click "Send Request" above any example

## Troubleshooting

### Error: "Missing required environment variables"

**Solution:** Make sure `.env` file exists and contains `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

### Error: "Failed to create auth user"

**Possible causes:**
- Invalid Supabase credentials
- Network connectivity issues
- Supabase project is paused

**Solution:** Verify credentials and check Supabase dashboard.

### Error: "Failed to create user profile"

**Possible causes:**
- `user_profiles` table doesn't exist
- Foreign key constraint issue
- RLS policy blocking insert

**Solution:**
- Run the database setup SQL
- The API uses service role key which bypasses RLS
- Check Supabase logs for details

### Error: "Cannot find module 'bcryptjs'"

**Solution:** Run `npm install bcryptjs @types/bcryptjs`

### Error: "Cannot find module 'zod'"

**Solution:** Run `npm install zod`

## File Structure

After installation, you should have:

```
carefi/
├── app/
│   └── api/
│       └── signup/
│           └── route.ts
├── lib/
│   ├── env.ts
│   ├── http/
│   │   ├── errors.ts
│   │   ├── handler.ts
│   │   └── response.ts
│   ├── security/
│   │   └── passwords.ts
│   ├── supabase/
│   │   └── server.ts
│   ├── users/
│   │   └── service.ts
│   └── validation/
│       └── auth.ts
├── docs/
│   ├── API_FOUNDATION.md
│   ├── INSTALLATION.md
│   └── SIGNUP_ENDPOINT.md
├── examples/
│   └── rest/
│       └── signup.http
├── .env (not in git)
├── .env.example
└── openapi.yaml
```

## Next Steps

1. Read [API_FOUNDATION.md](./API_FOUNDATION.md) for architecture overview
2. Read [SIGNUP_ENDPOINT.md](./SIGNUP_ENDPOINT.md) for detailed signup flow
3. Try the examples in `examples/rest/signup.http`
4. Build your next endpoint using the same patterns (e.g., `/api/login`)

## Security Checklist

Before deploying to production:

- [ ] `.env` is in `.gitignore`
- [ ] Service role key is never exposed to client
- [ ] HTTPS is enabled (Next.js handles this in production)
- [ ] RLS policies are enabled on all tables
- [ ] Rate limiting is implemented (not included yet)
- [ ] CORS is configured appropriately
- [ ] Logging doesn't include sensitive data
- [ ] Error messages don't leak system details

## Support

For questions or issues:
- Check [API_FOUNDATION.md](./API_FOUNDATION.md)
- Check [SIGNUP_ENDPOINT.md](./SIGNUP_ENDPOINT.md)
- Review the OpenAPI spec: `openapi.yaml`
