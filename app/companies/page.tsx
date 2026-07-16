"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Building2, Search, MapPin } from "lucide-react";

export default function CompaniesPage() {
  const [search, setSearch] = useState("");
  const allCompanies = useQuery(api.admin.getAllCompanies);

  if (!allCompanies) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="h-10 w-full max-w-xl bg-muted rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const filtered = allCompanies.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.location ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (c.industry ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 px-8 py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.15),transparent_50%)]" />
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Companies</h1>
            <p className="text-sm text-white/60 mt-0.5">Browse companies hiring on our platform</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name, industry, or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <Link
            key={c._id}
            href={`/companies/${c.slug}`}
            className="group block bg-card border border-border rounded-xl p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                {c.name?.charAt(0) ?? "?"}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">{c.name}</h2>
                {c.location && (
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 shrink-0" /> {c.location}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {c.industry && (
                <span className="inline-block px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-xs">
                  {c.industry}
                </span>
              )}
              {c.size && (
                <span className="inline-block px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-xs">
                  {c.size}
                </span>
              )}
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full text-center text-muted-foreground py-12">No companies found.</p>
        )}
      </div>
    </div>
  );
}
