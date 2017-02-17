var React = require('react')
var rest = require('rest')
var Markdown = require('./markdown')

var ExpandableNewArtsmiaContentBlock = React.createClass({
  // statics: {
  //   fetchData: (params, query) => {
  //   }
  // },
  getInitialState() {
    return {
      expanded: false,
      loaded: false,
    }
  },

  componentWillMount() {
    this.loadExternalContent()
  },

  loadExternalContent() {
    return rest('https://new.artsmia.org/wp-json/wp/v2/pages?slug='+this.props.page)
    .then((r) => JSON.parse(r.entity))
    .then(json => this.setState({loaded: true, json: json}))
  },

  render() {
    var {loaded, expanded, json} = this.state
    var toggleButton = <a href="#" onClick={this.toggle}>{expanded ? 'Less' : 'More'} Info</a>

    var content = loaded && <div><Markdown>
      {json[0].acf.modules[1].content[0].text}
    </Markdown><hr /></div>

    return <div>
      <p>{toggleButton}</p>
      {loaded && expanded && content}
    </div>
  },

  toggle(event) {
    this.setState({expanded: !this.state.expanded})
    event.preventDefault()
    return false
  },
})

module.exports = ExpandableNewArtsmiaContentBlock
