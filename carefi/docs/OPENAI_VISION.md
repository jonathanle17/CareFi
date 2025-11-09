# OpenAI Vision Integration

This document describes the OpenAI Vision integration for automated skin analysis in CareFi.

## Overview

CareFi uses OpenAI's Vision API (GPT-4o-mini by default) to analyze user facial images and detect skin traits. The integration:

- Analyzes three facial images (front, left 45°, right 45°) simultaneously for comprehensive assessment
- Detects up to 8 skin traits with severity ratings
- Returns structured JSON validated with Zod schemas
- Implements retry logic with exponential backoff for reliability
- Enforces rate limiting (3 analyses per hour per user)
- Stores results in Supabase with RLS protection

## Setup

### 1. Environment Variables

Add the following to your `.env` file:

```bash
# Required: OpenAI API Key
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-...

# Optional: Model selection (defaults to gpt-4o-mini)
OPENAI_VISION_MODEL=gpt-4o-mini
```

**Available Models:**
- `gpt-4o-mini` (recommended) - Cost-effective, fast, accurate
- `gpt-4o` - Higher accuracy, slower, more expensive
- `gpt-4-turbo` - Balance of speed and capability

### 2. Install Dependencies

```bash
npm install
```

The `openai` npm package (v4.77.3+) is required and listed in `package.json`.

### 3. Database Schema

The `skin_analyses` table is already configured in `supabase/schema.sql`:

```sql
CREATE TABLE public.skin_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending',
  detected_traits JSONB NOT NULL DEFAULT '[]',
  confidence_score DECIMAL(5,2),
  image_ids UUID[] NOT NULL DEFAULT '{}',
  error_message TEXT
);
```

No additional schema changes are needed.

### 4. Storage Configuration

Ensure the `images` bucket exists in Supabase Storage and RLS policies allow:
- Authenticated users can upload to their own folder: `{user_id}/*`
- Authenticated users can read from their own folder
- Signed URLs are enabled for temporary external access

## Usage Flow

### User Workflow

1. **Upload Images**: User uploads 3 facial photos (front, left_45, right_45) via `/upload`
2. **Start Analysis**: User navigates to `/analyze` which auto-triggers `POST /api/analysis/start`
3. **Wait for Completion**: UI shows progress through 4 stages (uploading → screening → detecting → generating)
4. **View Results**: Dashboard at `/dashboard` fetches latest analysis via `GET /api/analysis/latest`

### API Endpoints

#### `POST /api/analysis/start`

Triggers a new skin analysis for the authenticated user.

**Request:**
```http
POST /api/analysis/start HTTP/1.1
Content-Type: application/json
Cookie: supabase-auth-token=...
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "skin_type": "oily",
    "confidence": 0.87,
    "primary_concern": "acne",
    "updated At": "2025-11-08T12:00:00Z",
    "series": [
      {
        "date": "2025-11-08T12:00:00Z",
        "acne": 65,
        "dryness": 25,
        "pigmentation": 35
      }
    ],
    "notes": [
      "Acne: Active breakouts detected in T-zone",
      "Oiliness: Excess sebum production visible"
    ],
    "modelVersion": "gpt-4o-mini"
  }
}
```

**Error Responses:**

```json
// 401 Unauthorized
{
  "success": false,
  "error": {
    "code": "unauthorized",
    "message": "You must be logged in to start an analysis"
  }
}

// 400 Bad Request (missing images)
{
  "success": false,
  "error": {
    "code": "missing_images",
    "message": "Please upload all three required images..."
  }
}

// 429 Too Many Requests
{
  "success": false,
  "error": {
    "code": "rate_limit_exceeded",
    "message": "You have exceeded the analysis rate limit",
    "details": {
      "limit": "3 analyses per hour",
      "retryAfter": 1800,
      "retryAfterHuman": "30 minutes"
    }
  }
}

// 500 Internal Server Error
{
  "success": false,
  "error": {
    "code": "vision_api_failed",
    "message": "Our skin analysis service is temporarily unavailable..."
  }
}
```

