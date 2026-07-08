"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";

const emptyExperience = () => ({ company: "", role: "", startDate: "", endDate: "", description: "" });
const emptyEducation = () => ({ institution: "", degree: "", field: "", year: "" });

export default function NewResumePage() {
  const router = useRouter();
  const saveResume = useMutation(api.resumes.saveResume);
  const generateAI = useMutation(api.resumes.saveResume);

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [experience, setExperience] = useState<any[]>([emptyExperience()]);
  const [education, setEducation] = useState<any[]>([emptyEducation()]);
  const [skillsStr, setSkillsStr] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const id = await saveResume({
      title: title || "Untitled Resume",
      sections: {
        summary: summary || undefined,
        experience: experience.filter((e: any) => e.company && e.role),
        education: education.filter((e: any) => e.institution && e.degree),
        skills: skillsStr.split(",").map((s: string) => s.trim()).filter(Boolean),
      },
    });
    router.push(`/dashboard/seeker/resumes/${id}`);
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Resume</h1>
      <div className="space-y-6">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Resume Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Software Engineer Resume 2026"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Professional Summary</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Brief overview of your background and goals..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Experience</label>
            <button
              onClick={() => setExperience([...experience, emptyExperience()])}
              className="text-xs text-indigo-600 hover:underline"
            >
              + Add
            </button>
          </div>
          {experience.map((exp: any, i: number) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 mb-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input value={exp.company} onChange={(e) => { const x = [...experience]; x[i] = { ...x[i], company: e.target.value }; setExperience(x); }} placeholder="Company" className="px-3 py-1.5 border border-gray-300 rounded text-sm" />
                <input value={exp.role} onChange={(e) => { const x = [...experience]; x[i] = { ...x[i], role: e.target.value }; setExperience(x); }} placeholder="Role" className="px-3 py-1.5 border border-gray-300 rounded text-sm" />
                <input value={exp.startDate} onChange={(e) => { const x = [...experience]; x[i] = { ...x[i], startDate: e.target.value }; setExperience(x); }} placeholder="Start (e.g. Jan 2020)" className="px-3 py-1.5 border border-gray-300 rounded text-sm" />
                <input value={exp.endDate ?? ""} onChange={(e) => { const x = [...experience]; x[i] = { ...x[i], endDate: e.target.value || undefined }; setExperience(x); }} placeholder="End (or leave blank)" className="px-3 py-1.5 border border-gray-300 rounded text-sm" />
              </div>
              <textarea value={exp.description} onChange={(e) => { const x = [...experience]; x[i] = { ...x[i], description: e.target.value }; setExperience(x); }} placeholder="Describe your responsibilities and achievements..." rows={2} className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm" />
              {experience.length > 1 && (
                <button onClick={() => setExperience(experience.filter((_: any, j: number) => j !== i))} className="text-xs text-red-600 hover:underline">Remove</button>
              )}
            </div>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Education</label>
            <button
              onClick={() => setEducation([...education, emptyEducation()])}
              className="text-xs text-indigo-600 hover:underline"
            >
              + Add
            </button>
          </div>
          {education.map((edu: any, i: number) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 mb-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input value={edu.institution} onChange={(e) => { const x = [...education]; x[i] = { ...x[i], institution: e.target.value }; setEducation(x); }} placeholder="Institution" className="px-3 py-1.5 border border-gray-300 rounded text-sm" />
                <input value={edu.degree} onChange={(e) => { const x = [...education]; x[i] = { ...x[i], degree: e.target.value }; setEducation(x); }} placeholder="Degree" className="px-3 py-1.5 border border-gray-300 rounded text-sm" />
                <input value={edu.field} onChange={(e) => { const x = [...education]; x[i] = { ...x[i], field: e.target.value }; setEducation(x); }} placeholder="Field of study" className="px-3 py-1.5 border border-gray-300 rounded text-sm" />
                <input value={edu.year} onChange={(e) => { const x = [...education]; x[i] = { ...x[i], year: e.target.value }; setEducation(x); }} placeholder="Year" className="px-3 py-1.5 border border-gray-300 rounded text-sm" />
              </div>
              {education.length > 1 && (
                <button onClick={() => setEducation(education.filter((_: any, j: number) => j !== i))} className="text-xs text-red-600 hover:underline">Remove</button>
              )}
            </div>
          ))}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Skills</label>
          <input
            value={skillsStr}
            onChange={(e) => setSkillsStr(e.target.value)}
            placeholder="React, TypeScript, Python, ..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Resume"}
        </button>
      </div>
    </div>
  );
}
