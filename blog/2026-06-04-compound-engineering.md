---
title: "How AGRO embodies compound engineering"
description: "A name finally landed on a habit of the harness: each fix makes the next fix easier. Here is where that habit lives in the code, and how it can go wrong."
date: 2026-06-04
authors: [ryan]
tags: [agents, compound-engineering, ai-engineering]
slug: compound-engineering
---

:::note

Updated on 2026-10-08. Open Harness is now AGRO. This post uses the current names and commands.

:::

A few weeks ago, I read [Every's compound-engineering guide](https://every.to/guides/compound-engineering). The guide gave a name to a practice that I had built without a name. That discovery deflated me a little. The guide states the core idea: **"each unit of engineering work should make subsequent units easier—not harder."** Most codebases drift the other way. Each feature adds complexity. The more you ship into a codebase, the worse the codebase gets.

I read the line and thought: that idea is the entire point of the harness. The idea is not a feature that I should add. The idea is the constraint that already shapes each file in the harness.

This post is about a concrete, working instance of compound engineering. The post skips the abstract philosophy. The post shows the files that make the idea true. The post also shows the documented failure modes, because I want to be useful, not breathless.

<!-- truncate -->

## A note on the name

Credit goes to Kieran Klaassen at Every for the term. The first essay appeared in August 2025 with the title "My AI Had Already Fixed the Code Before I Saw It." That essay spelled the term **"compounding engineering"**. The essay defined the term as "building self-improving development systems where each iteration makes the next one faster, safer, and better." Every's guide later made "compound engineering" the standard spelling. One line stayed with me: *"AI engineering makes you faster today. Compounding engineering makes you faster tomorrow, and each day after."*

The guide also puts a number on the discipline. About **half** of engineering time goes to features. The other **half** goes to improvements of the development process itself: review agents, documented patterns, and test generators. People skip that fifty-fifty split. The structure of the harness centers on that split.

## Where compound engineering lives in AGRO

AGRO gives a coding agent an isolated Docker sandbox, and an orchestrator manages that sandbox. The mechanisms below make "each unit of work improves the harness" literally true. Each mechanism has a file pointer, so you can check my work.

**Dated memory.** A session that finishes work worth remembering writes a dated entry to [`.agro/memories/MEMORY.md`](https://github.com/mifunedev/agro/blob/v0.18.1/.agro/memories/MEMORY.md). Each entry states an action and the evidence that proves the action. A lesson graduates through the `## Lessons` section of the task plan at `.agro/tasks/<slug>/prd.md`. The lesson gets exactly one outcome: a fix in the PR, an issue, or a drop with a reason. A lesson that a command can prove becomes a test. The [memory contract](https://github.com/mifunedev/agro/blob/v0.18.1/.agro/memories/AGENTS.md) states these rules. These rules turn Klaassen's advice into a checklist for the agent: teach the harness instead of doing the work yourself. The session that produced *this* post left a lesson in memory about this post. The loop closed on itself.

**Safety nets, not review processes.** The [`/delegate`](https://github.com/mifunedev/agro/blob/v0.18.1/.agro/skills/delegate/SKILL.md) skill splits a task between one advisor and bounded workers. A worker never accepts its own result. The advisor runs each acceptance check before the advisor accepts the work. The lifecycle has the same shape. `agro destroy` asks before the command deletes the home volume. The root [`AGENTS.md`](https://github.com/mifunedev/agro/blob/v0.18.1/AGENTS.md) permits `agro destroy` only for teardown that the operator authorizes. You cannot forget these gates, because the workflow runs into each gate.

**Each regression becomes a permanent guardrail.** One story shows the rule. A cleanup pass once judged six skills to be indefensible and deleted the six skills: `ralph`, `prd`, `harness-audit`, `skill-lint`, `delegate`, and `strategic-proposal`. The orchestrator used each of those skills. The fix was not "be more careful." The fix was a tracked list of load-bearing paths. A critic may not propose the deletion of a listed path without an explicit override. The list grows over time. The harness gets *more* stable over time, not less.

**Parallel and long-running orchestration.** The guide says "use long-running orchestration." In AGRO, that advice maps to the `/delegate` skill. The skill runs the stories of a plan as bounded workers in dependency waves, with at most 5 workers per wave. Each worker gets an isolated worktree, so two workers never share one checkout.

Four mechanisms have one shape: each mechanism makes the harness better at its next task. None of the four is a feature for the end user. The four mechanisms are the other half of the fifty-fifty split.

## The part the hype skips

Compound engineering has failure modes. The failure modes have good documentation, and a denial would be dishonest.

The first failure mode is **a codified wrong lesson**. A self-improving harness that learns the wrong lesson improves in the wrong direction, fast. A bad rule in memory does not stay idle. Each future run inherits the bad rule. The harness puts two gates *between* observation and codification. A lesson must survive the graduation step before the lesson becomes a default. A worker result must survive the advisor's verification before the result ships.

The second failure mode is **context bloat**. Instruction sets grow until the instructions become noise. Each run drags more unpruned guidance. The lean-context principle from the original essay addresses exactly this worry. The harness answers with its stated principle in the root `AGENTS.md`: **"Prefer ambitious outcomes and simple systems. Do not preserve complexity because it already exists."**

The honest test came while I wrote this post. The natural move was a new `compound-engineering` rule file in the harness. That file would codify the philosophy as a default. I did not add the file. The concept only *names* mechanisms that the harness already enforces. A rule file would duplicate those mechanisms and add load-bearing text that earns nothing. So the concept lives in an in-repo wiki note and in this post, not in another always-loaded instruction. My choice *not* to add the file is the principle at work. A harness that compounds must be able to refuse its own growth.

## Try it

Do you want to see compound engineering as running code instead of a manifesto? The harness is open source. Start at the [installation guide](/docs/agro/installation), or go straight to the [quickstart](/docs/agro/quickstart). Read the root `AGENTS.md` and the files in `.agro/memories/`. After a session, look at what the agent leaves behind. That residue is the whole idea.

The code was never the point. The point is the harness that writes the next code.
