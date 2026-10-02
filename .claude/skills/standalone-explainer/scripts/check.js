// Offline check for a standalone explainer page.
// Usage: node check.js path/to/page.html [outDir]
// Opens the page from file:// in headless Chromium and reports console errors,
// any network request, and whether every step, edit/save and .txt import work.
// Saves screenshots at 1280x720, 1920x1080 and 768x1024 in dark and light.
const path = require("path"), fs = require("fs"), { execSync } = require("child_process");
let pw;
try { pw = require("playwright"); }
catch { pw = require(path.join(execSync("npm root -g").toString().trim(), "playwright")); }

(async () => {
  const file = path.resolve(process.argv[2] || "index.html");
  const out = path.resolve(process.argv[3] || "check-out");
  fs.mkdirSync(out, { recursive: true });
  const errors = [], network = [], notes = [];
  const browser = await pw.chromium.launch();
  const ctx = await browser.newContext({ acceptDownloads: true, viewport: { width: 1280, height: 720 } });
  const watch = p => {
    p.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
    p.on("pageerror", e => errors.push("Uncaught: " + e.message));
    p.on("request", r => { if (!/^(file|blob|data|about):/.test(r.url())) network.push(r.url()); });
  };
  const page = await ctx.newPage(); watch(page);
  await page.goto("file://" + file); await page.waitForTimeout(1200);

  const steps = await page.locator("#rail > *").count();
  notes.push(`steps in rail: ${steps}`);
  for (let i = 0; i < steps; i++) {
    const t = (await page.locator("#panel h2").first().textContent().catch(() => "")) || "";
    if (!t.trim()) notes.push(`step ${i + 1}: panel has no title`);
    await page.keyboard.press("ArrowRight"); await page.waitForTimeout(120);
  }
  await page.keyboard.press("Home"); await page.waitForTimeout(900);

  // Clipped node labels (SVG pages): text wider than its box.
  const clipped = await page.evaluate(() => [...document.querySelectorAll("svg .node")].flatMap(g => {
    const box = g.querySelector("rect")?.getBBox(); if (!box) return [];
    return [...g.querySelectorAll("text")].filter(t => { const b = t.getBBox(); return b.x + b.width > box.x + box.width - 4; }).map(t => t.textContent);
  }));
  if (clipped.length) notes.push("labels spilling out of their box: " + clipped.join(", "));

  // Edit, save a copy, reopen it.
  if (await page.locator("#bSave").count()) {
    await page.keyboard.press("e"); await page.waitForTimeout(150);
    const f = page.locator('[contenteditable][data-k="title"]');
    if (await f.count()) {
      await f.click(); await page.keyboard.press("End"); await page.keyboard.type(" CHECK");
      const [dl] = await Promise.all([page.waitForEvent("download"), page.keyboard.press("Control+s")]);
      const saved = path.join(out, "saved-copy.html"); await dl.saveAs(saved);
      const p2 = await ctx.newPage(); watch(p2); await p2.goto("file://" + saved); await p2.waitForTimeout(500);
      const t = await p2.locator("#panel h2").first().textContent();
      notes.push(/CHECK$/.test(t.trim()) ? "edit → save → reopen: OK" : `edit → save → reopen FAILED (title "${t}")`);
      // Import the saved text back as a .txt
      const txt = fs.readFileSync(saved, "utf8").match(/id="content">([\s\S]*?)<\/script>/)?.[1];
      if (txt && await p2.locator("#file").count()) {
        const tf = path.join(out, "roundtrip.txt"); fs.writeFileSync(tf, txt.replace(/^kicker = .*/m, "kicker = IMPORTED"));
        await p2.setInputFiles("#file", tf); await p2.waitForTimeout(300);
        notes.push((await p2.textContent("#kicker")).includes("IMPORTED") ? ".txt import: OK" : ".txt import FAILED");
      }
      await p2.close();
    }
    await page.keyboard.press("Escape"); await page.waitForTimeout(200);
  }

  for (const theme of ["dark", "light"]) {
    await page.evaluate(t => document.documentElement.dataset.theme = t, theme);
    for (const [w, h] of [[1280, 720], [1920, 1080], [768, 1024]]) {
      await page.setViewportSize({ width: w, height: h }); await page.waitForTimeout(900);
      await page.screenshot({ path: path.join(out, `${theme}-${w}x${h}.png`) });
    }
  }
  await browser.close();
  const kb = (fs.statSync(file).size / 1024).toFixed(1);
  console.log(`file: ${file} (${kb} KB)`);
  notes.forEach(n => console.log("- " + n));
  console.log(errors.length ? "CONSOLE ERRORS:\n  " + errors.join("\n  ") : "console errors: none");
  console.log(network.length ? "NETWORK REQUESTS (must be none):\n  " + network.join("\n  ") : "network requests: none");
  console.log(`screenshots: ${out}`);
  process.exit(errors.length || network.length ? 1 : 0);
})();
