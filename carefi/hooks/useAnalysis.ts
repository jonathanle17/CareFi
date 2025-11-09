"use client";

import { useState, useEffect } from "react";
import type { AnalysisStatus, SkinTrait, ProgressItem } from "@/lib/types";

/**
 * Hook for managing skin analysis state and API calls
 *
 * Calls POST /api/analysis/start to trigger OpenAI Vision analysis.
 * Tracks progress through status updates and displays UI-friendly progress items.
 *
 * @param autoStart - If true, automatically starts analysis on mount
 * @returns Analysis state, traits, progress, and control functions
 */
export function useAnalysis(autoStart: boolean = false) {
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [traits, setTraits] = useState<SkinTrait[]>([]);
  const [progressItems, setProgressItems] = useState<ProgressItem[]>([
    { label: "Uploading images", status: "pending" },
    { label: "Screening for quality", status: "pending" },
    { label: "Feature detection", status: "pending" },
    { label: "Generating report", status: "pending" },
  ]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!autoStart) return;

    const runAnalysis = async () => {
      try {
        setStatus("uploading");
        setProgressItems((prev) =>
          prev.map((item, i) => (i === 0 ? { ...item, status: "done" } : item))
        );

        // Small delay to show uploading state
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Call the real API
        console.log("[useAnalysis] Calling POST /api/analysis/start");
        const response = await fetch("/api/analysis/start", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();

          // Handle rate limiting with friendly message
          if (response.status === 429) {
            const retryAfter = errorData.error?.details?.retryAfterHuman || "some time";
            throw new Error(
              `Rate limit exceeded. Please try again in ${retryAfter}.`
            );
          }

          // Handle missing images
          if (response.status === 400 && errorData.error?.code === "missing_images") {
            throw new Error(
              errorData.error?.message ||
                "Please upload all three required images before starting analysis."
            );
          }

          throw new Error(
            errorData.error?.message || `Analysis failed (HTTP ${response.status})`
          );
        }

        const result = await response.json();
        console.log("[useAnalysis] Analysis response:", result);
        console.log("[useAnalysis] Detected traits:", result.data?.detected_traits || result.detected_traits);

        // Simulate status transitions for UI feedback
        // In reality, the API completes quickly, but we show progress for UX

        setStatus("screening");
        setProgressItems((prev) =>
          prev.map((item, i) => (i === 1 ? { ...item, status: "done" } : item))
        );
        await new Promise((resolve) => setTimeout(resolve, 800));

        setStatus("detecting");
        setProgressItems((prev) =>
          prev.map((item, i) => (i === 2 ? { ...item, status: "done" } : item))
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setStatus("generating");
        setProgressItems((prev) =>
          prev.map((item, i) => (i === 3 ? { ...item, status: "done" } : item))
        );
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Extract traits from the analysis summary
        // The API now returns AnalysisSummary with detected_traits array
        setStatus("complete");

        // Use the detected_traits from the response envelope, or fall back to empty array
        const detectedTraits = result.data?.detected_traits || result.detected_traits || [];
        setTraits(detectedTraits);

        console.log("[useAnalysis] Analysis completed successfully with", detectedTraits.length, "traits");
      } catch (err) {
        console.error("[useAnalysis] Error:", err);
        setStatus("error");
        setError(err instanceof Error ? err.message : "An unexpected error occurred");
      }
    };

    runAnalysis();
  }, [autoStart]);

  const reset = () => {
    setStatus("idle");
    setTraits([]);
    setProgressItems([
      { label: "Uploading images", status: "pending" },
      { label: "Screening for quality", status: "pending" },
      { label: "Feature detection", status: "pending" },
      { label: "Generating report", status: "pending" },
    ]);
    setError(null);
  };

  return {
    status,
    traits,
    progressItems,
    error,
    reset,
    isLoading: status !== "idle" && status !== "complete" && status !== "error",
    isComplete: status === "complete",
  };
}
