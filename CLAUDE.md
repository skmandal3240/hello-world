# CLAUDE.md — Operating Manual

> This is a living operating manual. Every section is actionable. Read it before coding anything.

---

## 1. Operating Context

```
Branch:   claude/rate-app-ideas-gUJLL
Push:     git push -u origin claude/rate-app-ideas-gUJLL
Timezone: UTC (default)
Node:     v20+ required   |   Python: 3.11+
```

**Before every commit:**
- [ ] No hardcoded secrets (API keys, passwords, tokens)
- [ ] All user inputs validated with Zod
- [ ] Parameterized queries only (Prisma handles this)
- [ ] Rate limiting on all new endpoints
- [ ] Error messages don't expose stack traces to client

---

## 2. Monorepo Map

```
hello-world/
├── ai-finance-tracker/     Express:3001 | React+Vite:5174 | Plaid + Claude AI
│   ├── client/             React 18 + Router + Recharts + Plaid Link + Papaparse
│   └── server/             Express + Prisma + JWT + Zod + Pino + Helmet
│
├── habit-coach/            Express:3002 | React+Vite:5175 | Claude AI + Socket.io + node-cron
│   ├── client/             React 18 + Router + Socket.io-client + Axios
│   └── server/             Express + Prisma + JWT + Zod + Pino + Helmet + node-cron
│
├── APP_IDEAS.md            Rated backlog of app ideas
├── habit-coach/openapi.yaml  OpenAPI 3.1 spec (source of truth for API contracts)
└── CLAUDE.md               This file
```

### habit-coach API surface (30 endpoints)

| Group | Method | Path | Auth |
|-------|--------|------|------|
| auth | POST | /auth/signup | — |
| auth | POST | /auth/login | — |
| auth | POST | /auth/refresh | — |
| auth | POST | /auth/logout | ✓ |
| auth | GET | /auth/me | ✓ |
| auth | PATCH | /auth/me | ✓ |
| habits | GET | /habits | ✓ |
| habits | POST | /habits | ✓ |
| habits | GET | /habits/:id | ✓ |
| habits | PATCH | /habits/:id | ✓ |
| habits | POST | /habits/:id/archive | ✓ |
| habits | DELETE | /habits/:id | ✓ |
| checkins | GET | /check-ins/today | ✓ |
| checkins | GET | /check-ins/history | ✓ |
| checkins | POST | /check-ins | ✓ |
| checkins | PATCH | /check-ins/:id | ✓ |
| partner | GET | /partner/status | ✓ |
| partner | POST | /partner/opt-in | ✓ |
| partner | POST | /partner/opt-out | ✓ |
| partner | GET | /partner/habits | ✓ |
| partner | GET | /partner/messages | ✓ |
| partner | POST | /partner/messages | ✓ |
| ai | GET | /ai/nudge | ✓ |
| ai | GET | /ai/weekly-summary | ✓ |
| ai | POST | /ai/chat | ✓ |
| notifications | GET | /notifications | ✓ |
| notifications | GET | /notifications/unread-count | ✓ |
| notifications | PATCH | /notifications/:id/read | ✓ |
| notifications | PATCH | /notifications/read-all | ✓ |
| notifications | DELETE | /notifications/:id | ✓ |

---

## 3. Tech Stack Quick Reference

### habit-coach

```
Server port:  3002          Client port: 5175
Database:     PostgreSQL via Prisma ORM
Auth:         JWT (access=15m, refresh=7d) + bcrypt
AI:           @anthropic-ai/sdk → claude-sonnet-4-6
Realtime:     socket.io 4.x (server + client)
Scheduler:    node-cron (DAG-ordered jobs)
Validation:   zod 3.x (all route inputs)
Security:     helmet + express-rate-limit
Logging:      pino + pino-pretty (dev)
```

