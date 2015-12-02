var React = require('react')

const marked = require('marked')
marked.setOptions({
  gfm: true,
  breaks: true,
})

var Markdown = React.createClass({
  render() {
    var content = this.props.children
      .replace('\n', '\n\n')
      .replace(/<i>([^<]+)<\/?i>/gi, '<i>$1</i>')

    if(!this.props.children) return <span />
    const rendered = this.props.alreadyRendered ? content : marked(content)
    return <div dangerouslySetInnerHTML={{__html: rendered}}></div>
  },
})


module.exports = Markdown
