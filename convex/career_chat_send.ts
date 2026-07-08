import { v } from "convex/values";
import { action } from "./_generated/server";
import { api, internal } from "./_generated/api";

export const sendMessage = action({
  args: {
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = await ctx.runMutation(api.users.ensureUser, {});

    await ctx.runMutation(internal.career_chat_helpers.internalSaveMessage, {
      userId,
      role: "user",
      content: args.content,
    });

    const user = await ctx.runQuery(internal.users.getUserByToken, {
      tokenIdentifier: identity.tokenIdentifier,
    });

    const history: any[] = await ctx.runQuery(internal.career_chat_helpers.internalGetHistory, {
      userId,
    });

    const aiResponse: string = await ctx.runAction(api.ai.askCareerQuestion, {
      question: args.content,
      userSummary: user?.bio ?? undefined,
      userSkills: user?.skills ? user.skills.join(", ") : undefined,
      chatHistory: history.slice(-10).map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
    });

    await ctx.runMutation(internal.career_chat_helpers.internalSaveMessage, {
      userId,
      role: "assistant",
      content: aiResponse,
    });

    return aiResponse;
  },
});
