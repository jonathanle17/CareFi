# CareFi - AI Dermatology Assistant

A production-ready Next.js application for AI-powered skin analysis and personalized skincare routine recommendations with budget optimization.

## 🎨 Design Philosophy

DermaFi follows a **QOVES-inspired aesthetic**:
- Clinical, elegant, minimal design
- Editorial typography with Playfair Display (headings) and Inter (body)
- Generous whitespace and grayscale palette
- Subtle micro-interactions and premium feel
- Accessibility-first approach

## 🚀 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Components:** shadcn/ui
- **Icons:** lucide-react
- **Animations:** Framer Motion
- **Fonts:** Google Fonts (Inter, Playfair Display)

## 📁 Project Structure

```
carefi/
├── app/                      # Next.js app router pages
│   ├── page.tsx             # Landing page
│   ├── onboarding/          # Skin questionnaire
│   ├── upload/              # Photo upload
│   ├── analyze/             # AI analysis progress
│   ├── routine/             # Personalized routine
│   ├── budget/              # Price comparison
│   ├── checkout/            # Test checkout flow
│   └── summary/             # Plan summary
├── components/              # Reusable components
│   ├── ui/                  # shadcn/ui components
│   ├── SectionHeading.tsx   # Page section headers
│   ├── PrimaryCTA.tsx       # Call-to-action buttons
│   ├── UploadZone.tsx       # Drag-and-drop file uploader
│   ├── RoutineCard.tsx      # Skincare step cards
│   ├── CompareRow.tsx       # Price comparison rows
│   ├── ProgressLog.tsx      # Analysis progress
│   ├── IngredientBadge.tsx  # Active ingredient tags
│   ├── PriceChip.tsx        # Savings indicator
│   ├── PrivacyNote.tsx      # Data privacy message
│   ├── StepCard.tsx         # Multi-step form cards
│   ├── AnimatedCard.tsx     # Framer Motion card wrapper
│   ├── FadeIn.tsx           # Fade-in animation wrapper
│   └── PageTransition.tsx   # Page transition wrapper
├── lib/
│   ├── api.ts               # API stub functions
│   ├── types.ts             # TypeScript type definitions
│   └── utils.ts             # Utility functions
├── hooks/
│   └── useAnalysis.ts       # Analysis state hook
├── data/
│   ├── products.json        # Product database seed
│   └── routine.json         # Routine structure seed
└── styles/
    └── globals.css          # Global styles & Tailwind config
```

## 🎯 User Flow

1. **Landing (/)** - Hero, value props, how it works, social proof
2. **Onboarding (/onboarding)** - 5-step questionnaire (concerns, goals, routine, allergies, budget)
3. **Upload (/upload)** - 3-photo uploader with validation and tips
4. **Analyze (/analyze)** - Real-time progress animation + AI detection results
5. **Routine (/routine)** - AM/PM personalized steps with ingredient explanations
6. **Budget (/budget)** - Price comparison with budget-friendly alternatives
7. **Checkout (/checkout)** - Stripe-style test payment flow
8. **Summary (/summary)** - Complete plan recap with 30-day schedule

## 🛠️ Setup

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 🔌 Backend Integration TODOs

The UI is fully functional with stub data. To connect to your backend:

### 1. Photo Upload & Storage

**File:** `lib/api.ts` → `analyzePhotos()`

```typescript
// TODO: Replace with actual implementation
export async function analyzePhotos(files: File[]) {
  // 1. Upload to Supabase Storage
  // 2. Call OpenAI Vision API for initial analysis
  // 3. Call YOLOv8 endpoint for feature detection
  // 4. Store results in Supabase database
  return { success: true, traits: [...] }
}
```

### 2. Routine Generation

**File:** `lib/api.ts` → `getRoutine()`

```typescript
// TODO: Replace with actual implementation
export async function getRoutine(traits: SkinTrait[]) {
  // 1. Query product database based on detected traits
  // 2. Generate personalized AM/PM routine
  // 3. Match products to user's budget range
  return [...]
}
```

### 3. Budget Comparisons

