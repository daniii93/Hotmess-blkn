import { test, expect } from "@playwright/test";

const baseUrl = process.env.E2E_BASE_URL ?? "http://127.0.0.1:8090";

test("public login page loads", async ({ page }) => {
  await page.goto(`${baseUrl}/login.php`);
  await expect(page).toHaveTitle(/HOTMESS|Hotmess/i);
});

test.describe("critical MVP flow placeholders", () => {
  const publicRoutes = [
    "/register.php",
    "/login.php",
    "/events.php",
    "/tickets.php",
    "/payment-checkout.php",
    "/chat.php",
    "/admin.php",
    "/scanner.php",
  ];

  for (const route of publicRoutes) {
    test(`${route} responds without fatal error`, async ({ page }) => {
      await page.goto(`${baseUrl}${route}`);
      await expect(page.locator("body")).not.toContainText(/Fatal error|Parse error/i);
    });
  }
});

test.describe("manual E2E coverage targets", () => {
  test.skip("registration, profile completion and verification start");
  test.skip("ticket reservation with full gender quota and waitlist fallback");
  test.skip("Stripe testmode checkout and QR ticket display");
  test.skip("PayPal sandbox checkout");
  test.skip("scanner accepts valid ticket and blocks duplicate scan");
  test.skip("hotel, table, fast lane, group booking and split payment checkout");
  test.skip("admin creates event, scanner access and discount code");
});
