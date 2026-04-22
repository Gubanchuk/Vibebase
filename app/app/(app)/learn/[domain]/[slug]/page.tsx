import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { TopBar } from "@/components/shell/TopBar";
import { Chip } from "@/components/ui/chip";
import { requireAuth } from "@/lib/core/auth";
import {
  getMastery,
  getTopicBySlug,
  getLessonForUser,
} from "@/lib/domains/learning/repo";
import type { LearningDomain } from "@/lib/domains/learning/types";
import { LessonViewer } from "@/components/learning/LessonViewer";
import { GenerateLessonCTA } from "@/components/learning/GenerateLessonCTA";

export const dynamic = "force-dynamic";

const VALID_DOMAINS: LearningDomain[] = ["english", "vibecoding"];

export default async function LessonPage({
  params,
}: {
  params: Promise<{ domain: string; slug: string }>;
}) {
  const { domain, slug } = await params;
  if (!VALID_DOMAINS.includes(domain as LearningDomain)) notFound();
  const validDomain = domain as LearningDomain;

  const user = await requireAuth();
  const topic = await getTopicBySlug(validDomain, slug);
  if (!topic) notFound();

  const [lesson, mastery] = await Promise.all([
    getLessonForUser(user.userId, topic.id),
    getMastery(user.userId, topic.id),
  ]);

  return (
    <>
      <TopBar
        breadcrumb={[
          { label: "Учёба" },
          {
            label: validDomain === "english" ? "Английский" : "Vibecoding",
          },
          { label: topic.title, active: true },
        ]}
      />

      <article className="px-4 md:px-6 md:px-8 py-4 md:py-6 max-w-3xl mx-auto">
        <Link
          href="/learn"
          className="inline-flex items-center gap-1.5 text-[12px] transition mb-4"
          style={{ color: "var(--muted)" }}
        >
          <ArrowLeft size={12} strokeWidth={2} />
          К списку тем
        </Link>

        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Chip tone="coral" mono>
            topic · {validDomain}
          </Chip>
          <Chip mono>
            importance {topic.importance}/5
          </Chip>
          {topic.levelMin ? (
            <Chip tone="violet" mono>
              {topic.levelMin}
              {topic.levelMax && topic.levelMax !== topic.levelMin
                ? `–${topic.levelMax}`
                : ""}
            </Chip>
          ) : null}
          {mastery?.masteredAt ? (
            <Chip tone="success" mono>
              ✓ освоено
            </Chip>
          ) : null}
        </div>

        <h1 className="text-[22px] md:text-[32px] font-bold tracking-tight leading-tight mb-2">
          {topic.title}
        </h1>
        <p className="text-[14px] mb-5 md:mb-6" style={{ color: "var(--muted)" }}>
          {topic.summary}
        </p>

        {topic.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {topic.tags.map((tag) => (
              <span key={tag} className="chip mono">
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        {lesson ? (
          <LessonViewer
            domain={validDomain}
            slug={slug}
            lesson={lesson}
            initialMastery={mastery}
          />
        ) : (
          <GenerateLessonCTA
            domain={validDomain}
            slug={slug}
            topicTitle={topic.title}
          />
        )}
      </article>
    </>
  );
}
