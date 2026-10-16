var React = require("react");
var cx = require("classnames");

/**
 * Blur + overlay when art.content_warnings is set.
 * Controlled via `revealed` / `onReveal` when a parent shares reveal state
 * (e.g. search gallery + focused preview). Otherwise uses local dismiss state.
 *
 * Only the button reveals. Overlay clicks bubble so a blurred thumbnail can
 * still be selected into the search preview (image stays blurred).
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
    var { art, children, compact } = this.props;
    if (!art || !art.content_warnings) {
      return children;
    }

    var showOverlay = !this.isRevealed();

    return (
      <div
        className={cx("image-advisory-frame", {
          "is-blurred": showOverlay,
          "image-advisory-frame--compact": compact,
        })}
      >
        {children}
        {showOverlay && (
          <div className="image-advisory-overlay">
            <div className="image-advisory-overlay__content">
              {!compact && <strong>Content advisory</strong>}
              {!compact && (
                <p style={{ whiteSpace: "pre-line" }}>{art.content_warnings}</p>
              )}
              <button type="button" onClick={this.reveal}>
                {compact ? "View" : "View image"}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  },
});

module.exports = ImageAdvisory;
