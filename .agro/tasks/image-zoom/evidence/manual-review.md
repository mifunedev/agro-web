## Manual review

**Setup (sandbox, local)**

1. Check out `feat/75-image-zoom`.
2. Run `pnpm install`.
3. Run `pnpm build`.
   Expected: the build log shows "[SUCCESS] Generated static files in "build"."
4. Run `pnpm serve --port 3297`. Set the browser window to 1280x720.
   Expected: `http://localhost:3297/docs/console/nodes` shows the "Nodes" page.

**A. Zoom in the light theme**

1. Select the light theme. Click the first image under "The Nodes page lists the nodes of your current context."
   Expected: the image fills the window at 1280x720, and the window shows "Monitor lifecycle, access, and billing across your organization."
   <details><summary>Screenshot</summary>

   <img src="https://github.com/mifunedev/agro-web/blob/<commit-sha>/.agro/tasks/image-zoom/evidence/light-before-click.png?raw=true" width="720" alt="The first Nodes image before the click in the light theme">
   </details>
   Callouts: 1 is image to click.
   <details><summary>Screenshot</summary>

   <img src="https://github.com/mifunedev/agro-web/blob/<commit-sha>/.agro/tasks/image-zoom/evidence/light-zoom-open.png?raw=true" width="720" alt="The zoomed Nodes image covers the navbar in the light theme">
   </details>
   Callouts: 1 is the zoom view.
2. Press Escape.
   Expected: the image returns to the docs column, and the page shows "Callouts: 1 is the Create node button. 2 is the web-app node name."
3. Click the image again.
4. Click the zoomed image.
   Expected: the image returns to the docs column.

**B. Zoom in the dark theme**

1. Select the dark theme. Click the first image under "The Nodes page lists the nodes of your current context."
   Expected: the image fills the window at 1280x720, and the window shows "Monitor lifecycle, access, and billing across your organization."
   <details><summary>Screenshot</summary>

   <img src="https://github.com/mifunedev/agro-web/blob/<commit-sha>/.agro/tasks/image-zoom/evidence/dark-before-click.png?raw=true" width="720" alt="The first Nodes image before the click in the dark theme">
   </details>
   Callouts: 1 is image to click.
   <details><summary>Screenshot</summary>

   <img src="https://github.com/mifunedev/agro-web/blob/<commit-sha>/.agro/tasks/image-zoom/evidence/dark-zoom-open.png?raw=true" width="720" alt="The zoomed Nodes image covers the navbar in the dark theme">
   </details>
   Callouts: 1 is the zoom view.
2. Press Escape.
   Expected: the image returns to the docs column, and the page shows "Callouts: 1 is the Create node button. 2 is the web-app node name."

**C. Navbar logo**

1. Click the "AGRO" logo in the navbar.
   Expected: the logo does not zoom, and the browser opens the home page.

**D. Cleanup**

1. Stop the `pnpm serve` process.
   Expected: no process listens on port 3297.
