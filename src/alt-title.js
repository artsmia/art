// Parse comma-separated, quoted alternative titles
function parseAlternativeTitles(raw) {
  const input = (raw || "").trim();

  if (!input) {
    return { altTitleFirst: null, altTitlesRest: [], state: "hidden" };
  }

  let titles = [];
  const quoted = input.match(/"([^"]*)"/g);

  if (quoted) {
    titles = quoted
      .map((quotedString) => quotedString.slice(1, -1).trim())
      .filter(Boolean);
  } else {
    titles = input
      .split(",")
      .map((title) => title.replace(/^"+|"+$/g, "").trim())
      .filter(Boolean);
  }

  if (!titles.length) {
    return { altTitleFirst: null, altTitlesRest: [], state: "hidden" };
  }

  if (!titles.length) {
    return { altTitleFirst: null, altTitlesRest: [], state: "hidden" };
  } else if (titles.length === 1) {
    return { altTitleFirst: titles[0], altTitlesRest: [], state: "static" };
  } else {
    return {
      altTitleFirst: titles[0],
      altTitlesRest: titles.slice(1),
      state: "peekable",
    };
  }
}

module.exports = { parseAlternativeTitles };
