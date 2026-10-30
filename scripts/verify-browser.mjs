import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
try {
  await page.goto('http://127.0.0.1:8347/kb/decisions/0002-dedupe-by-cause/');
  await page.waitForFunction(() => !!document.querySelector('.verdict'));
  const firstTable = page.locator('table').first();
  assert.equal(await firstTable.locator('tbody tr').count(), 2);
  assert.equal(await firstTable.locator('tbody tr').nth(0).locator('td').nth(1).innerText(), '379');
  assert.equal(await firstTable.locator('tbody tr').nth(1).locator('td').nth(1).innerText(), '33');
  assert.equal(await page.locator('.stamp').innerText(), 'desk ref DR-VSV8-MJN6');
  assert.equal(await page.locator('.verdict').innerText(), 'different causes — keep apart');
  await page.getByRole('combobox', { name: 'tenant', exact: true }).nth(0).selectOption('kettle.books');
  await page.waitForFunction(() => document.querySelector('.verdict')?.textContent === 'same cause — merge');
  assert.equal(await page.locator('.verdict').innerText(), 'same cause — merge');
  await page.getByRole('combobox', { name: 'tenant', exact: true }).nth(0).selectOption('alder.physio');
  await page.waitForFunction(() => document.querySelector('.verdict')?.textContent === 'different causes — keep apart');
  await mkdir('evidence', { recursive: true });
  await page.screenshot({ path: 'evidence/review-desktop.png', fullPage: true });
  const desktop = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth }));
  assert.ok(desktop.scrollWidth <= desktop.width, JSON.stringify(desktop));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'evidence/review-mobile.png', fullPage: true });
  const mobile = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth }));
  assert.ok(mobile.scrollWidth <= mobile.width, JSON.stringify(mobile));
  await page.goto('http://127.0.0.1:8347/kb/');
  assert.equal(await page.getByRole('link', { name: '0002 · Split #4471 and deduplicate by cause' }).count(), 1);
  assert.equal(await page.locator('table tbody tr').count(), 4);
  assert.deepEqual(errors, []);
  await writeFile('evidence/browser-check.json', JSON.stringify({ desktop, mobile, hydratedExplorer: true, indexPages: 4, pageErrors: errors }, null, 2) + '\n');
  console.log('Browser verified rendered counts, signature, interactive merge changes, index, desktop, and mobile.');
} finally {
  await browser.close();
}
