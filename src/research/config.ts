import { z } from "zod";

export const researchCategorySchema = z.object({
  name: z.string().min(1),
  queries: z.array(z.string().min(1)).min(1),
  targetCount: z.number().int().positive()
});

export const researchSeedRepoSchema = z.object({
  fullName: z.string().regex(/^[^/\s]+\/[^/\s]+$/),
  category: z.string().min(1)
});

export const researchConfigSchema = z.object({
  maxRepos: z.number().int().positive().default(100),
  minStars: z.number().int().nonnegative().default(100),
  activeSince: z.string().default("2024-12-01"),
  excludeRepos: z.array(z.string().regex(/^[^/\s]+\/[^/\s]+$/)).default([]),
  categories: z.array(researchCategorySchema).min(1),
  seedRepos: z.array(researchSeedRepoSchema).default([])
});

export type ResearchConfig = z.infer<typeof researchConfigSchema>;
