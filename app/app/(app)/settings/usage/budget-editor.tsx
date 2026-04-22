"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { BudgetConfig } from "@/lib/core/types";
import { patchBudgetAction } from "./actions";

export function BudgetEditor({ initial }: { initial: BudgetConfig }) {
  const [daily, setDaily] = useState(initial.dailyCostCapUsd);
  const [monthly, setMonthly] = useState(initial.monthlyCostCapUsd);
  const [perCall, setPerCall] = useState(initial.perCallMaxTokensOut);
  const [pending, startTransition] = useTransition();

  const dirty =
    daily !== initial.dailyCostCapUsd ||
    monthly !== initial.monthlyCostCapUsd ||
    perCall !== initial.perCallMaxTokensOut;

  const onSave = () => {
    startTransition(async () => {
      await patchBudgetAction({
        dailyCostCapUsd: daily,
        monthlyCostCapUsd: monthly,
        perCallMaxTokensOut: perCall,
      });
      toast.success("Лимиты обновлены");
    });
  };

  return (
    <Card className="p-4 flex flex-wrap gap-4 items-end">
      <Field label="Дневной cap, $" mono>
        <Input type="number" step="0.5" min="0" value={daily} onChange={(e) => setDaily(Number(e.target.value))} className="w-28" />
      </Field>
      <Field label="Месячный cap, $" mono>
        <Input type="number" step="1" min="0" value={monthly} onChange={(e) => setMonthly(Number(e.target.value))} className="w-28" />
      </Field>
      <Field label="Per-call max tokens" mono>
        <Input type="number" step="128" min="128" value={perCall} onChange={(e) => setPerCall(Number(e.target.value))} className="w-32" />
      </Field>
      <Button variant="primary" onClick={onSave} disabled={!dirty || pending}>
        {pending ? "Сохраняю…" : "Сохранить"}
      </Button>
    </Card>
  );
}

function Field({ label, children, mono }: { label: string; children: React.ReactNode; mono?: boolean }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className={`text-[10.5px] uppercase tracking-wider ${mono ? "mono" : ""}`} style={{ color: "var(--subtle)" }}>
        {label}
      </span>
      {children}
    </label>
  );
}