**Environment variables:**
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/habit_coach_db"
JWT_ACCESS_SECRET="min-32-chars"          JWT_REFRESH_SECRET="min-32-chars"
JWT_ACCESS_EXPIRES_IN="15m"               JWT_REFRESH_EXPIRES_IN="7d"
ANTHROPIC_API_KEY="sk-ant-..."
PORT=3002                                 CLIENT_URL="http://localhost:5175"
NODE_ENV="development"
VITE_API_URL="http://localhost:3002"      VITE_SOCKET_URL="http://localhost:3002"
```

**Scripts (run from habit-coach/):**
```bash
npm run dev           # Start server + client concurrently
npm run build         # Build both
npm run db:migrate    # Run Prisma migrations
npm run db:seed       # Seed database
npm run db:studio     # Open Prisma Studio GUI (localhost:5555)
```

### ai-finance-tracker

```
Server port:  3001          Client port: 5174
Database:     PostgreSQL via Prisma ORM
Auth:         JWT (access=15m, refresh=7d) + bcrypt
AI:           @anthropic-ai/sdk → claude-sonnet-4-6
Banking:      Plaid API (PLAID_ENV=sandbox for dev)
Charts:       recharts        CSV: papaparse
```

**Environment variables:**
```bash
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/ai_finance_tracker"
JWT_ACCESS_SECRET="min-32-chars"          JWT_REFRESH_SECRET="min-32-chars"
ANTHROPIC_API_KEY="sk-ant-..."
PLAID_CLIENT_ID=""    PLAID_SECRET=""     PLAID_ENV="sandbox"
PLAID_REDIRECT_URI="http://localhost:5174/plaid-callback"
PORT=3001             CLIENT_URL="http://localhost:5174"
```

**API pattern (both apps):** All routes → Zod validation → `authenticateToken` middleware → Pino logging → Prisma query. Rate-limited via `express-rate-limit`.

---

## 4. Installed Tooling Registry

### Claude Code Tooling

| Tool | Version | Key Commands |
|------|---------|-------------|
| SuperClaude | v4.2.0 | `/sc/implement` `/sc/design` `/sc/analyze` `/sc/brainstorm` `/sc/troubleshoot` `/sc/research` `/sc/improve` `/sc/git` `/sc/build` `/sc/test` — 31 total |
| Everything Claude Code | v1.8.0 | 25 agents via Agent tool + `/code-review` `/tdd` `/security-scan` `/build-fix` `/e2e` `/plan` `/refactor-clean` `/docs` `/devfleet` — 58 total |
| Marketing Skills | v1.0 | `/marketing/copywriting` `/marketing/launch-strategy` `/marketing/content-strategy` `/marketing/seo-audit` `/marketing/email-sequence` `/marketing/pricing-strategy` — 33 total |

### Installed CLI + Python Tools

**Firecrawl Python SDK v4.19.0** — Turn any URL into clean LLM-ready markdown
```python
from firecrawl import FirecrawlApp
app = FirecrawlApp(api_key="fc-YOUR_KEY")  # get key at firecrawl.dev

# Scrape single page → markdown
result = app.scrape_url("https://example.com", formats=["markdown"])
print(result.markdown)

# Crawl entire site (e.g. documentation)
crawl = app.crawl_url("https://docs.example.com", limit=50)
for page in crawl.data:
    print(page.markdown)
```
**When to use:** Feed real-world content to Claude (habit tips, financial news, docs crawling), JS-heavy SPAs, structured extraction from websites.

---

**Scrapling v0.4.2** — Adaptive Python scraping with anti-bot bypass
```python
from scrapling.defaults import Fetcher, PlayWrightFetcher

# Static pages (fast, no browser)
page = Fetcher(auto_match=True).get("https://example.com")
titles = page.css("h1")            # CSS selectors
prices = page.xpath("//span[@class='price']")
text   = page.get_all_text(ignore_tags=('script', 'style'))

# JS-heavy / Cloudflare-protected sites
page = PlayWrightFetcher().fetch("https://cloudflare-site.com")
```
**When to use:** Data pipelines, structured scraping, bypassing bot detection, sites that change layout frequently (`auto_match=True` adapts selectors).

---

**Hermes Agent v0.3.0** — Self-improving AI agent with persistent memory
```bash
hermes                        # Interactive REPL
hermes --help                 # All CLI flags

