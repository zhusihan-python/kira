import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { profile } from '../data/profile';

export async function GET(context) {
  const notes = (await getCollection('notes')).sort((a, b) =>
    b.data.date.localeCompare(a.data.date),
  );
  return rss({
    title: `${profile.siteName} · 实践记录`,
    description: '基于项目真实证据整理的实践记录：定位、修复、验证与边界。',
    site: context.site,
    items: notes.map((note) => ({
      title: note.data.title,
      description: note.data.summary,
      pubDate: new Date(note.data.date),
      link: `/notes/${note.id}/`,
    })),
    customData: '<language>zh-CN</language>',
  });
}