#### `GET /api/analysis/latest`

Retrieves the most recent completed analysis for the authenticated user.

**Response (200):**
```json
{
  "user_id": "uuid",
  "skin_type": "combination",
  "confidence": 0.92,
  "primary_concern": "Hyperpigmentation",
  "updatedAt": "2025-11-08T12:00:00Z",
  "series": [...],
  "notes": [...],
  "modelVersion": "gpt-4o-mini"
}
```

**No Analysis (200):**
```json
{
  "success": true,
  "data": null
}
```

## JSON Schema Contract

### VisionAnalysisSchema

OpenAI Vision returns JSON validated against this schema:

```typescript
{
  skinType: "Dry" | "Oily" | "Combination" | "Normal" | "Sensitive",
  confidence: number, // 0-100
  primaryConcern: string,
  traits: [
    {
      id: string,         // kebab-case: "acne", "dryness", etc.
      name: string,       // Human-readable: "Acne", "Dryness"
      severity: "low" | "moderate" | "high",
      description: string // User-friendly explanation
    }
  ],
  notes: string[],        // Array of observations/recommendations
  modelVersion: string    // e.g., "gpt-4o-mini"
}
```

### Detected Traits

The following traits are analyzed:

| Trait ID | Name | Description |
|----------|------|-------------|
| `acne` | Acne | Active breakouts, comedones, acne-prone areas |
| `dryness` | Dryness | Dry patches, flakiness, dehydrated appearance |
| `oiliness` | Oiliness | Excess sebum, shine, enlarged pores from oil |
| `sensitivity` | Sensitivity | Redness, reactivity, inflammation signs |
| `hyperpigmentation` | Hyperpigmentation | Dark spots, melasma, uneven skin tone |
| `fine-lines` | Fine Lines | Early wrinkles, expression lines, age signs |
| `redness` | Redness | General redness, rosacea, irritation |
| `large-pores` | Large Pores | Visibly enlarged pores |

### Severity Mapping

For dashboard visualization, severities are mapped to 0-100 scores:

- **low**: 25
- **moderate**: 55
- **high**: 85

## Rate Limiting

**Limits:**
- 3 analyses per user per hour
- Token bucket algorithm with automatic refill
- In-memory storage (resets on server restart)

**Behavior:**
- Returns HTTP 429 when limit exceeded
- Includes `Retry-After` header with seconds until next token
- Error response includes human-readable retry time

**Cleanup:**
- Rate limiter buckets are cleaned up every 10 minutes
- Buckets with full tokens and >2 hours idle are removed

## Security & Privacy

### Image Access

- Images are stored in private Supabase Storage buckets
- Signed URLs are generated with 6-minute expiration
- URLs are never logged or stored
- OpenAI processes images in-memory (not retained)

### Authentication

- All endpoints require valid Supabase Auth session
- Row Level Security (RLS) enforces user isolation
- Analysis records are scoped to `auth.uid()`

### PII Protection

- No personally identifiable information is sent to OpenAI
- Images are sent as signed URLs (no metadata)
- User IDs and emails are never included in prompts

## Troubleshooting

### "Missing required image for angle: front"

**Cause**: User hasn't uploaded all three required images.

**Solution**:
1. Check `uploaded_images` table for the user
2. Ensure images exist for angles: `front`, `left_45`, `right_45`
3. Verify `deleted_at IS NULL`
4. Re-upload missing images via `/upload`

### "OpenAI Vision API failed after 3 attempts"

**Causes**:
- OpenAI API key invalid or expired
- OpenAI service outage
- Network connectivity issues
- Rate limits exceeded on OpenAI side

**Solutions**:
1. Verify `OPENAI_API_KEY` is set correctly
2. Check OpenAI API status: https://status.openai.com
3. Review server logs for specific error codes
4. If HTTP 429 from OpenAI: Wait and retry
5. If HTTP 5xx from OpenAI: Temporary outage, retry later

### "Failed to create signed URL"

**Causes**:
- Storage bucket doesn't exist
- RLS policies too restrictive
- Storage URL format changed

