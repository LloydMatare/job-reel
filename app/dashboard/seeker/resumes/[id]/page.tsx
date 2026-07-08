"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { useState, useRef } from "react";

export default function ResumeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const resume = useQuery(api.resumes.getResume, { resumeId: params.id as any });
  const updateResume = useMutation(api.resumes.updateResume);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  if (!resume) return <div className="p-8">Loading...</div>;

  const handlePrint = () => window.print();

  const handleSave = async () => {
    await updateResume({ resumeId: params.id as any, title, sections: resume.sections });
    setEditing(false);
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          {editing ? (
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl font-bold text-gray-900 border border-gray-300 rounded px-2 py-1"
            />
          ) : (
            <h1 className="text-2xl font-bold text-gray-900">{resume.title}</h1>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (editing) {
                handleSave();
              } else {
                setTitle(resume.title);
                setSummary(resume.sections.summary ?? "");
                setEditing(true);
              }
            }}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
          >
            {editing ? "Save" : "Edit"}
          </button>
          {!editing && (
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
            >
              Print / PDF
            </button>
          )}
        </div>
      </div>

      <div ref={printRef} className="bg-white border border-gray-200 rounded-xl p-8 print:border-0 print:p-0">
        {resume.sections.summary && (
          <section className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Summary</h2>
            <p className="text-sm text-gray-700">{resume.sections.summary}</p>
          </section>
        )}

        {resume.sections.experience.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Experience</h2>
            {resume.sections.experience.map((exp: any, i: number) => (
              <div key={i} className="mb-4">
                <h3 className="font-medium text-gray-900">{exp.role}</h3>
                <p className="text-sm text-gray-600">{exp.company} &middot; {exp.startDate}{exp.endDate ? ` - ${exp.endDate}` : ""}</p>
                <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{exp.description}</p>
              </div>
            ))}
          </section>
        )}

        {resume.sections.education.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Education</h2>
            {resume.sections.education.map((edu: any, i: number) => (
              <div key={i} className="mb-2">
                <h3 className="font-medium text-gray-900">{edu.degree} in {edu.field}</h3>
                <p className="text-sm text-gray-600">{edu.institution} &middot; {edu.year}</p>
              </div>
            ))}
          </section>
        )}

        {resume.sections.skills.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {resume.sections.skills.map((s: string, i: number) => (
                <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">{s}</span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
