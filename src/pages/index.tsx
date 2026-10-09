import React, { useEffect, useState } from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import CodeBlock from "@theme/CodeBlock";
import styles from "./index.module.css";

const GITHUB_REPO = "mifunedev/agro";
const GITHUB_URL = `https://github.com/${GITHUB_REPO}`;
const FALLBACK_STARS = 18;
const CONSOLE_URL = "https://console.mifune.dev";
const PRICING_URL = "https://mifune.dev/pricing";

const QUICKSTART = `# The host needs Docker, Git, and Node.js 20 or newer.
npm install -g @mifune/agro

# Without Node, run the release installer.
curl -fsSL https://github.com/mifunedev/agro/releases/latest/download/install.sh | bash

# Create the sandbox, then open a shell in it.
agro sandbox install docker
agro shell <name>

# In the sandbox, start Herdr, then install a harness.
agro tool install herdr
herdr
agro harness install claude-code
claude auth login`;

const AGENTS: Array<{
  id: string;
  name: string;
  description: string;
  icon: React.ReactElement;
}> = [
  {
    id: "claude-code",
    name: "Claude Code",
    description: "Claude Code is the terminal coding agent from Anthropic.",
    icon: <img src="/img/agents/claude-code.png" alt="" width={28} height={28} />,
  },
  {
    id: "codex",
    name: "Codex",
    description: "Codex is the CLI coding agent from OpenAI.",
    icon: <img src="/img/agents/codex.png" alt="" width={28} height={28} />,
  },
  {
    id: "pi",
    name: "Pi",
    description: "Pi is a lightweight agent framework that you can change.",
    icon: <PiIcon />,
  },
  {
    id: "opencode",
    name: "OpenCode",
    description: "OpenCode is a terminal coding agent.",
    icon: <OpenCodeIcon />,
  },
  {
    id: "grok-build",
    name: "Grok Build",
    description: "Grok Build is the terminal coding agent from xAI.",
    icon: <img src="https://x.ai/favicon.ico" alt="" width={28} height={28} />,
  },
  {
    id: "hermes",
    name: "Hermes",
    description: "Hermes is the agent runtime from Nous Research.",
    icon: <img src="https://hermes-agent.nousresearch.com/favicon.ico" alt="" width={28} height={28} />,
  },
  {
    id: "muse-code",
    name: "Muse Code",
    description: "Muse Code is the terminal coding agent from Meta.",
    icon: <img src="/img/agents/muse-code.ico" alt="" width={28} height={28} />,
  },
  {
    id: "antigravity-cli",
    name: "Antigravity CLI",
    description: "Antigravity CLI is the terminal coding agent from Google.",
    icon: <MonogramIcon letter="A" />,
  },
  {
    id: "fx",
    name: "fx",
    description: "fx is an experimental coding agent CLI from Vercel Labs.",
    icon: <MonogramIcon letter="fx" />,
  },
  {
    id: "t3code",
    name: "T3 Code",
    description: "T3 Code is a browser UI over Claude Code, Codex, or OpenCode.",
    icon: (
      <img
        src="https://github.com/pingdotgg.png"
        alt=""
        width={28}
        height={28}
      />
    ),
  },
];

const PRODUCTS: Array<{
  title: string;
  body: string[];
  links: Array<{ label: string; to?: string; href?: string }>;
}> = [
  {
    title: "Mifune Console",
    body: [
      "Mifune operates each node for you.",
      "Sign in with GitHub, create a node, and open the node from the Console.",
      "The free tier gives one n4 node for 24 running hours per UTC month, with no card.",
      "AI usage is not included.",
      "You sign in to your agent provider with your own account.",
    ],
    links: [
      { label: "Read the Console guide →", to: "/docs" },
      { label: "See pricing →", href: PRICING_URL },
    ],
  },
  {
    title: "Self-hosted AGRO",
    body: [
      "You run the sandbox on your own laptop or remote VM.",
      "The host needs Docker, Git, and Node.js 20 or newer.",
      "The agent keeps working after you disconnect.",
    ],
    links: [{ label: "Read the self-host guide →", to: "/docs/agro/intro" }],
  },
];

const WHY: Array<{ title: string; body: string }> = [
  {
    title: "A clean host",
    body: "The agent, its tools, and its logins stay off your host.",
  },
  {
    title: "A persistent home",
    body: "Logins, tools, and the workspace live in one volume. The volume survives a restart.",
  },
  {
    title: "Markdown crons",
    body: "Each crons/*.md file declares a schedule. The cron runtime sends the file body to the agent as a prompt.",
  },
];

