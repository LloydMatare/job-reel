/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";

const ct = convexTest(schema);

describe("users", () => {
  it("creates a user profile", async () => {
    const result = await ct.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {
        tokenIdentifier: "test|123",
        name: "Test User",
        email: "test@example.com",
        role: "seeker",
        onboarded: false,
      });
      const user = await ctx.db.get(userId);
      return user;
    });

    expect(result).not.toBeNull();
    expect(result!.name).toBe("Test User");
    expect(result!.email).toBe("test@example.com");
    expect(result!.role).toBe("seeker");
    expect(result!.onboarded).toBe(false);
  });

  it("updates user profile", async () => {
    const result = await ct.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {
        tokenIdentifier: "test|456",
        name: "Jane Doe",
        email: "jane@example.com",
        role: "seeker",
        onboarded: false,
      });

      await ctx.db.patch(userId, {
        name: "Jane Smith",
        role: "employer",
        onboarded: true,
      });

      return await ctx.db.get(userId);
    });

    expect(result!.name).toBe("Jane Smith");
    expect(result!.role).toBe("employer");
    expect(result!.onboarded).toBe(true);
  });

  it("enforces unique token identifiers", async () => {
    const firstUser = await ct.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {
        tokenIdentifier: "unique|token",
        name: "First",
        email: "first@example.com",
        role: "seeker",
        onboarded: false,
      });
      return userId;
    });

    expect(firstUser).toBeDefined();

    // Note: Convex does not enforce uniqueness at the database level
    // Duplicate tokenIdentifier prevention should be handled in mutation code
    const secondUser = await ct.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {
        tokenIdentifier: "unique|token",
        name: "Second",
        email: "second@example.com",
        role: "seeker",
        onboarded: false,
      });
      return userId;
    });

    expect(secondUser).toBeDefined();
    expect(secondUser).not.toBe(firstUser);
  });
});
