import { notFound } from "next/navigation";

import { TopBar } from "@/components/shell/TopBar";
import { Chip } from "@/components/ui/chip";
import { ProgressRing } from "@/components/ui/progress-ring";
import { RoadmapTree } from "@/components/skills/RoadmapTree";
import { requireAuth } from "@/lib/core/auth";
import { getUserSkillBySlug } from "@/lib/domains/skills/repo";
import { skillProgress } from "@/lib/domains/skills/types";

export const dynamic = "force-dynamic";

export default async function SkillDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await requireAuth();
  const skill = await getUserSkillBySlug(user.userId, slug);
  if (!skill) notFound();

  const percent = Math.round(skillProgress(skill) * 100);
  const totalLessons = skill.lessons.filter((l) => l.archivedAt === null).length;
  const done = skill.progress.filter((p) => p.completedAt !== null).length;

  const targetChip =
    skill.targetLevel === "advanced"
      ? "advanced"
      : skill.targetLevel === "intermediate"
        ? "intermediate"
        : "beginner";

  return (
    <>
      <TopBar
        breadcrumb={[
          { label: "Прокачка навыков" },
          { label: skill.name, active: true },
        ]}
      />

      <section className="px-4 md:px-6 py-6">
        <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
          <div className="flex items-start gap-3">
            <div className="text-[32px] leading-none" aria-hidden>
              {skill.emoji}
            </div>
            <div>
              <div
                className="text-[11px] mono uppercase tracking-wider mb-1"
                style={{ color: "var(--subtle)" }}
              >
                // skill · <span style={{ color: "var(--coral)" }}>{percent}%</span>
              </div>
              <h1 className="text-[24px] md:text-[28px] font-bold tracking-tight leading-tight">
                <span className="serif-italic text-[26px] md:text-[30px]">
                  {skill.name.split(" ")[0]}
                </span>
                {skill.name.includes(" ")
                  ? " " + skill.name.split(" ").slice(1).join(" ")
                  : ""}
              </h1>
              <p
                className="text-sm mt-1 max-w-2xl"
                style={{ color: "var(--muted)" }}
              >
                {skill.description}
              </p>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <Chip tone="coral" mono>
                  target: {targetChip}
                </Chip>
                <Chip mono>{skill.nodes.length} узлов</Chip>
                <Chip mono>{totalLessons} уроков</Chip>
                <Chip tone="success" mono>
                  {done} завершено
                </Chip>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ProgressRing value={skillProgress(skill)} size={54} stroke={4} />
          </div>
        </div>

        <RoadmapTree skill={skill} />
      </section>
    </>
  );
}
