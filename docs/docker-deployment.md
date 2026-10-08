---
title: Docker deployment
sidebar_position: 8
---

# Docker deployment

Run the public AGRO image directly with Docker—no checkout, local build, CLI wrapper, or Compose required. This walkthrough creates two containers on one private network, each with its own persistent home.

This is the CLI-free path. The default path is the `agro` CLI: [`agro sandbox install docker`](/docs/agro/deployment-prebuilt-image) creates a registry-backed sandbox from any directory and owns its lifecycle (`agro shell`, `agro stop`, `agro destroy`). Use the recipe below when you want plain `docker run` and nothing else on the host.

Everything a sandbox persists lives in a **single mount at `/home/sandbox`**: the workspace and control plane at `/home/sandbox/harness`, and the provider authentication under `/home/sandbox/.config`, `/home/sandbox/.ssh`, `/home/sandbox/.claude`, and `/home/sandbox/.pi`. One volume per sandbox, and nothing to keep in sync.

## 1. Create the network and pull the image

```bash
docker network create agro
docker pull ghcr.io/mifunedev/agro:latest
```

`latest` follows the newest release. Pull it again when you want to update.

## 2. Start sandbox A

Replace the Git name and email placeholders, then run:

```bash
docker run -itd \
  --name agro-a \
  --network agro \
  --restart unless-stopped \
  --cgroupns private \
  --cap-add SYS_ADMIN \
  --security-opt apparmor=unconfined \
  --tmpfs /run --tmpfs /run/lock --tmpfs /sys/fs \
  -e SANDBOX_NAME=agro-a \
  -e GIT_USER_NAME="<your-name>" \
  -e GIT_USER_EMAIL="<you@example.com>" \
  -v agro-a_workspace:/home/sandbox \
  ghcr.io/mifunedev/agro:latest
```

The image runs `systemd` as PID 1, so there is no `--init` and no trailing command: the
image's own `CMD ["/sbin/init"]` is the container lifecycle. The four flags above are what
systemd needs to mount its own cgroup2 hierarchy — Docker mounts `/sys/fs/cgroup`
read-only, and its default AppArmor profile denies the mount even with `SYS_ADMIN`. They
are the minimum proven necessary; the sandbox is not `privileged` and the host cgroup tree
is never exposed.