**Solutions**:
1. Verify bucket `images` exists in Supabase Dashboard → Storage
2. Check RLS policies allow signed URL creation
3. Verify `storage_url` format in `uploaded_images` table
4. Test signed URL generation manually via Supabase client

### Rate Limit Exceeded

**Behavior**: HTTP 429 with retry time

**Solutions**:
- Wait for the retry period (shown in error response)
- Rate limit resets hourly (rolling window)
- Contact support if limit is too restrictive
- Use test mode to bypass limits in development

## Development & Testing

### Mock Mode

Set `MOCK_OPENAI=1` to bypass OpenAI calls and return fixture data:

```bash
MOCK_OPENAI=1 npm run test:e2e
```

This uses `tests/fixtures/vision.json` for deterministic testing.

### Manual Testing

```bash
# 1. Start dev server
npm run dev

# 2. Create test user and upload 3 images via UI

# 3. Trigger analysis
curl -X POST http://localhost:3000/api/analysis/start \
  -H "Cookie: supabase-auth-token=YOUR_TOKEN" \
  -H "Content-Type: application/json"

# 4. Check latest analysis
curl http://localhost:3000/api/analysis/latest \
  -H "Cookie: supabase-auth-token=YOUR_TOKEN"
```

### Unit Tests

```bash
# Test Zod schemas
npm test lib/ai/openai.spec.ts

# Test service mapping
npm test lib/analysis/service.spec.ts
```

### E2E Tests

```bash
# Run full analysis flow
npm run test:e2e tests/e2e/analysis.spec.ts
```

## Architecture

### File Structure

```
carefi/
├── lib/
│   ├── ai/
│   │   └── openai.ts           # OpenAI client, schemas, callVision()
│   ├── storage/
│   │   └── imageUtils.ts       # Signed URL generation
│   ├── analysis/
│   │   └── service.ts          # Orchestration layer
│   └── env.ts                  # Environment validation
├── app/api/analysis/
│   ├── start/route.ts          # POST endpoint
│   └── latest/route.ts         # GET endpoint
├── hooks/
│   └── useAnalysis.ts          # React hook for UI
└── docs/
    └── OPENAI_VISION.md        # This file
```

### Data Flow

```
User uploads 3 images
  ↓
Images saved to Supabase Storage
  ↓
User visits /analyze
  ↓
useAnalysis() calls POST /api/analysis/start
  ↓
API creates skin_analyses row (status: 'uploading')
  ↓
Service fetches images, generates signed URLs
  ↓
Service calls OpenAI Vision with 3 image URLs
  ↓
OpenAI returns JSON with traits + confidence
  ↓
Service validates response, saves to DB (status: 'complete')
  ↓
API returns AnalysisSummary to frontend
  ↓
Dashboard fetches via GET /api/analysis/latest
  ↓
KPIs and charts render with real data
```

## Cost Estimation

**OpenAI Pricing (as of 2025):**
- GPT-4o-mini: ~$0.02 per analysis (3 high-detail images)
- GPT-4o: ~$0.10 per analysis
- GPT-4-turbo: ~$0.05 per analysis

**Monthly Cost Example (1000 users, 1 analysis each):**
- gpt-4o-mini: $20/month
- gpt-4o: $100/month

**Optimization Tips:**
- Use `gpt-4o-mini` for production (default)
- Reduce `max_tokens` if responses are shorter than expected
- Consider caching results for re-analysis requests

## Future Enhancements

- [ ] Store historical analyses for trend tracking (multi-point time series)
- [ ] Support image preprocessing (crop, rotate, enhance)
- [ ] Add confidence thresholds (reject low-confidence results)
- [ ] Implement webhooks for async analysis
- [ ] Add admin override for rate limits
- [ ] Support custom trait definitions
- [ ] Multi-language support for notes
- [ ] PDF report generation

## Support

For issues or questions:
- Check server logs: `docker logs carefi-server` or Vercel logs
- Review Supabase logs: Dashboard → Logs
- File GitHub issue: https://github.com/your-org/carefi/issues
- Contact support: support@carefi.com
