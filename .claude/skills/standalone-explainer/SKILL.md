---
name: standalone-explainer
description: Build or revise an interactive explainer page (architecture, data flow, process, system walkthrough) as one airgap-safe HTML file that opens by double-click and whose words can be edited after delivery. Use for any explainer, briefing page or single-file HTML visual meant for management or customers.
---

# Standalone explainer pages

You are building a briefing tool, not a website. An aerospace engineer will carry this file into an
airgapped work network, open it by double-clicking, and walk managers or customers through an
architecture or a flow. Later, on a machine with no tools but Notepad and a browser, they will need
to change names, labels and wording. Every rule below serves those three facts.

## 1. Hard rules (never break these)

1. Exactly one `.html` file. CSS, JS, SVG and content live inside it.
2. Zero network: no CDN, no web fonts, no `<link>` to anything, no `fetch`/XHR, no external images,
   no analytics. The file must work with the network cable pulled.
3. Must work from `file://` in Chrome and Edge. Chrome blocks `fetch()` of local files from
   `file://`, so never load a sibling .json/.txt with fetch. Use the content layer in section 2.
4. Vanilla JS and inline SVG or `<canvas>`. No React, Vue, Tailwind, npm, build step, Java, or
   server code. Do not inline big libraries (three.js is about 600 KB); hand-write what you need.
5. No base64 images unless the user supplies a picture that has to be in the page.
6. `localStorage` only for small conveniences (theme), always inside `try/catch`, and the page must
   work without it. Never use it to hold content.
7. No TODOs, no placeholder lorem ipsum, no dead controls. Every visible control works.
8. Don't invent components, systems or steps the user didn't describe. If something is missing,
   leave it out and ask, or mark it clearly as an example.
9. Aim for under 150 KB. The two existing explainers are 45–60 KB.

## 2. Editable content layer (the default)

All words live in one plain-text block at the top of the file, right after `<title>`, in a simple
INI-like format. The same format is used for .txt files the page can import.

```html
<!-- HOW TO EDIT THE WORDS ON THIS PAGE ... (short instructions for a Notepad user) -->
<script type="text/plain" id="content">
[meta]
kicker = Explainer · Ground segment
title = How spacecraft telemetry reaches the operator

[node gw]
name = Cross-domain gateway
sub = one-way · inspected
detail = The only path between the two enclaves.

[flow f2]
label = Frames · one-way

[step cross]
short = Boundary
title = Frames cross through one gateway
body = The **{gw}** is the only connection between the two enclaves.

  A blank line, then indented text, starts a new paragraph.
callout_label = Why it matters
callout = Nothing in the mission enclave can reach back out.
focus = fep, gw, tlm
flows = f2, f3
</script>
```

Format rules: `[section id]` headers (`meta`, `group`, `node`, `flow`, `step`); `key = value`;
indented lines continue a value; a blank line before an indented line makes a paragraph;
`#` at column 0 is a comment; `**bold**`, `` `code` ``, and `{nodeId}` inserts that node's name.
Steps appear in the order written. Keep instructions in an HTML comment above the block, not
inside it, and never write the literal opening tag in that comment.

Three ways to change the words, all built into the page:

| Way | How | Why |
| --- | --- | --- |
| Notepad (default) | Edit the block at the top, save, reload | Zero tooling, survives anything |
| In the browser | `E` toggles edit mode: click any panel text, box or arrow label and type. `Ctrl+S` downloads `<name>-edited.html` with the block rewritten | Non-technical edits, see the result live |
| Import a .txt | `O` or drag a .txt onto the page; the same format applies live. `Export .txt` writes the current text out | Keep one text file per audience or program |

How save works: the first line of the main script captures
`const PRISTINE = "<!doctype html>\n" + document.documentElement.outerHTML;` before anything
touches the DOM. Saving replaces only the text between the content block's opening tag and its
`</script>` in that string (escape `</script` in values as `<\/script`), then downloads it through
a Blob link. Imported or edited text is never kept in localStorage: it's live until the user saves
a copy, and `beforeunload` warns if there are unsaved changes.

