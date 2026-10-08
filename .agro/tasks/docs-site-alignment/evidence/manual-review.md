# Manual review: docs site alignment (#70, US-015)

This file records a browser review of a local build of the site. Each "after" screenshot shows the local build at `http://localhost:3299`. Each "before" screenshot shows the live site at `https://agro.mifune.dev` on 2026-10-08, before the deploy.

The run used agent-browser 0.38.1 with the session `us-015`. The run took each screenshot at 1280x720 and at 414x896. Before each annotated screenshot, the run scrolled the first target to about 110px below the sticky navbar.

## User journey

**Setup (host, in the worktree `feat/70-docs-site-alignment`)**

1. Build the site. Do not set `AGRO_SCRIPTS_REF`.

   ```bash
   pnpm build
   ```

   Expected: the build log shows "wrote static/install.sh <- https://github.com/mifunedev/agro/releases/download/v0.18.1/install.sh (mifunedev/agro@v0.18.1, 8705 bytes)" and "[SUCCESS] Generated static files in "build"." The exit status is 0.

2. Start the server in a detached process. The second command writes the PID to `serve.pid`.

   ```bash
   setsid nohup pnpm serve --port 3299 --no-open > serve.log 2>&1 &
   echo $! > serve.pid
   ```

   Expected: `serve.log` shows "[SUCCESS] Serving "build" directory at: http://localhost:3299/".

**A. Home page**

1. Open `http://localhost:3299/` at 1280x720. Expected: the navbar shows "Console", "Self-host AGRO", "Blog" in this order. The hero buttons show "Read the Console guide", "Open the Console", "Self-host AGRO" in this order. The quickstart panel shows "npm install -g @mifune/agro".
   <details><summary>Screenshot</summary>

   <img src="https://github.com/mifunedev/agro-web/blob/<commit-sha>/.agro/tasks/docs-site-alignment/evidence/after-home-1280.png?raw=true" width="720" alt="Home page at 1280x720 with the navbar, the hero buttons, and the install commands">
   </details>
   Callouts: 1 is the navbar order Console, Self-host AGRO, Blog. 2 is the hero buttons in order. 3 is the self-host install commands.

2. Compare with the live site at `https://agro.mifune.dev/` at 1280x720. Expected: the live navbar shows "Start Here", "Docs", "Blog". The live hero shows "Get started" and "★ Star on GitHub". The live panel shows "curl -fsSL https://agro.mifune.dev/get-agro.sh | bash".
   <details><summary>Screenshot</summary>

   <img src="https://github.com/mifunedev/agro-web/blob/<commit-sha>/.agro/tasks/docs-site-alignment/evidence/before-home-1280.png?raw=true" width="720" alt="Live home page at 1280x720 before the change">
   </details>
   Callouts: 1 is the old navbar Start Here, Docs, Blog. 2 is the old hero buttons. Before the change, the home page had no Console path and installed from `get-agro.sh` on agro.mifune.dev.

3. Open `http://localhost:3299/` at 414x896. Expected: the hero buttons stack as "Read the Console guide", "Open the Console", "Self-host AGRO". The quickstart panel shows "npm install -g @mifune/agro".
   <details><summary>Screenshot</summary>

   <img src="https://github.com/mifunedev/agro-web/blob/<commit-sha>/.agro/tasks/docs-site-alignment/evidence/after-home-414.png?raw=true" width="720" alt="Home page at 414x896 with the stacked hero buttons and the install commands">
   </details>
   Callouts: 1 is the hero buttons in order. 2 is the self-host install commands.

4. Compare with the live site at 414x896.
   <details><summary>Screenshot</summary>

   <img src="https://github.com/mifunedev/agro-web/blob/<commit-sha>/.agro/tasks/docs-site-alignment/evidence/before-home-414.png?raw=true" width="720" alt="Live home page at 414x896 before the change">
   </details>
   Callouts: 1 is the old hero buttons. Before the change, the mobile hero showed "Get started" and "★ Star on GitHub".

