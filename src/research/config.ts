import { z } from "zod";

export const researchCategorySchema = z.object({
  name: z.string().min(1),
  queries: z.array(z.string().min(1)).min(1),
  targetCount: z.number().int().positive()
});

export const researchConfigSchema = z.object({
  maxRepos: z.number().int().positive().default(100),
  minStars: z.number().int().nonnegative().default(100),
  activeSince: z.string().default("2024-12-01"),
  categories: z.array(researchCategorySchema).min(1)
});

export type ResearchConfig = z.infer<typeof researchConfigSchema>;
