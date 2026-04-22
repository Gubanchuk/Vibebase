"use client";

import { TopBar } from "@/components/shell/TopBar";
import { PlacementFlow } from "@/components/english/PlacementFlow";

export default function PlacementPage() {
  return (
    <>
      <TopBar
        breadcrumb={[
          { label: "Английский" },
          { label: "Placement", active: true },
        ]}
      />
      <div className="px-4 md:px-8 py-8 md:py-12 max-w-2xl mx-auto">
        <header className="mb-6">
          <div
            className="text-[11px] mono uppercase tracking-wider mb-1"
            style={{ color: "var(--subtle)" }}
          >
            Тест уровня
          </div>
          <h1 className="text-[26px] md:text-[30px] font-bold tracking-tight">
            Определим твой <span className="serif-italic gradient-text">уровень</span>
          </h1>
          <p
            className="mt-1 text-[13px] max-w-xl"
            style={{ color: "var(--muted)" }}
          >
            15 вопросов, разбросаны от A1 до C1. Честно и быстро — без
            самооценки, только конкретные ответы.
          </p>
        </header>

        <PlacementFlow />
      </div>
    </>
  );
}
