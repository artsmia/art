var React = require("react");
var Router = require("react-router");
var { Link } = Router;

var Search = require("./search");
var MapPage = require("./map-page");
var HomeNewToMia = require("./home-new-to-mia");
var homeFetchData = require("./home-fetch-data");

var Home = React.createClass({
  statics: {
    fetchData: homeFetchData,
  },

  render() {
    return (
      <div className="home-page">
        <Search
          hideResults={true}
          activateInput={true}
          heroLayout={true}
          searchAll={true}
          suggestStyle={{ margin: "0.75rem 0 0" }}
          {...this.props}
        />
        <main className="home-main">
          <HomeNewToMia data={this.props.data} />
        </main>
        <div id="map">
          <MapPage hideList={true}>
            <Link
              to="map"
              style={{
                textAlign: "center",
                float: "right",
                paddingRight: "1em",
              }}
            >
              All galleries
            </Link>
          </MapPage>
        </div>
      </div>
    );
  },
});
Home.contextTypes = {
  smallViewport: React.PropTypes.bool,
};

module.exports = Home;
