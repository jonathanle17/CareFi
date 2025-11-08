"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { SectionHeading } from "@/components/SectionHeading";
import { UploadZone } from "@/components/UploadZone";
import { PrivacyNote } from "@/components/PrivacyNote";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, ArrowRight, ArrowLeft } from "lucide-react";

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

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-stone-200">
            <Button
              variant="ghost"
              onClick={() => router.push("/onboarding")}
              className="gap-2 hover:bg-stone-100"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="flex flex-col items-end">
              <Button
                onClick={handleContinue}
                disabled={files.length !== 3}
                className="gap-2 bg-stone-900 hover:bg-stone-800 text-white"
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
          </div>
        </Card>

        {/* Example angles */}
        <div className="mt-8">
          <p className="text-sm font-medium text-stone-700 mb-4 text-center">
            Example angles:
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Left 45°", image: "/example-left.jpeg" },
              { label: "Front", image: "/example-front.jpeg" },
              { label: "Right 45°", image: "/example-right.jpeg" },
            ].map(({ label, image }) => (
              <div
                key={label}
                className="aspect-square rounded-xl bg-stone-200 border border-stone-300 flex items-center justify-center relative overflow-hidden"
              >
                <Image
                  src={image}
                  alt={`Example ${label} angle`}
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
                  <p className="text-xs font-medium text-white drop-shadow-md">
                    {label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
