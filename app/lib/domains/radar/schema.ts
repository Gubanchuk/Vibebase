import { z } from "zod";

export const RELEVANCE = ["strong", "moderate", "weak"] as const;
export type Relevance = (typeof RELEVANCE)[number];

/**
 * Zod schema for a single radar item as it lives in the vault markdown frontmatter.
 * Published_at is coerced from ISO strings or Date objects.
 */
export const RadarItemSchema = z.object({
  type: z.literal("radar-item"),
  source: z.string().min(1),
  url: z.string().url(),
  title: z.string().min(1),
  tldr: z.string().min(1),
  tags: z.array(z.string().min(1)).min(1),
  published_at: z.coerce.date(),
  relevance: z.enum(RELEVANCE),
  related_skill: z.string().optional(),
});

export type RadarItem = z.infer<typeof RadarItemSchema>;
