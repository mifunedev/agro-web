---
sidebar_position: 13
title: "Glossary"
---

# Glossary

A canonical, **descriptive** glossary of Open Harness's core vocabulary — each
term defined as this repo actually uses it today, with a pointer to a canonical
source file or skill. This is a plain reference page, not a standards document:
there are no normative requirements here, only working definitions.

Terms are listed alphabetically below.

## Layers

These names describe separate layers, not interchangeable jobs:

- **Model** — The LLM selected by a provider; it proposes text and tool calls, while the surrounding agent, harness, and policy decide where those requests run and what is allowed. See the **model** glossary entry.
- **Agent / CLI** — The process that wraps a model with tools, instructions, and session state, such as Claude Code, Codex, or Pi. It is the runtime: the active session owns the work. See the **agent** glossary entry.
- **Harness** — The repo, Docker sandbox, and `.oh/` control plane that give agents a reproducible workspace and lifecycle. See the **harness** glossary entry.
- **Loop** — A repeated workflow that the harness drives until a terminal state, such as the `/delegate` implementation cycle ending after every story passes. See the **loop** and **terminal state** glossary entries.
- **Policy** — The provider-portable rules, skills, and hooks that constrain agent behavior and tool use. See the **policy** and **tool** glossary entries.
- **Trace** — Recorded session evidence consumed later by analysis, not the live execution layer itself. See the **trace** glossary entry.

## Terms

