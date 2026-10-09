import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";
import { terminalDark, terminalLight } from "./src/theme/prism-terminal";
import timeOfDayThemePlugin from "./src/plugins/time-of-day-theme";

// To deploy via GitHub Pages without custom domain, swap to:
// url: "https://mifunedev.github.io"
// baseUrl: "/openharness/"

const config: Config = {
  title: "AGRO",
  tagline:
    "AGRO is a portable harness for running coding agents in an isolated Docker sandbox.",
  favicon: "img/favicon.svg",

  url: "https://agro.mifune.dev",
  baseUrl: "/",

  organizationName: "mifunedev",
  projectName: "agro-web",

  trailingSlash: false,

  onBrokenLinks: "throw",

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  markdown: {
    mermaid: true,
    hooks: { onBrokenMarkdownLinks: "warn" },
  },

  headTags: [
    {
      tagName: "link",
      attributes: { rel: "preconnect", href: "https://fonts.googleapis.com" },
    },
    {
      tagName: "link",
      attributes: {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossorigin: "anonymous",
      },
    },
    {
      tagName: "link",
      attributes: {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap",
      },
    },
  ],

  themes: [
    "@docusaurus/theme-mermaid",
    [
      "@easyops-cn/docusaurus-search-local",
      {
        hashed: true,
        indexDocs: true,
        indexBlog: true,
        indexPages: true,
        docsDir: "docs",
        blogDir: "blog",
        docsRouteBasePath: "/docs",
        highlightSearchTermsOnTargetPage: true,
        searchBarShortcut: true,
        searchBarShortcutHint: true,
        searchResultLimits: 8,
      },
    ],
  ],

  plugins: [
    // Client-timezone default theme. Emits a preBodyTags script that runs after
    // Docusaurus's own color-mode script and upgrades light -> dark during the
    // night window, only when the reader has made no explicit choice and the OS
    // is not already asking for dark. See src/plugins/time-of-day-theme.
    timeOfDayThemePlugin,
    [
      "@docusaurus/plugin-client-redirects",
      {
        redirects: [
          { from: "/docs/intro", to: "/docs/agro/intro" },
          { from: "/docs/quickstart", to: "/docs/agro/quickstart" },
          { from: "/docs/installation", to: "/docs/agro/installation" },
          { from: "/docs/configuration", to: "/docs/agro/configuration" },
          { from: "/docs/connecting", to: "/docs/agro/connecting" },
          { from: "/docs/contributing", to: "/docs/agro/contributing" },
          { from: "/docs/lifecycle-commands", to: "/docs/agro/lifecycle-commands" },
          { from: "/docs/agro-directory-layout", to: "/docs/agro/agro-directory-layout" },
          { from: "/docs/deployment-prebuilt-image", to: "/docs/agro/deployment-prebuilt-image" },
          { from: "/docs/security-considerations", to: "/docs/agro/security-considerations" },
          { from: "/docs/harnesses/overview", to: "/docs/agro/harnesses/overview" },
          { from: "/docs/harnesses/antigravity-cli", to: "/docs/agro/harnesses/antigravity-cli" },
          { from: "/docs/harnesses/claude-code", to: "/docs/agro/harnesses/claude-code" },
          { from: "/docs/harnesses/codex", to: "/docs/agro/harnesses/codex" },
          { from: "/docs/harnesses/grok-build", to: "/docs/agro/harnesses/grok-build" },
          { from: "/docs/harnesses/hermes", to: "/docs/agro/harnesses/hermes" },
          { from: "/docs/harnesses/muse-code", to: "/docs/agro/harnesses/muse-code" },
          { from: "/docs/harnesses/opencode", to: "/docs/agro/harnesses/opencode" },
          { from: "/docs/harnesses/pi", to: "/docs/agro/harnesses/pi" },
          { from: "/docs/harnesses/t3code", to: "/docs/agro/harnesses/t3code" },
          { from: "/docs/integrations/debugmcp", to: "/docs/agro/integrations/debugmcp" },
          { from: "/docs/integrations/github", to: "/docs/agro/integrations/github" },
          { from: "/docs/integrations/herdr", to: "/docs/agro/integrations/herdr" },
          { from: "/docs/integrations/langfuse", to: "/docs/agro/integrations/langfuse" },
          { from: "/docs/integrations/pi-fff", to: "/docs/agro/integrations/pi-fff" },
          { from: "/docs/integrations/slack", to: "/docs/agro/integrations/slack" },
          { from: "/docs/integrations/sshd", to: "/docs/agro/integrations/sshd" },
          { from: "/docs/runtimes/overview", to: "/docs/agro/runtimes/overview" },
          { from: "/docs/runtimes/microsandbox", to: "/docs/agro/runtimes/microsandbox" },
          { from: "/docs/agents/claude-code", to: "/docs/agro/harnesses/claude-code" },
          { from: "/docs/agents/codex", to: "/docs/agro/harnesses/codex" },
          { from: "/docs/agents/deepagents", to: "/docs/agro/harnesses/overview" },
          { from: "/docs/harnesses/deepagents", to: "/docs/agro/harnesses/overview" },
          { from: "/docs/agents/grok-build", to: "/docs/agro/harnesses/grok-build" },
          { from: "/docs/agents/opencode", to: "/docs/agro/harnesses/opencode" },
          { from: "/docs/agents/pi", to: "/docs/agro/harnesses/pi" },
          { from: "/docs/agents/t3code", to: "/docs/agro/harnesses/t3code" },
          { from: "/docs/oh-directory-layout", to: "/docs/agro/agro-directory-layout" },
          { from: "/docs/agro", to: "/docs/agro/intro" },
          { from: "/docs/property-testing", to: "/docs/agro/contributing" },
          { from: "/docs/agro-compatibility", to: "/docs/agro/intro" },
          { from: "/docs/docker-deployment", to: "/docs/agro/deployment-prebuilt-image" },
          { from: "/docs/runtimes/docker", to: "/docs/agro/runtimes/overview" },
        ],
      },
    ],
  ],

  presets: [
    [
      "classic",
      {
        docs: {
          path: "docs",
          sidebarPath: "./sidebars.ts",
          editUrl: ({ docPath }) =>
            docPath.startsWith("agro/")
              ? `https://github.com/mifunedev/agro/edit/main/docs/${docPath.slice("agro/".length)}`
              : `https://github.com/mifunedev/agro-web/edit/main/docs/${docPath}`,
          routeBasePath: "docs",
          showLastUpdateTime: true,
        },
        blog: {
          path: "blog",
          showReadingTime: true,
          blogTitle: "AGRO Blog",
          blogDescription: "Notes from building AGRO",
          postsPerPage: 10,
          feedOptions: { type: ["rss", "atom"], title: "AGRO Blog" },
          editUrl: ({ blogPath }) =>
            `https://github.com/mifunedev/agro-web/edit/main/blog/${blogPath}`,
          routeBasePath: "blog",
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: "dark",
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    image: "img/social-card.png",
    metadata: [
      { name: "theme-color", content: "#0b1220" },
      { property: "og:type", content: "website" },
    ],
    mermaid: {
      theme: { light: "neutral", dark: "dark" },
    },
    prism: {
      theme: terminalLight,
      darkTheme: terminalDark,
      additionalLanguages: [
        "bash",
        "json",
        "yaml",
        "docker",
        "diff",
        "tsx",
        "toml",
      ],
    },
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 4,
    },
    navbar: {
      title: "AGRO",
      hideOnScroll: true,
      logo: {
        alt: "AGRO Logo",
        src: "img/logo.svg",
        srcDark: "img/logo-dark.svg",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "console",
          position: "left",
          label: "Console",
        },
        {
          type: "docSidebar",
          sidebarId: "agro",
          position: "left",
          label: "Self-host AGRO",
        },
        {
          to: "/blog",
          label: "Blog",
          position: "left",
        },
        {
          href: "https://github.com/mifunedev/agro",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "light",
      links: [
        {
          title: "Docs",
          items: [
            {
              label: "Mifune Console",
              to: "/docs",
            },
            {
              label: "Self-host AGRO",
              to: "/docs/agro/intro",
            },
          ],
        },
        {
          title: "Project",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/mifunedev/agro",
            },
            {
              label: "Site source",
              href: "https://github.com/mifunedev/agro-web",
            },
            {
              label: "License",
              href: "https://github.com/mifunedev/agro/blob/main/LICENSE",
            },
          ],
        },
      ],
      copyright: `Copyright ${new Date().getFullYear()} AGRO Contributors.`,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
