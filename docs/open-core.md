---
sidebar_position: 10
title: "Open-core boundary"
---

# Open-core boundary

Mifune makes two products. AGRO is open source. Mifune Console is a managed service that Mifune operates. This page shows which product is which.

## The split

| Product | Status | What you get |
|---|---|---|
| AGRO | Open source, [Apache-2.0](https://www.apache.org/licenses/LICENSE-2.0) | The `agro` CLI, the sandbox image, and the `.agro/` control plane. You run AGRO on your own laptop or VM. |
| Mifune Console | Proprietary managed service | Managed AGRO nodes that Mifune operates for you. The Console also includes provisioning, billing, and enterprise policy. |

The source of AGRO is at [github.com/mifunedev/agro](https://github.com/mifunedev/agro). You can read, change, and run the AGRO source under the Apache-2.0 terms.

Mifune Console runs at [console.mifune.dev](https://console.mifune.dev).

## Choose a product

- To run agents on your own machine, use AGRO. Start with the [AGRO introduction](agro/intro.md).
- To let Mifune operate the machine for you, use Mifune Console. Start with the [Console guide](/docs).

For Console prices, see [mifune.dev/pricing](https://mifune.dev/pricing).
