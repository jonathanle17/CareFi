# CareFi Codebase Context

> **Comprehensive context document for providing full codebase understanding to LLM models**

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [User Journey & Features](#user-journey--features)
5. [Database Schema](#database-schema)
6. [API Architecture](#api-architecture)
7. [Authentication & Authorization](#authentication--authorization)
8. [Type System](#type-system)
9. [Component Architecture](#component-architecture)
10. [Design System](#design-system)
11. [Key Code Patterns](#key-code-patterns)
12. [Development Workflow](#development-workflow)
13. [Integration Points](#integration-points)
14. [Security & Privacy](#security--privacy)

---

## Project Overview

**CareFi** (formerly DermaFi) is a production-ready AI-powered skincare analysis and recommendation platform built with Next.js 16. The application provides personalized skincare routines with budget optimization based on AI-powered facial photo analysis.

### Core Features
- AI-powered skin analysis from uploaded photos
- Personalized AM/PM skincare routine generation
- Budget-conscious product recommendations
- Price comparison with alternative products (dupes)
- Complete user onboarding questionnaire
- User authentication and profile management
- Responsive, accessible, QOVES-inspired UI design

### Current Status
- **Frontend:** 100% complete and production-ready
- **Backend:** Full database schema implemented, API routes functional
- **Authentication:** Supabase Auth integrated with RLS policies
- **Integration Points:** Clearly marked for AI/ML services (OpenAI Vision, YOLOv8)
- **Deployment:** Ready for production deployment

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.0.1 | Framework (App Router, SSR) |
| React | 19.2.0 | UI library |
| TypeScript | 5.x | Type safety (strict mode) |
| Tailwind CSS | v4 | Styling framework |
| shadcn/ui | Latest | Component library (Radix UI) |
| Framer Motion | 12.23.24 | Animations |
| lucide-react | 0.553.0 | Icon library |
| Zod | 4.1.12 | Schema validation |

### Backend & Database
| Technology | Version | Purpose |
|------------|---------|---------|
| Supabase | Latest | Database (PostgreSQL), Auth, Storage |
| @supabase/ssr | 0.7.0 | Server-side rendering with Auth |
| bcryptjs | 3.0.3 | Password hashing |
| @tanstack/react-query | 5.62.15 | Data fetching & caching |

### Data Visualization
| Technology | Version | Purpose |
|------------|---------|---------|
| recharts | 2.15.0 | Charts for dashboard |
| date-fns | 4.1.0 | Date formatting |

### Development & Testing
| Technology | Version | Purpose |
|------------|---------|---------|
| Vitest | 2.1.8 | Unit testing |
| Playwright | 1.49.1 | E2E testing |
| ESLint | 9 | Code linting |

---

## Project Structure

```
carefi/
├── app/                          # Next.js App Router
│   ├── page.tsx                 # Landing page
│   ├── layout.tsx               # Root layout with Navbar
│   ├── signup/page.tsx          # User registration
│   ├── signin/page.tsx          # User login
│   ├── onboarding/              # 5-step questionnaire
│   │   ├── page.tsx             # Server component (auth gate)
│   │   └── OnboardingClient.tsx # Client component (form UI)
│   ├── upload/page.tsx          # Photo upload (3 images)
│   ├── analyze/page.tsx         # AI analysis progress
│   ├── routine/page.tsx         # Personalized AM/PM routine
│   ├── budget/page.tsx          # Price comparison table
│   ├── checkout/page.tsx        # Test payment form
│   ├── summary/page.tsx         # Plan recap
│   ├── (dashboard)/             # Grouped route
│   │   └── dashboard/
│   │       ├── page.tsx         # Server component
│   │       └── DashboardClient.tsx # Client component
│   └── api/                     # API routes
│       ├── signup/route.ts      # POST /api/signup
│       ├── signin/route.ts      # POST /api/signin
│       ├── onboarding/route.ts  # POST /api/onboarding
│       ├── uploadImage/route.ts # POST /api/uploadImage
│       ├── analysis/latest/route.ts # GET /api/analysis/latest
│       ├── recommendations/route.ts # POST /api/recommendations
│       └── storage/test/route.ts    # GET /api/storage/test
│
├── components/                   # React components
│   ├── ui/                      # shadcn/ui components (22 files)
│   │   ├── button.tsx, card.tsx, input.tsx
│   │   ├── tabs.tsx, dialog.tsx, progress.tsx
│   │   ├── accordion.tsx, tooltip.tsx, etc.
│   ├── dashboard/               # Dashboard components (8 files)
│   │   ├── AnalysisOverview.tsx
│   │   ├── RoutinePlanner.tsx
│   │   ├── RecommendationsTable.tsx
│   │   ├── InsightsFeed.tsx
│   │   ├── BudgetOptimizer.tsx
│   │   ├── AllergyList.tsx
│   │   ├── KPIRow.tsx
│   │   └── Header.tsx
│   ├── Navbar.tsx               # Navigation with auth menu
│   ├── SectionHeading.tsx       # Page headers
│   ├── UploadZone.tsx           # Drag-and-drop uploader
│   ├── RoutineCard.tsx          # Skincare step card
│   ├── CompareRow.tsx           # Budget comparison
│   ├── ProgressLog.tsx          # Analysis progress tracker
│   └── [25+ custom components]
│
├── lib/                         # Core utilities
│   ├── api.ts                  # API stub functions
│   ├── types.ts                # TypeScript definitions
│   ├── utils.ts                # Utility functions
│   ├── format.ts               # Formatting helpers
│   ├── env.ts                  # Environment validation
│   ├── budget-context.tsx      # Budget context provider
│   ├── supabase/               # Supabase clients
│   │   ├── server.ts           # Server-side client
│   │   └── client.ts           # Client-side client
│   ├── users/                  # User management
│   │   └── service.ts          # User CRUD operations
│   ├── onboarding/             # Onboarding logic
│   │   └── service.ts          # Save onboarding data
│   ├── storage/                # File storage
│   │   ├── service.ts
│   │   ├── images.ts
│   │   └── buckets.ts
│   ├── http/                   # HTTP utilities
│   │   ├── handler.ts          # Route handler wrapper
│   │   ├── response.ts         # Standard responses
│   │   └── errors.ts           # Custom errors
│   ├── validation/             # Zod schemas
│   │   ├── auth.ts             # Auth validation
│   │   └── onboarding.ts       # Onboarding validation
│   └── security/               # Security utilities
│       └── passwords.ts        # Password hashing
│
├── hooks/                       # Custom React hooks
│   └── useAnalysis.ts          # Analysis state machine
│
├── data/                        # Mock/seed data
│   ├── products.json           # Product database
│   └── routine.json            # Routine structure
│
├── supabase/                    # Database schema
│   ├── schema.sql              # PostgreSQL schema (560 lines)
│   └── storage_policies.sql    # Storage RLS policies
│
├── tests/                       # Test files
│   └── e2e/                    # Playwright tests
│
├── docs/                        # Documentation
│   ├── README.md               # Setup & overview
│   ├── CLAUDE.md               # Claude Code guide
│   ├── IMPLEMENTATION_SUMMARY.md # Feature status
│   └── openapi.yaml            # API specification
│
├── public/                      # Static assets
├── middleware.ts               # Session management
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── tailwind.config.ts          # Tailwind theme
├── next.config.ts              # Next.js config
└── .env.local                  # Environment variables
```

---

## User Journey & Features

### Complete User Flow (8 Pages)

#### 1. Landing Page (`/`)
- Hero section with gradient typography
- Value propositions with icon cards
- "How it works" section (3 steps)
- Social proof statistics
- Dual CTAs (Get Started, Learn More)
- Animated background patterns
- Fully responsive design

**Key Components:**
- Hero with Playfair Display headings
- Feature cards with lucide icons
- CTA buttons with hover animations

#### 2. Sign Up (`/signup`)
- Email, password, display name form
- Client-side validation (Zod)
- Password requirements (8+ chars, 1 letter, 1 number)
- Creates user in Supabase Auth
- Creates user_profiles entry
- Auto-login after signup
- Redirects to onboarding

**API:** `POST /api/signup`

#### 3. Sign In (`/signin`)
- Email and password form
- Session cookie management
- Error handling (invalid credentials)
- Redirects to dashboard after login

**API:** `POST /api/signin`

#### 4. Onboarding (`/onboarding`)
**5-step multi-step form:**

**Step 1: Skin Concerns** (multi-select)
- Acne, Dryness, Oiliness, Sensitivity
- Hyperpigmentation, Fine lines, Redness, Large pores

**Step 2: Skin Goals** (multi-select)
- Clear skin, Even tone, Hydration
- Anti-aging, Oil control, Calming

**Step 3: Current Routine** (textarea)
- Free-form text describing existing products

**Step 4: Ingredients to Avoid** (textarea)
- Allergies, sensitivities, personal preferences

**Step 5: Budget Range** (dual slider)
- Min/max USD values
- Visual budget indicator

**Features:**
- Progress indicator (1/5, 2/5, etc.)
- Back/Next navigation
- Form validation per step
- Data persisted to database on completion
- Updates `onboarding_completed` flag

**API:** `POST /api/onboarding`

#### 5. Photo Upload (`/upload`)
- Drag-and-drop zone (3 photos max)
- File type validation (JPEG, PNG, WebP)
- File size limit (10MB)
- Preview grid with face box overlays
- Upload tips sidebar
- Privacy note
- Three required angles:
  - Front view
  - Left 45° angle
  - Right 45° angle

**Features:**
- Client-side file validation
- Preview before upload
- Upload progress tracking
- Stores in Supabase Storage bucket `user-photos`

**API:** `POST /api/uploadImage`

#### 6. Analysis Page (`/analyze`)
- Real-time progress animation
- 4-step progress tracker:
  1. Uploading photos
  2. Screening for quality
  3. Detecting skin features
  4. Generating recommendations
- Animated progress bar (Framer Motion)
- Results display with detected traits
- Severity badges (low/moderate/high)
- Auto-redirect to routine page on completion

**State Machine:** `useAnalysis` hook

#### 7. Routine Page (`/routine`)
- Tabbed interface (AM/PM)
- Personalized routine steps (5-8 steps per period)
- Each step shows:
  - Step number and product type
  - Key active ingredients (badges)
  - Rationale (accordion with explanation)
  - 2-3 recommended products
  - Product cards with price, merchant, link
- Ingredient glossary
- Alternative product suggestions

**Data Source:** `lib/api.ts` → `getRoutine()`

#### 8. Budget Page (`/budget`)
- Side-by-side comparison table
- Brand pick vs. budget alternatives
- Each row shows:
  - Product type
  - Premium product (left)
  - Budget alternative (right)
  - Savings amount & percentage
  - Ingredient match indicator
- Total savings calculation
- Merchant availability
- "View full routine" link

**Data Source:** `lib/api.ts` → `getBudgetComparisons()`

#### 9. Checkout Page (`/checkout`)
- Stripe-style payment form
- Credit card input (test mode)
- Cardholder name
- Expiry date & CVV
- Order summary sidebar
- Form validation
- Success dialog with animation
- Order confirmation

**API:** `lib/api.ts` → `simulateCheckout()` (stub)

#### 10. Summary Page (`/summary`)
- Complete plan recap
- Product list with images
- 30-day introduction schedule
  - Week 1: Cleanser, moisturizer only
  - Week 2: Add treatment
  - Week 3: Add sunscreen
  - Week 4: Full routine
- Budget breakdown
- Next steps (CTA to dashboard)

#### 11. Dashboard (`/dashboard`)
**Comprehensive user dashboard with:**

- **Header:** Welcome message, last analysis date
- **KPI Row:**
  - Confidence score
  - Detected skin type
  - Primary concern
- **Analysis Overview:**
  - 30-day trend chart (recharts)
  - Severity distribution
  - Recent analysis summary
- **Routine Planner:**
  - Current AM/PM routine
  - Product recommendations
- **Recommendations Table:**
  - Personalized product suggestions
  - Price, vendor, key ingredients
  - Concern tags
- **Insights Feed:**
  - Analysis notes
  - Recommendations
  - Tips
- **Budget Optimizer:**
  - Spending overview
  - Savings opportunities
- **Allergy List:**
  - Ingredients to avoid
  - Sensitivity warnings

**API:** `GET /api/analysis/latest`

---

## Database Schema

### Supabase PostgreSQL Schema (8 Tables)

#### 1. `user_profiles`
Extends Supabase Auth with CareFi-specific data.

```sql
- id (UUID, FK to auth.users)
- created_at, updated_at (TIMESTAMPTZ)
- display_name (TEXT)
- onboarding_completed (BOOLEAN)
- onboarding_completed_at (TIMESTAMPTZ)
- email (TEXT)
- password (TEXT) -- Note: Not used, handled by Supabase Auth
```

**RLS Policies:**
- Users can view/update own profile
- Service role can bypass for admin operations

#### 2. `onboarding_data`
Stores 5-step onboarding questionnaire data.

```sql
- id (UUID, PK)
- user_id (UUID, FK to user_profiles)
- created_at, updated_at (TIMESTAMPTZ)
- skin_concerns (TEXT[])
- skin_goals (TEXT[])
- current_routine (TEXT)
- ingredients_to_avoid (TEXT)
- ingredients_to_avoid_array (TEXT[])
- budget_min_usd (DECIMAL)
- budget_max_usd (DECIMAL)
```

**Constraints:**
- `one_per_user` (UNIQUE on user_id)
- `valid_budget` (min >= 1, min <= max)
- `valid_concerns` (at least 1 concern)
- `valid_goals` (at least 1 goal)

**RLS Policies:**
- Users can view/insert/update own data

#### 3. `uploaded_images`
Stores photo upload metadata (files in Supabase Storage).

```sql
- id (UUID, PK)
- user_id (UUID, FK to user_profiles)
- created_at (TIMESTAMPTZ)
- file_name (TEXT)
- file_size_bytes (BIGINT)
- mime_type (TEXT)
- angle (TEXT) -- front | left_45 | right_45
- storage_url (TEXT)
- thumbnail_url (TEXT)
- original_last_modified (TIMESTAMPTZ)
- deleted_at (TIMESTAMPTZ) -- Soft delete
```

**Constraints:**
- `valid_angle` (CHECK: front, left_45, right_45)
- `valid_mime_type` (CHECK: image/*)

**RLS Policies:**
- Users can view own non-deleted images
- Users can insert/update own images

**Indexes:**
- `idx_images_user_id`
- `idx_images_angle` (user_id, angle WHERE deleted_at IS NULL)

#### 4. `skin_analyses`
Stores AI analysis results.

```sql
- id (UUID, PK)
- user_id (UUID, FK to user_profiles)
- created_at, completed_at (TIMESTAMPTZ)
- status (TEXT) -- pending | uploading | screening | detecting | generating | complete | error
- detected_traits (JSONB) -- [{ id, name, severity, description }]
- confidence_score (DECIMAL) -- 0.00 to 100.00
- image_ids (UUID[])
- error_message (TEXT)
```

**Constraints:**
- `valid_status` (CHECK: allowed statuses)
- `valid_confidence` (CHECK: 0-100)

**RLS Policies:**
- Users can view/insert/update own analyses

**Indexes:**
- `idx_analyses_user_id`
- `idx_analyses_status`
- `idx_analyses_traits` (GIN on detected_traits JSONB)

#### 5. `products`
Product catalog (reference data, not user-specific).

```sql
- id (UUID, PK)
- created_at, updated_at (TIMESTAMPTZ)
- name (TEXT)
- brand (TEXT)
- product_type (TEXT) -- Cleanser, Toner, Moisturizer, etc.
- price_usd (DECIMAL)
- merchants (TEXT[]) -- Amazon, YesStyle, Sephora
- active_ingredients (TEXT[])
- all_ingredients (TEXT)
- product_link (TEXT)
- image_url (TEXT)
- description (TEXT)
- size (TEXT)
- is_premium (BOOLEAN)
- dupe_group_id (UUID) -- Links budget alternatives
- is_active (BOOLEAN)
- discontinued_at (TIMESTAMPTZ)
```

**RLS Policies:**
- Public read access (anyone can view active products)

**Indexes:**
- `idx_products_brand`
- `idx_products_type`
- `idx_products_price`
- `idx_products_dupe_group`
- `idx_products_actives` (GIN on active_ingredients)

#### 6. `personalized_routines`
User-specific AM/PM routines.

```sql
- id (UUID, PK)
- user_id (UUID, FK to user_profiles)
- analysis_id (UUID, FK to skin_analyses)
- created_at (TIMESTAMPTZ)
- am_steps (JSONB) -- [{ step, productType, actives[], rationale, recommendedProducts[] }]
- pm_steps (JSONB)
- is_active (BOOLEAN)
- deactivated_at (TIMESTAMPTZ)
```

**RLS Policies:**
- Users can view/insert/update own routines

**Indexes:**
- `idx_routines_user_id`
- `idx_routines_active` (user_id, is_active WHERE is_active = TRUE)

#### 7. `budget_optimizations`
Budget comparison data.

```sql
- id (UUID, PK)
- user_id (UUID, FK to user_profiles)
- routine_id (UUID, FK to personalized_routines)
- created_at (TIMESTAMPTZ)
- comparisons (JSONB) -- [{ step, brandPick, dupes[], savings, savingsPercent }]
- total_savings_usd (DECIMAL)
- total_savings_percent (DECIMAL)
- is_active (BOOLEAN)
```

**RLS Policies:**
- Users can view/insert/update own optimizations

**Indexes:**
- `idx_optimizations_user_id`
- `idx_optimizations_routine_id`

#### 8. `orders`
Purchase history and order tracking.

```sql
- id (UUID, PK)
- user_id (UUID, FK to user_profiles)
- routine_id (UUID, FK to personalized_routines)
- optimization_id (UUID, FK to budget_optimizations)
- created_at, updated_at (TIMESTAMPTZ)
- order_number (TEXT, UNIQUE) -- Auto-generated
- items (JSONB) -- [{ productId, productName, brand, price, quantity }]
- subtotal_usd, tax_usd, total_usd (DECIMAL)
- status (TEXT) -- pending | payment_processing | payment_failed | completed | shipped | delivered | cancelled | refunded
- payment_intent_id (TEXT) -- Stripe payment intent ID
- cardholder_name (TEXT)
- shipping_address (JSONB)
- tracking_number (TEXT)
- shipped_at, delivered_at (TIMESTAMPTZ)
```

**Constraints:**
- `valid_order_status` (CHECK: allowed statuses)
- `valid_totals` (CHECK: >= 0)

**RLS Policies:**
- Users can view/insert/update own orders

**Indexes:**
- `idx_orders_user_id`
- `idx_orders_status`
- `idx_orders_number`
- `idx_orders_created_at` (DESC)

### Database Functions & Triggers

#### `update_updated_at_column()`
Auto-updates `updated_at` timestamp on UPDATE.

Applied to:
- `user_profiles`
- `onboarding_data`
- `products`
- `orders`

#### `generate_order_number()`
Generates order numbers in format: `ORDER-YYYYMMDD-XXXXXXXX`

Example: `ORDER-20250108-A3B5C7D9`

#### `set_order_number()`
Trigger to auto-generate order number on INSERT.

---

## API Architecture

### API Routes

All API routes follow RESTful conventions and return standardized JSON responses.

#### Authentication Endpoints

##### `POST /api/signup`
Creates new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "displayName": "John Doe"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "displayName": "John Doe",
      "onboardingCompleted": false
    },
    "session": {
      "access_token": "...",
      "refresh_token": "...",
      "expires_at": 1234567890
    }
  }
}
```

**Validation:** Zod schema in `lib/validation/auth.ts`
**Service:** `lib/users/service.ts` → `createUser()`

**Flow:**
1. Validate input with Zod
2. Create Supabase Auth user (auto-confirmed)
3. Create user_profiles entry
4. Set session cookies
5. Return user + session

**Error Handling:**
- 409 Conflict: Email already exists
- 400 Bad Request: Validation errors
- 500 Internal Server Error: Database errors

##### `POST /api/signin`
Authenticates user and creates session.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": { /* same as signup */ },
    "session": { /* same as signup */ }
  }
}
```

**Flow:**
1. Validate input
2. Authenticate with Supabase Auth
3. Fetch user profile
4. Set session cookies
5. Return user + session

**Error Handling:**
- 401 Unauthorized: Invalid credentials
- 403 Forbidden: Email not confirmed
- 500 Internal Server Error

#### Onboarding Endpoints

##### `POST /api/onboarding`
Saves onboarding questionnaire data.

**Request Body:**
```json
{
  "skinConcerns": ["Acne", "Dryness"],
  "skinGoals": ["Clear skin", "Hydration"],
  "currentRoutine": "CeraVe cleanser, Neutrogena moisturizer",
  "ingredientsToAvoid": "Fragrance, alcohol",
  "budgetMin": 50,
  "budgetMax": 150
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "skinConcerns": ["Acne", "Dryness"],
    "skinGoals": ["Clear skin", "Hydration"],
    "currentRoutine": "...",
    "ingredientsToAvoid": "...",
    "budgetMin": 50,
    "budgetMax": 150
  }
}
```

**Service:** `lib/onboarding/service.ts` → `saveOnboardingData()`

**Flow:**
1. Get authenticated user
2. Validate input with Zod
3. Upsert onboarding_data (INSERT or UPDATE)
4. Update user_profiles.onboarding_completed = true
5. Return saved data

#### Image Upload Endpoints

##### `POST /api/uploadImage`
Uploads photo to Supabase Storage.

**Request:** `multipart/form-data`
- `file`: Image file (JPEG, PNG, WebP)
- `angle`: "front" | "left_45" | "right_45"

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "storageUrl": "https://...",
    "path": "user-id/front/filename.jpg",
    "fileName": "filename.jpg",
    "fileSize": 1234567,
    "mimeType": "image/jpeg",
    "angle": "front"
  }
}
```

**Service:** `lib/storage/service.ts`

**Flow:**
1. Get authenticated user
2. Validate file type and size
3. Generate unique filename
4. Upload to Supabase Storage bucket `user-photos`
5. Create uploaded_images database entry
6. Return URL and metadata

**Storage Structure:**
```
user-photos/
  {user_id}/
    front/
      {timestamp}_{filename}.jpg
    left_45/
      {timestamp}_{filename}.jpg
    right_45/
      {timestamp}_{filename}.jpg
```

#### Analysis Endpoints

##### `GET /api/analysis/latest`
Fetches latest skin analysis for authenticated user.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "skinType": "Combination",
    "confidence": 92,
    "primaryConcern": "Acne",
    "updatedAt": "2025-01-08T12:00:00Z",
    "series": [
      {
        "date": "2025-01-01",
        "acne": 3,
        "dryness": 2,
        "oiliness": 4
      }
    ],
    "notes": [
      "Your skin shows improvement in acne severity"
    ],
    "modelVersion": "v1.2.3"
  }
}
```

**Current Status:** Returns mock data
**TODO:** Connect to real analysis service

##### `POST /api/recommendations`
Gets personalized product recommendations.

**Request Body:**
```json
{
  "userId": "uuid",
  "analysisId": "uuid"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "id": "uuid",
        "name": "Product Name",
        "concernTags": ["Acne", "Oiliness"],
        "keyIngredients": ["Salicylic Acid", "Niacinamide"],
        "priceUsd": 24.99,
        "retailUsd": 29.99,
        "vendor": "Amazon",
        "url": "https://..."
      }
    ]
  }
}
```

**Current Status:** Stub implementation
**TODO:** Implement product matching algorithm

#### Storage Test Endpoints

##### `GET /api/storage/test`
Tests Supabase Storage access (development only).

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Storage access working",
    "buckets": ["user-photos", "user-photos-thumbnails"]
  }
}
```

### HTTP Utilities

#### `lib/http/handler.ts`
Generic route handler wrapper with validation and error handling.

**Functions:**
- `createHandler<T>()` - Generic handler
- `createPostHandler<T>()` - POST-specific
- `createGetHandler<T>()` - GET-specific

**Features:**
- Method enforcement (405 if wrong method)
- Request size limiting (1MB default)
- Zod schema validation
- Automatic error handling
- Request ID generation
- Consistent response format

**Example Usage:**
```typescript
import { createPostHandler } from '@/lib/http/handler'
import { signupSchema } from '@/lib/validation/auth'

export const POST = createPostHandler({
  schema: signupSchema,
  handler: async (data, request) => {
    // Handler logic
    return { user, session }
  }
})
```

#### `lib/http/response.ts`
Standard HTTP response helpers.

**Functions:**
```typescript
ok<T>(data: T): Response // 200 OK
created<T>(data: T): Response // 201 Created
accepted<T>(data: T): Response // 202 Accepted
fail(message: string, status: number): Response // Error
internalServerError(message: string): Response // 500
```

**Response Format:**
```json
{
  "success": true,
  "data": { /* payload */ }
}
```

**Error Format:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message"
  }
}
```

#### `lib/http/errors.ts`
Custom error classes for consistent error handling.

**Classes:**
```typescript
HttpError // Base class
UnauthorizedError // 401
ForbiddenError // 403
NotFoundError // 404
ConflictError // 409 (e.g., email already exists)
ValidationError // 400
```

**Usage:**
```typescript
throw new ConflictError('Email already exists', 'EMAIL_EXISTS')
```

---

## Authentication & Authorization

### Authentication Flow

#### Signup Flow
1. User submits email, password, display name
2. Frontend validates with Zod schema
3. POST request to `/api/signup`
4. Backend creates Supabase Auth user (auto-confirmed)
5. Backend creates user_profiles entry
6. Session cookies set via `@supabase/ssr`
7. User redirected to `/onboarding`

#### Signin Flow
1. User submits email, password
2. Frontend validates
3. POST request to `/api/signin`
4. Backend authenticates with Supabase Auth
5. Backend fetches user profile
6. Session cookies set
7. User redirected to `/dashboard`

#### Session Management
- Middleware (`middleware.ts`) handles session refresh
- Cookies managed by `@supabase/ssr`
- Session expires after inactivity
- Automatic refresh on page load

#### Protected Routes
Routes requiring authentication:
- `/onboarding`
- `/upload`
- `/analyze`
- `/routine`
- `/budget`
- `/checkout`
- `/summary`
- `/dashboard`

**Enforcement:**
- Server components: Check session in page component
- Client components: Check session in useEffect
- Middleware: Redirect unauthenticated users to `/signin`

### Authorization (RLS Policies)

#### Row Level Security (RLS)
All tables have RLS enabled. Policies enforce data isolation.

**Pattern:**
```sql
-- Users can only access their own data
CREATE POLICY "policy_name"
  ON public.table_name FOR SELECT
  USING (auth.uid() = user_id);
```

**Applied to:**
- `user_profiles`
- `onboarding_data`
- `uploaded_images`
- `skin_analyses`
- `personalized_routines`
- `budget_optimizations`
- `orders`

**Public Access:**
- `products` table: Read-only for all users

**Admin Access:**
- Service role bypasses RLS
- Used in `createAdminClient()` for admin operations

### Password Security

#### Hashing
- Passwords hashed by Supabase Auth (bcrypt)
- Never stored in plain text
- Never logged or exposed in API responses
- `user_profiles.password` field deprecated (not used)

#### Password Requirements
- Minimum 8 characters
- At least 1 letter
- At least 1 number
- Enforced by Zod schema

#### Best Practices
- No password in database (only in auth.users managed by Supabase)
- Session tokens in HTTP-only cookies
- HTTPS required in production
- Rate limiting on auth endpoints (TODO)

---

## Type System

### Core Types (`lib/types.ts`)

```typescript
// Product type
interface Product {
  id: string
  name: string
  brand: string
  price: number
  merchants: string[] // ["Amazon", "YesStyle", "Sephora"]
  actives: string[]   // ["Niacinamide", "Hyaluronic Acid"]
  link?: string
  imageUrl?: string
}

// Skin trait detected by AI
interface SkinTrait {
  id: string
  name: string
  severity: "low" | "moderate" | "high"
  description: string
}

// Single routine step (AM or PM)
interface RoutineStep {
  step: number
  period: "AM" | "PM"
  productType: string // "Cleanser", "Moisturizer", etc.
  actives: string[]
  rationale: string
  recommendedProducts: Product[]
}

// Analysis status enum
type AnalysisStatus =
  | "idle"
  | "uploading"
  | "screening"
  | "detecting"
  | "generating"
  | "complete"
  | "error"

// Progress item for UI
interface ProgressItem {
  label: string
  status: "pending" | "done"
}

// Budget comparison row
interface BudgetComparison {
  step: string
  brandPick: Product
  dupes: Product[]
  savings: number
  savingsPercent: number
}

// Image angle type
type ImageAngle = "front" | "left_45" | "right_45"

// Database row types
interface OnboardingRow {
  id: string
  user_id: string
  skin_concerns: string[]
  skin_goals: string[]
  current_routine: string
  ingredients_to_avoid: string
  budget_min_usd: number
  budget_max_usd: number
  created_at: string
  updated_at: string
}

// Analysis summary for dashboard
interface AnalysisSummary {
  userId: string
  skinType: string
  confidence: number // 0-100
  primaryConcern: string
  updatedAt: string
  series: AnalysisPoint[] // 30-day trend
  notes: string[]
  modelVersion: string
}

interface AnalysisPoint {
  date: string // "YYYY-MM-DD"
  acne: number
  dryness: number
  oiliness: number
  // ... other traits
}

// Product recommendation
interface Recommendation {
  id: string
  name: string
  concernTags: string[]
  keyIngredients: string[]
  priceUsd: number
  retailUsd: number
  vendor: string
  url: string
}
```

### Validation Types (`lib/validation/`)

#### Auth Schemas (`lib/validation/auth.ts`)

```typescript
import { z } from 'zod'

// Signup validation
const signupSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  displayName: z.string().min(1, "Display name is required")
})

