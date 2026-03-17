# Claude Code Configuration

This file documents the Claude Code tooling installed globally for this project.

## Installed Tooling

### SuperClaude Framework (v4.2.0)
31 slash commands installed to `~/.claude/commands/sc/`:

| Command | Purpose |
|---------|---------|
| `/sc/implement` | Implement features step-by-step |
| `/sc/build` | Build and compile projects |
| `/sc/test` | Run and analyze tests |
| `/sc/design` | Design system architecture |
| `/sc/analyze` | Analyze code/data |
| `/sc/improve` | Improve existing code quality |
| `/sc/troubleshoot` | Debug and fix issues |
| `/sc/research` | Research patterns and libraries |
| `/sc/brainstorm` | Generate ideas |
| `/sc/git` | Git operations assistance |
| `/sc/pm` | Project management tasks |
| `/sc/document` | Generate documentation |
| `/sc/workflow` | Define multi-step workflows |
| `/sc/agent` | Spawn specialized agents |
| `/sc/spawn` | Launch task-specific subagents |

### Everything Claude Code (v1.8.0)
Installed from [affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code):

**25 Agents** (`~/.claude/agents/`):
- `architect` — System design and architecture decisions
- `code-reviewer` — Code quality review
- `planner` — Implementation planning and task breakdown
- `build-error-resolver` — Fix build/compile errors
- `database-reviewer` — DB schema and query review
- `e2e-runner` — End-to-end test execution
- `security-reviewer` — Security vulnerability scanning
- `tdd-guide` — Test-driven development guidance
- `doc-updater` — Keep documentation in sync
- `harness-optimizer` — Optimize Claude Code workflows
- `chief-of-staff` — Multi-agent orchestration
- Language-specific reviewers: `python`, `go`, `java`, `cpp`, `kotlin`, `swift`, `php`
- Language-specific build resolvers: `go`, `java`, `cpp`, `kotlin`, `gradle`

**58 Commands** (`~/.claude/commands/`):

| Command | Purpose |
|---------|---------|
| `/tdd` | Test-driven development workflow |
| `/plan` | Implementation planning |
| `/e2e` | Generate and run E2E tests |
| `/code-review` | Code quality review |
| `/build-fix` | Fix build errors |
| `/security-scan` | Security audit |
| `/refactor-clean` | Clean refactoring |
| `/docs` | Generate/update docs |
| `/evolve` | Continuous improvement loop |
| `/checkpoint` | Save session checkpoint |
| `/eval` | Evaluate code quality |
| `/devfleet` | Multi-agent fleet tasks |

**9 Rules** (`~/.claude/rules/`): TypeScript, security, testing, documentation guidelines.

### Marketing Skills (coreyhaines31/marketingskills)
33 marketing workflow commands installed to `~/.claude/commands/marketing/`:

| Command | Use Case |
|---------|---------|
| `/marketing/copywriting` | Write/improve marketing copy |
| `/marketing/email-sequence` | Drip email campaigns |
| `/marketing/content-strategy` | Content marketing plans |
| `/marketing/seo-audit` | SEO analysis and fixes |
| `/marketing/ai-seo` | AI-assisted SEO content |
| `/marketing/paid-ads` | Ad creative and targeting |
| `/marketing/cold-email` | Cold outreach sequences |
| `/marketing/pricing-strategy` | Pricing page optimization |
| `/marketing/launch-strategy` | Product launch planning |
| `/marketing/competitor-alternatives` | Comparison pages |
| `/marketing/referral-program` | Referral system design |
| `/marketing/analytics-tracking` | Event tracking setup |
| `/marketing/churn-prevention` | Retention strategies |
| `/marketing/onboarding-cro` | Onboarding conversion optimization |
| `/marketing/page-cro` | Landing page CRO |
| `/marketing/ab-test-setup` | A/B test configuration |
| `/marketing/lead-magnets` | Lead generation assets |
| `/marketing/social-content` | Social media content |

---

## Kubeflow Pipeline Patterns (Reference Only)

Patterns from [kubeflow/pipelines](https://github.com/kubeflow/pipelines) applied to this project's scheduler:

1. **DAG-based job ordering** — Scheduler jobs (daily nudge → streak check → re-engagement) are ordered as a dependency graph, not independent crons
2. **Component reuse** — AI service methods are pure functions (no state) so they can be composed into pipeline steps
3. **Retry with backoff** — All external API calls (Anthropic, DB) use exponential backoff: 2s, 4s, 8s, 16s
4. **Idempotent steps** — Each scheduler job checks if work was already done before executing (e.g. `getDailyNudge` caches in Notification table)

---

## Project Structure

```
hello-world/
├── ai-finance-tracker/    # AI Finance Tracker app (complete)
├── habit-coach/           # Habit & Accountability Coach (in development)
├── APP_IDEAS.md           # App idea backlog
└── CLAUDE.md              # This file
```
