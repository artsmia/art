var React = require("react");
var Router = require("react-router");

var ArtworkResult = require("../artwork-result");

var SearchResultsList = React.createClass({
  mixins: [Router.Navigation],

  render() {
    var { smallViewport, customImage } = this.props;

    var results = this.props.hits.map((hit) => {
      var id = String(hit._source.id || "").replace("http://api.artsmia.org/objects/", "");
      return (
        <div key={id} onClick={this.handleClick.bind(this, hit)}>
          <ArtworkResult
            id={id}
            data={{ artwork: hit._source }}
            highlights={hit.highlight}
            showMore={smallViewport}
            customImage={customImage}
          />
        </div>
      );
    });

    return (
      <div
        className="search-results-wrap clearfix"
        style={{ position: "relative", minHeight: this.props.minHeight }}
      >
        <div className="objects-wrap">
          {results}
        </div>
        <div className="search-results-post">
          {this.props.postSearch}
        </div>
      </div>
    );
  },

  handleClick(hit) {
    if (!hit) return;
    this.transitionTo("artwork", { id: hit._id });
  },
});
SearchResultsList.contextTypes = {
  router: React.PropTypes.func,
  universal: React.PropTypes.bool,
};

module.exports = SearchResultsList;
