"use client";

import React, { useCallback, useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface UploadZoneProps {
  maxFiles: number;
  onFiles: (files: File[]) => void;
  className?: string;
}

export function UploadZone({ maxFiles, onFiles, className }: UploadZoneProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFiles = useCallback(
    (newFiles: FileList | null) => {
      if (!newFiles) return;

      const fileArray = Array.from(newFiles).slice(0, maxFiles - files.length);
      const updatedFiles = [...files, ...fileArray].slice(0, maxFiles);

      setFiles(updatedFiles);
      onFiles(updatedFiles);

      // Generate previews
      fileArray.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    },
    [files, maxFiles, onFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    setPreviews(updatedPreviews);
    onFiles(updatedFiles);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 p-12 text-center transition-all duration-200",
          isDragging && "border-teal-400 bg-teal-50",
          files.length >= maxFiles && "opacity-50 pointer-events-none"
        )}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFiles(e.target.files)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={files.length >= maxFiles}
          aria-label="Upload images"
        />
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-stone-200 flex items-center justify-center">
            <Upload className="w-6 h-6 text-stone-600" />
          </div>
          <div>
            <p className="text-base font-medium text-stone-900 mb-1">
              Drop your photos here, or click to browse
            </p>
            <p className="text-sm text-stone-500">
              Upload up to {maxFiles} images ({files.length}/{maxFiles})
            </p>
          </div>
        </div>
      </div>

      {/* Preview grid */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {previews.map((preview, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-xl overflow-hidden border border-stone-200 group"
            >
              <Image
                src={preview}
                alt={`Upload preview ${index + 1}`}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <button
                  onClick={() => removeFile(index)}
                  className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-stone-100 transition-colors"
                  aria-label={`Remove image ${index + 1}`}
                >
                  <X className="w-4 h-4 text-stone-900" />
                </button>
              </div>
              {/* Face box overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 border-2 border-dashed border-teal-400/50 rounded-lg" />
              </div>
            </div>
          ))}
          {/* Empty slots */}
          {Array.from({ length: maxFiles - previews.length }).map((_, index) => (
            <div
              key={`empty-${index}`}
              className="aspect-square rounded-xl border-2 border-dashed border-stone-200 bg-stone-50 flex items-center justify-center"
            >
              <ImageIcon className="w-8 h-8 text-stone-300" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