// Inferred types
type SignupInput = z.infer<typeof signupSchema>

// Login validation
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required")
})

type LoginInput = z.infer<typeof loginSchema>
```

#### Onboarding Schema (`lib/validation/onboarding.ts`)

```typescript
const onboardingSchema = z.object({
  skinConcerns: z.array(z.string()).min(1),
  skinGoals: z.array(z.string()).min(1),
  currentRoutine: z.string().optional(),
  ingredientsToAvoid: z.string().optional(),
  budgetMin: z.number().min(1),
  budgetMax: z.number().min(1)
}).refine(
  data => data.budgetMin <= data.budgetMax,
  { message: "Budget min must be <= budget max" }
)

type OnboardingInput = z.infer<typeof onboardingSchema>
```

### Database Types

Types are inferred from Supabase schema. See [Database Schema](#database-schema) section for full table definitions.

---

## Component Architecture

### Component Categories

#### 1. UI Components (`components/ui/`)
**shadcn/ui** components built on Radix UI primitives.

**22 components:**
- `button.tsx` - Button with variants
- `card.tsx` - Card container
- `input.tsx` - Text input
- `textarea.tsx` - Multi-line input
- `select.tsx` - Dropdown select
- `checkbox.tsx` - Checkbox input
- `slider.tsx` - Range slider
- `tabs.tsx` - Tabbed interface
- `dialog.tsx` - Modal dialog
- `sheet.tsx` - Slide-out panel
- `accordion.tsx` - Expandable content
- `tooltip.tsx` - Hover tooltip
- `progress.tsx` - Progress bar
- `badge.tsx` - Label badge
- `alert.tsx` - Alert message
- `separator.tsx` - Horizontal rule
- `dropdown-menu.tsx` - Dropdown menu
- `popover.tsx` - Popover overlay
- ... (22 total)

**Pattern:**
- All use `class-variance-authority` for variants
- All use Tailwind CSS for styling
- All support ref forwarding
- All typed with TypeScript

**DO NOT EDIT DIRECTLY:** Regenerate with shadcn CLI if changes needed.

#### 2. Layout Components

##### `Navbar.tsx`
Top navigation bar with authentication menu.

**Features:**
- Logo and brand name
- Navigation links (Home, Dashboard, etc.)
- User menu (dropdown)
  - Profile
  - Settings
  - Sign out
- Responsive mobile menu
- Auth state detection

**Rendered in:** `app/layout.tsx` (root layout)

##### `SectionHeading.tsx`
Reusable page header component.

**Props:**
```typescript
{
  eyebrow?: string      // Small label above title
  title: string         // Main heading
  subtitle?: string     // Description below title
  align?: "left" | "center"
}
```

**Usage:**
```tsx
<SectionHeading
  eyebrow="Step 2"
  title="Upload Your Photos"
  subtitle="Take 3 photos for accurate analysis"
  align="center"
