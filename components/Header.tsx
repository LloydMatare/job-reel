"use client";

import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Briefcase,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

export function Header() {
  const { orgSlug } = useAuth();
  const currentUser = useQuery(api.users.getMe);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const navLinks = [
    { href: "/insights", label: "Insights", show: true },
    { href: "/jobs", label: "Find Jobs", show: true },
    {
      href: "/dashboard/seeker/applications",
      label: "My Applications",
      show: currentUser?.role === "seeker",
    },
    {
      href: "/profile",
      label: "Profile",
      show: currentUser?.role === "seeker" || (currentUser?.role === "employer" && !orgSlug),
    },
    {
      href: `/orgs/${orgSlug}/dashboard`,
      label: "Dashboard",
      show: currentUser?.role === "employer" && !!orgSlug,
    },
  ].filter((l) => l.show);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-gray-950/80 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/10"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-18">
            <div className="flex items-center gap-8">
              <Link
                href="/"
                className="flex items-center gap-2.5 text-white font-bold text-xl tracking-tight"
              >
                <div className="size-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Briefcase className="size-4 text-white" />
                </div>
                Job Reels
              </Link>
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-3 py-2 text-sm text-white/70 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-3">
                <Authenticated>
                  <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: "size-7 ring-2 ring-white/10",
                      },
                    }}
                  />
                </Authenticated>
                <Unauthenticated>
                  <SignInButton mode="modal">
                    <button className="px-4 py-2 text-sm text-white/80 hover:text-white font-medium transition-colors">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="px-5 py-2 text-sm font-medium rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/20 transition-all duration-200 hover:shadow-blue-500/30 hover:-translate-y-0.5">
                      Get Started
                    </button>
                  </SignUpButton>
                </Unauthenticated>
              </div>

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden relative size-9 flex items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden animate-fade-in">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute top-18 left-4 right-4 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/30 overflow-hidden animate-slide-up">
            <div className="p-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all"
                >
                  {link.label}
                  <ChevronRight className="size-4 text-white/30" />
                </Link>
              ))}
            </div>
            <div className="border-t border-white/10 px-4 py-4 space-y-3">
              <Authenticated>
                <div className="flex items-center gap-3 px-2">
                  <UserButton afterSignOutUrl="/" showName />
                </div>
              </Authenticated>
              <Unauthenticated>
                <SignInButton mode="modal">
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="w-full px-4 py-3 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 transition-all text-left"
                  >
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="w-full px-4 py-3 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all text-center shadow-lg shadow-blue-500/20"
                  >
                    Get Started
                  </button>
                </SignUpButton>
              </Unauthenticated>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
