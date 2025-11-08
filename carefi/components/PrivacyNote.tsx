import React from "react";
import { Shield } from "lucide-react";

interface PrivacyNoteProps {
  text?: string;
}

export function PrivacyNote({
  text = "Your photos are encrypted and processed securely. We never share or sell your data.",
}: PrivacyNoteProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-stone-100 p-4 border border-stone-200">
      <Shield className="w-5 h-5 text-stone-600 mt-0.5 flex-shrink-0" />
      <p className="text-sm text-stone-700 leading-relaxed">{text}</p>
    </div>
  );
}
