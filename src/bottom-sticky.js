var React = require('react')
var Sticky = require('react-sticky')

// A fixed box that's 'synthetically' scrolled along with the rest of the
// viewport by adjusting the position `top` to 'pull the content up' the
// screen.
var BottomSticky = React.createClass({
  render() {
    var {stickyStyle, ...other} = this.props
    var {style} = this.state

    return <Sticky stickyStyle={style} {...other} onStickyStateChange={this.stickyChanged}>
      {this.props.children}
    </Sticky>
  },

  stickyChanged(isSticky) {
    this.setState({
      isSticky: isSticky,
      style: !isSticky ? this.props.stickyStyle : this.state.style,
      initialScrollY: 0,
    })

    this.getSizeAndScroll()
  },

  getInitialState() {
    return {
      style: this.props.stickyStyle,
    }
  },

  componentDidMount: function() {
    this.getSizeAndScroll()
    window.addEventListener('scroll', this.scrolled)
  },

  componentWillUnmount() {
    window.removeEventListener('scroll', this.scrolled)
  },

  componentWillReceiveProps(nextProps) {
    setTimeout(() => {
      this.getSizeAndScroll()
      this.scrolled()
    }, 0)
  },

  getSizeAndScroll() {
    var domNode = React.findDOMNode(this)

    var state = {
      height: domNode.clientHeight,
      initialScrollY: this.state.isSticky && window.scrollY,
    }
    this.setState(state)
  },

  scrolled() {
    this.adjustScroll()
  },

  adjustScroll() {
    // if(this.state.isSticky && React.findDOMNode(this).clientHeight > window.innerHeight) {
    var {style, initialScrollY, height} = this.state
    var currentScrollY = window.scrollY
    var amountToScroll = height - window.innerHeight
    var scrollAdjustment = Math.max(0, Math.min(amountToScroll, currentScrollY - initialScrollY))

    var top = scrollAdjustment+scrollAdjustment/amountToScroll*16
    style.top = top === 0 ? top : -top
    this.setState({style: style})
  }
})

module.exports = BottomSticky
