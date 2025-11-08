"use client";

import { SectionHeading } from "@/components/SectionHeading";
import { PrimaryCTA } from "@/components/PrimaryCTA";
import { Card } from "@/components/ui/card";
import { Shield, Sparkles, TrendingDown, Check } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section */}
      <section className="section-spacing">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Text content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="font-display text-5xl md:text-6xl lg:text-7xl tracking-tight text-stone-900 text-balance">
                  Understand your skin—with clinical clarity.
                </h1>
                <p className="text-lg md:text-xl text-stone-600 leading-relaxed max-w-xl">
                  AI-assisted analysis, dermatologist-grade insights, and a
                  budget-smart routine tailored to you.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <PrimaryCTA label="Get my skin report" href="/onboarding" />
                <PrimaryCTA
                  label="Start with 3 photos"
                  href="/upload"
                  variant="secondary"
                  showArrow={false}
                />
              </div>
            </div>

            {/* Right: Visual */}
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-stone-200 to-stone-300 overflow-hidden relative border border-stone-300">
                {/* Placeholder for hero visual */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3/4 h-3/4 rounded-lg border-2 border-dashed border-stone-400/50 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-full bg-stone-400/20 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-stone-600" />
                      </div>
                      <div className="space-y-2">
                        <div className="inline-block px-3 py-1 rounded-full bg-teal-400/20 border border-teal-400/50 text-xs font-medium text-stone-700">
                          Salicylic Acid
                        </div>
                        <div className="inline-block px-3 py-1 rounded-full bg-emerald-400/20 border border-emerald-400/50 text-xs font-medium text-stone-700 ml-2">
                          Niacinamide
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-16 md:py-24">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Prop 1 */}
            <Card className="p-8 space-y-4">
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-display font-medium text-stone-900">
                Derm-grade analysis
              </h3>
              <p className="text-stone-600 leading-relaxed">
                AI-powered detection trained on clinical data identifies your
                skin type, concerns, and sensitivities with precision.
              </p>
            </Card>

            {/* Prop 2 */}
            <Card className="p-8 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-display font-medium text-stone-900">
                Budget optimizer
              </h3>
              <p className="text-stone-600 leading-relaxed">
                Find the same active ingredients at better prices. Save up to
                70% without sacrificing efficacy.
              </p>
            </Card>

            {/* Prop 3 */}
            <Card className="p-8 space-y-4">
              <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center">
                <Shield className="w-6 h-6 text-stone-600" />
              </div>
              <h3 className="text-xl font-display font-medium text-stone-900">
                Private & secure
              </h3>
              <p className="text-stone-600 leading-relaxed">
                Your photos are encrypted and processed securely. We never
                share or sell your data.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-spacing bg-white">
        <div className="container-narrow">
          <SectionHeading
            eyebrow="Process"
            title="How it works"
            subtitle="Your personalized skin journey in five simple steps."
            align="center"
            className="mb-16"
          />

          <div className="space-y-12">
            {[
              {
                step: 1,
                title: "Tell us about your skin",
                description:
                  "Answer a few questions about your concerns, goals, and lifestyle.",
              },
              {
                step: 2,
                title: "Upload 3 photos",
                description:
                  "Front, left, and right angles in natural lighting for best results.",
              },
              {
                step: 3,
                title: "AI analyzes your skin",
                description:
                  "Our model detects traits like oiliness, sensitivity, acne, and pigmentation.",
              },
              {
                step: 4,
                title: "Get your personalized routine",
                description:
                  "AM/PM steps mapped to your concerns with ingredient explanations.",
              },
              {
                step: 5,
                title: "Optimize your budget",
                description:
                  "Compare brand picks to budget-friendly alternatives with the same actives.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="flex items-start gap-6 slide-up"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-stone-900 text-white flex items-center justify-center text-lg font-medium">
                  {item.step}
                </div>
                <div className="pt-1.5">
                  <h3 className="text-xl font-display font-medium text-stone-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-stone-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <PrimaryCTA label="Get started" href="/onboarding" />
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 border-t border-stone-200">
        <div className="container-wide">
          <p className="text-center text-sm text-stone-500 mb-8">
            Trusted by thousands of skincare enthusiasts
          </p>
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-40 grayscale">
            {["Brand A", "Brand B", "Brand C", "Brand D"].map((brand) => (
              <div
                key={brand}
                className="text-xl font-medium text-stone-900"
              >
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 py-12">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-display text-lg font-medium text-stone-900 mb-4">
                DermaFi
              </h4>
              <p className="text-sm text-stone-600 leading-relaxed">
                Clinical-grade skin analysis, tailored routines, and
                budget-smart shopping.
              </p>
            </div>
            <div>
              <h5 className="text-sm font-medium text-stone-900 mb-4">
                Product
              </h5>
              <ul className="space-y-2 text-sm text-stone-600">
                <li>
                  <a href="#" className="hover:text-stone-900">
                    How it works
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-stone-900">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-medium text-stone-900 mb-4">
                Company
              </h5>
              <ul className="space-y-2 text-sm text-stone-600">
                <li>
                  <a href="#" className="hover:text-stone-900">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-stone-900">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-medium text-stone-900 mb-4">
                Legal
              </h5>
              <ul className="space-y-2 text-sm text-stone-600">
                <li>
                  <a href="#" className="hover:text-stone-900">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-stone-900">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-stone-200">
            <p className="text-sm text-stone-500 text-center">
              © 2025 DermaFi. Your photos are private and never shared.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
