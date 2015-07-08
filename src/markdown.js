var React = require('react')

const marked = require('marked')
marked.setOptions({
  gfm: true,
  breaks: true,
})

var Markdown = React.createClass({
  render() {
    if(!this.props.children) return <span />
    const rendered = marked(this.props.children.replace('\n', '\n\n'))
    return <div dangerouslySetInnerHTML={{__html: rendered}}></div>
  },
})


module.exports = Markdown
