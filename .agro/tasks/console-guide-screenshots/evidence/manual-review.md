# Manual review: Console guide screenshots (#72, US-007)

This review opens each of the 8 changed Console guide pages in a local production build. Each page gets an annotated screenshot at 1280x720 and at 414x896. The review also checks each of the 21 images in `static/img/console/` for real data.

## Setup

Run each step in the worktree `feat/72-console-guide-screenshots`. Do not set `AGRO_SCRIPTS_REF`.

1. Confirm that port 3299 is free:

   ```bash
   ss -ltn | grep ':3299 ' || echo 'port 3299 free'
   ```

   Expected: `port 3299 free`.
2. Build the site:

   ```bash
   pnpm build
   ```

   Expected: exit status 0, and the last line starts with `[theme-order] PASS`.
3. Start the server in the background with a PID file:

   ```bash
   nohup pnpm serve --port 3299 --no-open > serve.log 2>&1 &
   echo $! > serve.pid
   ```

   Expected: `serve.log` shows `[SUCCESS] Serving "build" directory at: http://localhost:3299/`.
4. Record the PIDs of the `sh` child and the `node` child of the `pnpm` process:

   ```bash
   pgrep -P "$(cat serve.pid)"
   ss -ltnp | grep ':3299 '
   ```

   Expected: one `node` process listens on `*:3299`.
5. Open the browser session `us007`:

   ```bash
   export AGENT_BROWSER_SESSION=us007
   agent-browser open http://localhost:3299/docs/console/getting-started
   ```

   Expected: `[agent-browser] launched browser`.

For each scenario, use these commands. `<page>` is the page slug. `<image>` is the image name of the scenario.

```bash
agent-browser set viewport <width> <height>
agent-browser open http://localhost:3299/docs/console/<page>
agent-browser eval "(async () => { const imgs=[...document.querySelectorAll('article img')]; imgs.forEach(i=>i.loading='eager'); await Promise.all(imgs.map(i=>i.decode().catch(()=>null))); return JSON.stringify(imgs.map(i=>[i.getAttribute('src'),i.naturalWidth,i.complete])); })()"
agent-browser eval "(() => { const el=document.querySelector('article img[src*=\"/<image>-\"]'); window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - document.querySelector('.navbar').offsetHeight - 110); return window.scrollY; })()"
bash /home/sandbox/harness/.agro/skills/agent-browser/scripts/annotate-screenshot.sh evidence/<page>-<width>.png 'article img[src*="/<image>-"]=<label 1>' 'article p:has(> img[src*="/<image>-"]) > strong=<label 2>'
```

The scroll puts the top of the image 110px below the sticky navbar. The navbar is 56px high.

## Scenarios

**A. Getting started**

1. Set the viewport to 1280x720. Expected: `✓ Done`.
2. Open `http://localhost:3299/docs/console/getting-started`. Expected: the page heading is `Getting started`.
3. Run the image check. Expected: 5 images (getting-started-1.png, getting-started-2.png, getting-started-3.png, getting-started-4.png, getting-started-5.png). Each image has `naturalWidth` 1280 and `complete` `true`.
4. Scroll `getting-started-1.png` to 110px below the navbar. Expected: the text above the image is `Open console.mifune.dev in your browser. The Sign in page opens.`.
5. Take the annotated screenshot. Expected: the line under the image is `Callouts: 1 is the Continue with GitHub button.`.
   <details><summary>Screenshot</summary>

   <img src="https://github.com/mifunedev/agro-web/blob/<commit-sha>/.agro/tasks/console-guide-screenshots/evidence/getting-started-1280.png?raw=true" width="720" alt="The Getting started guide page at 1280x720 with the getting-started-1 image">
   </details>

   Callouts: 1 is the Sign in image. 2 is the Continue with GitHub label.