`agro-a_workspace` is the whole sandbox home, and it is unique to A. The name follows the convention Compose uses—`<sandbox-name>_workspace`—so the same volume can later be adopted by the [image-only Compose file](https://github.com/mifunedev/agro/blob/main/.devcontainer/docker-compose.image-only.yml) without moving data.

To keep the home on the host filesystem instead, replace the volume name with an absolute host path:

```bash
  -v /srv/agro-a:/home/sandbox \
```

:::warning Use a dedicated directory
A host path must be a **dedicated, empty directory** that belongs to the sandbox alone. The entrypoint takes ownership of everything under `/home/sandbox` and seeds the baked home into it. Never point it at your real home directory, `~/.ssh`, or `~/.config`.
:::

## 3. Verify and attach

Confirm the container is running and that first-boot seeding completed:

```bash
docker ps --filter 'name=^/agro-a$' --format 'table {{.Names}}\t{{.Status}}'
docker logs agro-a
docker exec agro-a test -f /home/sandbox/harness/.agro/.image-seeded \
  && echo "sandbox A seed ready"
```

Attach from a terminal:

```bash
docker exec -it -u sandbox agro-a zsh
```

Or use VS Code with the Dev Containers extension:

1. Open the Command Palette.
2. Select **Dev Containers: Attach to Running Container...**.
3. Select `agro-a`.
4. Open `/home/sandbox/harness`.

This is **Attach to Running Container**, not **Reopen in Container**.

## 4. Authenticate inside sandbox A

Run these commands in A's shell.

### Install the tools first

Nothing installs at boot. Add the terminal workspace and the harnesses you will sign in to; `agro harness install <id>` is the one door for every harness in the catalog:

```bash
agro tool install herdr && herdr
agro harness install claude-code
agro harness install pi
```

### GitHub and SSH

```bash
gh auth login
```

Choose **GitHub.com** → **SSH** → allow `gh` to generate and upload an SSH key → **Paste an authentication token**. Then verify and configure Git:

```bash
gh auth setup-git
gh auth status
```

### Claude

```bash
claude auth login
claude auth status
```

### Pi

```bash
pi
```

Inside Pi, enter `/login`, choose a provider and device authentication, open the displayed browser URL on any device, enter the displayed code, and finish authorization. Then enter `/model` and select the provider and model you want Pi to use. Exit Pi with `Ctrl-D` when setup is complete.

Authentication persists in the `agro-a_workspace` volume with the rest of the home. Each sandbox owns its home, so authentication is per sandbox and does not cross between them. Do not put tokens in the Docker command.

## 5. Start sandbox B

Use the same image and network. Change the container identity and give B its own home volume:

```bash
docker run -itd \
  --name agro-b \
  --network agro \
  --restart unless-stopped \
  --cgroupns private \
  --cap-add SYS_ADMIN \
  --security-opt apparmor=unconfined \
  --tmpfs /run --tmpfs /run/lock --tmpfs /sys/fs \
  -e SANDBOX_NAME=agro-b \
  -e GIT_USER_NAME="<your-name>" \
  -e GIT_USER_EMAIL="<you@example.com>" \
  -v agro-b_workspace:/home/sandbox \
  ghcr.io/mifunedev/agro:latest
```

B boots from the same image with an isolated home, so repeat step 4 inside B to authenticate it.

Verify both seeds and prove that workspace content does not cross between them:

```bash
docker exec agro-b test -f /home/sandbox/harness/.agro/.image-seeded \
  && echo "sandbox B seed ready"
docker exec agro-a touch /home/sandbox/harness/.sandbox-a-only
docker exec agro-b test ! -e /home/sandbox/harness/.sandbox-a-only \
  && echo "A and B workspaces are isolated"
docker exec agro-a rm /home/sandbox/harness/.sandbox-a-only
```

## Optional: connect another service

Attach an existing container to the same private network so A and B can reach it:

```bash
docker network connect --alias app agro my-app
```

`app` becomes that container's network-local DNS name. From either sandbox, connect to `http://app:<container-port>`. The alias is available only on the `agro` network; it does not publish the service to the host or internet. Choose a short, unique alias, and omit `--alias app` if the container name is sufficient.

## First-boot and persistence model

The image ships with `/home/sandbox` deliberately empty and its baked home staged at `/opt/home-seed`. On first boot the entrypoint copies that home into whatever mount landed at `/home/sandbox`, which is why a named volume and a host bind behave identically.

When no checkout is bound at `/home/sandbox/harness`, the entrypoint also copies the baked `/opt/agro-seed` control plane into `/home/sandbox/harness` and writes `.agro/.image-seeded`. After that, the mount is authoritative and is not overwritten on later boots or image updates. A seeded image-only workspace has no Git history; clone or initialize repositories inside it as needed.

## Lifecycle and security

Stop and restart either sandbox without losing state:

```bash
docker stop agro-a agro-b
docker start agro-a agro-b
```

Remove the containers while retaining both home volumes:

```bash
docker rm -f agro-a agro-b
```

Volume deletion is destructive. Because the home is one mount, removing it permanently deletes that sandbox's workspace **and** its authentication, and you must sign in again:

```bash
docker volume rm agro-a_workspace agro-b_workspace
```

No ports are published by these commands; the `agro` network remains private until you deliberately add `-p HOST:CONTAINER`. The Docker socket is not mounted, so sandbox processes cannot control the host daemon. The published image is currently Linux/AMD64 only; hosts on another architecture are outside this happy path until a multi-architecture image is published.

## Full-option references

The `docker run` path above is the recommended walkthrough. For the complete image/boot model and advanced settings, see [Creating a sandbox](/docs/agro/deployment-prebuilt-image). The [canonical image-only Compose file](https://github.com/mifunedev/agro/blob/main/.devcontainer/docker-compose.image-only.yml) is available as a reference for operators who specifically need Compose-managed options.

## The same image runs under MicroSandbox

`msb` runs standard OCI images, so this image is also what you point MicroSandbox
at if you want a microVM rather than a container. The `docker run` recipe above is
the invocation to translate — see
[Running AGRO on MicroSandbox](./agro/runtimes/microsandbox.md).
Untested end to end; the risks are listed there.
