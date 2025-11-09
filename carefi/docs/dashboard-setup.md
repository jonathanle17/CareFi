# CareFi Dashboard Setup Guide

This guide walks you through setting up and running the CareFi SkinSight dashboard locally and deploying to production.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Running Locally](#running-locally)
- [Testing](#testing)
- [Deployment](#deployment)
- [Architecture Overview](#architecture-overview)
- [Replacing Mock APIs](#replacing-mock-apis)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js** 20.x or higher
- **pnpm** 8.x or higher (or npm/yarn)
- **Supabase account** with a project created
- **Git** for version control

---

## Installation

1. **Clone the repository** (if not already done):

   ```bash
   git clone https://github.com/your-org/carefi.git
   cd carefi
   ```

2. **Install dependencies**:

   ```bash
   pnpm install
   ```

   This will install all required packages including:
   - Next.js 16
   - React 19
   - Tailwind CSS 4
   - @tanstack/react-query (for data fetching)
   - recharts (for charts)
   - Supabase client libraries
   - Vitest & Playwright (for testing)

---

## Environment Setup

1. **Copy the example environment file**:

   ```bash
   cp .env.example .env.local
   ```

2. **Get your Supabase credentials**:

   - Go to [https://app.supabase.com](https://app.supabase.com)
   - Select your project
   - Navigate to **Settings → API**

3. **Fill in the `.env.local` file**:

   ```bash
   # Supabase Project URL
   SUPABASE_URL=https://your-project-id.supabase.co

   # Supabase Anon/Public Key (safe for client-side)
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

   # Supabase Service Role Key (KEEP SECRET - server-only)
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

   # Environment
   NODE_ENV=development
   ```

   **Security Note**:
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` is safe to expose (public)
   - `SUPABASE_SERVICE_ROLE_KEY` must NEVER be exposed to the client
   - Add `.env.local` to `.gitignore` (already configured)

---

## Database Setup

1. **Run the database migration**:

   The database schema is defined in `supabase/schema.sql`. Apply it to your Supabase project:

   - **Option A: Supabase Dashboard**
     - Go to **SQL Editor** in your Supabase dashboard
     - Copy the contents of `supabase/schema.sql`
     - Run the SQL script

   - **Option B: Supabase CLI** (recommended)
     ```bash
     # Install Supabase CLI
     npm install -g supabase

     # Link to your project
     supabase link --project-ref your-project-id

     # Push schema
     supabase db push
     ```

2. **Verify tables were created**:

   Check that these tables exist in your Supabase database:
   - `public.user_profiles`
   - `public.onboarding_data`
   - `public.skin_analyses`
   - `public.uploaded_images`
   - `public.products`
   - `public.personalized_routines`
   - `public.budget_optimizations`
   - `public.orders`

3. **Verify RLS (Row Level Security) is enabled**:

   All tables should have RLS enabled with policies that restrict users to their own data.

---

## Running Locally

1. **Start the development server**:

   ```bash
   pnpm dev
   ```

   The app will be available at [http://localhost:3000](http://localhost:3000)

2. **Create a test user**:

   - Navigate to [http://localhost:3000/signup](http://localhost:3000/signup)
   - Sign up with an email/password
   - Complete the onboarding flow at `/onboarding`

3. **Access the dashboard**:

   - After onboarding, you'll be redirected to `/dashboard`
   - The dashboard will display with mock analysis data

---

## Testing

### Unit Tests (Vitest)

Run the format utility tests:

```bash
pnpm test
```

Run in watch mode:

```bash
pnpm test:watch
```

### E2E Tests (Playwright)

1. **Install Playwright browsers** (first time only):

   ```bash
   npx playwright install
   ```

2. **Run E2E tests**:

   ```bash
   pnpm test:e2e
   ```

3. **Run with UI mode** (recommended for development):

   ```bash
   pnpm test:e2e:ui
   ```

**Note**: Some tests are skipped (`test.skip`) because they require authentication setup. Update `tests/e2e/dashboard.spec.ts` with your test user credentials.

---

## Deployment

### Deploy to Vercel (Recommended)

1. **Install Vercel CLI** (optional):

   ```bash
   npm install -g vercel
   ```

2. **Deploy from GitHub**:

   - Push your code to GitHub
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure environment variables in Vercel**:

   - In Vercel dashboard → Project → Settings → Environment Variables
   - Add all variables from `.env.local`:
     - `SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`

4. **Deploy**:

   ```bash
   # Via CLI
   vercel --prod

   # Or push to main branch (if GitHub integration is set up)
   git push origin main
   ```

### Alternative: Deploy to Netlify

1. **Create `netlify.toml`**:

   ```toml
   [build]
     command = "pnpm build"
     publish = ".next"

   [[plugins]]
     package = "@netlify/plugin-nextjs"
   ```

2. **Deploy via Netlify CLI or GitHub integration**

---

## Architecture Overview

### Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui + custom components
- **State Management**: React Query (@tanstack/react-query)
- **Charts**: Recharts
- **Database**: Supabase (PostgreSQL with RLS)
- **Authentication**: Supabase Auth (email/password)
- **Testing**: Vitest (unit), Playwright (E2E)

### Page Structure

```
app/
├── (dashboard)/
│   └── dashboard/
│       ├── page.tsx         # Server Component (auth guard, data fetch)
│       └── DashboardClient.tsx  # Client Component (React Query provider)
├── api/
│   ├── analysis/latest/route.ts  # GET - Returns AnalysisSummary
│   └── recommendations/route.ts  # GET - Returns Recommendation[]
├── signup/page.tsx          # User registration
├── signin/page.tsx          # User login
└── onboarding/page.tsx      # 5-step questionnaire
```

### Component Structure

```
components/
├── ui/                      # Reusable primitives
│   ├── card.tsx
│   ├── badge.tsx
│   ├── button.tsx
│   ├── skeleton.tsx
│   ├── empty-state.tsx
│   ├── kpi-stat.tsx
│   ├── data-table.tsx
│   ├── chart-card.tsx
│   └── budget-slider.tsx
└── dashboard/               # Dashboard-specific sections
    ├── Header.tsx
    ├── KPIRow.tsx
    ├── AnalysisOverview.tsx
    ├── RoutinePlanner.tsx
    ├── BudgetOptimizer.tsx
    ├── RecommendationsTable.tsx
    ├── InsightsFeed.tsx
    └── AllergyList.tsx
```

### Data Flow

1. **Server-side (RSC)**:
   - `app/(dashboard)/dashboard/page.tsx` checks auth
   - Fetches `onboarding_data` from Supabase
   - Passes data to client component

2. **Client-side (React Query)**:
   - `AnalysisOverview` fetches `/api/analysis/latest`
   - `RecommendationsTable` fetches `/api/recommendations?concerns=...&min=...&max=...`
   - `InsightsFeed` fetches `/api/analysis/latest` for notes

3. **Shared State (Context)**:
   - `BudgetContext` syncs slider and recommendations table

---

## Replacing Mock APIs

Currently, the analysis and recommendations APIs return **mock data**. To integrate with a real AI analysis service:

### Step 1: Replace `/api/analysis/latest`

Edit `app/api/analysis/latest/route.ts`:

```typescript
// BEFORE (mock):
const mockAnalysis: AnalysisSummary = { ... };
return NextResponse.json(mockAnalysis);

// AFTER (real):
const { data: analysis, error } = await supabase
  .from('skin_analyses')
  .select('*')
  .eq('user_id', user.id)
  .eq('status', 'complete')
  .order('completed_at', { ascending: false })
  .limit(1)
  .single();

if (error || !analysis) {
  return NextResponse.json({ error: 'No analysis found' }, { status: 404 });
}

// Transform DB row to AnalysisSummary format
const summary: AnalysisSummary = {
  user_id: analysis.user_id,
  skin_type: analysis.detected_traits.skin_type,
  confidence: analysis.confidence_score / 100,
  // ... map other fields
};

return NextResponse.json(summary);
```

### Step 2: Replace `/api/recommendations`

Edit `app/api/recommendations/route.ts`:

```typescript
// BEFORE (mock):
const mockProducts: Recommendation[] = [ ... ];

// AFTER (real):
const { data: products, error } = await supabase
  .from('products')
  .select('*')
  .gte('price_usd', minPrice)
  .lte('price_usd', maxPrice)
  .eq('is_active', true);

if (error) {
  return NextResponse.json({ error: error.message }, { status: 500 });
}

// Transform products to Recommendation[] format
const recommendations: Recommendation[] = products.map(p => ({
  id: p.id,
  name: p.name,
  concern_tags: p.concern_tags,  // Ensure this column exists in products table
  key_ingredients: p.active_ingredients,
  price_usd: p.price_usd,
  retail_usd: p.retail_price_usd,  // Add this column to products table
  vendor: p.merchants[0],  // Take first merchant
  url: p.product_link,
}));

return NextResponse.json(recommendations);
```

### Step 3: Populate the Products Table

Seed `public.products` with real skincare product data:

```sql
INSERT INTO public.products (
  name, brand, product_type, price_usd, retail_price_usd,
  merchants, active_ingredients, concern_tags, product_link
) VALUES
  (
    'CeraVe Foaming Facial Cleanser',
    'CeraVe',
    'Cleanser',
    14.99,
    19.99,
    ARRAY['Amazon', 'Sephora'],
    ARRAY['Ceramides', 'Niacinamide', 'Hyaluronic Acid'],
    ARRAY['acne', 'oily'],
    'https://amazon.com/dp/...'
  ),
  -- Add more products...
```

### Step 4: Integrate AI Analysis Service

When users upload photos (`/upload`), trigger an analysis:

```typescript
// Example: app/api/analyze/route.ts
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const images = formData.getAll('images');

  // Upload to Supabase Storage
  // ... upload logic ...

  // Call your AI service
  const analysisResult = await fetch('https://your-ai-service.com/analyze', {
    method: 'POST',
    body: JSON.stringify({ imageUrls: [...] }),
  });

  const aiData = await analysisResult.json();

  // Save to skin_analyses table
  const { data, error } = await supabase
    .from('skin_analyses')
    .insert({
      user_id: user.id,
      status: 'complete',
      detected_traits: aiData.traits,
      confidence_score: aiData.confidence * 100,
      // ... other fields
    });

  return NextResponse.json(data);
}
```

---

## Troubleshooting

### Issue: "Unauthorized" error on dashboard

**Cause**: User is not authenticated

**Solution**:
- Ensure you've signed up and completed onboarding
- Check browser cookies (session cookie should be present)
- Verify Supabase auth is configured correctly

### Issue: Dashboard shows "Unable to load analysis"

**Cause**: API route is failing

**Solution**:
- Check browser console for errors
- Check server logs (`pnpm dev` output)
- Verify `/api/analysis/latest` returns 200 OK
- Test API directly: `curl http://localhost:3000/api/analysis/latest -H "Cookie: ..."`

### Issue: Recommendations table is empty

**Possible causes**:
- Budget range is too narrow → Adjust slider
- All products filtered out by concerns → Toggle concern chips
- Ingredients to avoid are too broad → Update onboarding

### Issue: TypeScript errors in components

**Solution**:
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Restart dev server
pnpm dev
```

### Issue: Charts not rendering

**Cause**: Recharts issue with SSR

**Solution**:
- Verify `AnalysisOverview` has `'use client'` directive
- Check that data is in correct format for Recharts
- Inspect browser console for Recharts errors

### Issue: Tests failing

**Unit tests**:
```bash
# Run with verbose output
pnpm test -- --reporter=verbose
```

**E2E tests**:
```bash
# Run with debug mode
pnpm test:e2e --debug
```

---

## Additional Resources

- **Next.js Docs**: [https://nextjs.org/docs](https://nextjs.org/docs)
- **Supabase Docs**: [https://supabase.com/docs](https://supabase.com/docs)
- **React Query Docs**: [https://tanstack.com/query/latest](https://tanstack.com/query/latest)
- **Recharts Docs**: [https://recharts.org](https://recharts.org)
- **shadcn/ui**: [https://ui.shadcn.com](https://ui.shadcn.com)
- **Playwright Docs**: [https://playwright.dev](https://playwright.dev)

---

## Support

For questions or issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review the codebase documentation (inline comments)
3. Open an issue on GitHub
4. Contact the development team

---

**Last Updated**: November 2025
**Version**: 1.0.0 (MVP)
