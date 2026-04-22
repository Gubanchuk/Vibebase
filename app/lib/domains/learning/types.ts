/**
 * Learning domain — структурный курс.
 * Базовая единица = CurriculumTopic (из Curator-агента). Под каждый топик
 * генерится LessonContent (Teacher) и трекается LessonMastery (через quiz).
 */

export type LearningDomain = "english" | "vibecoding";

export interface CurriculumTopic {
  id: string;
  domain: LearningDomain;
  slug: string;
  title: string;
  summary: string;
  /** 1-5, насколько тема важна в домене. */
  importance: 1 | 2 | 3 | 4 | 5;
  /** сколько vault-items её упоминали. */
  popularity: number;
  levelMin: string | null;
  levelMax: string | null;
  tags: string[];
  vaultRefs: string[];
  prerequisites: string[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuizItem {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LessonContent {
  id: string;
  topicId: string;
  userId: string;
  levelSnapshot: string | null;
  introMd: string;
  conceptMd: string;
  exampleMd: string;
  exerciseMd: string;
  exerciseSolutionMd: string;
  quiz: QuizItem[];
  generatedAt: string;
  modelUsed: string | null;
  tokensIn: number | null;
  tokensOut: number | null;
  costUsd: number | null;
}

export interface LessonMastery {
  userId: string;
  topicId: string;
  attempts: number;
  quizBestScore: number;
  quizBestTotal: number;
  exercisePassed: boolean;
  masteredAt: string | null;
  lastAttemptAt: string | null;
  notes: string | null;
}

export interface TopicWithMastery extends CurriculumTopic {
  mastery: LessonMastery | null;
}

export type MasteryState = "new" | "in-progress" | "mastered";

export function masteryStateOf(m: LessonMastery | null): MasteryState {
  if (!m) return "new";
  if (m.masteredAt) return "mastered";
  return "in-progress";
}
