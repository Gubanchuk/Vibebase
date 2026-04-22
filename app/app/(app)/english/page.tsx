import { TopBar } from "@/components/shell/TopBar";
import { ModeCard } from "@/components/english/ModeCard";
import { MistakeSummary } from "@/components/english/MistakeSummary";
import {
  MISTAKES,
  MODES,
  SESSIONS,
  minutesAgoLabel,
} from "@/lib/domains/english/fixtures";

export default function EnglishHomePage() {
  const hero = MODES.find((m) => m.hero);
  const rest = MODES.filter((m) => !m.hero);

  return (
    <>
      <TopBar breadcrumb={[{ label: "Английский", active: true }]} />

      <div className="px-4 md:px-8 py-5 md:py-8 max-w-6xl mx-auto">
        <header className="mb-5 md:mb-8 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div
              className="text-[11px] mono uppercase tracking-wider mb-1"
              style={{ color: "var(--subtle)" }}
            >
              Домен
            </div>
            <h1 className="text-[22px] md:text-[32px] font-bold tracking-tight">
              Английский <span className="serif-italic gradient-text">ежедневно</span>
            </h1>
            <p
              className="mt-1 text-[13px] max-w-xl"
              style={{ color: "var(--muted)" }}
            >
              Шесть режимов, один репетитор. Выбирай под настроение — все
              сессии попадают в твой словарь ошибок.
            </p>
          </div>
        </header>

        <section
          aria-label="Режимы"
          className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-[1fr]"
        >
          {hero ? (
            <ModeCard
              meta={hero}
              variant="hero"
              lastSessionLabel={formatSessionMeta(hero.id)}
            />
          ) : null}
          {rest.map((m) => (
            <ModeCard
              key={m.id}
              meta={m}
              variant="compact"
              lastSessionLabel={formatSessionMeta(m.id)}
            />
          ))}
        </section>

        <section className="mt-8 md:mt-10">
          <MistakeSummary mistakes={MISTAKES} />
        </section>
      </div>
    </>
  );
}

function formatSessionMeta(modeId: keyof typeof SESSIONS): string {
  const s = SESSIONS[modeId];
  if (!s.lastActivityAt) return "ещё не открывал";
  const ago = minutesAgoLabel(s.lastActivityAt);
  const count = s.messages.length;
  const plural =
    count === 1 ? "сообщение" : count < 5 ? "сообщения" : "сообщений";
  return `${ago} · ${count} ${plural}`;
}
