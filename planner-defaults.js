// The Shadow Box Planner's starting choices. The shop changes all of these on the admin page
// (Shadow Box Planner tab); this file is only what's used until something is saved there.
// Sizes are in inches. Used by planner.js and admin.html.
window.PLANNER_DEFAULTS = (() => {
  const named = list => list.map(([name, color]) => ({ name, color }));
  const S = (label, w, h) => ({ label, w, h });
  // flat: it also works in a flat frame (not only a deep shadow box)
  const item = (id, cat, name, shape, color, flat, sizes) => ({ id, cat, name, shape, color, flat, photo: 0, sizes });
  const use = (item, size = 0, n = 1) => Array.from({ length: n }, () => ({ item, size }));
  return {
    // Fixed groups: they decide where things go in the box, and what's ticked on the order form
    categories: [
      { id: "flag", name: "Flags", order: "Folded flag" },
      { id: "medal", name: "Medals & ribbons", order: "Ribbons / medals" },
      { id: "rank", name: "Rank", order: "Ranks" },
      { id: "badge", name: "Badges & tabs", order: "Badges" },
      { id: "patch", name: "Patches", order: "Patches" },
      { id: "photo", name: "Photos & prints", order: "Photos" },
      { id: "coin", name: "Coins & dog tags", order: "Coins" },
      { id: "other", name: "Uniforms, guidons & more", order: "Other" },
    ],
    // How a plain (picture-less) item is drawn
    shapes: [
      ["rect", "Rectangle"], ["rounded", "Rounded rectangle"], ["circle", "Circle (coin)"], ["oval", "Oval"],
      ["triangle", "Folded flag"], ["shield", "Patch"], ["medal", "Medal on ribbon"], ["ribbon", "Ribbon bar"],
      ["chevron", "Rank stripes"], ["tab", "Tab"], ["pennant", "Guidon"], ["jacket", "Jacket or shirt"],
      ["tags", "Dog tags"], ["star", "Star"], ["openflag", "Open flag"], ["photo", "Photo (customer adds theirs)"],
    ].map(([id, name]) => ({ id, name })),
    sizes: ["8x10", "11x14", "12x16", "14x18", "16x20", "18x24", "20x24", "22x28", "24x30", "24x36", "30x40"],
    edge: 0.75,   // inches kept clear around the edge of the box
    backgrounds: named([["Black velvet", "#1c1614"], ["Navy", "#1d2847"], ["Royal blue", "#1f4596"], ["Red", "#7d1c1c"], ["Forest green", "#1f4a2c"],
      ["Maroon", "#5a1d28"], ["Gray suede", "#555555"], ["Cream linen", "#ece5d3"], ["White suede", "#f3f2ed"]]),
    frames: named([["Dark walnut", "#3b2416"], ["Black", "#161616"], ["Cherry", "#6b2318"], ["Oak", "#9c7040"], ["Gold", "#b8913a"], ["Silver", "#a3a8ae"]]),
    mats: named([["White", "#f6f4ee"], ["Off-white", "#ece4d2"], ["Black", "#141414"], ["Navy", "#1d2847"], ["Red", "#8a1f24"], ["Gray", "#7a7a7a"]]),
    matWidths: ["1.5", "2", "2.5", "3"],
    plateColors: named([["Gold", "#c9a44c"], ["Silver", "#c3c8ce"], ["Black & gold", "#1d1d1d"], ["Black & silver", "#2a2a2a"]]),
    plateWidths: ["4", "6", "8", "10", "12"],
    purposes: [
      { name: "Retirement", text: "Congratulations on your retirement and thank you for your years of dedicated service." },
      { name: "PCS / farewell", text: "Thank you for your leadership and friendship. You will be missed." },
      { name: "Change of command", text: "With gratitude for your outstanding leadership while in command." },
      { name: "In memory of", text: "In loving memory. Forever in our hearts." },
      { name: "Promotion", text: "Congratulations on your well-deserved promotion." },
    ],
    items: [
      item("flag", "flag", "Folded flag", "triangle", "#1f2a5c", false, [S("Burial flag (5 × 9½ ft)", 22.5, 11.25), S("4 × 6 ft flag", 18, 9), S("3 × 5 ft flag", 15, 7.5)]),
      item("openflag", "flag", "Flag, open (not folded)", "openflag", "#b22234", true, [S("12 × 18 in", 18, 12), S("2 × 3 ft", 36, 24), S("3 × 5 ft", 60, 36)]),
      item("medal", "medal", "Medal", "medal", "#2a4b9b", false, [S("Full size", 1.4, 3.4), S("Miniature", 0.75, 2)]),
      item("ribbon", "medal", "Ribbon", "ribbon", "#b22234", true, [S("Standard", 1.375, 0.375)]),
      item("rack", "medal", "Ribbon rack", "ribbon", "#1f6b3a", true, [S("1 row (3 ribbons)", 4.125, 0.375), S("2 rows (6 ribbons)", 4.125, 0.75), S("3 rows (9 ribbons)", 4.125, 1.125), S("4 rows (12 ribbons)", 4.125, 1.5)]),
      item("rank", "rank", "Rank stripes", "chevron", "#c9a44c", false, [S("Pin-on", 1.5, 1.9), S("Sewn-on sleeve", 3, 3.6)]),
      item("officer", "rank", "Officer rank", "rounded", "#c3c8ce", false, [S("Pin-on", 1.1, 0.6), S("Shoulder board", 2, 5)]),
      item("badge", "badge", "Badge", "rounded", "#c3c8ce", false, [S("Wide (rifle or wings)", 2.75, 1), S("Small", 1.5, 1.2)]),
      item("tab", "badge", "Tab", "tab", "#111111", true, [S("Standard", 2.4, 0.65)]),
      item("patch", "patch", "Unit patch", "shield", "#3b5323", true, [S("Standard", 2.3, 3), S("Large", 3, 4)]),
      item("flagpatch", "patch", "Flag patch", "rect", "#b22234", true, [S("Standard", 3.5, 2)]),
      item("nametape", "patch", "Name tape", "rect", "#3b5323", true, [S("Standard", 4.5, 1)]),
      item("photo", "photo", "Photo", "photo", "#9aa3ad", true, [S("4 × 6", 4, 6), S("5 × 7", 5, 7), S("8 × 10", 8, 10), S("Wallet", 2.5, 3.5), S("4 × 6 sideways", 6, 4), S("5 × 7 sideways", 7, 5)]),
      item("art", "photo", "Artwork or print", "rect", "#d9c9a8", true, [S("8 × 10", 8, 10), S("11 × 14", 11, 14), S("16 × 20", 16, 20)]),
      item("coin", "coin", "Challenge coin", "circle", "#c9a44c", false, [S("1½ in", 1.5, 1.5), S("1¾ in", 1.75, 1.75), S("2 in", 2, 2), S("2½ in", 2.5, 2.5)]),
      item("tags", "coin", "Dog tags", "tags", "#c3c8ce", false, [S("Pair", 1.9, 2.3)]),
      item("jacket", "other", "Jacket or uniform top", "jacket", "#4b5320", false, [S("Folded", 14, 18), S("Arms out", 30, 26)]),
      item("jersey", "other", "Jersey or shirt", "jacket", "#1f4596", false, [S("Arms out", 32, 28), S("Folded", 12, 16)]),
      item("guidon", "other", "Guidon", "pennant", "#c8102e", true, [S("8 × 11", 11, 8), S("10 × 14", 14, 10), S("13 × 17", 17, 13), S("15 × 21", 21, 15), S("20 × 28", 28, 20)]),
      item("cert", "other", "Certificate", "rect", "#faf7ee", true, [S("8½ × 11", 8.5, 11), S("11 × 8½", 11, 8.5)]),
      item("beret", "other", "Beret or hat", "oval", "#222222", false, [S("Standard", 10, 8)]),
      item("knife", "other", "Knife or bayonet", "rounded", "#6f747b", false, [S("Standard", 12, 1.6)]),
    ],
    // Ready-made plans customers can start from (items point at the items above; size is which of its sizes)
    starters: [
      { name: "Retirement with burial flag", kind: "shadowbox", size: "24x30", wide: false, purpose: "Retirement", plate: true,
        items: [...use("flag"), ...use("rack", 1), ...use("medal", 0, 4), ...use("rank"), ...use("badge"), ...use("patch"), ...use("photo", 1), ...use("coin", 1, 2)] },
      { name: "Folded flag in memory", kind: "shadowbox", size: "18x24", wide: true, purpose: "In memory of", plate: true,
        items: [...use("flag"), ...use("photo", 3)] },
      { name: "Medals & photo", kind: "shadowbox", size: "16x20", wide: false, purpose: "PCS / farewell", plate: true,
        items: [...use("rack"), ...use("medal", 0, 3), ...use("rank"), ...use("photo", 1), ...use("patch")] },
      { name: "Jacket & patches", kind: "shadowbox", size: "24x30", wide: false, purpose: "", plate: true,
        items: [...use("jacket"), ...use("patch", 0, 2), ...use("nametape"), ...use("coin", 1, 2)] },
      { name: "Guidon & plate", kind: "frame", size: "20x28", wide: true, purpose: "Change of command", plate: true,
        items: [...use("guidon", 3)] },
      { name: "Certificate & photo", kind: "frame", size: "16x20", wide: true, purpose: "Promotion", plate: false,
        items: [...use("cert"), ...use("photo", 1)] },
    ],
  };
})();
