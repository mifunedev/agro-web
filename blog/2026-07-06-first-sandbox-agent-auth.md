---
title: "Your first sandbox: signing in gh, Claude, Pi, and Hermes"
description: "The image contains no agent CLI. You install Claude Code, Codex, Pi, or Hermes yourself. This post walks the first run of a sandbox and shows what a second sandbox on the same host inherits."
date: 2026-07-06
authors: [ryan]
tags: [docker, sandbox, auth, multi-agent]
slug: first-sandbox-agent-auth
---

:::note

Updated on 2026-10-08. Open Harness is now AGRO. This post uses the current names and commands.

:::

AGRO gives each repository one sandbox. The sandbox is an isolated Docker container, and the image contains no agent CLI. The image pins Node and `gh`. Each agent CLI enters through one command, `agro harness install <id>`. The catalog includes Claude Code, Codex, Pi, OpenCode, Hermes, and Grok Build.

A useful sandbox needs three steps. First, start the container. Next, install the tools that you use. Then, sign in each agent. This post walks the full first run: start, attach, install, and sign in to `gh`, Claude, Pi, and Hermes. Then the post starts a **second** sandbox on the same host and shows what the second sandbox inherits.

<!-- truncate -->

## 1. Start your first sandbox

This post uses the image-only path. You pull the published image, with no checkout and no local build. The usual path is `agro sandbox install docker`, which runs the same image for you. See the [Quickstart](/docs/agro/quickstart).

One mount at `/home/sandbox` holds all sandbox state. The mount holds the `.agro/` control plane, the repository, each agent login, the `gh` token, and your SSH key.

Run the `docker run` command below on the host:

```bash
docker run -d --name agro-a --restart unless-stopped \
  --cgroupns private \
  --cap-add SYS_ADMIN \
  --security-opt apparmor=unconfined \
  --tmpfs /run --tmpfs /run/lock --tmpfs /sys/fs \
  -e GIT_USER_NAME="gituser" \
  -e GIT_USER_EMAIL="gituser@example.com" \
  -v agro-a_workspace:/home/sandbox \
  ghcr.io/mifunedev/agro:latest
```

The volume `agro-a_workspace` holds your work *and* your logins. On a new host, the first run pulls the image once. The image is public, so the pull needs no `docker login`.

Confirm that the container runs:

```bash
docker ps --filter name=agro-a --format 'table {{.Names}}\t{{.Status}}'
```

> **Raw Docker settings.** Under the `agro` CLI, settings live in `agro.json` and secrets live in `.env`. On the raw `docker run` path, pass each value as an `-e` variable. A harness never needed a `--build-arg`. `agro harness install <id>` adds a harness to a running container. See step 3.

## 2. Attach with VS Code

