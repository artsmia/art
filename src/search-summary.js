var React = require("react");
var Helmet = require("react-helmet");

var searchLanguageMap = require("./search-language");
const { getResultTotal } = require("./util/search-utils");

const SearchSummary = React.createClass({
  render() {
    const search = this.props.search;
    if (!search || !search.hits) return <div />;
    const hits = this.props.hits;

    var pretty = {
      query: searchLanguageMap(search.query),
      filters: searchLanguageMap(search.filters),
    };
    pretty["searchString"] = [pretty.query, pretty.filters]
      .filter((string) => !!string && string !== "*" && string !== "undefined")
      .join(", ");

    const resultTotal = getResultTotal(search) || hits.length;
    const queryLabel =
      pretty.query && pretty.query !== "*" && pretty.query !== "undefined"
        ? pretty.query
        : "";
    const summaryText = queryLabel
      ? `${resultTotal} results for ${queryLabel}`
      : `${resultTotal} results`;

    return (
      <div className="search-results-header">
        <div className="search-results-summary">{summaryText}</div>
        <Helmet
          title={`🔎 ${pretty.searchString}`}
          meta={[
            { property: "robots", content: "noindex" },
            {
              property: "og:title",
              content: `${pretty.searchString} | Minneapolis Institute of Art`,
            },
          ]}
        />
      </div>
    );
  },
});

module.exports = SearchSummary;