6. Set the viewport to 414x896. Expected: `✓ Done`.
7. Open `http://localhost:3299/docs/console/getting-started`. Expected: the page heading is `Getting started`.
8. Run the image check. Expected: 5 images (getting-started-1.png, getting-started-2.png, getting-started-3.png, getting-started-4.png, getting-started-5.png). Each image has `naturalWidth` 1280 and `complete` `true`.
9. Scroll `getting-started-1.png` to 110px below the navbar. Expected: the text above the image is `Open console.mifune.dev in your browser. The Sign in page opens.`.
10. Take the annotated screenshot. Expected: the line under the image is `Callouts: 1 is the Continue with GitHub button.`.
   <details><summary>Screenshot</summary>

   <img src="https://github.com/mifunedev/agro-web/blob/<commit-sha>/.agro/tasks/console-guide-screenshots/evidence/getting-started-414.png?raw=true" width="720" alt="The Getting started guide page at 414x896 with the getting-started-1 image">
   </details>

   Callouts: 1 is the Sign in image. 2 is the Continue with GitHub label.

**B. Nodes**

1. Set the viewport to 1280x720. Expected: `✓ Done`.
2. Open `http://localhost:3299/docs/console/nodes`. Expected: the page heading is `Nodes`.
3. Run the image check. Expected: 3 images (nodes-1.png, nodes-2.png, nodes-3.png). Each image has `naturalWidth` 1280 and `complete` `true`.
4. Scroll `nodes-1.png` to 110px below the navbar. Expected: the text above the image is `The Nodes page lists the nodes of your current context.`.
5. Take the annotated screenshot. Expected: the line under the image is `Callouts: 1 is the Create node button. 2 is the web-app node name.`.
   <details><summary>Screenshot</summary>

   <img src="https://github.com/mifunedev/agro-web/blob/<commit-sha>/.agro/tasks/console-guide-screenshots/evidence/nodes-1280.png?raw=true" width="720" alt="The Nodes guide page at 1280x720 with the nodes-1 image">
   </details>

   Callouts: 1 is the Nodes list image. 2 is the Create node label.
6. Set the viewport to 414x896. Expected: `✓ Done`.
7. Open `http://localhost:3299/docs/console/nodes`. Expected: the page heading is `Nodes`.
8. Run the image check. Expected: 3 images (nodes-1.png, nodes-2.png, nodes-3.png). Each image has `naturalWidth` 1280 and `complete` `true`.
9. Scroll `nodes-1.png` to 110px below the navbar. Expected: the text above the image is `The Nodes page lists the nodes of your current context.`.
10. Take the annotated screenshot. Expected: the line under the image is `Callouts: 1 is the Create node button. 2 is the web-app node name.`.
   <details><summary>Screenshot</summary>

   <img src="https://github.com/mifunedev/agro-web/blob/<commit-sha>/.agro/tasks/console-guide-screenshots/evidence/nodes-414.png?raw=true" width="720" alt="The Nodes guide page at 414x896 with the nodes-1 image">
   </details>

   Callouts: 1 is the Nodes list image. 2 is the Create node label.

**C. Connect to a node**

1. Set the viewport to 1280x720. Expected: `✓ Done`.
2. Open `http://localhost:3299/docs/console/connect`. Expected: the page heading is `Connect to a node`.
3. Run the image check. Expected: 3 images (connect-1.png, connect-3.png, connect-2.png). Each image has `naturalWidth` 1280 and `complete` `true`.
4. Scroll `connect-1.png` to 110px below the navbar. Expected: the text above the image is `To select a different way, click the arrow next to Connect.`.
5. Take the annotated screenshot. Expected: the line under the image is `Callouts: 1 is the arrow next to Connect. 2 is the Connect menu.`.
   <details><summary>Screenshot</summary>

   <img src="https://github.com/mifunedev/agro-web/blob/<commit-sha>/.agro/tasks/console-guide-screenshots/evidence/connect-1280.png?raw=true" width="720" alt="The Connect to a node guide page at 1280x720 with the connect-1 image">
   </details>

   Callouts: 1 is the Connect menu image. 2 is the Connect label.
