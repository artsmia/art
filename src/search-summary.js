var React = require("react");
var Helmet = require("react-helmet");
var { Link } = require("react-router");

var searchLanguageMap = require("./search-language");
const { getResultTotal } = require("./util/search-utils");

const SearchSummary = React.createClass({
  render() {
    const search = this.props.search;
    if (!search || !search.hits) return <div />;
    const hits = this.props.hits;

    const showingAll =
      hits.length >= getResultTotal(search) ||
      hits.length >= this.props.maxResults;

    var { smallViewport } = this.context;
    var toolbarClasses =
      "summaryText mdl-cell " +
      (smallViewport
        ? "mdl-cell--4-col"
        : "mdl-cell--8-col mdl-cell--4-col-tablet");

    var pretty = {
      query: searchLanguageMap(search.query),
      filters: searchLanguageMap(search.filters),
    };
    pretty["searchString"] = [pretty.query, pretty.filters]
      .filter((string) => !!string && string !== "*" && string !== "undefined")
      .join(", ");

    var { sort } = this.props.query;
    var humanizeSnakeCase = (s) =>
      `_${s}`.replace(/_(.?)/g, (_, x) => ` ${x.toUpperCase()}`).trim();

    return (
      <div className="agg-wrap">
        <div className="toolbar mdl-grid">
          {this.props.children}
          <div className={toolbarClasses}>
            <h2>
              showing {hits.length}{" "}
              {showingAll || <span>of {getResultTotal(search)} </span>}
              results{" "}
              {pretty.query && (
                <span>
                  matching <code>{pretty.query}</code>
                </span>
              )}
              {search.filters && (
                <span>
                  {" "}
                  and <code>{decodeURIComponent(pretty.filters)}</code> (
                  <Link
                    to="searchResults"
                    query={search.query}
                    params={{ terms: `${search.query}`, splat: "" }}
                  >
                    clear filters
                  </Link>
                  )
                </span>
              )}
              {sort && (
                <span>
                  {" "}
                  sorted by {humanizeSnakeCase(sort.replace(/(-|\.).*/, ""))}
                </span>
              )}
              {showingAll || this.props.showMoreLink}
              {this.props.embed && (
                <span>
                  {" "}
                  (
                  <a href="#" onClick={this.props.handleCancelEmbed}>
                    show search
                  </a>
                  )
                </span>
              )}
            </h2>
          </div>
        </div>
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
SearchSummary.contextTypes = {
  smallViewport: React.PropTypes.bool,
};

module.exports = SearchSummary;
