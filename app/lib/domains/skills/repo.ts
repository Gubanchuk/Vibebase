import { getSupabaseAdmin } from "@/lib/infra/supabase/admin";
import type { UserId } from "@/lib/core/types";
import type {
  Skill,
  SkillLesson,
  SkillNode,
  SkillTargetLevel,
  SkillWithTree,
  LessonProgress,
} from "./types";

/**
 * Supabase-backed skills repo. Operates with service-role client (RLS bypass),
 * but каждая query всегда фильтруется по `user_id` — owner-scoping at the
 * application layer. When RLS-enabled anon client arrives (v2), queries
 * работают без изменений.
 */

// ---------------------------------------------------------------------------
// Row mappers — keep DB snake_case isolated from domain camelCase.
// ---------------------------------------------------------------------------

function rowToSkill(r: Record<string, unknown>): Skill {
  return {
    id: String(r.id),
    slug: String(r.slug),
    name: String(r.name),
    description: String(r.description ?? ""),
    emoji: String(r.emoji ?? "🎯"),
    targetLevel: (r.target_level as SkillTargetLevel) ?? "intermediate",
    createdAt: String(r.created_at),
    archivedAt: (r.archived_at as string | null) ?? null,
  };
}

function rowToNode(r: Record<string, unknown>): SkillNode {
  return {
    id: String(r.id),
    skillId: String(r.skill_id),
    parentId: (r.parent_id as string | null) ?? null,
    title: String(r.title),
    description: String(r.description ?? ""),
    sortOrder: Number(r.sort_order ?? 0),
  };
}

function rowToLesson(r: Record<string, unknown>): SkillLesson {
  return {
    id: String(r.id),
    nodeId: String(r.node_id),
    title: String(r.title),
    contentMd: String(r.content_md ?? ""),
    generatedByAi: Boolean(r.generated_by_ai),
    createdAt: String(r.created_at),
    archivedAt: (r.archived_at as string | null) ?? null,
  };
}