6. Set the viewport to 414x896. Expected: `✓ Done`.
7. Open `http://localhost:3299/docs/console/connect`. Expected: the page heading is `Connect to a node`.
8. Run the image check. Expected: 3 images (connect-1.png, connect-3.png, connect-2.png). Each image has `naturalWidth` 1280 and `complete` `true`.
9. Scroll `connect-1.png` to 110px below the navbar. Expected: the text above the image is `To select a different way, click the arrow next to Connect.`.
10. Take the annotated screenshot. Expected: the line under the image is `Callouts: 1 is the arrow next to Connect. 2 is the Connect menu.`.
   <details><summary>Screenshot</summary>

   <img src="https://github.com/mifunedev/agro-web/blob/<commit-sha>/.agro/tasks/console-guide-screenshots/evidence/connect-414.png?raw=true" width="720" alt="The Connect to a node guide page at 414x896 with the connect-1 image">
   </details>

   Callouts: 1 is the Connect menu image. 2 is the Connect label.

**D. Snapshots**

1. Set the viewport to 1280x720. Expected: `✓ Done`.
2. Open `http://localhost:3299/docs/console/snapshots`. Expected: the page heading is `Snapshots`.
3. Run the image check. Expected: 2 images (snapshots-1.png, snapshots-2.png). Each image has `naturalWidth` 1280 and `complete` `true`.
4. Scroll `snapshots-1.png` to 110px below the navbar. Expected: the text above the image is `In the Snapshot card, select Replace snapshot.`.
5. Take the annotated screenshot. Expected: the line under the image is `Callouts: 1 is the Snapshot card. 2 is the Replace snapshot button.`.
   <details><summary>Screenshot</summary>

   <img src="https://github.com/mifunedev/agro-web/blob/<commit-sha>/.agro/tasks/console-guide-screenshots/evidence/snapshots-1280.png?raw=true" width="720" alt="The Snapshots guide page at 1280x720 with the snapshots-1 image">
   </details>

   Callouts: 1 is the Snapshot card image. 2 is the Snapshot label.
6. Set the viewport to 414x896. Expected: `✓ Done`.
7. Open `http://localhost:3299/docs/console/snapshots`. Expected: the page heading is `Snapshots`.
8. Run the image check. Expected: 2 images (snapshots-1.png, snapshots-2.png). Each image has `naturalWidth` 1280 and `complete` `true`.
9. Scroll `snapshots-1.png` to 110px below the navbar. Expected: the text above the image is `In the Snapshot card, select Replace snapshot.`.
10. Take the annotated screenshot. Expected: the line under the image is `Callouts: 1 is the Snapshot card. 2 is the Replace snapshot button.`.
   <details><summary>Screenshot</summary>

   <img src="https://github.com/mifunedev/agro-web/blob/<commit-sha>/.agro/tasks/console-guide-screenshots/evidence/snapshots-414.png?raw=true" width="720" alt="The Snapshots guide page at 414x896 with the snapshots-1 image">
   </details>

   Callouts: 1 is the Snapshot card image. 2 is the Snapshot label.

**E. Free tier**

1. Set the viewport to 1280x720. Expected: `✓ Done`.
2. Open `http://localhost:3299/docs/console/free-tier`. Expected: the page heading is `Free tier`.
3. Run the image check. Expected: 2 images (free-tier-1.png, free-tier-2.png). Each image has `naturalWidth` 1280 and `complete` `true`.
4. Scroll `free-tier-1.png` to 110px below the navbar. Expected: the text above the image is `The node page of the free node shows Free hours left and Free hours reset.`.
5. Take the annotated screenshot. Expected: the line under the image is `Callouts: 1 is the Billing card with Free hours left and Free hours reset.`.
   <details><summary>Screenshot</summary>

   <img src="https://github.com/mifunedev/agro-web/blob/<commit-sha>/.agro/tasks/console-guide-screenshots/evidence/free-tier-1280.png?raw=true" width="720" alt="The Free tier guide page at 1280x720 with the free-tier-1 image">
   </details>

   Callouts: 1 is the Billing card image. 2 is the Billing label.
