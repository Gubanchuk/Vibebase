"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sparkles, RotateCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getOrGenerateLessonAction } from "@/app/(app)/learn/actions";
import type { LearningDomain } from "@/lib/domains/learning/types";

export function GenerateLessonCTA({
  domain,
  slug,
  topicTitle,
}: {
  domain: LearningDomain;
  slug: string;
  topicTitle: string;
}) {
  const router = useRouter();
  const [running, setRunning] = React.useState(false);

  const trigger = async () => {
    setRunning(true);
    const res = await getOrGenerateLessonAction(domain, slug);
    setRunning(false);
    if (res.ok) {
      toast.success("Урок готов");
      router.refresh();
    } else {
      toast.error(res.error);
    }
  };

  return (
    <Card className="p-6 card-glow glow-ring">
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-md flex items-center justify-center shrink-0"
          style={{
            background: "var(--gradient-hot)",
            boxShadow: "0 4px 20px -6px rgba(249,112,102,0.5)",
          }}
        >
          <Sparkles size={22} strokeWidth={2} color="white" />
        </div>
        <div className="flex-1">
          <h2 className="text-[18px] font-bold tracking-tight mb-1">
            Сгенерировать урок
          </h2>
          <p
            className="text-[13px] leading-relaxed mb-4"
            style={{ color: "var(--muted)" }}
          >
            Teacher-агент соберёт персональный урок под твой уровень:{" "}
            <span style={{ color: "var(--content)" }}>{topicTitle}</span>.
            Структура: идея → ядро → пример → упражнение → квиз. Занимает ~15-30 сек.
          </p>
          <Button variant="primary" onClick={() => void trigger()} disabled={running}>
            {running ? (
              <>
                <RotateCw size={13} strokeWidth={2} className="animate-spin" />
                Teacher генерит…
              </>
            ) : (
              <>
                <Sparkles size={13} strokeWidth={2} />
                Сгенерировать
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
