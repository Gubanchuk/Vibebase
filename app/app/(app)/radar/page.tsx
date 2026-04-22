import { Radar as RadarIcon } from "lucide-react";
import { TopBar } from "@/components/shell/TopBar";
import { RadarFeed } from "@/components/radar/RadarFeed";
import { getSeedRadarItems } from "@/lib/domains/radar/fixtures";

export const dynamic = "force-dynamic";

export default function RadarPage() {
  const items = getSeedRadarItems();
  const strongCount = items.filter((i) => i.relevance === "strong").length;

  return (
    <>
      <TopBar breadcrumb={[{ label: "Радар", active: true }]} />

      {/* HERO / INTRO */}
      <section
        className="p-4 md:p-6 border-b"
        style={{ borderColor: "var(--border-2)" }}
      >
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <div
              className="text-[11px] mono uppercase tracking-wider mb-2 flex items-center gap-2"
              style={{ color: "var(--subtle)" }}
            >
              <RadarIcon
                size={12}
                strokeWidth={1.8}
                style={{ color: "var(--coral)" }}
              />
              // radar · last sync{" "}
              <span style={{ color: "var(--muted)" }}>2 hours ago</span>
            </div>
            <h1 className="text-[22px] md:text-[30px] font-bold tracking-tight leading-tight break-words">
              Свежие{" "}
              <span
                className="serif-italic text-[26px] md:text-[34px] gradient-text"
              >
                сигналы
              </span>{" "}
              с передовой
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
              <span
                className="font-semibold"
                style={{ color: "var(--content)" }}
              >
                {items.length}
              </span>{" "}
              айтемов ·{" "}
              <span style={{ color: "var(--coral)" }}>
                {strongCount} strong relevance
              </span>{" "}
              · локальный autoresearch-цикл, не сервер-скрейпер.
            </p>
          </div>
        </div>
      </section>

      {/* FEED */}
      <section className="p-4 md:p-6">
        <RadarFeed items={items} />
      </section>
    </>
  );
}