~/.hermes/config.yaml         # Configure: OpenAI, Claude, Gemini, Ollama, 20+ providers
~/.hermes/skills/             # 92 built-in skills (github-pr-workflow, xitter, pokemon-player...)
~/.hermes/memories/           # Persistent cross-session memory store
~/.hermes/cron/               # Schedule automated agent tasks (24/7 unattended)
~/.hermes/sessions/           # Conversation history
```
**When to use:** Autonomous AI agents that remember context across sessions, scheduled AI jobs, Telegram/Discord bot automation, multi-model orchestration.

---

**octo-cli v0.23.0** — Full GitHub REST API from terminal
```bash
octo --version
octo repos list-for-authenticated-user
octo issues list --owner OWNER --repo REPO --state open
octo pulls create --owner OWNER --repo REPO --title "title" --head branch --base main
octo repos get --owner OWNER --repo REPO
octo search repos --q "topic:react stars:>1000"
```
**When to use:** GitHub automation, batch PR/issue operations, CI scripts, repo analytics.

---

**AionUi** — Desktop AI Cowork Platform (download from github.com/iOfficeAI/AionUi)
```
Platform:     macOS / Windows / Linux
Requirements: 4GB+ RAM
Features:
  - 12+ CLI agent integrations (Claude Code, Codex, Qwen Code, Gemini CLI...)
  - 20+ AI model providers + Ollama local models
  - Scheduled automation (cron-based, 24/7 unattended operation)
  - Remote access via WebUI, Telegram, Lark, DingTalk webhooks
  - File management, Excel data processing, PPT/Word/Markdown generation
  - 12 professional built-in assistants with customizable skills
```
**When to use:** Complex multi-agent workflows that need a desktop GUI, cross-platform unattended automation, teams using multiple AI models, Telegram-driven remote control.

---

## 5. Smart Decision Trees

```
╔══════════════════════════════════════════════════════════════════╗
║  WHAT DO YOU NEED TO DO?                                         ║
╠══════════════════════════════════════════════════════════════════╣
║  Add new API endpoint      →  Copy §7 Express Route Template     ║
║  Add new React page        →  Copy §7 React Page Template        ║
║  Add new DB model          →  Playbook B (§9)                    ║
║  New AI feature            →  Copy §7 AI Service Template        ║
║  Schedule background job   →  Copy §7 Cron Job Template          ║
║  Add Socket.io event       →  Copy §7 Socket Template            ║
║  New endpoint (any)        →  Define in openapi.yaml FIRST       ║
╠══════════════════════════════════════════════════════════════════╣
║  Scrape static site        →  Scrapling Fetcher                  ║
║  Scrape JS/SPA site        →  Scrapling PlayWrightFetcher         ║
║  Feed URL content to AI    →  Firecrawl → markdown → Claude      ║
║  GitHub automation         →  octo CLI                           ║
║  AI agent with memory      →  hermes (persistent ~/.hermes/)     ║
║  Multi-agent desktop tasks →  AionUi                             ║
╠══════════════════════════════════════════════════════════════════╣
║  Build fails               →  build-error-resolver agent         ║
║  After writing any code    →  code-reviewer agent (MANDATORY)    ║
║  New feature (complex)     →  planner agent FIRST                ║
║  Auth / security code      →  security-reviewer agent            ║
║  Any new feature           →  tdd-guide agent (tests first)      ║
║  DB query / schema         →  database-reviewer agent            ║
║  Architecture decision     →  architect agent                    ║
╠══════════════════════════════════════════════════════════════════╣
║  Write marketing copy      →  /marketing/copywriting             ║
║  Plan a product launch     →  /marketing/launch-strategy         ║
║  Plan content calendar     →  /marketing/content-strategy        ║
║  SEO audit                 →  /marketing/seo-audit               ║
║  Pricing decisions         →  /marketing/pricing-strategy        ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 6. Agent + Command Directory

### Agents (use via `Agent` tool, `subagent_type` parameter)