**B. Console guide**

1. Open `http://localhost:3299/docs` at 1280x720. Expected: the page title is "Mifune Console". The sidebar shows "Introduction", "Getting started", "Nodes", "Connect to a node", "Snapshots", "Free tier", "Billing", "Organizations", "API tokens".
   <details><summary>Screenshot</summary>

   <img src="https://github.com/mifunedev/agro-web/blob/<commit-sha>/.agro/tasks/docs-site-alignment/evidence/after-console-intro-1280.png?raw=true" width="720" alt="Console introduction at 1280x720 with the navbar, the Console sidebar, and the title">
   </details>
   Callouts: 1 is the navbar order Console, Self-host AGRO, Blog. 2 is the Console sidebar. 3 is the page title Mifune Console.

2. Compare with the live site at `https://agro.mifune.dev/docs` at 1280x720. Expected: the live page title is "AGRO". The live sidebar starts with "Introduction", "Installation", "Quickstart".
   <details><summary>Screenshot</summary>

   <img src="https://github.com/mifunedev/agro-web/blob/<commit-sha>/.agro/tasks/docs-site-alignment/evidence/before-console-intro-1280.png?raw=true" width="720" alt="Live docs introduction at 1280x720 before the change">
   </details>
   Callouts: 1 is the old navbar Start Here, Docs, Blog. 2 is the old AGRO sidebar. Before the change, `/docs` was the AGRO introduction, and the site had no Console guide.

3. Open `http://localhost:3299/docs` at 414x896. Expected: the breadcrumb shows "Introduction". The page title is "Mifune Console".
   <details><summary>Screenshot</summary>

   <img src="https://github.com/mifunedev/agro-web/blob/<commit-sha>/.agro/tasks/docs-site-alignment/evidence/after-console-intro-414.png?raw=true" width="720" alt="Console introduction at 414x896 with the breadcrumb and the title">
   </details>
   Callouts: 1 is the breadcrumb Introduction. 2 is the page title Mifune Console.

4. Compare with the live site at 414x896.
   <details><summary>Screenshot</summary>

   <img src="https://github.com/mifunedev/agro-web/blob/<commit-sha>/.agro/tasks/docs-site-alignment/evidence/before-console-intro-414.png?raw=true" width="720" alt="Live docs introduction at 414x896 before the change">
   </details>
   Callouts: 1 is the old page title AGRO.

5. Open `http://localhost:3299/docs/console/nodes` at 1280x720. Expected: the sidebar marks "Nodes" as active. The page title is "Nodes". The first heading is "Roles for each action".
   <details><summary>Screenshot</summary>

   <img src="https://github.com/mifunedev/agro-web/blob/<commit-sha>/.agro/tasks/docs-site-alignment/evidence/after-console-nodes-1280.png?raw=true" width="720" alt="Console Nodes page at 1280x720 with the active sidebar item and the title">
   </details>
   Callouts: 1 is the active Nodes sidebar item. 2 is the page title Nodes.

6. Open `http://localhost:3299/docs/console/nodes` at 414x896. Expected: the breadcrumb shows "Nodes". The page title is "Nodes".
   <details><summary>Screenshot</summary>

   <img src="https://github.com/mifunedev/agro-web/blob/<commit-sha>/.agro/tasks/docs-site-alignment/evidence/after-console-nodes-414.png?raw=true" width="720" alt="Console Nodes page at 414x896 with the breadcrumb and the title">
   </details>
   Callouts: 1 is the breadcrumb Nodes. 2 is the page title Nodes.

   No earlier page existed at this path. `curl -s -o /dev/null -w '%{http_code}' https://agro.mifune.dev/docs/console/nodes` printed `404`. This step has no before screenshot.

**C. Self-host guide and the redirect `/docs/quickstart` → `/docs/agro/quickstart`**

