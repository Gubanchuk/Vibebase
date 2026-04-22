import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import type { Mistake } from "@/lib/domains/english/types";

interface Props {
  mistakes: Mistake[];
}

/**
 * Compact mistake widget: each item shows the wrong phrase (with wavy
 * coral underline), the correction (with green highlight), a category
 * chip and a one-line explanation. Empty state is intentionally soft.
 */
export function MistakeSummary({ mistakes }: Props) {
  if (mistakes.length === 0) {
    return (
      <Card className="p-5">
        <div className="flex items-center gap-2">
          <h3 className="text-[13px] font-semibold">Ошибки за сессии</h3>
          <Chip className="mono">0</Chip>
        </div>
        <p className="mt-2 text-[12px]" style={{ color: "var(--subtle)" }}>
          Здесь будут собираться типовые ошибки из разговоров, с правкой и
          коротким объяснением. Пока пусто — пообщайся с репетитором,
          чтобы наполнить раздел.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <h3 className="text-[13px] font-semibold">Ошибки за сессии</h3>
        <Chip tone="coral" className="mono">
          {mistakes.length}
        </Chip>
      </div>

      <ul className="mt-3 flex flex-col gap-2">
        {mistakes.map((m) => (
          <li
            key={m.id}
            className="rounded-md px-3 py-2 text-[12.5px] leading-relaxed flex flex-col gap-1"
            style={{
              background: "var(--coral-soft)",
              border: "1px solid rgba(249, 112, 102, 0.22)",
            }}
          >
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <Chip tone="coral" className="mono">
                {m.category}
              </Chip>
              <span className="underline-fix" style={{ color: "var(--content)" }}>
                {m.original}
              </span>
              <span style={{ color: "var(--subtle)" }}>→</span>
              <span className="underline-ok" style={{ color: "var(--content)" }}>
                {m.correction}
              </span>
            </div>
            <p className="text-[11.5px]" style={{ color: "var(--muted)" }}>
              {m.explanation}
            </p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
