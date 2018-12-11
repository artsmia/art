var React = require('react')
var ReactDOM = require('react-dom')
var Sticky = require('react-sticky')

// A fixed box that's 'synthetically' scrolled along with the rest of the
// viewport by adjusting the position `top` to 'pull the content up' the
// screen.
var BottomSticky = React.createClass({
  render() {
    var {stickyStyle, ...other} = this.props
    var {style, isSticky} = this.state

    const _style = !isSticky ? stickyStyle : style

    return <Sticky
      stickyStyle={_style}
      {...other}
      onStickyStateChange={this.stickyChanged}
    >
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
    window.addEventListener('peek', this.refresh)
  },

  componentWillUnmount() {
    window.removeEventListener('scroll', this.scrolled)
    window.removeEventListener('peek', this.refresh)
  },

  componentWillReceiveProps(nextProps) {
    this.refresh(0, true)
  },

  componentWillUpdate(nextProps, nextState) {
    if(this.state.isSticky !== nextState.isSticky) {
      this.refresh(0)
    }
    if(this.state.height !== nextState.height && nextState.height > 0) {
      // if the height changes, notify Search through this method exposed
      // on `context` so it can adjust things to ensure smooth, happy
      // scrolling
      this.context.onHeightChange(nextState.height)
    }
  },

  getSizeAndScroll() {
    var domNode = ReactDOM.findDOMNode(this)

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
    var {style, initialScrollY, height, isSticky} = this.state
    var currentScrollY = window.scrollY
    var amountToScroll = height - window.innerHeight + 200
    var scrollAdjustment = Math.max(0, Math.min(amountToScroll, currentScrollY - initialScrollY))

    var top = scrollAdjustment+scrollAdjustment/amountToScroll*16
    style.top = top === 0 ? top : -top
    this.setState({style: style})
  },

  refresh(delay=300, adjustScroll=false) {
    this.getSizeAndScroll()
    adjustScroll && this.scrolled()
    setTimeout(() => {
      this.getSizeAndScroll()
      adjustScroll && this.scrolled()
    }, delay)
  },
})
BottomSticky.contextTypes = {
  onHeightChange: React.PropTypes.func,
}

module.exports = BottomSticky
