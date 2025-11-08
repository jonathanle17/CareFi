"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SectionHeading } from "@/components/SectionHeading";
import { CompareRow } from "@/components/CompareRow";
import { PriceChip } from "@/components/PriceChip";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, TrendingDown } from "lucide-react";
import type { Product } from "@/lib/types";

export default function BudgetPage() {
  const router = useRouter();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Mock comparison data
  const comparisons = [
    {
      step: "AM Cleanser",
      brand: {
        id: "cerave-foaming",
        name: "Foaming Facial Cleanser",
        brand: "CeraVe",
        price: 14.99,
        merchants: ["Amazon", "Sephora"] as ("Amazon" | "YesStyle" | "Sephora")[],
        actives: ["Ceramides", "Niacinamide", "Hyaluronic Acid"],
      },
      dupes: [
        {
          id: "cetaphil-gentle",
          name: "Gentle Skin Cleanser",
          brand: "Cetaphil",
          price: 11.99,
          merchants: ["Amazon"] as ("Amazon" | "YesStyle" | "Sephora")[],
          actives: ["Niacinamide", "Glycerin"],
        },
      ],
    },
    {
      step: "AM Toner",
      brand: {
        id: "pc-niacinamide",
        name: "10% Niacinamide Booster",
        brand: "Paula's Choice",
        price: 52.0,
        merchants: ["Sephora"] as ("Amazon" | "YesStyle" | "Sephora")[],
        actives: ["Niacinamide"],
      },
      dupes: [
        {
          id: "ordinary-niacinamide",
          name: "Niacinamide 10% + Zinc 1%",
          brand: "The Ordinary",
          price: 6.0,
          merchants: ["Sephora"] as ("Amazon" | "YesStyle" | "Sephora")[],
          actives: ["Niacinamide", "Zinc"],
        },
      ],
    },
    {
      step: "PM Treatment",
      brand: {
        id: "pc-azelaic",
        name: "10% Azelaic Acid Booster",
        brand: "Paula's Choice",
        price: 39.0,
        merchants: ["Sephora"] as ("Amazon" | "YesStyle" | "Sephora")[],
        actives: ["Azelaic Acid", "Salicylic Acid"],
      },
      dupes: [
        {
          id: "ordinary-azelaic",
          name: "Azelaic Acid Suspension 10%",
          brand: "The Ordinary",
          price: 12.0,
          merchants: ["Sephora"] as ("Amazon" | "YesStyle" | "Sephora")[],
          actives: ["Azelaic Acid"],
        },
      ],
    },
  ];

  const totalBrandPrice = comparisons.reduce((sum, c) => sum + c.brand.price, 0);
  const totalDupePrice = comparisons.reduce((sum, c) => sum + c.dupes[0].price, 0);
  const totalSavings = totalBrandPrice - totalDupePrice;
  const savingsPercent = Math.round((totalSavings / totalBrandPrice) * 100);

  const toggleItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="container-wide">
        {/* Header */}
        <div className="mb-12 text-center">
          <SectionHeading
            eyebrow="Smart spending"
            title="Budget optimizer"
            subtitle="Find the same active ingredients at better prices."
            align="center"
          />
        </div>

        {/* Savings banner */}
        <Card className="p-8 mb-8 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 mb-3">
                <TrendingDown className="w-6 h-6 text-emerald-600" />
                <h3 className="text-2xl font-display font-medium text-stone-900">
                  Same actives, smarter spend
                </h3>
              </div>
              <p className="text-lg text-stone-700">
                Found the same ingredients for{" "}
                <span className="font-semibold text-emerald-700">
                  ${totalDupePrice.toFixed(2)}
                </span>{" "}
                vs{" "}
                <span className="font-semibold text-stone-500 line-through">
                  ${totalBrandPrice.toFixed(2)}
                </span>
              </p>
            </div>
            <PriceChip deltaPct={-savingsPercent} className="text-lg px-6 py-3" />
          </div>
        </Card>

        {/* Comparison table */}
        <div className="space-y-4 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 px-6 text-xs font-medium text-stone-500 uppercase tracking-wide">
            <div className="lg:col-span-2">Step</div>
            <div className="lg:col-span-3">Brand pick</div>
            <div className="lg:col-span-3 lg:pl-6">Budget alternative</div>
            <div className="lg:col-span-2 lg:text-center">Active match</div>
            <div className="lg:col-span-2 lg:text-right">Savings</div>
          </div>

          {comparisons.map((comparison) => (
            <CompareRow
              key={comparison.step}
              step={comparison.step}
              brand={comparison.brand}
              dupes={comparison.dupes}
            />
          ))}
        </div>

        {/* Marketplace filters */}
        <Card className="p-6 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium text-stone-700">
              Shop from:
            </span>
            {["Amazon", "YesStyle", "Sephora"].map((merchant) => (
              <label
                key={merchant}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Checkbox defaultChecked />
                <span className="text-sm text-stone-600">{merchant}</span>
              </label>
            ))}
          </div>
        </Card>

        {/* CTA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-8 space-y-4">
            <h3 className="text-xl font-display font-medium text-stone-900">
              Total monthly cost
            </h3>
            <div className="space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-display font-semibold text-emerald-700">
                  ${totalDupePrice.toFixed(2)}
                </span>
                <span className="text-xl text-stone-400 line-through">
                  ${totalBrandPrice.toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-stone-600">
                Estimated budget-optimized routine cost
              </p>
            </div>
          </Card>

          <Card className="p-8 bg-stone-900 text-white flex flex-col justify-between">
            <div className="mb-4">
              <h3 className="text-xl font-display font-medium mb-2">
                Ready to check out?
              </h3>
              <p className="text-stone-300">
                Test the checkout flow with your optimized routine.
              </p>
            </div>
            <Button
              onClick={() => router.push("/checkout")}
              className="bg-white text-stone-900 hover:bg-stone-100 gap-2 w-full"
              size="lg"
            >
              Proceed to checkout
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
