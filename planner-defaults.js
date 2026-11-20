// The Shadow Box Planner's starting choices. The shop changes all of these on the admin page
// (Shadow Box Planner tab); this file is only what's used until something is saved there.
// Sizes are in inches. Used by planner.js and admin.html.
window.PLANNER_DEFAULTS = (() => {
  const named = list => list.map(([name, color]) => ({ name, color }));
  const S = (label, w, h) => ({ label, w, h });
  let n = 0;
  const item = (cat, name, shape, color, sizes) => ({ id: "i" + ++n, cat, name, shape, color, photo: 0, sizes });
  return {
    // Fixed groups: they decide where things go in the box, and what's ticked on the order form
    categories: [
      { id: "flag", name: "Flags", order: "Folded flag" },
      { id: "medal", name: "Medals & ribbons", order: "Ribbons / medals" },
      { id: "rank", name: "Rank", order: "Ranks" },
      { id: "badge", name: "Badges & tabs", order: "Badges" },
      { id: "patch", name: "Patches", order: "Patches" },
      { id: "photo", name: "Photos", order: "Photos" },
      { id: "coin", name: "Coins & dog tags", order: "Coins" },
      { id: "other", name: "Uniforms, guidons & more", order: "Other" },
    ],
    // How a plain (picture-less) item is drawn
    shapes: [
      ["rect", "Rectangle"], ["rounded", "Rounded rectangle"], ["circle", "Circle (coin)"], ["oval", "Oval"],
      ["triangle", "Folded flag"], ["shield", "Patch"], ["medal", "Medal on ribbon"], ["ribbon", "Ribbon bar"],
      ["chevron", "Rank stripes"], ["tab", "Tab"], ["pennant", "Guidon"], ["jacket", "Jacket or shirt"],
      ["tags", "Dog tags"], ["star", "Star"], ["photo", "Photo (customer adds theirs)"],
    ].map(([id, name]) => ({ id, name })),
    sizes: ["11x14", "12x16", "14x18", "16x20", "18x24", "20x24", "22x28", "24x30", "24x36", "30x40"],
    backgrounds: named([["Black velvet", "#1c1614"], ["Navy", "#1d2847"], ["Royal blue", "#1f4596"], ["Red", "#7d1c1c"], ["Forest green", "#1f4a2c"],
      ["Maroon", "#5a1d28"], ["Gray suede", "#555555"], ["Cream linen", "#ece5d3"], ["White suede", "#f3f2ed"]]),
    frames: named([["Dark walnut", "#3b2416"], ["Black", "#161616"], ["Cherry", "#6b2318"], ["Oak", "#9c7040"], ["Gold", "#b8913a"], ["Silver", "#a3a8ae"]]),
    plateColors: named([["Gold", "#c9a44c"], ["Silver", "#c3c8ce"], ["Black & gold", "#1d1d1d"], ["Black & silver", "#2a2a2a"]]),
    plateWidths: ["4", "6", "8", "10", "12"],
    purposes: [
      { name: "Retirement", text: "Congratulations on your retirement and thank you for your years of dedicated service." },
      { name: "PCS / farewell", text: "Thank you for your leadership and friendship. You will be missed." },
      { name: "Change of command", text: "With gratitude for your outstanding leadership while in command." },
      { name: "In memory of", text: "In loving memory. Forever in our hearts." },
      { name: "Promotion", text: "Congratulations on your well-deserved promotion." },
      { name: "Something else", text: "" },
    ],
    items: [
      item("flag", "Folded flag", "triangle", "#1f2a5c", [S("Burial flag (5 × 9½ ft)", 22.5, 11.25), S("4 × 6 ft flag", 18, 9), S("3 × 5 ft flag", 15, 7.5)]),
      item("medal", "Medal", "medal", "#2a4b9b", [S("Full size", 1.4, 3.4), S("Miniature", 0.75, 2)]),
      item("medal", "Ribbon", "ribbon", "#b22234", [S("Standard", 1.375, 0.375)]),
      item("medal", "Ribbon rack", "ribbon", "#1f6b3a", [S("1 row (3 ribbons)", 4.125, 0.375), S("2 rows (6 ribbons)", 4.125, 0.75), S("3 rows (9 ribbons)", 4.125, 1.125), S("4 rows (12 ribbons)", 4.125, 1.5)]),
      item("rank", "Rank stripes", "chevron", "#c9a44c", [S("Pin-on", 1.5, 1.9), S("Sewn-on sleeve", 3, 3.6)]),
      item("rank", "Officer rank", "rounded", "#c3c8ce", [S("Pin-on", 1.1, 0.6), S("Shoulder board", 2, 5)]),
      item("badge", "Badge", "rounded", "#c3c8ce", [S("Wide (rifle or wings)", 2.75, 1), S("Small", 1.5, 1.2)]),
      item("badge", "Tab", "tab", "#111111", [S("Standard", 2.4, 0.65)]),
      item("patch", "Unit patch", "shield", "#3b5323", [S("Standard", 2.3, 3), S("Large", 3, 4)]),
      item("patch", "Flag patch", "rect", "#b22234", [S("Standard", 3.5, 2)]),
      item("patch", "Name tape", "rect", "#3b5323", [S("Standard", 4.5, 1)]),
      item("photo", "Photo", "photo", "#9aa3ad", [S("4 × 6", 4, 6), S("5 × 7", 5, 7), S("8 × 10", 8, 10), S("Wallet", 2.5, 3.5), S("4 × 6 sideways", 6, 4), S("5 × 7 sideways", 7, 5)]),
      item("coin", "Challenge coin", "circle", "#c9a44c", [S("1½ in", 1.5, 1.5), S("1¾ in", 1.75, 1.75), S("2 in", 2, 2), S("2½ in", 2.5, 2.5)]),
      item("coin", "Dog tags", "tags", "#c3c8ce", [S("Pair", 1.9, 2.3)]),
      item("other", "Jacket or uniform top", "jacket", "#4b5320", [S("Folded", 14, 18), S("Arms out", 30, 26)]),
      item("other", "Guidon", "pennant", "#c8102e", [S("8 × 11", 11, 8), S("10 × 14", 14, 10), S("13 × 17", 17, 13), S("15 × 21", 21, 15), S("20 × 28", 28, 20)]),
      item("other", "Certificate", "rect", "#faf7ee", [S("8½ × 11", 8.5, 11), S("11 × 8½", 11, 8.5)]),
      item("other", "Beret or hat", "oval", "#222222", [S("Standard", 10, 8)]),
      item("other", "Knife or bayonet", "rounded", "#6f747b", [S("Standard", 12, 1.6)]),
    ],
  };
})();
