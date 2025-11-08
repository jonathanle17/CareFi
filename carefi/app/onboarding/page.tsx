"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SectionHeading } from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, X } from "lucide-react";

const CONCERNS = [
  "Acne",
  "Dryness",
  "Oiliness",
  "Sensitivity",
  "Hyperpigmentation",
  "Fine lines",
  "Redness",
  "Large pores",
];

const GOALS = [
  "Clear skin",
  "Even tone",
  "Hydration",
  "Anti-aging",
  "Oil control",
  "Calming",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    concerns: [] as string[],
    goals: [] as string[],
    currentRoutine: "",
    irritants: "",
    budgetMin: "20",
    budgetMax: "100",
  });
  const [budgetMinError, setBudgetMinError] = useState<string>("");
  const [budgetMaxError, setBudgetMaxError] = useState<string>("");

  const toggleSelection = (field: "concerns" | "goals", value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    } else {
      router.push("/upload");
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const validateBudgetMin = (min: string, max: string) => {
    const minNum = parseFloat(min);
    const maxNum = parseFloat(max);
    
    if (isNaN(minNum) || minNum < 1) {
      setBudgetMinError("Minimum must be at least $1");
      return false;
    }
    
    if (!isNaN(maxNum) && minNum > maxNum) {
      setBudgetMinError("Minimum cannot exceed maximum");
      return false;
    }
    
    setBudgetMinError("");
    return true;
  };

  const validateBudgetMax = (min: string, max: string) => {
    const minNum = parseFloat(min);
    const maxNum = parseFloat(max);
    
    if (max && (!isNaN(maxNum) && maxNum < minNum)) {
      setBudgetMaxError("Maximum cannot be less than minimum");
      return false;
    }
    
    setBudgetMaxError("");
    return true;
  };

  const canProceed = () => {
    if (currentStep === 0) return formData.concerns.length > 0;
    if (currentStep === 1) return formData.goals.length > 0;
    if (currentStep === 4) {
      const minNum = parseFloat(formData.budgetMin);
      const maxNum = parseFloat(formData.budgetMax);
      return (
        !isNaN(minNum) &&
        minNum >= 1 &&
        !isNaN(maxNum) &&
        minNum <= maxNum &&
        budgetMinError === "" &&
        budgetMaxError === ""
      );
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container-narrow">
        {/* Exit button */}
        <div className="flex justify-end mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className="text-gray-600 hover:text-gray-900"
          >
            <X className="w-5 h-5" />
            <span className="sr-only">Exit</span>
          </Button>
        </div>
        {/* Header */}
        <div className="mb-12 text-center">
          <SectionHeading
            eyebrow="Step 1 of 3"
            title="Tell us about your skin"
            subtitle="Answer a few questions to personalize your analysis and routine."
            align="center"
          />
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {[0, 1, 2, 3, 4].map((index) => (
              <div
                key={index}
                className={`flex-1 h-2.5 rounded-full ${
                  index <= currentStep ? "bg-[#4d688a]" : "bg-gray-200"
                } ${index < 4 ? "mr-2" : ""}`}
              />
            ))}
          </div>
        </div>

        {/* Form Card */}
        <Card className="p-8 md:p-12">
          {/* Step 0: Concerns */}
          {currentStep === 0 && (
            <div className="space-y-5">
              <div className="space-y-2.5 min-h-[80px]">
                <h3 className="text-3xl font-display font-medium text-gray-900">
                  What are your main skin concerns?
                </h3>
                <p className="text-gray-600">Select all that apply</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {CONCERNS.map((concern) => (
                  <button
                    key={concern}
                    onClick={() => toggleSelection("concerns", concern)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-sm font-medium ${
                      formData.concerns.includes(concern)
                        ? "border-[#4d688a] bg-[#4d688a] text-white"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {concern}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Goals */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div className="space-y-2.5 min-h-[80px]">
                <h3 className="text-3xl font-display font-medium text-gray-900">
                  What do you want to improve?
                </h3>
                <p className="text-gray-600">Choose your top priorities</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {GOALS.map((goal) => (
                  <button
                    key={goal}
                    onClick={() => toggleSelection("goals", goal)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-sm font-medium ${
                      formData.goals.includes(goal)
                        ? "border-[#4d688a] bg-[#4d688a] text-white"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Current routine */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div className="space-y-2.5 min-h-[80px]">
                <h3 className="text-3xl font-display font-medium text-gray-900">
                  Tell us about your current routine
                </h3>
                <p className="text-gray-600">
                  List the products you currently use (AM and PM)
                </p>
              </div>
              <Textarea
                placeholder="e.g., AM: CeraVe Cleanser, The Ordinary Niacinamide, EltaMD Sunscreen&#10;PM: Banila Co Oil Cleanser, CeraVe Cleanser, Paula's Choice BHA, CeraVe Moisturizer"
                value={formData.currentRoutine}
                onChange={(e) =>
                  setFormData({ ...formData, currentRoutine: e.target.value })
                }
                className="min-h-[160px] resize-none"
              />
              <p className="text-xs text-gray-500">
                Optional—but helps us understand what's working for you
              </p>
            </div>
          )}

          {/* Step 3: Avoid */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div className="space-y-2.5 min-h-[80px]">
                <h3 className="text-3xl font-display font-medium text-gray-900">
                  Any ingredients to avoid?
                </h3>
                <p className="text-gray-600">
                  List any known irritants or allergies
                </p>
              </div>
              <Textarea
                placeholder="e.g., fragrance, essential oils, denatured alcohol, retinol"
                value={formData.irritants}
                onChange={(e) =>
                  setFormData({ ...formData, irritants: e.target.value })
                }
                className="min-h-[120px] resize-none"
              />
              <p className="text-xs text-gray-500">
                We'll filter these out of your recommendations
              </p>
            </div>
          )}

          {/* Step 4: Budget */}
          {currentStep === 4 && (
            <div className="space-y-5">
              <div className="space-y-2.5 min-h-[80px]">
                <h3 className="text-3xl font-display font-medium text-gray-900">
                  What's your monthly budget?
                </h3>
                <p className="text-gray-600">
                  We'll optimize your routine to stay within range
                </p>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.budgetMin}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData({ ...formData, budgetMin: value });
                        if (value) {
                          validateBudgetMin(value, formData.budgetMax);
                          validateBudgetMax(value, formData.budgetMax);
                        } else {
                          setBudgetMinError("");
                        }
                      }}
                      placeholder="20"
                      className={`w-full ${budgetMinError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                    />
                    {budgetMinError && (
                      <p className="text-sm text-red-600 mt-1">{budgetMinError}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum
                    </label>
                    <Input
                      type="number"
                      value={formData.budgetMax}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData({ ...formData, budgetMax: value });
                        if (value) {
                          validateBudgetMax(formData.budgetMin, value);
                          validateBudgetMin(formData.budgetMin, value);
                        } else {
                          setBudgetMaxError("");
                        }
                      }}
                      placeholder="100"
                      className={`w-full ${budgetMaxError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                    />
                    {budgetMaxError && (
                      <p className="text-sm text-red-600 mt-1">{budgetMaxError}</p>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Current range: ${formData.budgetMin} - ${formData.budgetMax}{" "}
                  per month
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className={`flex items-center mt-6 pt-6 border-t border-gray-200 ${currentStep === 0 ? 'justify-end' : 'justify-between'}`}>
            {currentStep > 0 && (
              <Button
                variant="ghost"
                onClick={handleBack}
                className="gap-2 hover:bg-blue-50"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="gap-2 bg-[#4d688a] hover:bg-slate-700 text-white"
            >
              {currentStep === 4 ? "Continue to upload" : "Next"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>

        {/* Summary chips */}
        {(formData.concerns.length > 0 || formData.goals.length > 0) && (
          <div className="mt-6 p-6 rounded-xl bg-white border border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Your selections:
            </p>
            <div className="flex flex-wrap gap-2">
              {formData.concerns.map((concern) => (
                <Badge key={concern} variant="outline" className="bg-rose-50">
                  {concern}
                </Badge>
              ))}
              {formData.goals.map((goal) => (
                <Badge key={goal} variant="outline" className="bg-blue-50">
                  {goal}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
