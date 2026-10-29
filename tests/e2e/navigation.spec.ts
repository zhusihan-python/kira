import { expect, test } from '@playwright/test';

test('项目详情与实践记录可通过页面上的真实链接往返', async ({ page }) => {
  await page.goto('/projects/mobilegym/');
  await page.getByRole('link', { name: '执行器崩溃，为什么变成了测试失败？' }).click();
  await expect(page).toHaveURL(/\/notes\/executor-crash-classification\/?$/);
  await expect(page.getByRole('heading', { level: 1, name: '执行器崩溃，为什么变成了测试失败？' })).toBeVisible();

  // 记录页尾部的关联项目链接回到项目详情。
  await page.getByRole('link', { name: /MobileGym Test Platform/ }).first().click();
  await expect(page).toHaveURL(/\/projects\/mobilegym\/?$/);

  // TestHub 详情链接到验收记录，记录页头部元信息再链回项目。
  await page.goto('/projects/testhub/');
  await page
    .getByRole('link', { name: '怎样验证 Android 真机控制的可靠性？', exact: true })
    .click();
  await expect(page).toHaveURL(/\/notes\/android-control-feedback\/?$/);
  await page.getByRole('link', { name: 'TestHub Platform' }).first().click();
  await expect(page).toHaveURL(/\/projects\/testhub\/?$/);
});

test('记录页目录锚点都有真实目标', async ({ page }) => {
  const notes = ['executor-crash-classification', 'android-control-feedback'];
  for (const slug of notes) {
    await page.goto(`/notes/${slug}/`);
    const links = page.locator('.toc a');
    const count = await links.count();
    expect(count, slug).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute('href');
      expect(href, `${slug} TOC 第 ${i} 项`).toMatch(/^#/);
      const id = decodeURIComponent(href!.slice(1));
      const exists = await page.evaluate((target) => document.getElementById(target) !== null, id);
      expect(exists, `${slug} 锚点 #${id} 无对应目标`).toBe(true);
    }
  }
});

test('主要页面的内部链接全部响应成功', async ({ page, baseURL }) => {
  const paths = ['/', '/projects/', '/notes/', '/about/'];
  const seen = new Set<string>();
  for (const path of paths) {
    await page.goto(path);
    const hrefs = await page.locator('a[href^="/"]').evaluateAll((els) =>
      els.map((el) => (el as HTMLAnchorElement).getAttribute('href')!),
    );
    for (const href of hrefs) {
      const clean = href.split('#')[0];
      if (!clean || clean.startsWith('//')) continue;
      seen.add(clean);
    }
  }
  expect(seen.size).toBeGreaterThan(0);
  for (const href of seen) {
    const response = await page.request.get(new URL(href, baseURL!).toString());
    expect(response.status(), `链接 ${href}`).toBeLessThan(400);
  }
});
