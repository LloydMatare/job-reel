import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getChatHistory = query({
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
      .query("career_chat_messages")
      .withIndex("by_user", (q: any) => q.eq("userId", user._id))
      .order("asc")
      .collect();
  },
});

export const clearChat = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("by_token_identifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (!user) return;
    const messages = await ctx.db
      .query("career_chat_messages")
      .withIndex("by_user", (q: any) => q.eq("userId", user._id))
      .collect();
    for (const m of messages) {
      await ctx.db.delete(m._id);
    }
  },
});