| Agent | Trigger | What it does |
|-------|---------|-------------|
| `planner` | Before any complex feature | Creates implementation plan, identifies risks, breaks into phases |
| `code-reviewer` | After writing/modifying code | Reviews quality, security, maintainability — use EVERY time |
| `security-reviewer` | Auth, API keys, user input, DB | Flags OWASP Top 10, secrets, injection, unsafe crypto |
| `tdd-guide` | Any new feature or bug fix | Enforces red→green→refactor; ensures 80%+ coverage |
| `build-error-resolver` | TypeScript/build failures | Fixes errors with minimal diffs, gets build green fast |
| `database-reviewer` | Schema design, migrations, queries | PostgreSQL optimization, Prisma patterns, index advice |
| `e2e-runner` | Critical user flows | Playwright E2E tests for login, checkout, onboarding |
| `architect` | System design, large refactors | Scalability, coupling, abstraction decisions |
| `doc-updater` | After shipping features | Keeps CLAUDE.md, READMEs, openapi.yaml in sync |
| `refactor-cleaner` | Dead code, duplicates | Runs knip/depcheck, removes unused exports/files |

### Commands (top picks)

| Command | Purpose |
|---------|---------|
| `/sc/implement` | Feature implementation with intelligent persona + MCP |
| `/sc/design` | Architecture, APIs, component interface design |
| `/sc/analyze` | Deep analysis: quality, security, performance, architecture |
| `/sc/brainstorm` | Interactive requirements discovery via Socratic dialogue |
| `/sc/troubleshoot` | Systematic debug and fix |
| `/sc/research` | Deep web research with adaptive planning |
| `/code-review` | Full quality review |
| `/tdd` | TDD workflow: scaffold → test → implement |
| `/security-scan` | Vulnerability audit |
| `/build-fix` | Fix build/compile errors |
| `/e2e` | Generate + run Playwright E2E tests |
| `/plan` | Implementation plan with risk assessment |
| `/refactor-clean` | Remove dead code, consolidate duplicates |
| `/devfleet` | Orchestrate parallel agent fleet tasks |

---

## 7. Copy-Paste Code Templates

### Express Route File

```typescript
// src/routes/example.routes.ts
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth.middleware';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';

const router = Router();

const CreateExampleSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const items = await prisma.example.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(items);
  } catch (error) {
    logger.error({ error }, 'Failed to get examples');
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const body = CreateExampleSchema.parse(req.body);
    const item = await prisma.example.create({
      data: { ...body, userId: req.user!.id },
    });
    res.status(201).json(item);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    logger.error({ error }, 'Failed to create example');
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
```

### React Page Component

```tsx
// src/pages/ExamplePage.tsx
import { useState, useEffect } from 'react';
import api from '../lib/api'; // axios instance with baseURL + auth interceptor

interface Example { id: string; name: string; createdAt: string; }

export default function ExamplePage() {
  const [items, setItems] = useState<Example[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<Example[]>('/examples')
      .then(res => setItems(res.data))
      .catch(err => setError(err.response?.data?.error ?? 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64">Loading...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Examples</h1>
      {items.map(item => (
        <div key={item.id} className="border rounded-lg p-4 mb-2">{item.name}</div>
      ))}
    </div>
  );
}
```

### Anthropic AI Service Call (with retry/backoff)

```typescript
// Retry pattern from TensorFlow backoff: 2s → 4s → 8s → 16s
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function callClaude(
  systemPrompt: string,
  userMessage: string,
  maxRetries = 3
): Promise<string> {
  const delays = [2000, 4000, 8000, 16000];

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-6',   // Best coding + reasoning model
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      });
      return (response.content[0] as { text: string }).text;
    } catch (error: any) {
      if (attempt === maxRetries) throw error;
      if (error.status === 429 || error.status >= 500) {
        await new Promise(r => setTimeout(r, delays[attempt]));
      } else {
        throw error; // Don't retry 4xx auth/validation errors
      }
    }
  }
  throw new Error('Max retries exceeded');
}

// Streaming version (for /ai/chat endpoint):
async function streamClaude(
  systemPrompt: string,
  userMessage: string,
  onChunk: (text: string) => void
) {
  const stream = client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });
  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
      onChunk(chunk.delta.text);
    }
  }
}
```

### Socket.io Event Handler

