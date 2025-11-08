"use client";

import { SectionHeading } from "@/components/SectionHeading";
import { IngredientBadge } from "@/components/IngredientBadge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Share2, Calendar, CheckCircle, Sun, Moon } from "lucide-react";

export default function SummaryPage() {
  const handleDownloadPDF = () => {
    // TODO: Generate and download PDF report
    alert("PDF download would trigger here");
  };

  const handleShare = () => {
    // TODO: Generate shareable link
    navigator.clipboard.writeText(window.location.origin + "/summary/shared-id");
    alert("Shareable link copied to clipboard!");
  };

  const schedule = [
    { day: "Days 1-7", task: "Start with cleanser + moisturizer only" },
    { day: "Days 8-14", task: "Add niacinamide toner in AM" },
    { day: "Days 15-21", task: "Introduce azelaic acid in PM (2-3x/week)" },
    { day: "Days 22-30", task: "Increase azelaic acid to nightly if tolerated" },
  ];

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="container-narrow">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 mb-6">
            <CheckCircle className="w-8 h-8 text-teal-600" />
          </div>
          <SectionHeading
            title="Your personalized plan is ready"
            subtitle="DermaFi analyzed your skin and created a budget-smart routine tailored to you."
            align="center"
          />
        </div>

        {/* Summary cards */}
        <div className="space-y-6 mb-12">
          {/* Analysis summary */}
          <Card className="p-8 space-y-4">
            <h3 className="text-xl font-display font-medium text-stone-900">
              Analysis results
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-stone-50">
                <p className="text-sm text-stone-600 mb-1">Detected traits</p>
                <p className="font-medium text-stone-900">
                  Oily + Sensitive with moderate acne
                </p>
              </div>
              <div className="p-4 rounded-lg bg-stone-50">
                <p className="text-sm text-stone-600 mb-1">Top concern</p>
                <p className="font-medium text-stone-900">
                  Oil control & breakouts
                </p>
              </div>
            </div>
          </Card>

          {/* Routine overview */}
          <Card className="p-8 space-y-6">
            <h3 className="text-xl font-display font-medium text-stone-900">
              Your routine at a glance
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* AM */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sun className="w-5 h-5 text-amber-500" />
                  <h4 className="font-medium text-stone-900">Morning (AM)</h4>
                </div>
                <div className="space-y-2 text-sm">
                  {[
                    { step: "Cleanser", actives: ["Salicylic Acid"] },
                    { step: "Toner", actives: ["Niacinamide"] },
                    { step: "Moisturizer", actives: ["Ceramides"] },
                    { step: "Sunscreen", actives: ["Zinc Oxide"] },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between gap-3 p-3 rounded-lg bg-stone-50"
                    >
                      <span className="text-stone-700">{item.step}</span>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {item.actives.map((active) => (
                          <span
                            key={active}
                            className="text-xs px-2 py-0.5 rounded-full bg-teal-100 text-teal-700"
                          >
                            {active}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PM */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Moon className="w-5 h-5 text-indigo-500" />
                  <h4 className="font-medium text-stone-900">Evening (PM)</h4>
                </div>
                <div className="space-y-2 text-sm">
                  {[
                    { step: "Oil Cleanser", actives: ["Jojoba Oil"] },
                    { step: "Cleanser", actives: ["Salicylic Acid"] },
                    { step: "Treatment", actives: ["Azelaic Acid"] },
                    { step: "Moisturizer", actives: ["Ceramides"] },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between gap-3 p-3 rounded-lg bg-stone-50"
                    >
                      <span className="text-stone-700">{item.step}</span>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {item.actives.map((active) => (
                          <span
                            key={active}
                            className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700"
                          >
                            {active}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Budget recap */}
          <Card className="p-8 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 space-y-4">
            <h3 className="text-xl font-display font-medium text-stone-900">
              Budget optimization
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-white/50">
                <p className="text-3xl font-display font-semibold text-emerald-700">
                  $29.99
                </p>
                <p className="text-sm text-stone-600 mt-1">
                  Optimized monthly cost
                </p>
              </div>
              <div className="text-center p-4 rounded-lg bg-white/50">
                <p className="text-3xl font-display font-semibold text-stone-400 line-through">
                  $106.00
                </p>
                <p className="text-sm text-stone-600 mt-1">Brand alternatives</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-white/50">
                <p className="text-3xl font-display font-semibold text-emerald-700">
                  72%
                </p>
                <p className="text-sm text-stone-600 mt-1">Total savings</p>
              </div>
            </div>
          </Card>

          {/* 30-day schedule */}
          <Card className="p-8 space-y-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-stone-600" />
              <h3 className="text-xl font-display font-medium text-stone-900">
                Your 30-day introduction schedule
              </h3>
            </div>
            <div className="space-y-3">
              {schedule.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-lg bg-stone-50 hover:bg-stone-100 transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-sm font-medium text-stone-700">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-stone-900">{item.day}</p>
                    <p className="text-sm text-stone-600 mt-1">{item.task}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <Button
            onClick={handleDownloadPDF}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Download PDF report
          </Button>
          <Button
            onClick={handleShare}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share your plan
          </Button>
        </div>

        {/* Next steps */}
        <Card className="p-8 bg-stone-900 text-white text-center space-y-4">
          <h3 className="text-2xl font-display font-medium">What's next?</h3>
          <p className="text-stone-300 max-w-2xl mx-auto">
            DermaFi personalizes your skincare plan and your spending plan. Track
            your progress, get reminders, and adjust your routine as your skin
            evolves.
          </p>
          <div className="pt-4">
            <Button
              onClick={() => window.location.href = "/"}
              className="bg-white text-stone-900 hover:bg-stone-100"
              size="lg"
            >
              Start another analysis
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
