"use client";

import { Authenticated, Unauthenticated } from "convex/react";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <span className="text-2xl font-bold text-blue-600">Job Reels</span>
            <div className="flex items-center gap-4">
              <Authenticated>
                <UserButton afterSignOutUrl="/" />
              </Authenticated>
              <Unauthenticated>
                <SignInButton mode="modal">
                  <button className="text-gray-700 hover:text-gray-900 font-medium">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium">
                    Sign Up
                  </button>
                </SignUpButton>
              </Unauthenticated>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <h1 className="text-5xl font-bold mb-4">
              Find Your Next Opportunity
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Browse thousands of jobs from top companies. Your dream career
              starts here.
            </p>
            <div className="max-w-2xl mx-auto flex gap-2">
              <input
                type="text"
                placeholder="Search jobs by title, company, or keyword..."
                className="flex-1 px-4 py-3 rounded-lg text-gray-900"
              />
              <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50">
                Search
              </button>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Featured Jobs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="h-4 w-3/4 bg-gray-200 rounded mb-3 animate-pulse" />
              <div className="h-3 w-1/2 bg-gray-200 rounded mb-4 animate-pulse" />
              <div className="h-3 w-full bg-gray-200 rounded mb-2 animate-pulse" />
              <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="h-4 w-3/4 bg-gray-200 rounded mb-3 animate-pulse" />
              <div className="h-3 w-1/2 bg-gray-200 rounded mb-4 animate-pulse" />
              <div className="h-3 w-full bg-gray-200 rounded mb-2 animate-pulse" />
              <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="h-4 w-3/4 bg-gray-200 rounded mb-3 animate-pulse" />
              <div className="h-3 w-1/2 bg-gray-200 rounded mb-4 animate-pulse" />
              <div className="h-3 w-full bg-gray-200 rounded mb-2 animate-pulse" />
              <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