```typescript
// server: src/sockets/example.socket.ts
import { Server, Socket } from 'socket.io';

export function registerExampleHandlers(io: Server, socket: Socket) {
  socket.on('example:send', async (data: { message: string }) => {
    try {
      io.to(socket.data.roomId).emit('example:received', {
        from: socket.data.userId,
        message: data.message,
        timestamp: new Date().toISOString(),
      });
    } catch {
      socket.emit('error', { message: 'Failed to process event' });
    }
  });
}

// client: src/hooks/useSocket.ts
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export function useSocket(token: string) {
  const socketRef = useRef<Socket | null>(null);
  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 2000,
    });
    return () => { socketRef.current?.disconnect(); };
  }, [token]);
  return socketRef.current;
}
```

### node-cron Job (Kubeflow DAG Pattern — Idempotent)

```typescript
// src/scheduler/jobs/example.job.ts
import { logger } from '../lib/logger';
import { prisma } from '../lib/prisma';

export async function runExampleJob(): Promise<void> {
  const JOB = 'example-job';
  logger.info(`[${JOB}] Starting`);
  try {
    // Idempotency check: was this already done today?
    const today = new Date(); today.setHours(0,0,0,0);
    const alreadyRan = await prisma.jobLog.findFirst({
      where: { jobName: JOB, createdAt: { gte: today } }
    });
    if (alreadyRan) { logger.info(`[${JOB}] Already ran, skipping`); return; }

    // Do the actual work here
    await doWork();

    await prisma.jobLog.create({ data: { jobName: JOB } });
    logger.info(`[${JOB}] Completed`);
  } catch (error) {
    logger.error({ error }, `[${JOB}] Failed`);
    // Never rethrow — let other jobs in the DAG continue
  }
}
// In scheduler/index.ts:
// cron.schedule('0 9 * * *', runExampleJob); // 9 AM UTC daily
```

### Scrapling + Firecrawl → Claude Pipeline

```python
#!/usr/bin/env python3
# scripts/scrape_and_summarize.py  (Python 3.11+)
import os, sys, anthropic
from scrapling.defaults import Fetcher, PlayWrightFetcher

def get_page_content(url: str) -> str:
    """Try static fetch first, fall back to headless browser."""
    try:
        page = Fetcher(auto_match=True).get(url)
        return page.get_all_text(ignore_tags=('script', 'style', 'nav', 'footer'))
    except Exception:
        page = PlayWrightFetcher().fetch(url)
        return page.get_all_text(ignore_tags=('script', 'style'))

def summarize_with_claude(content: str, prompt: str) -> str:
    client = anthropic.Anthropic()
    resp = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        messages=[{"role": "user", "content": f"{prompt}\n\n---\n{content[:8000]}"}]
    )
    return resp.content[0].text

if __name__ == "__main__":
    url = sys.argv[1]
    prompt = sys.argv[2] if len(sys.argv) > 2 else "Summarize in 3 bullet points:"
    content = get_page_content(url)
    print(summarize_with_claude(content, prompt))

# Usage:
# python3 scripts/scrape_and_summarize.py "https://jamesclear.com/habits" "Extract top 5 habit tips:"
```

---

## 8. Architectural Patterns (Learned from 11 OSS Repos)

### TensorFlow → Exponential Backoff
All external calls (Anthropic, Plaid, DB) use `[2s, 4s, 8s, 16s]` retry delays.
**Status:** Already applied to habit-coach scheduler. Apply to any new external service.

### Spring Boot → Convention over Configuration
Validate all env vars at startup with Zod. Fail immediately with a clear error if any are missing.
**Status:** Already applied via env validation in both apps. Never skip this for new apps.

### Hermes Agent → Persistent AI Memory Pattern
Hermes stores memories in `~/.hermes/memories/` as structured files across sessions.
**Apply to habit-coach:** Store AI chat turn history in a `ConversationMessage` Prisma model
keyed by `userId + sessionId`. This enables Claude to give contextual multi-turn coaching.
```prisma
model ConversationMessage {
  id        String   @id @default(cuid())
  userId    String
  sessionId String
  role      String   // "user" | "assistant"
  content   String
  createdAt DateTime @default(now())
}
```

