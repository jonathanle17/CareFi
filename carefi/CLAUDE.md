# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev              # Start dev server (localhost:3000)
npm run build           # Production build
npm start               # Start production server
npm run lint            # Run ESLint
```

## Architecture

**CareFi** is a Next.js 16 App Router application for AI-powered skin analysis and personalized skincare recommendations. The entire UI/UX is production-ready with complete user flows; all backend integrations are currently **stub implementations** waiting for real APIs.

### Tech Stack
- Next.js 16.0.1 (App Router, client-side rendered with `"use client"`)
- React 19.2.0 + TypeScript 5 (strict mode)
- Tailwind CSS v4 + shadcn/ui (Radix UI primitives)
- Framer Motion 12.23.24 for animations
- Path alias: `@/*` → `./` (from root)

### Project Structure

```
carefi/
├── app/                    # Next.js App Router pages (8 pages)
│   ├── page.tsx           # Landing page
│   ├── onboarding/        # 5-step questionnaire
│   ├── upload/            # Photo uploader (3 photos max)
│   ├── analyze/           # AI progress animation + results
│   ├── routine/           # AM/PM personalized routine (tab UI)
│   ├── budget/            # Price comparison table
│   ├── checkout/          # Stripe-style test payment
│   └── summary/           # Complete plan recap
├── components/
│   ├── ui/                # shadcn/ui components (button, card, input, etc.)
│   └── *.tsx              # Custom domain components (25+)
├── lib/
│   ├── api.ts             # Stub API functions (analyzePhotos, getRoutine, etc.)
│   ├── types.ts           # Core type definitions
│   └── utils.ts           # Utility functions (cn, etc.)
├── hooks/
│   └── useAnalysis.ts     # Analysis state machine hook
└── data/
    ├── products.json      # Mock product database
    └── routine.json       # Mock routine structure
```

### 8-Page User Journey

1. **/** - Landing page with hero, value props, CTA
2. **/onboarding** - Multi-step form (concerns → goals → routine → allergies → budget)
3. **/upload** - Drag-and-drop uploader with client-side validation
4. **/analyze** - Real-time progress animation (screening → detecting → generating)
5. **/routine** - Tabbed AM/PM routine cards with ingredient explanations
6. **/budget** - Comparison table with savings calculator
7. **/checkout** - Test payment form (Stripe-style UI)
8. **/summary** - Complete recap with 30-day introduction schedule

All pages use `"use client"` and handle state with React hooks. No server components or server actions currently.

## Key Patterns

### Component Architecture

**shadcn/ui pattern**: All UI primitives in `components/ui/` are Radix UI wrapped with Tailwind variants using `class-variance-authority`. Never edit these directly; regenerate with shadcn CLI if needed.

**Custom components**: Domain-specific components are in `components/` root:
- `SectionHeading` - Eyebrow + title + subtitle pattern (used on every page)
- `RoutineCard`, `CompareRow`, `ProgressLog` - Core domain components
- `AnimatedCard`, `FadeIn`, `PageTransition` - Framer Motion wrappers
- `UploadZone` - Drag-and-drop with preview (max 3 files)

### State Management

No global state library (Redux/Zustand). State is managed with:
- React hooks (`useState`, `useContext`)
- Custom hooks (`useAnalysis` for analysis workflow)
- `useRouter` from `next/navigation` for client-side navigation

### Animation Patterns

**Framer Motion**: Used for page transitions and card animations
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
```

**CSS Keyframes**: Defined in `globals.css` for drift, float, fadeIn animations. All animations respect `prefers-reduced-motion`.

### Form Validation

All forms use controlled inputs with inline validation:
```tsx
const [email, setEmail] = useState('')
const [emailError, setEmailError] = useState('')

