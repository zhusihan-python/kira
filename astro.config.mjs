// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
const site = process.env.SITE_URL ?? 'https://me.axiavo.com';

export default defineConfig({
  site,
  trailingSlash: 'ignore',
});