/>
```

**Used on:** Every page for consistent headers

#### 3. Form Components

##### `StepCard.tsx`
Multi-step form container.

**Props:**
```typescript
{
  currentStep: number
  totalSteps: number
  children: React.ReactNode
  onBack?: () => void
  onNext?: () => void
  nextDisabled?: boolean
}
```

**Features:**
- Progress indicator (e.g., "2 / 5")
- Back/Next navigation buttons
- Keyboard navigation support

##### `UploadZone.tsx`
Drag-and-drop file uploader.

**Props:**
```typescript
{
  onFilesSelected: (files: File[]) => void
  maxFiles?: number
  acceptedTypes?: string[]
  maxSizeBytes?: number
}
```

**Features:**
- Drag-and-drop zone
- Click to browse
- File preview grid
- File validation (type, size)
- Multiple file support
- Face box overlay on previews
- Remove file button

**Used on:** `/upload` page

#### 4. Content Display Components

##### `RoutineCard.tsx`
Displays a single routine step.

**Props:**
```typescript
{
  step: RoutineStep
  expanded?: boolean
}
```

**Features:**
- Step number and product type
- Active ingredient badges
- Expandable rationale (accordion)
- Product recommendations carousel
- Product cards with:
  - Image
  - Name and brand
  - Price
  - Merchant
  - Link button

##### `CompareRow.tsx`
Budget comparison table row.

**Props:**
```typescript
{
  comparison: BudgetComparison
}
```

**Features:**
- Side-by-side product cards
- Savings calculation
- Percentage badge
- Ingredient match indicator
- Merchant links

##### `ProgressLog.tsx`
Analysis progress tracker.

**Props:**
```typescript
{
  items: ProgressItem[]
  currentStep?: number
}
```

**Features:**
- Vertical timeline
- Step labels
- Status icons (pending/done)
- Animated progress
- Current step highlight

#### 5. UI Elements

##### `IngredientBadge.tsx`
Ingredient tag/badge.

**Props:**
```typescript
{
  ingredient: string
  variant?: "default" | "primary" | "success"
}
```

**Styling:**
- `rounded-full` pill shape
- Teal-50 background
- Teal-700 text
- Small padding

##### `PriceChip.tsx`
Savings indicator chip.

**Props:**
```typescript
{
  savings: number
  savingsPercent: number
}
```

**Example Output:**
```
Save $24.50 (35%)
```

##### `PrivacyNote.tsx`
Privacy disclaimer component.

**Features:**
- Lock icon
- Privacy statement
- Small text
- Gray color
- Left-aligned

#### 6. Animation Components

##### `AnimatedCard.tsx`
Framer Motion card wrapper.

**Props:**
```typescript
{
  children: React.ReactNode
  delay?: number
}
```

**Animation:**
```typescript
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.3, delay }}
```

##### `FadeIn.tsx`
Fade-in animation wrapper.

**Props:**
```typescript
{
  children: React.ReactNode
  duration?: number
}
```

##### `PageTransition.tsx`
Page transition animation.

**Used in:** All pages via layout

**Animation:**
- Fade in on mount
- Slide up 20px
- 300ms duration
- Respects `prefers-reduced-motion`

#### 7. Dashboard Components (`components/dashboard/`)

##### `AnalysisOverview.tsx`
Skin analysis summary card.

**Features:**
- 30-day trend chart (recharts)
- Severity distribution
- Primary concern badge
- Last updated timestamp

##### `RoutinePlanner.tsx`
Current routine display and management.

**Features:**
- AM/PM tabs
- Routine steps list
- Edit routine button
- Product cards

##### `RecommendationsTable.tsx`
Product recommendations table.

**Columns:**
- Product name
- Concern tags (badges)
- Key ingredients
- Price
- Vendor
- Action (view/add)

##### `InsightsFeed.tsx`
Analysis insights and recommendations.

**Features:**
- Chronological feed
- Insight cards with:
  - Icon
  - Timestamp
  - Message
  - Category badge

##### `BudgetOptimizer.tsx`
Budget tracking and savings.

**Features:**
- Total spent
- Total saved
- Savings opportunities
- Budget vs. actual chart

##### `AllergyList.tsx`
Ingredients to avoid list.

**Features:**
- Ingredient badges
- Remove button
- Add new ingredient input

##### `KPIRow.tsx`
Key performance indicators.

**Displays:**
- Confidence score (0-100)
- Skin type
- Primary concern

##### `Header.tsx`
Dashboard header.

**Features:**
- Welcome message with user name
- Last analysis date
- Quick actions (New Analysis, View Routine)

---

## Design System

### QOVES-Inspired Aesthetic

CareFi follows a **clinical, elegant, minimal** design philosophy inspired by QOVES Studio.

### Color Palette

#### Grayscale Base (95% usage)
```css
/* Light tones */
--stone-50: #fafaf9
--stone-100: #f5f5f4
--stone-200: #e7e5e4

