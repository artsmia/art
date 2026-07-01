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
    const summaryText = `${resultTotal} results`;
    const filterChips = ["On view", "Has image", "Has Open Access image"];

    return (
      <div className="search-results-header">
        <div className="search-results-controls">
          <button
            className="search-filters-trigger"
            type="button"
            onClick={this.props.onToggleFilters}
            aria-expanded={!!this.props.filtersOpen}
            aria-controls="search-side-panel"
          >
            <span className="material-icons" aria-hidden="true">
              tune
            </span>
            <span>Filters</span>
          </button>
          {filterChips.map((chipLabel, index) => (
            <button
              key={chipLabel}
              className={`search-filter-chip${index === 0 ? " is-active" : ""}`}
              type="button"
            >
              {chipLabel}
            </button>
          ))}
        </div>
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
