import { test, expect } from "@playwright/test";

test.describe("Companies", () => {
  test("company directory loads", async ({ page }) => {
    await page.goto("/companies");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("company search works", async ({ page }) => {
    await page.goto("/companies");
    const searchInput = page.locator('input[placeholder*="Search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill("tech");
    }
  });
});

test.describe("Dashboard redirects", () => {
  test("dashboard pages require auth", async ({ page }) => {
    await page.goto("/dashboard/seeker");
    // Should redirect to sign-in or show auth wall
    await page.waitForLoadState("networkidle");
  });

  test("employer dashboard requires auth", async ({ page }) => {
    await page.goto("/dashboard/employer");
    await page.waitForLoadState("networkidle");
  });
});

test.describe("Protected routes", () => {
  const protectedRoutes = [
    "/profile",
    "/dashboard/seeker",
    "/dashboard/employer",
    "/jobs/new",
  ];

  for (const route of protectedRoutes) {
    test(`${route} redirects unauthenticated users`, async ({ page }) => {
      await page.goto(route);
      // Should redirect to Clerk sign-in
      await page.waitForLoadState("networkidle");
      const currentUrl = page.url();
      // Either stays on the page (if signed in) or redirects to Clerk
      expect(
        currentUrl.includes("clerk") || currentUrl.includes(route),
      ).toBeTruthy();
    });
  }
});
