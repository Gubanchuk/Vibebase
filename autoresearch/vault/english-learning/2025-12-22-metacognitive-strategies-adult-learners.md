---
type: english-learning
source: cambridge-annual-review
url: https://www.cambridge.org/core/journals/annual-review-of-applied-linguistics/article/second-language-anxiety-construct-effects-and-sources/2FFCB23F8EA271606AED54CC7088358D
title: "Metacognitive strategies для adult L2 learners"
tldr: |
  Meta-analysis показывает: adult learners которые **explicitly trained**
  в metacognitive strategies (planning, monitoring, evaluating learning)
  outperform untrained peers with same input. Три ключевые: (1)
  self-questioning («did I understand?», «what's new here?»), (2) error
  analysis (why did I err, not just what), (3) progress self-review (weekly
  reflection на gains). Effect size большой у adults, меньше у детей.
tags: [metacognition, adult-learners, strategies, self-regulation]
published_at: 2025-12-22
relevance: strong
---

# Three core metacognitive strategies

### 1. Self-questioning during input
Active reading/listening: every paragraph/minute, pause, ask:
- «What's new here for me?»
- «Did I fully understand this?»
- «What's the one takeaway?»

Effect: transforms passive exposure to active processing.

### 2. Error analysis after output
Не просто «ошибка исправлена». Дальше:
- «Почему я сделал эту ошибку?»
- «Это transfer из русского? Или я не знал правила? Или inattention?»
- «Как я буду proactively избегать её в next session?»

3-4 повторения одной и той же ошибки → meta-inference что она systematic
— triggering actual learning.

### 3. Weekly progress self-review
Sunday habit:
- What did I work on this week?
- What's the one thing я now know I didn't before?
- What's the one thing I still struggle with?
- What's the goal for next week?

Transform study from event-based to **project-based**.

# Why adults specifically

Children learn implicitly well — their brain is tuned for that. Adults
have ИЗБЫТОЧНЫЙ cognitive control — explicit metacognition leverages it.
Skipping metacognition with adults = wasting их comparative advantage.

# Practical для AI-tutor

- **After each exercise**: prompt user «что тебе было новое здесь?»
  — 1 sentence answer, saved
- **After each quiz fail**: «почему этот вариант звучит правильно но
  неверен?» — force meta-reflection
- **Weekly review mode** (v2): AI summarizes user's week, asks 3
  metacognitive questions

# Применимо у нас

В `/learn/[domain]/[slug]` после quiz-section (в сегодняшней структуре
она последняя) — добавить optional **«Summary» section 6**: 2-3
metacognitive вопроса. Делает lesson по-настоящему reflective.