function rowToProgress(r: Record<string, unknown>): LessonProgress {
  return {
    userId: String(r.user_id),
    lessonId: String(r.lesson_id),
    completedAt: (r.completed_at as string | null) ?? null,
    notes: (r.notes as string | undefined) ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export async function listUserSkills(userId: UserId): Promise<SkillWithTree[]> {
  try {
    const db = getSupabaseAdmin();
    const { data: skillRows } = await db
      .from("skills")
      .select("*")
      .eq("user_id", userId)
      .is("archived_at", null)
      .order("created_at", { ascending: false });

    const skills = (skillRows ?? []).map(rowToSkill);
    if (skills.length === 0) return [];

    const skillIds = skills.map((s) => s.id);

    const [{ data: nodeRows }, { data: lessonRows }, { data: progressRows }] =
      await Promise.all([
        db.from("skill_nodes").select("*").in("skill_id", skillIds),
        db
          .from("skill_lessons")
          .select("*")
          .eq("user_id", userId)
          .is("archived_at", null),
        db.from("lesson_progress").select("*").eq("user_id", userId),
      ]);

    const allNodes = (nodeRows ?? []).map(rowToNode);
    const allLessons = (lessonRows ?? []).map(rowToLesson);
    const allProgress = (progressRows ?? []).map(rowToProgress);

    return skills.map((skill) => ({
      ...skill,
      nodes: allNodes.filter((n) => n.skillId === skill.id),
      lessons: allLessons.filter((l) =>
        allNodes.some((n) => n.skillId === skill.id && n.id === l.nodeId)
      ),
      progress: allProgress.filter((p) =>
        allLessons.some(
          (l) =>
            l.id === p.lessonId &&
            allNodes.some((n) => n.id === l.nodeId && n.skillId === skill.id)
        )
      ),
    }));
  } catch (err) {
    console.warn("[skills-repo] listUserSkills failed:", err);
    return [];
  }
}

export async function getUserSkillBySlug(
  userId: UserId,
  slug: string
): Promise<SkillWithTree | null> {
  try {
    const db = getSupabaseAdmin();
    const { data: skillRow } = await db
      .from("skills")
      .select("*")
      .eq("user_id", userId)
      .eq("slug", slug)
      .maybeSingle();
    if (!skillRow) return null;
    const skill = rowToSkill(skillRow);

    const [{ data: nodeRows }, { data: lessonRows }, { data: progressRows }] =
      await Promise.all([
        db.from("skill_nodes").select("*").eq("skill_id", skill.id),
        db
          .from("skill_lessons")
          .select("*")
          .eq("user_id", userId)
          .is("archived_at", null),
        db.from("lesson_progress").select("*").eq("user_id", userId),
      ]);

    const nodes = (nodeRows ?? []).map(rowToNode);
    const lessons = (lessonRows ?? []).map(rowToLesson);
    const progress = (progressRows ?? []).map(rowToProgress);

    return {
      ...skill,
      nodes,
      lessons: lessons.filter((l) => nodes.some((n) => n.id === l.nodeId)),
      progress: progress.filter((p) =>
        lessons.some(
          (l) => l.id === p.lessonId && nodes.some((n) => n.id === l.nodeId)
        )
      ),
    };
  } catch (err) {
    console.warn("[skills-repo] getUserSkillBySlug failed:", err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export interface RoadmapNodeInput {
  title: string;
  description: string;
  children?: RoadmapNodeInput[];
}

export interface CreateSkillInput {
  name: string;
  description: string;
  targetLevel: SkillTargetLevel;
  emoji: string;
  nodes: RoadmapNodeInput[];
}

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      // Transliterate common Cyrillic characters so slugs stay URL-friendly.
      .replace(/[а-я]/g, (ch) => {
        const map: Record<string, string> = {
          а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo",
          ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m",
          н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
          ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "sch",
          ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
        };
        return map[ch] ?? "";
      })
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "skill"
  );
}

async function resolveUniqueSlug(
  userId: UserId,
  baseName: string
): Promise<string> {
  const db = getSupabaseAdmin();
  const base = slugify(baseName);
  const { data } = await db
    .from("skills")
    .select("slug")
    .eq("user_id", userId)
    .ilike("slug", `${base}%`);
  const existing = new Set((data ?? []).map((r) => String(r.slug)));
  if (!existing.has(base)) return base;
  for (let i = 2; i < 200; i++) {
    const candidate = `${base}-${i}`;
    if (!existing.has(candidate)) return candidate;
  }
  return `${base}-${Date.now()}`;
}

export async function createSkillWithTree(
  userId: UserId,
  input: CreateSkillInput
): Promise<{ id: string; slug: string }> {
  const db = getSupabaseAdmin();
  const slug = await resolveUniqueSlug(userId, input.name);

  // 1. Create the skill row.
  const { data: skillRow, error: skillErr } = await db
    .from("skills")
    .insert({
      user_id: userId,
      slug,
      name: input.name,
      description: input.description,
      emoji: input.emoji,
      target_level: input.targetLevel,
    })
    .select("id, slug")
    .single();

  if (skillErr || !skillRow) {
    console.error("[skills-repo] create failed:", skillErr);
    throw new Error(skillErr?.message ?? "Не удалось создать навык");
  }

  const skillId = String(skillRow.id);

  // 2. Flatten the nested roadmap into parent-id rows and insert in one batch.
  const flat: Array<{
    skill_id: string;
    parent_id: string | null;
    title: string;
    description: string;
    sort_order: number;
  }> = [];

  // We need to know each node's eventual DB id to wire children; the easiest
  // path is to insert top-level first, collect their ids, then children, etc.
  // Для MVP делаем рекурсивно с per-level insert'ами — 3 round-trips max
  // учитывая обычную глубину roadmap (2-3 уровня).
  async function insertLevel(
    parents: Array<{ dbId: string | null; children: RoadmapNodeInput[] }>
  ): Promise<void> {
    const rowsToInsert: Array<{
      skill_id: string;
      parent_id: string | null;
      title: string;
      description: string;
      sort_order: number;
    }> = [];
    const mapping: Array<{ parentDbId: string | null; child: RoadmapNodeInput; sortOrder: number }> = [];

    for (const p of parents) {
      p.children.forEach((child, i) => {
        rowsToInsert.push({
          skill_id: skillId,
          parent_id: p.dbId,
          title: child.title,
          description: child.description ?? "",
          sort_order: i,
        });
        mapping.push({ parentDbId: p.dbId, child, sortOrder: i });
      });
    }

    if (rowsToInsert.length === 0) return;

    const { data: insertedRows, error } = await db
      .from("skill_nodes")
      .insert(rowsToInsert)
      .select("id, parent_id, sort_order");

    if (error || !insertedRows) {
      console.error("[skills-repo] node insert failed:", error);
      throw new Error("Не удалось сохранить узлы roadmap");
    }

    // Re-match inserted rows (by parent_id + sort_order) with the input's
    // child definitions, then recurse for children of children.
    const nextLevel: Array<{ dbId: string | null; children: RoadmapNodeInput[] }> = [];
    for (const row of insertedRows) {
      const match = mapping.find(
        (m) =>
          (m.parentDbId ?? null) === ((row.parent_id as string | null) ?? null) &&
          m.sortOrder === Number(row.sort_order)
      );
      if (match?.child.children?.length) {
        nextLevel.push({ dbId: String(row.id), children: match.child.children });
      }
    }
    if (nextLevel.length > 0) {
      await insertLevel(nextLevel);
    }
  }

  await insertLevel([{ dbId: null, children: input.nodes }]);
  void flat; // kept for potential future bulk-optimisation

  return { id: skillId, slug: String(skillRow.slug) };
}
