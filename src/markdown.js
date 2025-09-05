var React = require("react");

const marked = require("marked");
marked.setOptions({
  gfm: true,
  breaks: true,
});

var Markdown = React.createClass({
  render() {
    if (!this.props.children) return <span />;

    var content = this.props.children
      .replace("\n", "\n\n")
      .replace(/<i>([^<]+)<\/?i>/gi, "<i>$1</i>");

    let Tag = this.props.tag || "div";
    let rendered = this.props.alreadyRendered ? content : marked(content);
    if (this.props.tag) rendered = rendered.replace(/<.?p>/g, "").trim();

    if (!this.props.allowAnchors) {
      // This component disallows anchors (probably because this element already
      // appears inside an anchor).
      rendered = rendered.replace(/<a [^>]+>/g, "").replace(/<\/a>/g, "");
    }

    return <Tag dangerouslySetInnerHTML={{ __html: rendered }} />;
  },

  getDefaultProps() {
    return { allowAnchors: true };
  },
});

module.exports = Markdown;
