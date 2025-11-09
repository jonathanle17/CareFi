export type Product = {
  id: string;
  name: string;
  brand: string;
  price: number;
  merchants: ("Amazon" | "YesStyle" | "Sephora")[];
  actives: string[];
  link?: string;
  imageUrl?: string;
};

export type SkinTrait = {
  id: string;
  name: string;
  severity: "low" | "moderate" | "high";
  description: string;
};

export type RoutineStep = {
  step: number;
  period: "AM" | "PM";
  productType: string;
  actives: string[];
  rationale: string;
  recommendedProducts: Product[];
};

export type AnalysisStatus = "idle" | "uploading" | "screening" | "detecting" | "generating" | "complete" | "error";

export type ProgressItem = {
  label: string;
  status: "pending" | "done";
};

export type BudgetComparison = {
  step: string;
  brandPick: Product;
  dupes: Product[];
  savings: number;
  savingsPercent: number;
};

// ============================================================================
// DASHBOARD TYPES
// ============================================================================

export type OnboardingRow = {
  id: string;
  user_id: string;
  skin_concerns: string[];
  skin_goals: string[];
  current_routine: string | null;
  ingredients_to_avoid: string | null;
  ingredients_to_avoid_array: string[];
  budget_min_usd: number;
  budget_max_usd: number;
  created_at: string;
  updated_at: string;
};

export type AnalysisPoint = {
  date: string;
  acne: number;
  dryness: number;
  pigmentation: number;
};

export type AnalysisSummary = {
  user_id: string;
  skin_type: 'oily' | 'dry' | 'combination' | 'normal' | 'sensitive';
  confidence: number; // 0..1
  primary_concern: string;
  updatedAt: string;
  series: AnalysisPoint[];
  notes: string[];
  modelVersion: string;
};

export type Recommendation = {
  id: string;
  name: string;
  concern_tags: string[];
  key_ingredients: string[];
  price_usd: number;
  retail_usd: number;
  vendor: 'amazon' | 'yesstyle' | 'sephora';
  url: string;
};

// Storage types
export type ImageAngle = 'front' | 'left_45' | 'right_45';

export interface UploadImageResponse {
  success: boolean;
  data: {
    storageUrl: string;
    path: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    angle: ImageAngle;
  };
}
