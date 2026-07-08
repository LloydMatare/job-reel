import { StatusBadge } from "./StatusBadge";

interface ApplicationCardProps {
  applicationId: string;
  applicantName: string;
  applicantEmail: string;
  status: string;
  createdAt: number;
  coverLetter?: string | null;
  avatarUrl?: string | null;
  onClick?: () => void;
}

export function ApplicationCard({
  applicantName,
  applicantEmail,
  status,
  createdAt,
  coverLetter,
  avatarUrl,
  onClick,
}: ApplicationCardProps) {
  const initials = applicantName?.charAt(0) ?? "?";

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0">
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-medium text-gray-900 truncate">
              {applicantName}
            </p>
            <p className="text-sm text-gray-500 truncate">{applicantEmail}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={status} />
          <span className="text-xs text-gray-400">
            {new Date(createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
      {coverLetter && (
        <p className="mt-3 text-sm text-gray-600 line-clamp-2">{coverLetter}</p>
      )}
    </button>
  );
}
