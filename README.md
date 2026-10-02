# workprojects

Interactive explainer pages for work. Each page is a single self-contained HTML file with no network or CDN loads, so it runs fully offline (airgapped): just double-click it to open in a browser.

## Explainers

| Page | What it shows |
| --- | --- |
| [Remote Display Path](explainers/remote-display-explainer.html) | How an engineer gets from a VDI Windows desktop, over SSH, to a VNC remote display server that shows the HCIs for a mission suite running on a large VM. 3D rack view with a 2D toggle (V key) and step-by-step walkthrough (← → / Space). |
| [Governed Agent Platform](explainers/agent-platform-explainer.html) | A walkthrough of the governed agent platform and how its pieces fit together. |

## Claude skill

[`.claude/skills/standalone-explainer`](.claude/skills/standalone-explainer/SKILL.md) tells Claude how to build these pages: one airgap-safe HTML file, an editable text block at the top, the panel/rail/dock layout, diagram and design rules, and an offline check script. Start a new page from [`assets/starter.html`](.claude/skills/standalone-explainer/assets/starter.html). In Claude Code, opened in this repo, type `/standalone-explainer` followed by what you want explained.
