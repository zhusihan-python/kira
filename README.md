# Kira — zhusihan-python 工程记录

以个人项目为核心的测试开发工程师作品集（Astro 静态站点），持续记录 AI 测试实践。

- 生产地址：<https://me.axiavo.com>（GitHub Pages，根路径部署）
- 源码仓库：<https://github.com/zhusihan-python/kira>
- 部署：push 到 `main` 自动触发 GitHub Actions（`.github/workflows/deploy.yml`），也可在 Actions 页面手动触发（workflow_dispatch）

## 部署说明（GitHub Pages + Cloudflare DNS）

主站 axiavo.com 保持在腾讯云，仅 `me.axiavo.com` 指向 GitHub Pages，DNS 由 Cloudflare 管理：

1. 在 GitHub Pages 设置（界面或 API）中将 Source 设为 GitHub Actions，并添加 Custom domain `me.axiavo.com`。
2. 在 Cloudflare 为 `me` 新增 CNAME 记录，指向 `zhusihan-python.github.io`（不带 `/kira` 路径），设为 DNS-only；axiavo.com 主站现有记录保持不动——GitHub 不会替用户更改 Cloudflare DNS。仓库内无需放 `CNAME` 文件：自定义 Actions 部署会忽略仓库中的 CNAME 文件，以 Pages 后台的 Custom domain 设置为准。
3. 等待证书就绪后开启 Enforce HTTPS。

以上 DNS 与 Pages 设置不在本仓库代码范围内，由维护者单独操作完成。

构建时可用 `SITE_URL` 覆盖站点地址（默认 `https://me.axiavo.com`），例如本地或其他预览构建：

```bash
SITE_URL=http://127.0.0.1:4321 npm run build
```

## 技术栈

- [Astro](https://astro.build) 7.x 静态生成，TypeScript strict
- Markdown 内容集合（`src/content/`），普通 CSS（`src/styles/global.css`），无 UI 框架
- 原生 JS 仅用于项目筛选（主导航纯 CSS 直接展示，无需 JS）
- 回归测试：[Playwright](https://playwright.dev)（`@playwright/test`）

## 常用命令

```bash
npm install          # 安装依赖
npm run check        # astro check 类型检查
npm run build        # 静态构建，输出 dist/
npm run dev          # 本地开发
npm run preview      # 预览构建结果
npm run test:e2e     # Playwright 回归测试（先启动 npm run preview）
```

建议使用 Node 24（项目按 Node 24 验证）。

## 回归测试

先在另一个终端启动预览服务，再运行测试：

```bash
npm run build && npm run preview   # 终端 1：默认 http://127.0.0.1:4321/
npx playwright install chromium    # 首次运行前安装所需浏览器
npm run test:e2e                   # 终端 2
```

- 测试默认访问 `PLAYWRIGHT_BASE_URL`（默认 `http://127.0.0.1:4321/`）。
- 想用本机已安装的 Google Chrome 时：`PLAYWRIGHT_CHANNEL=chrome npm run test:e2e`（无需安装 Playwright 浏览器）。

## 内容维护

- 站点身份信息（展示名、GitHub、经历数组）：`src/data/profile.ts`，经历留空即隐藏"经历"模块
- 项目：`src/content/projects/*.md`（frontmatter 含分类、状态、流程步骤、来源链接，正文为详情）
- 实践记录：`src/content/notes/*.md`（标题、验证记录日期、关联项目 `relatedProject`、来源说明）
- 站点元数据：`astro.config.mjs` 的 `site`

路由：`/`、`/projects/`、`/projects/[slug]/`、`/notes/`、`/notes/[slug]/`、`/about/`，另有 `404`、`/rss.xml`、`/sitemap.xml`、`/robots.txt`。
