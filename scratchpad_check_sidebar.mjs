import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('http://localhost:5174/login');
await page.fill('input[type="email"], input[name="email"]', 'test@example.com').catch(()=>{});
const inputs = await page.$$('input');
for (const i of inputs) {
  const type = await i.getAttribute('type');
  if (type === 'email' || type === 'text') await i.fill('test@example.com');
  if (type === 'password') await i.fill('password123');
}
await page.click('button[type="submit"]').catch(async () => {
  await page.getByRole('button', { name: /로그인|login/i }).click();
});
await page.waitForTimeout(1000);

// find a collapsible group trigger in sidebar
const trigger = page.locator('[data-slot="collapsible-trigger"]').first();
await trigger.waitFor({ state: 'visible', timeout: 5000 });

const panel = page.locator('[data-slot="collapsible-content"]').first();

// measure height right after click, a bit later
await trigger.click();
const h0 = await panel.evaluate(el => el.getBoundingClientRect().height);
await page.waitForTimeout(80);
const h1 = await panel.evaluate(el => el.getBoundingClientRect().height);
await page.waitForTimeout(300);
const h2 = await panel.evaluate(el => el.getBoundingClientRect().height);

console.log('height @0ms:', h0, '@80ms:', h1, '@380ms:', h2);

await page.screenshot({ path: '/tmp/sidebar_open.png' });

await browser.close();
