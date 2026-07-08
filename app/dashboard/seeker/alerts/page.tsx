"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function SeekerAlerts() {
  const alerts = useQuery(api.job_alerts.getMyAlerts);
  const deleteAlert = useMutation(api.job_alerts.deleteJobAlert);
  const createAlert = useMutation(api.job_alerts.createJobAlert);
  const [showForm, setShowForm] = useState(false);
  const [keywords, setKeywords] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly">("daily");

  const handleCreate = async () => {
    await createAlert({
      keywords: keywords || undefined,
      category: category || undefined,
      location: location || undefined,
      frequency,
    });
    setShowForm(false);
    setKeywords("");
    setCategory("");
    setLocation("");
  };

  if (!alerts) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Job Alerts</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
        >
          {showForm ? "Cancel" : "New Alert"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Create Job Alert</h2>
          <input
            type="text"
            placeholder="Keywords (e.g. React, TypeScript)"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as "daily" | "weekly")}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
          >
            Create Alert
          </button>
        </div>
      )}

      {alerts.length === 0 ? (
        <p className="text-gray-500">No alerts yet. Create one to get notified about new jobs.</p>
      ) : (
        <div className="space-y-3">
          {alerts.map((a) => (
            <div key={a._id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {a.keywords || "All keywords"} {a.category && `— ${a.category}`}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {a.location || "Any location"} &middot; {a.frequency}
                </p>
              </div>
              <button
                onClick={() => deleteAlert({ alertId: a._id })}
                className="text-xs text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
