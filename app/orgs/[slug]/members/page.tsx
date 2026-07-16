"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Users, Shield, Briefcase, Eye, Trash2, Loader2 } from "lucide-react";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  recruiter: "Recruiter",
  member: "Member",
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  admin: "Full access — manage jobs, billing, and members",
  recruiter: "Can post and manage jobs, billing and members restricted",
  member: "View job listings and applications only",
};

export default function OrgMembersPage() {
  const members = useQuery(api.company_members.listCompanyMembers);
  const updateRole = useMutation(api.company_members.updateMemberRole);
  const removeMember = useMutation(api.company_members.removeMember);
  const myRole = useQuery(api.permissions.getMyCompanyRole);

  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  if (!members || !myRole) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const isAdmin = myRole === "admin";

  const handleRoleChange = async (
    memberId: string,
    role: "admin" | "recruiter" | "member",
  ) => {
    setLoadingId(memberId);
    setError("");
    try {
      await updateRole({ memberId: memberId as any, role });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update role");
    } finally {
      setLoadingId(null);
    }
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    setLoadingId(memberId);
    setError("");
    try {
      await removeMember({ memberId: memberId as any });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to remove member");
    } finally {
      setLoadingId(null);
    }
  };

  const ROLE_ICONS: Record<string, typeof Shield | typeof Briefcase | typeof Eye> = {
    admin: Shield,
    recruiter: Briefcase,
    member: Eye,
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 px-6 py-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.15),transparent_50%)]" />
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Members</h1>
            <p className="text-sm text-white/60 mt-0.5">Manage team roles and permissions</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {(Object.entries(ROLE_LABELS) as [string, string][]).map(([key, label]) => {
          const Icon = ROLE_ICONS[key];
          const desc = ROLE_DESCRIPTIONS[key];
          return (
            <div key={key} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className={`size-8 rounded-lg flex items-center justify-center ${
                  key === "admin"
                    ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                    : key === "recruiter"
                      ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                      : "bg-muted text-muted-foreground"
                }`}>
                  <Icon className="size-4" />
                </div>
                <span className="font-semibold text-sm text-foreground">{label}</span>
              </div>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {members.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No members found.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {members.map((m) => {
              const roleIcon = ROLE_ICONS[m.role];
              const isSelf = false;
              return (
                <div key={m._id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="size-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {m.user?.name?.charAt(0) ?? "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {m.user?.name ?? "Unknown"}
                        {isSelf && <span className="text-xs text-muted-foreground ml-1">(you)</span>}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {m.user?.email ?? ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isAdmin && m.role !== "admin" ? (
                      <select
                        value={m.role}
                        onChange={(e) =>
                          handleRoleChange(
                            m._id,
                            e.target.value as "admin" | "recruiter" | "member",
                          )
                        }
                        disabled={loadingId === m._id}
                        className="px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                      >
                        <option value="admin">Admin</option>
                        <option value="recruiter">Recruiter</option>
                        <option value="member">Member</option>
                      </select>
                    ) : (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                        m.role === "admin"
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                          : m.role === "recruiter"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            : "bg-muted text-muted-foreground"
                      }`}>
                        {React.createElement(roleIcon, { className: "size-3.5" })}
                        {ROLE_LABELS[m.role]}
                      </span>
                    )}

                    {isAdmin && (
                      <button
                        onClick={() => handleRemove(m._id)}
                        disabled={loadingId === m._id}
                        className="p-2 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                      >
                        {loadingId === m._id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
