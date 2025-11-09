# CareFi Implementation Summary

This document provides a high-level overview of major features and integrations in the CareFi application.

## Table of Contents

- [Authentication](#authentication)
- [Storage & Image Upload](#storage--image-upload)
- [OpenAI Vision Integration](#openai-vision-integration)
- [Dashboard & Analytics](#dashboard--analytics)

---

## Authentication

**Location**: [AUTH_ARCHITECTURE.md](./AUTH_ARCHITECTURE.md)

CareFi uses Supabase Auth for user authentication with the following features:

- Email/password authentication
- Row Level Security (RLS) for data isolation
- Server-side session management via cookies
- Middleware-based route protection
- User profiles extending auth.users

**Key Files**:
- `app/api/signup/route.ts` - User registration
- `app/api/signin/route.ts` - User login
- `middleware.ts` - Session refresh and route protection
- `lib/supabase/server.ts` - Server client with RLS

---

## Storage & Image Upload

**Location**: [STORAGE_SETUP.md](./STORAGE_SETUP.md)

User facial images are stored in Supabase Storage with metadata tracking in PostgreSQL.

**Features**:
- Private bucket with RLS policies
- Support for JPEG, PNG, WebP (max 10MB)
- Three required angles: front, left_45, right_45
- Soft delete with `deleted_at` timestamp
- Automatic path generation: `{userId}/{angle}_{filename}`

**Key Files**:
- `lib/storage/service.ts` - Upload/delete operations
- `lib/storage/images.ts` - Database queries for uploaded_images
- `lib/storage/buckets.ts` - Constants and path generators
- `app/api/uploadImage/route.ts` - Image upload endpoint

---

## OpenAI Vision Integration

**Location**: [OPENAI_VISION.md](./OPENAI_VISION.md)

Automated skin analysis using OpenAI's GPT-4o-mini Vision API.

### Overview

The integration analyzes three facial images simultaneously to detect skin traits and provide personalized insights.

**Analyzed Traits**:
- Acne, Dryness, Oiliness, Sensitivity
- Hyperpigmentation, Fine Lines, Redness, Large Pores

**Severity Levels**: low | moderate | high

### Architecture

```
User uploads 3 images → Stored in Supabase Storage
       ↓
User visits /analyze → Auto-triggers analysis
       ↓
POST /api/analysis/start → Creates DB record
       ↓
Service generates signed URLs (6min expiry)
       ↓
Calls OpenAI Vision with 3 images
       ↓
Validates JSON response (Zod schema)
       ↓
Saves traits to skin_analyses table
       ↓
Dashboard fetches via GET /api/analysis/latest
```

### Key Features

1. **Strict Schema Validation**: Zod schemas ensure type-safe responses
2. **Retry Logic**: Exponential backoff for rate limits and server errors
3. **Rate Limiting**: 3 analyses per hour per user (token bucket algorithm)
4. **Security**: Signed URLs, no PII sent to OpenAI, RLS enforcement
5. **Observable**: Status lifecycle tracking (uploading → screening → detecting → generating → complete)

### Files Added

**Core Integration**:
- `lib/ai/openai.ts` - OpenAI client, Zod schemas, `callVision()` with retry
- `lib/storage/imageUtils.ts` - Signed URL generation for 3 angles
- `lib/analysis/service.ts` - Orchestration: fetch images → call AI → save results

**API Routes**:
- `app/api/analysis/start/route.ts` - POST endpoint to trigger analysis
- `app/api/analysis/latest/route.ts` - GET endpoint for dashboard (replaced mock data)

**Client Integration**:
- `hooks/useAnalysis.ts` - React hook calling real API instead of mock timeouts

**Documentation**:
- `docs/OPENAI_VISION.md` - Full integration guide
- `docs/IMPLEMENTATION_SUMMARY.md` - This file

**Testing** (to be implemented):
- `tests/fixtures/vision.json` - Mock OpenAI response for CI
- `lib/ai/openai.spec.ts` - Unit tests for schema validation
- `lib/analysis/service.spec.ts` - Unit tests for mapping functions
- `tests/e2e/analysis.spec.ts` - E2E test with mocked OpenAI

### Environment Variables

```bash
# Required for production
OPENAI_API_KEY=sk-...

# Optional (defaults to gpt-4o-mini)
OPENAI_VISION_MODEL=gpt-4o-mini
```

### Database Schema

Uses existing `skin_analyses` table:

```sql
CREATE TABLE public.skin_analyses (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending',
  detected_traits JSONB NOT NULL DEFAULT '[]',
  confidence_score DECIMAL(5,2),
  image_ids UUID[] NOT NULL DEFAULT '{}',
  error_message TEXT
);
```

**No schema changes required**.

### JSON Response Schema

```typescript
interface VisionAnalysis {
  skinType: "Dry" | "Oily" | "Combination" | "Normal" | "Sensitive";
  confidence: number; // 0-100
  primaryConcern: string;
  traits: Array<{
    id: string;           // e.g., "acne", "dryness"
    name: string;         // e.g., "Acne", "Dryness"
    severity: "low" | "moderate" | "high";
    description: string;  // User-friendly explanation
  }>;
  notes: string[];        // Observations and recommendations
  modelVersion: string;   // e.g., "gpt-4o-mini"
}
```

### Rate Limiting

- **Limit**: 3 analyses per user per hour
- **Algorithm**: Token bucket with automatic refill
- **Response**: HTTP 429 with `Retry-After` header
- **Storage**: In-memory (resets on server restart)

### Error Handling

| Error Code | HTTP | Description |
|------------|------|-------------|
| `unauthorized` | 401 | Not logged in |
| `missing_images` | 400 | User hasn't uploaded all 3 images |
| `rate_limit_exceeded` | 429 | Too many requests |
| `vision_api_failed` | 500 | OpenAI API error or timeout |
| `db_error` | 500 | Database query failed |

### Usage Example

```typescript
// Trigger analysis (client-side)
const response = await fetch('/api/analysis/start', {
  method: 'POST',
});

const { data } = await response.json();
// data: AnalysisSummary with traits, confidence, skin_type

// Fetch latest analysis
const latest = await fetch('/api/analysis/latest');
const analysis = await latest.json();
// Display in dashboard
```

### Extending Traits

To add new traits:

1. Update `buildVisionPrompt()` in `lib/ai/openai.ts`
2. Add trait ID to validation logic
3. Update dashboard mapping in `lib/analysis/service.ts`
4. Add display column to dashboard if needed

### Cost Optimization

- **Default Model**: `gpt-4o-mini` (~$0.02 per analysis)
- **Alternative**: `gpt-4o` (~$0.10 per analysis, higher accuracy)
- **Caching**: Consider caching results for re-analysis requests
- **Tokens**: Prompt uses ~300 tokens, response ~200 tokens

### Testing

```bash
# Unit tests
npm test lib/ai/openai.spec.ts
npm test lib/analysis/service.spec.ts

# E2E (with mocked OpenAI)
MOCK_OPENAI=1 npm run test:e2e tests/e2e/analysis.spec.ts

# Manual test
curl -X POST http://localhost:3000/api/analysis/start \
  -H "Cookie: supabase-auth-token=..."
```

### Troubleshooting

See [OPENAI_VISION.md - Troubleshooting](./OPENAI_VISION.md#troubleshooting) for common issues and solutions.

---

## Dashboard & Analytics

**Location**: [dashboard-setup.md](./dashboard-setup.md)

The dashboard displays real-time skin analysis insights powered by OpenAI Vision.

**Components**:
- `AnalysisOverview` - Time-series line chart (acne, dryness, pigmentation)
- `KPIRow` - Key metrics from onboarding data
- `RoutinePlanner` - AM/PM skincare routine
- `RecommendationsTable` - Product suggestions
- `InsightsFeed` - Analysis notes and observations

**Data Flow**:
1. Dashboard queries `GET /api/analysis/latest`
2. Returns `AnalysisSummary` with traits and series data
3. React Query caches response (5min stale time)
4. Charts render from `series` array
5. Notes display from `notes` array

**Key Files**:
- `app/(dashboard)/dashboard/DashboardClient.tsx` - Main dashboard layout
- `components/dashboard/AnalysisOverview.tsx` - Analysis chart component
- `lib/types.ts` - `AnalysisSummary` type definition

---

## Future Enhancements

### OpenAI Vision
- [ ] Historical trend tracking (multi-point time series)
- [ ] Confidence thresholds (reject low-quality analyses)
- [ ] PDF report generation
- [ ] Multi-language support for notes

### Dashboard
- [ ] Comparison view (before/after)
- [ ] Progress tracking (weekly/monthly)
- [ ] Export data as CSV/PDF

### Storage
- [ ] Image preprocessing (crop, rotate, compress)
- [ ] Thumbnail generation
- [ ] CDN integration for faster delivery

---

## Contact & Support

For questions or issues:
- Review relevant documentation in this folder
- Check server logs for error details
- File GitHub issues with reproduction steps
- Contact: support@carefi.com
