import { test, expect, type Page } from "@playwright/test";

/**
 * E2E: full booking flow (Implements SRS-HTL-01 / SRS-HTL-02).
 * Covers the three calendar systems (Gregorian, Jalali, Hijri) and submission.
 */

const uniqueEmail = () => `e2e_${Date.now()}@example.com`;

const gotoBooking = async (page: Page) => {
  await page.goto("/");
  await page.locator("#booking").scrollIntoViewIfNeeded();
  await expect(page.getByTestId("calendar-system-gregory")).toBeVisible();
};

const selectStay = async (page: Page) => {
  // Pick two future days in the currently displayed month.
  const enabledDays = page.locator("#booking button[name='day']:not([disabled])");
  await expect(enabledDays.first()).toBeVisible();
  const count = await enabledDays.count();
  expect(count).toBeGreaterThan(1);
  await enabledDays.nth(0).click();
  await enabledDays.nth(Math.min(2, count - 1)).click();
  await expect(page.getByTestId("nights-summary")).toBeVisible();
};

test.describe("booking flow", () => {
  test("supports Gregorian, Jalali and Hijri calendars", async ({ page }) => {
    await gotoBooking(page);

    for (const system of ["gregory", "persian", "islamic-umalqura"] as const) {
      await page.getByTestId(`calendar-system-${system}`).click();
      await expect(page.getByTestId(`calendar-system-${system}`)).toHaveAttribute(
        "aria-checked",
        "true",
      );
      const caption = page.locator("#booking .rdp-caption_label, #booking [class*='caption']").first();
      await expect(caption).not.toBeEmpty();
    }
  });

  test("detects language and allows switching", async ({ page }) => {
    await gotoBooking(page);
    await page.getByTestId("language-switcher").click();
    await page.getByRole("menuitem", { name: /فارسی|Persian/i }).click();
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("html")).toHaveAttribute("lang", /fa/);
  });

  test("submits a complete booking", async ({ page }) => {
    await gotoBooking(page);

    await page.locator("#location").click();
    await page.getByRole("option").first().click();

    await page.locator("#guests").click();
    await page.getByRole("option").first().click();

    await selectStay(page);

    await page.getByRole("button", { name: /continue|ادامه/i }).click();

    await page.locator("#name").fill("E2E Tester");
    await page.locator("#phone").fill("+44 7700 900123");
    await page.locator("#email").fill(uniqueEmail());
    await page.locator("#postcode").fill("SW1A 1AA");

    await page.getByRole("button", { name: /submit booking|ثبت رزرو/i }).click();

    await expect(page.getByTestId("booking-success")).toBeVisible({ timeout: 20_000 });
  });
});
