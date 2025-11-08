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
