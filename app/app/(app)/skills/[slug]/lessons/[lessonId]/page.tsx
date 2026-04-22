import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { ArrowLeft } from "lucide-react";

import { TopBar } from "@/components/shell/TopBar";
import { Chip } from "@/components/ui/chip";
import { MarkCompleteButton } from "@/components/skills/MarkCompleteButton";
import { getSkillBySlug } from "@/lib/domains/skills/fixtures";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;
  const skill = getSkillBySlug(slug);
  if (!skill) notFound();

  const lesson = skill.lessons.find(
    (l) => l.id === lessonId && l.archivedAt === null
  );
  if (!lesson) notFound();

  const node = skill.nodes.find((n) => n.id === lesson.nodeId);
  const initiallyComplete = skill.progress.some(
    (p) => p.lessonId === lesson.id && p.completedAt !== null
  );

  return (
    <>
      <TopBar
        breadcrumb={[
          { label: "Прокачка навыков" },
          { label: skill.name },
          { label: lesson.title, active: true },
        ]}
      />

      <article className="px-4 md:px-6 py-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-3">
          <Link
            href={`/skills/${skill.slug}`}
            className="inline-flex items-center gap-1.5 text-[12px] transition"
            style={{ color: "var(--muted)" }}
          >
            <ArrowLeft size={12} strokeWidth={2} />
            Back to roadmap
          </Link>
          <div className="flex-1" />
          {lesson.generatedByAi ? (
            <Chip tone="violet" mono>
              ✨ ai
            </Chip>
          ) : (
            <Chip mono>curated</Chip>
          )}
          {node ? (
            <Chip mono>
              {node.title}
            </Chip>
          ) : null}
        </div>

        <div className="flex items-start gap-3 mb-6">
          <div className="flex-1 min-w-0">
            <div
              className="text-[11px] mono uppercase tracking-wider mb-1"
              style={{ color: "var(--subtle)" }}
            >
              // lesson · {skill.name}
            </div>
            <h1 className="text-[28px] font-bold tracking-tight leading-tight">
              <span className="serif-italic text-[30px]">
                {lesson.title.split(" ")[0]}
              </span>
              {lesson.title.includes(" ")
                ? " " + lesson.title.split(" ").slice(1).join(" ")
                : ""}
            </h1>
          </div>
          <MarkCompleteButton
            lessonId={lesson.id}
            initialComplete={initiallyComplete}
          />
        </div>

        <div className="prose-md">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSlug]}
          >
            {lesson.contentMd}
          </ReactMarkdown>
        </div>
      </article>
    </>
  );
}