Words go in the content block. Positions, colors, sizes, camera views and which node connects to
which go in clearly marked `LAYOUT` constants in the script (`GROUPS`, `NODES`, `FLOWS`, `LEGEND`).
When the parser sees a problem (an unknown node id in `focus`, a line it doesn't understand), show
a short banner naming the line, and keep running with everything else.

Why not a sidecar file: `<script src="page.content.js">` does work from file://, but two files get
separated when emailed or copied onto removable media. Offer it only if the user asks for it.

## 3. Start from the starter, or from the existing explainers

- **Default: `assets/starter-3d.html`**: the 3D + 2D page (both modes, full screen, label solver, models, arcs; see sections 13 to 16). Replace its content block, `GROUPS`/`NODES`/`FLOWS`/`LEGEND` and the `K.*` models for each box kind. `assets/starter.html` is the older flat-only starter, for a quick 2D-only page. `assets/starter.html` next to this file (repo copy:
  `github.com/ucsbjd/workprojects/.claude/skills/standalone-explainer/assets/starter.html`) is a
  tested 2D SVG explainer with everything in sections 2, 4 and 5 already working. Copy it, replace
  `GROUPS`/`NODES`/`FLOWS`/`LEGEND` and the content block, then restyle per section 6.
- For a 3D or physical scene (racks, rooms, vehicles, anything where place matters), reuse the
  hand-written canvas 3D engine in `explainers/remote-display-explainer.html` or
  `explainers/agent-platform-explainer.html` (painter-sorted boxes, glowing arcs, particle streams,
  orbit/pan/zoom clamped by `LIMIT`, 2D/3D morph on `V`). Move their `NAMES`/`STEPS` text into the
  content block format above.
- If neither file is available, build to this spec from scratch.

Every page ships both views (section 13): a 3D model and a flat 2D diagram fed by one layout, with a 3D/2D switch. 3D is the default view.

## 4. Layout and interaction (modeled on sael.net/prompt and sael.net/rocket-nozzle)

- Full-bleed stage holding the diagram. Small header top-left: mono uppercase kicker, display-face
  title that states the takeaway, one-line subtitle.
- Side panel on the right, about 390 px: step number `03 / 05`, step title, body of 90 words or
  fewer, one callout (mono label in the step's accent color plus one sentence), and a legend whose
  entries fade when they don't apply to the current step.
- Bottom dock: ← ▶ → buttons, a chapter rail (one segment per step, fills while playing, labels
  `01 Overview`), and tools (Edit, Open .txt, theme). A faint key-hint line above the dock.
- Every step has a camera: animate the SVG viewBox (or 3D camera) to fit that step's `focus`
  nodes, leaving room for the panel. Non-focus nodes and flows dim to about 22% opacity. Overview
  first, then hop by hop: overview → subsystem → component.
- Click or Enter on any node or flow label shows its detail in the panel, with "← Back to step".
  Hover shows a small tooltip. Drag pans, wheel zooms around the cursor, `R` resets, all clamped
  so the diagram can't be lost.
- Keys: ← → / PageUp PageDown steps, Home/End, 1–9 jump, Space play, Esc back, E edit, O open,
  Ctrl+S save, T light/dark, P presentation mode (hides chrome, bigger text), F fullscreen. Ignore
  keys while the user is typing in an editable field.
- Live readouts like rocket-nozzle's (`Thrust 875 kN · Isp 289 s`) when the subject has numbers:
  units always shown, values in bold or mono, the number next to the thing it measures.
- Under 860 px wide the panel becomes a bottom sheet (max 44vh) and rail labels hide.
- Provide a light theme (`:root[data-theme="light"]`) for bright conference rooms and printing,
  and an `@media print` block.

## 5. Engineering diagram rules

- Snap to a grid, keep node sizes consistent within a role, align rows and columns.
- No more than about 12 nodes in one view. Split bigger systems into an overview plus drill-down
  steps rather than shrinking boxes.
- Connectors are orthogonal with small rounded elbows, edge to edge, arrowhead at the receiving end
  (both ends only when traffic really goes both ways). Leave at least 140 px between connected
  boxes so the connector label fits; labels sit above horizontal lines and beside vertical ones,
  with a background-colored halo (`paint-order: stroke`).
- Boundaries (enclaves, networks, trust zones, buildings) are dashed rounded rectangles with a
  mono uppercase label at top-left. A boundary crossing should be visually obvious: a single
  connector through a highlighted gateway node, never lines leaking across.
- Color encodes category only, with 4–6 named semantic colors and a legend every time. Never color
  for decoration. Gray means read-only or out of scope.
- Moving dots along the active connectors show direction and what is flowing; idle connectors go
  dashed and faint.
- Text never spills out of a box: measure with `getComputedTextLength()` and shrink to fit, or
  shorten the label.

## 6. Visual design (distilled from Anthropic frontend-design, Impeccable, Taste Skill)

Before coding, write a five-line plan and check it against the brief:
1. Job: the one thing a manager should understand after the walkthrough.
2. Story: 4–9 steps, each one idea, titles that state a conclusion ("Frames cross through one
   gateway"), not a topic ("Gateway").
3. Palette: up to six chromatic hex values plus gray for read-only, each with a meaning (add a category color only when the content truly has a new category, e.g. skills vs memory). Background tinted, never pure #000 or #fff.
4. Type: system fonts only, since web fonts are banned. Display `Bahnschrift` (DIN-like, ships with
   Windows 10/11) falling back to `"Segoe UI Variable Display", "Segoe UI", system-ui`; body
   `"Segoe UI Variable Text", "Segoe UI", system-ui`; data and labels `"Cascadia Mono", Consolas,
   ui-monospace`. Clear scale, for example 30/22/14.5/11 px, with mono uppercase tracked +0.14em
   for kickers.
5. Signature: the one memorable element (the animated flow, a cutaway, a live readout). Spend
   boldness there and keep everything else quiet.

The house style so far is dark (`#0b0f1a`), thin `rgba(255,255,255,.09)` lines, panels at about
90% opacity with blur, and mono micro-labels. Keep it unless the user asks for something else, but
choose palette and signature for each subject.

Avoid: purple-to-blue gradients, glassmorphism everywhere, cards nested in cards, emoji as icons,
big-number stat tiles with a gradient accent, decorative 01/02/03 numbering on things that aren't
a sequence, gray text on colored backgrounds, bounce or elastic easing, walls of text, more than
one accent fighting for attention. Before calling it done, remove one decoration.

## 7. Motion (from Emil Kowalski's design-engineering rules)

- Animate to explain: camera moves between steps, flow dots, fades for focus. Nothing loops just to
  look busy.
- Use ease-out curves (`cubic-bezier(.2,.8,.2,1)`), never `ease-in` for UI. Use 150–250 ms for UI
  feedback and about 0.6–1 s for camera glides.
- Animate only `transform` and `opacity` in CSS. In SVG, move dots with `getPointAtLength`.
- Respect `prefers-reduced-motion`: no flow dots, instant camera.

## 8. Writing for managers and customers

Plain words from the reader's side ("operators see alarms", not "the HMI subscribes to the event
bus"). Active voice, sentence case, one idea per step, numbers with units. Define an acronym the
first time or drop it. Body text explains why it matters, not just what is connected. Callouts
carry the one sentence you want repeated in the meeting.

## 9. Quality floor (from Vercel's Web Interface Guidelines)

Real `<button>` elements, visible `:focus-visible` rings, everything reachable by keyboard,
`aria-live="polite"` on the panel, text contrast of at least 4.5:1 in both themes, nothing smaller
than 10 px, hit targets of at least 32 px, `role="img"` and an `aria-label` on the diagram. Wrap
optional extras (minimap, readouts) in `try/catch` so one failure can't blank the page.

## 10. File structure

In order: the edit instructions comment, the content block, `<style>` (tokens on `:root`, then
the light theme, layout, diagram, responsive, print), markup (stage, header, panel, dock, edit
bar, banner), then one `<script>` with `"use strict"` in labeled sections: PRISTINE snapshot,
LAYOUT constants, content parse/serialize, diagram render, camera, steps/panel, edit/save/import,
controls, animation loop, start.

## 11. Verify before you say it's done

Run `node scripts/check.js page.html outdir` (in this skill folder; it uses Playwright and the
preinstalled Chromium). It opens the page from file://, fails on any console error or network
request, steps through every chapter, flags labels spilling out of boxes, round-trips
edit → Ctrl+S → reopen and a .txt import, and saves screenshots at 1280×720, 1920×1080 and
768×1024 in dark and light. If you can't run a browser, say so plainly.

Then look at every screenshot and answer honestly:
1. Does the first screen say what this is and why it matters?
2. Is the hierarchy obvious (title, then diagram, then panel)?
3. Is any label clipped, overlapping a line, or hidden behind the panel at some size?
4. Does each step's camera frame its focus nodes with the panel open?
5. Does anything look like placeholder or invented content?
6. Would an engineer recognize the real system? Would a manager follow it without you there?
7. Is every animation explaining something?
8. Would a professional designer be proud to show this?

Fix what you find, re-run the check, and only then deliver.

## 12. Delivery

Save as `explainers/<kebab-name>.html`, add a row to the repo README table, and tell the user in
two lines how to change the words: edit the block at the top in Notepad, or press E in the browser
and Ctrl+S to save a copy.

## 13. Added requirements (2026-10-02): modes, 3D/2D, full screen, far-away readability

These apply to every new page. The 3D *look* (models, shading, per-box props) is still being
iterated; the reference page is `explainers/agent-platform-3d-explainer.html`. Do not treat its
3D style as final until the user approves it, then record it here.

1. **Always include both a 3D view and a 2D view**, with a 3D/2D switch (`V`). One layout
   feeds both. 3D must be crisp: vector drawing at the device pixel ratio, all text as HTML
   labels over the canvas, never text baked into a bitmap.
2. **Two modes, independent of each other** (`M`): *Play walkthrough* (steps, play, panel text)
   and *View overview* (free: drag to turn, scroll to zoom, click any box or arrow to zoom
   in on it with its detail in the panel, Esc to zoom back out). Overview never depends on or
   moves the walkthrough step.
3. **Full-screen diagram button** (`F`): hides the title, panel and dock so only the model and a
   small legend remain, with an auto-hiding 3D/2D + Exit control. Arrow keys still work.
4. **Built for conference rooms and projectors.** The audience sits far from the screen:
   - Size the interface in `rem` from a root size that grows with the viewport
     (`clamp(16px, calc(.5vw + 10px), 24px)`); never fixed small pixels.
   - On-screen minimums at 1920 px wide: box names 20 px or more, sub-lines 15 px or more,
     arrow labels 14 px or more, panel body 17 px or more.
   - No gray text on dark or light boxes. Sub-lines use the main text color at about 85%.
     Gray is only for read-only things in the diagram itself.
   - Keep box text short so it never needs shrinking; if it must shrink, cap at 10 px and
     shorten the words instead.
   - Check screenshots at 1920x1080 and judge them from across the room: if you can't read a
     label at arm's length on a laptop, it fails.

## 14. Labels must never overlap (added after the first 3D page)

The first 3D page put a full label (name + sub-line) above every box and an arrow label on every
arrow, and in the overview and in zoomed steps they piled on top of each other and on the models.
This is a hard rule for every view, 3D or 2D:

1. **Label only what is being talked about.** In an overview where everything is lit, boxes get a
   *name-only* label; the sub-line appears when that box is focused, selected, or the camera is
   zoomed in enough that a box is wider than about 280 px. Arrow labels show only for the arrows
   lit in the current step, or hovered or selected. Never label every arrow at once.
2. **Dimmed things yield.** A dimmed box's label may show only where it fits without touching
   anything; otherwise it hides. It must never sit on top of a lit model or a lit label.
3. **Place labels with a collision solver, not fixed offsets.** Each frame, measure each label
   (full and name-only forms), then place them in priority order (selected, lit in this step, arrow
   labels, everything else, boundary names last). For each, try a list of candidate spots (above,
   higher above, below the front edge, left, right) and take the first that overlaps no placed label
   and no lit model's screen box. Clamp inside the visible stage. Smooth movement so labels glide.
4. **Leader line** (thin, in the box's color, with a dot on the box) whenever a label ends up more
   than about 20 px from its box.
5. **Boundary names** (enclave, network, cloud) go on the front edge of the floor, never over a
   model, and slide along the edge or hide if there is no free spot.
6. **Test it:** screenshot the overview and every zoomed step at 1920x1080 and 1280x720. If any
   two labels, or a label and a lit model, touch, it fails.

## 15. View-overview layout (added)

- In *View overview* with nothing selected, **hide the side panel entirely**; the legend floats at
  the bottom-left (same as full screen) and the model gets the whole width. Selecting a box or
  arrow brings the panel back with its detail and a "Back to overview" button; Esc returns.
- Optional 3D flourish, pending the user's approval of the look: long or boundary-crossing
  connections can fly as parabolic arcs (with a faint dashed shadow on the floor) while short
  neighbouring links stay straight on the floor. Mark them `arc:true` in the LAYOUT flows.

## 16. The approved 3D look (2026-10-02, from `assets/starter-3d.html`)

Reproduce this look; it was iterated with the user and approved ("great overall").

1. **Camera:** default is a three-quarter, near-isometric view: yaw about 0.5 rad, pitch about
   0.62 rad (about 35 degrees). Not top-down. Perspective, focal length from the stage size.
   Orbit by dragging, pan with right-drag or Shift, zoom with the wheel, all clamped (`LIMIT`).
   Each step's camera is found by searching the closest distance at which the focus boxes, their
   labels and any arcs fit inside the stage rectangle (not the panel or dock).
2. **Scene:** a dark floor with a faint 2-unit grid; dashed, faintly tinted floor rectangles for
   boundaries; every box stands on a low colored slab. Faces are flat-shaded and tinted with the
   category color, edges are bright, painter-sorted. Slabs and ground lines are drawn before the
   models so models always sit on top of them.
3. **Each box gets a small model that says what it is** (people at laptops with ID cards, a
   standing person with a tablet, a vault with locks, towers with glowing orbs for agents, a
   clock and calendar, a cloud over a chip, server racks with LEDs, monitors with app screens,
   filing cabinets for read-only reference, a tray of folders for output, a plinth with a
   page and gear for a skill, a monitor plus database stack for a web app). Screens are drawn as
   vectors under a skewed transform so they stay sharp; icons are screen-space sprites.
4. **Connections:** short neighbouring links run along the floor with glow, arrowheads and flowing
   dots. Long or governance links fly as parabolic arcs (`arc:true`, height about 0.32 of the
   span, 0.9 to 4.2 units) with a faint dashed shadow on the floor. Dashed = read-only.
5. **Fading (measured with the user):** anything not in focus is faded hard: boxes 15%, arrows
   16.5%, boundaries 19%, labels about 33%. When a box is selected in View overview, the selected
   box is full strength, its direct neighbours are 75%, everything else is faded as above, and
   the hover tooltip is suppressed for the selected box.
6. **Text** is always HTML over the canvas (crisp, editable), never drawn into the bitmap.
7. **Verification:** screenshot the overview and every step at 1920x1080 and 1280x720, plus View
   overview with a box selected, 2D, full screen and light theme. Read them against sections 14
   and 11 before delivering.

## 17. Label size, model detail, and layout conventions (added with v4)

1. **Label size control (required).** The page has an A− / A+ control (keys `[` and `]`, also in the
   full-screen bar) that scales every label from 50% to 130% in 10% steps, shows "Label size NN%",
   and remembers the choice (localStorage, in try/catch). Label CSS is written in `em` inside the
   labels container, whose `font-size` is `calc(1rem * var(--ls))`, so text, padding, borders and
   the label box all shrink together. In 2D the arrow and boundary text and the box text follow
   the same factor. The label solver re-measures whenever the factor changes.
2. **Model detail.** Each 3D object should carry real detail, not just a block with an icon:
   people seated on chairs at desks with legs, arms, keyboard, mug and ID card; a standing person
   with tablet, podium, stack of documents and stamp; agent towers with feet, inset panel, LED
   strips, side vents, antenna, orb with two rings and an orbiting dot; server racks with rack
   ears, drive bays, status LEDs, fans on top and a connector with cable; monitors with a bezel,
   stand, camera dot, keyboard and mouse; a database as stacked drums with rings and LEDs; filing
   cabinets with drawers, label plates and handles; a tray with a rim, folders with tabs and a
   standing chart; a clock with bezel and bells and a calendar with binder rings; a cloud over a
   chip with traces, data streams and two side racks. Keep it lightweight (hundreds of boxes, not
   thousands) and verify at 1920x1080.
3. **Storage that holds files is one unit.** A controlled-storage area (for example CM) is ONE long
   unit built from abutting bays, each bay its own clickable box. Different file kinds (memory,
   skills) are the same text-file shape in different colors. Never draw files as computers.
4. **Right-hand column order = how the story flows.** Connected systems stack top to bottom in
   the order they are used and stay green (Jira, Confluence, a web app, ...). The gray read-only
   reference directories always sit at the very bottom right. If a system has no MCP server, its
   arrow runs straight from the agents through the gap in the MCP column rather than inventing
   a server.