6. Set the viewport to 414x896. Expected: `✓ Done`.
7. Open `http://localhost:3299/docs/console/free-tier`. Expected: the page heading is `Free tier`.
8. Run the image check. Expected: 2 images (free-tier-1.png, free-tier-2.png). Each image has `naturalWidth` 1280 and `complete` `true`.
9. Scroll `free-tier-1.png` to 110px below the navbar. Expected: the text above the image is `The node page of the free node shows Free hours left and Free hours reset.`.
10. Take the annotated screenshot. Expected: the line under the image is `Callouts: 1 is the Billing card with Free hours left and Free hours reset.`.
   <details><summary>Screenshot</summary>

   <img src="https://github.com/mifunedev/agro-web/blob/<commit-sha>/.agro/tasks/console-guide-screenshots/evidence/free-tier-414.png?raw=true" width="720" alt="The Free tier guide page at 414x896 with the free-tier-1 image">
   </details>

   Callouts: 1 is the Billing card image. 2 is the Billing label.

**F. Billing**

1. Set the viewport to 1280x720. Expected: `✓ Done`.
2. Open `http://localhost:3299/docs/console/billing`. Expected: the page heading is `Billing`.
3. Run the image check. Expected: 2 images (billing-3.png, billing-usage.png). Each image has `naturalWidth` 1280 and `complete` `true`.
4. Scroll `billing-3.png` to 110px below the navbar. Expected: the text above the image is `Select Billing. The Billing page opens.`.
5. Take the annotated screenshot. Expected: the line under the image is `Callouts: 1 is the Billing current badge. 2 is the Update card button. 3 is the Open Billing Portal button.`.
   <details><summary>Screenshot</summary>

   <img src="https://github.com/mifunedev/agro-web/blob/<commit-sha>/.agro/tasks/console-guide-screenshots/evidence/billing-1280.png?raw=true" width="720" alt="The Billing guide page at 1280x720 with the billing-3 image">
   </details>

   Callouts: 1 is the Billing page image. 2 is the Billing current label.
6. Set the viewport to 414x896. Expected: `✓ Done`.
7. Open `http://localhost:3299/docs/console/billing`. Expected: the page heading is `Billing`.
8. Run the image check. Expected: 2 images (billing-3.png, billing-usage.png). Each image has `naturalWidth` 1280 and `complete` `true`.
9. Scroll `billing-3.png` to 110px below the navbar. Expected: the text above the image is `Select Billing. The Billing page opens.`.
10. Take the annotated screenshot. Expected: the line under the image is `Callouts: 1 is the Billing current badge. 2 is the Update card button. 3 is the Open Billing Portal button.`.
   <details><summary>Screenshot</summary>

   <img src="https://github.com/mifunedev/agro-web/blob/<commit-sha>/.agro/tasks/console-guide-screenshots/evidence/billing-414.png?raw=true" width="720" alt="The Billing guide page at 414x896 with the billing-3 image">
   </details>

   Callouts: 1 is the Billing page image. 2 is the Billing current label.

**G. Organizations**

1. Set the viewport to 1280x720. Expected: `✓ Done`.
2. Open `http://localhost:3299/docs/console/organizations`. Expected: the page heading is `Organizations`.
3. Run the image check. Expected: 2 images (organizations-members-3.png, organizations-invite-6.png). Each image has `naturalWidth` 1280 and `complete` `true`.
4. Scroll `organizations-members-3.png` to 110px below the navbar. Expected: the text above the image is `Select Members.`.
5. Take the annotated screenshot. Expected: the line under the image is `Callouts: 1 is the Roster table. 2 is the Status column.`.
   <details><summary>Screenshot</summary>

   <img src="https://github.com/mifunedev/agro-web/blob/<commit-sha>/.agro/tasks/console-guide-screenshots/evidence/organizations-1280.png?raw=true" width="720" alt="The Organizations guide page at 1280x720 with the organizations-members-3 image">
   </details>

   Callouts: 1 is the Members page image. 2 is the Roster label.
