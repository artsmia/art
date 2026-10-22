var React = require("react");
var { Link } = require("react-router");
var cx = require("classnames");

/**
 * Blur + overlay when art.content_warnings is set.
 * Compact thumbnails have no reveal control. They unblur only when a
 * parent passes `revealed` (side panel or object page, via the shared store).
 */
var ImageAdvisory = React.createClass({
  getInitialState() {
    return { localRevealed: false };
  },

  isRevealed() {
    if (this.props.revealed != null) {
      return !!this.props.revealed;
    }
    return this.state.localRevealed;
  },

  swallowClick(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
  },

  reveal(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (this.props.onReveal) {
      this.props.onReveal();
    } else {
      this.setState({ localRevealed: true });
    }
  },

  render() {
    var { art, children, compact, artworkLink } = this.props;
    var image = artworkLink && art ? (
      <Link to="artwork" params={{ id: art.id }}>
        {children}
      </Link>
    ) : (
      children
    );

    if (!art || !art.content_warnings) {
      return image;
    }

    var showOverlay = !this.isRevealed();

    return (
      <div
        className={cx("image-advisory-frame", {
          "is-blurred": showOverlay,
          "image-advisory-frame--compact": compact,
        })}
      >
        {image}
        {showOverlay && (
          <div
            className="image-advisory-overlay"
            onClick={compact ? undefined : this.swallowClick}
          >
            <div className="image-advisory-overlay__content">
              {compact ? (
                <i
                  className="fa-regular fa-eye-slash image-advisory-overlay__icon"
                  title="Content advisory"
                  aria-hidden="true"
                />
              ) : (
                <div className="image-advisory-overlay__layout">
                  <div className="image-advisory-overlay__message">
                    <i
                      className="fa-regular fa-eye-slash image-advisory-overlay__icon"
                      aria-hidden="true"
                    />
                    <strong>Content advisory</strong>
                    <p>
                      <span>
                        This work contains graphic depictions of violence,
                        serious
                      </span>
                      <span>
                        injury, severe emaciation, death, or human&nbsp;remains.
                      </span>
                    </p>
                  </div>
                  <div className="image-advisory-overlay__footer">
                    <hr className="image-advisory-overlay__rule" />
                    <button
                      type="button"
                      className="image-advisory-overlay__action"
                      onClick={this.reveal}
                    >
                      View image
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  },
});

module.exports = ImageAdvisory;