1. Open `http://localhost:3299/docs/quickstart`. Expected: the browser goes to "http://localhost:3299/docs/agro/quickstart", and the page title is "Quickstart | AGRO". The served HTML holds `http-equiv="refresh" content="0; url=/docs/agro/quickstart"`.

2. Look at `/docs/agro/quickstart` at 1280x720. Expected: the step heading is "1. Get agro". The first command is "npm install -g @mifune/agro". The second command is "curl -fsSL https://github.com/mifunedev/agro/releases/latest/download/install.sh | bash".
   <details><summary>Screenshot</summary>

   <img src="https://github.com/mifunedev/agro-web/blob/<commit-sha>/.agro/tasks/docs-site-alignment/evidence/after-agro-quickstart-1280.png?raw=true" width="720" alt="AGRO quickstart at 1280x720 with the step heading and the two install commands">
   </details>
   Callouts: 1 is the step 1. Get agro. 2 is the npm install command. 3 is the release installer command.

3. Compare with the live site at `https://agro.mifune.dev/docs/quickstart` at 1280x720.
   <details><summary>Screenshot</summary>

   <img src="https://github.com/mifunedev/agro-web/blob/<commit-sha>/.agro/tasks/docs-site-alignment/evidence/before-agro-quickstart-1280.png?raw=true" width="720" alt="Live quickstart at 1280x720 before the change">
   </details>
   Callouts: 1 is the old npm install line. 2 is the get-agro.sh install line. Before the change, the quickstart lived at `/docs/quickstart` and named `get-agro.sh` as the bootstrap.

4. Look at `/docs/agro/quickstart` at 414x896. Expected: the step heading is "1. Get agro". The first command is "npm install -g @mifune/agro".
   <details><summary>Screenshot</summary>

   <img src="https://github.com/mifunedev/agro-web/blob/<commit-sha>/.agro/tasks/docs-site-alignment/evidence/after-agro-quickstart-414.png?raw=true" width="720" alt="AGRO quickstart at 414x896 with the step heading and the two install commands">
   </details>
   Callouts: 1 is the step 1. Get agro. 2 is the npm install command. 3 is the release installer command.

5. Compare with the live site at 414x896.
   <details><summary>Screenshot</summary>

   <img src="https://github.com/mifunedev/agro-web/blob/<commit-sha>/.agro/tasks/docs-site-alignment/evidence/before-agro-quickstart-414.png?raw=true" width="720" alt="Live quickstart at 414x896 before the change">
   </details>
   Callouts: 1 is the old npm install line. 2 is the get-agro.sh install line.

**D. Blog post**

1. Open `http://localhost:3299/blog/open-harness-demo-guide` at 1280x720. Expected: the title is "From Fresh Sandbox to First PR: An AGRO Demo Guide". The date is "July 7, 2026". The note shows "Updated on 2026-10-08. Open Harness is now AGRO. This post uses the current names and commands."
   <details><summary>Screenshot</summary>

   <img src="https://github.com/mifunedev/agro-web/blob/<commit-sha>/.agro/tasks/docs-site-alignment/evidence/after-blog-1280.png?raw=true" width="720" alt="Blog post at 1280x720 with the post date and the dated note">
   </details>
   Callouts: 1 is the original post date. 2 is the dated note on the former name.

2. Compare with the live site at 1280x720. Expected: the live title is "From Fresh Sandbox to First PR: An Open Harness Demo Guide". The live note starts with "COMMANDS UPDATED ON 2026-09-02".
   <details><summary>Screenshot</summary>

   <img src="https://github.com/mifunedev/agro-web/blob/<commit-sha>/.agro/tasks/docs-site-alignment/evidence/before-blog-1280.png?raw=true" width="720" alt="Live blog post at 1280x720 before the change">
   </details>
   Callouts: 1 is the old title with Open Harness. 2 is the old Commands updated note. Before the change, the post used the name "Open Harness" and `oh` commands.

