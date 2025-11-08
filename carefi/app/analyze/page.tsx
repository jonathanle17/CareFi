"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SectionHeading } from "@/components/SectionHeading";
import { ProgressLog } from "@/components/ProgressLog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAnalysis } from "@/hooks/useAnalysis";
import { ArrowRight, Droplets, AlertCircle, Sparkles, TrendingUp } from "lucide-react";

export default function AnalyzePage() {
  const router = useRouter();
  const { status, traits, progressItems, isComplete } = useAnalysis(true);

  const progressPercent = () => {
    const doneCount = progressItems.filter((item) => item.status === "done").length;
    return (doneCount / progressItems.length) * 100;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "bg-stone-200 text-stone-700 border-stone-300";
      case "moderate":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "high":
        return "bg-rose-100 text-rose-700 border-rose-200";
      default:
        return "bg-stone-100 text-stone-700 border-stone-200";
    }
  };

  const getTraitIcon = (traitId: string) => {
    switch (traitId) {
      case "oily":
        return <Droplets className="w-5 h-5" />;
      case "sensitive":
        return <AlertCircle className="w-5 h-5" />;
      case "acne":
        return <Sparkles className="w-5 h-5" />;
      case "pih":
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="container-narrow">
        {/* Header */}
        <div className="mb-12 text-center">
          <SectionHeading
            eyebrow="Step 3 of 3"
            title={isComplete ? "Analysis complete" : "Analyzing your skin"}
            subtitle={
              isComplete
                ? "The AI detected your skin traits and concerns."
                : "Our AI is processing your photos to detect skin traits."
            }
            align="center"
          />
        </div>

        {/* Progress section */}
        {!isComplete && (
          <Card className="p-8 md:p-12 space-y-8 mb-8">
            <div className="space-y-4">
              <Progress value={progressPercent()} className="h-2" />
              <p className="text-sm text-stone-600 text-center">
                {Math.round(progressPercent())}% complete
              </p>
            </div>
            <ProgressLog items={progressItems} />
          </Card>
        )}

        {/* Results section */}
        {isComplete && (
          <div className="space-y-8">
            {/* Detection summary */}
            <Card className="p-8 md:p-12 bg-gradient-to-br from-stone-100 to-stone-50 border-stone-300">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-stone-200">
                  <Sparkles className="w-8 h-8 text-stone-700" />
                </div>
                <h3 className="text-2xl font-display font-medium text-stone-900">
                  Analysis complete
                </h3>
                <p className="text-lg text-stone-700">
                  The AI detected{" "}
                  <strong className="font-medium">
                    oily + sensitive skin
                  </strong>{" "}
                  with moderate acne.
                </p>
              </div>
            </Card>

            {/* Detected traits */}
            <div>
              <h3 className="text-xl font-display font-medium text-stone-900 mb-6">
                Detected skin traits
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {traits.map((trait) => (
                  <Card key={trait.id} className="p-6 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getSeverityColor(
                            trait.severity
                          )}`}
                        >
                          {getTraitIcon(trait.id)}
                        </div>
                        <div>
                          <h4 className="font-medium text-stone-900">
                            {trait.name}
                          </h4>
                          <Badge
                            variant="outline"
                            className={`text-xs mt-1 ${getSeverityColor(
                              trait.severity
                            )}`}
                          >
                            {trait.severity}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-stone-600 leading-relaxed">
                      {trait.description}
                    </p>
                  </Card>
                ))}
              </div>
            </div>

            {/* CTA */}
            <Card className="p-8 bg-stone-900 text-white">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-xl font-display font-medium mb-2">
                    Ready for your personalized routine?
                  </h3>
                  <p className="text-stone-300">
                    We've created a custom AM/PM routine mapped to your specific
                    concerns.
                  </p>
                </div>
                <Button
                  onClick={() => router.push("/routine")}
                  className="bg-white text-stone-900 hover:bg-stone-100 gap-2 flex-shrink-0"
                  size="lg"
                >
                  View routine
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