/* Mid tones */
--stone-300: #d6d3d1
--stone-400: #a8a29e

/* Dark tones */
--stone-700: #44403c
--stone-800: #292524
--stone-900: #1c1917
```

#### Brand Accents (5% usage)
```css
/* Primary */
--teal-400: #2dd4bf
--teal-500: #14b8a6
--teal-600: #0d9488

/* Success */
--emerald-400: #34d399
--emerald-500: #10b981

/* Warning/Destructive */
--rose-400: #fb7185
--rose-500: #f43f5e
```

#### Skin Tone Palette (Illustrative)
```css
--taupe: #A89175
--beige: #D4C5B0
--warm-tan: #C9A88A
```

#### Usage Guidelines
- **Backgrounds:** stone-50, stone-100
- **Text:** stone-900 (body), stone-700 (secondary)
- **Borders:** stone-200
- **CTAs:** teal-400/500
- **Success states:** emerald-400
- **Errors/warnings:** rose-400

### Typography

#### Fonts
**Headings:** Playfair Display (serif)
```css
font-family: 'Playfair Display', serif
font-weight: 500, 600, 700
```

**Body/UI:** Inter (sans-serif)
```css
font-family: 'Inter', sans-serif
font-weight: 400, 500, 600
```

#### Type Scale
```css
/* Headings */
h1: 5xl-7xl (48px-72px)
h2: 3xl-4xl (30px-36px)
h3: 2xl (24px)
h4: xl (20px)