export default function Home(): React.ReactElement {
  const stars = useGitHubStars(FALLBACK_STARS);
  const starLabel = formatStars(stars);

  return (
    <Layout description="Run coding agents in a durable AGRO workspace. Use the Mifune Console for a node that Mifune operates, or self-host AGRO on your own laptop or remote VM.">
      <main>
        <section className={styles.hero}>
          <div className={styles.heroBg} aria-hidden="true" />
          <div className={`${styles.container} ${styles.heroLayout}`}>
            <div className={styles.heroCopy}>
              <p className={styles.heroEyebrow}>
                <span className={styles.heroEyebrowDot} aria-hidden="true" />
                Mifune Console and self-hosted AGRO
              </p>
              <h1 className={styles.heroTitle}>
                Give each coding agent a durable workspace.
              </h1>
              <p className={styles.heroSubtitle}>
                AGRO gives a coding agent an isolated Docker sandbox. Use the Mifune Console to get a node that Mifune operates. Or run AGRO on your own laptop or remote VM.
              </p>
              <div className={styles.heroButtons}>
                <Link className="button button--primary button--lg" to="/docs">
                  Read the Console guide
                </Link>
                <Link className="button button--secondary button--lg" href={CONSOLE_URL}>
                  Open the Console
                </Link>
                <Link className="button button--secondary button--lg" to="/docs/agro/intro">
                  Self-host AGRO
                </Link>
              </div>
              <div className={styles.heroMeta}>
                <span>Console operated by Mifune</span>
                <span aria-hidden="true">·</span>
                <span>AGRO is Apache-2.0 open source</span>
                <span aria-hidden="true">·</span>
                <span>{starLabel} GitHub stars</span>
              </div>
            </div>
            <aside className={styles.heroTerminal} aria-label="Self-host quickstart commands">
              <div className={styles.terminalChrome}>
                <span className={`${styles.terminalDot} ${styles.terminalDotR}`} aria-hidden="true" />
                <span className={`${styles.terminalDot} ${styles.terminalDotY}`} aria-hidden="true" />
                <span className={`${styles.terminalDot} ${styles.terminalDotG}`} aria-hidden="true" />
                <span className={styles.terminalLabel}>self-host quickstart</span>
              </div>
              <CodeBlock language="bash" children={QUICKSTART} />
              <div className={styles.terminalFooter}>
                <Link className={styles.terminalFooterLink} to="/docs/agro/quickstart">
                  Read the self-host quickstart →
                </Link>
              </div>
            </aside>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Choose how you run AGRO.</h2>
            <div className={styles.whyGrid}>
              {PRODUCTS.map((product) => (
                <article key={product.title} className={styles.whyCard}>
                  <h3 className={styles.whyTitle}>{product.title}</h3>
                  {product.body.map((sentence) => (
                    <p key={sentence} className={styles.whyBody}>
                      {sentence}
                    </p>
                  ))}
                  <div className={styles.heroButtons} style={{ marginTop: "1rem", marginBottom: 0 }}>
                    {product.links.map((link) => (
                      <Link
                        key={link.label}
                        className={styles.archLink}
                        to={link.to}
                        href={link.href}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.starSection} aria-labelledby="github-stars-title">
          <div className={`${styles.container} ${styles.starBand}`}>
            <div className={styles.starCopy}>
              <p className={styles.starEyebrow}>Open source</p>
              <h2 id="github-stars-title" className={styles.starTitle}>
                Help more agent builders find AGRO.
              </h2>
              <p className={styles.starBody}>
                If AGRO saves you time, star the repository. A star helps other developers find the project.
              </p>
            </div>
            <div className={styles.starPanel} aria-label={`${starLabel} GitHub stars for ${GITHUB_REPO}`}>
              <span className={styles.starPanelLabel}>GitHub stars</span>
              <span className={styles.starPanelValue}>★ {starLabel}</span>
              <span className={styles.starPanelRepo}>{GITHUB_REPO}</span>
              <Link
                className={styles.starPanelCta}
                href={GITHUB_URL}
                aria-label={`Star AGRO on GitHub, ${starLabel} stars`}
              >
                Star on GitHub →
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Pick your agent.</h2>
            <p className={styles.sectionLede}>
              The sandbox installs no agent at boot. In the sandbox, run <code>agro harness install &lt;id&gt;</code> to add a harness. T3 Code runs on demand and needs no install.
            </p>
            <div className={styles.agentGrid}>
              {AGENTS.map((agent) => (
                <Link
                  key={agent.id}
                  className={styles.agentCard}
                  to={`/docs/agro/harnesses/${agent.id}`}
                >
                  <span className={styles.agentIcon} aria-hidden="true">
                    {agent.icon}
                  </span>
                  <span className={styles.agentText}>
                    <h3 className={styles.agentName}>{agent.name}</h3>
                    <p className={styles.agentDescription}>{agent.description}</p>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.sectionAlt}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Why run the agent in a sandbox?</h2>
            <div className={styles.whyGrid}>
              {WHY.map((item) => (
                <article key={item.title} className={styles.whyCard}>
                  <span className={styles.whyMarker} aria-hidden="true">
                    ⌘
                  </span>
                  <h3 className={styles.whyTitle}>{item.title}</h3>
                  <p className={styles.whyBody}>{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>A durable home for agent work.</h2>
            <div className={styles.archCard}>
              <p>
                Skills and hooks in <code>.agro/</code> serve every harness. Herdr is the persistent workspace for agents, tests, and development servers. The container keeps running after you detach from Herdr.
              </p>
              <p>
                SSH, the host Docker socket, Cloudflared tunnels, and Slack stay off until you turn them on.
              </p>
              <p>
                The <code>agro stop</code> command keeps the home volume. The <code>agro destroy</code> command deletes the home volume, and it asks before it runs.
              </p>
              <Link className={styles.archLink} to="/docs/agro/quickstart">
                Read the self-host quickstart →
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.sectionFinal}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Get involved</h2>
            <div className={styles.linkGrid}>
              <Link className={styles.linkCard} to="/docs">
                <span className={styles.linkCardLabel}>Console guide</span>
                <span className={styles.linkCardSub}>
                  Start with a node that Mifune operates.
                </span>
              </Link>
              <Link className={styles.linkCard} to="/docs/agro/intro">
                <span className={styles.linkCardLabel}>Self-host guide</span>
                <span className={styles.linkCardSub}>
                  Install and run AGRO on your own machine.
                </span>
              </Link>
              <Link className={styles.linkCard} href={GITHUB_URL}>
                <span className={styles.linkCardLabel}>Star AGRO</span>
                <span className={styles.linkCardSub}>
                  Help others find the project on GitHub.
                </span>
              </Link>
              <Link
                className={styles.linkCard}
                href="https://github.com/mifunedev/agro/blob/main/LICENSE"
              >
                <span className={styles.linkCardLabel}>License</span>
                <span className={styles.linkCardSub}>AGRO uses the Apache-2.0 license.</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

function formatStars(stars: number): string {
  if (stars >= 1000) {
    return `${(stars / 1000).toFixed(stars >= 10000 ? 0 : 1)}k`;
  }

  return new Intl.NumberFormat("en-US").format(stars);
}

function useGitHubStars(fallback: number): number {
  const [stars, setStars] = useState(fallback);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`https://api.github.com/repos/${GITHUB_REPO}`, {
      signal: controller.signal,
      headers: { Accept: "application/vnd.github+json" },
    })
      .then((response) => (response.ok ? response.json() : Promise.reject(response)))
      .then((repo: { stargazers_count?: number }) => {
        if (typeof repo.stargazers_count === "number") {
          setStars(repo.stargazers_count);
        }
      })
      .catch(() => {
        // Keep the committed fallback if GitHub is rate-limited or unavailable.
      });

    return () => controller.abort();
  }, []);

  return stars;
}

/* ---------- Inline agent icons ----------
 * Inlined so `currentColor` adapts to light/dark theme. */

function PiIcon(): React.ReactElement {
  return (
    <svg viewBox="0 0 800 800" width="28" height="28" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M165.29 165.29 H517.36 V400 H400 V517.36 H282.65 V634.72 H165.29 Z M282.65 282.65 V400 H400 V282.65 Z"
      />
      <path fill="currentColor" d="M517.36 400 H634.72 V634.72 H517.36 Z" />
    </svg>
  );
}

function OpenCodeIcon(): React.ReactElement {
  return (
    <svg viewBox="0 0 28 28" width="28" height="28" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="3" y="3" width="22" height="22" rx="5" fill="currentColor" opacity="0.14" />
      <path
        fill="currentColor"
        d="M8 14c0-3.6 2.5-6.2 6-6.2s6 2.6 6 6.2-2.5 6.2-6 6.2-6-2.6-6-6.2Zm3.1 0c0 2 1.1 3.4 2.9 3.4s2.9-1.4 2.9-3.4-1.1-3.4-2.9-3.4-2.9 1.4-2.9 3.4Z"
      />
    </svg>
  );
}

function MonogramIcon({ letter }: { letter: string }): React.ReactElement {
  return (
    <svg viewBox="0 0 28 28" width="28" height="28" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="3" y="3" width="22" height="22" rx="5" fill="currentColor" opacity="0.14" />
      <text
        x="14"
        y="18.5"
        textAnchor="middle"
        fontSize={letter.length > 1 ? 10 : 13}
        fontWeight={700}
        fontFamily="ui-monospace, monospace"
        fill="currentColor"
      >
        {letter}
      </text>
    </svg>
  );
}