### Firecrawl → LLM-Ready Content Pipeline
```
URL → Firecrawl (JS render + noise removal) → clean markdown → Claude context → response
```
**Apply to habit-coach:** "Daily Tip" feature — crawl habit science articles weekly,
store as markdown, inject into Claude system prompt for evidence-based personalized tips.

### Scrapling → Adaptive Scraping
`auto_match=True` makes CSS/XPath selectors survive website redesigns.
**Apply:** Use for any recurring data pipeline that ingests third-party web data.

### AionUi → Multi-Agent Orchestration Pattern
Model complex pipelines as directed acyclic graphs:
```
trigger (cron/webhook)
  └→ step 1: fetch data (agent)
       └→ step 2: process (agent)
            └→ step 3: notify user (agent)
```
Each step is idempotent. Matches the existing `node-cron` DAG in habit-coach.
**Apply:** Any background pipeline with 3+ steps should be modeled this way.

### AionUi → Webhook/External Notifications
AionUi routes notifications through Telegram, Lark, DingTalk.
**Apply to habit-coach:** Future enhancement — when partner completes a habit,
POST to user's configured Telegram webhook:
```typescript
if (user.telegramChatId) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: user.telegramChatId,
      text: `${partner.displayName} just completed "${habit.name}" 🎉`
    })
  });
}
```

### OpenAPI → API-First Design
`habit-coach/openapi.yaml` is the **source of truth** for all API contracts.
**Rule:** Define new endpoints in `openapi.yaml` BEFORE writing route code.
Enables: auto-generated docs, client SDK generation, contract testing.

### RPI_DEV → Modular Event Architecture
GPIO pins in embedded systems are single-concern modules — one handler per pin.
**Apply to Socket.io:** Each event type gets its own file. No god-files.
```
src/sockets/
├── connection.socket.ts   (auth, join rooms)
├── message.socket.ts      (partner messages)
├── habit.socket.ts        (live habit updates)
└── index.ts               (registers all handlers: registerAll(io))
```

### EbookFoundation → Curated Free Learning Resources
Directly relevant to this stack (all free online):
- **TypeScript Deep Dive** — https://basarat.gitbook.io/typescript/
- **You Don't Know JS** — https://github.com/getify/You-Dont-Know-JS
- **Node.js Design Patterns** (3rd ed) — patterns for Express, streams, events
- **PostgreSQL: Up and Running** — DB optimization and indexing
- **Designing Data-Intensive Applications** (Kleppmann) — DAG/scheduler architecture
- **Pro Git** — https://git-scm.com/book/en/v2

---

## 9. Common Task Playbooks

### Playbook A: Add a Feature End-to-End

```
1. PLAN:     Launch planner agent → review plan before touching code
2. DB:       Edit prisma/schema.prisma → npm run db:migrate (from app root)
             Update prisma/seed.ts if needed
3. OPENAPI:  Add endpoint to habit-coach/openapi.yaml (define contract first)
4. TESTS:    Launch tdd-guide agent → write tests BEFORE implementing
5. API:      Create src/routes/feature.routes.ts (use §7 template)
             Register: app.use('/api/feature', featureRouter) in index.ts
6. CLIENT:   Create src/pages/FeaturePage.tsx (use §7 template)
             Add route in App.tsx router config
7. REVIEW:   Launch code-reviewer agent on ALL changed files
8. COMMIT:   git add <specific files> (never git add .)
             git commit -m "feat: add [feature name]"
```

### Playbook B: Add a New Prisma DB Model

```
1. Edit:    server/prisma/schema.prisma — add model block
2. Migrate: npm run db:migrate (prompts for migration name)
3. Seed:    Update prisma/seed.ts to include example records
4. Use:     import { prisma } from '../lib/prisma' in route/service files
5. Review:  Launch database-reviewer agent on schema change
```

### Playbook C: Debug a Failing API Endpoint

```
1. LOGS:    Check server pino output — the actual error is always there
2. TEST:    curl -X POST http://localhost:3002/api/route \
              -H "Authorization: Bearer TOKEN" \
              -H "Content-Type: application/json" \
              -d '{"field": "value"}'
3. TRACE:   Add logger.debug({body: req.body}, 'debug checkpoint') temporarily
4. FIX:     Zod error → fix input schema
            Prisma error → check migration ran, model matches schema
            JWT error → check middleware order, token format
```

