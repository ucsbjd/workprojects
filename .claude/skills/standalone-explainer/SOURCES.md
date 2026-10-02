# Sources for the standalone-explainer skill

Checked 2026-10-02. Star counts are as GitHub showed them that day and are approximate.

## Used, and what was taken

| Skill | Backer | Popularity | What went into this skill |
| --- | --- | --- | --- |
| [frontend-design](https://github.com/anthropics/skills/tree/main/skills/frontend-design) | Anthropic (official) | anthropics/skills repo ~167k stars | Plan-before-code token system (palette, type, layout, signature), "spend boldness in one place", the three AI-default looks to avoid, copy-writing rules |
| [Impeccable](https://github.com/pbakaus/impeccable) | Paul Bakaus (ex-Google Chrome DevRel), Apache-2.0 | ~74k stars | Anti-pattern list (nested cards, gray on color, pure black, bounce easing, purple-blue gradients), critique-then-fix loop |
| [Taste Skill](https://github.com/Leonxlnx/taste-skill) | Leon Lin, MIT | ~88k stars | Anti-slop framing; restraint over decoration |
| [web-design-guidelines](https://github.com/vercel-labs/agent-skills) | Vercel (official) | ~32k stars | Quality floor: focus states, keyboard, contrast, motion, hit targets |
| [emil-design-eng](https://skillselion.com/skills/emilkowalski/skills/emil-design-eng) | Emil Kowalski (Vercel, Linear; animations.dev) | ~36k stars | Motion rules: ease-out, 150–300 ms, transform/opacity only, purposeful animation |
| [architecture-diagram-skill](https://github.com/konraddzbik/architecture-diagram-skill) | konraddzbik, MIT | 64 stars (small, but the closest match) | Max ~12 nodes per view, flow packets on wires, side panel details, play/step controls, keyboard map |
| [visual-explainer](https://github.com/nicobailon/visual-explainer) | nicobailon, MIT | ~9k stars | Isolate optional widgets so one failure can't blank the page. Not used as-is: it loads Mermaid, Chart.js and Google Fonts from CDNs, which breaks airgap. |
| [html-artifact-best-practices](https://skills.lc/ClawEnable/html-artifact-best-practices/clawenable-html-artifact-best-practices-skills-html-artifact-guide-skill-md) | ClawEnable | no star count found | Single file, single style block, single script block, no frameworks |
| [ship-page-skill](https://github.com/Zooeyii/ship-page-skill) | Zooeyii | 11 stars | Confirms the zero-dependency single-file pattern; little else needed |
| sael.net/prompt, sael.net/rocket-nozzle | — | — | Layout: full-bleed visual, text panel, chapter rail, keyboard-first controls, live readouts with units, view modes, hide-UI key |
| explainers/*.html in this repo | Justin's earlier pages | — | Dark house style, panel/rail/dock, canvas 3D engine, 2D/3D toggle, camera per step, LIMIT clamps |

## Looked at and left out

- [UI/UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) (~131k stars, MIT): real and popular, but it's a searchable database driven by Python scripts and aimed at React/Next/Tailwind stacks. Too heavy for a single-file airgapped workflow.

## Named by ChatGPT but not found

- "anthropic-html": no skill or repo by that name turned up. Anthropic's official skills are frontend-design and web-artifacts-builder (the latter uses React and a bundler, so it doesn't fit).
- "html-it" and "make-html-skill": no matching repos found.
- "design-taste" as a combined skill of design-taste-frontend + Impeccable + Emil Kowalski: not found. The pieces exist separately (rows above).
- drewharvey/claude-html-animation-skill exists but couldn't be opened from here, so it wasn't used.
