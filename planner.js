// Shadow Box Planner (planner.html). Six short steps: start (shadow box or flat frame, from an
// idea or from scratch), size & colors, your items, the plate, arrange, send. Customers can skip
// to the end at any time. Everything is drawn as SVG in inches × 10 at true size: items can't be
// stretched, can't leave the box, and keep clear of its edge. Every choice comes from the admin
// page (Shadow Box Planner tab); planner-defaults.js is only the starting list.
(function () {
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const IN = 10, FRAME = 1.6 * IN, KEY = "whimsicalpig-plan4";
  const D = window.PLANNER_DEFAULTS;
  let OPT = JSON.parse(JSON.stringify(D));
  const KINDS = { shadowbox: "shadow box", frame: "frame" };

  // ---------- colors ----------
  function shade(hex, amt) {   // amt -1..1: darker..lighter
    const n = parseInt(String(hex).replace("#", ""), 16) || 0, c = [n >> 16, (n >> 8) & 255, n & 255];
    return "#" + c.map(v => Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt).toString(16).padStart(2, "0")).join("");
  }
  const light = hex => { const n = parseInt(String(hex).replace("#", ""), 16) || 0; return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255 > 0.55; };
  const ink = hex => light(hex) ? "#1a1410" : "#ffffff";

  // ---------- the plan ----------
  const blank = () => ({ step: 0, kind: "shadowbox", start: "", size: "16x20", wide: false, custom: false, cw: 16, ch: 20,
    bg: OPT.backgrounds[0].name, frame: OPT.frames[0].name, mat: "", matW: OPT.matWidths.includes("2") ? "2" : OPT.matWidths[0], picks: [],
    plate: { on: true, purpose: "", color: OPT.plateColors[0].name, width: OPT.plateWidths.includes("8") ? "8" : OPT.plateWidths[0], rankname: "", position: "", unit: "", from: "", to: "", message: "", quote: "" },
    notes: "", pos: {}, moved: false });
  let plan = load() || blank();
  function load() { try { const p = JSON.parse(localStorage.getItem(KEY) || "null"); return p ? { ...blank(), ...p, plate: { ...blank().plate, ...(p.plate || {}) } } : null; } catch (e) { return null; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(plan)); } catch (e) { msg("This browser couldn't save the plan (a photo may be too big)."); } }
  const msg = t => { $("pl-msg").textContent = t; };
  let undo = [];
  function remember() { undo.push(JSON.stringify(plan)); if (undo.length > 60) undo.shift(); $("pl-undo").disabled = false; }
  const uid = () => Date.now() * 1000 + Math.floor(Math.random() * 1000);
  // run fn with another plan in place (for the starter pictures)
  function withPlan(p, fn) { const keep = plan; plan = p; try { return fn(); } finally { plan = keep; } }

  // ---------- sizes ----------
  const outerIn = () => { if (plan.custom) return [+plan.cw || 16, +plan.ch || 20]; const [a, b] = plan.size.split("x").map(Number); return plan.wide ? [b, a] : [a, b]; };
  const matOff = () => plan.kind === "frame" && plan.mat ? Math.min(+plan.matW || 0, Math.min(...outerIn()) / 4) : 0;
  const boxIn = () => outerIn().map(n => Math.max(2, n - 2 * matOff()));   // where items can go
  const edge = () => Math.max(0, +OPT.edge || 0);
  const sizeName = () => { const [w, h] = outerIn(); return `${w} × ${h} in`; };

  // ---------- items: what goes in the box ----------
  const picUrl = id => id ? `/api/photo/${id}` : "";
  const sizeText = p => p.size === "custom" || !p.sizes[p.size] ? `${+p.w} × ${+p.h} in` : p.sizes[p.size].label;
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
    const list = plan.picks.filter(p => +p.w > 0 && +p.h > 0).map(p => ({
      key: "p" + p.id, cat: p.cat, shape: p.shape, w: Math.min(72, +p.w), h: Math.min(72, +p.h), color: p.color, words: p.words,
      pic: p.src || picUrl(p.photo), fit: p.src ? "slice" : "meet", name: `${p.name || "Item"} (${sizeText(p)})` }));
    const lines = plateLines(), pc = OPT.plateColors.find(c => c.name === plan.plate.color) || OPT.plateColors[0];
    if (plan.plate.on) {
      const show = lines.length ? lines : ["Your wording here"];
      list.push({ key: "plate", cat: "plate", shape: "plate", w: +plan.plate.width, h: 0.5 + 0.36 * Math.max(2, show.length), color: pc.color, lines: show, name: `${plan.plate.width}" ${pc.name.toLowerCase()} plate` });
    }
    return list;
  }

  // ---------- where things go ----------
  const turned = (it, r) => (r % 180 ? [it.h, it.w] : [it.w, it.h]);
  function autoArrange(list, box) {
    const [W, H] = box || boxIn(), tidy = bandLayout(list, W, H);
    if (tidy.fits) return tidy;
    const tight = packLayout(list, W, H);   // too full for neat rows: tuck smaller things in beside the big ones
    return tight.fits ? tight : tidy;
  }
  // Rows from the top: flags and big things, medals & ribbons, a middle band
  // [rank & badges | photos | patches] with coins and dog tags on whichever side has room,
  // other things, then the plate at the bottom.
  function bandLayout(list, W, H) {
    const pad = Math.max(edge(), 0.4), gap = 0.5, pos = {}, rows = [];
    const big = i => i.w > (W - 2 * pad) * 0.55 || i.w * i.h > 120;
    const take = test => list.filter(test);
    const top = take(i => i.cat === "flag" || (i.cat !== "plate" && big(i)));
    const medals = take(i => i.cat === "medal" && !big(i)), mid = take(i => i.cat === "photo" && !big(i));
    const left = take(i => (i.cat === "rank" || i.cat === "badge") && !big(i)), right = take(i => i.cat === "patch" && !big(i));
    const small = take(i => i.cat === "coin" && !big(i)), extra = take(i => !["flag", "medal", "photo", "rank", "badge", "patch", "coin", "plate"].includes(i.cat) && !big(i));
    const plate = take(i => i.cat === "plate");
    const flow = arr => {   // side by side, wrapping onto more rows if needed
      const out = []; let row = [], w = 0;
      for (const it of arr) { if (row.length && w + it.w + gap > W - 2 * pad) { out.push(row); row = []; w = 0; } row.push(it); w += it.w + gap; }
      if (row.length) out.push(row);
      return out.map(r => ({ type: "row", items: r, h: Math.max(...r.map(i => i.h)) }));
    };
    rows.push(...flow(top), ...flow(medals));
    const midW = mid.reduce((n, i) => n + i.w, 0) + Math.max(0, mid.length - 1) * gap;
    const colW = Math.max(2, (W - midW) / 2 - pad - gap);
    const pack = arr => { const out = []; let row = [], w = 0;
      for (const it of arr) { if (row.length && w + gap + it.w > colW) { out.push(row); row = []; w = 0; } w += (row.length ? gap : 0) + it.w; row.push(it); }
      if (row.length) out.push(row);
      return { rows: out, h: out.reduce((n, r) => n + Math.max(...r.map(i => i.h)), 0) + Math.max(0, out.length - 1) * gap * 0.6 }; };
    for (const it of small) (pack(left).h <= pack(right).h ? left : right).push(it);
    if (mid.length > 2 && !left.length && !right.length) rows.push(...flow(mid));
    else if (left.length || mid.length || right.length)
      rows.push({ type: "cols", left: pack(left), right: pack(right), mid, midW, h: Math.max(pack(left).h, pack(right).h, mid.length ? Math.max(...mid.map(i => i.h)) : 0) });
    rows.push(...flow(extra), ...flow(plate));
    const used = rows.reduce((n, r) => n + r.h, 0), room = H - 2 * pad;
    const space = Math.max(0.3, (room - used) / Math.max(1, rows.length - 1 + 0.6));
    let y = pad + Math.max(0, (room - used - space * (rows.length - 1)) / 2);
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
        place(r.left, Math.max(cx, pad + colW / 2)); place(r.right, W - Math.max(cx, pad + colW / 2));
        let x = (W - r.midW) / 2;
        for (const it of r.mid) { pos[it.key] = { x: x + it.w / 2, y: y + r.h / 2, r: 0 }; x += it.w + gap; }
      }
      y += r.h + space;
    }
    return { pos, fits: roomy(list, pos, W, H) };
  }
  // Fill the box from the top, putting each item in the highest, then leftmost, open spot;
  // biggest things first, the plate last. Then center the whole group in the box.
  function packLayout(list, W, H) {
    const pad = edge(), gap = 0.4, rs = [], pos = {};
    const order = [...list.filter(i => i.cat !== "plate")].sort((a, b) => b.w * b.h - a.w * a.h).concat(list.filter(i => i.cat === "plate"));
    const free = (x, y, w, h) => x >= pad - 1e-9 && y >= pad - 1e-9 && x + w <= W - pad + 1e-9 && y + h <= H - pad + 1e-9 && rs.every(r => x >= r[2] + gap || x + w + gap <= r[0] || y >= r[3] + gap || y + h + gap <= r[1]);
    for (const it of order) {
      const xs = [pad, ...rs.map(r => r[2] + gap)].sort((a, b) => a - b), ys = [pad, ...rs.map(r => r[3] + gap)].sort((a, b) => a - b);
      let spot = null;
      if (it.cat === "plate") { const x = (W - it.w) / 2, y = H - pad - it.h; if (free(x, y, it.w, it.h)) spot = [x, y]; }
      for (const y of ys) { if (spot) break; for (const x of xs) if (free(x, y, it.w, it.h)) { spot = [x, y]; break; } }
      if (!spot) return { pos, fits: false };
      rs.push([spot[0], spot[1], spot[0] + it.w, spot[1] + it.h]); pos[it.key] = { x: spot[0] + it.w / 2, y: spot[1] + it.h / 2, r: 0 };
    }
    const dx = (W - Math.max(...rs.map(r => r[2])) - Math.min(...rs.map(r => r[0]))) / 2;
    const plate = list.find(i => i.cat === "plate"), dy = plate ? 0 : (H - Math.max(...rs.map(r => r[3])) - Math.min(...rs.map(r => r[1]))) / 2;
    for (const k in pos) { pos[k].x += dx; pos[k].y += dy; }
    return { pos, fits: roomy(list, pos, W, H) };
  }
  // Everything keeps clear of the edge, and nothing sits on top of something else
  function roomy(list, pos, W, H) {
    const m = edge() - 0.01;
    if (list.some(it => !pos[it.key])) return false;
    const rs = list.map(it => { const p = pos[it.key], [w, h] = turned(it, p.r || 0); return [p.x - w / 2, p.y - h / 2, p.x + w / 2, p.y + h / 2]; });
    if (!rs.every(r => r[0] >= m && r[1] >= m && r[2] <= W - m && r[3] <= H - m)) return false;
    for (let i = 0; i < rs.length; i++) for (let j = i + 1; j < rs.length; j++) {
      const a = rs[i], b = rs[j];
      if (a[0] < b[2] - 0.05 && b[0] < a[2] - 0.05 && a[1] < b[3] - 0.05 && b[1] < a[3] - 0.05) return false;
    }
    return true;
  }
  // The smallest size on the shop's list where everything fits (a mat makes the opening smaller)
  let bestMemo = {};
  function bestSize(list) {
    const sig = JSON.stringify([list.map(i => [i.cat, i.w, i.h]), OPT.sizes, plan.wide, plan.kind, plan.mat, plan.matW, OPT.edge]);
    if (!(sig in bestMemo)) bestMemo = { [sig]: findSize(list) };
    return bestMemo[sig];
  }
  function findSize(list) {
    const area = z => z.split("x").reduce((n, v) => n * v, 1), m = plan.kind === "frame" && plan.mat ? 2 * (+plan.matW || 0) : 0;
    for (const z of [...OPT.sizes].sort((a, b) => area(a) - area(b))) {
      const [a, b] = z.split("x").map(Number);
      for (const wide of a === b ? [false] : [plan.wide, !plan.wide]) if (autoArrange(list, (wide ? [b, a] : [a, b]).map(n => n - m)).fits) return { size: z, wide };
    }
    return null;
  }
  // Keep an item fully inside the box and clear of its edge
  function clamp(it, p) {
    const [W, H] = boxIn(), m = edge(), [w, h] = turned(it, p.r || 0);
    p.x = w > W - 2 * m ? W / 2 : Math.min(Math.max(p.x, m + w / 2), W - m - w / 2);
    p.y = h > H - 2 * m ? H / 2 : Math.min(Math.max(p.y, m + h / 2), H - m - h / 2);
    return p;
  }
  function placed() {
    const list = items(), auto = autoArrange(list), [W, H] = boxIn(), m = edge();
    if (!plan.moved) plan.pos = {};
    for (const it of list) {
      it.p = clamp(it, { ...(auto.pos[it.key] || { x: W / 2, y: H / 2, r: 0 }), ...(plan.pos[it.key] || {}) });
      const [w, h] = turned(it, it.p.r);
      it.tooBig = w > W - 2 * m + 0.01 || h > H - 2 * m + 0.01;
    }
    return { list, fits: roomy(list, Object.fromEntries(list.map(i => [i.key, i.p])), W, H) };
  }

  // ---------- drawing ----------
  const svg = $("pl-svg");
  function label(text, x, y, maxW, size, color, bold) {
    const t = String(text || ""), fit = Math.min(size, maxW / Math.max(1, t.length * 0.52));
    return `<text x="${x}" y="${y}" font-size="${fit}" fill="${color}" text-anchor="middle" dominant-baseline="central" font-family="Georgia, 'Times New Roman', serif"${bold ? ' font-weight="bold"' : ""}>${esc(t)}</text>`;
  }
  const starPts = (cx, cy, r) => [...Array(10)].map((_, i) => { const a = Math.PI / 5 * i - Math.PI / 2, rr = i % 2 ? r * 0.45 : r; return `${cx + rr * Math.cos(a)},${cy + rr * Math.sin(a)}`; }).join(" ");
  const stripes = (x, y, w, h, c) => { const parts = [["#fff", 1], [c, 6], ["#fff", 1], [shade(c, 0.45), 3], ["#fff", 1], [c, 6], ["#fff", 1]], total = 19; let at = 0;
    return parts.map(([col, sw]) => { const r = `<rect x="${x + w * at / total}" y="${y}" width="${w * sw / total + 0.05}" height="${h}" fill="${col}"/>`; at += sw; return r; }).join(""); };
  // How each kind of plain item is drawn: w, h in drawing units, c its color, g a sheen made from it
  const SHAPES = {
    rect: (w, h, c, g) => `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" fill="${g}" stroke="${shade(c, -0.35)}" stroke-width="${Math.min(w, h) * 0.03}"/>`,
    rounded: (w, h, c, g) => `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${Math.min(w, h) * 0.2}" fill="${g}" stroke="${shade(c, -0.35)}" stroke-width="${Math.min(w, h) * 0.04}"/>`,
    circle: (w, h, c, g) => `<ellipse rx="${w / 2}" ry="${h / 2}" fill="${g}" stroke="${shade(c, -0.4)}" stroke-width="${w * 0.05}"/><ellipse rx="${w * 0.38}" ry="${h * 0.38}" fill="none" stroke="${shade(c, -0.4)}" stroke-width="${w * 0.02}" stroke-dasharray="${w * 0.04} ${w * 0.03}"/>`,
    oval: (w, h, c, g) => `<ellipse rx="${w / 2}" ry="${h / 2}" fill="${g}" stroke="${shade(c, -0.35)}" stroke-width="${Math.min(w, h) * 0.03}"/>`,
    triangle: (w, h, c) => `<polygon points="${-w / 2},${h / 2} ${w / 2},${h / 2} 0,${-h / 2}" fill="${c}" stroke="#fff" stroke-width="${w * 0.012}"/>` +
      [...Array(4)].map((_, r) => [...Array(r + 1)].map((_, k) => `<polygon points="${starPts((k - r / 2) * w * 0.12, -h / 2 + h * (0.32 + r * 0.17), h * 0.045)}" fill="#fff"/>`).join("")).join("") +
      `<polygon points="${-w / 2},${h / 2} ${w / 2},${h / 2} 0,${-h / 2}" fill="none" stroke="#b22234" stroke-width="${w * 0.006}" transform="scale(0.97)"/>`,
    openflag: (w, h, c) => [...Array(13)].map((_, i) => `<rect x="${-w / 2}" y="${-h / 2 + i * h / 13}" width="${w}" height="${h / 13 + 0.05}" fill="${i % 2 ? "#f3f2ed" : c}"/>`).join("") +
      `<rect x="${-w / 2}" y="${-h / 2}" width="${w * 0.4}" height="${h * 7 / 13}" fill="#2a3a7a"/>` +
      [...Array(5)].map((_, r) => [...Array(6)].map((_, k) => `<polygon points="${starPts(-w / 2 + w * 0.4 * (k + 0.5) / 6, -h / 2 + h * 7 / 13 * (r + 0.5) / 5, h * 0.022)}" fill="#fff"/>`).join("")).join(""),
    shield: (w, h, c, g) => `<path d="M${-w / 2},${-h / 2 + w * 0.15} Q${-w / 2},${-h / 2} ${-w / 2 + w * 0.15},${-h / 2} H${w / 2 - w * 0.15} Q${w / 2},${-h / 2} ${w / 2},${-h / 2 + w * 0.15} V${h * 0.2} Q${w / 2},${h / 2} 0,${h / 2} Q${-w / 2},${h / 2} ${-w / 2},${h * 0.2}Z" fill="${g}" stroke="${shade(c, 0.5)}" stroke-width="${w * 0.05}"/>`,
    medal: (w, h, c) => stripes(-w / 2, -h / 2, w, h * 0.42, c) +
      `<rect x="${-w * 0.08}" y="${-h * 0.09}" width="${w * 0.16}" height="${h * 0.08}" fill="#e9d38c"/>` +
      `<circle cy="${h * 0.22}" r="${w * 0.48}" fill="url(#metal)" stroke="#8a6a24" stroke-width="${w * 0.04}"/><circle cy="${h * 0.22}" r="${w * 0.28}" fill="none" stroke="#8a6a24" stroke-width="${w * 0.03}" opacity=".7"/>`,
    ribbon: (w, h, c) => { const rows = Math.max(1, Math.round(h / 3.75)), per = Math.max(1, Math.round(w / 13.75)), rw = w / per, rh = h / rows; let s = "";
      for (let r = 0; r < rows; r++) for (let k = 0; k < per; k++) s += stripes(-w / 2 + k * rw, -h / 2 + r * rh, rw, rh, (k + r) % 2 ? shade(c, -0.25) : c) + `<rect x="${-w / 2 + k * rw}" y="${-h / 2 + r * rh}" width="${rw}" height="${rh}" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="0.15"/>`;
      return s; },
    chevron: (w, h, c) => { let s = ""; const cw = w * 0.09, sp = cw * 1.8, depth = w * 0.26, top = -h / 2 + cw;
      const line = d => `<path d="${d}" fill="none" stroke="${shade(c, -0.55)}" stroke-width="${cw * 1.35}"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${cw}"/>`;
      for (let i = 0; i < 3; i++) { const y = top + i * sp; s += line(`M${-w / 2},${y + depth} L0,${y} L${w / 2},${y + depth}`); }
      const base = top + 2 * sp + depth + cw * 1.3; s += line(`M${-w / 2},${base} Q0,${base + depth * 0.7} ${w / 2},${base}`); return s; },
    tab: (w, h, c) => `<path d="M${-w / 2},${h / 2} Q${-w / 2},${-h / 2} 0,${-h / 2} Q${w / 2},${-h / 2} ${w / 2},${h / 2}Z" fill="${c}" stroke="${shade(c, 0.6)}" stroke-width="0.4"/>`,
    pennant: (w, h, c, g, key) => { const notch = w * 0.25, cid = "cl" + key;
      return `<clipPath id="${cid}"><path d="M${-w / 2},${-h / 2} H${w / 2} L${w / 2 - notch},0 L${w / 2},${h / 2} H${-w / 2}Z"/></clipPath>` +
        `<g clip-path="url(#${cid})"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h / 2}" fill="${c}"/><rect x="${-w / 2}" y="0" width="${w}" height="${h / 2}" fill="#fff"/></g>` +
        `<path d="M${-w / 2},${-h / 2} H${w / 2} L${w / 2 - notch},0 L${w / 2},${h / 2} H${-w / 2}Z" fill="none" stroke="#d4a937" stroke-width="${w * 0.012}"/>`; },
    jacket: (w, h, c, g) => `<path d="M${-w * 0.14},${-h / 2} L${-w * 0.32},${-h * 0.44} L${-w / 2},${h * 0.1} L${-w * 0.4},${h * 0.14} L${-w * 0.3},${-h * 0.12} L${-w * 0.3},${h / 2} H${w * 0.3} L${w * 0.3},${-h * 0.12} L${w * 0.4},${h * 0.14} L${w / 2},${h * 0.1} L${w * 0.32},${-h * 0.44} L${w * 0.14},${-h / 2} L0,${-h * 0.3}Z" fill="${g}" stroke="${shade(c, -0.4)}" stroke-width="${w * 0.008}"/>` +
      `<path d="M0,${-h * 0.3} V${h / 2}" stroke="${shade(c, -0.4)}" stroke-width="${w * 0.006}"/>` + [0.05, 0.2, 0.35].map(f => `<circle cx="${w * 0.03}" cy="${h * f - h * 0.05}" r="${w * 0.01}" fill="${shade(c, -0.5)}"/>`).join(""),
    tags: (w, h, c, g) => [[-0.18, -0.12, -8], [0.12, 0.1, 6]].map(([dx, dy, r]) => `<g transform="translate(${w * dx} ${h * dy}) rotate(${r})"><rect x="${-w * 0.28}" y="${-h * 0.36}" width="${w * 0.56}" height="${h * 0.72}" rx="${w * 0.12}" fill="${g}" stroke="${shade(c, -0.4)}" stroke-width="${w * 0.02}"/><circle cy="${-h * 0.27}" r="${w * 0.04}" fill="#555"/></g>`).join(""),
    star: (w, h, c, g) => `<polygon points="${starPts(0, 0, Math.min(w, h) / 2)}" fill="${g}" stroke="${shade(c, -0.4)}" stroke-width="${w * 0.02}"/>`,
    photo: (w, h) => `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" fill="#9aa3ad"/><path d="M${-w * 0.35},${h * 0.3} L${-w * 0.1},${-h * 0.05} L${w * 0.08},${h * 0.15} L${w * 0.22},0 L${w * 0.38},${h * 0.3}Z" fill="#6b7682"/>`,
    plate: (w, h, c, g, key, it) => { const lh = 0.36 * IN, gold = /gold/i.test(it.name) && !light(c);
      const letters = gold ? "#e3c46b" : light(c) ? "#1a1410" : "#e9ecef", y0 = -(it.lines.length * lh) / 2;
      return `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="1.2" fill="${g}" stroke="${shade(c, -0.4)}" stroke-width="0.5"/>` +
        `<rect x="${-w / 2 + 1.2}" y="${-h / 2 + 1.2}" width="${w - 2.4}" height="${h - 2.4}" rx="0.8" fill="none" stroke="${letters}" stroke-opacity=".35" stroke-width="0.2"/>` +
        it.lines.map((l, i) => label(l, 0, y0 + (i + 0.5) * lh, w * 0.9, lh * 0.62, letters, i === 0)).join(""); },
  };
  const WORDS_ON = { rect: 1, rounded: 1, circle: 1, oval: 1, shield: 1, tab: 1, pennant: 1, star: 1, jacket: 1 };
  function drawItem(it) {
    const w = it.w * IN, h = it.h * IN, k = it.key.replace(/\W/g, ""), c = it.color || "#888888";
    let s = `<linearGradient id="g${k}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${shade(c, 0.3)}"/><stop offset=".55" stop-color="${c}"/><stop offset="1" stop-color="${shade(c, 0.22)}"/></linearGradient>`;
    if (it.pic) {
      if (it.fit === "slice") s += `<rect x="${-w / 2 - 1.5}" y="${-h / 2 - 1.5}" width="${w + 3}" height="${h + 3}" fill="#f4f1ea"/>`;
      s += `<image href="${esc(it.pic)}" x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid ${it.fit}"/>`;
    } else {
      if (it.shape === "photo") s += `<rect x="${-w / 2 - 1.5}" y="${-h / 2 - 1.5}" width="${w + 3}" height="${h + 3}" fill="#f4f1ea"/>`;
      s += (SHAPES[it.shape] || SHAPES.rect)(w, h, c, `url(#g${k})`, k, it);
    }
    if (it.words && WORDS_ON[it.shape] && !it.pic) {
      const pen = it.shape === "pennant";
      s += label(it.words, pen ? -w * 0.08 : 0, pen ? -h * 0.25 : it.shape === "tab" ? h * 0.12 : it.shape === "jacket" ? -h * 0.1 : 0,
        w * (it.shape === "jacket" ? 0.5 : pen ? 0.55 : 0.78), Math.min(h * (pen ? 0.16 : 0.3), 9), ink(c), true);
      if (pen) s += label(it.words, -w * 0.08, h * 0.25, w * 0.55, Math.min(h * 0.16, 9), c, true);
    }
    return s;
  }
  let selected = null, big = false;
  // The whole picture as SVG markup: frame, (mat), background, items
  function picture(forExport, small) {
    const [Wo, Ho] = outerIn(), W = Wo * IN, H = Ho * IN, mo = matOff() * IN, [Wi, Hi] = boxIn();
    const bg = OPT.backgrounds.find(b => b.name === plan.bg) || OPT.backgrounds[0], fr = OPT.frames.find(f => f.name === plan.frame) || OPT.frames[0];
    const mat = plan.kind === "frame" && plan.mat ? OPT.mats.find(m => m.name === plan.mat) : null;
    const F = plan.kind === "frame" ? FRAME * 0.75 : FRAME, deep = plan.kind === "shadowbox";
    let s = `<defs><linearGradient id="metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f0d27a"/><stop offset=".55" stop-color="#8a6a24"/><stop offset="1" stop-color="#f0d27a"/></linearGradient>
      <radialGradient id="bg" cx=".45" cy=".35" r=".9"><stop offset="0" stop-color="${shade(bg.color, 0.12)}"/><stop offset="1" stop-color="${shade(bg.color, -0.25)}"/></radialGradient>
      <linearGradient id="fr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${shade(fr.color, 0.35)}"/><stop offset=".5" stop-color="${shade(fr.color, -0.2)}"/><stop offset="1" stop-color="${shade(fr.color, 0.35)}"/></linearGradient>
      <linearGradient id="dt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
      <linearGradient id="dl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".45"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
      <filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0.6" dy="1" stdDeviation="0.9" flood-opacity=".55"/></filter></defs>`;
    s += `<rect x="${-F}" y="${-F}" width="${W + 2 * F}" height="${H + 2 * F}" fill="url(#fr)"/>`;
    s += `<rect x="${-F * 0.25}" y="${-F * 0.25}" width="${W + F * 0.5}" height="${H + F * 0.5}" fill="none" stroke="#000" stroke-opacity=".45" stroke-width="${F * 0.12}"/>`;
    if (mat) s += `<rect width="${W}" height="${H}" fill="${mat.color}"/><rect x="${mo - 1}" y="${mo - 1}" width="${W - 2 * mo + 2}" height="${H - 2 * mo + 2}" fill="${shade(mat.color, light(mat.color) ? -0.12 : 0.25)}"/>`;
    s += `<g transform="translate(${mo} ${mo})"><rect width="${Wi * IN}" height="${Hi * IN}" fill="url(#bg)"/>`;
    // a shadow box is deep: its inside walls throw a shadow along the top and left
    if (deep) s += `<rect width="${Wi * IN}" height="${Math.min(Hi * IN, 12)}" fill="url(#dt)"/><rect width="${Math.min(Wi * IN, 10)}" height="${Hi * IN}" fill="url(#dl)"/>`;
    s += `<rect width="${Wi * IN}" height="${Hi * IN}" fill="none" stroke="#000" stroke-opacity=".6" stroke-width="${deep ? 2.5 : 0.8}"/>`;
    const { list, fits } = placed();
    for (const it of list) {
      const w = it.w * IN, h = it.h * IN;
      s += `<g data-key="${esc(it.key)}" class="pl-item" transform="translate(${it.p.x * IN} ${it.p.y * IN}) rotate(${it.p.r || 0})" filter="url(#sh)">${drawItem(it)}<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" fill="transparent"/></g>`;
      if (!forExport && (selected === it.key || it.tooBig)) s += `<g transform="translate(${it.p.x * IN} ${it.p.y * IN}) rotate(${it.p.r || 0})" pointer-events="none"><rect x="${-w / 2 - 2}" y="${-h / 2 - 2}" width="${w + 4}" height="${h + 4}" fill="none" stroke="${it.tooBig ? "#ff6b6b" : "#e7a3b8"}" stroke-width="${small ? 3 : 1.2}" stroke-dasharray="4 3"/></g>`;
    }
    s += "</g>";
    if (!forExport && !small) s += `<text x="${W / 2}" y="${H + F * 0.62}" font-size="${F * 0.42}" fill="#fff" fill-opacity=".75" text-anchor="middle" font-family="Lato, Arial, sans-serif">${sizeName()} ${KINDS[plan.kind]}</text>`;
    return { s, list, fits, viewBox: `${-F} ${-F} ${W + 2 * F} ${H + 2 * F}`, w: W + 2 * F, h: H + 2 * F };
  }
  function render(forExport) {
    const pic = picture(forExport);
    svg.setAttribute("viewBox", pic.viewBox);
    svg.innerHTML = pic.s;
    svg.classList.toggle("live", plan.step === ARRANGE || big);
    const { list, fits } = pic;
    if (big) { const it = list.find(i => i.key === selected);
      $("pl-bigsel").textContent = it ? it.name : "Drag things to move them. Tap one to turn it or take it out.";
      document.querySelectorAll("[data-big=turn], [data-big=remove]").forEach(b => { b.disabled = !it; }); }
    const over = list.filter(i => i.tooBig).map(i => i.name), tip = !fits && list.length ? bestSize(list) : null;
    const same = tip && !plan.custom && tip.size === plan.size && tip.wide === plan.wide;
    const offer = !tip ? "" : `<button type="button" class="link-btn" data-size="${tip.size}" data-wide="${tip.wide ? 1 : ""}">${same ? "Arrange for me again"
      : `Use ${tip.size.replace("x", " × ")}${tip.wide ? " wide" : tip.size === plan.size ? " tall" : ""}`}</button>`;
    const custom = "or type any size in step 2 (we build odd sizes too).";
    $("pl-fit").innerHTML = over.length ? `${esc(over.join(", "))} won't fit in a ${sizeName()} ${KINDS[plan.kind]}. ${offer ? offer + " " + custom : "Pick a bigger size, " + custom}`
      : !fits && list.length ? (same ? `Some things overlap. ${offer}` : `Things are crowded, so some overlap. ${offer ? offer + " " + custom : "Try taking something out, " + custom}`) : "";
    return list;
  }

  // ---------- starter ideas ----------
  function planFromStarter(st) {
    const p = blank();
    Object.assign(p, { kind: st.kind === "frame" ? "frame" : "shadowbox", start: st.name, size: st.size, wide: !!st.wide, step: plan.step });
    if (!OPT.sizes.includes(p.size)) { p.custom = true; [p.cw, p.ch] = st.size.split("x").map(Number); if (p.wide) [p.cw, p.ch] = [p.ch, p.cw]; }
    if (p.kind === "frame" && OPT.mats.length && st.items.length < 3) p.mat = OPT.mats[0].name;
    p.plate.on = st.plate !== false; p.plate.purpose = st.purpose || "";
    for (const u of st.items || []) { const c = OPT.items.find(i => i.id === u.item); if (c) p.picks.push(pickFrom(c, u.size)); }
    withPlan(p, () => { if (!autoArrange(items()).fits) { const tip = bestSize(items()); if (tip) { p.custom = false; p.size = tip.size; p.wide = tip.wide; } } });
    return p;
  }
  const thumbs = {};
  function thumb(st) {
    const sig = JSON.stringify([st, OPT.items.length, OPT.edge]);
    if (thumbs[sig]) return thumbs[sig];
    const pic = withPlan(planFromStarter(st), () => picture(true, true));
    return (thumbs[sig] = `<svg viewBox="${pic.viewBox}" aria-hidden="true">${pic.s.replace(/id="([^"]+)"/g, `id="t${Object.keys(thumbs).length}$1"`).replace(/url\(#([^)]+)\)/g, `url(#t${Object.keys(thumbs).length}$1)`)}</svg>`);
  }

  // ---------- the steps ----------
  const STEPS = [["Start", stepStart], ["Size & colors", stepBox], ["Your items", stepItems], ["The plate", stepPlate], ["Arrange", stepArrange], ["Send it", stepSend]];
  const ARRANGE = 4, SEND = 5;
  const ANYTHING = `<p class="pl-note"><b>This is just to help you plan.</b> We frame almost anything: jackets and uniforms, lots of guidons, jerseys, hats, knives, artwork and more, in any size. If yours isn't listed, add it under <b>Something else</b>, or skip ahead and tell us about it.</p>`;
  function stepStart() {
    const starters = (OPT.starters || []).filter(s => (s.kind === "frame" ? "frame" : "shadowbox") === plan.kind);
    return `<p class="sub">What are we making?</p>
      <div class="pl-kinds">
        <button type="button" class="pl-kind${plan.kind === "shadowbox" ? " on" : ""}" data-kind="shadowbox"><b>Shadow box</b><span>Deep, for things with thickness: medals, folded flags, coins, jackets and keepsakes.</span></button>
        <button type="button" class="pl-kind${plan.kind === "frame" ? " on" : ""}" data-kind="frame"><b>Frame</b><span>Flat, for certificates, photos, guidons, open flags and prints. Can have a mat.</span></button>
      </div>
      <p class="sub">Start from an idea, or from scratch</p>
      <div class="pl-starters">${starters.map(st => `<button type="button" class="pl-starter${plan.start === st.name ? " on" : ""}" data-starter="${esc(OPT.starters.indexOf(st))}">${thumb(st)}<span>${esc(st.name)}</span></button>`).join("")}
        <button type="button" class="pl-starter blank${plan.start === "" ? " on" : ""}" data-starter="blank"><span class="plus">+</span><span>Start from scratch</span></button></div>
      <p class="hint">You can change everything after. Picking an idea replaces your current plan (Undo brings it back).</p>`;
  }
  function stepBox() {
    const frame = plan.kind === "frame";
    return `<div class="pl-row"><label class="grow">Size (inches)<select data-f="sizeSel">${OPT.sizes.map(z => `<option value="${z}"${!plan.custom && z === plan.size ? " selected" : ""}>${z.replace("x", " × ")}</option>`).join("")}
          <option value="custom"${plan.custom ? " selected" : ""}>Custom size…</option></select></label>
        ${plan.custom ? "" : `<label class="check"><input type="checkbox" data-f="wide"${plan.wide ? " checked" : ""}> Wide (landscape)</label>`}</div>
      ${plan.custom ? `<div class="pl-wh"><label>Width (in)<input type="number" min="4" max="72" step="0.25" data-f="cw" value="${esc(plan.cw)}"></label><label>Height (in)<input type="number" min="4" max="72" step="0.25" data-f="ch" value="${esc(plan.ch)}"></label></div>` : ""}
      <p class="hint">Any size works, odd ones too. Pick <b>Custom size…</b> and type it in.</p>
      ${frame ? `<div class="pl-row"><label class="grow">Mat<select data-f="mat"><option value="">No mat</option>${OPT.mats.map(m => `<option${m.name === plan.mat ? " selected" : ""}>${esc(m.name)}</option>`).join("")}</select></label>
        ${plan.mat ? `<label class="grow">Mat border<select data-f="matW">${OPT.matWidths.map(w => `<option value="${w}"${w === plan.matW ? " selected" : ""}>${w} in</option>`).join("")}</select></label>` : ""}</div>` : ""}
      <p class="sub">${frame ? "Backing" : "Background"}</p><div class="swatches">${OPT.backgrounds.map(b => `<button type="button" class="swatch${b.name === plan.bg ? " on" : ""}" data-bg="${esc(b.name)}" style="background:radial-gradient(${shade(b.color, 0.15)},${shade(b.color, -0.2)})"><span>${esc(b.name)}</span></button>`).join("")}</div>
      <p class="sub">Frame</p><div class="swatches">${OPT.frames.map(f => `<button type="button" class="swatch${f.name === plan.frame ? " on" : ""}" data-frame="${esc(f.name)}" style="background:linear-gradient(135deg,${shade(f.color, 0.35)},${shade(f.color, -0.2)},${shade(f.color, 0.35)})"><span>${esc(f.name)}</span></button>`).join("")}</div>`;
  }
  let fresh = null;   // the item just added, to point it out
  function stepItems() {
    const frame = plan.kind === "frame", offer = OPT.items.filter(i => !frame || i.flat);
    const groups = OPT.categories.map(c => [c, offer.filter(i => i.cat === c.id)]).filter(([, l]) => l.length);
    const thick = frame ? plan.picks.filter(p => !p.custom && !(OPT.items.find(i => i.id === p.item) || {}).flat) : [];
    const shapeOpts = cur => OPT.shapes.filter(s => s.id !== "photo").map(s => `<option value="${s.id}"${s.id === cur ? " selected" : ""}>${esc(s.name)}</option>`).join("");
    return `${ANYTHING}
      <p class="sub">In your ${KINDS[plan.kind]}${plan.picks.length ? ` (${plan.picks.length})` : ""}</p>
      ${thick.length ? `<p class="pl-warn">${esc(thick.map(p => p.name).join(", "))} ${thick.length > 1 ? "are" : "is"} too thick for a flat frame. <button type="button" class="link-btn" data-kind="shadowbox">Make it a shadow box</button></p>` : ""}
      ${plan.picks.length ? "" : '<p class="hint">Nothing yet. Tap the items below to add them.</p>'}
      <div class="pl-picks">${plan.picks.map(p => `<div class="pl-pick${p.id === fresh ? " fresh" : ""}" data-pk="${p.id}">
        <div class="pl-pick-top">
          ${p.custom ? `<input data-pf="name" value="${esc(p.name)}" maxlength="40" placeholder="What is it? e.g. Jersey" aria-label="What is it?">`
            : `<span class="pl-pick-name">${p.src ? `<img src="${p.src}" alt="">` : p.photo ? `<img src="${picUrl(p.photo)}?s=sm" alt="">` : ""}${esc(p.name)}</span>`}
          <select data-pf="size" aria-label="Size">${p.sizes.map((s, i) => `<option value="${i}"${String(i) === String(p.size) ? " selected" : ""}>${esc(s.label)}</option>`).join("")}<option value="custom"${p.size === "custom" ? " selected" : ""}>${p.sizes.length ? "Other size…" : "Size in inches"}</option></select>
          <button type="button" class="pl-x" data-pdel aria-label="Remove ${esc(p.name || "item")}">×</button>
        </div>
        ${p.size === "custom" ? `<div class="pl-wh"><label>Width (in)<input type="number" min="0.25" max="72" step="0.25" data-pf="w" value="${esc(p.w)}"></label><label>Height (in)<input type="number" min="0.25" max="72" step="0.25" data-pf="h" value="${esc(p.h)}"></label></div>` : ""}
        ${p.custom ? `<div class="pl-wh"><label>Looks like<select data-pf="shape">${shapeOpts(p.shape)}</select></label><label>Color<input type="color" data-pf="color" value="${esc(p.color)}"></label></div>` : ""}
        ${p.shape === "photo" ? `<label class="link-btn file-btn">${p.src ? "Change photo" : "+ Add your photo (optional)"}<input type="file" accept="image/*" data-pf="src" hidden></label>`
          : WORDS_ON[p.shape] && !p.photo ? (p.words || p.wordsOpen ? `<input data-pf="words" value="${esc(p.words)}" maxlength="24" placeholder="Words on it, e.g. B CO 2-14" aria-label="Words on it">`
            : `<button type="button" class="link-btn" data-words>+ Add words on it</button>`) : ""}
      </div>`).join("")}</div>
      <p class="sub">Add ${plan.picks.length ? "more" : "items"}</p>
      ${groups.map(([c, list]) => `<p class="mini">${esc(c.name)}</p><div class="pl-choices">${list.map(i => `<button type="button" class="pl-choice add" data-add="${esc(i.id)}">${i.photo ? `<img src="${picUrl(i.photo)}?s=sm" alt="">` : ""}+ ${esc(i.name)}</button>`).join("")}</div>`).join("")}
      <div class="pl-choices"><button type="button" class="pl-choice add strong" data-add-custom>+ Something else (any size)</button></div>
      ${frame ? '<p class="hint">Showing things that fit a flat frame. Medals, coins, folded flags and jackets need a shadow box.</p>' : ""}`;
  }
  function stepPlate() {
    const p = plan.plate;
    return `<label class="pl-line check strong"><input type="checkbox" data-pl="on"${p.on ? " checked" : ""}> Add an engraved plate</label>
      ${p.on ? `<div class="pl-grid">
        <label>Plate<select data-pl="color">${OPT.plateColors.map(m => `<option${m.name === p.color ? " selected" : ""}>${esc(m.name)}</option>`).join("")}</select></label>
        <label>Width<select data-pl="width">${OPT.plateWidths.map(w => `<option value="${w}"${w === p.width ? " selected" : ""}>${w} in</option>`).join("")}</select></label>
        <label class="wide">Rank and name<input data-pl="rankname" value="${esc(p.rankname)}" maxlength="50" placeholder="e.g. SSG John A. Smith"></label>
        <label class="wide">Position or title<input data-pl="position" value="${esc(p.position)}" maxlength="50" placeholder="e.g. First Sergeant"></label>
        <label class="wide">Unit<input data-pl="unit" value="${esc(p.unit)}" maxlength="60" placeholder="e.g. B Co, 2-14 IN, 10th Mountain Division"></label>
        <label>From<input data-pl="from" value="${esc(p.from)}" maxlength="20" placeholder="e.g. 2006"></label>
        <label>To<input data-pl="to" value="${esc(p.to)}" maxlength="20" placeholder="e.g. 2026"></label>
        <div class="wide"><p class="mini">Need words? Tap one to use it, then change it however you like.</p>
          <div class="pl-choices">${OPT.purposes.map(x => `<button type="button" class="pl-choice sm${p.purpose === x.name ? " on" : ""}" data-purpose="${esc(x.name)}">${esc(x.name)}</button>`).join("")}</div></div>
        <label class="wide">A few words<textarea data-pl="message" rows="3" maxlength="300" placeholder="Thanks, accomplishments or well wishes">${esc(p.message)}</textarea></label>
        <label class="wide">Quote (optional)<input data-pl="quote" value="${esc(p.quote)}" maxlength="120" placeholder="A motto or a phrase they always said"></label></div>
        <p class="hint">Leave any line blank, or skip ahead and tell us later. We'll send you a proof of the wording before we engrave.</p>` : ""}`;
  }
  function stepArrange() {
    return `<p class="hint">We've laid it out for you. Drag anything to move it; it stays inside, clear of the edge. Tap an item to turn it or take it out. On a phone, <b>Bigger View</b> makes this much easier.</p>
      <div class="pl-acts"><button type="button" class="btn sm" data-openbig>Bigger View</button><button type="button" class="btn ghost sm" data-auto>Arrange for Me Again</button></div>
      <div id="pl-sel"></div>`;
  }
  function stepSend() {
    return `<p id="pl-summary" class="summary">${esc(summary())}</p>
      <label class="wide">Anything else we should know? (optional)<textarea data-f="notes" rows="4" maxlength="1000" placeholder="e.g. I also have his beret and two more coins. Not sure about the size, open to ideas.">${esc(plan.notes)}</textarea></label>
      <button class="btn" id="pl-order" type="button">Use This Plan in My Order</button>
      <button class="btn ghost" id="pl-download" type="button">Download Picture</button>
      <p class="hint">It doesn't have to be finished. We'll work out the details and the final layout with you before we build. Your plan stays in this browser, so you can come back to it.</p>`;
  }
  function drawStep() {
    const n = plan.step;
    msg("");
    $("pl-steps").innerHTML = STEPS.map(([t], i) => `<button type="button" class="${i === n ? "on" : i < n ? "done" : ""}" data-go="${i}"${i === n ? ' aria-current="step"' : ""}><b>${i + 1}</b><span>${esc(t)}</span></button>`).join("");
    $("pl-step").innerHTML = `<span class="step">Step ${n + 1} of ${STEPS.length}</span><h2>${esc(STEPS[n][0])}</h2>${STEPS[n][1]()}`;
    $("pl-back").hidden = n === 0;
    $("pl-next").hidden = n === SEND;
    $("pl-skip").hidden = n >= ARRANGE;
    $("pl-next").textContent = n === ARRANGE ? "Finish" : "Next";
    if (n === ARRANGE) drawSel();
  }
  function drawSel() {
    const box = $("pl-sel"); if (!box) return;
    const it = render().find(i => i.key === selected);
    box.innerHTML = it ? `<div class="pl-pick"><div class="pl-pick-top"><span class="pl-pick-name">${esc(it.name)}</span><button type="button" class="btn ghost sm" data-turn>Turn</button><button type="button" class="btn ghost sm del" data-remove>Take Out</button></div></div>` : "";
  }
  function update(step) { save(); render(); if (step) drawStep(); }
  // Show the new step just below whatever stays stuck at the top (header, banners, and on phones the picture)
  const go = n => {
    plan.step = n; update(true);
    const bars = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--bars")) || 0, st = document.querySelector(".pl-stage");
    const off = innerWidth <= 900 ? 64 + bars + st.offsetHeight : 100 + bars;
    scrollTo({ top: $("pl-steps").getBoundingClientRect().top + scrollY - off - 8, behavior: "smooth" });
  };

  // ---------- arranging ----------
  function rearrange() { remember(); plan.moved = false; plan.pos = {}; selected = null; update(true); }
  function turn() {
    remember();
    if (!plan.moved) { for (const i of render()) plan.pos[i.key] = { ...i.p }; plan.moved = true; }
    const cur = plan.pos[selected] || {}; plan.pos[selected] = { ...cur, r: ((cur.r || 0) + 90) % 360 }; save(); render(); drawSel();
  }
  function takeOut() {
    remember(); if (selected === "plate") plan.plate.on = false; else plan.picks = plan.picks.filter(p => "p" + p.id !== selected);
    delete plan.pos[selected]; selected = null; update(true);
  }
  // Bigger View: the picture fills the screen (handy on phones), and things can be moved there
  function bigView(on) {
    big = on; $("pl-big").closest(".pl-stage").classList.toggle("big", on); document.body.classList.toggle("pl-big-open", on);
    if (!on) selected = plan.step === ARRANGE ? selected : null;
    render(); if (plan.step === ARRANGE) drawSel();
  }
  $("pl-big").onclick = () => bigView(true);
  $("pl-bigbar").onclick = e => { const a = e.target.dataset.big; if (!a) return;
    if (a === "done") bigView(false); if (a === "auto") rearrange(); if (a === "turn" && selected) turn(); if (a === "remove" && selected) takeOut(); };
  addEventListener("keydown", e => { if (e.key === "Escape" && big) bigView(false); });

  // ---------- adding and changing items ----------
  const pickFrom = (c, size = 0) => { const k = Math.min(Math.max(0, size | 0), c.sizes.length - 1), s = c.sizes[k] || { w: 4, h: 4 };
    return { id: uid(), item: c.id, cat: c.cat, name: c.name, shape: c.shape, color: c.color, photo: c.photo || 0, sizes: c.sizes.map(x => ({ ...x })), size: c.sizes.length ? k : "custom", w: s.w, h: s.h, words: "", src: "" }; };
  const pickOf = el => { const row = el.closest("[data-pk]"); return row && plan.picks.find(p => p.id === +row.dataset.pk); };
  const panel = $("pl-step");
  panel.addEventListener("click", e => {
    const t = e.target.closest("button"); if (!t) return;
    const d = t.dataset;
    if (d.kind) { if (plan.kind === d.kind) return; remember(); plan.kind = d.kind; plan.start = ""; return update(true); }
    if (d.starter) {
      remember();
      if (d.starter === "blank") { const keep = plan.kind; plan = blank(); plan.kind = keep; }
      else { const st = OPT.starters[+d.starter]; if (!st) return; plan = planFromStarter(st); }
      selected = null; go(1); msg(d.starter === "blank" ? "" : `Started from “${OPT.starters[+d.starter].name}”. Change anything you like.`); return;
    }
    if (d.bg) { remember(); plan.bg = d.bg; return update(true); }
    if (d.frame) { remember(); plan.frame = d.frame; return update(true); }
    if (d.add) { remember(); const c = OPT.items.find(i => i.id === d.add); if (!c) return; const p = pickFrom(c); plan.picks.push(p); fresh = p.id; update(true); fresh = null;
      msg(`Added ${c.name}. Change its size in the list above if you need to.`); const row = panel.querySelector(`[data-pk="${p.id}"]`); if (row && row.getBoundingClientRect().top < 60) row.scrollIntoView({ block: "center" }); return; }
    if ("addCustom" in d) { remember(); const p = { id: uid(), custom: true, item: "", cat: "other", name: "", shape: "rect", color: "#8a7f72", photo: 0, sizes: [], size: "custom", w: 6, h: 4, words: "", src: "" };
      plan.picks.push(p); fresh = p.id; update(true); fresh = null; const row = panel.querySelector(`[data-pk="${p.id}"]`); if (row) { row.scrollIntoView({ block: "center" }); row.querySelector("input").focus(); } return; }
    if ("pdel" in d) { remember(); const p = pickOf(t); plan.picks = plan.picks.filter(x => x !== p); delete plan.pos["p" + p.id]; return update(true); }
    if ("words" in d) { const p = pickOf(t); p.wordsOpen = true; drawStep(); const i = panel.querySelector(`[data-pk="${p.id}"] [data-pf=words]`); if (i) i.focus(); return; }
    if (d.purpose) { remember(); const pl = plan.plate, old = (OPT.purposes.find(x => x.name === pl.purpose) || {}).text || "";
      pl.purpose = d.purpose; const text = (OPT.purposes.find(x => x.name === d.purpose) || {}).text || "";
      if (!pl.message || pl.message === old) pl.message = text; return update(true); }
    if ("auto" in d) return rearrange();
    if ("openbig" in d) return bigView(true);
    if ("turn" in d && selected) return turn();
    if ("remove" in d && selected) return takeOut();
  });
  panel.addEventListener("input", e => {
    const el = e.target, d = el.dataset, v = el.type === "checkbox" ? el.checked : el.value;
    if (el.type === "file") return;
    if (!d.typing) { remember(); d.typing = "1"; }
    if (d.f === "sizeSel") { if (v === "custom") { const [w, h] = outerIn(); plan.custom = true; plan.cw = w; plan.ch = h; } else { plan.custom = false; plan.size = v; } }
    else if (d.f === "cw" || d.f === "ch") plan[d.f] = Math.max(0, Math.min(72, +v || 0));
    else if (d.f) plan[d.f] = v;
    else if (d.pl) plan.plate[d.pl] = v;
    else if (d.pf) {
      const p = pickOf(el); if (!p) return;
      if (d.pf === "size") { p.size = v === "custom" ? "custom" : +v; if (p.size !== "custom") { p.w = p.sizes[p.size].w; p.h = p.sizes[p.size].h; } }
      else p[d.pf] = d.pf === "w" || d.pf === "h" ? Math.max(0, Math.min(72, +v || 0)) : v;
    }
    if (["sizeSel", "wide", "cw", "ch", "mat", "matW"].includes(d.f)) { plan.moved = false; plan.pos = {}; }   // a new size: lay it out again
    update(el.type === "checkbox" || el.tagName === "SELECT");
  });
  panel.addEventListener("change", async e => {
    delete e.target.dataset.typing;
    if (e.target.dataset.pf !== "src") return;
    const file = e.target.files[0], p = pickOf(e.target); if (!file || !p) return;
    remember(); p.src = await shrink(file, 900); update(true);
  });
  $("pl-fit").onclick = e => { const d = e.target.dataset; if (!d.size) return; remember(); plan.custom = false; plan.size = d.size; plan.wide = !!d.wide; plan.moved = false; plan.pos = {}; update(true); };
  $("pl-back").onclick = () => go(Math.max(0, plan.step - 1));
  $("pl-next").onclick = () => go(Math.min(SEND, plan.step + 1));
  $("pl-skip").onclick = () => { go(SEND); const n = panel.querySelector("[data-f=notes]"); if (n) n.focus({ preventScroll: true }); msg("Tell us what you have in mind below. We'll help with the rest."); };
  $("pl-steps").onclick = e => { const b = e.target.closest("[data-go]"); if (b) go(+b.dataset.go); };
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

  // ---------- dragging (mouse and touch), only on the Arrange step so phones can still scroll ----------
  let drag = null;
  const pt = e => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; const q = p.matrixTransform(svg.getScreenCTM().inverse()); return { x: q.x / IN - matOff(), y: q.y / IN - matOff() }; };
  svg.addEventListener("pointerdown", e => {
    const g = e.target.closest(".pl-item");
    if (plan.step !== ARRANGE && !big) { if (g && e.pointerType === "mouse") { selected = g.dataset.key; go(ARRANGE); } return; }
    if (!g) { selected = null; render(); drawSel(); return; }
    const it = render().find(i => i.key === g.dataset.key); if (!it) return;
    selected = it.key;
    const p = pt(e); drag = { it, dx: p.x - it.p.x, dy: p.y - it.p.y, moved: false };
    svg.setPointerCapture(e.pointerId); e.preventDefault(); render(); drawSel();
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
    const counts = {};
    for (const p of plan.picks) { const n = `${p.name || "Other item"} (${sizeText(p)}${p.words ? `, “${p.words}”` : ""})`; counts[n] = (counts[n] || 0) + 1; }
    const things = Object.entries(counts).map(([n, c]) => c > 1 ? `${c} × ${n}` : n);
    const lines = plateLines(), frame = plan.kind === "frame";
    return `${plan.plate.purpose ? plan.plate.purpose + ". " : ""}${sizeName()}${plan.custom ? " (custom size)" : ""} ${KINDS[plan.kind]}, ${plan.bg.toLowerCase()} ${frame ? "backing" : "background"}, ${plan.frame.toLowerCase()} frame` +
      (frame ? (plan.mat ? `, ${plan.mat.toLowerCase()} mat (${plan.matW} in)` : ", no mat") : "") + "." +
      (things.length ? ` Items: ${things.join("; ")}.` : " No items picked yet.") +
      (plan.plate.on ? (lines.length ? ` ${plan.plate.width}" ${plan.plate.color.toLowerCase()} plate: "${lines.join(" / ")}".` : ` ${plan.plate.width}" ${plan.plate.color.toLowerCase()} plate (wording to come).`) : "") +
      (plan.notes.trim() ? ` Notes: ${plan.notes.trim()}` : "");
  }

  // ---------- finishing ----------
  const asData = url => fetch(url).then(r => r.blob()).then(b => new Promise(ok => { const f = new FileReader(); f.onload = () => ok(f.result); f.readAsDataURL(b); })).catch(() => "");
  async function snapshot() {
    const was = selected; selected = null; render(true);
    // pictures from the shop's list have to be inside the drawing to show in the saved picture
    for (const im of svg.querySelectorAll("image")) { const h = im.getAttribute("href"); if (h && !h.startsWith("data:")) im.setAttribute("href", await asData(h)); }
    const vb = svg.viewBox.baseVal, scale = 6, cw = Math.round(vb.width * scale), ch = Math.round(vb.height * scale);
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
      const blob = await snapshot(), a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = "my-plan.jpg"; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    }
    if (e.target.id === "pl-order") {
      const b = e.target; b.disabled = true; msg("Getting your plan ready…");
      try {
        const file = new File([await snapshot()], "shadow-box-plan.jpg", { type: "image/jpeg" });
        const db = await new Promise((ok, bad) => { const r = indexedDB.open("whimsicalpig-order", 1); r.onupgradeneeded = () => r.result.createObjectStore("files"); r.onsuccess = () => ok(r.result); r.onerror = () => bad(r.error); });
        const tx = db.transaction("files", "readwrite"); tx.objectStore("files").put([file], "plan");
        await new Promise((ok, bad) => { tx.oncomplete = ok; tx.onerror = () => bad(tx.error); }); db.close();
        const ticked = [...new Set(plan.picks.map(p => (OPT.categories.find(c => c.id === p.cat) || {}).order || "Other"))];
        const example = plan.kind === "frame" ? "Framed Guidon or Flag" : "Shadow Box";
        localStorage.setItem("whimsicalpig-plan-order", JSON.stringify({ at: Date.now(), text: summary(), items: ticked, example,
          frame: `${KINDS[plan.kind]}, ${plan.bg} ${plan.kind === "frame" ? "backing" : "background"}, ${plan.frame} frame${plan.kind === "frame" && plan.mat ? `, ${plan.mat} mat` : ""}` }));
        location.href = "order.html?type=military&plan=1";
      } catch (err) { msg("Something went wrong getting your plan ready. Try Download Picture instead, and add it to your order."); b.disabled = false; }
    }
  });

  // The shop's own choices (admin page → Shadow Box Planner); anything not saved there keeps the starting list
  function useOptions(o) {
    if (o) for (const k of ["sizes", "backgrounds", "frames", "mats", "matWidths", "plateColors", "plateWidths", "purposes", "items", "starters"]) if (Array.isArray(o[k]) && (o[k].length || ["items", "starters", "mats", "purposes"].includes(k))) OPT[k] = o[k];
    if (o && typeof o.edge === "number") OPT.edge = o.edge;
    if (!plan.custom && !OPT.sizes.includes(plan.size)) plan.size = OPT.sizes.find(z => z === "16x20") || OPT.sizes[0];
    if (!OPT.backgrounds.some(b => b.name === plan.bg)) plan.bg = OPT.backgrounds[0].name;
    if (!OPT.frames.some(f => f.name === plan.frame)) plan.frame = OPT.frames[0].name;
    if (plan.mat && !OPT.mats.some(m => m.name === plan.mat)) plan.mat = "";
    if (!OPT.matWidths.includes(plan.matW)) plan.matW = OPT.matWidths[0] || "2";
    if (!OPT.plateColors.some(c => c.name === plan.plate.color)) plan.plate.color = OPT.plateColors[0].name;
    if (!OPT.plateWidths.includes(plan.plate.width)) plan.plate.width = OPT.plateWidths[Math.floor(OPT.plateWidths.length / 2)];
    update(true);
  }
  document.addEventListener("site-changes", e => useOptions(e.detail && e.detail.planner));
  useOptions(typeof SITE_CHANGES !== "undefined" && SITE_CHANGES ? SITE_CHANGES.planner : null);
})();
