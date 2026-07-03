var React = require("react");
var Router = require("react-router");
var rest = require("rest");

var SEARCH = require("./endpoints").search;
var SearchSummary = require("./search-summary");
var ResultsList = require("./search-results/list");
var ResultsPagination = require("./results-pagination");
const { getResultTotal, isBrowsePath } = require("./util/search-utils");
const {
  RESULTS_PAGE_SIZE,
  currentPageFromQuery,
  totalPagesFromCount,
} = require("./util/pagination-utils");

function isBrowsePage(props) {
  return isBrowsePath(props);
}

function fetchRandomArt(size) {
  var q = encodeURIComponent("image:valid public_access:1");
  return rest(
    SEARCH + "/random/art?size=" + (size || RESULTS_PAGE_SIZE) + "&q=" + q
  ).then(function (response) {
    var hits = JSON.parse(response.entity);
    if (!Array.isArray(hits)) hits = [];
    return { hits: hits };
  });
}

function currentPageNumber(props, state) {
  if (isBrowsePage(props)) return state.browseCurrentPage || 1;
  return currentPageFromQuery(props.query);
}

function omitResultsById(...ids) {
  return (json) => {
    return {
      ...json,
      hits: {
        ...json.hits,
        hits: json.hits.hits.filter(
          (hit) => !ids.find((id) => id === parseInt(hit._id))
        ),
      },
    };
  };
}
/* Given a list of artwork ids to be promoted, find any that exist
 * in `results` and increase their _score, then re-sort the results
 */
function promoteResultsById(...ids) {
  return function (json, additionalArt) {
    const idComparison = (hit) => ids.indexOf(Number(hit._id)) > -1;
    const hits = [
      ...json.hits.hits,
      ...additionalArt.map((art) => ({
        _score: 100,
        _source: art,
      })),
    ];
    const includesId = hits.filter(idComparison);
    const resortedResults = hits
      .map((hit) => {
        if (idComparison(hit)) hit._score = hit._score * 100;

        return hit;
      })
      .sort((a, b) => b._score - a._score);

    return {
      ...json,
      hits: {
        ...json.hits,
        hits: resortedResults,
      },
    };
  };
}
function reshapeResultsJson(json) {
  // For this query there are two photographs that are included because of `2013`
  // being included in their title, that really don't belong and are a thorn in
  // the side of one of our curators.
  //
  // Manually remove ids 126303 and 126745 from a search where the query starts with
  // 2013.29
  if (json.query.match(/^2013.29/)) {
    return omitResultsById(126303, 126745)(json);
  }

  if (json.query.match(/black|african.?american/i)) {
    // TODO how to do this without hard-coding a single artwork?
    const gfPortrait = JSON.parse(
      `{"id":"139005","title":"George Floyd, In Memorium 2020","medium":"Screenprint","classification":" Prints","dimension":"25 × 15 in. (63.5 × 38.1 cm) (sheet)","object_name":"Print","continent":"North America","country":"United States","culture":null,"dated":"2020","room":"Not on View","style":"21st century","inscription":"LLC in pencil: 8:46","signed":"LRC in pencil: David Barthold","markings":"bottom center in pencil: 113/200","text":"As Minneapolis and the world mourned the murder of George Floyd in the summer of 2020, an outpouring of art was created by artists, professional and amateur alike—murals, sidewalk art, sculpture installations, cardboard signs, paintings, drawings, and prints. The works were made to memorialize Floyd and countless other Black citizens martyred in this country, to protest racial injustice and police brutality, and to try to help communities heal. Barthold, a New York printmaker and street artist, completed this powerful memorial portrait of Floyd just days after he was killed. The artist subsequently produced other portrait prints of important Americans—John Lewis, Fred Hampton, Ruth Bader Ginsburg, and Alexandria Ocasio-Cortez—to, in the artist’s words, “remember the lost and honor the living.” Barthold mass-produced these likenesses and pasted them around the city of New York throughout the summer of 2020, and, again, in a campaign just before the 2020 election. To broaden their reach, he shared the images on social media, and sold the prints online, using the proceeds to raise money for Black Lives Matter and the Bail Project.","description":"portrait of George Floyd in black inside an irregularly shaped dark form","provenance":"The artist, New York (2020; sold to McGarry); Rachel McGarry, Deephaven (2020; given to Mia).","portfolio":"From ","creditline":"Anonymous gift","accession_number":"2020.91","artist":"Artist: David Barthold","role":"Artist","nationality":"American","life_date":"American, born 1959","image_copyright":"","department":"Prints and Drawings","rights_type":"Copyright Not Evaluated","image":"valid","image_width":4823,"image_height":7846,"restricted":1,"public_access":"1","curator_approved":0,"catalogue_raissonne":null,"art_champions_text":null,"see_also":[""]}`
    );

    return promoteResultsById(
      139005,
      7890,
      3754,
      107241,
      126991,
      79932
    )(json, [gfPortrait]);
  }

  return json;
}

