import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const seedCategories = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("categories").take(1);
    if (existing.length > 0) return;

    const categories = [
      { name: "Software Engineering", slug: "software-engineering", icon: "💻" },
      { name: "Data Science", slug: "data-science", icon: "📊" },
      { name: "Design", slug: "design", icon: "🎨" },
      { name: "Marketing", slug: "marketing", icon: "📢" },
      { name: "Sales", slug: "sales", icon: "💰" },
      { name: "Customer Support", slug: "customer-support", icon: "🎧" },
      { name: "Finance", slug: "finance", icon: "🏦" },
      { name: "Healthcare", slug: "healthcare", icon: "🏥" },
      { name: "Education", slug: "education", icon: "📚" },
      { name: "Human Resources", slug: "human-resources", icon: "👥" },
      { name: "Legal", slug: "legal", icon: "⚖️" },
      { name: "Operations", slug: "operations", icon: "⚙️" },
    ];

    for (const category of categories) {
      await ctx.db.insert("categories", category);
    }
  },
});