3. Open the post at 414x896. Expected: the date is "July 7, 2026". The note shows "Updated on 2026-10-08. Open Harness is now AGRO."
   <details><summary>Screenshot</summary>

   <img src="https://github.com/mifunedev/agro-web/blob/<commit-sha>/.agro/tasks/docs-site-alignment/evidence/after-blog-414.png?raw=true" width="720" alt="Blog post at 414x896 with the post date and the dated note">
   </details>
   Callouts: 1 is the original post date. 2 is the dated note on the former name.

4. Compare with the live site at 414x896.
   <details><summary>Screenshot</summary>

   <img src="https://github.com/mifunedev/agro-web/blob/<commit-sha>/.agro/tasks/docs-site-alignment/evidence/before-blog-414.png?raw=true" width="720" alt="Live blog post at 414x896 before the change">
   </details>
   Callouts: 1 is the old title with Open Harness. 2 is the old Commands updated note.

**E. Cleanup**

1. Close the browser session.

   ```bash
   agent-browser --session us-015 close
   ```

2. Stop the server by its PID, then make sure that the port is free.

   ```bash
   kill -- -"$(cat serve.pid)"
   ss -ltn | grep -c ':3299 '
   ```

   Expected: the second command prints `0`.

## Installer endpoints

**A. The local build serves the release installer**

Prerequisites: the server from Setup step 2 runs on port 3299. The build log names the tag `v0.18.1`. Runs on the host, local.

1. Compare `/install.sh` with the release asset:

   ```bash
   curl -fsS http://localhost:3299/install.sh | cmp - <(curl -fsSL https://github.com/mifunedev/agro/releases/download/v0.18.1/install.sh)
   ```

   Output: none. Exit status: 0.

2. Compare `/get-agro.sh` with the release asset:

   ```bash
   curl -fsS http://localhost:3299/get-agro.sh | cmp - <(curl -fsSL https://github.com/mifunedev/agro/releases/download/v0.18.1/install.sh)
   ```

   Output: none. Exit status: 0.

3. Read the headers of the local `/install.sh`:

   ```bash
   curl -sI http://localhost:3299/install.sh
   ```

   Output, trimmed:

   ```text
   HTTP/1.1 200 OK
   Content-Length: 8705
   Content-Type: application/x-sh
   ```

   The release asset is also 8705 bytes.

4. Failure path. Compare `/install.sh` with a different release asset:

   ```bash
   curl -fsS http://localhost:3299/install.sh | cmp - <(curl -fsSL https://github.com/mifunedev/agro/releases/download/v0.18.1/agro.js)
   ```

   Output: `- /proc/self/fd/13 differ: char 16, line 1`. Exit status: 1.

**B. The live site before the deploy**

Prerequisites: network access. Runs on the host, remote.

1. Read the status of the live `/install.sh`:

   ```bash
   curl -sI https://agro.mifune.dev/install.sh | head -1
   ```

   Output: `HTTP/2 404`. The live site does not serve `/install.sh` before the deploy.

2. Read the status of the live `/get-agro.sh`:

   ```bash
   curl -sI https://agro.mifune.dev/get-agro.sh | head -1
   ```

   Output: `HTTP/2 200`.

## Observed defects

Commit `da3cfca` fixed both defects that the first run found. The second run confirmed each fix.

1. The first run showed raw backticks in two self-host sidebar labels. The synced pages `docs/agro/deployment-prebuilt-image.md` and `docs/agro/agro-directory-layout.md` put backticks in the `title` front matter. After the fix, the sidebar shows "Creating a sandbox: agro sandbox install docker" and ".agro/ directory layout". The screenshot `after-agro-quickstart-1280.png` shows the fixed labels.
2. The first run logged "8263 bytes" for `install.sh`, because the script logged a character count. After the fix, the build log reports "8705 bytes". The release asset has 8705 bytes.