- **agent / coding agent** — The running model-plus-tools process that reads the
  workspace and does the task: Claude Code, Codex, Pi, or another coding harness
  running inside the sandbox. The agent is the **runtime and the owner of the
  work**; a role never implies a separate session or process. The repository
  authors no agent definition files — a durable role is a **skill** the active
  session adopts. Source: [`AGENTS.md`](https://github.com/mifunedev/agro/blob/main/AGENTS.md).

- **artifact** — Any inspectable file a workflow stage produces and a later stage
  or a human then consumes. The canonical example is the `.oh/tasks/<slug>/` task
  folder and its two-file contract (`prd.md` and `prd.json`), which `/prd`
  writes and `/delegate` reads and updates.
  Source: [`.agro/tasks/AGENTS.md`](https://github.com/mifunedev/agro/blob/development/.agro/tasks/AGENTS.md).

- **capability** — What the harness can actually do end-to-end, measured by the
  capability benchmark rather than by how much machinery it accumulates. The
  `.oh/evals/capability/` suite grades concrete deliverables (a shipped PR, a
  passing eval), so a rising score is evidence the loop got
  better. Source: [`.oh/evals/capability/`](https://github.com/mifunedev/agro/tree/main/.oh/evals/capability/).

- **checkpoint** — An intermediate, observable stage output that is explicitly
  *not* the terminal state. For example, the draft PR opens with the plan
  before implementation, and the advisor marks it ready only after the gates
  pass.
  Source: [`.agro/skills/git/SKILL.md`](https://github.com/mifunedev/agro/blob/development/.agro/skills/git/SKILL.md#draft-pr-for-a-task) § Draft PR for a task.

- **evaluator / eval** — A deterministic, exit-code-scored probe that checks
  harness state against a recorded lesson; the probe corpus and the `/eval`
  skill that runs it form the harness's fitness function, reporting PASS /
  REGRESSION / SKIPPED per probe. Source: [`.oh/evals/`](https://github.com/mifunedev/agro/tree/main/.oh/evals/).

- **harness** — The whole portable setup: one git repo that boots one Docker
  sandbox, wraps your project inside it, and versions the agent's identity,
  skills, crons, and memory. "Open Harness" names both this project and any
  single repo-per-sandbox instance of it.
  Source: [`intro.md`](intro.md).

- **knowledge** — Durable repository knowledge kept under `.oh/knowledge/`: a
  derived cache of understanding that the repository itself always outranks.
  `source/` and `patterns/` entity pages are tracked and queryable; `local/` is
  ignored per-machine scratch that nothing reads.
  Source: [`.oh/knowledge/`](https://github.com/mifunedev/agro/tree/main/.oh/knowledge/).

- **loop** — A repeated implement → commit → check cycle driven until the task
  graph is satisfied. `/delegate` owns the implementation cycle; the advisor
  accepts each story and records it in `prd.json`. Completion is structured
  state — every entry in `userStories` carrying `"passes": true` — not a marker
  in prose.
  Source: [`.agro/skills/delegate/SKILL.md`](https://github.com/mifunedev/agro/blob/development/.agro/skills/delegate/SKILL.md).

- **model** — The LLM an agent or CLI uses to produce reasoning, text, and
  tool-call requests. The model is only one part of an agent session; the
  harness, tools, and policy decide where it runs and which actions are allowed.
  Source: [`docs/harnesses/overview.md`](harnesses/overview.md).

- **orchestrator** — The root-level role that manages the sandbox lifecycle and
  git but does not write application code; its job is provisioning, scaffolding
  the workspace, and running lifecycle skills. Its instructions live in the root
  `AGENTS.md` (aliased for provider compatibility as `CLAUDE.md`).
  Source: [`AGENTS.md`](https://github.com/mifunedev/agro/blob/main/AGENTS.md).

- **policy** — The provider-portable conventions and guardrails the harness
  follows — for example the git workflow (branch names, commit format, PR
  targets, changelog discipline) codified in the `/git` skill, alongside the
  hook-enforced security rules.
  Source: [`.oh/skills/git/SKILL.md`](https://github.com/mifunedev/agro/blob/main/.oh/skills/git/SKILL.md).

- **primitive** — A reusable unit from the shared pack — skills and hooks —
  vendored directly into the `.oh/` control plane and exposed to each provider
  (`.claude/`, `.codex/`, `.pi/`) via symlinks into `.oh/`.
  Source: [`README.md`](https://github.com/mifunedev/agro/blob/main/docs/README.md) (the primitive pack under `.oh/skills/`,
  `.oh/hooks/`).

- **rfc / adr** — A durable architecture decision, recorded as a GitHub issue
  titled `RFC:` or `ADR:` and indexed on the RFC/ADR page. Three states —
  `Draft`, `Accepted`, `Superseded` — and no further taxonomy. This is the only
  decision store; `/architect` points durable decisions here rather than
  creating another one. Source: [`docs/rfcs/README.md`](https://github.com/mifunedev/agro/blob/main/docs/rfcs/README.md).

- **rule** — Ambient repository policy an agent carries without invoking
  anything: an `AGENTS.md` (aliased `CLAUDE.md` for provider compatibility) that
  applies to every task under its directory, or a path-scoped reference skill.
  Distinct from a skill, which is invoked for a job.
  Source: [`AGENTS.md`](https://github.com/mifunedev/agro/blob/main/AGENTS.md).

- **runtime** — The always-on machinery that wakes the agent on a schedule: a
  tiny croner that reads scheduled-agent definitions from `crons/` and fires
  them inside the sandbox.
  Source: [`.oh/scripts/cron-runtime.ts`](https://github.com/mifunedev/agro/blob/main/.oh/scripts/cron-runtime.ts).

- **sandbox** — The isolated Docker container the agent runs inside, built from
  `.devcontainer/`, so the agent works against your code without touching the
  host machine. Source: [`.devcontainer/`](https://github.com/mifunedev/agro/tree/main/.devcontainer/).

- **session** — A terminal-backend run of an agent: a tmux session, a Herdr pane, or a
  plain shell. It is a *backend*, not an identity. Distinguish it from the
  **advisor** — the role that owns one task from the isolated worktree through the
  final PR gates. The advisor keeps the decisions, validation, evidence, and PR
  finalization, whatever backend it runs in. Bounded workers perform the tracked
  edits, and the advisor launches no session of its own.
  Source: [`.agro/skills/delegate/SKILL.md`](https://github.com/mifunedev/agro/blob/development/.agro/skills/delegate/SKILL.md) and
  [`sandbox-processes.md`](https://github.com/mifunedev/agro/blob/main/.oh/skills/t3/references/sandbox-processes.md).

- **skill** — A packaged, invocable workflow (a `SKILL.md` plus optional
  references and scripts) that an agent runs via the Skill tool or a `/name`
  slash command; the shared set lives under `.oh/skills/`. **Skills are the
  canonical primitive for a reusable role, procedure, checklist, constraint set,
  or body of domain judgment** — `/architect`, `/prd`, `/audit`, and
  `/delegate` are roles encoded this way, loaded into the active session rather
  than spawned as separate identities. Source: [`.oh/skills/`](https://github.com/mifunedev/agro/tree/main/.oh/skills/).

- **terminal state** — The end state that closes a workflow cycle. `/delegate`
  completes implementation only after every story passes. The advisor then marks
  the PR ready for review. A human merges, and the advisor cleans up only after
  `gh pr view` reports `MERGED`. Each plan's `## Lessons` section records the
  lessons.
  Source: [`.agro/skills/git/SKILL.md`](https://github.com/mifunedev/agro/blob/development/.agro/skills/git/SKILL.md#ready-for-review) § Ready for review and § After the merge.

- **tool** — A discrete action an agent can invoke — read a file, run a command,
  call an MCP server. Hooks under `.oh/hooks/` intercept tool calls to enforce
  policy before they run. Source: [`.oh/hooks/`](https://github.com/mifunedev/agro/tree/main/.oh/hooks/).

- **trace** — The recorded log of a past agent session (prompts, tool calls,
  results) that later analysis mines. `/prompt-miner` runs `mine-traces.mjs`
  over Claude and Pi session traces to score prompts by outcome.
  Source: [`mine-traces.mjs`](https://github.com/mifunedev/agro/blob/main/.oh/skills/prompt-miner/scripts/mine-traces.mjs).

- **worker / subagent** — An optional bounded, isolated execution context the
  active agent spawns for one self-contained job — parallelism, context
  isolation, verbose disposable output, or a deliberate tool restriction. It is
  an execution primitive, not a project role: workers are provider built-ins
  with no repository definition file, and `/delegate` owns when one is
  justified. Source:
  [`.oh/skills/delegate/SKILL.md`](https://github.com/mifunedev/agro/blob/main/.oh/skills/delegate/SKILL.md).

- **worktree** — A separate git working directory under `.worktrees/` that
  isolates a branch so parallel work doesn't collide; the `/worktrees` skill
  manages their lifecycle, and `/delegate` builds each task in one.
  Source: [`.oh/skills/worktrees/SKILL.md`](https://github.com/mifunedev/agro/blob/main/.oh/skills/worktrees/SKILL.md).
