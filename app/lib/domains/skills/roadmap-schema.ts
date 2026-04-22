import { z } from "zod";

/**
 * Zod-схема для AI-generated roadmap. Используется в `generateObject` чтобы
 * модель возвращала структурный tree, а не markdown.
 *
 * Глубина ограничена двумя уровнями (корневой узел + дети) — этого хватает
 * для большинства навыков и упрощает UX tree-editor'а.
 */

const ChildNodeSchema = z.object({
  title: z.string().min(2).max(80),
  description: z.string().min(5).max(200),
});

const RootNodeSchema = z.object({
  title: z.string().min(2).max(80),
  description: z.string().min(5).max(200),
  children: z.array(ChildNodeSchema).min(0).max(6).optional(),
});

export const RoadmapSchema = z.object({
  emoji: z
    .string()
    .min(1)
    .max(4)
    .describe("Single emoji that visually represents the skill"),
  summary: z
    .string()
    .min(20)
    .max(300)
    .describe(
      "One-paragraph Russian summary of what the learner will gain and how to move through the tree"
    ),
  nodes: z.array(RootNodeSchema).min(3).max(8),
});

export type Roadmap = z.infer<typeof RoadmapSchema>;
