/**
 * Skills domain — types and pure helpers.
 *
 * A `Skill` is a top-level learning goal (e.g. "Learning English"). Each skill
 * owns a roadmap tree made of `SkillNode`s; each leaf node may have one or
 * more `SkillLesson`s; and a user's progress against a lesson lives in a
 * separate `LessonProgress` record so the lesson content stays immutable.
 */

export type SkillTargetLevel = "beginner" | "intermediate" | "advanced";

export interface Skill {
  id: string;
  slug: string;
  name: string;
  description: string;
  emoji: string;
  targetLevel: SkillTargetLevel;
  createdAt: string;
  archivedAt: string | null;
}

export interface SkillNode {
  id: string;
  skillId: string;
  parentId: string | null;
  title: string;
  description: string;
  sortOrder: number;
  /** Only populated when the tree is nested (see `buildTree`). */
  children?: SkillNode[];
}

export interface SkillLesson {
  id: string;
  nodeId: string;
  title: string;
  contentMd: string;
  generatedByAi: boolean;
  createdAt: string;
  archivedAt: string | null;
}

export interface LessonProgress {
  userId: string;
  lessonId: string;
  completedAt: string | null;
  notes?: string;
}

export type SkillWithTree = Skill & {
  nodes: SkillNode[];
  lessons: SkillLesson[];
  progress: LessonProgress[];
};

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

/**
 * Collect every descendant node id (including the node itself).
 */
function collectSubtreeIds(node: SkillNode, all: SkillNode[]): Set<string> {
  const ids = new Set<string>([node.id]);
  const stack: SkillNode[] = [];

  // Seed with direct children from either the nested `children` field or the
  // flat list lookup — whichever is available at call time.
  if (node.children?.length) {
    stack.push(...node.children);
  } else {
    stack.push(...all.filter((n) => n.parentId === node.id));
  }

  while (stack.length > 0) {
    const current = stack.pop()!;
    ids.add(current.id);
    if (current.children?.length) {
      stack.push(...current.children);
    } else {
      stack.push(...all.filter((n) => n.parentId === current.id));
    }
  }

  return ids;
}

/**
 * 0..1 completion ratio for a node's subtree (its lessons + all descendants').
 * Returns 0 when the subtree has no lessons at all.
 */
export function nodeProgress(
  node: SkillNode,
  lessons: SkillLesson[],
  progress: LessonProgress[],
  allNodes?: SkillNode[]
): number {
  const universe = allNodes ?? flattenTree(node.children ? [node] : []);
  const subtreeIds = collectSubtreeIds(node, universe);
  const relevantLessons = lessons.filter(
    (l) => subtreeIds.has(l.nodeId) && l.archivedAt === null
  );
  if (relevantLessons.length === 0) return 0;
  const completed = relevantLessons.filter((l) =>
    progress.some((p) => p.lessonId === l.id && p.completedAt !== null)
  );
  return completed.length / relevantLessons.length;
}

/**
 * 0..1 completion ratio for an entire skill.
 */
export function skillProgress(skill: SkillWithTree): number {
  const active = skill.lessons.filter((l) => l.archivedAt === null);
  if (active.length === 0) return 0;
  const completed = active.filter((l) =>
    skill.progress.some((p) => p.lessonId === l.id && p.completedAt !== null)
  );
  return completed.length / active.length;
}

/**
 * Flatten a nested tree back into a parent-id-based list (depth-first).
 */
export function flattenTree(nodes: SkillNode[]): SkillNode[] {
  const out: SkillNode[] = [];
  const walk = (list: SkillNode[]) => {
    for (const n of list) {
      const { children: _children, ...rest } = n;
      out.push({ ...rest });
      if (n.children?.length) walk(n.children);
    }
  };
  walk(nodes);
  return out;
}

/**
 * Build a nested tree from a flat list with `parentId` pointers.
 * Nodes are ordered by `sortOrder` within each parent.
 */
export function buildTree(flat: SkillNode[]): SkillNode[] {
  const byId = new Map<string, SkillNode>();
  for (const n of flat) {
    byId.set(n.id, { ...n, children: [] });
  }
  const roots: SkillNode[] = [];
  for (const n of byId.values()) {
    if (n.parentId && byId.has(n.parentId)) {
      byId.get(n.parentId)!.children!.push(n);
    } else {
      roots.push(n);
    }
  }
  const sortRec = (list: SkillNode[]) => {
    list.sort((a, b) => a.sortOrder - b.sortOrder);
    for (const n of list) if (n.children?.length) sortRec(n.children);
  };
  sortRec(roots);
  return roots;
}
