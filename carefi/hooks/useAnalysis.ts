"use client";

import { useState, useEffect } from "react";
import type { AnalysisStatus, SkinTrait, ProgressItem } from "@/lib/types";

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
        // Step 1: Uploading
        setStatus("uploading");
        setProgressItems((prev) =>
          prev.map((item, i) => (i === 0 ? { ...item, status: "done" } : item))
        );
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Step 2: Screening
        setStatus("screening");
        setProgressItems((prev) =>
          prev.map((item, i) => (i === 1 ? { ...item, status: "done" } : item))
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Step 3: Detecting
        setStatus("detecting");
        setProgressItems((prev) =>
          prev.map((item, i) => (i === 2 ? { ...item, status: "done" } : item))
        );
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Step 4: Generating
        setStatus("generating");
        setProgressItems((prev) =>
          prev.map((item, i) => (i === 3 ? { ...item, status: "done" } : item))
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Complete
        setStatus("complete");
        setTraits([
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
        ]);
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "An error occurred");
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