6. Set the viewport to 414x896. Expected: `✓ Done`.
7. Open `http://localhost:3299/docs/console/organizations`. Expected: the page heading is `Organizations`.
8. Run the image check. Expected: 2 images (organizations-members-3.png, organizations-invite-6.png). Each image has `naturalWidth` 1280 and `complete` `true`.
9. Scroll `organizations-members-3.png` to 110px below the navbar. Expected: the text above the image is `Select Members.`.
10. Take the annotated screenshot. Expected: the line under the image is `Callouts: 1 is the Roster table. 2 is the Status column.`.
   <details><summary>Screenshot</summary>

   <img src="https://github.com/mifunedev/agro-web/blob/<commit-sha>/.agro/tasks/console-guide-screenshots/evidence/organizations-414.png?raw=true" width="720" alt="The Organizations guide page at 414x896 with the organizations-members-3 image">
   </details>

   Callouts: 1 is the Members page image. 2 is the Roster label.

**H. API tokens**

1. Set the viewport to 1280x720. Expected: `✓ Done`.
2. Open `http://localhost:3299/docs/console/api-tokens`. Expected: the page heading is `API tokens`.
3. Run the image check. Expected: 2 images (api-tokens-2.png, api-tokens-5.png). Each image has `naturalWidth` 1280 and `complete` `true`.
4. Scroll `api-tokens-2.png` to 110px below the navbar. Expected: the text above the image is `Select Tokens. The API tokens page opens.`.
5. Take the annotated screenshot. Expected: the line under the image is `Callouts: 1 is the Create token button. 2 is the Prefix column. 3 is the Revoked label.`.
   <details><summary>Screenshot</summary>

   <img src="https://github.com/mifunedev/agro-web/blob/<commit-sha>/.agro/tasks/console-guide-screenshots/evidence/api-tokens-1280.png?raw=true" width="720" alt="The API tokens guide page at 1280x720 with the api-tokens-2 image">
   </details>

   Callouts: 1 is the API tokens page image. 2 is the Create token label.
6. Set the viewport to 414x896. Expected: `✓ Done`.
7. Open `http://localhost:3299/docs/console/api-tokens`. Expected: the page heading is `API tokens`.
8. Run the image check. Expected: 2 images (api-tokens-2.png, api-tokens-5.png). Each image has `naturalWidth` 1280 and `complete` `true`.
9. Scroll `api-tokens-2.png` to 110px below the navbar. Expected: the text above the image is `Select Tokens. The API tokens page opens.`.
10. Take the annotated screenshot. Expected: the line under the image is `Callouts: 1 is the Create token button. 2 is the Prefix column. 3 is the Revoked label.`.
   <details><summary>Screenshot</summary>

   <img src="https://github.com/mifunedev/agro-web/blob/<commit-sha>/.agro/tasks/console-guide-screenshots/evidence/api-tokens-414.png?raw=true" width="720" alt="The API tokens guide page at 414x896 with the api-tokens-2 image">
   </details>

   Callouts: 1 is the API tokens page image. 2 is the Create token label.

## Data check

The review opened each image in `static/img/console/` and read each visible value. The allowed values are demo values, `support@mifune.dev` on the sign-in page, masked rates, and the masked token. Each name is a demo login, a demo node name, or `Example Co`. Each email address uses `example.com`, except `support@mifune.dev`. Each IP address is in the documentation range `192.0.2.0/24`.

