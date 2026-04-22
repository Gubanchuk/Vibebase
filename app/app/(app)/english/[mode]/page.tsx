import { notFound } from "next/navigation";
import { TopBar } from "@/components/shell/TopBar";
import { ChatSurface } from "@/components/english/ChatSurface";
import { ChatHeader } from "@/components/english/ChatHeader";
import {
  MODES,
  getModeMeta,
  getSession,
} from "@/lib/domains/english/fixtures";
import type { EnglishMode } from "@/lib/domains/english/types";

const VALID_MODES: readonly EnglishMode[] = [
  "native",
  "lesson",
  "translate",
  "flashcards",
  "grammar",
  "quiz",
];

function isEnglishMode(value: string): value is EnglishMode {
  return (VALID_MODES as readonly string[]).includes(value);
}

interface PageProps {
  params: Promise<{ mode: string }>;
}

export default async function EnglishModePage({ params }: PageProps) {
  const { mode } = await params;

  if (!isEnglishMode(mode)) {
    notFound();
  }

  const meta = getModeMeta(mode);
  const session = getSession(mode);

  return (
    <div className="flex flex-col min-h-dvh">
      <TopBar
        breadcrumb={[
          { label: "Английский" },
          { label: meta.title, active: true },
        ]}
        streaming={{ label: "sonnet-4-6 · streaming" }}
      />
      <ChatHeader current={mode} level={session.level} modes={MODES} />
      <ChatSurface
        mode={mode}
        initialMessages={session.messages}
        level={session.level}
        sessionId={session.id}
      />
    </div>
  );
}
