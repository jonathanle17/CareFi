"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
      <div className="container-wide">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo/Brand */}
          <Link
            href="/"
            className="font-display text-2xl md:text-3xl font-semibold bg-gradient-to-r from-[#36485e] to-[#1e293b] bg-clip-text text-transparent transition-all duration-300 hover:scale-105"
          >
            CareFi
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/signin"
              className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 border-2 border-gray-200 bg-white text-gray-900 hover:bg-blue-50 hover:-translate-y-0.5 hover:shadow-lg hover:border-gray-300 focus:ring-slate-800"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 relative overflow-hidden group bg-gradient-to-r from-slate-800 to-slate-700 text-white hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-800/25 focus:ring-slate-800 before:absolute before:inset-0 before:bg-gradient-to-r before:from-slate-600 before:to-slate-500 before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
            >
              <span className="relative z-10">Sign Up</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200/50 animate-[slideDown_0.3s_ease-out]">
            <div className="flex flex-col gap-3">
              <Link
                href="/signin"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all duration-300 border-2 border-gray-200 bg-white text-gray-900 hover:bg-blue-50 hover:border-gray-300"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all duration-300 relative overflow-hidden group bg-gradient-to-r from-slate-800 to-slate-700 text-white hover:shadow-lg hover:shadow-slate-800/25 before:absolute before:inset-0 before:bg-gradient-to-r before:from-slate-600 before:to-slate-500 before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
              >
                <span className="relative z-10">Sign Up</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
