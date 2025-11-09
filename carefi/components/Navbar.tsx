"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, User, LogOut, LayoutDashboard, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  // Check auth state on mount and subscribe to changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setMobileMenuOpen(false);
    router.push('/');
    router.refresh();
  };

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
            {loading ? (
              // Loading state
              <div className="w-32 h-10 bg-gray-200 animate-pulse rounded-full" />
            ) : user ? (
              // Authenticated state
              <>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 border-2 border-gray-200 bg-white text-gray-900 hover:bg-blue-50 hover:-translate-y-0.5 hover:shadow-lg hover:border-gray-300 focus:ring-slate-800"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 relative overflow-hidden group bg-gradient-to-r from-slate-800 to-slate-700 text-white hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-800/25 focus:ring-slate-800 before:absolute before:inset-0 before:bg-gradient-to-r before:from-slate-600 before:to-slate-500 before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100">
                    <User className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">Account</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56" sideOffset={8}>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">My Account</p>
                        <p className="text-xs leading-none text-gray-500">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600 focus:text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              // Unauthenticated state
              <>
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
              </>
            )}
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
            {loading ? (
              // Loading state
              <div className="flex flex-col gap-3">
                <div className="w-full h-12 bg-gray-200 animate-pulse rounded-full" />
                <div className="w-full h-12 bg-gray-200 animate-pulse rounded-full" />
              </div>
            ) : user ? (
              // Authenticated state
              <div className="flex flex-col gap-3">
                <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                  <p className="font-medium">Signed in as</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all duration-300 border-2 border-gray-200 bg-white text-gray-900 hover:bg-blue-50 hover:border-gray-300"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all duration-300 border-2 border-gray-200 bg-white text-gray-900 hover:bg-blue-50 hover:border-gray-300"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all duration-300 relative overflow-hidden group bg-gradient-to-r from-red-600 to-red-500 text-white hover:shadow-lg hover:shadow-red-600/25 before:absolute before:inset-0 before:bg-gradient-to-r before:from-red-500 before:to-red-400 before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
                >
                  <LogOut className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">Sign Out</span>
                </button>
              </div>
            ) : (
              // Unauthenticated state
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
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
