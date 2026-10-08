---
title: "Claude Code hides your context window. /statusline is the fix."
description: "If you've heard of Ralph loops you already know context rot. Claude Code hides the gauge by default — /statusline is the 30-second fix."
date: 2026-05-19
authors: [ryan]
tags: [claude-code, productivity, agents]
---

# Claude Code hides your context window. /statusline is the fix.

If you know Ralph loops, you know the punchline: **context rot silently kills productivity**. The quality of the model does not matter. After the working window fills past ~70%, output quality drops off a cliff. When you notice the regression, you have lost half the session.

Few people mention the next fact: **Claude Code does not show context usage by default.**

In the middle of a hot loop, your window can be 90% full, and the terminal shows no sign. Your next response is mush. You blame the model, you run `/clear`, and you lose the thread. All the context data that you needed was on stdin, and no script rendered the data.

`/statusline` renders that data.

<!-- truncate -->

## What `/statusline` does

`/statusline` connects a shell command to the bottom of the Claude Code TUI. At each refresh, Claude pipes a JSON blob to your script. Your script prints one line. That line becomes the status bar.

The JSON holds many fields. These fields matter:

```jsonc
{
  "model": { "display_name": "Claude Opus 4.7" },
  "workspace": {
    "current_dir": "/home/me/repo",
    "git_worktree": "feat/foo"
  },
  "context_window": {
    "used_percentage": 67,        // pre-calculated for you
    "remaining_percentage": 33,
    "context_window_size": 200000
  },
  "rate_limits": {
    "five_hour": { "used_percentage": 23, "resets_at": 1736900000 },
    "seven_day": { "used_percentage": 41, "resets_at": 1737340000 }
  }
}
```

Claude Code hides `context_window.used_percentage` from you. You have driven without this gauge.

## Three sizes: pick the smallest one that does the job

### Tiny: one line, just the gauge

Paste this block into `~/.claude/settings.json`. You need no script file, no PATH change, and no chmod:

```json
{
  "statusLine": {
    "type": "command",
    "command": "printf 'ctx %s%%' $(jq -r '.context_window.used_percentage // 0')"
  }
}
```

Reload Claude Code. The TUI now shows `ctx 67%` at the bottom. The change takes ten seconds.

To add the 5-hour gauge, use the same shape:

```json
"command": "jq -r '\"ctx \\(.context_window.used_percentage // 0)% | 5h \\(.rate_limits.five_hour.used_percentage // 0)%\"'"
```

(The `\\(` is the JSON escape for the backslash. jq receives `\(...)`.)

### Lazy: describe it, let Claude write it

`/statusline` is a slash command, and the command **accepts a natural-language prompt**:

```
/statusline show ctx in red above 70%, plus 5h rate-limit and current worktree
```

Claude Code starts a `statusline-setup` sub-agent. The sub-agent writes the script, puts the script on your PATH, and edits `settings.json`. You describe the bar, and the sub-agent writes the bash. You do not read the jq manual.

Share this size with teammates who will not read the whole post.

### Full: the colour-coded script

When the one-liner is too small, save the script below at `~/.claude/bin/statusline.sh`:

```bash
#!/usr/bin/env bash
JSON=$(cat)

MODEL=$(jq -r '.model.display_name'                              <<<"$JSON")
DIR=$(jq -r   '.workspace.current_dir | sub("^"+env.HOME; "~")'  <<<"$JSON")
WT=$(jq -r    '.workspace.git_worktree // ""'                    <<<"$JSON")
CTX=$(jq -r   '.context_window.used_percentage // 0'             <<<"$JSON")
RL5=$(jq -r   '.rate_limits.five_hour.used_percentage // empty'  <<<"$JSON")

# Green < 50, yellow < 75, red beyond.
C=$'\e[32m'; (( CTX > 50 )) && C=$'\e[33m'; (( CTX > 75 )) && C=$'\e[31m'
R=$'\e[0m'

printf "%s | %s%s | ctx %s%d%%%s" \
  "$MODEL" "$DIR" "${WT:+ @${WT}}" "$C" "$CTX" "$R"
[ -n "$RL5" ] && printf " | 5h %s%%" "$RL5"
```

Run `chmod +x` on the script. Then point `/statusline` at the script, or set the `command` key in `settings.json`. The bar now shows this line in real time:

```
Claude Opus 4.7 | ~/repo @feat/foo | ctx 67% | 5h 23%
```

The `ctx` number matters most. When the number turns red, run `/compact` or hand off the work. Do this **before** the next response degrades, not after.

## Beyond `ctx`: fields worth a slot

The statusline JSON holds more than the context gauge. Pick the fields that match the mistakes you repeat. Then tell `/statusline` to add those fields.

| Field | The mistake it prevents |
|-------|------------------------|
| `model.display_name` | You `/model` mid-session and forget you swapped down to Haiku |
| `workspace.git_worktree` | You edit on the wrong branch because every worktree looks the same |
| `output_style.name` | You left "Explanatory" on after one experiment, and every response carries extra text |
| `rate_limits.seven_day.used_percentage` | You start a Friday-night marathon at 88% weekly burn |
| `context_window.current_usage.cache_read_input_tokens` | The cache hit rate cratered after `/clear`, and you pay full price for context you already had |
| `workspace.added_dirs` | `/add-dir` left scope attached you forgot about |
| `version` | You're on an old Claude Code; the field you want shipped two releases ago |

Rule of thumb: each fact that you once guessed wrong deserves a slot. Examples: *which model is this? which worktree? am I still in Learning mode?* The cost is one more `jq` line. The saving is one session that you do not burn on the wrong guess.

## Why this punches above its weight

**Loss avoidance compounds.** Each loop that you stop before context rot saves one `/clear` and re-prime cycle. Over a week, the savings add up to hours, not minutes.

**Rate-limit visibility removes surprise.** "5h 23%" means: start another loop. "5h 91%" means: do not start work that you cannot finish. You made these decisions blind before. Now you make them from a number.

The whole setup is one shell script. I spent more time on the colors than on the script.

Do you run Ralph loops or other multi-session agent work without a statusline? Then you drive with the speedometer covered. Uncover the speedometer.
