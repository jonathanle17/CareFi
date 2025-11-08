"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SectionHeading } from "@/components/SectionHeading";
import { UploadZone } from "@/components/UploadZone";
import { PrivacyNote } from "@/components/PrivacyNote";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, ArrowRight } from "lucide-react";

export default function UploadPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);

  const handleContinue = () => {
    if (files.length === 3) {
      // TODO: Upload files to backend
      router.push("/analyze");
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="container-narrow">
        {/* Header */}
        <div className="mb-12 text-center">
          <SectionHeading
            eyebrow="Step 2 of 3"
            title="Upload your photos"
            subtitle="Three clear images help us provide the most accurate analysis."
            align="center"
          />
        </div>

        {/* Upload section */}
        <Card className="p-8 md:p-12 space-y-8">
          <UploadZone maxFiles={3} onFiles={setFiles} />

          {/* Tips */}
          <div className="rounded-lg bg-teal-50 border border-teal-200 p-6">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-teal-900">
                  Tips for best results:
                </p>
                <ul className="text-sm text-teal-800 space-y-1 list-disc list-inside">
                  <li>Use natural, even lighting (near a window is ideal)</li>
                  <li>Remove heavy makeup or filters</li>
                  <li>
                    Capture front, left 45°, and right 45° angles of your face
                  </li>
                  <li>Ensure your face fills most of the frame</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Privacy note */}
          <PrivacyNote />

          {/* Continue button */}
          <div className="pt-6 border-t border-stone-200">
            <Button
              onClick={handleContinue}
              disabled={files.length !== 3}
              className="w-full md:w-auto bg-stone-900 hover:bg-stone-800 gap-2"
              size="lg"
            >
              Continue to analysis
              <ArrowRight className="w-4 h-4" />
            </Button>
            {files.length < 3 && (
              <p className="text-sm text-stone-500 mt-3">
                Upload {3 - files.length} more{" "}
                {3 - files.length === 1 ? "photo" : "photos"} to continue
              </p>
            )}
          </div>
        </Card>

        {/* Example angles */}
        <div className="mt-8">
          <p className="text-sm font-medium text-stone-700 mb-4 text-center">
            Example angles:
          </p>
          <div className="grid grid-cols-3 gap-4">
            {["Front", "Left 45°", "Right 45°"].map((angle) => (
              <div
                key={angle}
                className="aspect-square rounded-xl bg-stone-200 border border-stone-300 flex items-center justify-center relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-stone-300 to-stone-400 opacity-50" />
                <div className="relative z-10 w-2/3 h-2/3 border-2 border-dashed border-stone-500/50 rounded-lg flex items-end justify-center pb-3">
                  <p className="text-xs font-medium text-stone-700">{angle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
