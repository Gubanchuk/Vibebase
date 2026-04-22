import Link from "next/link";
import { ProgressRing } from "@/components/ui/progress-ring";
import { cn } from "@/lib/cn";
import { skillProgress, type SkillWithTree } from "@/lib/domains/skills/types";

/**
 * Pick a single word in the skill name to wrap in italic serif — the v4-hybrid
 * accent treatment. First word gets the serif unless the name is a single
 * word, in which case we italicise the full thing.
 */
function splitSerifWord(name: string): { serif: string; rest: string } {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return { serif: parts[0], rest: "" };
  const [first, ...rest] = parts;
  return { serif: first, rest: " " + rest.join(" ") };
}

export function SkillCard({ skill }: { skill: SkillWithTree }) {
  const value = skillProgress(skill);
  const totalLessons = skill.lessons.filter((l) => l.archivedAt === null).length;
  const done = skill.progress.filter((p) => p.completedAt !== null).length;
  const { serif, rest } = splitSerifWord(skill.name);

  const levelLabel =
    skill.targetLevel === "beginner"
      ? "beginner"
      : skill.targetLevel === "intermediate"
        ? "intermediate"
        : "advanced";

  return (
    <Link
      href={`/skills/${skill.slug}`}
      className={cn(
        "card card-hover group relative block p-4",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--coral)]"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="text-[28px] leading-none" aria-hidden>
          {skill.emoji}
        </div>
        <ProgressRing value={value} size={36} />
      </div>

      <h3 className="mt-3 text-[16px] font-bold leading-tight tracking-tight">
        <span className="serif-italic text-[18px]">{serif}</span>
        {rest}
      </h3>

      <p
        className="mt-1 text-[12.5px] leading-relaxed"
        style={{ color: "var(--muted)" }}
      >
        {skill.description}
      </p>

      <div
        className="mt-3 flex items-center gap-2 mono text-[10.5px] uppercase tracking-wider"
        style={{ color: "var(--subtle)" }}
      >
        <span>{totalLessons} уроков</span>
        <span style={{ color: "var(--border-hover)" }}>·</span>
        <span style={{ color: done > 0 ? "var(--coral)" : undefined }}>
          {done} завершено
        </span>
        <span style={{ color: "var(--border-hover)" }}>·</span>
        <span>target: {levelLabel}</span>
      </div>
    </Link>
  );
}