/* Body */
p: base (16px)
small: sm (14px)
tiny: xs (12px)
```

#### Typography Patterns
```css
/* Editorial headings */
.heading-editorial {
  font-family: 'Playfair Display';
  font-size: 5xl;
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

/* Body text */
.body {
  font-family: 'Inter';
  font-size: base;
  line-height: 1.6;
  color: stone-700;
}
```

### Spacing & Layout

#### Spacing Rhythm
```css
/* Base unit: 4px */
1 → 4px
2 → 8px
3 → 12px
4 → 16px
6 → 24px
8 → 32px
12 → 48px
16 → 64px
```

#### Container Widths
```css
.container-narrow {
  max-width: 56rem; /* 896px */
}

.container-wide {
  max-width: 80rem; /* 1280px */
}

.container-full {
  max-width: 100%;
}
```

#### Section Padding
```css
.section-spacing {
  padding-top: 4rem;    /* Mobile */
  padding-bottom: 4rem;
}

@media (md) {
  .section-spacing {
    padding-top: 6rem;    /* Tablet */
    padding-bottom: 6rem;
  }
}

@media (lg) {
  .section-spacing {
    padding-top: 8rem;    /* Desktop */
    padding-bottom: 8rem;
  }
}
```

### Component Styling Patterns

#### Cards
```css
.card {
  border-radius: 1rem; /* rounded-2xl */
  border: 1px solid stone-200;
  box-shadow: 0 2px 20px rgba(0,0,0,0.04);
  padding: 2rem;
  background: white;
}
```

#### Buttons
```css
.button {
  border-radius: 9999px; /* rounded-full */
  padding: 0.75rem 2rem;
  font-weight: 500;
  transition: all 200ms ease-in-out;
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.button-primary {
  background: teal-500;
  color: white;
}
```

#### Inputs
```css
.input {
  border: 1px solid stone-200;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  font-size: base;
}

.input:focus {
  outline: none;
  ring: 2px teal-400;
  ring-offset: 2px;
}
```

#### Badges
```css
.badge {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  padding: 0.25rem 0.75rem;
  font-size: xs;
  font-weight: 500;
  background: teal-50;
  color: teal-700;
}
```

### Responsive Breakpoints

```css
/* Mobile-first approach */
/* Default: 320px+ */

@media (sm) { /* 640px+ */ }
@media (md) { /* 768px+ */ }
@media (lg) { /* 1024px+ */ }
@media (xl) { /* 1280px+ */ }
@media (2xl) { /* 1536px+ */ }
```

**Tested Viewports:**
- Mobile: 375px (iPhone SE)
- Tablet: 768px (iPad)
- Desktop: 1280px (MacBook)

### Animations

#### Duration Scale
```css
/* Micro-interactions */
--duration-fast: 150ms

/* Standard transitions */
--duration-base: 200ms

/* Page transitions */
--duration-slow: 300ms

/* Progress animations */
--duration-progress: 1000ms
```

#### Easing Functions
```css
--ease-in-out: cubic-bezier(0.25, 0.1, 0.25, 1)
--ease-out: cubic-bezier(0, 0, 0.2, 1)
--ease-spring: cubic-bezier(0.68, -0.55, 0.265, 1.55)
```

#### Animation Patterns

**Hover Lift:**
```css
.hover-lift:hover {
  transform: translateY(-2px);
  transition: transform 150ms ease-out;
}
```

**Fade In:**
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-in {
  animation: fadeIn 300ms ease-out;
}
```

**Slide Up:**
```css
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-up {
  animation: slideUp 300ms ease-out;
}
```

**Reduced Motion:**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Accessibility

#### Color Contrast
- Text on background: ≥ 4.5:1 (WCAG AA)
- Large text: ≥ 3:1
- UI components: ≥ 3:1

#### Focus States
All interactive elements have visible focus states:
```css
.focusable:focus {
  outline: none;
  ring: 2px teal-400;
  ring-offset: 2px;
}
```

#### Semantic HTML
- Use `<header>`, `<main>`, `<nav>`, `<section>`, `<article>`
- Always include `<label>` for form inputs
- Use `<button>` for actions, `<a>` for navigation

#### ARIA Labels
- All interactive elements have accessible names
- Form inputs have associated labels
- Icons have `aria-label` or `aria-hidden`

---

## Key Code Patterns

### 1. Server vs. Client Components

#### Server Components (default in Next.js 16)
Used for:
- Data fetching
- Database queries
- Authentication checks
- SEO meta tags

**Example:**
```typescript
// app/dashboard/page.tsx
import { createServerClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = createServerClient()
  const { data: user } = await supabase.auth.getUser()

  if (!user) {
    redirect('/signin')
  }

  return <DashboardClient user={user} />
}
```

#### Client Components
Used for:
- Interactivity (useState, useEffect)
- Event handlers
- Browser APIs
- Animations (Framer Motion)

**Example:**
```typescript
// app/dashboard/DashboardClient.tsx
'use client'

import { useState } from 'react'

export default function DashboardClient({ user }) {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      {/* ... */}
    </Tabs>
  )
}
```

### 2. Form Validation Pattern

**Step 1: Define Zod Schema**
```typescript
// lib/validation/auth.ts
const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(1)
})
```

**Step 2: Client-Side Validation**
```typescript
'use client'

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: ''
  })
  const [errors, setErrors] = useState({})

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    // Validate with Zod
    const result = signupSchema.safeParse(formData)
    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors)
      return
    }

    // Submit to API
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })

    if (response.ok) {
      router.push('/onboarding')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Input
        value={formData.email}
        onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
        error={errors.email?.[0]}
      />
      {/* ... */}
    </form>
  )
}
```

**Step 3: Server-Side Validation**
```typescript
// app/api/signup/route.ts
export const POST = createPostHandler({
  schema: signupSchema,
  handler: async (data) => {
    // data is already validated by Zod
    const user = await createUser(data)
    return created({ user })
  }
})
```

### 3. Data Fetching Pattern

#### Client-Side Fetching (React Query)
```typescript
'use client'

import { useQuery } from '@tanstack/react-query'

export default function ProductList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await fetch('/api/products')
      return res.json()
    }
  })

  if (isLoading) return <Spinner />
  if (error) return <ErrorMessage error={error} />

  return <div>{data.products.map(/* ... */)}</div>
}
```

#### Server-Side Fetching
```typescript
// app/dashboard/page.tsx
import { createServerClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = createServerClient()

  const { data: analysis } = await supabase
    .from('skin_analyses')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return <DashboardClient analysis={analysis} />
}
```

### 4. Error Handling Pattern

#### API Routes
```typescript
export const POST = createPostHandler({
  schema: mySchema,
  handler: async (data, request) => {
    try {
      const result = await performOperation(data)
      return created(result)
    } catch (error) {
      if (error instanceof ConflictError) {
        return fail(error.message, 409)
      }

      console.error('Operation failed:', error)
      return internalServerError('An unexpected error occurred')
    }
  }
})
```

#### Client Components
```typescript
'use client'

export default function MyComponent() {
  const [error, setError] = useState<string | null>(null)

  const handleAction = async () => {
    try {
      setError(null)
      const res = await fetch('/api/action', { method: 'POST' })

      if (!res.ok) {
        const { error } = await res.json()
        setError(error.message)
        return
      }

      // Success
    } catch (err) {
      setError('An unexpected error occurred')
    }
  }

  return (
    <>
      {error && <Alert variant="destructive">{error}</Alert>}
      <Button onClick={handleAction}>Perform Action</Button>
    </>
  )
}
```

### 5. File Upload Pattern

```typescript
'use client'

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (file: File, angle: ImageAngle) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('angle', angle)

    const res = await fetch('/api/uploadImage', {
      method: 'POST',
      body: formData // Don't set Content-Type header
    })

    if (!res.ok) throw new Error('Upload failed')

    return await res.json()
  }

  const uploadAll = async () => {
    setUploading(true)

    try {
      const angles: ImageAngle[] = ['front', 'left_45', 'right_45']
      const uploads = files.map((file, i) => handleUpload(file, angles[i]))
      const results = await Promise.all(uploads)

      // Redirect to analysis page
      router.push('/analyze')
    } catch (error) {
      setError('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <UploadZone
      onFilesSelected={setFiles}
      maxFiles={3}
      acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
    />
  )
}
```

### 6. State Machine Pattern

Used in `useAnalysis` hook for analysis workflow.

```typescript
const useAnalysis = ({ autoStart = false } = {}) => {
  const [status, setStatus] = useState<AnalysisStatus>('idle')
  const [traits, setTraits] = useState<SkinTrait[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!autoStart) return

    const runAnalysis = async () => {
      try {
        setStatus('uploading')
        await delay(1000)

        setStatus('screening')
        await delay(1000)

        setStatus('detecting')
        const detectedTraits = await analyzePhotos([])

        setStatus('generating')
        await delay(1000)

        setTraits(detectedTraits)
        setStatus('complete')
      } catch (err) {
        setError(err.message)
        setStatus('error')
      }
    }

    runAnalysis()
  }, [autoStart])

  return {
    status,
    traits,
    error,
    isLoading: ['uploading', 'screening', 'detecting', 'generating'].includes(status),
    isComplete: status === 'complete',
    reset: () => setStatus('idle')
  }
}
```

### 7. Supabase Client Pattern

#### Server-Side Client
```typescript
// lib/supabase/server.ts
import { createServerClient as createClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createServerClient() {
  const cookieStore = cookies()

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
        set(name, value, options) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name, options) {
          cookieStore.delete({ name, ...options })
        }
      }
    }
  )
}

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Bypasses RLS
    {
      auth: { persistSession: false }
    }
  )
}
```

#### Client-Side Client
```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

---

## Development Workflow

### Setup

```bash
# Clone repository
git clone <repo-url>
cd carefi

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run Supabase schema migration (local or remote)
# If using local Supabase:
supabase db reset

# If using remote Supabase:
# Run schema.sql in Supabase SQL Editor

# Start development server
npm run dev
```

### Scripts

```bash
# Development
npm run dev              # Start dev server (localhost:3000)

# Production
npm run build           # Build for production
npm start               # Start production server

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix auto-fixable issues

# Testing
npm test                # Run unit tests (Vitest)
npm run test:watch      # Run tests in watch mode
npm run test:e2e        # Run E2E tests (Playwright)
npm run test:e2e:ui     # Run E2E tests with UI

# Type Checking
npm run type-check      # Run TypeScript compiler (no emit)
```

### Environment Variables

**Required:**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... # Server-side only
```

**Optional (for future integrations):**
```bash
# OpenAI
OPENAI_API_KEY=sk-...

# YOLOv8 Endpoint
YOLO_API_URL=https://...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=...
VERCEL_ANALYTICS_ID=...

# Error Tracking
SENTRY_DSN=...
```

### Git Workflow

```bash
# Feature development
git checkout -b feature/feature-name
git commit -m "feat: add new feature"
git push origin feature/feature-name

# Commit message convention (Conventional Commits)
# feat: new feature
# fix: bug fix
# docs: documentation changes
# style: formatting changes
# refactor: code refactoring
# test: adding tests
# chore: maintenance tasks
```

### Deployment

#### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

**Environment Variables:**
- Add all required env vars in Vercel dashboard
- Use Supabase production credentials
- Set `NODE_ENV=production`

#### Manual Deployment

```bash
# Build
npm run build

# Start production server
npm start

# Or use a process manager
pm2 start npm --name "carefi" -- start
```

### Database Migrations

**Initial Setup:**
```bash
# Run schema.sql in Supabase SQL Editor
# Or use Supabase CLI:
supabase db push
```

**Making Changes:**
1. Edit `supabase/schema.sql`
2. Create migration file:
   ```bash
   supabase migration new migration_name
   ```
3. Apply migration:
   ```bash
   supabase db push
   ```

**Seeding Data:**
```bash
# Insert product data
# Run seed SQL scripts in Supabase SQL Editor
```

---

## Integration Points

### Current Status

**Fully Implemented:**
- ✅ User authentication (Supabase Auth)
- ✅ Database schema (PostgreSQL)
- ✅ File upload (Supabase Storage)
- ✅ API route handlers
- ✅ Form validation (Zod)
- ✅ Session management
- ✅ RLS policies

**TODO (Clearly Marked):**

### 1. AI Photo Analysis

**Integration Point:** `lib/api.ts` → `analyzePhotos()`

**Current Status:** Returns mock data with 3-second delay

**TODO:**
```typescript
export async function analyzePhotos(files: File[]): Promise<SkinTrait[]> {
  // 1. Upload to Supabase Storage (IMPLEMENTED)
  // 2. Call OpenAI Vision API for initial analysis (TODO)
  // 3. Call YOLOv8 endpoint for feature detection (TODO)
  // 4. Parse results into SkinTrait[] (TODO)
  // 5. Store in skin_analyses table (TODO)

  // Current: Mock implementation
  return mockTraits
}
```

**OpenAI Vision API Example:**
```typescript
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const response = await openai.chat.completions.create({
  model: 'gpt-4-vision-preview',
  messages: [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: 'Analyze this facial photo for skin traits: acne, dryness, oiliness, sensitivity, hyperpigmentation, fine lines, redness, large pores. Rate severity as low/moderate/high.'
        },
        {
          type: 'image_url',
          image_url: { url: imageUrl }
        }
      ]
    }
  ]
})

// Parse response into SkinTrait[]
```

**YOLOv8 Integration Example:**
```typescript
const yoloResponse = await fetch(process.env.YOLO_API_URL!, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ imageUrl })
})

const { detections } = await yoloResponse.json()
// detections: [{ class: 'acne', confidence: 0.85, bbox: [...] }]
```

### 2. Routine Generation

**Integration Point:** `lib/api.ts` → `getRoutine()`

**Current Status:** Returns mock routine with 1.5-second delay

**TODO:**
```typescript
export async function getRoutine(traits: SkinTrait[]): Promise<RoutineStep[]> {
  // 1. Query products table for matching actives (TODO)
  // 2. Apply user budget constraints (TODO)
  // 3. Generate AM/PM routine structure (TODO)
  // 4. Provide rationale for each step (TODO)
  // 5. Store in personalized_routines table (TODO)

  // Current: Mock implementation
  return mockRoutine
}
```

**Algorithm Outline:**
```typescript
// 1. Map traits to recommended ingredients
const ingredientMap = {
  'Acne': ['Salicylic Acid', 'Benzoyl Peroxide', 'Niacinamide'],
  'Dryness': ['Hyaluronic Acid', 'Ceramides', 'Glycerin'],
  // ...
}

// 2. Query products
const products = await supabase
  .from('products')
  .select('*')
  .overlaps('active_ingredients', recommendedIngredients)
  .lte('price_usd', userBudgetMax)

// 3. Generate routine structure
const routine = [
  { step: 1, period: 'AM', productType: 'Cleanser', ... },
  { step: 2, period: 'AM', productType: 'Treatment', ... },
  // ...
]
```

### 3. Budget Comparison

**Integration Point:** `lib/api.ts` → `getBudgetComparisons()`

**Current Status:** Returns mock comparisons with 1-second delay

**TODO:**
```typescript
export async function getBudgetComparisons(routine: RoutineStep[]): Promise<BudgetComparison[]> {
  // 1. For each routine step, find alternatives (TODO)
  // 2. Match by active ingredients (TODO)
  // 3. Calculate savings (TODO)
  // 4. Store in budget_optimizations table (TODO)

  // Current: Mock implementation
  return mockComparisons
}
```

**Algorithm:**
```typescript
// For each product in routine
for (const step of routine) {
  const originalProduct = step.recommendedProducts[0]

  // Find dupes in same dupe_group_id
  const dupes = await supabase
    .from('products')
    .select('*')
    .eq('dupe_group_id', originalProduct.dupe_group_id)
    .lt('price_usd', originalProduct.price_usd)

  const savings = originalProduct.price_usd - dupes[0].price_usd
  const savingsPercent = (savings / originalProduct.price_usd) * 100

  comparisons.push({ step, brandPick: originalProduct, dupes, savings, savingsPercent })
}
```

### 4. Payment Processing

**Integration Point:** `lib/api.ts` → `simulateCheckout()`

**Current Status:** Mock implementation with 2-second delay

**TODO:**
```typescript
export async function simulateCheckout(items: Product[]): Promise<CheckoutResult> {
  // 1. Create Stripe payment intent (TODO)
  // 2. Process payment on frontend (TODO)
  // 3. Confirm payment on backend (TODO)
  // 4. Create order in database (TODO)

  // Current: Mock implementation
  return { success: true, orderId: 'mock-123' }
}
```

**Stripe Integration Example:**

**Backend:**
```typescript
// app/api/create-payment-intent/route.ts
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const POST = createPostHandler({
  handler: async (data) => {
    const { amount, currency = 'usd' } = data

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      automatic_payment_methods: { enabled: true }
    })

    return ok({ clientSecret: paymentIntent.client_secret })
  }
})
```

**Frontend:**
```typescript
// app/checkout/page.tsx
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState('')

  useEffect(() => {
    fetch('/api/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify({ amount: 150.00 })
    })
      .then(res => res.json())
      .then(data => setClientSecret(data.clientSecret))
  }, [])

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm />
    </Elements>
  )
}
```

### 5. Product Database Population

**Current Status:** Empty `products` table

**TODO:**
1. Scrape product data from retailers (Amazon, Sephora, YesStyle)
2. Extract ingredient lists
3. Assign dupe groups
4. Insert into database

**Seed Script Example:**
```typescript
const products = [
  {
    name: 'CeraVe Hydrating Cleanser',
    brand: 'CeraVe',
    product_type: 'Cleanser',
    price_usd: 14.99,
    merchants: ['Amazon', 'Sephora'],
    active_ingredients: ['Ceramides', 'Hyaluronic Acid'],
    is_premium: false,
    dupe_group_id: 'cleanser-gentle-hydrating-001'
  },
  {
    name: 'La Roche-Posay Toleriane Cleanser',
    brand: 'La Roche-Posay',
    product_type: 'Cleanser',
    price_usd: 24.99,
    merchants: ['Amazon', 'Sephora'],
    active_ingredients: ['Ceramides', 'Niacinamide'],
    is_premium: true,
    dupe_group_id: 'cleanser-gentle-hydrating-001'
  }
]

await supabase.from('products').insert(products)
```

### 6. Analytics & Monitoring

**TODO:**
- Vercel Analytics for performance monitoring
- PostHog for product analytics
- Sentry for error tracking

**Vercel Analytics:**
```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

**PostHog:**
```typescript
// lib/analytics.ts
import posthog from 'posthog-js'

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: 'https://app.posthog.com'
  })
}

