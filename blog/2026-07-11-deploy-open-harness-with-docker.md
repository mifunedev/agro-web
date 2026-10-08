---
title: "Deploy AGRO with Docker"
description: "Start two isolated AGRO sandboxes from the public image with plain Docker, each with its own home volume."
date: 2026-07-11
authors: [ryan]
tags: [open-harness, docker, deployment, self-hosted]
slug: deploy-open-harness-with-docker
---

:::note

Updated on 2026-10-08. Open Harness is now AGRO. This post uses the current names and commands.

:::

AGRO publishes a ready-to-run sandbox image at `ghcr.io/mifunedev/agro`. You can start the image directly with Docker. This path needs no checkout, no local build, and no CLI. Each sandbox keeps its own workspace and its own logins in one home volume.

The default path is the `agro` CLI. `agro sandbox install docker` runs the same image, writes a registry entry, and owns the lifecycle. Use the plain `docker run` path below when you want Docker and nothing else on the host. See [Creating a sandbox](/docs/agro/deployment-prebuilt-image).

<!-- truncate -->

## Start sandbox A

Run these commands on the host. The commands create a private Docker network and pull the newest release image:

```bash
docker network create agro
docker pull ghcr.io/mifunedev/agro:latest
```

Replace the Git identity placeholders, then start sandbox A:

```bash
docker run -itd \
  --name agro-a \
  --network agro \
  --restart unless-stopped \
  --cgroupns private \
  --cap-add SYS_ADMIN \
  --security-opt apparmor=unconfined \
  --tmpfs /run --tmpfs /run/lock --tmpfs /sys/fs \
  -e GIT_USER_NAME="<your-name>" \
  -e GIT_USER_EMAIL="<you@example.com>" \
  -v agro-a_workspace:/home/sandbox \
  ghcr.io/mifunedev/agro:latest
```

The image-only mode has no flag, because the entrypoint detects the mode. On the first boot, the entrypoint finds no checkout at `/home/sandbox/harness`. The entrypoint then copies `/opt/agro-seed` into the home mount and writes the marker `/home/sandbox/harness/.agro/.image-seeded`. After the first boot, the mount holds the editable copy. The copy starts without Git history.

Check the container and the seed, then open a shell:

```bash
docker ps --filter 'name=^/agro-a$' --format 'table {{.Names}}\t{{.Status}}'
docker exec agro-a test -f /home/sandbox/harness/.agro/.image-seeded \
  && echo "sandbox A seed ready"
docker exec -it -u sandbox agro-a zsh
```

For an editor, run the VS Code command **Dev Containers: Attach to Running Container**. Select `agro-a`, and open `/home/sandbox/harness`. Do not use **Reopen in Container** for this path.

## Install the tools that you use

The published image contains no agent CLI, and nothing installs at boot. A new sandbox has Node and `gh`. Each other tool enters through one command, from inside the container. Each install lands in `~/.local` inside the home mount, so the install survives a container recreate.

Run these commands inside sandbox A:

```bash
agro tool install herdr && herdr   # persistent terminal workspace
agro harness install claude-code
agro harness install pi
agro harness install hermes        # optional
```

## Sign in once per sandbox

Run these commands inside sandbox A, in this order:

```bash
gh auth login       # GitHub.com → SSH → generate/upload key → paste token
gh auth setup-git
gh auth status
claude auth login
claude auth status
pi
```

For `gh auth login`, select **GitHub.com**, then **SSH**, then let `gh` generate and upload an SSH key. Then select **Paste an authentication token**.

Inside Pi, do these steps:

1. Enter `/login`.
2. Select a provider and the device login.
3. Open the URL that Pi shows in a browser.
4. Enter the code in the browser.
5. Enter `/model` in Pi.
6. Select the provider and the model for Pi.
7. Press `Ctrl-D` to exit Pi.

The GitHub configuration, the SSH keys, the Claude login, and the Pi login all live under `/home/sandbox`. The single home volume keeps each login across a container recreate.

## Add sandbox B

Run the same image with the container name `agro-b` and a separate home volume. Keep the same network:

