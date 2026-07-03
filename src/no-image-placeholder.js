var React = require("react");
var cx = require("classnames");

var NoImagePlaceholder = React.createClass({
  render() {
    var { className, style } = this.props;
    return (
      <div className={cx("no-image-placeholder", className)} style={style}>
        <span className="no-image-placeholder-label">No Image Available</span>
      </div>
    );
  },
});

module.exports = NoImagePlaceholder;
