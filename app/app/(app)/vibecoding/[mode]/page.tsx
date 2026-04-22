import { notFound, redirect } from "next/navigation";
import { TopBar } from "@/components/shell/TopBar";
import { VibecodingChatSurface } from "@/components/vibecoding/VibecodingChatSurface";
import { requireAuth } from "@/lib/core/auth";
import { getCurrentVibecodingLevel } from "@/lib/domains/vibecoding/placement-repo";
import { getSession, getModeMeta } from "@/lib/domains/vibecoding/fixtures";
import type { VibecodingMode } from "@/lib/domains/vibecoding/types";

const VALID_MODES: VibecodingMode[] = [
  "explain",
  "chat",
  "review",
  "recipe",
  "debrief",
  "challenge",
];

export const dynamic = "force-dynamic";

export default async function VibecodingModePage({
  params,
  searchParams,
}: {
  params: Promise<{ mode: string }>;
  searchParams: Promise<{ radar?: string }>;
}) {
  const { mode } = await params;
  if (!VALID_MODES.includes(mode as VibecodingMode)) notFound();

  const user = await requireAuth();
  const level = await getCurrentVibecodingLevel(user.userId);

  // Без placement'а кидаем его пройти.
  if (!level) {
    redirect("/vibecoding/placement");
  }

  const validMode = mode as VibecodingMode;
  const session = getSession(validMode);
  const meta = getModeMeta(validMode);

  // Если debrief и пришёл ?radar=<id> — подтянем карточку и сформируем
  // стартовое сообщение.
  const { radar } = await searchParams;
  let prefill: string | undefined;
  if (validMode === "debrief" && radar) {
    const { getRadarItemById } = await import(
      "@/lib/domains/radar/fixtures"
    );
    const item = getRadarItemById(radar);
    if (item) {
      prefill = [
        `Разбираем radar-item: **${item.title}**`,
        "",
        `Источник: ${item.url}`,
        `Теги: ${item.tags.join(", ")}`,
        "",
        "**TL;DR:**",
        item.tldr,
        "",
        "Прочитал. Дай debrief под мой уровень — что применить на этой неделе.",
      ].join("\n");
    }
  }

  return (
    <>
      <TopBar
        breadcrumb={[{ label: "Вайбкодинг" }, { label: meta.title, active: true }]}
        streaming={{ label: "gpt-5.4 · streaming" }}
      />
      <VibecodingChatSurface
        mode={validMode}
        level={level}
        initialMessages={session.messages}
        sessionId={session.id}
        prefill={prefill}
      />
    </>
  );
}
