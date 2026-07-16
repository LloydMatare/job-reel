import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.string(),
    email: v.string(),
    avatarUrl: v.optional(v.string()),
    role: v.union(v.literal("seeker"), v.literal("employer"), v.literal("admin")),
    phone: v.optional(v.string()),
    location: v.optional(v.string()),
    bio: v.optional(v.string()),
    resumeStorageId: v.optional(v.id("_storage")),
    skills: v.optional(v.array(v.string())),
    companyId: v.optional(v.id("companies")),
    onboarded: v.boolean(),
  }).index("by_token_identifier", ["tokenIdentifier"]),

  companies: defineTable({
    name: v.string(),
    slug: v.string(),
    clerkOrgId: v.string(),
    description: v.string(),
    logoStorageId: v.optional(v.id("_storage")),
    website: v.optional(v.string()),
    location: v.optional(v.string()),
    size: v.optional(v.string()),
    industry: v.optional(v.string()),
    ownerId: v.id("users"),
    plan: v.union(
      v.literal("free"),
      v.literal("pro"),
      v.literal("enterprise"),
    ),
  })
    .index("by_slug", ["slug"])
    .index("by_owner", ["ownerId"])
    .index("by_clerk_org", ["clerkOrgId"]),

  jobs: defineTable({
    companyId: v.id("companies"),
    title: v.string(),
    description: v.string(),
    requirements: v.optional(v.string()),
    responsibilities: v.optional(v.string()),
    location: v.string(),
    locationType: v.union(
      v.literal("on-site"),
      v.literal("remote"),
      v.literal("hybrid"),
    ),
    employmentType: v.union(
      v.literal("full-time"),
      v.literal("part-time"),
      v.literal("contract"),
      v.literal("temporary"),
      v.literal("internship"),
    ),
    salaryMin: v.optional(v.number()),
    salaryMax: v.optional(v.number()),
    salaryCurrency: v.optional(v.string()),
    category: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    status: v.union(
      v.literal("active"),
      v.literal("closed"),
      v.literal("draft"),
    ),
    applicationCount: v.number(),
    featured: v.optional(v.boolean()),
  })
    .index("by_company", ["companyId"])
    .index("by_status", ["status"])
    .index("by_company_and_status", ["companyId", "status"])
    .index("by_category_and_status", ["category", "status"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["status"],
    }),

  applications: defineTable({
    jobId: v.id("jobs"),
    userId: v.id("users"),
    resumeStorageId: v.optional(v.id("_storage")),
    coverLetter: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("reviewing"),
      v.literal("shortlisted"),
      v.literal("rejected"),
      v.literal("hired"),
    ),
    employerNotes: v.optional(v.string()),
  })
    .index("by_job", ["jobId"])
    .index("by_user", ["userId"])
    .index("by_job_and_status", ["jobId", "status"])
    .index("by_user_and_job", ["userId", "jobId"]),

  saved_jobs: defineTable({
    userId: v.id("users"),
    jobId: v.id("jobs"),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_job", ["userId", "jobId"]),

  job_alerts: defineTable({
    userId: v.id("users"),
    keywords: v.optional(v.string()),
    category: v.optional(v.string()),
    location: v.optional(v.string()),
    employmentType: v.optional(
      v.union(
        v.literal("full-time"),
        v.literal("part-time"),
        v.literal("contract"),
        v.literal("temporary"),
        v.literal("internship"),
      ),
    ),
    salaryMin: v.optional(v.number()),
    frequency: v.union(v.literal("daily"), v.literal("weekly")),
    lastSent: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_frequency", ["frequency"]),

  resumes: defineTable({
    userId: v.id("users"),
    title: v.string(),
    sections: v.object({
      summary: v.optional(v.string()),
      experience: v.array(
        v.object({
          company: v.string(),
          role: v.string(),
          startDate: v.string(),
          endDate: v.optional(v.string()),
          description: v.string(),
        }),
      ),
      education: v.array(
        v.object({
          institution: v.string(),
          degree: v.string(),
          field: v.string(),
          year: v.string(),
        }),
      ),
      skills: v.array(v.string()),
    }),
  }).index("by_user", ["userId"]),

  cover_letters: defineTable({
    userId: v.id("users"),
    jobId: v.optional(v.id("jobs")),
    resumeId: v.optional(v.id("resumes")),
    content: v.string(),
  }).index("by_user", ["userId"]),

  career_chat_messages: defineTable({
    userId: v.id("users"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
  }).index("by_user", ["userId"]),

  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    icon: v.optional(v.string()),
  }).index("by_slug", ["slug"]),

  company_members: defineTable({
    companyId: v.id("companies"),
    userId: v.id("users"),
    role: v.union(
      v.literal("admin"),
      v.literal("recruiter"),
      v.literal("member"),
    ),
  })
    .index("by_company", ["companyId"])
    .index("by_user", ["userId"])
    .index("by_company_and_user", ["companyId", "userId"]),
});
