var React = require("react");
var Helmet = require("react-helmet");

var searchLanguageMap = require("./search-language");
const { getResultTotal, isBrowsePath } = require("./util/search-utils");

const FILTER_CHIPS = ["On view", "Has image", "Has Open Access image"];

const SearchSummary = React.createClass({
  render() {
    const search = this.props.search;
    if (!search || !search.hits) return <div />;
    const hits = this.props.hits;
    const activeFilterChips = this.props.activeFilterChips || {};

    var pretty = {
      query: searchLanguageMap(search.query),
      filters: searchLanguageMap(search.filters),
    };
    pretty["searchString"] = [pretty.query, pretty.filters]
      .filter((string) => !!string && string !== "*" && string !== "undefined")
      .join(", ");

    const resultTotal = getResultTotal(search) || hits.length;
    const summaryText = isBrowsePath(this.props)
      ? hits.length + " artworks"
      : resultTotal + " results";

    return (
      <div className="search-results-header">
        <div className="search-results-controls">
          <button
            className={
              "search-filters-trigger" +
              (this.props.filtersOpen ? " is-active" : "")
            }
            type="button"
            onClick={this.props.onToggleFilters}
            aria-expanded={!!this.props.filtersOpen}
            aria-controls="search-side-panel"
            aria-pressed={!!this.props.filtersOpen}
          >
            <span className="material-icons" aria-hidden="true">
              tune
            </span>
            <span>Filters</span>
          </button>
          {FILTER_CHIPS.map(function (chipLabel) {
            var isActive = !!activeFilterChips[chipLabel];
            return (
              <button
                key={chipLabel}
                className={
                  "search-filter-chip" + (isActive ? " is-active" : "")
                }
                type="button"
                aria-pressed={isActive}
                onClick={function () {
                  this.props.onToggleFilterChip &&
                    this.props.onToggleFilterChip(chipLabel);
                }.bind(this)}
              >
                {chipLabel}
              </button>
            );
          }, this)}
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