```bash
docker run -itd \
  --name agro-b \
  --network agro \
  --restart unless-stopped \
  --cgroupns private \
  --cap-add SYS_ADMIN \
  --security-opt apparmor=unconfined \
  --tmpfs /run --tmpfs /run/lock --tmpfs /sys/fs \
  -e GIT_USER_NAME="<your-name>" \
  -e GIT_USER_EMAIL="<you@example.com>" \
  -v agro-b_workspace:/home/sandbox \
  ghcr.io/mifunedev/agro:latest
```

Sandbox B has its own home volume. B does not see the files of A, and B does not get the logins of A. Install the tools and sign in again inside B. One home volume for both containers shares the logins, but that volume also shares the workspace.

Run these commands on the host to prove the isolation:

```bash
docker exec agro-a touch /home/sandbox/harness/.sandbox-a-only
docker exec agro-b test ! -e /home/sandbox/harness/.sandbox-a-only \
  && echo "workspaces are isolated"
docker exec agro-a rm /home/sandbox/harness/.sandbox-a-only
```

## Add other tools from the CLI

Both recipes above run the stock published image, and the image contains no agent CLI. Each other tool enters the same way: another agent CLI, a headless browser, or a tunnel client. You install each tool from inside the running container, with no rebuild and no recreate.

Run these commands inside the sandbox:

```bash
agro harness list                 # known agent CLIs, and their install state
agro harness install opencode     # into the running sandbox
agro tool list                    # non-agent tools
agro tool install agent-browser   # about 1 GB, so it asks first
```

`agro harness install <id>` and `agro tool install <id>` are the only way into the sandbox. Each command installs into the running sandbox, and you can use the new tool immediately. `agro` records no choice, and no flag splits the work.

The home mount keeps each install. The install lands in `~/.local`, so the install survives a container recreate. After a recreate onto a new home volume, run the install again. The same command also works on the host against a running sandbox.

`agro` detects the sandbox from the image marker `/etc/agro/sandbox`. A raw `docker run` therefore needs no `SANDBOX_NAME`. `agro` uses `/.dockerenv` and `SANDBOX_NAME` only as a fallback for an older image. See [Lifecycle commands](/docs/agro/lifecycle-commands).

## Use Compose through `agro`

In July 2026, this post gave a hand-written Compose file. That file ran `sleep infinity` with `init: true`. The sandbox now boots systemd as PID 1, so that file does not start the sandbox. Do not use that file.

To manage the sandbox with Compose, use the `agro` CLI. `agro` bundles the Compose files and applies the overlays and the healthcheck. Use these host commands instead of the `docker run` recipe, not next to it:

```bash
agro sandbox install docker --name agro-a
agro compose config   # print the resolved Compose file
```

The sandbox stores its home in the volume `agro-a_workspace`. The `docker run` recipe above uses the same `<name>_workspace` volume name. See [Lifecycle commands](/docs/agro/lifecycle-commands).

Hermes keeps its home in `HERMES_HOME`. AGRO selects `/home/sandbox/harness/.hermes` as `HERMES_HOME`. In July 2026, Hermes needed its own volume. Hermes replaces `auth.json` atomically. An atomic replace across two filesystems fails with `EXDEV`, so `auth.json` and its temporary file must share one mount. The single mount at `/home/sandbox` holds both files, so Hermes needs no extra volume. See [Hermes](/docs/agro/harnesses/hermes).

The `INSTALL_HERMES: "true"` setting is also gone. On the published image, that variable never installed Hermes. The variable was a build argument. The variable selected a Hermes binary in the image at build time, and a runtime value added nothing. Today, the image contains no harness.

Install each harness with `agro harness install <id>` from inside the running sandbox, as the install section above does. Run `agro harness list` for each harness id in the catalog.

## Connect another container

To let both sandboxes reach another container, attach that container to their network with an optional DNS alias. Run `docker network connect` on the host:

```bash
docker network connect --alias app agro my-app
# A and B now reach http://app:<container-port>
```

The alias is private to that Docker network, and the alias publishes no host port. These containers publish no ports and do not mount the host Docker socket. See [Creating a sandbox](/docs/agro/deployment-prebuilt-image) for the image, the pin options, and the boot model.

## Self-hosted or managed

Self-hosted Docker, as this post shows, gives you full control of the host. For a managed option, use the [Mifune Console](/docs). The Console gives you managed AGRO nodes at [console.mifune.dev](https://console.mifune.dev).
