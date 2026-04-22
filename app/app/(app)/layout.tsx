import type { ReactNode } from "react";
import { Sidebar } from "@/components/shell/Sidebar";
import { BottomTabs } from "@/components/shell/BottomTabs";
import { CommandPaletteProvider } from "@/components/shell/CommandPalette";
import { requireAuth } from "@/lib/core/auth";
import { getCurrentLevel } from "@/lib/domains/english/placement-repo";
import { getCurrentVibecodingLevel } from "@/lib/domains/vibecoding/placement-repo";
import { LEVEL_SHORT } from "@/lib/domains/vibecoding/types";
import { getStreak } from "@/lib/domains/streak/repo";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireAuth();
  const [englishLevel, vcLevel, streak] = await Promise.all([
    getCurrentLevel(user.userId),
    getCurrentVibecodingLevel(user.userId),
    getStreak(user.userId),
  ]);
  return (
    <CommandPaletteProvider>
      <div className="flex min-h-dvh">
        <Sidebar
          user={user}
          englishLevel={englishLevel}
          vibecodingLevel={vcLevel ? LEVEL_SHORT[vcLevel] : null}
          streakDays={streak.current}
          streakActiveToday={streak.activeToday}
        />
        <main className="flex-1 min-w-0 scrollbar-slim pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
          {children}
        </main>
      </div>
      <BottomTabs />
    </CommandPaletteProvider>
  );
}