| Image | Values in the image | Result |
|---|---|---|
| `getting-started-1.png` | Sign-in page, `support@mifune.dev` | Pass |
| `getting-started-2.png` | `demo-admin`, `Example Co`, nodes with `192.0.2.13` and `192.0.2.10`, demo totals `$0.00 MTD` and `$8.54 MTD` | Pass. Note 1. |
| `getting-started-3.png` | `demo-operator`, free node form, no price | Pass |
| `getting-started-4.png` | `demo-operator`, `Create free node` button | Pass |
| `getting-started-5.png` | `my-free-node`, `192.0.2.20`, `demo-admin`, rate `$•.••/hr` | Pass |
| `nodes-1.png` | `Example Co`, 4 demo nodes, `192.0.2.13`, `192.0.2.10`, `demo-admin` | Pass |
| `nodes-2.png` | `web-app`, `192.0.2.10`, `demo-admin`, rate `$•.••/hr` | Pass |
| `nodes-3.png` | `ci-runner`, no IP, `demo-operator`, rate `$•.••/hr` | Pass |
| `connect-1.png` | `web-app`, Connect menu, `192.0.2.10`, rate `$•.••/hr` | Pass |
| `connect-2.png` | `sandbox@192.0.2.10`, host fingerprint of the demo node | Pass. Note 2. |
| `connect-3.png` | Add SSH key dialog, demo keys `laptop` and `ci`, placeholder `you@host` | Pass |
| `snapshots-1.png` | `Before upgrade` snapshot, shortened key fingerprint of `laptop` | Pass |
| `snapshots-2.png` | 3 demo snapshots of `Example Co` | Pass |
| `free-tier-1.png` | `demo-admin` free node, `192.0.2.20`, rate `$•.••/hr` | Pass |
| `free-tier-2.png` | `demo-viewer`, `viewer-free-node`, rate `$•.••/hr` | Pass |
| `billing-3.png` | `Example Co` billing, no card digits, placeholder `billing@example.com` | Pass |
| `billing-usage.png` | Demo spend `$8.54` and `$63.25`, daily chart, rate `$•.••/hr` | Pass. Note 1. |
| `organizations-members-3.png` | `demo-viewer`, `demo-operator`, `demo-admin`, `new-teammate@example.com` | Pass |
| `organizations-invite-6.png` | `new-member@example.com`, Console placeholder `sarah-chen` | Pass. Note 3. |
| `api-tokens-2.png` | `docs-example` and `ci-deploy`, shortened token prefixes | Pass. Note 4. |
| `api-tokens-5.png` | Token `mfc_` with a mask on the value | Pass |

Result: 21 of 21 images pass. No image shows a real name, a real email address, a real IP address, or a live payment detail.

Notes:

1. The dollar values come from the demo usage rows of the capture run. No value is a live charge.
2. The fingerprint identifies the host key of the local demo node. The key does not exist outside the capture run.
3. `sarah-chen` is the placeholder text of the Console field. The Console shows the placeholder to each user. The placeholder is not a member of `Example Co`.
4. Each prefix belongs to a demo token of the capture run. The two `mfc_` tokens show `Revoked`.

## Defects

The review fixed no defect. Commit `531f66e` retook the three images with badge defects. A second run retook `billing-1280.png`, `billing-414.png`, `organizations-1280.png`, and `organizations-414.png` from a new local build. The second run used the same callouts and the same scroll. The printed `Callouts:` lines did not change.

1. Fixed in `531f66e`. `billing-3.png`: the callout badges hid Console text. Badge 1 hid the start of the sentence above the **Billing current** badge. Badge 2 hid the **Card on file** line. Badge 3 hid the end of the **Invoices & history** text. The new image shows each badge next to its target.
2. Fixed in `531f66e`. `organizations-members-3.png`: badge 1 hid the **Search members** field. The new image shows badges 1 and 2 under the **Roster** table.
3. Fixed in `531f66e`. `billing-usage.png`: badge 1 hid part of the sentence under **Month-to-date usage**. The new image shows the full sentence.
4. Known limit. At 414x896, the text in each embedded image is too small to read. The plan puts mobile screenshots out of scope.

## Cleanup

1. Close the browser session:

   ```bash
   agent-browser --session us007 close
   ```

   Expected: `✓ Browser closed`.
2. Stop each server process by its PID. Use the PIDs from setup steps 3 and 4:

   ```bash
   kill <node-pid> <sh-pid> <pnpm-pid>
   ```

   Expected: exit status 0.
3. Confirm that no server process remains:

   ```bash
   ps -p <pnpm-pid>,<sh-pid>,<node-pid> > /dev/null || echo 'all stopped'
   ```

   Expected: `all stopped`.
4. Confirm that port 3299 is free:

   ```bash
   ss -ltn | grep ':3299 ' || echo 'port 3299 free'
   ```

   Expected: `port 3299 free`.
