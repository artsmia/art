// Parse comma-separated, quoted alternative titles
function parseAlternativeTitles(raw) {
  const input = (raw || "").trim();
  if (!input) return { altTitleFirst: null, altTitlesRest: [], state: "hidden" };

  const quoted = input.match(/"([^"]*)"/g);
  const titles = quoted
    ? quoted.map((s) => s.slice(1, -1).trim()).filter(Boolean)
    : input.split(",").map((s) => s.replace(/^"+|"+$/g, "").trim()).filter(Boolean);

  if (!titles.length) return { altTitleFirst: null, altTitlesRest: [], state: "hidden" };
  if (titles.length === 1) return { altTitleFirst: titles[0], altTitlesRest: [], state: "static" };

  const [first, ...rest] = titles;
  return { altTitleFirst: first, altTitlesRest: rest, state: "peekable" };
}

module.exports = { parseAlternativeTitles };
