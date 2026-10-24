const { test, expect } = require("@playwright/test");

test("renders the complete landing page without horizontal overflow", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("meta_ads_consent_v1", "rejected"));
  await page.goto("/?utm_source=ig&utm_medium=social&utm_content=qa");
  await expect(page).toHaveTitle(/Rafael Dias/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Quando você ama seu reflexo");
  await expect(page.locator("main section")).toHaveCount(7);

  for (const width of [360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 1000 });
    const dimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(dimensions.scrollWidth, `overflow at ${width}px`).toBeLessThanOrEqual(dimensions.clientWidth + 1);

    const caseImage = await page.locator(".case img").first().boundingBox();
    expect(Math.abs(caseImage.width - caseImage.height), `case image is not square at ${width}px`).toBeLessThanOrEqual(1);
  }
});

test("opens, validates and sends the qualified lead to WhatsApp", async ({ page }) => {
  await page.route("https://connect.facebook.net/**", (route) => route.fulfill({ status: 200, contentType: "application/javascript", body: "" }));
  await page.addInitScript(() => {
    localStorage.setItem("meta_ads_consent_v1", "accepted");
    window.open = (url) => {
      window.__openedWhatsAppUrl = url;
      return {};
    };
  });
  await page.goto("/?utm_source=ig&utm_medium=social&utm_campaign=smoke");
  const cta = page.locator(".js-open-form").first();
  await cta.click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(page.locator("[data-progress='1']")).toHaveAttribute("aria-current", "step");

  await page.locator(".form-next").click();
  await expect(page.locator("#contact-error")).toContainText("Informe seu nome");

  await page.locator("#lead-name").fill("Paciente Teste");
  await page.locator("#lead-phone").fill("94991360408");
  await page.locator("#lead-email").fill("paciente@exemplo.com");
  await page.locator(".form-next").click();
  await page.getByLabel("30 a 39 anos").check();
  await page.locator(".form-next").click();
  await page.getByLabel("Tenho uma rotina regular de cuidados").check();
  await page.locator(".form-next").click();
  await page.getByLabel("Melhorar minha autoestima").check();
  await page.locator(".form-next").click();
  await page.getByLabel("R$ 6.000 a R$ 10.000").check();

  await expect(page.locator("[name='utm_source']")).toHaveValue("ig");
  await expect(page.locator("[name='utm_campaign']")).toHaveValue("smoke");
  const submit = page.locator(".form-submit");
  await expect(submit).toBeVisible();
  await expect(submit).toHaveText(/Abrir WhatsApp/);
  await submit.click();
  await expect.poll(() => page.evaluate(() => window.__openedWhatsAppUrl || "")).toContain("https://wa.me/559491830101");
  await expect.poll(() => page.evaluate(() => decodeURIComponent(window.__openedWhatsAppUrl || ""))).toContain("Faixa de investimento: R$ 6.000 a R$ 10.000");
  await expect.poll(() => page.evaluate(() => window.dataLayer.some((item) => item.event === "generate_lead"))).toBe(true);
  await expect.poll(() => page.evaluate(() => window.fbq?.queue?.some((args) => args[0] === "track" && args[1] === "Lead"))).toBe(true);

  await page.getByRole("button", { name: "Fechar formulário" }).click();
  await expect(dialog).toBeHidden();
  await expect(cta).toBeFocused();
});

test("loads Meta Pixel and PageView immediately", async ({ page }) => {
  await page.route("https://connect.facebook.net/**", (route) => route.fulfill({ status: 200, contentType: "application/javascript", body: "" }));
  await page.goto("/");

  await expect(page.locator("#cookie-consent")).toHaveCount(0);
  await expect(page.locator('script[src="https://connect.facebook.net/en_US/fbevents.js"]')).toHaveCount(1);
  await expect.poll(() =>
    page.evaluate(() => window.fbq?.queue?.some((args) => args[0] === "init" && args[1] === "2258593511572731")),
  ).toBe(true);
  await expect.poll(() => page.evaluate(() => window.fbq?.queue?.some((args) => args[0] === "track" && args[1] === "PageView"))).toBe(true);
});

test("supports carousel pause, hero pause and credentials accordion", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("meta_ads_consent_v1", "rejected"));
  await page.goto("/");
  const heroPause = page.locator('[data-media-toggle="hero"]');
  await heroPause.click();
  await expect(heroPause).toHaveAttribute("aria-pressed", "true");

  const carouselPause = page.locator(".carousel-controls__pause");
  if (await carouselPause.isVisible()) {
    await carouselPause.click();
    await expect(carouselPause).toHaveAttribute("aria-pressed", "true");
  }

  const details = page.locator(".credentials");
  await details.locator("summary").click();
  await expect(details).toHaveAttribute("open", "");
});
