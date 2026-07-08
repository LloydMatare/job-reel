"use client";

import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JobCard } from "@/components/JobCard";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Briefcase,
  Search,
  UserCheck,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Star,
  Shield,
  Zap,
  Globe,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const ParticlesBackground = dynamic(
  () => import("@/components/ParticlesBackground"),
  { ssr: false },
);

function useGsapAnimations() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      const heroElements = document.querySelectorAll(".anim-hero");
      if (heroElements.length) {
        gsap.fromTo(
          heroElements,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power3.out" },
        );
      }

      gsap.utils.toArray<HTMLElement>(".anim-reveal").forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
            delay: i * 0.08,
          },
        );
      });

      gsap.utils.toArray<HTMLElement>(".anim-stagger").forEach((el) => {
        const children = el.children;
        gsap.fromTo(
          children,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.06,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>(".anim-scale").forEach((el) => {
        gsap.fromTo(
          el,
          { scale: 0.9, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });
    });

    return () => ctx.revert();
  }, []);
}

export default function Home() {
  const { isSignedIn } = useUser();
  const featuredJobs = useQuery(api.jobs.getFeaturedJobs);
  const recommendedJobs = useQuery(api.jobs.getRecommendedJobs);
  const categories = useQuery(api.categories.listCategories);

  useGsapAnimations();

  return (
    <>
      <Header />

      <main>
        <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-gray-950 via-blue-950 to-indigo-950">
          <div className="absolute inset-0 opacity-60">
            <ParticlesBackground />
          </div>

          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-950/60" />

          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
            <div className="max-w-3xl">
              <div className="anim-hero inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-blue-200 text-xs font-medium mb-6">
                <Sparkles className="size-3.5" />
                AI-Powered Job Matching
              </div>

              <h1 className="anim-hero text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6">
                Find Your{" "}
                <span className="bg-gradient-to-r from-blue-300 via-blue-400 to-indigo-300 bg-clip-text text-transparent">
                  Dream Career
                </span>
              </h1>

              <p className="anim-hero text-lg sm:text-xl text-blue-100/70 max-w-2xl mb-8 leading-relaxed">
                Discover thousands of opportunities from top companies.
                Build resumes, generate cover letters, and land your next role
                with AI-powered tools.
              </p>

              <div className="anim-hero max-w-xl">
                <SearchBar large />
              </div>

              <div className="anim-hero flex flex-wrap items-center gap-6 mt-8 text-sm text-blue-200/50">
                <span className="flex items-center gap-1.5">
                  <Star className="size-3.5 text-blue-400" />
                  10K+ jobs
                </span>
                <span className="flex items-center gap-1.5">
                  <Shield className="size-3.5 text-blue-400" />
                  Trusted by 5K+ companies
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="size-3.5 text-blue-400" />
                  AI career tools
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="relative z-10 -mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-card border border-border rounded-2xl shadow-xl shadow-blue-900/5 p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Briefcase className="size-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">
                      Featured Jobs
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Top opportunities from leading companies
                    </p>
                  </div>
                </div>
                <Link
                  href="/jobs"
                  className="hidden sm:inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View All
                  <ChevronRight className="size-4" />
                </Link>
              </div>

              {featuredJobs === undefined ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="border border-border rounded-xl p-5">
                      <Skeleton className="h-4 w-3/4 mb-3" />
                      <Skeleton className="h-3 w-1/2 mb-4" />
                      <Skeleton className="h-3 w-full mb-2" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  ))}
                </div>
              ) : featuredJobs.length === 0 ? (
                <div className="text-center py-12 bg-muted/50 rounded-xl border border-border">
                  <p className="text-muted-foreground mb-2">No featured jobs yet.</p>
                  <p className="text-sm text-muted-foreground/60">
                    Employers can post jobs to see them here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 anim-stagger">
                  {featuredJobs.map((job) => (
                    <div key={job._id} className="anim-reveal">
                      <JobCard job={job as any} />
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 text-center sm:hidden">
                <Link href="/jobs">
                  <Button variant="outline">View All Jobs</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {isSignedIn && recommendedJobs && recommendedJobs.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="flex items-center gap-3 mb-8 anim-reveal">
              <div className="size-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <TrendingUp className="size-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Recommended for You
                </h2>
                <p className="text-xs text-muted-foreground">
                  Personalized based on your profile
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 anim-stagger">
              {recommendedJobs.map((job: any) => (
                <div key={job._id} className="anim-reveal">
                  <JobCard key={job._id} job={job} />
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 anim-reveal">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-medium mb-4">
                <Sparkles className="size-3.5" />
                Simple Process
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-3">
                How It Works
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Whether you&apos;re looking for a job or hiring talent, we make it simple.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 anim-scale">
                <div className="size-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-5 shadow-lg shadow-blue-500/20">
                  <Search className="size-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  For Job Seekers
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Find and apply to your dream job in three simple steps.
                </p>
                <div className="space-y-5">
                  {[
                    { num: "01", title: "Search Jobs", desc: "Browse thousands of listings by title, category, or company with smart filters." },
                    { num: "02", title: "Apply Instantly", desc: "Submit your application with your profile, resume, and AI-generated cover letter." },
                    { num: "03", title: "Get Hired", desc: "Connect with employers, track applications, and land your next role." },
                  ].map((step) => (
                    <div key={step.num} className="flex gap-4 group">
                      <span className="text-xs font-bold text-blue-600 mt-0.5 w-6 shrink-0">
                        {step.num}
                      </span>
                      <div>
                        <p className="font-semibold text-foreground text-sm group-hover:text-blue-600 transition-colors">
                          {step.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/jobs" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 group">
                  Browse Jobs
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>

              <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 anim-scale">
                <div className="size-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-5 shadow-lg shadow-emerald-500/20">
                  <UserCheck className="size-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  For Employers
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Find great candidates and manage applications in one place.
                </p>
                <div className="space-y-5">
                  {[
                    { num: "01", title: "Post a Job", desc: "Create detailed job listings with AI assistance and reach qualified candidates." },
                    { num: "02", title: "Review & Shortlist", desc: "Screen applications, track status, and shortlist the best talent." },
                    { num: "03", title: "Hire & Grow", desc: "Connect with candidates, manage your team, and build your company." },
                  ].map((step) => (
                    <div key={step.num} className="flex gap-4 group">
                      <span className="text-xs font-bold text-emerald-600 mt-0.5 w-6 shrink-0">
                        {step.num}
                      </span>
                      <div>
                        <p className="font-semibold text-foreground text-sm group-hover:text-emerald-600 transition-colors">
                          {step.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/company/new" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 group">
                  Post a Job
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {categories && categories.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="flex items-center justify-between mb-8 anim-reveal">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                  <Globe className="size-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    Browse by Category
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Find jobs in your field
                  </p>
                </div>
              </div>
              <Link
                href="/jobs"
                className="hidden sm:inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                All Categories
                <ChevronRight className="size-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 anim-stagger">
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  href={`/jobs?category=${cat.slug}`}
                  className="group flex flex-col items-center gap-3 bg-card border border-border rounded-xl p-5 text-center hover:border-blue-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300 anim-reveal"
                >
                  <div className="size-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center group-hover:from-blue-100 group-hover:to-indigo-100 transition-colors">
                    <Briefcase className="size-5 text-blue-600" />
                  </div>
                  <p className="text-xs font-medium text-foreground group-hover:text-blue-600 transition-colors">
                    {cat.name}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="relative overflow-hidden py-24">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800" />
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/20 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-300/20 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center anim-reveal">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
              Start Your Journey Today
            </h2>
            <p className="text-lg text-blue-100/70 mb-8 max-w-xl mx-auto">
              Join thousands of professionals and employers who trust Job Reels
              to connect talent with opportunity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/jobs">
                <Button
                  size="lg"
                  className="bg-white text-blue-700 hover:bg-blue-50 shadow-xl shadow-black/10 px-8"
                >
                  <Search className="size-4" />
                  Browse Jobs
                </Button>
              </Link>
              <Link href="/company/new">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 px-8"
                >
                  <Briefcase className="size-4" />
                  Post a Job
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