function renderAdvancedFilterPanel() {
  return (
    <div className="search-advanced-filters">
      <section className="search-filter-section">
        <span className="search-filter-label">Date</span>
        <div className="search-filter-grid-2">
          <div>
            <span className="search-filter-sub-label">From</span>
            <input
              id="filter-date-from"
              className="search-filter-line-input"
              placeholder="Year"
              type="number"
              data-filter="dateFrom"
              readOnly
              tabIndex={-1}
            />
          </div>
          <div>
            <span className="search-filter-sub-label">To</span>
            <input
              id="filter-date-to"
              className="search-filter-line-input"
              placeholder="Year"
              type="number"
              data-filter="dateTo"
              readOnly
              tabIndex={-1}
            />
          </div>
        </div>
      </section>

      <section className="search-filter-section">
        <span className="search-filter-label">Department</span>
        <input
          id="filter-department"
          className="search-filter-line-input"
          placeholder="Search"
          type="text"
          data-filter="department"
          readOnly
          tabIndex={-1}
        />
      </section>

      <section className="search-filter-section">
        <span className="search-filter-label">Location</span>
        <input
          id="filter-location"
          className="search-filter-line-input"
          placeholder="Country, continent, or nationality"
          type="text"
          data-filter="location"
          readOnly
          tabIndex={-1}
        />
      </section>

      <section className="search-filter-section">
        <span className="search-filter-label">Medium</span>
        <input
          id="filter-medium"
          className="search-filter-line-input"
          placeholder="Search"
          type="text"
          data-filter="medium"
          readOnly
          tabIndex={-1}
        />
      </section>

      <section className="search-filter-section">
        <span className="search-filter-label">Show only</span>
        <div className="search-filter-stack-tight">
          <div
            className="search-filter-toggle-row"
            data-filter="onView"
          >
            <span className="search-filter-toggle-label">On View</span>
            <div className="search-filter-toggle-box">
              <div className="search-filter-toggle-dot" />
            </div>
          </div>
          <div
            className="search-filter-toggle-row"
            data-filter="hasImage"
          >
            <span className="search-filter-toggle-label">Has image</span>
            <div className="search-filter-toggle-box">
              <div className="search-filter-toggle-dot" />
            </div>
          </div>
          <div
            className="search-filter-toggle-row"
            data-filter="hasOpenAccessImage"
          >
            <span className="search-filter-toggle-label">
              Has Open Access image
            </span>
            <div className="search-filter-toggle-box">
              <div className="search-filter-toggle-dot" />
            </div>
          </div>
        </div>
      </section>

      <section className="search-filter-section">
        <span className="search-filter-label">Media</span>
        <div className="search-filter-stack-tight">
          <div
            className="search-filter-toggle-row"
            data-filter="hasAudio"
          >
            <span className="search-filter-toggle-label">Has Audio</span>
            <div className="search-filter-toggle-box">
              <div className="search-filter-toggle-dot" />
            </div>
          </div>
          <div
            className="search-filter-toggle-row"
            data-filter="has3dModel"
          >
            <span className="search-filter-toggle-label">Has 3D Model</span>
            <div className="search-filter-toggle-box">
              <div className="search-filter-toggle-dot" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

var SearchResults = React.createClass({
  mixins: [Router.State, Router.Navigation],

  statics: {
    fetchData: {
      searchResults: (params, query) => {
        var page = currentPageFromQuery(query);
        var from = (page - 1) * RESULTS_PAGE_SIZE;
        var sort = query && query.sort;
        const filters = params.splat;
        const properlyCodedTerms = params.terms.replace(/\/|%2F/g, " "); // no forward slashes in search `/`
        const properlyCodedFilters = encodeURIComponent(
          decodeURIComponent(filters)
        ); // yuck
        let searchUrl = `${SEARCH}/${properlyCodedTerms}?size=${RESULTS_PAGE_SIZE}&from=${from}`;
        if (sort) searchUrl += `&sort=${sort}`;
        if (filters) searchUrl += `&filters=${properlyCodedFilters}`;
        if ((window && window.enteredViaMore) || (query && query.more))
          searchUrl += `&tag=more`;
        return rest(searchUrl).then((r) =>
          reshapeResultsJson(JSON.parse(r.entity))
        );
      },
    },
  },

  getInitialState() {
    var isInspiredByMia = this.isInspiredByMia();

    return {
      isInspiredByMia,
      browsePages: {},
      browseCurrentPage: 1,
      loadingBrowsePage: false,
    };
  },

  isInspiredByMia() {
    var search = this.props.data.searchResults;
    var { query, filters } = search;
    var inspiredFragment = '_exists_:"related:inspiredByMia"';

    return (
      (query && query.match(inspiredFragment)) ||
      (filters && filters.match(inspiredFragment))
    );
  },

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.props.data.searchResults != nextProps.data.searchResults ||
      this.props.hits != nextProps.hits ||
      this.props.completions !== nextProps.completions ||
      this.props.query.sort !== nextProps.query.sort ||
      this.props.query.page !== nextProps.query.page ||
      this.props.filtersOpen !== nextProps.filtersOpen ||
      this.props.activeFilterChips !== nextProps.activeFilterChips ||
      this.state !== nextState
    );
  },

  maxResults: 5000,

  totalPages() {
    var search = this.props.data && this.props.data.searchResults;
    var total = getResultTotal(search);
    return totalPagesFromCount(total, RESULTS_PAGE_SIZE, this.maxResults);
  },

  isLoadingPage() {
    if (isBrowsePage(this.props)) return this.state.loadingBrowsePage;
    return false;
  },

  goToPage(event, page) {
    if (isBrowsePage(this.props)) {
      this.goBrowsePage(event, page);
    } else {
      this.goSearchPage(event, page);
    }
  },

  goSearchPage(event, page) {
    event.preventDefault();
    if (page < 1 || page > this.totalPages()) return;

    var { terms, splat } = this.props.params;
    var filters = splat;
    var routeName = filters ? "filteredSearchResults" : "searchResults";
    var query = Object.assign({}, this.props.query, { page: page });
    delete query.size;
    delete query.more;

    this.transitionTo(routeName, { terms, splat: filters }, query);
    window.scrollTo(0, 0);
  },

  goBrowsePage(event, page) {
    event.preventDefault();
    if (page < 1 || this.state.loadingBrowsePage) return;
    if (page > this.totalPages()) return;

    var hasCachedPage =
      page === 1
        ? this.props.hits.length > 0 || this.state.browsePages[1]
        : !!this.state.browsePages[page];

    this.setState({ browseCurrentPage: page }, function () {
      this.ensureBrowsePageLoaded();
      if (hasCachedPage) window.scrollTo(0, 0);
    });
  },

  fetchBrowsePage(page) {
    this.setState({ loadingBrowsePage: true });
    fetchRandomArt(RESULTS_PAGE_SIZE).then((result) => {
      this.setState(
        function (prevState) {
          var browsePages = Object.assign({}, prevState.browsePages);
          browsePages[page] = result.hits;
          return {
            browsePages: browsePages,
            loadingBrowsePage: false,
          };
        },
        function () {
          window.scrollTo(0, 0);
        }
      );
    });
  },

  ensureBrowsePageLoaded() {
    if (!isBrowsePage(this.props) || this.state.loadingBrowsePage) return;
    var page = currentPageNumber(this.props, this.state);
    if (page === 1 || this.state.browsePages[page]) return;
    this.fetchBrowsePage(page);
  },

  renderCsvLink() {
    if (isBrowsePage(this.props)) return null;

    var search = this.props.data && this.props.data.searchResults;
    if (!search) return null;

    var csvTerms =
      search.csvQuery ||
      [search.query, search.filters].filter(function (s) {
        return s;
      }).join(" ");

    return (
      <p className="results-csv-link">
        <a href={SEARCH + "/" + csvTerms + "?format=csv"}>
          Download results as CSV
        </a>
      </p>
    );
  },

  displayHits() {
    if (!isBrowsePage(this.props)) return this.props.hits;
    var page = currentPageNumber(this.props, this.state);
    var cached = this.state.browsePages[page];
    if (cached) return cached;
    if (page === 1) return this.props.hits;
    return [];
  },

  render() {
    var search = this.props.data.searchResults;
    var hits = this.displayHits();
    var browsePage = isBrowsePage(this.props);
    var pageLoading =
      browsePage && this.state.loadingBrowsePage && hits.length === 0;
    var currentPage = currentPageNumber(this.props, this.state);
    var totalPages = this.totalPages();
    var showPagination = totalPages > 1;

    var summaryProps = {
      search: this.props.data.searchResults,
      hits: hits,
      path: this.props.path,
      params: this.props.params,
      maxResults: this.maxResults,
      query: this.props.query,
      forceSearchUpdate: () => {},
      embed: this.props.embed,
      handleCancelEmbed: this.props.handleCancelEmbed,
      isInspiredByMia: this.state.isInspiredByMia,
      filtersOpen: this.props.filtersOpen,
      onToggleFilters: this.props.onToggleFilters,
      activeFilterChips: this.props.activeFilterChips,
      onToggleFilterChip: this.props.onToggleFilterChip,
      ...this.props.summaryProps,
    };

    var { terms, splat } = this.props.params;
    var showFocusRelatedContent = [terms, splat].join(" ").match(/related/);

    var { isInspiredByMia } = this.state;
    const customImageFn = isInspiredByMia
      ? function (id) {
          const art = this.props.hits.find(({ _id }) => id === _id)._source;
          const inspired = art["related:inspiredByMia"];
          return inspired && inspired[0].image;
        }
      : undefined;

    return (
      <div className="search-results-layout">
        <SearchSummary {...summaryProps} />
        {this.props.suggestions}
        <div
          className={`search-results-body${this.props.filtersOpen ? " is-open" : ""}`}
        >
          <aside
            id="search-side-panel"
            className="search-side-panel"
            aria-hidden={!this.props.filtersOpen}
          >
            {renderAdvancedFilterPanel()}
          </aside>
          <div className="search-results-main">
            {pageLoading ? (
              <div className="results-loading" aria-live="polite">
                Loading artworks…
              </div>
            ) : (
              <ResultsList
                key={
                  (browsePage ? "browse-" : "search-") + currentPage
                }
                search={search}
                hits={hits}
                filtersOpen={this.props.filtersOpen}
                smallViewport={this.context.smallViewport}
                showRelated={showFocusRelatedContent}
                customImage={customImageFn && customImageFn.bind(this)}
                isInspiredByMia={isInspiredByMia}
              />
            )}
            {showPagination && (
              <div className="results-pagination-wrap">
                <ResultsPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  loading={this.isLoadingPage()}
                  onPageChange={this.goToPage}
                  ariaLabel={browsePage ? "Browse pages" : "Search results pages"}
                />
                {this.renderCsvLink()}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },

  componentWillReceiveProps(nextProps) {
    if (
      isBrowsePage(nextProps) &&
      nextProps.data &&
      nextProps.data.searchResults !==
        (this.props.data && this.props.data.searchResults)
    ) {
      var firstPage =
        (nextProps.data.searchResults.hits &&
          nextProps.data.searchResults.hits.hits) ||
        [];
      this.setState({
        browsePages: { 1: firstPage },
        browseCurrentPage: 1,
        loadingBrowsePage: false,
      });
    }
  },

  componentDidMount() {
    if (
      isBrowsePage(this.props) &&
      this.props.hits.length &&
      !this.state.browsePages[1]
    ) {
      this.setState({ browsePages: { 1: this.props.hits } });
    }
    this.ensureBrowsePageLoaded();
  },

  componentDidUpdate(prevProps) {
    this.ensureBrowsePageLoaded();

    if (
      this.props.params.terms !== prevProps.params.terms ||
      this.props.params.splat !== prevProps.params.splat
    ) {
      this.setState({
        isInspiredByMia: this.isInspiredByMia(),
      });
    }
  },

  onHeightChange(newHeight) {
    this.setState({ minHeight: newHeight });
  },

  getChildContext() {
    return {
      onHeightChange: this.onHeightChange,
    };
  },
});
SearchResults.childContextTypes = { onHeightChange: React.PropTypes.func };
SearchResults.contextTypes = {
  router: React.PropTypes.func,
  universal: React.PropTypes.bool,
  smallViewport: React.PropTypes.bool,
};

module.exports = SearchResults;
