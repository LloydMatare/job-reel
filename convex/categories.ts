import { v } from "convex/values";
import { query } from "./_generated/server";

export const listCategories = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("categories").order("desc").take(50);
  },
});

export const getCategory = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});
