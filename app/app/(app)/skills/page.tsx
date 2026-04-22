import { Plus, Sparkles } from "lucide-react";

import { TopBar } from "@/components/shell/TopBar";
import { Button } from "@/components/ui/button";
import { SkillCard } from "@/components/skills/SkillCard";
import { NewSkillDialog } from "@/components/skills/NewSkillDialog";
import { requireAuth } from "@/lib/core/auth";
import { listUserSkills } from "@/lib/domains/skills/repo";

export const dynamic = "force-dynamic";

export default async function SkillsIndexPage() {
  const user = await requireAuth();
  const skills = await listUserSkills(user.userId);
  const activeCount = skills.filter((s) => s.archivedAt === null).length;

  return (
    <>
      <TopBar breadcrumb={[{ label: "Прокачка навыков", active: true }]} />

      <section className="px-4 md:px-6 py-6">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="text-[11px] mono uppercase tracking-wider"
            style={{ color: "var(--subtle)" }}
          >
            // skills
          </div>
          <div className="flex-1 section-divider" />
          <NewSkillDialog
            trigger={
              <Button variant="ghost">
                <Plus size={14} strokeWidth={2} />
                Новый навык
              </Button>
            }
          />
        </div>

        <h1 className="text-[22px] md:text-[26px] font-bold leading-tight tracking-tight mb-1">
          Твой{" "}
          <span className="serif-italic text-[24px] md:text-[28px] gradient-text-cool">
            growth
          </span>{" "}
          стек
        </h1>
        <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>
          {activeCount === 0
            ? "Ни одного навыка. Создай первый — AI соберёт roadmap."
            : `${activeCount} активных · генерируй уроки, прокачивай по дереву, держи прогресс перед глазами.`}
        </p>

        {skills.length === 0 ? (
          <EmptySkillsState />
        ) : (
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
            {skills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
            <NewSkillDialog
              trigger={
                <button
                  type="button"
                  className="card card-hover p-4 text-left flex flex-col items-center justify-center gap-2 min-h-[176px]"
                  style={{ color: "var(--muted)", borderStyle: "dashed" }}
                  aria-label="Создать новый навык"
                >
                  <div
                    className="w-9 h-9 rounded-md flex items-center justify-center"
                    style={{ background: "var(--surface-2)" }}
                  >
                    <Plus size={16} strokeWidth={2} />
                  </div>
                  <div className="text-[13px] font-semibold">Новый навык</div>
                  <div
                    className="text-[11px] text-center"
                    style={{ color: "var(--subtle)" }}
                  >
                    AI соберёт roadmap под твою цель
                  </div>
                </button>
              }
            />
          </div>
        )}
      </section>
    </>
  );
}

function EmptySkillsState() {
  return (
    <div className="mt-6 mx-auto max-w-xl">
      <NewSkillDialog
        trigger={
          <button
            type="button"
            className="card card-glow glow-ring p-8 w-full text-left flex flex-col items-start gap-4 transition hover:scale-[1.01]"
          >
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{
                background: "var(--gradient-hot)",
                boxShadow: "0 4px 20px -6px rgba(249,112,102,0.5)",
              }}
            >
              <Sparkles size={26} strokeWidth={2} color="white" />
            </div>
            <div>
              <div
                className="text-[11px] mono uppercase tracking-wider mb-1"
                style={{ color: "var(--coral)" }}
              >
                // greenfield
              </div>
              <h2 className="text-[22px] font-bold leading-tight tracking-tight">
                Создай{" "}
                <span className="serif-italic text-[24px]">первый</span> навык
              </h2>
              <p
                className="text-[13.5px] mt-2 leading-relaxed"
                style={{ color: "var(--muted)" }}
              >
                Опиши что хочешь освоить — AI соберёт roadmap из 3–8 разделов
                с подтемами. После этого сможешь генерировать уроки по каждому
                узлу и отмечать прогресс.
              </p>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="btn btn-primary btn-sm">
                <Plus size={13} strokeWidth={2} />
                Начать
              </span>
              <span
                className="text-[11px] mono"
                style={{ color: "var(--subtle)" }}
              >
                ~20 секунд до плана
              </span>
            </div>
          </button>
        }
      />

      <div
        className="mt-8 text-[12.5px] leading-relaxed"
        style={{ color: "var(--muted)" }}
      >
        <div
          className="text-[10px] mono uppercase tracking-wider mb-2"
          style={{ color: "var(--subtle)" }}
        >
          // идеи, если в тупике
        </div>
        <ul className="space-y-1.5">
          <li>
            <span className="mono" style={{ color: "var(--coral)" }}>→</span>{" "}
            Public Speaking — уверенно питчить идеи на 5 минут
          </li>
          <li>
            <span className="mono" style={{ color: "var(--coral)" }}>→</span>{" "}
            SQL — быстро писать аналитические запросы
          </li>
          <li>
            <span className="mono" style={{ color: "var(--coral)" }}>→</span>{" "}
            Продуктовая аналитика — читать и задавать метрики
          </li>
          <li>
            <span className="mono" style={{ color: "var(--coral)" }}>→</span>{" "}
            Система «второй мозг» — outline + ежедневный review
          </li>
        </ul>
      </div>
    </div>
  );
}
