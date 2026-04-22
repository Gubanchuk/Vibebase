"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessagesSquare, Layers3, Radar, BookOpen, LineChart } from "lucide-react";
import { cn } from "@/lib/cn";

const TABS = [
  { href: "/english", label: "Eng", Icon: MessagesSquare },
  { href: "/skills", label: "Skills", Icon: Layers3 },
  { href: "/radar", label: "Radar", Icon: Radar },
  { href: "/journal", label: "Journal", Icon: BookOpen },
  { href: "/settings/usage", label: "Usage", Icon: LineChart },
];

export function BottomTabs() {
  const pathname = usePathname();
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t flex justify-around pt-1 pb-[env(safe-area-inset-bottom)]"
      style={{
        background: "rgba(10,10,10,0.92)",
        backdropFilter: "blur(14px)",
        borderColor: "var(--border-2)",
      }}
    >
      {TABS.map(({ href, label, Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center gap-1 px-2 py-2 min-w-[60px] relative",
              active ? "text-[color:var(--content)]" : "text-[color:var(--muted)]"
            )}
          >
            <Icon size={18} strokeWidth={1.9} />
            <span className="text-[10.5px] font-medium">{label}</span>
            {active ? (
              <span
                className="absolute top-0 h-[2px] w-6 rounded-full"
                style={{ background: "var(--gradient-hot)" }}
              />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