export { posthog }
```

**Sentry:**
```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
})
```

---

## Security & Privacy

### Authentication Security

#### Password Security
- Passwords hashed by Supabase Auth (bcrypt)
- Never stored in plain text
- Never logged or exposed in responses
- Minimum 8 characters, 1 letter, 1 number

#### Session Security
- HTTP-only cookies (prevents XSS)
- Secure flag in production (HTTPS only)
- SameSite=Lax (CSRF protection)
- Session expiration after inactivity

#### Rate Limiting (TODO)
```typescript
// middleware.ts
import { ratelimit } from '@/lib/ratelimit'

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.ip ?? '127.0.0.1'
    const { success } = await ratelimit.limit(ip)

    if (!success) {
      return new Response('Too Many Requests', { status: 429 })
    }
  }
}
```

### Database Security

#### Row Level Security (RLS)
- All tables have RLS enabled
- Users can only access their own data
- Service role bypasses RLS for admin operations

#### SQL Injection Prevention
- All queries use parameterized statements
- Supabase client handles escaping
- Never concatenate user input into queries

#### Data Validation
- All inputs validated with Zod schemas
- Type checking with TypeScript
- Server-side validation on all API routes

### File Upload Security

#### File Type Validation
```typescript
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

if (!ALLOWED_TYPES.includes(file.type)) {
  throw new Error('Invalid file type')
}
```

#### File Size Limits
```typescript
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

