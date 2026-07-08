import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

export const internalSaveMessage = internalMutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("career_chat_messages", {
      userId: args.userId,
      role: args.role,
      content: args.content,
    });
  },
});

export const internalGetHistory = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return ctx.db
      .query("career_chat_messages")
      .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
      .order("asc")
      .collect();
  },
});
