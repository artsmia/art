var React = require('react')
var Router = require('react-router')
var { Link } = Router
var rest = require('rest')

var SEARCH = require('./search-endpoint')
var ClickToSelect = require('react-click-to-select')
var ImageQuilt = require('./image-quilt')

// TODO: I can't get onClick to work directly on <ClickToSelect>??

var Peek = React.createClass({
  getInitialState() {
    return {
      open: false
    }
  },

  render() {
    return <div onClick={this.onClick} testing={123}>
      <ClickToSelect>
        {this.props.children}
      </ClickToSelect>
      {this.state.open && <div className="peek">
        <Link to="searchResults" params={{terms: this.state.query}}>
          {this.state.result && this.quiltFromResults()}
          search for {this.state.query} &rarr;
        </Link>
      </div>}
    </div>
  },

  onClick() {
    if(this.state.open) return this.setState({open: false})

    var q = React.findDOMNode(this).innerText

    this.setState({
      open: true,
      loading: true,
      query: q,
    })
    
    this.state.result || rest(`${SEARCH}/${q}?size=10`).then((r) => {
      this.setState({
        result: JSON.parse(r.entity),
        loading: false,
      })
    })
  },

  quiltFromResults() {
    if(!this.state.result) return ''
    var wImg = ImageQuilt.getImagedResults(this.state.result.hits.hits)
    return <ImageQuilt maxRows={2} maxWorks={10} artworks={wImg} />
  },
})

module.exports = Peek
