import { query } from "./_generated/server";

export const health = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return {
      status: "healthy",
      timestamp: Date.now(),
      users: users.length,
    };
  },
});
