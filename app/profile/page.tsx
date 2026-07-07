"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user } = useUser();
  const router = useRouter();
  const currentUser = useQuery(api.users.getMe);
  const company = useQuery(api.companies.getMyCompany);
  const updateProfile = useMutation(api.users.updateProfile);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [saving, setSaving] = useState(false);

  if (currentUser === undefined) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="h-4 w-full bg-gray-200 rounded" />
          <div className="h-4 w-full bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!currentUser) {
    router.push("/");
    return null;
  }

  const displayName = name || currentUser.name || user?.fullName || "";
  const displayPhone = phone || currentUser.phone || "";
  const displayLocation = location || currentUser.location || "";
  const displayBio = bio || currentUser.bio || "";
  const skills = currentUser.skills || [];
  const displaySkillsInput = skillsInput || skills.join(", ");

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        name: displayName || undefined,
        phone: displayPhone || undefined,
        location: displayLocation || undefined,
        bio: displayBio || undefined,
        skills: displaySkillsInput
          ? displaySkillsInput.split(",").map((s) => s.trim()).filter(Boolean)
          : undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile</h1>

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
          <img
            src={user?.imageUrl}
            alt=""
            className="w-16 h-16 rounded-full"
          />
          <div>
            <p className="text-lg font-semibold text-gray-900">
              {user?.fullName}
            </p>
            <p className="text-gray-600">
              {currentUser.role === "employer" ? "Employer" : "Job Seeker"}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={displayPhone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={displayLocation}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, State"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {currentUser.role === "seeker" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  value={displayBio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skills (comma-separated)
                </label>
                <input
                  type="text"
                  value={displaySkillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  placeholder="React, TypeScript, Node.js"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </>
          )}

          {currentUser.role === "employer" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Company:</strong>{" "}
                {company ? company.name : "No company set up yet."}
              </p>
              {!company && (
                <a
                  href="/company/new"
                  className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                >
                  Create your company profile
                </a>
              )}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
