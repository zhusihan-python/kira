import { expect, test } from '@playwright/test';

// 主导航直接展示：各常见宽度下四个入口首次加载即可见、可用，无需折叠菜单。
const navLinks = ['首页', '项目', '记录', '关于'] as const;

for (const width of [320, 390, 768, 1440]) {
  test.describe(`${width}px 视口`, () => {
    test.use({ viewport: { width, height: 844 } });

    test('主导航直接可见且不与姓名重叠', async ({ page }) => {
      await page.goto('/');
      const viewport = page.viewportSize();
      expect(viewport).not.toBeNull();

      const titleBox = await page.locator('.site-title').boundingBox();

      for (const name of navLinks) {
        const link = page.locator('.site-nav').getByRole('link', { name, exact: true });
        await expect(link).toBeVisible();

        const box = await link.boundingBox();
        expect(box).not.toBeNull();
        expect(box!.x).toBeGreaterThanOrEqual(0);
        expect(box!.x + box!.width).toBeLessThanOrEqual(viewport!.width + 0.5);
        expect(box!.y).toBeGreaterThanOrEqual(0);
        expect(box!.y + box!.height).toBeLessThanOrEqual(viewport!.height + 0.5);

        // 触控区域至少 44×44px（容许 0.5px 舍入误差）。
        expect(box!.width).toBeGreaterThanOrEqual(44 - 0.5);
        expect(box!.height).toBeGreaterThanOrEqual(44 - 0.5);

        if (titleBox) {
          const overlapsHorizontally =
            box!.x < titleBox.x + titleBox.width && titleBox.x < box!.x + box!.width;
          const overlapsVertically =
            box!.y < titleBox.y + titleBox.height && titleBox.y < box!.y + box!.height;
          expect(overlapsHorizontally && overlapsVertically).toBe(false);
        }
      }
    });
  });
}

test('点击主导航“项目”直接进入项目页', async ({ page }) => {
  await page.goto('/');
  await page.locator('.site-nav').getByRole('link', { name: '项目', exact: true }).click();
  await expect(page).toHaveURL(/\/projects\/?$/);
  await expect(page.getByRole('heading', { level: 1, name: '项目' })).toBeVisible();
});

test('禁用 JS 后主导航仍可使用', async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 320, height: 844 },
  });
  const page = await context.newPage();
  await page.goto('/');

  await page.locator('.site-nav').getByRole('link', { name: '记录', exact: true }).click();
  await expect(page).toHaveURL(/\/notes\/?$/);
  await expect(page.getByRole('heading', { level: 1, name: '记录' })).toBeVisible();
  await context.close();
});

test('详情页的 aria-current 归属于对应栏目', async ({ page }) => {
  await page.goto('/projects/testhub/');
  await expect(
    page.locator('.site-nav').getByRole('link', { name: '项目', exact: true }),
  ).toHaveAttribute('aria-current', 'page');

  await page.goto('/notes/executor-crash-classification/');
  await expect(
    page.locator('.site-nav').getByRole('link', { name: '记录', exact: true }),
  ).toHaveAttribute('aria-current', 'page');
});
