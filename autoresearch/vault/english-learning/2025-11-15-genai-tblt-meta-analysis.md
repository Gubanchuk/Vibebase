---
type: english-learning
source: springer-techtrends
url: https://link.springer.com/article/10.1007/s11528-025-01140-7
title: "Generative AI + Task-Based Language Teaching — meta-analysis"
tldr: |
  Systematic review 2025 эффективности GenAI-integrated TBLT: LLM-
  generated tasks, AI role-play partners, automated corrective feedback.
  Результаты: GenAI-augmented TBLT значимо outperforms traditional
  textbook-TBLT по measures accuracy, fluency, learner engagement.
  Критический фактор: quality of prompting, не просто «use AI». Учителя
  с структурным prompt-engineering получают x2 results vs ad-hoc.
tags: [genai, tblt, meta-analysis, ai-tutor, research]
published_at: 2025-11-15
relevance: strong
---

# Что включает GenAI+TBLT

1. **Task generation** — LLM создаёт materials под уровень в секунды
2. **Role-play partner** — AI играет native speaker, customer, interviewer
3. **Automated feedback** — grammar + vocabulary + content review
4. **Adaptive difficulty** — следующая task генерится по результату
   предыдущей

# Findings

- **Accuracy**: +18% vs traditional TBLT после 8 weeks
- **Fluency** (words/minute): +24%
- **Engagement** (self-reported): +32%
- **Retention** (2-week delay): +14%

# Критический фактор — prompting quality

У учителей с structured prompts (role + context + constraints + output
format) effect — x2 vs teachers использующих «do X» без structure.
Это **ключевая находка** для инфраструктуры AI-tutor'ов: prompt matters
больше чем model size.

# Implications for tutor design

- **Every mode = carefully crafted prompt**, не generic «ты тьютор»
- **Prompt versioning** (см. radar: Latitude, Langfuse) — измерять что
  улучшает outcome
- **User feedback loop** — учитель-AI должен получать «this task was
  too easy/hard» signal и адаптировать

# Применимо у нас

Vibebase's approach — structured prompts на 400-500 слов на mode —
aligns with best practice. Следующий шаг: prompt versioning infrastructure
(v2) для A/B-testing какой версии Curator/Teacher даёт больше mastery.
