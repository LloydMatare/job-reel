"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";

export default function CompaniesPage() {
  const [search, setSearch] = useState("");
  const allCompanies = useQuery(api.admin.getAllCompanies);

  if (!allCompanies) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  const filtered = allCompanies.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.location ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (c.industry ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Companies</h1>
      <p className="text-gray-500 mb-6">Browse companies hiring on our platform.</p>
      <input
        type="text"
        placeholder="Search by name, industry, or location..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-xl px-4 py-2 border border-gray-300 rounded-lg mb-8 text-sm"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <Link
            key={c._id}
            href={`/companies/${c.slug}`}
            className="block bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
          >
            <h2 className="font-semibold text-gray-900">{c.name}</h2>
            {c.location && <p className="text-sm text-gray-500 mt-1">{c.location}</p>}
            {c.industry && (
              <span className="inline-block mt-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                {c.industry}
              </span>
            )}
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full text-center text-gray-400 py-12">No companies found.</p>
        )}
      </div>
    </div>
  );
}
