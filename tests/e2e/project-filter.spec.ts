import { expect, test } from '@playwright/test';

test('筛选“产品实践”只展示 MindForge，“全部”恢复四项', async ({ page }) => {
  await page.goto('/projects/');
  const items = page.locator('[data-category]');
  const emptyNote = page.locator('[data-empty-note]');

  await expect(items).toHaveCount(4);
  for (const item of await items.all()) {
    await expect(item).toBeVisible();
  }
  await expect(emptyNote).toBeHidden();

  await page.getByRole('button', { name: '产品实践' }).click();
  await expect(page.getByRole('button', { name: '产品实践' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: '全部' })).toHaveAttribute('aria-pressed', 'false');

  const visible = items.filter({ visible: true });
  await expect(visible).toHaveCount(1);
  await expect(page.locator('[data-category="产品实践"] h3')).toContainText('MindForge');
  // 有结果时空态必须真正隐藏（不在可访问树中），而不是仅视觉隐藏。
  await expect(emptyNote).toBeHidden();
  await expect(emptyNote).not.toHaveAttribute('class', /visually-hidden/);

  await page.getByRole('button', { name: '全部' }).click();
  await expect(items.filter({ visible: true })).toHaveCount(4);
  await expect(emptyNote).toBeHidden();
});
