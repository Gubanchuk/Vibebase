---
type: english-learning
source: eric-ed
url: https://files.eric.ed.gov/fulltext/ED507194.pdf
title: "Long's Interaction Hypothesis — negotiation of meaning в SLA"
tldr: |
  Michael Long (1981, revised 1996): языковая proficiency продвигается
  через face-to-face interaction. Ключевой механизм — negotiation of
  meaning: когда возникает communication breakdown, собеседники делают
  confirmation checks, comprehension checks, clarification requests.
  Revised версия добавила focus on noticing + corrective feedback.
  Input становится comprehensible именно через эту negotiation, не
  просто через exposure.
tags: [interaction-hypothesis, long, negotiation, sla, theory]
published_at: 2025-06-10
relevance: strong
---

# Три механизма negotiation

### Confirmation check
— «You mean you went to the store?»
Подтверждение что понял правильно. Даёт learner'у scaffolding.

### Comprehension check
— «Did you understand what I said?»
Native (или более продвинутый) проверяет что learner усвоил.

### Clarification request
— «Sorry, what did you say?»
Заставляет learner'а переформулировать, activating pushed output.

# Взаимодействие с Krashen и Swain

Long синтезирует Krashen (input важен) и Swain (output важен): их связь
— **interaction**. Именно в интеракции input становится усваиваемым,
а output получает feedback. Все три — compatible.

# Practical implementation для AI-тьютора

AI симулирует все три стратегии:
- **confirmation check** — «Насколько я понял, ты хочешь сказать X?»
- **comprehension check** — «Давай проверим: что значит Past Perfect здесь?»
- **clarification request** — если юзер пишет ambiguous L2-предложение,
  тьютор просит уточнить: «I'm not sure what you mean — can you
  rephrase?»

# Применимо у нас

Mode 1 (Native chat) должен активно использовать negotiation-strategies,
не просто выдавать информацию. Это отличается от chat-GPT-style «я
отвечу на вопрос» — тут AI сам задаёт вопросы, чтобы форсить output.
