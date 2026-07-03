var React = require("react");
let LazyLoad = require("react-lazy-load").default;

var Markdown = require("./markdown");
var Image = require("./image");
var NoImagePlaceholder = require("./no-image-placeholder");
var rightsDescriptions = require("./rights-types.js");

var ArtworkImage = React.createClass({
  render() {
    let {
      art,
      id,
      customImage,
      style,
      containerStyle,
      ignoreStyle,
      onImageError,
    } = this.props;

    containerStyle = { minHeight: "173px", ...containerStyle };

    var rights = rightsDescriptions.getRights(art);
    var showImage =
      !!customImage ||
      (art.image == "valid" &&
        art.image_width > 0 &&
        rights !== "Permission Denied");

    if (!showImage) {
      return (
        <div className="artwork-image" style={containerStyle}>
          <NoImagePlaceholder />
        </div>
      );
    }

    let aspectRatio = art.image_width / art.image_height;
    let maxWidth = window.innerWidth ? Math.min(window.innerWidth, 400) : 400;
    let width = aspectRatio >= 1 ? maxWidth : maxWidth / aspectRatio;
    let height = aspectRatio >= 1 ? maxWidth / aspectRatio : maxWidth;
    style = style || { width: width, height: height };

    var image = (
      <Image
        art={art}
        style={style}
        ignoreStyle={ignoreStyle}
        itemProp="image"
        alt={art.description}
        customImage={customImage}
        key={id}
        lazyLoad={this.props.lazyLoad}
        onImageInvalidation={onImageError}
      />
    );

    return (
      <div className="artwork-image" style={containerStyle}>
        {image}
        <Markdown allowAnchors={this.props.allowAnchors}>
          {art.image_copyright}
        </Markdown>
      </div>
    );
  },

  getDefaultProps() {
    return { allowAnchors: true, lazyLoad: true };
  },
});

module.exports = ArtworkImage;
