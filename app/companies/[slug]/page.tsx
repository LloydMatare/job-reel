"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JobCard } from "@/components/JobCard";
import { Building2, MapPin, Globe, Users, Briefcase } from "lucide-react";

export default function CompanyPage() {
  const params = useParams();
  const slug = params.slug as string;

  const companies = useQuery(api.companies.listCompanies);
  const company = companies?.find((c) => c.slug === slug);

  const jobs = useQuery(
    api.jobs.getJobsByCompany,
    company ? { companyId: company._id as any } : "skip",
  );

  if (company === undefined) {
    return (
      <>
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8 animate-pulse space-y-4">
          <div className="h-48 bg-muted rounded-2xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-muted rounded-xl" />
              ))}
            </div>
            <div className="h-64 bg-muted rounded-xl" />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!company) {
    return (
      <>
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Company Not Found
          </h1>
          <p className="text-muted-foreground">This company does not exist.</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.15),transparent_50%)]" />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white font-bold text-3xl shrink-0 border border-white/10">
                {company.name?.charAt(0) ?? "?"}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {company.name}
                </h1>
                <div className="flex flex-wrap gap-2 mb-3">
                  {company.industry && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/80 backdrop-blur-sm">
                      {company.industry}
                    </span>
                  )}
                  {company.size && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/80 backdrop-blur-sm">
                      {company.size}
                    </span>
                  )}
                  {company.location && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/80 backdrop-blur-sm">
                      <MapPin className="w-3 h-3" /> {company.location}
                    </span>
                  )}
                </div>
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white/90 transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    {company.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                Open Positions
              </h2>
              {jobs === undefined ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : jobs.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-8 text-center">
                  <Building2 className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">No open positions at this time.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <JobCard key={job._id} job={{ ...job, company } as any} />
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="bg-card border border-border rounded-xl p-5">
                <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  About
                </h2>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {company.description}
                </p>
                <div className="mt-4 space-y-3">
                  {company.location && (
                    <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 shrink-0" />
                      <span>{company.location}</span>
                    </div>
                  )}
                  {company.industry && (
                    <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <Building2 className="w-4 h-4 shrink-0" />
                      <span>{company.industry}</span>
                    </div>
                  )}
                  {company.size && (
                    <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <Users className="w-4 h-4 shrink-0" />
                      <span>{company.size} employees</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
