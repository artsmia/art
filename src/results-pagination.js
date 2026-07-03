var React = require("react");
var { getPaginationItems } = require("./util/pagination-utils");

var ResultsPagination = React.createClass({
  propTypes: {
    currentPage: React.PropTypes.number.isRequired,
    totalPages: React.PropTypes.number.isRequired,
    loading: React.PropTypes.bool,
    onPageChange: React.PropTypes.func.isRequired,
    ariaLabel: React.PropTypes.string,
  },

  getDefaultProps() {
    return {
      loading: false,
      ariaLabel: "Results pages",
    };
  },

  render() {
    var currentPage = this.props.currentPage;
    var totalPages = this.props.totalPages;
    var loading = this.props.loading;
    var onPageChange = this.props.onPageChange;
    var items = getPaginationItems(currentPage, totalPages);
    var onFirstPage = currentPage <= 1;
    var onLastPage = currentPage >= totalPages;

    return (
      <nav className="results-pagination" aria-label={this.props.ariaLabel}>
        <a
          href="#"
          className={
            "results-pagination__nav results-pagination__prev" +
            (onFirstPage || loading ? " is-disabled" : "")
          }
          aria-disabled={onFirstPage || loading}
          onClick={function (event) {
            event.preventDefault();
            if (!onFirstPage && !loading) {
              onPageChange(event, currentPage - 1);
            }
          }}
        >
          ← Prev
        </a>
        <div className="results-pagination__pages">
          {items.map(function (item, index) {
            if (item === "ellipsis") {
              return (
                <span
                  key={"ellipsis-" + index}
                  className="results-pagination__ellipsis"
                  aria-hidden="true"
                >
                  ...
                </span>
              );
            }

            var isActive = item === currentPage;
            return (
              <a
                key={item}
                href="#"
                className={
                  "results-pagination__page" + (isActive ? " is-active" : "")
                }
                aria-current={isActive ? "page" : undefined}
                onClick={function (event) {
                  event.preventDefault();
                  if (!isActive && !loading) {
                    onPageChange(event, item);
                  }
                }}
              >
                {item}
              </a>
            );
          })}
        </div>
        <a
          href="#"
          className={
            "results-pagination__nav results-pagination__next" +
            (onLastPage || loading ? " is-disabled" : "")
          }
          aria-disabled={onLastPage || loading}
          onClick={function (event) {
            event.preventDefault();
            if (!onLastPage && !loading) {
              onPageChange(event, currentPage + 1);
            }
          }}
        >
          Next →
        </a>
        {loading && (
          <span className="results-pagination__loading">Loading…</span>
        )}
      </nav>
    );
  },
});

module.exports = ResultsPagination;
