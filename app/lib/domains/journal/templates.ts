/**
 * Journal templates — starter markdown snippets users can insert at cursor.
 *
 * Each body is a ~6-line skeleton. The `{date}` / `{n}` tokens are resolved
 * by the editor at insertion time.
 */

export interface JournalTemplate {
  id: string;
  label: string;
  /** lucide-react icon name — resolved in the component layer. */
  icon: string;
  description: string;
  body: string;
}

export const DAILY_REFLECTION = `# {date}

## Что сделал


## Что понял


## На завтра

`;

export const LESSON_NOTE = `# Заметки к уроку

**Навык:**
**Тема:**

## Ключевая идея

## Примеры

## Сложности`;

export const IDEA = `# 💡

**Контекст:**

**Идея:**

**Следующий шаг:**`;

export const WEEKLY_REVIEW = `# Неделя {n}

## Прогресс

## Победы

## Застряло

## Фокус на следующую неделю`;

export const TEMPLATES: JournalTemplate[] = [
  {
    id: "daily-reflection",
    label: "Ежедневная рефлексия",
    icon: "Sunrise",
    description: "Что сделал, что понял, план на завтра",
    body: DAILY_REFLECTION,
  },
  {
    id: "lesson-note",
    label: "Заметки к уроку",
    icon: "BookOpen",
    description: "Навык, тема, ключевая идея, примеры",
    body: LESSON_NOTE,
  },
  {
    id: "idea",
    label: "Идея",
    icon: "Lightbulb",
    description: "Контекст, суть, следующий шаг",
    body: IDEA,
  },
  {
    id: "weekly-review",
    label: "Еженедельный обзор",
    icon: "CalendarRange",
    description: "Прогресс, победы, затыки, фокус",
    body: WEEKLY_REVIEW,
  },
];

/** Resolve {date} / {n} tokens in a template body. */
export function resolveTemplateBody(body: string, opts?: { date?: Date; weekNumber?: number }): string {
  const d = opts?.date ?? new Date();
  const dateStr = d.toISOString().slice(0, 10);
  const n = opts?.weekNumber ?? isoWeekNumber(d);
  return body.replace(/\{date\}/g, dateStr).replace(/\{n\}/g, String(n));
}

function isoWeekNumber(d: Date): number {
  const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  return Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
