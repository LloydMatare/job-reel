"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JobCard } from "@/components/JobCard";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

export default function Home() {
  const { isSignedIn } = useUser();
  const featuredJobs = useQuery(api.jobs.getFeaturedJobs);
  const recommendedJobs = useQuery(api.jobs.getRecommendedJobs);
  const categories = useQuery(api.categories.listCategories);

  return (
    <>
      <Header />

      <main>
        <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
              Find Your Next Opportunity
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Browse thousands of jobs from top companies. Your dream career starts here.
            </p>
            <div className="max-w-2xl mx-auto">
              <SearchBar large />
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Featured Jobs
            </h2>
            <Link href="/jobs" className="hidden sm:block">
              <Button variant="outline" size="sm">
                View All Jobs
              </Button>
            </Link>
          </div>

          {featuredJobs === undefined ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-5">
                  <Skeleton className="h-4 w-3/4 mb-3" />
                  <Skeleton className="h-3 w-1/2 mb-4" />
                  <Skeleton className="h-3 w-full mb-2" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              ))}
            </div>
          ) : featuredJobs.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-gray-500 mb-2">No featured jobs yet.</p>
              <p className="text-sm text-gray-400">
                Employers can post jobs to see them here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredJobs.map((job) => (
                <JobCard key={job._id} job={job as any} />
              ))}
            </div>
          )}

          <div className="mt-6 text-center sm:hidden">
            <Link href="/jobs">
              <Button variant="outline">View All Jobs</Button>
            </Link>
          </div>
        </section>

        {isSignedIn && recommendedJobs && recommendedJobs.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                Recommended for You
              </h2>
              <Link href="/jobs" className="hidden sm:block">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedJobs.map((job: any) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          </section>
        )}

        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white border border-gray-200 rounded-xl p-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  For Job Seekers
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Find and apply to your dream job in three simple steps.
                </p>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold shrink-0">
                      1
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">Search Jobs</p>
                      <p className="text-sm text-gray-500">
                        Browse thousands of listings by title, category, or company.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold shrink-0">
                      2
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">Apply</p>
                      <p className="text-sm text-gray-500">
                        Submit your application with your profile and resume.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold shrink-0">
                      3
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">Get Hired</p>
                      <p className="text-sm text-gray-500">
                        Connect with employers and land your next role.
                      </p>
                    </div>
                  </div>
                </div>
                <Link href="/jobs" className="mt-6 inline-block">
                  <Button>Browse Jobs</Button>
                </Link>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  For Employers
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Find great candidates and manage applications in one place.
                </p>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <span className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold shrink-0">
                      1
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">Post a Job</p>
                      <p className="text-sm text-gray-500">
                        Create detailed job listings and reach qualified candidates.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <span className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold shrink-0">
                      2
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">Review</p>
                      <p className="text-sm text-gray-500">
                        Screen applications and shortlist the best talent.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <span className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold shrink-0">
                      3
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">Hire</p>
                      <p className="text-sm text-gray-500">
                        Connect with candidates and build your team.
                      </p>
                    </div>
                  </div>
                </div>
                <Link href="/company/new" className="mt-6 inline-block">
                  <Button>Post a Job</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {categories && categories.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                Browse by Category
              </h2>
              <Link href="/jobs" className="hidden sm:block">
                <Button variant="outline" size="sm">
                  All Categories
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {categories.map((cat) => (
                <Link
                  key={cat._id}
                  href={`/jobs?category=${cat.slug}`}
                  className="bg-white border border-gray-200 rounded-xl p-5 text-center hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="mb-2 flex justify-center">
                    <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75a23.976 23.976 0 01-7.327-1.264c-.252-.085-.479-.215-.673-.38m0 0a2.18 2.18 0 01-.75-1.661V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {cat.name}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Start Posting Jobs Today
            </h2>
            <p className="text-lg text-blue-100 mb-8 max-w-xl mx-auto">
              Join thousands of employers who trust Job Reels to find their next great hire.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/company/new">
                <Button variant="primary" size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
                  Post a Job
                </Button>
              </Link>
              <Link href="/jobs">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white/10"
                >
                  Browse Jobs
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
