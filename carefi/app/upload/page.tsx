"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { SectionHeading } from "@/components/SectionHeading";
import { UploadZone } from "@/components/UploadZone";
import { PrivacyNote } from "@/components/PrivacyNote";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import type { ImageAngle, UploadImageResponse } from "@/lib/types";

export default function UploadPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    completed: number;
    total: number;
    current?: string;
  }>({ completed: 0, total: 0 });
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Map files to angles: first = left_45, second = front, third = right_45
  const angleMap: ImageAngle[] = ['left_45', 'front', 'right_45'];

  const uploadFile = async (file: File, angle: ImageAngle): Promise<UploadImageResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('angle', angle);

    const response = await fetch('/api/uploadImage', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload image');
    }

    return response.json();
  };

  const handleContinue = async () => {
    if (files.length !== 3) return;

    setUploading(true);
    setUploadError(null);
    setUploadProgress({ completed: 0, total: 3 });

    try {
      // Upload files sequentially
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const angle = angleMap[i];
        
        setUploadProgress({
          completed: i,
          total: 3,
          current: `Uploading ${angle}...`,
        });

        console.log(`[UPLOAD PAGE] Uploading file ${i + 1}/3:`, {
          fileName: file.name,
          angle,
          size: file.size,
        });

        const result = await uploadFile(file, angle);
        console.log(`[UPLOAD PAGE] ✅ Upload ${i + 1} successful:`, result);

        setUploadProgress({
          completed: i + 1,
          total: 3,
          current: `Uploaded ${angle}`,
        });
      }

      console.log('[UPLOAD PAGE] ✅ All files uploaded successfully');
      // Navigate to analyze page after successful upload
      router.push("/analyze");
    } catch (error) {
      console.error('[UPLOAD PAGE] ❌ Upload failed:', error);
      setUploadError(
        error instanceof Error ? error.message : 'Failed to upload images. Please try again.'
      );
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-12">
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
          <div className="rounded-lg bg-blue-50 border border-gray-200 p-6">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-gray-700 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">
                  Tips for best results:
                </p>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
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

          {/* Upload error */}
          {uploadError && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-800 font-medium">Upload failed</p>
              <p className="text-sm text-red-700 mt-1">{uploadError}</p>
            </div>
          )}

          {/* Upload progress */}
          {uploading && (
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">
                    {uploadProgress.current || 'Uploading images...'}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    {uploadProgress.completed} of {uploadProgress.total} uploaded
                  </p>
                  <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(uploadProgress.completed / uploadProgress.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={() => router.push("/onboarding")}
              disabled={uploading}
              className="gap-2 hover:bg-blue-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="flex flex-col items-end">
              <Button
                onClick={handleContinue}
                disabled={files.length !== 3 || uploading}
                className="gap-2 bg-[#4d688a] hover:bg-slate-700 text-white disabled:opacity-50"
                size="lg"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    Continue to analysis
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
              {files.length < 3 && !uploading && (
                <p className="text-sm text-gray-500 mt-3">
                  Upload {3 - files.length} more{" "}
                  {3 - files.length === 1 ? "photo" : "photos"} to continue
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Example angles */}
        <div className="mt-8">
          <p className="text-sm font-medium text-gray-700 mb-4 text-center">
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
                className="aspect-square rounded-xl bg-gray-200 border border-gray-300 flex items-center justify-center relative overflow-hidden"
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