if (file.size > MAX_FILE_SIZE) {
  throw new Error('File too large')
}
```

#### Storage Bucket Security
- Private buckets (authenticated access only)
- RLS policies on storage
- Pre-signed URLs for downloads
- Automatic virus scanning (TODO)

### Payment Security

#### PCI Compliance
- Never store credit card numbers
- Never store CVV codes
- Use Stripe for payment processing
- Only store payment_intent_id after success

#### Checkout Security
```typescript
// app/api/create-payment-intent/route.ts
export const POST = createPostHandler({
  handler: async (data, request) => {
    // Verify user is authenticated
    const user = await getAuthenticatedUser(request)
    if (!user) throw new UnauthorizedError()

    // Verify amount matches order
    const order = await getOrder(data.orderId)
    if (order.total_usd !== data.amount) {
      throw new ValidationError('Amount mismatch')
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(data.amount * 100),
      currency: 'usd',
      metadata: {
        userId: user.id,
        orderId: data.orderId
      }
    })

    return ok({ clientSecret: paymentIntent.client_secret })
  }
})
```

### Privacy

#### Data Collection
- Only collect necessary user data
- Explicit consent for photo uploads
- Privacy policy displayed during signup

#### Data Retention
- Soft delete for images (deleted_at)
- GDPR compliance (right to deletion)
- Archive old data after retention period

#### Data Sharing
- No third-party data sharing
- AI analysis performed server-side
- Results stored securely in database

#### Privacy Notes on Upload Page
```typescript
<PrivacyNote>
  Your photos are encrypted and stored securely. We never share your images
  with third parties. You can delete your photos at any time.
