import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

type JobWithCompany = {
  _id: string;
  title: string;
  company: {
    name: string;
    logoStorageId?: string;
    slug: string;
  } | null;
  location: string;
  locationType: string;
  employmentType: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  skills?: string[];
  category?: string;
  status: string;
  _creationTime: number;
};

interface JobCardProps {
  job: JobWithCompany;
}

function timeAgo(creationTime: number): string {
  const now = Date.now();
  const diffMs = now - creationTime;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

export function JobCard({ job }: JobCardProps) {
  const salary =
    job.salaryMin && job.salaryMax
      ? `${job.salaryCurrency ?? "$"}${job.salaryMin.toLocaleString()} - ${job.salaryCurrency ?? "$"}${job.salaryMax.toLocaleString()}`
      : null;

  return (
    <Link href={`/jobs/${job._id}`}>
      <Card className="p-5 h-full flex flex-col hover:border-blue-300 transition-colors">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0">
            {job.company?.name?.charAt(0) ?? "?"}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {job.title}
            </h3>
            <p className="text-sm text-gray-600 truncate">
              {job.company?.name ?? "Unknown Company"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          <Badge variant="info">{job.locationType}</Badge>
          <Badge>{job.employmentType}</Badge>
          {job.category && <Badge variant="default">{job.category}</Badge>}
        </div>

        <p className="text-sm text-gray-500 mb-1">
          {job.location}
        </p>

        {salary && (
          <p className="text-sm font-medium text-gray-900 mb-1">{salary}</p>
        )}

        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto pt-3">
            {job.skills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded"
              >
                {skill}
              </span>
            ))}
            {job.skills.length > 3 && (
              <span className="text-xs text-gray-400">
                +{job.skills.length - 3}
              </span>
            )}
          </div>
        )}

        <p className="text-xs text-gray-400 mt-3">
          {timeAgo(job._creationTime)}
        </p>
      </Card>
    </Link>
  );
}
