"use client";

import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";

export default function NewCoverLetterPage() {
  const router = useRouter();
  const resumes = useQuery(api.resumes.getMyResumes);
  const saveCoverLetter = useMutation(api.cover_letters.saveCoverLetter);
  const generate = useAction(api.ai.generateCoverLetter);

  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [content, setContent] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectedResume = resumes?.find((r: any) => r._id === selectedResumeId);

  const handleGenerate = async () => {
    if (!selectedResume) return;
    setGenerating(true);
    try {
      const response = await generate({
        jobTitle: "Software Engineer",
        companyName: "Company",
        jobDescription: `Based on resume: ${selectedResume.title}`,
        userSummary: selectedResume.sections.summary ?? undefined,
        userExperience: selectedResume.sections.experience?.map((e: any) => `${e.role} at ${e.company}: ${e.description}`).join("\n") ?? undefined,
        userSkills: selectedResume.sections.skills?.join(", ") ?? undefined,
      });
      setContent(response);
    } catch {
      setContent("Failed to generate. Please write manually.");
    }
    setGenerating(false);
  };

  const handleSave = async () => {
    if (!content.trim()) return;
    setSaving(true);
    await saveCoverLetter({
      content,
      resumeId: selectedResumeId ? (selectedResumeId as any) : undefined,
    });
    router.push("/dashboard/seeker/cover-letters");
  };

  if (!resumes) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Cover Letter</h1>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Base Resume</label>
          <select
            value={selectedResumeId}
            onChange={(e) => setSelectedResumeId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">Select a resume...</option>
            {resumes.map((r: any) => (
              <option key={r._id} value={r._id}>{r.title}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!selectedResume || generating}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {generating ? "Generating..." : "Generate with AI"}
        </button>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write or generate your cover letter..."
            rows={12}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={!content.trim() || saving}
          className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Cover Letter"}
        </button>
      </div>
    </div>
  );
}
