"use client";

import { SectionHeading } from "@/components/SectionHeading";
import { RoutineCard } from "@/components/RoutineCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Sun, Moon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RoutinePage() {
  const router = useRouter();

  // Mock routine data
  const amRoutine = [
    {
      step: 1,
      productType: "Cleanser",
      actives: ["Salicylic Acid"],
      rationale:
        "Gentle exfoliation to control oil and prevent breakouts without over-stripping skin.",
      alternatives: [
        { name: "Hydrating Facial Cleanser", brand: "CeraVe", price: 14.99 },
        { name: "Toleriane Cleanser", brand: "La Roche-Posay", price: 15.99 },
      ],
    },
    {
      step: 2,
      productType: "Toner",
      actives: ["Niacinamide", "Centella Asiatica"],
      rationale:
        "Soothing hydration that reduces inflammation and balances oil production.",
      alternatives: [
        { name: "Niacinamide 10% + Zinc 1%", brand: "The Ordinary", price: 6.0 },
      ],
    },
    {
      step: 3,
      productType: "Moisturizer",
      actives: ["Ceramides", "Hyaluronic Acid"],
      rationale:
        "Lightweight hydration to strengthen barrier without clogging pores.",
      alternatives: [
        { name: "Daily Hydrating Lotion", brand: "Cetaphil", price: 12.49 },
      ],
    },
    {
      step: 4,
      productType: "Sunscreen",
      actives: ["Zinc Oxide"],
      rationale: "Mineral protection that won't irritate sensitive, acne-prone skin.",
      alternatives: [],
    },
  ];

  const pmRoutine = [
    {
      step: 1,
      productType: "Oil Cleanser",
      actives: ["Jojoba Oil"],
      rationale: "Dissolves sebum and makeup without disrupting skin barrier.",
      alternatives: [],
    },
    {
      step: 2,
      productType: "Cleanser",
      actives: ["Salicylic Acid"],
      rationale: "Second cleanse to thoroughly remove impurities and exfoliate.",
      alternatives: [
        { name: "Hydrating Facial Cleanser", brand: "CeraVe", price: 14.99 },
      ],
    },
    {
      step: 3,
      productType: "Treatment",
      actives: ["Azelaic Acid"],
      rationale:
        "Multi-tasking active that targets acne, redness, and PIH simultaneously.",
      alternatives: [
        {
          name: "Azelaic Acid Suspension 10%",
          brand: "The Ordinary",
          price: 12.0,
        },
      ],
    },
    {
      step: 4,
      productType: "Moisturizer",
      actives: ["Ceramides", "Centella Asiatica"],
      rationale: "Reparative hydration to support overnight skin recovery.",
      alternatives: [
        { name: "Cicaplast Baume B5", brand: "La Roche-Posay", price: 15.99 },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <SectionHeading
            eyebrow="Your personalized plan"
            title="Your custom routine"
            subtitle="Tailored AM/PM steps mapped to your specific skin concerns."
            align="center"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main content */}
          <div className="lg:col-span-3 space-y-8">
            <Tabs defaultValue="am" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2 gap-2 mb-0.5 bg-stone-100">
                <TabsTrigger 
                  value="am" 
                  className="gap-2 border border-black data-[state=active]:bg-stone-900 data-[state=active]:text-white"
                >
                  <Sun className="w-4 h-4" />
                  Morning
                </TabsTrigger>
                <TabsTrigger 
                  value="pm" 
                  className="gap-2 border border-black data-[state=active]:bg-stone-700 data-[state=active]:text-white"
                >
                  <Moon className="w-4 h-4" />
                  Evening
                </TabsTrigger>
              </TabsList>

              <TabsContent value="am" className="space-y-4">
                {amRoutine.map((item) => (
                  <RoutineCard
                    key={`am-${item.step}`}
                    period="AM"
                    step={item.step}
                    productType={item.productType}
                    actives={item.actives}
                    rationale={item.rationale}
                    alternatives={item.alternatives}
                  />
                ))}
              </TabsContent>

              <TabsContent value="pm" className="space-y-4">
                {pmRoutine.map((item) => (
                  <RoutineCard
                    key={`pm-${item.step}`}
                    period="PM"
                    step={item.step}
                    productType={item.productType}
                    actives={item.actives}
                    rationale={item.rationale}
                    alternatives={item.alternatives}
                  />
                ))}
              </TabsContent>
            </Tabs>

            {/* Next step CTA */}
            <Card className="p-8 bg-stone-900 text-white">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-xl font-display font-medium mb-2">
                    Ready to optimize your budget?
                  </h3>
                  <p className="text-stone-300">
                    See how much you can save with ingredient-matched alternatives.
                  </p>
                </div>
                <Button
                  onClick={() => router.push("/budget")}
                  className="bg-white text-stone-900 hover:bg-stone-100 gap-2 flex-shrink-0"
                  size="lg"
                >
                  Compare prices
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-6 space-y-6 lg:pt-11">
              {/* Profile summary */}
              <Card className="p-6 space-y-4">
                <h3 className="font-medium text-stone-900">Your profile</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-600">Skin type</span>
                    <span className="font-medium text-stone-900">
                      Oily + Sensitive
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-600">Main concern</span>
                    <span className="font-medium text-stone-900">Acne</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-600">Total steps</span>
                    <span className="font-medium text-stone-900">
                      AM: 4 / PM: 4
                    </span>
                  </div>
                </div>
              </Card>

              {/* Adherence score */}
              <Card className="p-6 space-y-4">
                <h3 className="font-medium text-stone-900">
                  Estimated adherence
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-stone-600">Routine complexity</span>
                    <span className="font-medium text-emerald-700">Simple</span>
                  </div>
                  <Progress value={85} className="h-2" />
                  <p className="text-xs text-stone-500">
                    85% of users complete this routine consistently
                  </p>
                </div>
              </Card>

              {/* Tips */}
              <Card className="p-6 space-y-3 bg-teal-50 border-teal-200">
                <h4 className="font-medium text-teal-900 text-sm">Pro tip</h4>
                <p className="text-sm text-teal-800 leading-relaxed">
                  Start with just the cleanser and moisturizer for the first week,
                  then add actives one at a time to monitor tolerance.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
