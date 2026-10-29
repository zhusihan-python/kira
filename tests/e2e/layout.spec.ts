import { expect, test } from '@playwright/test';

const pages = [
  '/',
  '/projects/',
  '/notes/',
  '/about/',
  '/projects/mobilegym/',
  '/projects/testhub/',
  '/projects/mindforge/',
  '/projects/perfcat/',
  '/notes/executor-crash-classification/',
  '/notes/android-control-feedback/',
];

const widths = [320, 390, 1440] as const;

for (const width of widths) {
  test(`宽度 ${width}px 主要页面与项目长标题不产生水平溢出`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of pages) {
      await page.goto(path);
      const overflow = await page.evaluate(() => {
        const doc = document.documentElement;
        return doc.scrollWidth - doc.clientWidth;
      });
      expect(overflow, `${path} 在 ${width}px 下溢出 ${overflow}px`).toBeLessThanOrEqual(0);
    }
  });
}

test('首页案例流程各步骤不越出自己的深色 panel', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');

  const panel = page.locator('.article-layout .flow-panel');
  await expect(panel).toBeVisible();
  const panelBox = await panel.boundingBox();
  expect(panelBox).not.toBeNull();

  const steps = page.locator('.article-layout .flow-panel .flow-step');
  const count = await steps.count();
  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const box = await steps.nth(i).boundingBox();
    expect(box, `步骤 ${i}`).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(panelBox!.x - 0.5);
    expect(box!.y).toBeGreaterThanOrEqual(panelBox!.y - 0.5);
    expect(box!.x + box!.width).toBeLessThanOrEqual(panelBox!.x + panelBox!.width + 0.5);
    expect(box!.y + box!.height).toBeLessThanOrEqual(panelBox!.y + panelBox!.height + 0.5);
  }
});

test('首页重点区两张卡片充分利用容器（桌面两等宽）', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');

  const grid = page.locator('.featured-grid');
  const cards = grid.locator('.card');
  await expect(cards).toHaveCount(2);

  const gridBox = await grid.boundingBox();
  const boxes: { x: number; y: number; width: number; height: number }[] = [];
  for (let i = 0; i < 2; i++) {
    const box = await cards.nth(i).boundingBox();
    expect(box).not.toBeNull();
    boxes.push(box!);
  }
  // 两张卡片等宽、同行、左右紧贴网格边缘（不留空第三列）。
  expect(Math.abs(boxes[0].width - boxes[1].width)).toBeLessThanOrEqual(1);
  expect(Math.abs(boxes[0].y - boxes[1].y)).toBeLessThanOrEqual(1);
  expect(Math.abs(boxes[0].x - gridBox!.x)).toBeLessThanOrEqual(1);
  expect(Math.abs(boxes[1].x + boxes[1].width - (gridBox!.x + gridBox!.width))).toBeLessThanOrEqual(1);
});
