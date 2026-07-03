var React = require("react");
var Router = require("react-router");
var { Link } = Router;
var rest = require("rest");
var Helmet = require("react-helmet");
var cx = require("classnames");

var ArtworkImage = require("./artwork-image");
var Markdown = require("./markdown");
var ArtworkPreview = require("./artwork-preview");
var ArtworkDetails = require("./artwork-details");
var _Artwork = require("./_artwork");
var Image = require("./image");
var imageCDN = require("./image-cdn");
var SEARCH = require("./endpoints").search;
var ArtworkRelatedContent = require("./artwork-related");
var ArtworkPageMetadata = require("./artwork/page-metadata");
var rightsDescriptions = require("./rights-types.js");
var ClosedBanner = require("./museum-closed-banner");
var NoImagePlaceholder = require("./no-image-placeholder");

var Sticky = require("react-sticky");

var Artwork = React.createClass({
  mixins: [Router.State],
  statics: {
    fetchData: {
      artwork: (params, existingData) => {
        if (existingData && existingData.id && existingData.id == params.id)
          return Promise.resolve(existingData);
        return rest(`${SEARCH}/id/` + params.id)
          .then((r) => {
            console.log("rest URL", `${SEARCH}/id/` + params.id);
            console.log("r.entity", r.entity);
            return JSON.parse(r.entity);
          })
          .then((art) => {
            art.slug = _Artwork.slug(art);
            return art;
          });
      },
    },

    checkRoute: (params, callback) => {
      var existingArt = window.__DATA__ && window.__DATA__.artwork;

      return Artwork.fetchData.artwork(params, existingArt).then((art) => {
        window.__DATA__ = { artwork: art };
        if (art.slug !== params.slug) {
          params.slug = art.slug;
          return callback("mismatched slug", art);
        }

        if (
          (isLoan(art) || notPublicAccess(art)) &&
          !window.privilegedClientIP
        ) {
          return callback("permission denied", art);
        }

        callback(false, art);
      });
    },

    willTransitionTo: function (transition, params, query, callback) {
      if (params.id === "leaflet-src.js.map")
        return transition.redirect("home", { ...params, status: 404 });

      Artwork.checkRoute(params, (err) => {
        switch (err) {
          case "mismatched slug":
            transition.redirect("artworkSlug", params);
          case "permission denied":
            transition.redirect("home", { ...params, status: 403 });
        }
      }).then(callback);
    },
  },

  render() {
    var art = this.state.art;
    var id = this.props.id || this.state.id;
    const highlights = this.props.highlights;
    var stickyMapStyle = this.context.universal ? { position: "fixed" } : {};
    var { smallViewport } = this.context;

    var pageTitle = [
      art.title.replace(/<[^ ]+?>/g, '"'),
      _Artwork.Creator.getFacetAndValue(art)[1],
    ]
      .filter((e) => e)
      .join(", ");

    var imageUrl = art.image_url || imageCDN(id);
    var canonicalURL = `https://collections.artsmia.org/art/${art.id}/${art.slug}`;

    var aspectRatio = art.image_width / art.image_height;
    var mapHeight =
      aspectRatio && art.image == "valid"
        ? Math.max(40, Math.min(65, (1 / aspectRatio) * 80))
        : 20;
    if (smallViewport && this.state.show3d) mapHeight = 67;

    var image = (
      <Image
        art={art}
        style={{ maxWidth: "95%", maxHeight: mapHeight - 5 + "vh" }}
      />
    );

    var showMoreIcon =
      Object.keys(art).filter(
        (key) => key.match(/related:/) && !key.match(/related:exhibitions/)
      ).length > 0 && !this.state.fullscreenImage;
    var toggleRelated = this.state.smallViewportShowInfoOrRelatedContent;
    var infoRelatedToggleStyles = {
      position: "absolute",
      zIndex: "10000",
      right: "7px",
      bottom: "7px",
      color: "#232323",
      backgroundColor: "rgba(255, 255, 255, 0.7)",
      borderRadius: "1em",
      lineHeight: "0.3em",
      padding: "0.3em",
    };
    var exploreStyle = {
      display: "block",
      transform: "translateY(-13px)",
      paddingLeft: "2em",
      // TODO - use a background image to center this better?
      // but it's hard because one thing we want to use is a font icon
      // and the other is an svg…
      // backgroundImage: 'url(/images/more.svg)',
      // backgroundPosition: 'left center',
      // backgroundRepeat: 'none',
    };
    var exploreIcon = showMoreIcon && (
      <a
        href="#"
        onClick={this.toggleInfoAndRelatedContent}
        style={infoRelatedToggleStyles}
      >
        {!toggleRelated ? (
          <img src="/images/more.svg" style={{ width: "1.7em" }} />
        ) : (
          <i className="control material-icons">info</i>
        )}
        <span style={exploreStyle}>{!toggleRelated ? "Explore" : "Info"}</span>
      </a>
    );
    var relatedContent = <ArtworkRelatedContent id={id} art={art} />;

    var mapStyle = smallViewport
      ? { width: "100%", display: "inline-block", height: mapHeight + "vh" }
      : stickyMapStyle;

    var rights = rightsDescriptions.getRights(art);
    var map = (
      <div
        ref="map"
        id="map"
        style={mapStyle}
        className="leaflet-container"
      >
        {this.state.has3d && (
          <SketchfabEmbed model={this.state.has3d} show={this.state.show3d} />
        )}
        {(art.image == "valid" && rights !== "Permission Denied" && (
          <div
            id="staticImage"
          >
            {image}
            {(art.image_copyright && (
                <p style={{ fontSize: "0.8em" }}>
                  {decodeURIComponent(art.image_copyright)}
                </p>
              ))}
          </div>
        )) || <ArtworkNoImagePlaceholder art={art} />}
        {smallViewport && showMoreIcon && exploreIcon}
      </div>
    );

    var showCropUI = this.state.showBiggie;
   

    var info = (
      <div className="info">
        {this.props.children || (
          <div>
            {smallViewport && (
              <div style={{ margin: "-2em 0 1em 0" }}></div>
            )}
            <ArtworkPreview
              art={art}
              showLink={this.props.showLink}
              showDuplicateDetails={true}
            />
            {this.state.has3d && (
              <div className="images">
                <p onClick={this.toggle3d}>
                  {this.state.show3d ? "show high-res image" : "show 3D model"}
                </p>
              </div>
            )}
            <div className="back-button">
              {this.props.showLinkComponent ||
                (window.history && history.length > 1 ? (
                  <a href="#" onClick={() => history.go(-1)}>
                    <i className="material-icons">arrow_back</i> back
                  </a>
                ) : (
                  <Link to="/">
                    <i className="material-icons">arrow_back</i> home
                  </Link>
                ))}
            </div>
            {smallViewport || relatedContent}
            <div>
              <h5 className="details-title">Details</h5>
              <ArtworkDetails art={art} show3d={this.state.show3d} />
            </div>
          </div>
        )}
        <ClosedBanner />
      </div>
    );

    var smallViewportWithTabbedInfoAndRelated = (
      <div>
        <div style={{ display: !!toggleRelated ? "none" : "block" }}>
          {info}
        </div>
        <div style={{ display: !toggleRelated ? "none" : "block" }}>
          <div className="info">{relatedContent}</div>
        </div>
      </div>
    );
    // TODO: should the related content be in both the info and more-specific view?
    // react can't gradt an <audio> tag while playing, so showing it in both places makes the playback weird.
    // code below in case this needs to be revisited
    // {(smallViewport && toggleRelated) || relatedContent} <- goes into info div
    // var smallViewportWithTabbedInfoAndRelated = !toggleRelated ?
    //   info :
    //   <div className="info">{relatedContent}</div>

    var content;
    if (smallViewport) {
      content = (
        <div>
          {map}
          {smallViewportWithTabbedInfoAndRelated}
        </div>
      );
    } else {
      content = (
        <div>
          {info}

          <Sticky
            stickyStyle={{
              position: "fixed",
              height: "100%",
              width: "65%",
              top: 0,
              transform: "translate3d(0px,0px,0px)",
            }}
          >
            {map}
          </Sticky>
        </div>
      );
    }

    return (
      <div className={cx("artwork", { smallviewport: smallViewport })}>
        {content}
        <ArtworkPageMetadata art={art} noIndex={this.notPublicAccess()} />
      </div>
    );
  },

  toggle3d() {
    var nextShow3d = !this.state.show3d;
    this.setState({ show3d: nextShow3d });
  },

  getInitialState() {
    var art = this.props.data.artwork;
    art.id =
      this.props.id ||
      (isNaN(art.id)
        ? art.id.replace("http://api.artsmia.org/objects/", "")
        : art.id);

    var has3Dmodel = art["related:3dmodels"] && art["related:3dmodels"][0];
    var navigatedFrom3dModelSearch =
      window &&
      window.lastSearchedTerms &&
      window.lastSearchedTerms.indexOf("related:3dmodels") >= 0;

    var rights = rightsDescriptions.getRights(art);
    const showBiggie =
      art.restricted === 0 ||
      [
        "Copyright Protected",
        "Needs Permission",
        "In Copyright",
        "In Copyright - Rights-holder(s) Unlocatable or Unidentifiable",
        "In Copyright–Rights-holder(s) Unlocatable",
        "Copyright Not Evaluated",
        "Permission Denied",
      ].indexOf(rights) < 0;

    return {
      art: art,
      id: art.id,
      fullscreenImage: false,
      has3d: has3Dmodel,
      show3d: navigatedFrom3dModelSearch,
      smallViewportShowInfoOrRelatedContent: window && window.enteredViaMore,
      showBiggie,
    };
  },

  shouldComponentUpdate(prevProps, prevState) {
    return true;
  },

  componentDidMount() {
    this.initView();
  },

  initView() {
    var art = this.state.art;

   

    var { smallViewport } = this.context;
    // push the viewport down past the header to maximize image/text on the page
    // scrolling back up reveals the menu
    // TODO: is there a way to automatically trigger safari's minimal chrome other than a user-initiated scroll event? (probably not https://stackoverflow.com/a/26884561)
    if (smallViewport && window.scrollX == 0)
      setTimeout(() => window.scrollTo(0, 56), 0);
  },

  componentDidUpdate() {
    if (this.context.smallViewport != this.state.lastSmallViewportSetting) {
      this.setState({ lastSmallViewportSetting: this.context.smallViewport });
   
    }

    if (this.state.id !== this.props.data.artwork.id) {
      this.setState(this.getInitialState());
      setTimeout(this.initView, 1000);
    }
  },


  /**
   * convert the currently viewed area of the zoomable image to an IIIF deriv
   * thankya https://bl.ocks.org/mejackreed/6936585f435b60aa9451ae2bc1c199f2
   */
 

  calculateImagePixelSize(size) {
    var { image_width, image_height } = this.state.art;
    var maxDimension = Math.max(image_width, image_height);
    var size = size || maxDimension;
    var ratio = Math.floor(maxDimension / size);

    return Math.floor(image_width / ratio) * Math.floor(image_height / ratio);
  },

  // how many more pixels are in the full sized image than the given thumbnail?
  getPixelDifference(size = 800) {
    return Math.floor(
      this.calculateImagePixelSize() - this.calculateImagePixelSize(800)
    );
  },

  isLoan() {
    return this.state.art.accession_number.match(/^L/i);
  },

  notPublicAccess() {
    return (
      isLoan(this.state.art) ||
      notPublicAccess(this.state.art) ||
      process.env.NODE_ENV !== "production"
    );
  },

  toggleInfoAndRelatedContent(event) {
    this.setState({
      smallViewportShowInfoOrRelatedContent:
        !this.state.smallViewportShowInfoOrRelatedContent,
    });
    event.preventDefault();
  },
});
Artwork.contextTypes = {
  router: React.PropTypes.func,
  universal: React.PropTypes.bool,
  smallViewport: React.PropTypes.bool,
  clientIp: React.PropTypes.string,
};

var noImageStyle = {
  wrapper: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    WebkitTransform: "translate(-50%, -50%)",
    width: "77%",
    textAlign: "center",
  },
};
var ArtworkNoImagePlaceholder = React.createClass({
  render() {
    var { art } = this.props;
    var model = art["related:3dmodels"] && art["related:3dmodels"][0];
    return model ? (
      <SketchfabEmbed model={model} />
    ) : (
      <div style={noImageStyle.wrapper}>
        <NoImagePlaceholder />
      </div>
    );
  },
});

var SketchfabEmbed = React.createClass({
  render() {
    var showHideStyle = {};
    if (!this.props.show) showHideStyle.visibility = "hidden";
    return (
      <div className="sketchfab-embed-wrapper" style={showHideStyle}>
        <iframe
          src={`${this.props.model.link}/embed?autostart=1&preload=1&ui_infos=0`}
          frameborder="0"
          allowvr
          allowfullscreen
          mozallowfullscreen="true"
          webkitallowfullscreen="true"
          onmousewheel=""
        ></iframe>
      </div>
    );
  },
});

module.exports = Artwork;

function isLoan(art) {
  return !!art.accession_number.match(/^L/i);
}
function notPublicAccess(art) {
  return art.public_access === "0";
}

