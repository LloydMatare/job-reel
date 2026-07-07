"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";

interface SearchBarProps {
  large?: boolean;
  placeholder?: string;
  initialQuery?: string;
}

export function SearchBar({
  large = false,
  placeholder = "Search jobs by title, company, or keyword...",
  initialQuery = "",
}: SearchBarProps) {
  const router = useRouter();
  const categories = useQuery(api.categories.listCategories);
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (category) params.set("category", category);
    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
      <div className="relative flex-1">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={`w-full pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            large ? "py-3 text-base" : "py-2 text-sm"
          }`}
        />
      </div>
      {categories && categories.length > 0 && (
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={`border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            large ? "py-3 text-base" : "py-2 text-sm"
          }`}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
      )}
      <button
        type="submit"
        className={`bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors ${
          large ? "px-8 py-3 text-base" : "px-6 py-2 text-sm"
        }`}
      >
        Search
      </button>
    </form>
  );
}
