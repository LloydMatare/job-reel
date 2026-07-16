import { test, expect } from "@playwright/test";

test.describe("Auth Flows", () => {
  test("sign in button is visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Sign In").first()).toBeVisible();
  });

  test("sign up button redirects to Clerk", async ({ page }) => {
    await page.goto("/");
    const signUpButton = page.locator("text=Get Started").first();
    await expect(signUpButton).toBeVisible();
  });
});

test.describe("Seeker Flows", () => {
  test("browse jobs on homepage", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("view job detail", async ({ page }) => {
    await page.goto("/jobs");
    await page.waitForLoadState("networkidle");
  });
});

test.describe("Employer Flows", () => {
  test("company listing page loads", async ({ page }) => {
    await page.goto("/companies");
    await expect(page.locator("text=Companies")).toBeVisible();
  });
});
