"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sparkles, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { runCuratorAction } from "./actions";
import type { LearningDomain } from "@/lib/domains/learning/types";

export function CuratorRunner({
  domain,
  label = "Собрать план",
}: {
  domain: LearningDomain;
  label?: string;
}) {
  const router = useRouter();
  const [running, setRunning] = React.useState(false);

  const trigger = async () => {
    setRunning(true);
    const res = await runCuratorAction(domain);
    setRunning(false);
    if (res.ok) {
      toast.success(`Собрано ${res.count} тем · ${domain}`);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  };

  return (
    <Button
      variant="primary"
      onClick={() => void trigger()}
      disabled={running}
    >
      {running ? (
        <>
          <RotateCw size={13} strokeWidth={2} className="animate-spin" />
          Curator работает…
        </>
      ) : (
        <>
          <Sparkles size={13} strokeWidth={2} />
          {label}
        </>
      )}
    </Button>
  );
}
