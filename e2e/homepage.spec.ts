import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("loads and displays hero section", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
  });

  test("navigation links are visible", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("text=Find Jobs")).toBeVisible();
    await expect(page.locator("text=Insights")).toBeVisible();
  });

  test("can navigate to jobs page", async ({ page }) => {
    await page.goto("/");
    await page.click("text=Find Jobs");
    await expect(page).toHaveURL(/\/jobs/);
  });
});

test.describe("Jobs Search", () => {
  test("loads job listings", async ({ page }) => {
    await page.goto("/jobs");
    await expect(page.locator("text=Find Your Dream Job")).toBeVisible();
  });

  test("search input works", async ({ page }) => {
    await page.goto("/jobs");
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill("engineer");
    await expect(searchInput).toHaveValue("engineer");
  });
});

test.describe("Insights Page", () => {
  test("loads market insights", async ({ page }) => {
    await page.goto("/insights");
    await expect(page.locator("text=Job Market Insights")).toBeVisible();
  });
});
