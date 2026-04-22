import { TopBar } from "@/components/shell/TopBar";
import { VibecodingPlacementFlow } from "@/components/vibecoding/VibecodingPlacementFlow";

export const dynamic = "force-dynamic";

export default function VibecodingPlacementPage() {
  return (
    <>
      <TopBar
        breadcrumb={[
          { label: "Вайбкодинг" },
          { label: "Placement", active: true },
        ]}
      />

      <section className="px-4 md:px-6 md:px-8 py-6 md:py-8 max-w-3xl">
        <div
          className="text-[11px] mono uppercase tracking-wider mb-2"
          style={{ color: "var(--subtle)" }}
        >
          // vibecoding · placement
        </div>
        <h1 className="text-[22px] md:text-[28px] font-bold tracking-tight leading-tight mb-1">
          Определим{" "}
          <span
            className="serif-italic text-[24px] md:text-[30px]"
            style={{ color: "var(--amber)" }}
          >
            уровень
          </span>
        </h1>
        <p className="text-sm mb-5 md:mb-6 max-w-xl" style={{ color: "var(--muted)" }}>
          15 вопросов от базы Claude Code до frontier-паттернов. Честно и быстро —
          без самооценки, только конкретные ответы. Пройти повторно можно в любой
          момент, история сохранится.
        </p>

        <VibecodingPlacementFlow />
      </section>
    </>
  );
}
