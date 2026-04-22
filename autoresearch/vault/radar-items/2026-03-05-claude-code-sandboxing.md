---
type: radar-item
source: claude-docs
url: https://code.claude.com/docs/en/sandboxing
title: "Claude Code Sandboxing — native isolation для agent workflows"
tldr: |
  Anthropic зашипила native sandboxing в Claude Code. Три уровня: per-tool
  allowlist (default), per-session sandbox (configurable через settings.json),
  per-agent microVM (для untrusted code). Интегрируется с hooks для audit-log
  и с `permissionMode` (ask / acceptEdits / plan / bypassPermissions) для
  тонкого контроля.
tags: [claude-code, sandbox, security, permissions]
published_at: 2026-03-05
relevance: strong
related_skill: vibecoding
---

# Три уровня sandboxing

### Level 1 — per-tool allowlist
Встроено с rel.1. В `.claude/agents/*.md` указываешь:
```yaml
tools: Read, Grep, Bash(npm test:*)
```
Bash-команды вне allowlist-маски не выполняются.

### Level 2 — per-session sandbox
В `settings.json`:
```json
{
  "sandbox": {
    "networkAllowlist": ["api.supabase.co", "api.openai.com"],
    "fsWritePaths": ["app/", "!/app/.env.local"]
  }
}
```

### Level 3 — per-agent microVM
Для subagents, выполняющих untrusted input (например user-submitted code
для review). Интегрируется с Vercel Sandbox или Modal.

# Применимо у нас

Сейчас Claude Code юзается локально, на dev-машине юзера — sandboxing
не критичен. Но если вдруг добавим «sandbox execute» feature для Vibebase
(типа «прогони мой скилл в изоляции»), Level 3 — канонический путь.