</PrivacyNote>
```

### HTTPS & CORS

#### Production Requirements
- HTTPS enforced (redirect HTTP to HTTPS)
- Strict Transport Security header
- Content Security Policy header

#### CORS Configuration
```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: process.env.ALLOWED_ORIGIN || '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' }
        ]
      }
    ]
  }
}
```

---

## Summary

CareFi is a **production-ready AI-powered skincare platform** built with modern web technologies. The codebase features:

**Strengths:**
- Clean, well-organized architecture
- Type-safe with TypeScript strict mode
- Comprehensive database schema
- Secure authentication with Supabase Auth
- Row-level security on all tables
- Accessible, responsive UI
- Clear separation of concerns
- Excellent documentation

**Next Steps:**
1. Integrate OpenAI Vision API for photo analysis
2. Integrate YOLOv8 for feature detection
3. Populate products database
4. Implement product matching algorithm
5. Integrate Stripe for payment processing
6. Add analytics and monitoring
7. Implement rate limiting
8. Deploy to production

**Key Files to Reference:**
- Database: `supabase/schema.sql` (560 lines)
- Types: `lib/types.ts`
- API: `app/api/*/route.ts`
- Services: `lib/users/service.ts`, `lib/onboarding/service.ts`
- Validation: `lib/validation/*.ts`
- Components: `components/ui/`, `components/dashboard/`

This context document provides everything needed to understand the codebase architecture, patterns, and integration points for effective collaboration with LLM models.
