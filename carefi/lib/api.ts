import type { SkinTrait, RoutineStep, BudgetComparison, Product } from "./types";

/**
 * Stub API functions for DermaFi
 * TODO: Replace with actual API calls to OpenAI Vision + YOLOv8 + Supabase backend
 */

export async function analyzePhotos(files: File[]): Promise<{
  traits: SkinTrait[];
  success: boolean;
}> {
  // TODO: Upload photos to Supabase storage
  // TODO: Call OpenAI Vision API for analysis
  // TODO: Call YOLOv8 for feature detection

  await new Promise((resolve) => setTimeout(resolve, 3000)); // Simulate API delay

  return {
    success: true,
    traits: [
      {
        id: "oily",
        name: "Oily",
        severity: "moderate",
        description: "Excess sebum production detected in T-zone",
      },
      {
        id: "sensitive",
        name: "Sensitive",
        severity: "moderate",
        description: "Signs of reactivity and potential inflammation",
      },
      {
        id: "acne",
        name: "Moderate acne",
        severity: "moderate",
        description: "Active breakouts and comedones present",
      },
      {
        id: "pih",
        name: "PIH risk",
        severity: "low",
        description: "Post-inflammatory hyperpigmentation potential",
      },
    ],
  };
}

export async function getRoutine(traits: SkinTrait[]): Promise<RoutineStep[]> {
  // TODO: Generate personalized routine based on detected traits
  // TODO: Query product database for recommendations

  await new Promise((resolve) => setTimeout(resolve, 1500));

  return [
    {
      step: 1,
      period: "AM",
      productType: "Cleanser",
      actives: ["Salicylic Acid"],
      rationale: "Gentle exfoliation to control oil and prevent breakouts without over-stripping skin.",
      recommendedProducts: [],
    },
    {
      step: 2,
      period: "AM",
      productType: "Toner",
      actives: ["Niacinamide", "Centella Asiatica"],
      rationale: "Soothing hydration that reduces inflammation and balances oil production.",
      recommendedProducts: [],
    },
    {
      step: 3,
      period: "AM",
      productType: "Moisturizer",
      actives: ["Ceramides", "Hyaluronic Acid"],
      rationale: "Lightweight hydration to strengthen barrier without clogging pores.",
      recommendedProducts: [],
    },
    {
      step: 4,
      period: "AM",
      productType: "Sunscreen",
      actives: ["Zinc Oxide"],
      rationale: "Mineral protection that won't irritate sensitive, acne-prone skin.",
      recommendedProducts: [],
    },
    {
      step: 1,
      period: "PM",
      productType: "Oil Cleanser",
      actives: ["Jojoba Oil"],
      rationale: "Dissolves sebum and makeup without disrupting skin barrier.",
      recommendedProducts: [],
    },
    {
      step: 2,
      period: "PM",
      productType: "Cleanser",
      actives: ["Salicylic Acid"],
      rationale: "Second cleanse to thoroughly remove impurities and exfoliate.",
      recommendedProducts: [],
    },
    {
      step: 3,
      period: "PM",
      productType: "Treatment",
      actives: ["Azelaic Acid"],
      rationale: "Multi-tasking active that targets acne, redness, and PIH simultaneously.",
      recommendedProducts: [],
    },
    {
      step: 4,
      period: "PM",
      productType: "Moisturizer",
      actives: ["Ceramides", "Centella Asiatica"],
      rationale: "Reparative hydration to support overnight skin recovery.",
      recommendedProducts: [],
    },
  ];
}

export async function getBudgetComparisons(routine: RoutineStep[]): Promise<BudgetComparison[]> {
  // TODO: Query product database for price comparisons
  // TODO: Match actives to find budget alternatives

  await new Promise((resolve) => setTimeout(resolve, 1000));

  return [
    {
      step: "AM Moisturizer",
      brandPick: {
        id: "cerave-am",
        name: "CeraVe AM Facial Moisturizing Lotion SPF 30",
        brand: "CeraVe",
        price: 15.99,
        merchants: ["Amazon", "Sephora"],
        actives: ["Ceramides", "Hyaluronic Acid", "Niacinamide"],
      },
      dupes: [
        {
          id: "cetaphil-daily",
          name: "Cetaphil Daily Hydrating Lotion",
          brand: "Cetaphil",
          price: 12.49,
          merchants: ["Amazon"],
          actives: ["Hyaluronic Acid", "Glycerin"],
        },
      ],
      savings: 3.5,
      savingsPercent: 22,
    },
    {
      step: "PM Treatment",
      brandPick: {
        id: "pc-azelaic",
        name: "Paula's Choice 10% Azelaic Acid Booster",
        brand: "Paula's Choice",
        price: 39.0,
        merchants: ["Sephora"],
        actives: ["Azelaic Acid", "Salicylic Acid"],
      },
      dupes: [
        {
          id: "ordinary-azelaic",
          name: "The Ordinary Azelaic Acid Suspension 10%",
          brand: "The Ordinary",
          price: 12.0,
          merchants: ["Sephora"],
          actives: ["Azelaic Acid"],
        },
      ],
      savings: 27.0,
      savingsPercent: 69,
    },
  ];
}

export async function simulateCheckout(items: Product[]): Promise<{
  success: boolean;
  orderId?: string;
  message: string;
}> {
  // TODO: Integrate with actual payment processor (Stripe)

  await new Promise((resolve) => setTimeout(resolve, 2000));

  return {
    success: true,
    orderId: `ORDER-${Date.now()}`,
    message: "Test payment successful! No actual charge was made.",
  };
}