const validateEmail = (email: string): boolean => {
  // Validation logic
  setEmailError('...')
  return isValid
}
```

No form library (React Hook Form, Formik) currently used.

## Type System

**Core types** in `lib/types.ts`:

```typescript
Product              # name, brand, price, merchants[], actives[], links
SkinTrait           # id, name, severity (low/moderate/high), description
RoutineStep         # step, period (AM/PM), productType, actives[], rationale
BudgetComparison    # step, brandPick, dupes, savings calculations
AnalysisStatus      # idle | uploading | screening | detecting | generating | complete | error
```

All API functions in `lib/api.ts` are typed with these interfaces. When replacing stubs with real backend calls, maintain these type signatures.

## Backend Integration Status

**Current state**: All API functions in `lib/api.ts` return mock data with simulated delays.

**Integration points** to replace:

1. **`analyzePhotos(files: File[])`** - Upload to Supabase Storage → OpenAI Vision API → YOLOv8 → return SkinTrait[]
2. **`getRoutine(traits: SkinTrait[])`** - Query product DB → match to budget → return RoutineStep[]
3. **`getBudgetComparisons(routine: RoutineStep[])`** - Find alternatives → calculate savings → return BudgetComparison[]
4. **`simulateCheckout(items: Product[])`** - Replace with Stripe payment intent flow

**Recommended backend stack** (from README):
- Supabase: file storage, database, auth
- OpenAI Vision API: photo analysis
- YOLOv8: feature detection
- Stripe: payment processing

**Environment variables** needed:
```bash
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY  # For server-side operations
NEXT_PUBLIC_SUPABASE_ANON_KEY  # For client-side (if needed)
OPENAI_API_KEY
YOLO_API_URL
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
```

Currently using `.env` with Supabase credentials only.

## Design System (QOVES-inspired)

### Colors
- **Grayscale base**: stone-50, stone-100, stone-200, stone-700, stone-900
- **Brand accents**: teal-400 (primary CTA), emerald-400 (success), rose-400 (destructive)
- **Skin-tone palette**: #A89175 (taupe), #D4C5B0 (beige), #C9A88A (warm tan)
- **Usage**: Predominantly grayscale with accent colors for key actions only

### Typography
- **Headings**: Playfair Display (serif, editorial, large 5xl-7xl with tight tracking)
- **Body/UI**: Inter (sans-serif, clean, readable)
- **Font loading**: `next/font/google` with display swap

### Spacing & Layout
- **Rhythm**: 8/12/16/24/32 grid units
- **Containers**: `container-narrow` (max-w-4xl), `container-wide` (max-w-7xl)
- **Section padding**: `section-spacing` class (py-16 md:py-24 lg:py-32)

### Component Styling
- **Cards**: `rounded-2xl` corners, `shadow-soft` (subtle 0 2px 20px rgba)
- **Borders**: `hairline` class (1px stone-200)
- **Transitions**: 150-200ms ease-in-out
- **Focus states**: Always visible with teal-400 ring

### Responsive Breakpoints
- Mobile-first approach
- Tested at: 375px (mobile), 768px (tablet), 1280px (desktop)

## Accessibility

All pages follow strict accessibility guidelines:
- Semantic HTML5 (header, main, section, article)
- ARIA labels on all interactive elements
- Keyboard navigation support (focus management in multi-step forms)
- Color contrast ≥ 4.5:1 (WCAG AA)
- `prefers-reduced-motion` respected in all animations

## Performance Targets

- Lighthouse Performance: 95+
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Cumulative Layout Shift: < 0.1

**Optimizations included**:
- `next/image` for all images
- Font optimization with `next/font`
- Tailwind JIT compilation
- Lazy loading for images and heavy components

## Notes

- **No testing framework** currently configured. Recommended: Vitest + Testing Library
- **No authentication** implemented yet. Forms are client-side only.
- **No error boundaries** for production error handling
- **No analytics** configured (consider Vercel Analytics, PostHog)
- **All pages are client components** (`"use client"`) - no server-side data fetching yet
- **Database schema** not defined. Supabase tables need to be created for users, analyses, products, routines, orders.

When adding backend APIs, create `app/api/` routes and replace client-side API calls in `lib/api.ts` with fetch calls to these endpoints.
