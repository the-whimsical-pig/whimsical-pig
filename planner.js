// Shadow Box Planner (planner.html). A step-by-step guide: what it's for, the box, flag,
// medals, rank & badges, patches & coins, photos, the plate, then arrange and send.
// Everything is drawn as SVG in inches × 10 at true size: items can't be stretched, and
// they can't leave the box. The box sizes, backgrounds and frames on offer come from the
// admin page (Shadow Box Planner tab); these lists are only the defaults.
(function () {
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const IN = 10, FRAME = 1.6 * IN, KEY = "whimsicalpig-plan2";

  // ---------- options (the shop can change these on the admin page) ----------
  let OPTIONS = {
    sizes: ["11x14", "12x16", "14x18", "16x20", "18x24", "20x24", "22x28", "24x30", "24x36"],
    backgrounds: [["Black velvet", "#1c1614"], ["Navy", "#1d2847"], ["Royal blue", "#1f4596"], ["Red", "#7d1c1c"], ["Forest green", "#1f4a2c"],
      ["Maroon", "#5a1d28"], ["Gray suede", "#555555"], ["Cream linen", "#ece5d3"], ["White suede", "#f3f2ed"]].map(([name, color]) => ({ name, color })),
    frames: [["Dark walnut", "#3b2416"], ["Black", "#161616"], ["Cherry", "#6b2318"], ["Oak", "#9c7040"], ["Gold", "#b8913a"], ["Silver", "#a3a8ae"]].map(([name, color]) => ({ name, color })),
  };
  function shade(hex, amt) {   // amt -1..1: darker..lighter
    const n = parseInt(String(hex).replace("#", ""), 16) || 0, c = [n >> 16, (n >> 8) & 255, n & 255];
    return "#" + c.map(v => Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt).toString(16).padStart(2, "0")).join("");
  }

  // ---------- the common choices ----------
  const PURPOSES = {
    "Retirement": "Congratulations on your retirement and thank you for your years of dedicated service.",
    "PCS / farewell": "Thank you for your leadership and friendship. You will be missed. Climb to Glory!",
    "Change of command": "With gratitude for your outstanding leadership while in command.",
    "In memory of": "In loving memory. Forever in our hearts.",
    "Promotion": "Congratulations on your well-deserved promotion.",
    "Something else": "",
  };
  const R = (...s) => s;   // ribbon: [color, width] pairs, close to the real thing
  const MEDALS = {
    "Bronze Star Medal": R(["#fff", 1], ["#b22234", 13], ["#fff", 1], ["#1f3a93", 5], ["#fff", 1], ["#b22234", 13], ["#fff", 1]),
    "Purple Heart": R(["#fff", 3], ["#5a1e78", 29], ["#fff", 3]),
    "Meritorious Service Medal": R(["#fff", 1], ["#8b1a2b", 8], ["#fff", 4], ["#8b1a2b", 9], ["#fff", 4], ["#8b1a2b", 8], ["#fff", 1]),
    "Army Commendation Medal": R(["#fff", 2], ["#1f6b3a", 7], ["#fff", 1], ["#1f6b3a", 3], ["#fff", 1], ["#1f6b3a", 3], ["#fff", 1], ["#1f6b3a", 3], ["#fff", 1], ["#1f6b3a", 7], ["#fff", 2]),
    "Army Achievement Medal": R(["#1f6b3a", 3], ["#fff", 2], ["#1f6b3a", 9], ["#fff", 2], ["#2a4b9b", 3], ["#fff", 2], ["#1f6b3a", 9], ["#fff", 2], ["#1f6b3a", 3]),
    "Army Good Conduct Medal": R(["#b22234", 4], ["#fff", 1], ["#b22234", 1], ["#fff", 1], ["#b22234", 21], ["#fff", 1], ["#b22234", 1], ["#fff", 1], ["#b22234", 4]),
    "National Defense Service Medal": R(["#b22234", 9], ["#fff", 1], ["#1f3a93", 1], ["#fff", 1], ["#b22234", 1], ["#f2c335", 9], ["#b22234", 1], ["#fff", 1], ["#1f3a93", 1], ["#fff", 1], ["#b22234", 9]),
    "Global War on Terrorism Service Medal": R(["#2a4b9b", 3], ["#fff", 1], ["#b22234", 3], ["#f2c335", 21], ["#b22234", 3], ["#fff", 1], ["#2a4b9b", 3]),
    "Afghanistan Campaign Medal": R(["#b22234", 3], ["#fff", 1], ["#111", 2], ["#fff", 1], ["#1f6b3a", 9], ["#fff", 1], ["#b22234", 1], ["#fff", 1], ["#1f6b3a", 9], ["#fff", 1], ["#111", 2], ["#fff", 1], ["#b22234", 3]),
    "Iraq Campaign Medal": R(["#b22234", 2], ["#fff", 1], ["#111", 2], ["#1f6b3a", 9], ["#fff", 2], ["#1f6b3a", 3], ["#fff", 2], ["#1f6b3a", 9], ["#111", 2], ["#fff", 1], ["#b22234", 2]),
    "Korea Defense Service Medal": R(["#1f6b3a", 3], ["#fff", 1], ["#f2c335", 27], ["#fff", 1], ["#1f6b3a", 3]),
    "Other medal": R(["#b22234", 7], ["#fff", 7], ["#1f3a93", 7], ["#fff", 7], ["#b22234", 7]),
  };
  const RIBBONS_ONLY = {
    "Army Service Ribbon": R(["#b22234", 5], ["#e8762c", 5], ["#f2c335", 5], ["#1f6b3a", 5], ["#2a4b9b", 5], ["#5a1e78", 5], ["#b22234", 5]),
    "Overseas Service Ribbon": R(["#1f3a93", 3], ["#f2c335", 4], ["#1f3a93", 3], ["#b22234", 15], ["#1f3a93", 3], ["#f2c335", 4], ["#1f3a93", 3]),
    "NCO Professional Development Ribbon": R(["#1f3a93", 4], ["#f2c335", 4], ["#1f6b3a", 19], ["#f2c335", 4], ["#1f3a93", 4]),
  };
  const RANKS = ["PFC", "SPC", "CPL", "SGT", "SSG", "SFC", "MSG", "1SG", "SGM", "CSM", "WO1", "CW2", "2LT", "1LT", "CPT", "MAJ", "LTC", "COL", "BG", "MG", "LTG", "GEN"];
  const BADGES = {   // name: [shape, width, height (inches)]
    "Combat Infantryman Badge": ["rifle", 3, 1.1], "Expert Infantryman Badge": ["rifle", 3, 0.9], "Combat Medical Badge": ["rifle", 2.6, 1.1],
    "Combat Action Badge": ["cab", 1.6, 1.6], "Parachutist Badge": ["wings", 1.55, 1.25], "Air Assault Badge": ["wings", 1.6, 1.3],
    "Expert Field Medical Badge": ["oval", 1.6, 1.1], "Drill Sergeant Badge": ["oval", 1.4, 1.4], "Driver & Mechanic Badge": ["oval", 1.3, 1.1],
    "Ranger Tab": ["tab", 2.4, 0.65], "Sapper Tab": ["tab", 2.4, 0.65],
  };
  const PATCHES = {   // name: [main color, accent, short words]
    "10th Mountain Division": ["#1f3a93", "#b22234", "10 MTN"], "82nd Airborne Division": ["#b22234", "#1f3a93", "AA"],
    "101st Airborne Division": ["#111", "#f3f2ed", "101"], "1st Cavalry Division": ["#f2c335", "#111", "1 CAV"],
    "3rd Infantry Division": ["#1f3a93", "#fff", "3 ID"], "4th Infantry Division": ["#556b2f", "#f3f2ed", "4 ID"],
    "25th Infantry Division": ["#b22234", "#f2c335", "25"], "1st Infantry Division": ["#556b2f", "#b22234", "1"],
    "U.S. flag patch": ["flag", "", ""], "Other unit patch": ["#3b5323", "#d8cfa0", "UNIT"],
  };
  const PHOTO_SIZES = { "4 × 6": [4, 6], "5 × 7": [5, 7], "8 × 10": [8, 10], "Wallet (2.5 × 3.5)": [2.5, 3.5] };
  const GUIDON_SIZES = { "5 × 7": [7, 5], "8 × 11": [11, 8], "10 × 14": [14, 10], "13 × 17": [17, 13], "15 × 21": [21, 15], "20 × 28": [28, 20] };
  const METALS = { Gold: ["#8a6a24", "#f0d27a"], Silver: ["#6f747b", "#e9ecef"], Bronze: ["#6b3f1d", "#c98b4d"], Black: ["#111", "#3a3a3a"] };

  // ---------- the plan (what they picked) ----------
  const blank = () => ({ step: 0, purpose: "", size: "16x20", wide: false, bg: "Black velvet", frame: "Dark walnut", flag: "none",
    medals: {}, rack: false, ribbons: {}, rank: "", badges: {}, patches: {}, coins: 0, coinText: "", dogtags: false, photos: [],
    plate: { on: true, metal: "Gold", width: "8", rankname: "", position: "", unit: "", from: "", to: "", message: "", quote: "" },
    extras: [], pos: {}, moved: false });
  let plan = load() || blank();
  function load() { try { const p = JSON.parse(localStorage.getItem(KEY) || "null"); return p ? { ...blank(), ...p, plate: { ...blank().plate, ...(p.plate || {}) } } : null; } catch (e) { return null; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(plan)); } catch (e) { msg("This browser couldn't save the plan (a photo may be too big)."); } }
  const msg = t => { $("pl-msg").textContent = t; };
  let undo = [];
  function remember() { undo.push(JSON.stringify(plan)); if (undo.length > 60) undo.shift(); $("pl-undo").disabled = false; }

  // ---------- items: what goes in the box, from the plan ----------
  // Each item: { key, kind, w, h (inches), o: drawing options, name (for the list) }
  function plateLines() {
    const p = plan.plate, out = [p.rankname, p.position, p.unit, p.from || p.to ? [p.from, p.to].filter(Boolean).join(" – ") : ""];
    const per = Math.max(18, +p.width * 7);   // letters per line on a plate this wide
    for (const part of [p.message, p.quote ? `“${p.quote}”` : ""]) {
      let line = "";
      for (const word of String(part || "").split(/\s+/).filter(Boolean)) {
        if ((line + " " + word).trim().length > per) { out.push(line); line = word; } else line = (line + " " + word).trim();
      }
      if (line) out.push(line);
    }
    return out.filter(Boolean).slice(0, 12);
  }
  function items() {
    const list = [];
    if (plan.flag !== "none") list.push({ key: "flag", kind: "flag", w: plan.flag === "burial" ? 22.5 : 15, h: plan.flag === "burial" ? 11.25 : 7.5, name: plan.flag === "burial" ? "Folded burial flag" : "Folded 3 × 5 flag" });
    const awards = [];
    for (const [m, n] of Object.entries(plan.medals)) for (let i = 0; i < n; i++) { list.push({ key: `medal:${m}:${i}`, kind: "medal", w: 1.45, h: 3.4, o: { ribbon: MEDALS[m], metal: /Bronze Star|Purple/.test(m) ? "Gold" : "Bronze" }, name: m }); if (!i) awards.push(MEDALS[m]); }
    for (const [r, on] of Object.entries(plan.ribbons)) if (on) awards.push(RIBBONS_ONLY[r]);
    if (plan.rack && awards.length) list.push({ key: "rack", kind: "rack", w: 1.375 * Math.min(3, awards.length), h: 0.375 * Math.ceil(awards.length / 3), o: { awards }, name: `Ribbon rack (${awards.length} ribbon${awards.length > 1 ? "s" : ""})` });
    if (plan.rank) list.push({ key: "rank", kind: "rank", ...rankSize(plan.rank), o: { rank: plan.rank }, name: `${plan.rank} rank` });
    for (const [b, on] of Object.entries(plan.badges)) if (on) { const [shape, w, h] = BADGES[b]; list.push({ key: `badge:${b}`, kind: "badge", w, h, o: { shape, name: b }, name: b }); }
    for (const [pt, n] of Object.entries(plan.patches)) for (let i = 0; i < n; i++) list.push({ key: `patch:${pt}:${i}`, kind: "patch", w: PATCHES[pt][0] === "flag" ? 3.5 : 2.3, h: PATCHES[pt][0] === "flag" ? 2 : 3, o: { spec: PATCHES[pt] }, name: pt });
    for (let i = 0; i < plan.coins; i++) list.push({ key: `coin:${i}`, kind: "coin", w: 1.75, h: 1.75, o: { text: plan.coinText }, name: "Coin" });
    if (plan.dogtags) list.push({ key: "dogtags", kind: "dogtags", w: 1.9, h: 2.3, name: "Dog tags" });
    for (const ph of plan.photos) { const [a, b] = PHOTO_SIZES[ph.size]; list.push({ key: `photo:${ph.id}`, kind: "photo", w: ph.wide ? b : a, h: ph.wide ? a : b, o: ph, name: `${ph.size} photo` }); }
    for (const x of plan.extras) {
      if (x.kind === "guidon") { const [w, h] = GUIDON_SIZES[x.size]; list.push({ key: `x:${x.id}`, kind: "guidon", w, h, o: x, name: `${x.size} guidon "${x.text}"` }); }
      if (x.kind === "certificate") list.push({ key: `x:${x.id}`, kind: "certificate", w: 8.5, h: 11, o: x, name: "Certificate (8.5 × 11)" });
      if (x.kind === "other") list.push({ key: `x:${x.id}`, kind: "other", w: +x.w || 4, h: +x.h || 4, o: x, name: `${x.text || "Other item"} (${x.w} × ${x.h} in)` });
    }
    const lines = plateLines();
    if (plan.plate.on && lines.length) list.push({ key: "plate", kind: "plate", w: +plan.plate.width, h: 0.5 + 0.36 * lines.length, o: { metal: plan.plate.metal, lines }, name: `${plan.plate.width}" ${plan.plate.metal.toLowerCase()} plate` });
    return list;
  }
  function rankSize(r) {
    if (/LT$|CPT|WO1|CW2/.test(r)) return { w: 1.1, h: /CPT/.test(r) ? 0.9 : 0.45 };
    if (/MAJ|LTC|COL/.test(r)) return { w: 1.2, h: 1.1 };
    if (/^(BG|MG|LTG|GEN)$/.test(r)) return { w: 0.6 * { BG: 1, MG: 2, LTG: 3, GEN: 4 }[r] + 0.1, h: 0.6 };
    return { w: 1.5, h: r === "SPC" ? 1.5 : 1.9 };
  }

  // ---------- where things go ----------
  const boxIn = () => { const [a, b] = plan.size.split("x").map(Number); return plan.wide ? [b, a] : [a, b]; };
  const turned = (it, r) => (r % 180 ? [it.h, it.w] : [it.w, it.h]);
  // Lay everything out in rows: flag, ribbon rack, medals, [rank & badges | photos | patches], coins & tags, extras, plate
  function autoArrange(list, box) {
    const [W, H] = box || boxIn(), pad = 0.8, gap = 0.5, pos = {};
    const rows = [];
    const take = test => list.filter(test);
    const flag = take(i => i.kind === "flag"), rack = take(i => i.kind === "rack"), medals = take(i => i.kind === "medal");
    const left = take(i => i.kind === "rank" || i.kind === "badge"), mid = take(i => i.kind === "photo"), right = take(i => i.kind === "patch");
    const small = take(i => i.kind === "coin" || i.kind === "dogtags"), extra = take(i => /guidon|certificate|other/.test(i.kind)), plate = take(i => i.kind === "plate");
    const flow = arr => {   // items side by side, wrapping onto more rows if needed
      const out = []; let row = [], w = 0;
      for (const it of arr) { if (row.length && w + it.w + gap > W - 2 * pad) { out.push(row); row = []; w = 0; } row.push(it); w += it.w + gap; }
      if (row.length) out.push(row);
      return out.map(r => ({ type: "row", items: r, h: Math.max(...r.map(i => i.h)) }));
    };
    if (flag.length) rows.push({ type: "row", items: flag, h: flag[0].h });
    rows.push(...flow(rack), ...flow(medals));
    // The middle band: photos in the center, rank & badges on the left, patches on the right.
    // Coins and dog tags go to whichever side has more room. Each side packs its items in little rows.
    const midW = mid.reduce((n, i) => n + i.w, 0) + Math.max(0, mid.length - 1) * gap;
    const colW = Math.max(2, (W - midW) / 2 - pad - gap);
    const pack = arr => { const out = []; let row = [], w = 0;
      for (const it of arr) { if (row.length && w + gap + it.w > colW) { out.push(row); row = []; w = 0; } w += (row.length ? gap : 0) + it.w; row.push(it); }
      if (row.length) out.push(row);
      return { rows: out, h: out.reduce((n, r) => n + Math.max(...r.map(i => i.h)), 0) + Math.max(0, out.length - 1) * gap * 0.6 }; };
    const sides = [left, right];
    for (const it of small) (pack(sides[0]).h <= pack(sides[1]).h ? sides[0] : sides[1]).push(it);
    if (left.length || mid.length || right.length)
      rows.push({ type: "cols", left: pack(left), right: pack(right), mid, midW, colW, h: Math.max(pack(left).h, pack(right).h, mid.length ? Math.max(...mid.map(i => i.h)) : 0) });
    rows.push(...flow(extra));
    if (plate.length) rows.push({ type: "row", items: plate, h: plate[0].h });
    const used = rows.reduce((n, r) => n + r.h, 0);
    const space = Math.max(0.25, (H - used) / (rows.length + 1));
    let y = space;
    for (const r of rows) {
      if (r.type === "row") {
        const total = r.items.reduce((n, i) => n + i.w, 0) + (r.items.length - 1) * gap;
        let x = (W - total) / 2;
        for (const it of r.items) { pos[it.key] = { x: x + it.w / 2, y: y + r.h / 2, r: 0 }; x += it.w + gap; }
      } else {
        const place = (col, cx) => { let yy = y + (r.h - col.h) / 2;
          for (const row of col.rows) { const rh = Math.max(...row.map(i => i.h)), rw = row.reduce((n, i) => n + i.w, 0) + (row.length - 1) * gap; let x = cx - rw / 2;
            for (const it of row) { pos[it.key] = { x: x + it.w / 2, y: yy + rh / 2, r: 0 }; x += it.w + gap; } yy += rh + gap * 0.6; } };
        const cx = r.mid.length ? (W - r.midW) / 4 : W * 0.25;
        place(r.left, cx); place(r.right, W - cx);
        const midW = r.midW;
        let x = (W - midW) / 2;
        for (const it of r.mid) { pos[it.key] = { x: x + it.w / 2, y: y + r.h / 2, r: 0 }; x += it.w + gap; }
      }
      y += r.h + space;
    }
    // It fits when nothing hangs outside the box or lands on top of something else
    return { pos, fits: used + 0.3 <= H && roomy(list, pos, W, H) };
  }
  // Nothing hangs outside the box or sits on top of something else
  function roomy(list, pos, W, H) {
    const rs = list.map(it => { const p = pos[it.key], [w, h] = turned(it, p.r || 0); return [p.x - w / 2, p.y - h / 2, p.x + w / 2, p.y + h / 2]; });
    if (!rs.every(r => r[0] >= 0.15 && r[1] >= 0.15 && r[2] <= W - 0.15 && r[3] <= H - 0.15)) return false;
    for (let i = 0; i < rs.length; i++) for (let j = i + 1; j < rs.length; j++) {
      const a = rs[i], b = rs[j];
      if (a[0] < b[2] - 0.05 && b[0] < a[2] - 0.05 && a[1] < b[3] - 0.05 && b[1] < a[3] - 0.05) return false;
    }
    return true;
  }
  // The smallest box on our list where everything fits without overlapping
  function bestSize(list) {
    const area = z => z.split("x").reduce((n, v) => n * v, 1);
    for (const z of [...OPTIONS.sizes].sort((a, b) => area(a) - area(b))) {
      const [a, b] = z.split("x").map(Number);
      for (const wide of a === b ? [false] : [plan.wide, !plan.wide]) if (autoArrange(list, wide ? [b, a] : [a, b]).fits) return { size: z, wide };
    }
    return null;
  }
  // Every item kept fully inside the box
  function clamp(it, p) {
    const [W, H] = boxIn().map(n => n - 0.4), [w0, h0] = turned(it, p.r || 0), w = w0, h = h0;
    p.x -= 0.2; p.y -= 0.2;   // keep a little gap from the edge of the box
    const done = q => { q.x += 0.2; q.y += 0.2; return q; };
    p.x = w > W ? W / 2 : Math.min(Math.max(p.x, w / 2), W - w / 2);
    p.y = h > H ? H / 2 : Math.min(Math.max(p.y, h / 2), H - h / 2);
    return done(p);
  }
  function placed() {
    const list = items(), auto = autoArrange(list);
    if (!plan.moved) plan.pos = {};
    for (const it of list) {
      it.p = clamp(it, { ...(auto.pos[it.key] || { x: boxIn()[0] / 2, y: boxIn()[1] / 2, r: 0 }), ...(plan.pos[it.key] || {}) });
      const [W, H] = boxIn(), [w, h] = turned(it, it.p.r);
      it.tooBig = w > W + 0.01 || h > H + 0.01;
    }
    const [W, H] = boxIn();
    return { list, fits: roomy(list, Object.fromEntries(list.map(i => [i.key, i.p])), W, H) };
  }

  // ---------- drawing ----------
  const svg = $("pl-svg");
  const ribbon = (x, y, w, h, stripes, edge) => {
    const total = stripes.reduce((n, s) => n + s[1], 0); let at = x;
    return stripes.map(([c, sw]) => { const ww = w * sw / total, r = `<rect x="${at}" y="${y}" width="${ww + 0.05}" height="${h}" fill="${c}"/>`; at += ww; return r; }).join("") +
      (edge ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="0.15"/>` : "");
  };
  function label(text, x, y, maxW, size, color, bold) {
    const t = String(text || ""), fit = Math.min(size, maxW / Math.max(1, t.length * 0.52));
    return `<text x="${x}" y="${y}" font-size="${fit}" fill="${color}" text-anchor="middle" dominant-baseline="central" font-family="Georgia, 'Times New Roman', serif"${bold ? ' font-weight="bold"' : ""}>${esc(t)}</text>`;
  }
  const starPts = (cx, cy, r) => [...Array(10)].map((_, i) => { const a = Math.PI / 5 * i - Math.PI / 2, rr = i % 2 ? r * 0.45 : r; return `${cx + rr * Math.cos(a)},${cy + rr * Math.sin(a)}`; }).join(" ");
  const DRAW = {
    flag: (w, h) => `<polygon points="${-w / 2},${h / 2} ${w / 2},${h / 2} 0,${-h / 2}" fill="#1f2a5c" stroke="#fff" stroke-width="${w * 0.012}"/>` +
      [...Array(4)].map((_, r) => [...Array(r + 1)].map((_, c) => `<polygon points="${starPts((c - r / 2) * w * 0.12, -h / 2 + h * (0.32 + r * 0.17), h * 0.045)}" fill="#fff"/>`).join("")).join("") +
      `<polygon points="${-w / 2},${h / 2} ${w / 2},${h / 2} 0,${-h / 2}" fill="none" stroke="#b22234" stroke-width="${w * 0.006}" transform="scale(0.97)"/>`,
    medal: (w, h, o) => ribbon(-w / 2, -h / 2, w, h * 0.42, o.ribbon) +
      `<rect x="${-w * 0.08}" y="${-h * 0.09}" width="${w * 0.16}" height="${h * 0.08}" fill="${METALS[o.metal][1]}"/>` +
      `<circle cx="0" cy="${h * 0.22}" r="${w * 0.48}" fill="url(#m-${o.metal})" stroke="${METALS[o.metal][0]}" stroke-width="${w * 0.04}"/>` +
      `<circle cx="0" cy="${h * 0.22}" r="${w * 0.28}" fill="none" stroke="${METALS[o.metal][0]}" stroke-width="${w * 0.03}" opacity=".7"/>`,
    rack: (w, h, o) => { const per = Math.min(3, o.awards.length), rw = w / per, rh = 0.375 * IN; let s = "";
      // like a real rack: the top row holds the leftovers, centered
      const n = o.awards.length, first = n % 3 || 3;
      o.awards.forEach((a, i) => { const row = i < first ? 0 : 1 + Math.floor((i - first) / 3), col = i < first ? i : (i - first) % 3, inRow = row ? 3 : first;
        s += ribbon(-inRow * rw / 2 + col * rw, -h / 2 + row * rh, rw, rh, a, true); });
      return s; },
    rank: (w, h, o) => rankDraw(w, h, o.rank),
    badge: (w, h, o) => badgeDraw(w, h, o.shape, o.name),
    patch: (w, h, o) => { const [main, accent, words] = o.spec;
      if (main === "flag") return `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" fill="#f3f2ed"/>` + [...Array(7)].map((_, i) => `<rect x="${-w / 2}" y="${-h / 2 + i * h / 6.5}" width="${w}" height="${h / 13}" fill="#b22234"/>`).join("") +
        `<rect x="${-w / 2}" y="${-h / 2}" width="${w * 0.42}" height="${h * 0.54}" fill="#2a3a7a"/><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" fill="none" stroke="#c9bf9a" stroke-width="${w * 0.03}"/>`;
      return `<path d="M${-w / 2},${-h / 2 + w * 0.15} Q${-w / 2},${-h / 2} ${-w / 2 + w * 0.15},${-h / 2} H${w / 2 - w * 0.15} Q${w / 2},${-h / 2} ${w / 2},${-h / 2 + w * 0.15} V${h * 0.2} Q${w / 2},${h / 2} 0,${h / 2} Q${-w / 2},${h / 2} ${-w / 2},${h * 0.2}Z" fill="${main}" stroke="${accent}" stroke-width="${w * 0.05}"/>` +
        `<circle cy="${-h * 0.05}" r="${w * 0.3}" fill="${accent}" opacity=".9"/>` + label(words, 0, -h * 0.05, w * 0.5, h * 0.16, main, true); },
    coin: (w, h, o) => `<circle r="${w / 2}" fill="url(#m-Gold)" stroke="${METALS.Gold[0]}" stroke-width="${w * 0.05}"/><circle r="${w * 0.38}" fill="none" stroke="${METALS.Gold[0]}" stroke-width="${w * 0.02}" stroke-dasharray="${w * 0.04} ${w * 0.03}"/>` +
      (o && o.text ? label(o.text, 0, 0, w * 0.6, h * 0.2, METALS.Gold[0], true) : ""),
    dogtags: (w, h) => [[-0.18, -0.12, -8], [0.12, 0.1, 6]].map(([dx, dy, r]) => `<g transform="translate(${w * dx} ${h * dy}) rotate(${r})"><rect x="${-w * 0.28}" y="${-h * 0.36}" width="${w * 0.56}" height="${h * 0.72}" rx="${w * 0.12}" fill="url(#m-Silver)" stroke="#6f747b" stroke-width="${w * 0.02}"/><circle cy="${-h * 0.27}" r="${w * 0.04}" fill="#555"/></g>`).join(""),
    photo: (w, h, o) => `<rect x="${-w / 2 - 1.5}" y="${-h / 2 - 1.5}" width="${w + 3}" height="${h + 3}" fill="#f4f1ea"/>` +
      (o.src ? `<image href="${o.src}" x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice"/>`
             : `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" fill="#9aa3ad"/><path d="M${-w * 0.35},${h * 0.3} L${-w * 0.1},${-h * 0.05} L${w * 0.08},${h * 0.15} L${w * 0.22},0 L${w * 0.38},${h * 0.3}Z" fill="#6b7682"/>` + label("Photo", 0, h * 0.4, w * 0.8, h * 0.08, "#fff")),
    plate: (w, h, o) => { const ink = o.metal === "Black" ? "#e3c46b" : "#1a1410", lh = 0.36 * IN;
      return `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="1.2" fill="url(#m-${o.metal})" stroke="${METALS[o.metal][0]}" stroke-width="0.5"/>` +
        `<rect x="${-w / 2 + 1.2}" y="${-h / 2 + 1.2}" width="${w - 2.4}" height="${h - 2.4}" rx="0.8" fill="none" stroke="${ink}" stroke-opacity=".35" stroke-width="0.2"/>` +
        o.lines.map((l, i) => label(l, 0, -h / 2 + 2.5 + (i + 0.5) * lh, w * 0.9, lh * 0.62, ink, i === 0)).join(""); },
    guidon: (w, h, o, key) => { const notch = w * 0.25, cid = "gc" + String(key).replace(/\W/g, "");
      return `<clipPath id="${cid}"><path d="M${-w / 2},${-h / 2} H${w / 2} L${w / 2 - notch},0 L${w / 2},${h / 2} H${-w / 2}Z"/></clipPath>` +
        `<g clip-path="url(#${cid})"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h / 2}" fill="${o.top}"/><rect x="${-w / 2}" y="0" width="${w}" height="${h / 2}" fill="${o.bottom}"/></g>` +
        `<path d="M${-w / 2},${-h / 2} H${w / 2} L${w / 2 - notch},0 L${w / 2},${h / 2} H${-w / 2}Z" fill="none" stroke="#d4a937" stroke-width="${w * 0.012}"/>` +
        label(o.text, -w * 0.08, -h * 0.25, w * 0.55, h * 0.16, o.bottom, true) + label(o.text, -w * 0.08, h * 0.25, w * 0.55, h * 0.16, o.top, true); },
    certificate: (w, h) => `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" fill="#faf7ee" stroke="#b9a571" stroke-width="${w * 0.02}"/>` +
      label("CERTIFICATE", 0, -h * 0.3, w * 0.7, h * 0.05, "#5a4a24", true) + [0, 1, 2, 3, 4].map(i => `<rect x="${-w * 0.32}" y="${-h * 0.12 + i * h * 0.07}" width="${w * 0.64}" height="${h * 0.012}" fill="#cfc6ad"/>`).join(""),
    other: (w, h, o) => `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="3" fill="#8a7f72" stroke="#d8cfc0" stroke-width="0.8" stroke-dasharray="3 2"/>` + label(o.text || "Item", 0, 0, w * 0.85, Math.min(h * 0.18, 8), "#fff", true),
  };
  function badgeDraw(w, h, shape, name) {
    const silver = "url(#m-Silver)";
    if (shape === "tab") { const black = name.startsWith("Ranger") ? ["#111", "#f2c335"] : ["#111", "#f3f2ed"];
      return `<path d="M${-w / 2},${h / 2} Q${-w / 2},${-h / 2} 0,${-h / 2} Q${w / 2},${-h / 2} ${w / 2},${h / 2}Z" fill="${black[0]}" stroke="${black[1]}" stroke-width="0.4"/>` + label(name.split(" ")[0].toUpperCase(), 0, h * 0.12, w * 0.8, h * 0.45, black[1], true); }
    if (shape === "rifle") return `<path d="M${-w / 2},${h * 0.3} Q0,${h * 0.8} ${w / 2},${h * 0.3}" fill="none" stroke="${silver}" stroke-width="${h * 0.14}"/>` +
      `<rect x="${-w * 0.42}" y="${-h * 0.32}" width="${w * 0.84}" height="${h * 0.34}" rx="${h * 0.05}" fill="${name.startsWith("Combat Medical") ? "#f3f2ed" : "#2a5ab0"}" stroke="${silver}" stroke-width="${h * 0.05}"/>` +
      `<rect x="${-w * 0.36}" y="${-h * 0.18}" width="${w * 0.72}" height="${h * 0.06}" fill="${silver}"/>`;
    if (shape === "wings") return `<path d="M${-w / 2},${-h * 0.05} Q${-w * 0.25},${-h / 2} 0,${-h * 0.15} Q${w * 0.25},${-h / 2} ${w / 2},${-h * 0.05} Q${w * 0.3},${h * 0.25} 0,${h * 0.1} Q${-w * 0.3},${h * 0.25} ${-w / 2},${-h * 0.05}Z" fill="${silver}" stroke="#6f747b" stroke-width="${w * 0.015}"/>` +
      `<path d="M0,${-h * 0.45} Q${w * 0.18},${-h * 0.2} 0,${h * 0.45} Q${-w * 0.18},${-h * 0.2} 0,${-h * 0.45}Z" fill="${silver}" stroke="#6f747b" stroke-width="${w * 0.015}"/>`;
    if (shape === "cab") return `<circle r="${w * 0.42}" fill="none" stroke="${silver}" stroke-width="${w * 0.08}"/><polygon points="${starPts(0, 0, w * 0.22)}" fill="${silver}"/>`;
    return `<ellipse rx="${w / 2}" ry="${h / 2}" fill="${silver}" stroke="#6f747b" stroke-width="${w * 0.02}"/>` + label(name.split(" ").map(s => s[0]).join(""), 0, 0, w * 0.6, h * 0.3, "#3a3f45", true);
  }
  function rankDraw(w, h, rank) {
    const gold = "url(#m-Gold)", silver = "url(#m-Silver)";
    if (/^(2LT|1LT)$/.test(rank)) return `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${h * 0.15}" fill="${rank === "2LT" ? gold : silver}"/>`;
    if (rank === "CPT") return [-0.27, 0.27].map(d => `<rect x="${-w / 2}" y="${h * d - h * 0.18}" width="${w}" height="${h * 0.36}" rx="${h * 0.06}" fill="${silver}"/>`).join("");
    if (/^(WO1|CW2)$/.test(rank)) return `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${h * 0.15}" fill="${silver}"/><rect x="${-w * 0.1}" y="${-h / 2}" width="${w * 0.2}" height="${h}" fill="#111"/>`;
    if (/^(MAJ|LTC)$/.test(rank)) return `<path d="M0,${-h / 2} C${w / 2},${-h * 0.3} ${w / 2},${h * 0.3} 0,${h / 2} C${-w / 2},${h * 0.3} ${-w / 2},${-h * 0.3} 0,${-h / 2}Z" fill="${rank === "MAJ" ? gold : silver}" stroke="#555" stroke-width="${w * 0.02}"/><path d="M0,${-h * 0.4} V${h * 0.45}" stroke="#555" stroke-width="${w * 0.02}"/>`;
    if (rank === "COL") return `<path d="M${-w / 2},${-h * 0.3} L0,${-h * 0.05} L${w / 2},${-h * 0.3} L${w * 0.15},${h * 0.2} L0,${h / 2} L${-w * 0.15},${h * 0.2}Z" fill="${silver}" stroke="#555" stroke-width="${w * 0.02}"/>`;
    const n = { BG: 1, MG: 2, LTG: 3, GEN: 4 }[rank];
    if (n) return [...Array(n)].map((_, i) => `<polygon points="${starPts((i - (n - 1) / 2) * 6, 0, h * 0.5)}" fill="${silver}"/>`).join("");
    if (rank === "SPC") return `<path d="M${-w * 0.35},${-h * 0.35} H${w * 0.35} V${h * 0.05} Q${w * 0.35},${h * 0.4} 0,${h * 0.48} Q${-w * 0.35},${h * 0.4} ${-w * 0.35},${h * 0.05}Z" fill="${gold}" stroke="#5a4512" stroke-width="${w * 0.03}"/><polygon points="${starPts(0, 0, h * 0.18)}" fill="#5a4512"/>`;
    const spec = { PFC: [1, 1], CPL: [2, 0], SGT: [3, 0], SSG: [3, 1], SFC: [3, 2], MSG: [3, 3], "1SG": [3, 3], SGM: [3, 3], CSM: [3, 3] }[rank] || [3, 1];
    let s = ""; const cw = w * 0.09, sp = cw * 1.8, depth = w * 0.26, top = -h / 2 + cw;
    const stripe = d => `<path d="${d}" fill="none" stroke="#5a4512" stroke-width="${cw * 1.35}" stroke-linecap="square"/><path d="${d}" fill="none" stroke="${gold}" stroke-width="${cw}" stroke-linecap="square"/>`;
    for (let i = 0; i < spec[0]; i++) { const y = top + i * sp; s += stripe(`M${-w / 2},${y + depth} L0,${y} L${w / 2},${y + depth}`); }
    const base = top + (spec[0] - 1) * sp + depth + cw * 1.3;
    for (let i = 0; i < spec[1]; i++) { const y = base + i * sp; s += stripe(`M${-w / 2},${y} Q0,${y + depth * 0.7} ${w / 2},${y}`); }
    const mid = top + (spec[0] - 1) * sp + depth * 0.95;
    if (rank === "1SG") s += `<polygon points="0,${mid - cw * 1.2} ${cw},${mid} 0,${mid + cw * 1.2} ${-cw},${mid}" fill="${gold}" stroke="#5a4512" stroke-width="${cw * 0.2}"/>`;
    if (/SGM|CSM/.test(rank)) s += `<polygon points="${starPts(0, mid, cw * 1.3)}" fill="${gold}" stroke="#5a4512" stroke-width="${cw * 0.2}"/>`;
    return s;
  }
  let selected = null;
  function render(forExport) {
    const [Wi, Hi] = boxIn(), W = Wi * IN, H = Hi * IN;
    const bg = OPTIONS.backgrounds.find(b => b.name === plan.bg) || OPTIONS.backgrounds[0], fr = OPTIONS.frames.find(f => f.name === plan.frame) || OPTIONS.frames[0];
    svg.setAttribute("viewBox", `${-FRAME} ${-FRAME} ${W + 2 * FRAME} ${H + 2 * FRAME}`);
    let s = `<defs>${Object.entries(METALS).map(([k, [a, b]]) => `<linearGradient id="m-${k}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${b}"/><stop offset=".55" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`).join("")}
      <radialGradient id="bg" cx=".45" cy=".35" r=".9"><stop offset="0" stop-color="${shade(bg.color, 0.12)}"/><stop offset="1" stop-color="${shade(bg.color, -0.25)}"/></radialGradient>
      <linearGradient id="fr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${shade(fr.color, 0.35)}"/><stop offset=".5" stop-color="${shade(fr.color, -0.2)}"/><stop offset="1" stop-color="${shade(fr.color, 0.35)}"/></linearGradient>
      <filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0.6" dy="1" stdDeviation="0.9" flood-opacity=".55"/></filter></defs>`;
    s += `<rect x="${-FRAME}" y="${-FRAME}" width="${W + 2 * FRAME}" height="${H + 2 * FRAME}" fill="url(#fr)"/>`;
    s += `<rect x="${-FRAME * 0.25}" y="${-FRAME * 0.25}" width="${W + FRAME * 0.5}" height="${H + FRAME * 0.5}" fill="none" stroke="#000" stroke-opacity=".45" stroke-width="${FRAME * 0.12}"/>`;
    s += `<rect width="${W}" height="${H}" fill="url(#bg)"/><rect width="${W}" height="${H}" fill="none" stroke="#000" stroke-opacity=".6" stroke-width="2.5"/>`;
    const { list, fits } = placed();
    for (const it of list) {
      const w = it.w * IN, h = it.h * IN;
      s += `<g data-key="${esc(it.key)}" class="pl-item" transform="translate(${it.p.x * IN} ${it.p.y * IN}) rotate(${it.p.r || 0})" filter="url(#sh)">${DRAW[it.kind](w, h, it.o || {}, it.key)}<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" fill="transparent"/></g>`;
      if (!forExport && (selected === it.key || it.tooBig)) s += `<g transform="translate(${it.p.x * IN} ${it.p.y * IN}) rotate(${it.p.r || 0})" pointer-events="none"><rect x="${-w / 2 - 2}" y="${-h / 2 - 2}" width="${w + 4}" height="${h + 4}" fill="none" stroke="${it.tooBig ? "#ff6b6b" : "#e7a3b8"}" stroke-width="1.2" stroke-dasharray="4 3"/></g>`;
    }
    if (!forExport) s += `<text x="${W / 2}" y="${H + FRAME * 0.62}" font-size="${FRAME * 0.42}" fill="#fff" fill-opacity=".75" text-anchor="middle" font-family="Lato, Arial, sans-serif">${esc(plan.size.replace("x", " × "))} in${plan.wide ? ", wide" : ""}</text>`;
    svg.innerHTML = s;
    const big = list.filter(i => i.tooBig).map(i => i.name), tip = !fits && list.length ? bestSize(list) : null;
    const same = tip && tip.size === plan.size && tip.wide === plan.wide;
    const offer = same ? ` <button type="button" class="link-btn" data-size="${tip.size}" data-wide="${tip.wide ? 1 : ""}">Arrange for me again</button>`
      : tip ? ` <button type="button" class="link-btn" data-size="${tip.size}" data-wide="${tip.wide ? 1 : ""}">Use ${tip.size.replace("x", " × ")}${tip.wide ? " wide" : tip.size === plan.size ? " tall" : ""}</button>` : "";
    $("pl-fit").innerHTML = big.length ? `${esc(big.join(", "))} won't fit in a ${plan.size.replace("x", " × ")} box.${offer || " Pick a bigger size."}`
      : !fits && list.length ? (same ? `Some things overlap.${offer}` : `Things are crowded in this box, so some overlap.${offer || " Try taking something out, or ask us about a bigger box."}`) : "";
    return list;
  }

  // ---------- the steps ----------
  const STEPS = [
    ["What's it for?", stepPurpose], ["The box", stepBox], ["Flag", stepFlag], ["Medals & ribbons", stepMedals], ["Rank & badges", stepRank],
    ["Patches, coins & more", stepPatches], ["Photos", stepPhotos], ["The plate", stepPlate], ["Arrange", stepArrange], ["Send it", stepSend],
  ];
  const stepper = n => `<div class="pl-qty"><button type="button" data-dec="${esc(n)}" aria-label="One fewer">−</button><span>QTY</span><button type="button" data-inc="${esc(n)}" aria-label="One more">+</button></div>`;
  function stepPurpose() {
    return `<p class="hint">This helps us suggest wording for the plate. You can change anything later.</p>
      <div class="pl-choices">${Object.keys(PURPOSES).map(k => `<button type="button" class="pl-choice${plan.purpose === k ? " on" : ""}" data-purpose="${esc(k)}">${esc(k)}</button>`).join("")}</div>`;
  }
  function stepBox() {
    return `<div class="pl-row"><label class="grow">Size (inches)<select data-f="size">${OPTIONS.sizes.map(z => `<option value="${z}"${z === plan.size ? " selected" : ""}>${z.replace("x", " × ")}</option>`).join("")}</select></label>
        <label class="check"><input type="checkbox" data-f="wide"${plan.wide ? " checked" : ""}> Wide (landscape)</label></div>
      <p class="sub">Background</p><div class="swatches">${OPTIONS.backgrounds.map(b => `<button type="button" class="swatch${b.name === plan.bg ? " on" : ""}" data-bg="${esc(b.name)}" style="background:radial-gradient(${shade(b.color, 0.15)},${shade(b.color, -0.2)})"><span>${esc(b.name)}</span></button>`).join("")}</div>
      <p class="sub">Frame</p><div class="swatches">${OPTIONS.frames.map(f => `<button type="button" class="swatch${f.name === plan.frame ? " on" : ""}" data-frame="${esc(f.name)}" style="background:linear-gradient(135deg,${shade(f.color, 0.35)},${shade(f.color, -0.2)},${shade(f.color, 0.35)})"><span>${esc(f.name)}</span></button>`).join("")}</div>
      <p class="hint">Not sure of the size? Pick one close; we'll help you choose before we build.</p>`;
  }
  function stepFlag() {
    return `<div class="pl-choices">${[["none", "No flag"], ["burial", "Folded burial flag (5 × 9½ ft)"], ["small", "Folded 3 × 5 ft flag"]].map(([v, t]) => `<button type="button" class="pl-choice${plan.flag === v ? " on" : ""}" data-flag="${v}">${t}</button>`).join("")}</div>
      <p class="hint">A folded burial flag is about 23 inches wide, so it needs a box at least 24 inches across.</p>`;
  }
  const countList = (obj, names, attr) => `<div class="pl-list">${names.map(n => `<div class="pl-line"><span>${esc(n)}</span>${stepper(n).replace(/data-(dec|inc)=/g, `data-${attr}-$1=`).replace("QTY", obj[n] || 0)}</div>`).join("")}</div>`;
  function stepMedals() {
    return `<p class="hint">Add each medal you have. Colors are close, not exact: we use your real medals.</p>${countList(plan.medals, Object.keys(MEDALS), "medal")}
      <p class="sub">Ribbons without a medal</p><div class="pl-list">${Object.keys(RIBBONS_ONLY).map(r => `<label class="pl-line check"><input type="checkbox" data-ribbon="${esc(r)}"${plan.ribbons[r] ? " checked" : ""}> ${esc(r)}</label>`).join("")}</div>
      <label class="pl-line check strong"><input type="checkbox" data-f="rack"${plan.rack ? " checked" : ""}> Add a ribbon rack with all of these ribbons</label>`;
  }
  function stepRank() {
    return `<label>Rank<select data-f="rank"><option value="">No rank</option>${RANKS.map(r => `<option${r === plan.rank ? " selected" : ""}>${r}</option>`).join("")}</select></label>
      <p class="sub">Badges & tabs</p><div class="pl-list">${Object.keys(BADGES).map(b => `<label class="pl-line check"><input type="checkbox" data-badge="${esc(b)}"${plan.badges[b] ? " checked" : ""}> ${esc(b)}</label>`).join("")}</div>`;
  }
  function stepPatches() {
    return `<p class="sub">Unit patches</p>${countList(plan.patches, Object.keys(PATCHES), "patch")}
      <p class="sub">Coins</p><div class="pl-line"><span>Challenge coins</span>${stepper("coins").replace("QTY", plan.coins)}</div>
      <label>Words on the coins (optional)<input data-f="coinText" value="${esc(plan.coinText)}" maxlength="12" placeholder="e.g. B CO"></label>
      <label class="pl-line check"><input type="checkbox" data-f="dogtags"${plan.dogtags ? " checked" : ""}> Dog tags</label>
      <p class="sub">Something else</p>
      <div class="pl-choices"><button type="button" class="pl-choice" data-extra="guidon">+ Guidon</button><button type="button" class="pl-choice" data-extra="certificate">+ Certificate (8.5 × 11)</button><button type="button" class="pl-choice" data-extra="other">+ Other item</button></div>
      ${plan.extras.map(x => `<div class="pl-extra" data-x="${x.id}"><b>${x.kind === "guidon" ? "Guidon" : x.kind === "certificate" ? "Certificate" : "Other item"}</b>
        ${x.kind === "guidon" ? `<label>Size<select data-xf="size">${Object.keys(GUIDON_SIZES).map(z => `<option${z === x.size ? " selected" : ""}>${z}</option>`).join("")}</select></label>
          <label>Unit on it<input data-xf="text" value="${esc(x.text)}" maxlength="16"></label><label>Top<input type="color" data-xf="top" value="${esc(x.top)}"></label><label>Bottom<input type="color" data-xf="bottom" value="${esc(x.bottom)}"></label>` : ""}
        ${x.kind === "other" ? `<label>What is it?<input data-xf="text" value="${esc(x.text)}" maxlength="30" placeholder="e.g. beret, knife, award"></label>
          <label>Width (in)<input type="number" min="1" max="40" step="0.5" data-xf="w" value="${esc(x.w)}"></label><label>Height (in)<input type="number" min="1" max="40" step="0.5" data-xf="h" value="${esc(x.h)}"></label>` : ""}
        <button type="button" class="link-btn del" data-xdel>Remove</button></div>`).join("")}`;
  }
  function stepPhotos() {
    return `<p class="hint">Add up to 4 photos. You'll still send the real photos (or we'll scan yours) for the finished piece.</p>
      ${plan.photos.map(ph => `<div class="pl-extra" data-ph="${ph.id}">${ph.src ? `<img src="${ph.src}" alt="">` : ""}<label>Print size<select data-pf="size">${Object.keys(PHOTO_SIZES).map(z => `<option${z === ph.size ? " selected" : ""}>${z}</option>`).join("")}</select></label>
        <label class="check"><input type="checkbox" data-pf="wide"${ph.wide ? " checked" : ""}> Sideways</label><button type="button" class="link-btn del" data-phdel>Remove</button></div>`).join("")}
      ${plan.photos.length < 4 ? `<label class="btn ghost sm file-btn">+ Add a photo<input type="file" accept="image/*" data-photo hidden></label>
        <button type="button" class="pl-choice" data-photo-blank>+ Space for a photo (add it later)</button>` : ""}`;
  }
  function stepPlate() {
    const p = plan.plate, idea = PURPOSES[plan.purpose] || "";
    return `<label class="pl-line check strong"><input type="checkbox" data-pl="on"${p.on ? " checked" : ""}> Add an engraved plate</label>
      ${p.on ? `<div class="pl-grid">
        <label>Plate<select data-pl="metal">${["Gold", "Silver", "Black"].map(m => `<option${m === p.metal ? " selected" : ""}>${m}</option>`).join("")}</select></label>
        <label>Width<select data-pl="width">${["4", "6", "8", "10", "12"].map(w => `<option value="${w}"${w === p.width ? " selected" : ""}>${w} in</option>`).join("")}</select></label>
        <label class="wide">Rank and name<input data-pl="rankname" value="${esc(p.rankname)}" maxlength="50" placeholder="${esc((plan.rank || "SSG") + " John A. Smith")}"></label>
        <label class="wide">Position or title<input data-pl="position" value="${esc(p.position)}" maxlength="50" placeholder="e.g. First Sergeant, or Hydra 6"></label>
        <label class="wide">Unit<input data-pl="unit" value="${esc(p.unit)}" maxlength="60" placeholder="e.g. B Co, 2-14 IN, 10th Mountain Division"></label>
        <label>From<input data-pl="from" value="${esc(p.from)}" maxlength="20" placeholder="e.g. 2006"></label>
        <label>To<input data-pl="to" value="${esc(p.to)}" maxlength="20" placeholder="e.g. 2026"></label>
        <label class="wide">A few words<textarea data-pl="message" rows="3" maxlength="300" placeholder="${esc(idea || "Thanks, accomplishments or well wishes")}">${esc(p.message)}</textarea></label>
        ${idea && !p.message ? `<button type="button" class="link-btn wide" data-use-idea>Use this: “${esc(idea)}”</button>` : ""}
        <label class="wide">Quote (optional)<input data-pl="quote" value="${esc(p.quote)}" maxlength="120" placeholder="A motto or a phrase they always said"></label></div>
        <p class="hint">We'll send you a proof of the wording before we engrave.</p>` : ""}`;
  }
  function stepArrange() {
    return `<p class="hint">We've laid everything out for you. Drag any item to move it (it stays inside the box). Tap an item to turn it or take it out.</p>
      <div class="pl-acts"><button type="button" class="btn ghost sm" data-auto>Arrange for Me Again</button></div>
      <div id="pl-sel"></div>`;
  }
  function stepSend() {
    return `<p id="pl-summary" class="summary">${esc(summary())}</p>
      <button class="btn" id="pl-order" type="button">Use This Plan in My Order</button>
      <button class="btn ghost" id="pl-download" type="button">Download Picture</button>
      <p class="hint">Your plan stays in this browser, so you can come back to it later.</p>`;
  }
  function drawStep() {
    const n = plan.step;
    $("pl-steps").innerHTML = STEPS.map(([t], i) => `<button type="button" class="${i === n ? "on" : i < n ? "done" : ""}" data-go="${i}" aria-current="${i === n}"><b>${i + 1}</b><span>${esc(t)}</span></button>`).join("");
    $("pl-step").innerHTML = `<span class="step">Step ${n + 1} of ${STEPS.length}</span><h2>${esc(STEPS[n][0])}</h2>${STEPS[n][1]()}`;
    $("pl-back").hidden = n === 0;
    $("pl-next").hidden = n === STEPS.length - 1;
    $("pl-next").textContent = n === STEPS.length - 2 ? "Finish" : "Next";
    if (n === 8) drawSel();
  }
  function drawSel() {
    const box = $("pl-sel"); if (!box) return;
    const it = render().find(i => i.key === selected);
    box.innerHTML = it ? `<div class="pl-extra"><b>${esc(it.name)}</b><button type="button" class="btn ghost sm" data-turn>Turn</button><button type="button" class="btn ghost sm del" data-remove>Take Out</button></div>` : "";
  }
  function update(step) { save(); render(); if (step) drawStep(); }

  // ---------- step inputs ----------
  const panel = $("pl-step");
  panel.addEventListener("click", async e => {
    const t = e.target.closest("button, [data-purpose]"); if (!t) return;
    const d = t.dataset;
    if (d.purpose) { remember(); plan.purpose = d.purpose; return update(true); }
    if (d.bg) { remember(); plan.bg = d.bg; return update(true); }
    if (d.frame) { remember(); plan.frame = d.frame; return update(true); }
    if (d.flag) { remember(); plan.flag = d.flag; if (d.flag !== "none" && !autoArrange(items()).fits) { const tip = bestSize(items()); if (tip) { plan.size = tip.size; plan.wide = tip.wide; msg(`We picked a ${tip.size.replace("x", " × ")} box so the flag fits. You can change it in step 2.`); } } return update(true); }
    for (const [attr, obj] of [["medalInc", "medals"], ["patchInc", "patches"]]) if (d[attr]) { remember(); plan[obj][d[attr]] = Math.min(12, (plan[obj][d[attr]] || 0) + 1); return update(true); }
    for (const [attr, obj] of [["medalDec", "medals"], ["patchDec", "patches"]]) if (d[attr]) { remember(); plan[obj][d[attr]] = Math.max(0, (plan[obj][d[attr]] || 0) - 1); if (!plan[obj][d[attr]]) delete plan[obj][d[attr]]; return update(true); }
    if (d.inc === "coins") { remember(); plan.coins = Math.min(12, plan.coins + 1); return update(true); }
    if (d.dec === "coins") { remember(); plan.coins = Math.max(0, plan.coins - 1); return update(true); }
    if (d.extra) { remember(); plan.extras.push(d.extra === "guidon" ? { id: Date.now(), kind: "guidon", size: "8 × 11", text: "B 2-14", top: "#c8102e", bottom: "#ffffff" }
      : d.extra === "certificate" ? { id: Date.now(), kind: "certificate" } : { id: Date.now(), kind: "other", text: "", w: "6", h: "4" }); return update(true); }
    if ("xdel" in d) { remember(); const id = +t.closest("[data-x]").dataset.x; plan.extras = plan.extras.filter(x => x.id !== id); return update(true); }
    if ("photoBlank" in d) { remember(); plan.photos.push({ id: Date.now(), size: "5 × 7", wide: false, src: "" }); return update(true); }
    if ("phdel" in d) { remember(); const id = +t.closest("[data-ph]").dataset.ph; plan.photos = plan.photos.filter(p => p.id !== id); return update(true); }
    if ("useIdea" in d) { remember(); plan.plate.message = PURPOSES[plan.purpose]; return update(true); }
    if ("auto" in d) { remember(); plan.moved = false; plan.pos = {}; selected = null; return update(true); }
    if ("turn" in d && selected) { remember(); const it = items().find(i => i.key === selected); const cur = plan.pos[selected] || (render().find(i => i.key === selected) || {}).p || {};
      plan.pos[selected] = { ...cur, r: ((cur.r || 0) + 90) % 360 }; plan.moved = true; save(); return drawSel(); }
    if ("remove" in d && selected) { remember(); takeOut(selected); selected = null; return update(true); }
    if (d.go !== undefined) { plan.step = +d.go; return update(true); }
  });
  panel.addEventListener("input", e => {
    const d = e.target.dataset, v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    if (!e.target.dataset.typing) { remember(); e.target.dataset.typing = "1"; }
    if (d.f) plan[d.f] = v;
    else if (d.ribbon) plan.ribbons[d.ribbon] = v;
    else if (d.badge) plan.badges[d.badge] = v;
    else if (d.pl) plan.plate[d.pl] = v;
    else if (d.xf) { const x = plan.extras.find(x => x.id === +e.target.closest("[data-x]").dataset.x); if (x) x[d.xf] = v; }
    else if (d.pf) { const p = plan.photos.find(p => p.id === +e.target.closest("[data-ph]").dataset.ph); if (p) p[d.pf] = v; }
    update(e.target.type === "checkbox" || e.target.tagName === "SELECT");
  });
  panel.addEventListener("change", async e => {
    delete e.target.dataset.typing;
    if (!("photo" in e.target.dataset)) return;
    const file = e.target.files[0]; if (!file) return;
    remember(); plan.photos.push({ id: Date.now(), size: "5 × 7", wide: false, src: await shrink(file, 900) }); update(true);
  });
  function takeOut(key) {
    const [kind, a, i] = key.split(":");
    if (kind === "flag") plan.flag = "none";
    if (kind === "medal") { plan.medals[a] = Math.max(0, (plan.medals[a] || 1) - 1); if (!plan.medals[a]) delete plan.medals[a]; }
    if (kind === "patch") { plan.patches[a] = Math.max(0, (plan.patches[a] || 1) - 1); if (!plan.patches[a]) delete plan.patches[a]; }
    if (kind === "rack") plan.rack = false;
    if (kind === "rank") plan.rank = "";
    if (kind === "badge") plan.badges[a] = false;
    if (kind === "coin") plan.coins = Math.max(0, plan.coins - 1);
    if (kind === "dogtags") plan.dogtags = false;
    if (kind === "photo") plan.photos = plan.photos.filter(p => String(p.id) !== a);
    if (kind === "x") plan.extras = plan.extras.filter(x => String(x.id) !== a);
    if (kind === "plate") plan.plate.on = false;
    delete plan.pos[key];
  }
  $("pl-fit").onclick = e => { const d = e.target.dataset; if (!d.size) return; remember(); plan.size = d.size; plan.wide = !!d.wide; plan.moved = false; plan.pos = {}; update(true); };
  $("pl-back").onclick = () => { plan.step = Math.max(0, plan.step - 1); update(true); };
  $("pl-next").onclick = () => { plan.step = Math.min(STEPS.length - 1, plan.step + 1); update(true); $("pl-step").scrollIntoView({ behavior: "smooth", block: "nearest" }); };
  $("pl-steps").onclick = e => { const b = e.target.closest("[data-go]"); if (b) { plan.step = +b.dataset.go; update(true); } };
  $("pl-undo").onclick = () => { if (!undo.length) return; plan = JSON.parse(undo.pop()); $("pl-undo").disabled = !undo.length; selected = null; update(true); };
  $("pl-clear").onclick = () => { if (!confirm("Start a new plan? This clears everything you've picked.")) return; remember(); plan = blank(); selected = null; update(true); };
  function shrink(file, max) {
    return new Promise(ok => {
      const url = URL.createObjectURL(file), img = new Image();
      img.onload = () => { const k = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement("canvas");
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url); ok(c.toDataURL("image/jpeg", 0.82)); };
      img.onerror = () => { URL.revokeObjectURL(url); ok(""); };
      img.src = url;
    });
  }

  // ---------- dragging (mouse and touch), always inside the box ----------
  let drag = null;
  const pt = e => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; const q = p.matrixTransform(svg.getScreenCTM().inverse()); return { x: q.x / IN, y: q.y / IN }; };
  svg.addEventListener("pointerdown", e => {
    const g = e.target.closest(".pl-item");
    if (!g) { selected = null; render(); drawSel(); return; }
    const it = render().find(i => i.key === g.dataset.key); if (!it) return;
    selected = it.key;
    if (plan.step !== 8) { plan.step = 8; drawStep(); }
    const p = pt(e); drag = { it, dx: p.x - it.p.x, dy: p.y - it.p.y, moved: false };
    svg.setPointerCapture(e.pointerId); e.preventDefault(); drawSel();
  });
  svg.addEventListener("pointermove", e => {
    if (!drag) return;
    if (!drag.moved) {
      remember(); drag.moved = true;
      // from now on, keep everything where it is (and this item where it's dragged)
      if (!plan.moved) { for (const i of render()) plan.pos[i.key] = { ...i.p }; plan.moved = true; }
    }
    const p = pt(e);
    plan.pos[drag.it.key] = clamp(drag.it, { ...(plan.pos[drag.it.key] || drag.it.p), x: p.x - drag.dx, y: p.y - drag.dy });
    render();
  });
  const endDrag = () => { if (drag) { drag = null; save(); drawSel(); } };
  svg.addEventListener("pointerup", endDrag); svg.addEventListener("pointercancel", endDrag);

  // ---------- what's in it, in words ----------
  function summary() {
    const list = items(), counts = {};
    for (const it of list) if (!/plate/.test(it.kind)) counts[it.name] = (counts[it.name] || 0) + 1;
    const things = Object.entries(counts).map(([n, c]) => c > 1 ? `${c} × ${n}` : n);
    const lines = plateLines();
    return `${plan.purpose ? plan.purpose + ". " : ""}${plan.size.replace("x", " × ")} in${plan.wide ? " (wide)" : ""} shadow box, ${plan.bg.toLowerCase()} background, ${plan.frame.toLowerCase()} frame.` +
      (things.length ? ` Items: ${things.join("; ")}.` : " No items yet.") +
      (plan.plate.on && lines.length ? ` ${plan.plate.width}" ${plan.plate.metal.toLowerCase()} plate: "${lines.join(" / ")}".` : "");
  }

  // ---------- finishing ----------
  async function picture() {
    const was = selected; selected = null; render(true);
    const [Wi, Hi] = boxIn(), scale = 6, cw = (Wi * IN + 2 * FRAME) * scale, ch = (Hi * IN + 2 * FRAME) * scale;
    const xml = new XMLSerializer().serializeToString(svg).replace(/^<svg/, `<svg width="${cw}" height="${ch}"`);
    selected = was; render();
    const img = new Image();
    await new Promise((ok, bad) => { img.onload = ok; img.onerror = bad; img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(xml); });
    const c = document.createElement("canvas"); c.width = cw; c.height = ch;
    c.getContext("2d").drawImage(img, 0, 0, cw, ch);
    return new Promise(ok => c.toBlob(ok, "image/jpeg", 0.9));
  }
  panel.addEventListener("click", async e => {
    if (e.target.id === "pl-download") {
      const blob = await picture(), a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = "my-shadow-box-plan.jpg"; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    }
    if (e.target.id === "pl-order") {
      const b = e.target; b.disabled = true; msg("Getting your plan ready…");
      try {
        const file = new File([await picture()], "shadow-box-plan.jpg", { type: "image/jpeg" });
        const db = await new Promise((ok, bad) => { const r = indexedDB.open("whimsicalpig-order", 1); r.onupgradeneeded = () => r.result.createObjectStore("files"); r.onsuccess = () => ok(r.result); r.onerror = () => bad(r.error); });
        const tx = db.transaction("files", "readwrite"); tx.objectStore("files").put([file], "plan");
        await new Promise((ok, bad) => { tx.oncomplete = ok; tx.onerror = () => bad(tx.error); }); db.close();
        const kinds = { rank: "Ranks", badge: "Badges", patch: "Patches", coin: "Coins", photo: "Photos", medal: "Ribbons / medals", rack: "Ribbons / medals", flag: "Folded flag" };
        const ticked = [...new Set(items().map(i => kinds[i.kind] ?? (/plate/.test(i.kind) ? "" : "Other")))].filter(Boolean);
        localStorage.setItem("whimsicalpig-plan-order", JSON.stringify({ at: Date.now(), text: summary(), items: ticked, frame: `${plan.bg} background, ${plan.frame} frame` }));
        location.href = "order.html?type=military&plan=1";
      } catch (err) { msg("Something went wrong getting your plan ready. Try Download Picture instead, and add it to your order."); b.disabled = false; }
    }
  });

  // The shop's own choices of sizes, backgrounds and frames (admin page → Shadow Box Planner)
  function useOptions(o) {
    if (!o) return;
    if (Array.isArray(o.sizes) && o.sizes.length) OPTIONS.sizes = o.sizes;
    if (Array.isArray(o.backgrounds) && o.backgrounds.length) OPTIONS.backgrounds = o.backgrounds;
    if (Array.isArray(o.frames) && o.frames.length) OPTIONS.frames = o.frames;
    if (!OPTIONS.sizes.includes(plan.size)) plan.size = OPTIONS.sizes.find(z => z === "16x20") || OPTIONS.sizes[0];
    if (!OPTIONS.backgrounds.some(b => b.name === plan.bg)) plan.bg = OPTIONS.backgrounds[0].name;
    if (!OPTIONS.frames.some(f => f.name === plan.frame)) plan.frame = OPTIONS.frames[0].name;
    update(true);
  }
  document.addEventListener("site-changes", e => useOptions(e.detail && e.detail.planner));
  if (typeof SITE_CHANGES !== "undefined" && SITE_CHANGES) useOptions(SITE_CHANGES.planner);
  update(true);
})();
