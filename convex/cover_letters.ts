import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const saveCoverLetter = mutation({
  args: {
    content: v.string(),
    jobId: v.optional(v.id("jobs")),
    resumeId: v.optional(v.id("resumes")),
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

    return ctx.db.insert("cover_letters", {
      userId,
      content: args.content,
      jobId: args.jobId,
      resumeId: args.resumeId,
    });
  },
});

export const getMyCoverLetters = query({
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
      .query("cover_letters")
      .withIndex("by_user", (q: any) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const getCoverLetter = query({
  args: { coverLetterId: v.id("cover_letters") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const cl = await ctx.db.get(args.coverLetterId);
    if (!cl) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_token_identifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (!user || cl.userId !== user._id) return null;
    if (cl.jobId) {
      const job = await ctx.db.get(cl.jobId);
      return { ...cl, jobTitle: job?.title };
    }
    return cl;
  },
});

export const deleteCoverLetter = mutation({
  args: { coverLetterId: v.id("cover_letters") },
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

    const cl = await ctx.db.get(args.coverLetterId);
    if (!cl || cl.userId !== userId) throw new Error("Not found");
    await ctx.db.delete(args.coverLetterId);
  },
});
