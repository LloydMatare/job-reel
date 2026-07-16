"use client";

import { usePaginatedQuery, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JobCard } from "@/components/JobCard";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SalarySlider } from "@/components/SalarySlider";
import { Bell } from "lucide-react";

export default function JobsPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const initialCategory = searchParams.get("category") ?? "";

  const categories = useQuery(api.categories.listCategories);

  const [employmentType, setEmploymentType] = useState<
    "full-time" | "part-time" | "contract" | "temporary" | "internship" | ""
  >("");
  const [locationType, setLocationType] = useState<
    "on-site" | "remote" | "hybrid" | ""
  >("");
  const [category, setCategory] = useState(initialCategory);
  const [salaryMin, setSalaryMin] = useState<number | undefined>(undefined);
  const [salaryMax, setSalaryMax] = useState<number | undefined>(undefined);
  const [query, setQuery] = useState(initialQuery);

  const router = useRouter();

  const { results, status, loadMore } = usePaginatedQuery(
    api.jobs.listJobs,
    {
      employmentType: employmentType || undefined,
      locationType: locationType || undefined,
      category: category || undefined,
      salaryMin,
      salaryMax,
    },
    { initialNumItems: 12 },
  );

  const isLoading = status === "LoadingFirstPage";
  const isLoadingMore = status === "LoadingMore";
  const canLoadMore =
    status !== "Exhausted" && status !== "LoadingFirstPage";

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-20">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Find Jobs
            </h1>
            <SearchBar
              initialQuery={query}
              placeholder="Search by title, keyword..."
            />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Employment Type
                  </h3>
                  <div className="space-y-2">
                    {[
                      { value: "", label: "All" },
                      { value: "full-time", label: "Full Time" },
                      { value: "part-time", label: "Part Time" },
                      { value: "contract", label: "Contract" },
                      { value: "internship", label: "Internship" },
                      { value: "temporary", label: "Temporary" },
                    ].map((opt) => (
                      <label
                        key={opt.value}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="employmentType"
                          value={opt.value}
                          checked={employmentType === opt.value}
                          onChange={(e) =>
                            setEmploymentType(
                              e.target.value as
                                | "full-time"
                                | "part-time"
                                | "contract"
                                | "temporary"
                                | "internship"
                                | "",
                            )
                          }
                          className="text-blue-600"
                        />
                        <span className="text-sm text-gray-700">
                          {opt.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Location Type
                  </h3>
                  <div className="space-y-2">
                    {[
                      { value: "", label: "All" },
                      { value: "remote", label: "Remote" },
                      { value: "hybrid", label: "Hybrid" },
                      { value: "on-site", label: "On-site" },
                    ].map((opt) => (
                      <label
                        key={opt.value}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="locationType"
                          value={opt.value}
                          checked={locationType === opt.value}
                          onChange={(e) =>
                            setLocationType(
                              e.target.value as
                                | "on-site"
                                | "remote"
                                | "hybrid"
                                | "",
                            )
                          }
                          className="text-blue-600"
                        />
                        <span className="text-sm text-gray-700">
                          {opt.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {categories && categories.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                      Category
                    </h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          value=""
                          checked={category === ""}
                          onChange={() => setCategory("")}
                          className="text-blue-600"
                        />
                        <span className="text-sm text-gray-700">All</span>
                      </label>
                      {categories.map((cat) => (
                        <label
                          key={cat._id}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="category"
                            value={cat.slug}
                            checked={category === cat.slug}
                            onChange={() => setCategory(cat.slug)}
                            className="text-blue-600"
                          />
                          <span className="text-sm text-gray-700">
                            {cat.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                <SalarySlider
                  salaryMin={salaryMin}
                  salaryMax={salaryMax}
                  onChange={(min, max) => {
                    setSalaryMin(min);
                    setSalaryMax(max);
                  }}
                />

                <div className="pt-3 border-t border-gray-200">
                  <button
                    onClick={() =>
                      router.push(
                        `/dashboard/seeker/alerts?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`,
                      )
                    }
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90 transition-opacity"
                  >
                    <Bell className="size-4" />
                    Create Alert
                  </button>
                </div>
              </div>
            </aside>

            <div className="flex-1 min-w-0">
              {(employmentType || locationType || category || salaryMin) && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {employmentType && (
                    <Badge variant="info">
                      {employmentType}
                      <button
                        onClick={() => setEmploymentType("")}
                        className="ml-1.5 hover:text-blue-800"
                      >
                        &times;
                      </button>
                    </Badge>
                  )}
                  {locationType && (
                    <Badge variant="info">
                      {locationType}
                      <button
                        onClick={() => setLocationType("")}
                        className="ml-1.5 hover:text-blue-800"
                      >
                        &times;
                      </button>
                    </Badge>
                  )}
                  {category && (
                    <Badge variant="info">
                      {category}
                      <button
                        onClick={() => setCategory("")}
                        className="ml-1.5 hover:text-blue-800"
                      >
                        &times;
                      </button>
                    </Badge>
                  )}
                  {salaryMin && (
                    <Badge variant="info">
                      ${salaryMin.toLocaleString()}+
                      <button
                        onClick={() => { setSalaryMin(undefined); setSalaryMax(undefined); }}
                        className="ml-1.5 hover:text-blue-800"
                      >
                        &times;
                      </button>
                    </Badge>
                  )}
                </div>
              )}

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-xl p-5">
                      <Skeleton className="h-5 w-3/4 mb-3" />
                      <Skeleton className="h-4 w-1/2 mb-4" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  ))}
                </div>
              ) : results.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    No jobs found
                  </p>
                  <p className="text-gray-500">
                    Try adjusting your search or filters.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {results.map((job: any) => (
                      <JobCard key={job._id} job={job} />
                    ))}
                  </div>

                  {canLoadMore && (
                    <div className="mt-8 text-center">
                      <Button
                        variant="outline"
                        onClick={() => loadMore(10)}
                        disabled={isLoadingMore}
                      >
                        {isLoadingMore ? "Loading..." : "Load More Jobs"}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
