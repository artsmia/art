/** @jsx React.DOM **/

var Section = React.createClass({
  handleClick: function() {
    if (this.state.open) {
      this.setState({
        open: false,
        class: "section"
      });
    } else {
      this.setState({
        open: true,
        class: "section open"
      });
    }
  },
  getInitialState: function() {
    return {
      open: false,
      class: "section"
    }
  },
  render: function() {
    return ( < div className = {
        this.state.class
      } >
      < button > toggle < /button> < div className = "sectionhead"
      onClick = {
        this.handleClick
      } > {
        this.props.title
      } < /div> < div className = "articlewrap" > < div className = "article" > {
      this.props.children
    } < /div> < /div > < /div>
  );
}
});

var Accordion = React.createClass({
  render: function() {
    return ( < div className = "main" >
      < div className = "title" > {
        this.props.title
      } < /div> < Section title = "Section Title One" > Lorem ipsum dolor sit amet, consectetur adipisicing elit.Amet nemo harum voluptas aliquid rem possimus nostrum excepturi! < /Section > < Section title = "Section Title Two" > Lorem ipsum dolor sit amet, consectetur adipisicing elit.Amet nemo harum voluptas aliquid rem possimus nostrum excepturi! < /Section> < Section title = "Section Title Three" > Lorem ipsum dolor sit amet, consectetur adipisicing elit.Amet nemo harum voluptas aliquid rem possimus nostrum excepturi! < /Section > < /div >
    );
  }
});

React.renderComponent( < Accordion title = "Accordion Title Here" / > , document.getElementById('accordian'));