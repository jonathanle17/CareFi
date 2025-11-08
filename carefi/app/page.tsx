"use client";

import { SectionHeading } from "@/components/SectionHeading";
import { PrimaryCTA } from "@/components/PrimaryCTA";
import { Card } from "@/components/ui/card";
import { Shield, Sparkles, TrendingDown, Check } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-neutral-100 to-stone-50">
      {/* Hero Section */}
      <section className="section-spacing relative overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgb(212_197_176_/_0.3)_1px,_transparent_0)] [background-size:40px_40px] animate-[drift_20s_ease-in-out_infinite]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgb(201_168_138_/_0.2)_1px,_transparent_0)] [background-size:60px_60px] animate-[drift_25s_ease-in-out_infinite_reverse]" />
        </div>
        <div className="container-wide relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Text content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="font-display text-5xl md:text-6xl lg:text-7xl tracking-tight text-balance">
                  <span className="bg-gradient-to-br from-stone-800 via-stone-700 to-stone-600 bg-clip-text text-transparent">
                    Understand your skin—
                  </span>
                  <span className="bg-gradient-to-r from-stone-600 to-brand bg-clip-text text-transparent">
                    with clinical clarity.
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-stone-700 leading-relaxed max-w-xl">
                  AI-assisted analysis, dermatologist-grade insights, and a
                  budget-smart routine tailored to you.
                </p>
              </div>
              
              {/* Stats badges */}
              <div className="flex flex-wrap gap-6 pt-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
                  <span className="text-sm font-medium text-stone-800">10K+ analyses</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-brand-warning animate-pulse" />
                  <span className="text-sm font-medium text-stone-800">98% satisfaction</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-stone-600 animate-pulse" />
                  <span className="text-sm font-medium text-stone-800">Avg $420 saved</span>
                </div>
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
              {/* Floating accent elements */}
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-brand-warning/30 to-brand/30 rounded-full blur-3xl animate-[float_6s_ease-in-out_infinite]" />
              <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-gradient-to-br from-stone-300/30 to-neutral-300/30 rounded-full blur-3xl animate-[float_8s_ease-in-out_infinite_reverse]" />
              
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-stone-100 via-neutral-50 to-stone-50 overflow-hidden relative border border-brand-warning/30 shadow-2xl shadow-brand/20">
                {/* Animated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand/10 to-brand-warning/10 animate-[pulse_4s_ease-in-out_infinite]" />
                
                {/* Placeholder for hero visual */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3/4 h-3/4 rounded-lg border-2 border-dashed border-brand-warning/40 flex items-center justify-center backdrop-blur-sm bg-white/50">
                    <div className="text-center space-y-6">
                      <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-brand to-brand-warning flex items-center justify-center shadow-lg animate-[float_3s_ease-in-out_infinite]">
                        <Sparkles className="w-10 h-10 text-white" />
                      </div>
                      <div className="space-y-3">
                        <div className="inline-block px-4 py-2 rounded-full bg-white/95 border border-brand-warning/50 text-sm font-medium text-stone-700 shadow-lg backdrop-blur-sm animate-[float_4s_ease-in-out_infinite]">
                          Salicylic Acid
                        </div>
                        <div className="inline-block px-4 py-2 rounded-full bg-white/95 border border-brand/50 text-sm font-medium text-stone-700 ml-2 shadow-lg backdrop-blur-sm animate-[float_5s_ease-in-out_infinite]">
                          Niacinamide
                        </div>
                        <div className="block mt-3">
                          <div className="inline-block px-4 py-2 rounded-full bg-white/95 border border-stone-300/50 text-sm font-medium text-stone-700 shadow-lg backdrop-blur-sm animate-[float_4.5s_ease-in-out_infinite]">
                            Hyaluronic Acid
                          </div>
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
      <section className="py-16 md:py-24 relative">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Prop 1 */}
            <Card className="p-8 space-y-4 transition-all duration-300 hover:shadow-2xl hover:shadow-brand/20 hover:-translate-y-2 hover:border-brand group cursor-pointer bg-gradient-to-br from-white to-stone-50/50">
              <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-brand">
                <Sparkles className="w-6 h-6 text-brand transition-colors duration-300 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-display font-medium text-stone-800 transition-colors duration-300 group-hover:text-brand">
                Derm-grade analysis
              </h3>
              <p className="text-stone-600 leading-relaxed">
                AI-powered detection trained on clinical data identifies your
                skin type, concerns, and sensitivities with precision.
              </p>
            </Card>

            {/* Prop 2 */}
            <Card className="p-8 space-y-4 transition-all duration-300 hover:shadow-2xl hover:shadow-brand/20 hover:-translate-y-2 hover:border-brand group cursor-pointer bg-gradient-to-br from-white to-stone-50/50">
              <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-brand">
                <TrendingDown className="w-6 h-6 text-brand transition-colors duration-300 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-display font-medium text-stone-800 transition-colors duration-300 group-hover:text-brand">
                Budget optimizer
              </h3>
              <p className="text-stone-600 leading-relaxed">
                Find the same active ingredients at better prices. Save up to
                70% without sacrificing efficacy.
              </p>
            </Card>

            {/* Prop 3 */}
            <Card className="p-8 space-y-4 transition-all duration-300 hover:shadow-2xl hover:shadow-brand/20 hover:-translate-y-2 hover:border-brand group cursor-pointer bg-gradient-to-br from-white to-stone-50/50">
              <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-brand">
                <Shield className="w-6 h-6 text-brand transition-colors duration-300 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-display font-medium text-stone-800 transition-colors duration-300 group-hover:text-brand">
                Private + Secure
              </h3>
              <p className="text-stone-600 leading-relaxed">
                Your photos are encrypted and processed securely. We never
                share or sell your data.
              </p>
            </Card>
          </div>
        </div>
        {/* Gradient transition to next section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-white pointer-events-none" />
      </section>

      {/* How It Works */}
      <section className="section-spacing bg-white">
        <div className="container-wide">
          <SectionHeading
            eyebrow="Process"
            title="How it works"
            subtitle="Your personalized skin journey in five simple steps."
            align="center"
            className="mb-16"
          />

          <div className="relative max-w-7xl mx-auto">
            {/* Horizontal timeline line - hidden on mobile */}
            <div className="hidden md:block absolute top-7 left-0 right-0 h-px" 
                 style={{ left: '5%', right: '5%' }} />
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-20 md:gap-4">
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
                  className="relative flex flex-col items-center text-center slide-up group cursor-pointer"
                >
                  {/* Step number badge */}
                  <div className="relative z-10 flex-shrink-0 w-14 h-14 rounded-full bg-brand text-white flex items-center justify-center text-lg font-medium shadow-lg mb-4 transition-all duration-300 group-hover:scale-110 group-hover:bg-stone-600 group-hover:shadow-xl">
                    {item.step}
                  </div>
                  
                  {/* Content */}
                  <div className="space-y-2 transition-all duration-300 group-hover:scale-105">
                    <h3 className="text-lg font-display font-medium text-stone-800 transition-colors duration-300 group-hover:text-brand">
                      {item.title}
                    </h3>
                    <p className="text-sm text-stone-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 text-center">
            <PrimaryCTA label="Get started" href="/onboarding" />
          </div>
        </div>
      </section>
      
      {/* Social Proof */}
      <section className="py-16 bg-gradient-to-br from-stone-100 via-neutral-100 to-stone-50">
        <div className="container-wide">
          <p className="text-center text-sm text-stone-600 mb-10 font-medium tracking-wide uppercase">
            Trusted by thousands of skincare enthusiasts
          </p>
          <div className="flex flex-wrap items-center justify-center gap-16 opacity-60">
            {["Brand A", "Brand B", "Brand C", "Brand D"].map((brand) => (
              <div
                key={brand}
                className="text-2xl font-display font-semibold text-brand transition-all duration-300 hover:opacity-100 hover:scale-110 cursor-pointer hover:text-stone-700"
              >
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-brand-warning/30 py-12 bg-gradient-to-b from-white to-stone-50/30">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-display text-xl font-semibold bg-gradient-to-r from-brand to-brand-warning bg-clip-text text-transparent mb-4">
                DermaFi
              </h4>
              <p className="text-sm text-stone-600 leading-relaxed">
                Clinical-grade skin analysis, tailored routines, and
                budget-smart shopping.
              </p>
            </div>
            <div>
              <h5 className="text-sm font-semibold text-stone-800 mb-4">
                Product
              </h5>
              <ul className="space-y-2 text-sm text-stone-600">
                <li>
                  <a href="#" className="hover:text-brand transition-colors duration-200 hover:translate-x-1 inline-block">
                    How it works
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-brand transition-colors duration-200 hover:translate-x-1 inline-block">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-semibold text-stone-800 mb-4">
                Company
              </h5>
              <ul className="space-y-2 text-sm text-stone-600">
                <li>
                  <a href="#" className="hover:text-brand transition-colors duration-200 hover:translate-x-1 inline-block">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-brand transition-colors duration-200 hover:translate-x-1 inline-block">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-semibold text-stone-800 mb-4">
                Legal
              </h5>
              <ul className="space-y-2 text-sm text-stone-600">
                <li>
                  <a href="#" className="hover:text-brand transition-colors duration-200 hover:translate-x-1 inline-block">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-brand transition-colors duration-200 hover:translate-x-1 inline-block">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-brand-warning/20">
            <p className="text-sm text-stone-600 text-center">
              © 2025 DermaFi. Your photos are private and never shared.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
