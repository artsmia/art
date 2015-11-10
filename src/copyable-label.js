var React = require('react')

module.exports = React.createClass({
  render() {
    return <textarea>
      {JSON.stringify(this.props.art, null, 2)}
    </textarea>
  },
})