### Playbook D: Scrape + AI-Process Web Content

```
1. SCRAPE:  python3 scripts/scrape_and_summarize.py "URL" "prompt"
            → static sites: Scrapling Fetcher (fast, no browser)
            → JS/SPAs: Scrapling PlayWrightFetcher (headless Chrome)
            → entire sites: Firecrawl crawl_url (best markdown quality)

2. INJECT:  Pass scraped markdown as system prompt context to Claude
            claude-sonnet-4-6 handles 200K tokens → ~150k words of context

3. STORE:   Cache result in DB (e.g. Notification table pattern) to avoid
            re-scraping on every request (check freshness before crawling)
```

### Playbook E: Ship a Background Cron Job

```
1. CREATE:   src/scheduler/jobs/jobname.job.ts (use §7 cron template)
2. TEST:     Call runJobNameJob() directly in a test script first
3. IDEMPOTENT: Always check "was this already done today?" before executing
4. REGISTER: Add to scheduler DAG in src/scheduler/index.ts
             Position in DAG based on dependencies (nudge → streak → re-engagement)
5. MONITOR:  All jobs must log [jobName] START / SKIP / COMPLETE / ERROR with pino
             Never rethrow errors — log and continue so other jobs aren't blocked
```

### Playbook F: Use Hermes for Autonomous AI Tasks

```
1. START:   hermes (interactive) or hermes --model claude-sonnet-4-6
2. MEMORY:  Hermes auto-saves memories to ~/.hermes/memories/
            Reference: "remember that X" / "what do you know about Y?"
3. SKILLS:  ls ~/.hermes/skills/   # Browse 92 available skills
            hermes --skill github-pr-workflow  # Run specific skill
4. CRON:    Add task to ~/.hermes/cron/ for 24/7 unattended execution
5. CONFIG:  Edit ~/.hermes/config.yaml to set default model + API keys
```

---

## 10. Project File Structure Reference

```
server/src/
├── index.ts              Entry: middleware setup, route registration, socket init
├── routes/               One file per resource (auth, habits, checkins, etc.)
├── services/             Business logic (ai.service.ts, matching.service.ts)
├── middleware/            auth.middleware.ts, validate.middleware.ts
├── lib/                  prisma.ts, logger.ts, jwt.ts
├── scheduler/            (habit-coach) DAG cron jobs
│   ├── index.ts          Job registration + ordering
│   └── jobs/             One file per job
├── sockets/              (habit-coach) Socket.io handlers
│   ├── index.ts          registerAll(io)
│   └── *.socket.ts       One file per event group
└── types/                TypeScript interfaces, express augmentations

client/src/
├── pages/                One file per route
├── components/           Reusable UI (never route-specific logic)
├── hooks/                Custom React hooks (useSocket, useAuth, etc.)
├── lib/                  api.ts (axios instance), socket.ts
├── context/              AuthContext, SocketContext
└── types/                Shared TypeScript interfaces
```

---

## 11. Kubeflow DAG Scheduler (habit-coach)

Jobs are ordered as a dependency graph — not independent crons:

```
09:00  daily-nudge          → AI generates personalized nudge for each user
09:05  streak-check         → evaluates current streaks, flags at-risk users
09:10  re-engagement        → only runs if streak broken (conditional step)

08:00 Sun  weekly-summary   → AI-generated weekly progress report
01:00 daily  partner-matching → anonymous partner pairing (independent)
```

**Invariants (never break these):**
- Every job is **idempotent** — checks before executing, safe to re-run
- Every job **catches its own errors** — never crashes the process
- Every external API call uses **[2s, 4s, 8s, 16s]** retry backoff
- Every job logs `[jobName] START`, `SKIP`, `COMPLETE`, or `ERROR` with pino

---

*Last updated: 2026-03-17 | Branch: claude/rate-app-ideas-gUJLL*
*Tools installed: firecrawl-py v4.19.0, scrapling v0.4.2, hermes v0.3.0, octo-cli v0.23.0*
