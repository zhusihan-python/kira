import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    category: z.enum(['测试平台', '产品实践', '性能研究']),
    projectType: z.string(),
    status: z.string(),
    featured: z.boolean().default(false),
    order: z.number(),
    summary: z.string(),
    highlights: z.array(z.string()).default([]),
    flowSteps: z.array(z.string()).default([]),
    repository: z.url().optional(),
    publicSource: z.boolean().default(false),
    links: z
      .array(
        z.object({
          label: z.string(),
          href: z.url(),
        }),
      )
      .default([]),
  }),
});

const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    date: z.string(),
    relatedProject: z.string(),
    sourceNote: z.string(),
    summary: z.string(),
  }),
});

export const collections = { projects, notes };