**File:** `lib/api.ts` → `getBudgetComparisons()`

```typescript
// TODO: Replace with actual implementation
export async function getBudgetComparisons(routine: RoutineStep[]) {
  // 1. Query product database for alternatives
  // 2. Match active ingredients
  // 3. Calculate savings
  return [...]
}
```

### 4. Payment Processing

**File:** `lib/api.ts` → `simulateCheckout()`

```typescript
// TODO: Replace with Stripe integration
export async function simulateCheckout(items: Product[]) {
  // 1. Create Stripe payment intent
  // 2. Process payment
  // 3. Store order in database
  return { success: true, orderId: '...' }
}
```

### 5. Database Schema

Recommended Supabase tables:

- `users` - User accounts
- `analyses` - Stored skin analysis results
- `products` - Skincare product catalog
- `routines` - Generated routines
- `orders` - Purchase history

## 🎨 Design System

### Colors

- **Base:** stone-50, stone-100, stone-700, stone-900
- **Accent:** teal-400 (primary), emerald-400 (success), rose-400 (warning)
- **Usage:** Mostly grayscale with accent colors for key actions

### Typography

- **Headings:** Playfair Display (serif, editorial)
- **Body/UI:** Inter (sans-serif, clean)
- **Scale:** Large editorial headings (5xl-7xl) with tight tracking

### Spacing

- Rhythm: 8/12/16/24/32 grid units
- Section padding: `section-spacing` class (py-16 md:py-24 lg:py-32)
- Container widths: `container-narrow` (max-w-4xl), `container-wide` (max-w-7xl)

### Components

All components use:
- Rounded corners: `rounded-2xl` for cards
- Borders: `hairline` class (1px stone-200)
- Shadows: `shadow-soft` (0 2px 20px rgba(0,0,0,0.04))
- Transitions: 150-200ms ease-in-out

## ♿ Accessibility

- ✅ Semantic HTML5 elements
- ✅ ARIA labels on all interactive elements
- ✅ Keyboard navigation support
- ✅ Focus states on all focusable elements
- ✅ Color contrast ≥ 4.5:1 (WCAG AA)
- ✅ `prefers-reduced-motion` support
- ✅ Screen reader friendly

## 📱 Responsive Design

Tested breakpoints:
- Mobile: 375px
- Tablet: 768px
- Desktop: 1280px

All pages are fully responsive with mobile-first approach.

## 🚢 Production Checklist

Before deploying:

- [ ] Replace all API stubs with real endpoints
- [ ] Set up environment variables for API keys
- [ ] Configure Supabase project
- [ ] Set up Stripe account (live keys)
- [ ] Add proper error handling and loading states
- [ ] Implement analytics (Vercel Analytics, PostHog, etc.)
- [ ] Add SEO meta tags per page
- [ ] Test Lighthouse scores (target: 95+)
- [ ] Set up monitoring and error tracking (Sentry)
- [ ] Configure CORS and CSP headers
- [ ] Add rate limiting for API routes
- [ ] Implement user authentication

## 🔐 Environment Variables

Create `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI
OPENAI_API_KEY=your_openai_key

# YOLOv8 Endpoint
YOLO_API_URL=your_yolo_endpoint

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_pk
STRIPE_SECRET_KEY=your_stripe_sk
```

## 📊 Performance

Current setup targets:
- **Lighthouse Performance:** 95+
- **First Contentful Paint:** < 1.5s
- **Time to Interactive:** < 3.5s
- **Cumulative Layout Shift:** < 0.1

Optimizations included:
- Next.js Image optimization
- Font optimization with `next/font`
- CSS-in-JS with Tailwind JIT
- Code splitting with dynamic imports
- Lazy loading for images

## 🧪 Testing

Recommended testing setup:

```bash
# Install testing dependencies
npm install -D @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom

# Run tests
npm test
```

## 📝 License

MIT

## 🤝 Contributing

This is a client project. For questions or modifications, contact the development team.

---

**Built with ❤️ using Next.js, Tailwind CSS, and shadcn/ui**
