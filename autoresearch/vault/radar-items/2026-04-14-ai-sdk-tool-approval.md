---
type: radar-item
source: ai-sdk-docs
url: https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling
title: "AI SDK — human-in-the-loop tool approval via useChat"
tldr: |
  You can now flag specific tools as requiring explicit user approval. When
  the model tries to call them, `useChat` surfaces a `toolApprovalRequest`
  and the UI renders an Approve/Reject button pair. Tool resumes on approval.
  Useful for destructive or expensive tools (file writes, external API calls).
tags: [ai-sdk, tool-use, safety, ux]
published_at: 2026-04-14
relevance: strong
related_skill: vibecoding
---

# Apply to our app

When we add a "generate skill lesson" tool that writes to Supabase
`skill_lessons`, set approval required = true so the user sees a Preview
button before we commit.
