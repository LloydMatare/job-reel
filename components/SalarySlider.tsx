"use client";

const PRESETS = [
  { label: "$0-50k", min: 0, max: 50000 },
  { label: "$50-100k", min: 50000, max: 100000 },
  { label: "$100-150k", min: 100000, max: 150000 },
  { label: "$150k+", min: 150000, max: undefined },
];

export function SalarySlider({
  salaryMin,
  salaryMax,
  onChange,
}: {
  salaryMin?: number;
  salaryMax?: number;
  onChange: (min?: number, max?: number) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Salary Range</label>
      <div className="flex gap-2 flex-wrap">
        {PRESETS.map((p) => {
          const active = salaryMin === p.min && salaryMax === p.max;
          return (
            <button
              key={p.label}
              onClick={() => onChange(active ? undefined : p.min, p.max)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                active
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-indigo-400"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>
      <div className="flex gap-2 items-center">
        <input
          type="number"
          placeholder="Min"
          value={salaryMin ?? ""}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined, salaryMax)}
          className="w-28 px-3 py-1.5 text-sm border border-gray-300 rounded-lg"
        />
        <span className="text-gray-400">—</span>
        <input
          type="number"
          placeholder="Max"
          value={salaryMax ?? ""}
          onChange={(e) => onChange(salaryMin, e.target.value ? Number(e.target.value) : undefined)}
          className="w-28 px-3 py-1.5 text-sm border border-gray-300 rounded-lg"
        />
      </div>
    </div>
  );
}
