// Shadow Box Planner (planner.html): lay out a shadow box, then send the picture and a
// list of what's in it with a Start an Order request. Everything is drawn as SVG in
// inches × 10, so items are true to size against the box. The plan is kept in this
// browser (localStorage) so a refresh doesn't lose it.
(function () {
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const IN = 10;                 // SVG units per inch
  const FRAME = 1.6 * IN;        // frame moulding width
  const KEY = "whimsicalpig-plan";

  // ---------- choices ----------
  const SIZES = ["11x14", "12x16", "14x18", "16x20", "18x24", "20x24", "22x28", "24x30", "24x36"];
  const BACKGROUNDS = {
    "Black velvet": ["#16110f", "#2a2421"], "Navy": ["#141d33", "#26355a"], "Royal blue": ["#173a86", "#2a56b3"],
    "Red": ["#6d1515", "#952424"], "Forest green": ["#173a22", "#28583a"], "Maroon": ["#4a1620", "#6a2431"],
    "Gray suede": ["#4a4a4a", "#626262"], "Cream linen": ["#e8e0cd", "#f4eee0"], "White suede": ["#ecebe6", "#fbfaf6"],
  };
  const FRAMES = {
    "Dark walnut": ["#2b1a10", "#5a3a24"], "Black": ["#0d0d0d", "#333"], "Cherry": ["#4c170f", "#8a3624"],
    "Oak": ["#7d5530", "#b9894f"], "Gold": ["#8a6a24", "#e3c46b"], "Silver": ["#7c8087", "#d7dadf"],
  };
  const RIBBONS = {
    "Red, white & blue": ["#b22234", "#fff", "#3c3b6e", "#fff", "#b22234"], "Purple & white (Purple Heart)": ["#fff", "#5a1e78", "#5a1e78", "#5a1e78", "#fff"],
    "Green & yellow": ["#1f6b3a", "#f2c335", "#1f6b3a", "#f2c335", "#1f6b3a"], "Red & yellow": ["#b22234", "#f2c335", "#b22234", "#f2c335", "#b22234"],
    "Blue & white": ["#2a4b9b", "#fff", "#2a4b9b", "#fff", "#2a4b9b"], "Black & gold": ["#111", "#d4a937", "#111", "#d4a937", "#111"],
    "Orange & blue": ["#d9661f", "#2a4b9b", "#d9661f", "#2a4b9b", "#d9661f"], "Maroon & white": ["#7a1c2b", "#fff", "#7a1c2b", "#fff", "#7a1c2b"],
  };
  const METALS = { Gold: ["#8a6a24", "#f0d27a"], Silver: ["#6f747b", "#e9ecef"], Bronze: ["#6b3f1d", "#c98b4d"], Black: ["#111", "#3a3a3a"] };
  const RANKS = ["PFC", "SPC", "CPL", "SGT", "SSG", "SFC", "MSG", "1SG", "SGM", "CSM", "2LT", "1LT", "CPT", "MAJ", "LTC", "COL", "BG", "MG", "LTG", "GEN", "WO1", "CW2"];
  const PHOTO_SIZES = { "4 × 6": [4, 6], "5 × 7": [5, 7], "8 × 10": [8, 10], "3 × 5": [3, 5], "Wallet (2.5 × 3.5)": [2.5, 3.5] };
  const GUIDON_SIZES = { "5 × 7": [7, 5], "8 × 11": [11, 8], "10 × 14": [14, 10], "13 × 17": [17, 13], "15 × 21": [21, 15], "20 × 28 (regulation)": [28, 20] };

  // Each kind of item: name, default options, size in inches, and how to draw it (centered on 0,0)
  const KINDS = {
    flag: { name: "Folded flag", opts: { size: "Burial flag (5 × 9.5 ft)" },
      size: o => o.size.startsWith("Burial") ? [22.5, 11.25] : [15, 7.5],
      draw: (w, h) => `<polygon points="${-w / 2},${h / 2} ${w / 2},${h / 2} 0,${-h / 2}" fill="#1f2a5c" stroke="#fff" stroke-width="${w * 0.012}"/>` +
        stars(w, h) + `<polygon points="${-w / 2},${h / 2} ${w / 2},${h / 2} 0,${-h / 2}" fill="none" stroke="#b22234" stroke-width="${w * 0.006}" transform="scale(0.97)"/>` },
    medal: { name: "Medal", opts: { ribbon: "Red, white & blue", metal: "Bronze" }, size: () => [1.45, 3.4],
      draw: (w, h, o) => ribbonStripes(-w / 2, -h / 2, w, h * 0.42, RIBBONS[o.ribbon]) +
        `<rect x="${-w * 0.08}" y="${-h * 0.09}" width="${w * 0.16}" height="${h * 0.08}" fill="${METALS[o.metal][1]}"/>` +
        `<circle cx="0" cy="${h * 0.22}" r="${w * 0.48}" fill="url(#m-${o.metal})" stroke="${METALS[o.metal][0]}" stroke-width="${w * 0.04}"/>` +
        `<circle cx="0" cy="${h * 0.22}" r="${w * 0.28}" fill="none" stroke="${METALS[o.metal][0]}" stroke-width="${w * 0.03}" opacity=".7"/>` },
    rack: { name: "Ribbon rack", opts: { rows: "2", per: "3" }, size: o => [1.375 * +o.per, 0.375 * +o.rows],
      draw: (w, h, o) => { let s = ""; const keys = Object.keys(RIBBONS); const rw = w / +o.per, rh = h / +o.rows;
        for (let r = 0; r < +o.rows; r++) for (let c = 0; c < +o.per; c++) s += ribbonStripes(-w / 2 + c * rw, -h / 2 + r * rh, rw, rh, RIBBONS[keys[(r * 3 + c) % keys.length]], true);
        return s; } },
    rank: { name: "Rank", opts: { rank: "SSG" }, size: o => /LT$|CPT|WO|CW/.test(o.rank) ? [1.1, 0.5] : /MAJ|LTC|COL/.test(o.rank) ? [1.2, 1.1] : /G$|GEN/.test(o.rank) ? [1.6, 0.45] : [1.5, 1.7],
      draw: (w, h, o) => rankDraw(w, h, o.rank) },
    badge: { name: "Badge or wings", opts: { metal: "Silver" }, size: () => [2.6, 0.9],
      draw: (w, h, o) => `<path d="M${-w / 2},${-h * 0.1} Q${-w * 0.25},${-h / 2} 0,${-h * 0.05} Q${w * 0.25},${-h / 2} ${w / 2},${-h * 0.1} Q${w * 0.3},${h * 0.3} 0,${h / 2} Q${-w * 0.3},${h * 0.3} ${-w / 2},${-h * 0.1}Z" fill="url(#m-${o.metal})" stroke="${METALS[o.metal][0]}" stroke-width="${w * 0.015}"/>` +
        `<rect x="${-w * 0.07}" y="${-h * 0.35}" width="${w * 0.14}" height="${h * 0.6}" rx="${w * 0.02}" fill="${METALS[o.metal][0]}"/>` },
    patch: { name: "Patch", opts: { color: "#3b5323", text: "PATCH" }, size: () => [2.3, 3],
      draw: (w, h, o) => `<path d="M${-w / 2},${-h / 2 + w * 0.15} Q${-w / 2},${-h / 2} ${-w / 2 + w * 0.15},${-h / 2} H${w / 2 - w * 0.15} Q${w / 2},${-h / 2} ${w / 2},${-h / 2 + w * 0.15} V${h * 0.2} Q${w / 2},${h / 2} 0,${h / 2} Q${-w / 2},${h / 2} ${-w / 2},${h * 0.2}Z" fill="${o.color}" stroke="#d8cfa0" stroke-width="${w * 0.04}"/>` +
        label(o.text, 0, 0, w * 0.8, h * 0.18, "#f3ead0") },
    coin: { name: "Coin", opts: { metal: "Gold", text: "" }, size: () => [1.75, 1.75],
      draw: (w, h, o) => `<circle r="${w / 2}" fill="url(#m-${o.metal})" stroke="${METALS[o.metal][0]}" stroke-width="${w * 0.05}"/><circle r="${w * 0.38}" fill="none" stroke="${METALS[o.metal][0]}" stroke-width="${w * 0.02}" stroke-dasharray="${w * 0.04} ${w * 0.03}"/>` +
        (o.text ? label(o.text, 0, 0, w * 0.6, h * 0.2, METALS[o.metal][0]) : "") },
    dogtags: { name: "Dog tags", opts: {}, size: () => [1.9, 2.3],
      draw: (w, h) => [[-0.18, -0.12, -8], [0.12, 0.1, 6]].map(([dx, dy, r]) => `<g transform="translate(${w * dx} ${h * dy}) rotate(${r})"><rect x="${-w * 0.28}" y="${-h * 0.36}" width="${w * 0.56}" height="${h * 0.72}" rx="${w * 0.12}" fill="url(#m-Silver)" stroke="#6f747b" stroke-width="${w * 0.02}"/><circle cy="${-h * 0.27}" r="${w * 0.04}" fill="#555"/></g>`).join("") },
    photo: { name: "Photo", opts: { size: "5 × 7", wide: false, src: "" }, size: o => { const [a, b] = PHOTO_SIZES[o.size]; return o.wide ? [b, a] : [a, b]; },
      draw: (w, h, o, it) => `<rect x="${-w / 2 - 0.15 * IN}" y="${-h / 2 - 0.15 * IN}" width="${w + 0.3 * IN}" height="${h + 0.3 * IN}" fill="#f4f1ea"/>` +
        (o.src ? `<image href="${o.src}" x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice"/>`
               : `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" fill="#9aa3ad"/><path d="M${-w * 0.35},${h * 0.3} L${-w * 0.1},${-h * 0.05} L${w * 0.08},${h * 0.15} L${w * 0.22},${0} L${w * 0.38},${h * 0.3}Z" fill="#6b7682"/><circle cx="${w * 0.2}" cy="${-h * 0.2}" r="${w * 0.08}" fill="#c9cfd6"/>` + label("Your photo", 0, h * 0.4, w * 0.8, h * 0.07, "#fff")) },
    plate: { name: "Engraved plate", opts: { metal: "Gold", width: "6", text: "SSG John A. Smith\n2006 – 2026" }, size: o => { const lines = Math.max(1, String(o.text).split("\n").length); return [+o.width, 0.55 + 0.42 * lines]; },
      draw: (w, h, o) => { const lines = String(o.text || " ").split("\n").slice(0, 6), ink = o.metal === "Black" ? "#e3c46b" : "#1a1410";
        return `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${0.12 * IN}" fill="url(#m-${o.metal})" stroke="${METALS[o.metal][0]}" stroke-width="${0.05 * IN}"/>` +
          `<rect x="${-w / 2 + 0.12 * IN}" y="${-h / 2 + 0.12 * IN}" width="${w - 0.24 * IN}" height="${h - 0.24 * IN}" rx="${0.08 * IN}" fill="none" stroke="${ink}" stroke-opacity=".35" stroke-width="${0.02 * IN}"/>` +
          lines.map((l, i) => label(l, 0, -h / 2 + 0.28 * IN + (i + 0.5) * 0.42 * IN, w * 0.88, 0.26 * IN, ink, i === 0)).join(""); } },
    guidon: { name: "Guidon", opts: { size: "8 × 11", top: "#c8102e", bottom: "#ffffff", text: "B 2-14" }, size: o => GUIDON_SIZES[o.size],
      draw: (w, h, o, it) => { const notch = w * 0.25, cid = "gclip" + (it ? it.id : 0);
        return `<clipPath id="${cid}"><path d="M${-w / 2},${-h / 2} H${w / 2} L${w / 2 - notch},0 L${w / 2},${h / 2} H${-w / 2}Z"/></clipPath>` +
          `<g clip-path="url(#${cid})"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h / 2}" fill="${o.top}"/><rect x="${-w / 2}" y="0" width="${w}" height="${h / 2}" fill="${o.bottom}"/></g>` +
          `<path d="M${-w / 2},${-h / 2} H${w / 2} L${w / 2 - notch},0 L${w / 2},${h / 2} H${-w / 2}Z" fill="none" stroke="#d4a937" stroke-width="${w * 0.012}"/>` +
          label(o.text, -w * 0.08, -h * 0.25, w * 0.55, h * 0.16, o.bottom) + label(o.text, -w * 0.08, h * 0.25, w * 0.55, h * 0.16, o.top); } },
    certificate: { name: "Certificate", opts: {}, size: () => [8.5, 11],
      draw: (w, h) => `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" fill="#faf7ee" stroke="#b9a571" stroke-width="${w * 0.02}"/>` +
        label("CERTIFICATE", 0, -h * 0.3, w * 0.7, h * 0.05, "#5a4a24", true) +
        [0, 1, 2, 3, 4].map(i => `<rect x="${-w * 0.32}" y="${-h * 0.12 + i * h * 0.07}" width="${w * 0.64}" height="${h * 0.012}" fill="#cfc6ad"/>`).join("") },
    text: { name: "Words", opts: { text: "Thank you for your service", color: "#e3c46b", height: "0.6" }, size: o => [Math.max(2, String(o.text).length * +o.height * 0.5), +o.height],
      draw: (w, h, o) => label(o.text, 0, 0, w, h * 0.75, o.color, true) },
  };
  const ADD_ORDER = ["flag", "medal", "rack", "rank", "badge", "patch", "coin", "dogtags", "photo", "plate", "guidon", "certificate", "text"];

  function label(text, x, y, maxW, size, color, bold) {
    const t = String(text || "");
    const fit = Math.min(size, maxW / Math.max(1, t.length * 0.55));
    return `<text x="${x}" y="${y}" font-size="${fit}" fill="${color}" text-anchor="middle" dominant-baseline="central" font-family="Georgia, 'Times New Roman', serif"${bold ? ' font-weight="bold"' : ""}>${esc(t)}</text>`;
  }
  function stars(w, h) {
    let s = "";
    for (let r = 0; r < 4; r++) for (let c = 0; c <= r; c++) {
      const y = -h / 2 + h * (0.32 + r * 0.17), x = (c - r / 2) * w * 0.12;
      s += `<polygon points="${starPts(x, y, h * 0.045)}" fill="#fff"/>`;
    }
    return s;
  }
  function starPts(cx, cy, r) {
    return [...Array(10)].map((_, i) => { const a = Math.PI / 5 * i - Math.PI / 2, rr = i % 2 ? r * 0.45 : r; return `${cx + rr * Math.cos(a)},${cy + rr * Math.sin(a)}`; }).join(" ");
  }
  function ribbonStripes(x, y, w, h, cols, edge) {
    const sw = w / cols.length;
    return cols.map((c, i) => `<rect x="${x + i * sw}" y="${y}" width="${sw + 0.05}" height="${h}" fill="${c}"/>`).join("") +
      (edge ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="0.15"/>` : "");
  }
  function rankDraw(w, h, rank) {
    const gold = "url(#m-Gold)", silver = "url(#m-Silver)";
    if (/^(2LT|1LT)$/.test(rank)) return `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${h * 0.15}" fill="${rank === "2LT" ? gold : silver}"/>`;
    if (rank === "CPT") return [-0.3, 0.3].map(d => `<rect x="${-w / 2}" y="${h * d - h * 0.22}" width="${w}" height="${h * 0.38}" rx="${h * 0.08}" fill="${silver}"/>`).join("");
    if (/^(WO1|CW2)$/.test(rank)) return `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${h * 0.15}" fill="${silver}"/><rect x="${-w * 0.1}" y="${-h / 2}" width="${w * 0.2}" height="${h}" fill="#111"/>`;
    if (/^(MAJ|LTC)$/.test(rank)) return `<path d="M0,${-h / 2} C${w / 2},${-h * 0.3} ${w / 2},${h * 0.3} 0,${h / 2} C${-w / 2},${h * 0.3} ${-w / 2},${-h * 0.3} 0,${-h / 2}Z" fill="${rank === "MAJ" ? gold : silver}" stroke="#555" stroke-width="${w * 0.02}"/><path d="M0,${-h * 0.4} V${h * 0.45}" stroke="#555" stroke-width="${w * 0.02}"/>`;
    if (rank === "COL") return `<path d="M${-w / 2},${-h * 0.3} L0,${-h * 0.05} L${w / 2},${-h * 0.3} L${w * 0.15},${h * 0.2} L0,${h / 2} L${-w * 0.15},${h * 0.2}Z" fill="${silver}" stroke="#555" stroke-width="${w * 0.02}"/>`;
    const n = { BG: 1, MG: 2, LTG: 3, GEN: 4 }[rank];
    if (n) return [...Array(n)].map((_, i) => `<polygon points="${starPts((i - (n - 1) / 2) * h * 1.05, 0, h * 0.5)}" fill="${silver}"/>`).join("");
    if (rank === "SPC") return `<path d="M${-w * 0.35},${-h * 0.35} H${w * 0.35} V${h * 0.05} Q${w * 0.35},${h * 0.4} 0,${h * 0.48} Q${-w * 0.35},${h * 0.4} ${-w * 0.35},${h * 0.05}Z" fill="${gold}" stroke="#5a4512" stroke-width="${w * 0.03}"/><polygon points="${starPts(0, 0, h * 0.18)}" fill="#5a4512"/>`;
    // enlisted chevrons and rockers
    const spec = { PFC: [1, 1], CPL: [2, 0], SGT: [3, 0], SSG: [3, 1], SFC: [3, 2], MSG: [3, 3], "1SG": [3, 3], SGM: [3, 3], CSM: [3, 3] }[rank] || [3, 1];
    // stripes stacked from the top: chevrons (points up), then rockers (curves) under them
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

  // ---------- state ----------
  let plan = load() || { size: "16x20", wide: false, bg: "Black velvet", frame: "Dark walnut", items: [] };
  let sel = null, undo = [];
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { return null; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(plan)); } catch (e) { $("pl-msg").textContent = "This browser couldn't save the plan (a photo may be too big)."; } }
  function remember() { undo.push(JSON.stringify(plan)); if (undo.length > 60) undo.shift(); $("pl-undo").disabled = false; }
  const boxWH = () => { const [a, b] = plan.size.split("x").map(Number); return plan.wide ? [b * IN, a * IN] : [a * IN, b * IN]; };
  const itemWH = it => KINDS[it.kind].size(it.opts).map(v => v * IN * it.s);
  let uid = Date.now();

  // ---------- drawing ----------
  const svg = $("pl-svg");
  function defs() {
    return `<defs>${Object.entries(METALS).map(([k, [a, b]]) => `<linearGradient id="m-${k}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${b}"/><stop offset=".55" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`).join("")}
      <radialGradient id="bg" cx=".45" cy=".35" r=".9"><stop offset="0" stop-color="${BACKGROUNDS[plan.bg][1]}"/><stop offset="1" stop-color="${BACKGROUNDS[plan.bg][0]}"/></radialGradient>
      <linearGradient id="fr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${FRAMES[plan.frame][1]}"/><stop offset=".5" stop-color="${FRAMES[plan.frame][0]}"/><stop offset="1" stop-color="${FRAMES[plan.frame][1]}"/></linearGradient>
      <filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0.6" dy="1" stdDeviation="0.9" flood-opacity=".55"/></filter></defs>`;
  }
  function render(forExport) {
    const [W, H] = boxWH();
    svg.setAttribute("viewBox", `${-FRAME} ${-FRAME} ${W + 2 * FRAME} ${H + 2 * FRAME}`);
    let s = defs();
    s += `<rect x="${-FRAME}" y="${-FRAME}" width="${W + 2 * FRAME}" height="${H + 2 * FRAME}" fill="url(#fr)"/>`;
    s += `<rect x="${-FRAME * 0.25}" y="${-FRAME * 0.25}" width="${W + FRAME * 0.5}" height="${H + FRAME * 0.5}" fill="none" stroke="#000" stroke-opacity=".45" stroke-width="${FRAME * 0.12}"/>`;
    s += `<rect x="0" y="0" width="${W}" height="${H}" fill="url(#bg)"/>`;
    s += `<rect x="0" y="0" width="${W}" height="${H}" fill="none" stroke="#000" stroke-opacity=".6" stroke-width="2.5"/>`;
    for (const it of plan.items) {
      const [w, h] = KINDS[it.kind].size(it.opts).map(v => v * IN);
      s += `<g data-id="${it.id}" class="pl-item" transform="translate(${it.x} ${it.y}) rotate(${it.r}) scale(${it.s})" filter="url(#sh)">${KINDS[it.kind].draw(w, h, it.opts, it)}` +
        `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" fill="transparent"/></g>`;
      if (!forExport && sel === it.id) {
        const [sw, shh] = itemWH(it);
        s += `<g transform="translate(${it.x} ${it.y}) rotate(${it.r})" pointer-events="none"><rect x="${-sw / 2 - 2}" y="${-shh / 2 - 2}" width="${sw + 4}" height="${shh + 4}" fill="none" stroke="#e7a3b8" stroke-width="1.2" stroke-dasharray="4 3"/></g>`;
      }
    }
    if (!forExport) s += `<text x="${W / 2}" y="${H + FRAME * 0.62}" font-size="${FRAME * 0.42}" fill="#fff" fill-opacity=".75" text-anchor="middle" font-family="Lato, Arial, sans-serif">${esc(plan.size.replace("x", " × "))} in${plan.wide ? ", wide" : ""}</text>`;
    svg.innerHTML = s;
  }

  // ---------- controls ----------
  function fillSelect(el, list, value) { el.innerHTML = list.map(v => `<option${v === value ? " selected" : ""}>${esc(v)}</option>`).join(""); }
  function drawBoxControls() {
    fillSelect($("pl-size"), SIZES.map(s => s.replace("x", " × ")), plan.size.replace("x", " × "));
    $("pl-wide").checked = plan.wide;
    $("pl-bgs").innerHTML = Object.entries(BACKGROUNDS).map(([k, [a, b]]) => `<button type="button" class="swatch${k === plan.bg ? " on" : ""}" data-bg="${esc(k)}" title="${esc(k)}" style="background:radial-gradient(${b},${a})"><span>${esc(k)}</span></button>`).join("");
    $("pl-frames").innerHTML = Object.entries(FRAMES).map(([k, [a, b]]) => `<button type="button" class="swatch${k === plan.frame ? " on" : ""}" data-frame="${esc(k)}" title="${esc(k)}" style="background:linear-gradient(135deg,${b},${a},${b})"><span>${esc(k)}</span></button>`).join("");
  }
  $("pl-add").innerHTML = ADD_ORDER.map(k => `<button type="button" class="btn ghost sm" data-add="${k}">+ ${esc(KINDS[k].name)}</button>`).join("");
  function drawItemControls() {
    const it = plan.items.find(i => i.id === sel), box = $("pl-item");
    if (!it) { box.innerHTML = '<p class="hint">Tap an item in the box to move it, resize it or change it. Drag items to place them.</p>'; return; }
    const o = it.opts, sel_ = (name, list, v) => `<label class="fld">${name}<select data-o="${esc(name.toLowerCase())}">${list.map(x => `<option${x === v ? " selected" : ""}>${esc(x)}</option>`).join("")}</select></label>`;
    let f = "";
    if (it.kind === "flag") f += sel_("Size", ["Burial flag (5 × 9.5 ft)", "Small flag (3 × 5 ft)"], o.size).replace('data-o="size"', 'data-o="size"');
    if (it.kind === "medal") f += sel_("Ribbon", Object.keys(RIBBONS), o.ribbon).replace('data-o="ribbon"', 'data-o="ribbon"') + sel_("Metal", ["Bronze", "Gold", "Silver"], o.metal).replace('data-o="metal"', 'data-o="metal"');
    if (it.kind === "rack") f += sel_("Rows", ["1", "2", "3", "4", "5", "6"], o.rows) + sel_("Per row", ["3", "4"], o.per).replace('data-o="per row"', 'data-o="per"');
    if (it.kind === "rank") f += sel_("Rank", RANKS, o.rank);
    if (/badge|coin/.test(it.kind)) f += sel_("Metal", ["Gold", "Silver", "Bronze"], o.metal);
    if (it.kind === "plate") f += sel_("Metal", ["Gold", "Silver", "Black"], o.metal) + sel_("Width (in)", ["4", "5", "6", "8", "10", "12"], o.width).replace('data-o="width (in)"', 'data-o="width"') +
      `<label class="fld wide">Plate wording (one line per row)<textarea data-o="text" rows="4" maxlength="400">${esc(o.text)}</textarea></label>`;
    if (/patch|coin|guidon|text/.test(it.kind)) f += `<label class="fld">${it.kind === "guidon" ? "Unit on the guidon" : it.kind === "coin" ? "Words on the coin (optional)" : "Words"}<input data-o="text" value="${esc(o.text)}" maxlength="${it.kind === "text" ? 80 : 24}"></label>`;
    if (it.kind === "patch") f += `<label class="fld">Patch color<input type="color" data-o="color" value="${esc(o.color)}"></label>`;
    if (it.kind === "guidon") f += sel_("Size", Object.keys(GUIDON_SIZES), o.size) + `<label class="fld">Top color<input type="color" data-o="top" value="${esc(o.top)}"></label><label class="fld">Bottom color<input type="color" data-o="bottom" value="${esc(o.bottom)}"></label>`;
    if (it.kind === "text") f += `<label class="fld">Color<input type="color" data-o="color" value="${esc(o.color)}"></label>` + sel_("Height (in)", ["0.4", "0.6", "0.8", "1", "1.5"], o.height).replace('data-o="height (in)"', 'data-o="height"');
    if (it.kind === "photo") f += sel_("Size", Object.keys(PHOTO_SIZES), o.size) + `<label class="fld check"><input type="checkbox" data-o="wide"${o.wide ? " checked" : ""}> Sideways</label>` +
      `<label class="btn ghost sm file-btn">${o.src ? "Change photo" : "Choose your photo"}<input type="file" accept="image/*" data-photo hidden></label>`;
    box.innerHTML = `<h3>${esc(KINDS[it.kind].name)}</h3><div class="pl-fields">${f}
      <label class="fld wide">Size <input type="range" data-s min="40" max="250" value="${Math.round(it.s * 100)}"></label>
      <label class="fld wide">Turn <input type="range" data-r min="-180" max="180" step="5" value="${it.r}"></label></div>
      <div class="pl-acts"><button type="button" class="btn ghost sm" data-act="dup">Copy</button><button type="button" class="btn ghost sm" data-act="front">To front</button>
        <button type="button" class="btn ghost sm" data-act="back">To back</button><button type="button" class="btn ghost sm del" data-act="del">Remove</button></div>`;
  }
  function refresh() { render(); drawItemControls(); save(); summary(); }

  $("pl-size").onchange = e => { remember(); plan.size = e.target.value.replace(" × ", "x"); keepInside(); refresh(); };
  $("pl-wide").onchange = e => { remember(); plan.wide = e.target.checked; keepInside(); refresh(); };
  $("pl-bgs").onclick = e => { const b = e.target.closest("[data-bg]"); if (!b) return; remember(); plan.bg = b.dataset.bg; drawBoxControls(); refresh(); };
  $("pl-frames").onclick = e => { const b = e.target.closest("[data-frame]"); if (!b) return; remember(); plan.frame = b.dataset.frame; drawBoxControls(); refresh(); };
  $("pl-add").onclick = e => {
    const k = e.target.dataset.add; if (!k) return;
    remember();
    const [W, H] = boxWH(), n = plan.items.length;
    const it = { id: ++uid, kind: k, x: W / 2 + ((n % 5) - 2) * 6, y: H / 2 + ((n % 3) - 1) * 6, s: 1, r: 0, opts: { ...KINDS[k].opts } };
    // a big item that won't fit starts smaller
    const [w, h] = itemWH(it); it.s = Math.min(1, (W * 0.9) / w, (H * 0.9) / h);
    plan.items.push(it); sel = it.id; refresh();
    if (k === "photo") setTimeout(() => { const f = $("pl-item").querySelector("[data-photo]"); if (f) f.click(); }, 50);
  };
  $("pl-item").addEventListener("input", e => {
    const it = plan.items.find(i => i.id === sel); if (!it) return;
    if (!e.target.dataset.typing) { remember(); e.target.dataset.typing = "1"; }
    if ("s" in e.target.dataset) it.s = +e.target.value / 100;
    else if ("r" in e.target.dataset) it.r = +e.target.value;
    else if (e.target.dataset.o) it.opts[e.target.dataset.o] = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    render(); save(); summary();
  });
  $("pl-item").addEventListener("change", e => { delete e.target.dataset.typing; if (e.target.tagName === "SELECT" || e.target.type === "checkbox") drawItemControls(); });
  $("pl-item").addEventListener("change", async e => {
    if (!("photo" in e.target.dataset)) return;
    const file = e.target.files[0]; if (!file) return;
    const it = plan.items.find(i => i.id === sel); if (!it) return;
    remember(); it.opts.src = await shrink(file, 900); refresh();
  });
  $("pl-item").addEventListener("click", e => {
    const a = e.target.dataset.act; if (!a) return;
    const i = plan.items.findIndex(x => x.id === sel); if (i < 0) return;
    remember();
    if (a === "del") { plan.items.splice(i, 1); sel = null; }
    if (a === "dup") { const c = JSON.parse(JSON.stringify(plan.items[i])); c.id = ++uid; c.x += 8; c.y += 8; plan.items.push(c); sel = c.id; }
    if (a === "front") plan.items.push(plan.items.splice(i, 1)[0]);
    if (a === "back") plan.items.unshift(plan.items.splice(i, 1)[0]);
    refresh();
  });
  $("pl-undo").onclick = () => { if (!undo.length) return; plan = JSON.parse(undo.pop()); $("pl-undo").disabled = !undo.length; sel = null; drawBoxControls(); refresh(); };
  $("pl-clear").onclick = () => { if (!confirm("Start a new plan? This clears the box.")) return; remember(); plan.items = []; sel = null; refresh(); };

  function keepInside() {
    const [W, H] = boxWH();
    for (const it of plan.items) { it.x = Math.min(Math.max(it.x, 0), W); it.y = Math.min(Math.max(it.y, 0), H); }
  }
  // A customer's photo, made small enough to keep in the browser
  function shrink(file, max) {
    return new Promise(ok => {
      const url = URL.createObjectURL(file), img = new Image();
      img.onload = () => { const k = Math.min(1, max / Math.max(img.width, img.height)); const c = document.createElement("canvas");
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url); ok(c.toDataURL("image/jpeg", 0.82)); };
      img.onerror = () => { URL.revokeObjectURL(url); ok(""); };
      img.src = url;
    });
  }

  // ---------- dragging (mouse and touch) ----------
  let drag = null;
  const pt = e => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); };
  svg.addEventListener("pointerdown", e => {
    const g = e.target.closest(".pl-item");
    if (!g) { sel = null; refresh(); return; }
    const it = plan.items.find(i => i.id === +g.dataset.id); if (!it) return;
    if (sel !== it.id) { sel = it.id; drawItemControls(); }
    const p = pt(e); drag = { it, dx: p.x - it.x, dy: p.y - it.y, moved: false };
    svg.setPointerCapture(e.pointerId); e.preventDefault();
  });
  svg.addEventListener("pointermove", e => {
    if (!drag) return;
    if (!drag.moved) { remember(); drag.moved = true; }
    const p = pt(e), [W, H] = boxWH();
    drag.it.x = Math.min(Math.max(p.x - drag.dx, 0), W); drag.it.y = Math.min(Math.max(p.y - drag.dy, 0), H);
    render();
  });
  const endDrag = () => { if (drag) { drag = null; save(); render(); } };
  svg.addEventListener("pointerup", endDrag); svg.addEventListener("pointercancel", endDrag);
  document.addEventListener("keydown", e => {
    const it = plan.items.find(i => i.id === sel); if (!it || /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
    const d = e.shiftKey ? 10 : 2, m = { ArrowLeft: [-d, 0], ArrowRight: [d, 0], ArrowUp: [0, -d], ArrowDown: [0, d] }[e.key];
    if (m) { e.preventDefault(); it.x += m[0]; it.y += m[1]; keepInside(); render(); save(); }
    if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); remember(); plan.items = plan.items.filter(i => i !== it); sel = null; refresh(); }
  });

  // ---------- what's in it, in words ----------
  function summary() {
    const count = {};
    for (const it of plan.items) count[it.kind] = (count[it.kind] || 0) + 1;
    const parts = [];
    for (const it of plan.items) {
      const o = it.opts;
      if (it.kind === "flag") parts.push(`Folded flag (${o.size.startsWith("Burial") ? "burial size" : "3 × 5 ft"})`);
      if (it.kind === "rank") parts.push(`${o.rank} rank`);
      if (it.kind === "rack") parts.push(`Ribbon rack (${o.rows} row${o.rows === "1" ? "" : "s"} of ${o.per})`);
      if (it.kind === "plate") parts.push(`${o.width}" ${o.metal.toLowerCase()} plate: "${String(o.text).replace(/\n/g, " / ")}"`);
      if (it.kind === "guidon") parts.push(`${o.size} guidon "${o.text}"`);
      if (it.kind === "photo") parts.push(`${o.size} photo${o.src ? " (theirs, in the picture)" : ""}`);
      if (it.kind === "text") parts.push(`Words: "${o.text}"`);
      if (it.kind === "patch" && o.text && o.text !== "PATCH") parts.push(`Patch "${o.text}"`);
    }
    const simple = { medal: "medal", badge: "badge", patch: "patch", coin: "coin", dogtags: "set of dog tags", certificate: "certificate" };
    for (const [k, word] of Object.entries(simple)) {
      const n = k === "patch" ? plan.items.filter(i => i.kind === "patch" && (!i.opts.text || i.opts.text === "PATCH")).length : count[k] || 0;
      if (n) parts.push(`${n} ${word}${n > 1 ? (word.endsWith("tags") ? "" : "s") : ""}`);
    }
    const text = `${plan.size.replace("x", " × ")} in${plan.wide ? " (wide)" : ""}, ${plan.bg.toLowerCase()} background, ${plan.frame.toLowerCase()} frame.` +
      (parts.length ? ` Items: ${parts.join("; ")}.` : " No items yet.");
    $("pl-summary").textContent = text;
    return text;
  }

  // ---------- finishing ----------
  async function picture() {
    render(true);
    const [W, H] = boxWH(), scale = 6;
    const xml = new XMLSerializer().serializeToString(svg).replace(/^<svg/, `<svg width="${(W + 2 * FRAME) * scale}" height="${(H + 2 * FRAME) * scale}"`);
    render();
    const img = new Image();
    const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(xml);
    await new Promise((ok, bad) => { img.onload = ok; img.onerror = bad; img.src = url; });
    const c = document.createElement("canvas");
    c.width = (W + 2 * FRAME) * scale; c.height = (H + 2 * FRAME) * scale;
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    return new Promise(ok => c.toBlob(ok, "image/jpeg", 0.9));
  }
  $("pl-download").onclick = async () => {
    const blob = await picture(), a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "my-shadow-box-plan.jpg"; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  };
  // Hand the plan to Start an Order: the picture joins the order's photos, the words go in the order
  $("pl-order").onclick = async () => {
    if (!plan.items.length && !confirm("Your box is empty. Start an order anyway?")) return;
    $("pl-order").disabled = true; $("pl-msg").textContent = "Getting your plan ready…";
    try {
      const blob = await picture();
      const file = new File([blob], "shadow-box-plan.jpg", { type: "image/jpeg" });
      const db = await new Promise((ok, bad) => { const r = indexedDB.open("whimsicalpig-order", 1); r.onupgradeneeded = () => r.result.createObjectStore("files"); r.onsuccess = () => ok(r.result); r.onerror = () => bad(r.error); });
      const tx = db.transaction("files", "readwrite"), store = tx.objectStore("files");
      store.put([file], "plan");
      await new Promise((ok, bad) => { tx.oncomplete = ok; tx.onerror = () => bad(tx.error); });
      db.close();
      const used = [...new Set(plan.items.map(i => ({ rank: "Ranks", badge: "Badges", patch: "Patches", coin: "Coins", photo: "Photos", medal: "Ribbons / medals", rack: "Ribbons / medals", flag: "Folded flag", plate: "", text: "" })[i.kind] ?? "Other"))].filter(Boolean);
      localStorage.setItem("whimsicalpig-plan-order", JSON.stringify({ at: Date.now(), text: summary(), items: used, frame: `${plan.bg} background, ${plan.frame} frame` }));
      location.href = "order.html?type=military&plan=1";
    } catch (e) { $("pl-msg").textContent = "Something went wrong getting your plan ready. Try Download Picture instead, and add it to your order."; $("pl-order").disabled = false; }
  };

  // Start with a sample layout the first time, so it's clear what this is
  if (!plan.items.length && !load()) {
    plan.size = "24x30";             // big enough for a burial flag at its real size
    const [W, H] = boxWH();
    plan.items = [
      { id: ++uid, kind: "flag", x: W / 2, y: H * 0.25, s: 1, r: 0, opts: { size: "Burial flag (5 × 9.5 ft)" } },
      { id: ++uid, kind: "rank", x: W * 0.2, y: H * 0.62, s: 1, r: 0, opts: { rank: "SSG" } },
      { id: ++uid, kind: "photo", x: W / 2, y: H * 0.64, s: 1, r: 0, opts: { size: "5 × 7", wide: false, src: "" } },
      { id: ++uid, kind: "medal", x: W * 0.8, y: H * 0.6, s: 1, r: 0, opts: { ribbon: "Purple & white (Purple Heart)", metal: "Gold" } },
      { id: ++uid, kind: "plate", x: W / 2, y: H * 0.9, s: 1, r: 0, opts: { metal: "Gold", width: "6", text: "SSG John A. Smith\n2006 – 2026" } },
    ];
  }
  drawBoxControls(); refresh();
})();
