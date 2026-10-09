---
sidebar_position: 13
title: "Glossary"
---

# Glossary

This page defines the terms that the AGRO pages use. Each entry links to the page that owns the term.

- **`agro` CLI** — The one command for the sandbox lifecycle. `agro` creates, starts, stops, and removes each sandbox. See [Lifecycle commands](agro/lifecycle-commands.md).

- **coding harness** — The agent interface that runs in the sandbox, for example Claude Code, Codex, or Pi. You choose the coding harness. Run `agro harness install <id>` to install one. See [Harnesses overview](agro/harnesses/overview.md).

- **control plane** — The `.agro/` directory. The control plane holds the `agro` CLI package, the lifecycle scripts, the skills, the hooks, and the task plans. See [`.agro/` directory layout](agro/agro-directory-layout.md).

- **cron** — A Markdown file in `crons/` that declares a schedule. The cron runtime sends the body of the file to the agent as a prompt. See [Introduction](agro/intro.md).

- **cron runtime** — The service that reads `crons/*.md` and fires each cron on its schedule. In the sandbox, systemd runs the cron runtime as `agro-cron.service`. See [Introduction](agro/intro.md).

- **Herdr** — The interactive terminal workspace for agents in the sandbox. Run `agro tool install herdr`, then run `herdr`. See [Herdr](agro/integrations/herdr.md).

- **home volume** — The one mount at `/home/sandbox`. The home volume holds the agent logins, the installs, and the workspace at `/home/sandbox/harness`. `agro stop` keeps the home volume. `agro destroy` deletes the home volume. See [Installation](agro/installation.md).

- **hook** — A script in `.agro/hooks/` that runs before each tool call. A hook can deny a tool call, for example an environment dump. See [Security considerations](agro/security-considerations.md).

- **orchestrator** — The agent in the first Herdr pane at `/home/sandbox/harness`. The orchestrator manages git, the sandbox lifecycle, and the shared agent setup. See [Introduction](agro/intro.md).

- **registry entry** — The host directory `${AGRO_HOME:-~/.agro}/sandboxes/<name>/`. The registry entry holds the settings, the secrets, and the generated Compose files of one sandbox. See [`.agro/` directory layout](agro/agro-directory-layout.md).

- **sandbox** — The Docker container where the agent works. The sandbox keeps the agent, its tools, and its logins off your host. See [Introduction](agro/intro.md).

- **skill** — A shared procedure in `.agro/skills/`. Each coding harness reads the same skills through provider links, for example `.claude/skills` and `.agents/skills`. See [`.agro/` directory layout](agro/agro-directory-layout.md).

- **task plan** — The files of one task in `.agro/tasks/`. `prd.md` holds the plan, and `prd.json` holds the story state. See [`.agro/` directory layout](agro/agro-directory-layout.md).

- **worktree** — An isolated branch checkout in `.worktrees/`. See [`.agro/` directory layout](agro/agro-directory-layout.md).