VS Code gives the best attach experience. Use the Dev Containers extension, run **Attach to Running Container**, and select `agro-a`. VS Code opens a full editor. VS Code also forwards each app port to your laptop while the window stays attached. See [Connecting → Option B](/docs/agro/connecting#option-b--vs-code-attach-to-running-container-local-host).

Each login below also works without a browser in the sandbox. The logins use device codes, token paste, and OAuth URLs. On a remote host, a plain shell is enough:

```bash
docker exec -it -u sandbox agro-a zsh
```

Both paths open a shell as the `sandbox` user.

## 3. Sign in each agent

### Install the tools first

The image contains no agent CLI. Nothing installs at boot. A new sandbox has Node and `gh`. Each agent CLI enters through `agro harness install <id>`. Each tool enters through `agro tool install <id>`. Each install lands in `~/.local` inside the home mount, so the install survives a container recreate.

Run these commands inside the sandbox:

```bash
agro tool install herdr && herdr   # persistent terminal workspace: run your agents in its panes
agro harness install claude-code
agro harness install pi
agro harness install hermes        # optional
```

### GitHub CLI (`gh`)

Sign in to `gh` first. The agent uses `gh` to push branches and to open pull requests.

```bash
gh auth login          # GitHub.com → SSH → generate/upload a key → paste a token
gh auth setup-git
gh auth status
```

Answer the `gh auth login` prompts in this order:

1. Select **GitHub.com**.
2. Select **SSH** as the git protocol, and let `gh` generate and upload a key.
3. Select **Paste an authentication token** as the login method.
4. Create a [personal access token](https://github.com/settings/tokens) with the `repo`, `read:org`, and `admin:public_key` scopes, and paste the token.

`gh` writes the token to `~/.config/gh` and the SSH key to `~/.ssh`. Both directories are in the home mount, so both survive a container recreate. See [GitHub](/docs/agro/integrations/github).

### Claude Code

```bash
claude auth login      # OAuth to your Anthropic account
claude auth status     # confirm the login
```

A bare `claude` without a login starts the same flow. `claude auth login` is the explicit path, and a script can run `claude auth login`. Claude keeps its credentials in `~/.claude/.credentials.json`, inside the home mount.

### Pi

On a remote host, use the Pi **device login**. Start Pi, then run `/login` inside Pi:

```bash
pi
# then, inside Pi:
/login                 # device-code flow: open the URL, then enter the code
```

The device flow shows a URL and a code. Complete the flow in any browser. The flow needs no port forward, so the flow works on a VM. On a *local* machine, Pi can use a subscription OAuth callback on `localhost:1455` instead. VS Code forwards that port for you. Pi keeps its configuration and its login in `~/.pi`, inside the home mount.

Pi gives you two more features. First, Pi can run on **OpenAI Codex** with your ChatGPT subscription. `/codex-status` shows your Codex usage inside Pi. Second, Pi connects to **Slack** through a bridge.

To store the Slack tokens, run these commands inside the sandbox. Each command prompts for the value:

```bash
agro secret set PI_SLACK_APP_TOKEN    # the xapp- token
agro secret set PI_SLACK_BOT_TOKEN    # the xoxb- token
```

Then `agro gateway pi` starts the bridge with the tokens. Run `/msg-bridge` inside the bridge session to grant trust. See [Slack](/docs/agro/integrations/slack).

### Hermes

Hermes is the self-improving agent CLI from Nous Research. Hermes is a harness like each other harness. The published image `ghcr.io/mifunedev/agro:latest` does not contain Hermes or any other agent CLI.

In July 2026, Hermes needed a custom image with a `--build-arg`. Today, Hermes uses the same command as each other harness. The install block above already ran it:

```bash
agro harness install hermes
```

That command installs `hermes` into the running container, and you can use `hermes` immediately. `agro` records no choice, and `agro` never rebuilds or restarts the sandbox. After a recreate onto a new home volume, run the command again.

Then set up Hermes:

```bash
export HERMES_HOME=/home/sandbox/harness/.hermes
hermes setup           # interactive wizard (or: hermes setup --portal for Nous Portal OAuth)
hermes model           # select the LLM provider, OpenAI Codex included
hermes doctor          # health check
```

Hermes can also run on **OpenAI Codex**. Select Codex in `hermes model`. Hermes also has its own **Slack** gateway. `hermes gateway setup` configures the app and the trust. `agro gateway hermes` runs the gateway in the `client-slack-hermes` session. `agro gateway status` shows the Pi gateway and the Hermes gateway together. See [Hermes](/docs/agro/harnesses/hermes).

Hermes writes its login to `/home/sandbox/harness/.hermes/auth.json`. That file is in the repository directory, not in a dotfile directory of your home. Each login above, Hermes included, belongs to one sandbox, because each login is in that sandbox's home mount.

`agro-a` now has a full set of logins. Start any agent (`claude`, `codex`, `pi`, `hermes`) and work.

## 4. Add tools from the CLI with no rebuild

Step 3 signed in the agents. A useful sandbox also needs the tools that the image does not contain. Inside the running container, one command adds each tool. In July 2026, this step needed a `docker build --build-arg` and a new container. Today, `agro` installs in place.

```bash
agro harness list                 # each known harness, and its state
agro harness install opencode     # an agent CLI, into the running sandbox
agro tool list                    # the non-agent tools
agro tool install agent-browser   # about 1 GB, so it asks first
```

`agro harness install <id>` and `agro tool install <id>` are the only way into the sandbox. Each command installs into the running sandbox, and you can use the new tool immediately. `agro.json` holds no install field, and no flag splits the work. Nothing rebuilds and nothing restarts.

The home mount keeps each install. The install lands in `~/.local`, so the install survives a container recreate. After a recreate onto a *new* home volume, run the install again. The same command also works on the **host** against a running sandbox.

`agro harness status` and `agro tool status <name>` report what the sandbox contains. Each report shows a version when the binary has a version flag. Run the status command after an install. Do not rely on the success line alone.

:::note[How `agro` finds the sandbox]

`agro` detects the sandbox from the image marker `/etc/agro/sandbox`. A raw `docker run` therefore needs no `SANDBOX_NAME`. In July 2026, the CLI needed `-e SANDBOX_NAME=<name>`. Today, `agro` uses `/.dockerenv` and `SANDBOX_NAME` only as a fallback for an older image. See [Lifecycle commands](/docs/agro/lifecycle-commands).

:::

## 5. Optional: a second sandbox on the same host

Run the same command again with a new name and a new volume:

```bash
docker run -d --name agro-b --restart unless-stopped \
  --cgroupns private \
  --cap-add SYS_ADMIN \
  --security-opt apparmor=unconfined \
  --tmpfs /run --tmpfs /run/lock --tmpfs /sys/fs \
  -e GIT_USER_NAME="gituser" \
  -e GIT_USER_EMAIL="gituser@example.com" \
  -v agro-b_workspace:/home/sandbox \
  ghcr.io/mifunedev/agro:latest
```

**The start is fast.** `agro-b` needs no pull and no build, because `agro-b` uses the image that `agro-a` already pulled. The pull happens once. Each later sandbox starts from the local image in seconds.

The two workspaces are independent. Run these commands on the host to prove it:

```bash
docker exec agro-a bash -lc 'echo "I am A" > /home/sandbox/harness/WHOAMI'
docker exec agro-b bash -lc 'cat /home/sandbox/harness/WHOAMI 2>&1'   # No such file: B is isolated
```

:::warning[The original result of this section no longer applies]

In July 2026, `agro-b` started **with the logins of `agro-a`**. The `gh`, Claude, Pi, and Codex logins used shared volumes. A separate workspace volume kept the repositories apart.

On the image-only path, one mount at `/home/sandbox` now holds both. The workspace is *inside* the home mount. A second sandbox therefore has one of two setups:

- Its own home: separate workspaces and **separate logins**. You sign in again in `agro-b`.
- Your home: shared logins and a **shared workspace**.

The fast start above still applies.

To get separate checkouts with shared logins, use the checkout path instead. That path binds your checkout at `/home/sandbox/harness`, *over* the home mount. Two sandboxes then point `storage.homePath` at one directory. The sandboxes share each login, and each sandbox keeps its own checkout. See [Installation → Persistent storage](/docs/agro/installation#persistent-storage).

:::

To remove the containers and keep the volumes, run `docker rm` on the host:

```bash
docker rm -f agro-a agro-b
```

Warning: the next command deletes the workspaces *and* the logins. The command has no undo.

```bash
docker volume rm agro-a_workspace agro-b_workspace
```

## Scenario: a whole team on one daily pull

This scenario fits a shared company setup. Each developer runs the same `ghcr.io/mifunedev/agro:<tag>`, so the whole team has the same base. The image pins Node and `gh` down to the layer hash.

The image contains no agent CLI. Each sandbox installs its agent CLIs with `agro harness install <id>`, and the installs stay in that sandbox's home mount. Each morning, each developer pulls the current image and recreates the container:

```bash
docker pull ghcr.io/mifunedev/agro:latest
docker rm -f agro-a
# Then run the step-1 command again. agro-a_workspace (work and logins) survives the recreate.
```

A daily pull is safe, because **the image version changes the tools, not your work**. Your work and your logins live in the home mount, not in the image. A newer image changes the tools and keeps both. For a fixed baseline, pin an `X.Y.Z` release tag, and change the tag on your own schedule. One company image serves each developer, and each developer signs in once per sandbox home.

The full run has three steps: start, attach, and sign in. Do the steps once per sandbox home. After that, a daily image pull keeps your work and your logins.
