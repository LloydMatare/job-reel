import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const saveResume = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("users")
      .withIndex("by_token_identifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    const userId = existing?._id ?? await ctx.db.insert("users", {
      tokenIdentifier: identity.tokenIdentifier,
      name: identity.name ?? identity.email ?? "",
      email: identity.email ?? identity.tokenIdentifier,
      avatarUrl: identity.pictureUrl ?? undefined,
      role: "seeker",
      onboarded: false,
    });

    return ctx.db.insert("resumes", { userId, title: args.title, sections: args.sections });
  },
});

export const updateResume = mutation({
  args: {
    resumeId: v.id("resumes"),
    title: v.optional(v.string()),
    sections: v.optional(
      v.object({
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
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("users")
      .withIndex("by_token_identifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    const userId = existing?._id ?? await ctx.db.insert("users", {
      tokenIdentifier: identity.tokenIdentifier,
      name: identity.name ?? identity.email ?? "",
      email: identity.email ?? identity.tokenIdentifier,
      avatarUrl: identity.pictureUrl ?? undefined,
      role: "seeker",
      onboarded: false,
    });

    const resume = await ctx.db.get(args.resumeId);
    if (!resume || resume.userId !== userId) throw new Error("Not found");
    const patch: Record<string, unknown> = {};
    if (args.title !== undefined) patch.title = args.title;
    if (args.sections !== undefined) patch.sections = args.sections;
    await ctx.db.patch(args.resumeId, patch);
  },
});

export const getMyResumes = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query("users")
      .withIndex("by_token_identifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (!user) return [];
    return ctx.db
      .query("resumes")
      .withIndex("by_user", (q: any) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const getResume = query({
  args: { resumeId: v.id("resumes") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const resume = await ctx.db.get(args.resumeId);
    if (!resume) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_token_identifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (!user || resume.userId !== user._id) return null;
    return resume;
  },
});

export const deleteResume = mutation({
  args: { resumeId: v.id("resumes") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("users")
      .withIndex("by_token_identifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    const userId = existing?._id ?? await ctx.db.insert("users", {
      tokenIdentifier: identity.tokenIdentifier,
      name: identity.name ?? identity.email ?? "",
      email: identity.email ?? identity.tokenIdentifier,
      avatarUrl: identity.pictureUrl ?? undefined,
      role: "seeker",
      onboarded: false,
    });

    const resume = await ctx.db.get(args.resumeId);
    if (!resume || resume.userId !== userId) throw new Error("Not found");
    await ctx.db.delete(args.resumeId);
  },
});
