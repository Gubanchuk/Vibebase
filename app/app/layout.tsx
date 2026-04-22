import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Instrument_Serif } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Прокачка — Personal Skills Platform",
  description:
    "AI English tutor · skill roadmaps · vibecoding radar · journal. Personal growth OS.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ru"
      className={`${inter.variable} ${jetbrains.variable} ${instrument.variable} dark`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh antialiased">
        {/* SVG defs for progress-ring gradient (referenced by .progress-ring .fg) */}
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
          <defs>
            <linearGradient id="gradient-hot" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97066" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>
          </defs>
        </svg>
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              color: "var(--content)",
              fontSize: "13px",
            },
          }}
        />
      </body>
    </html>
  );
}
