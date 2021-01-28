var React = require('react')

const museumClosed = false

module.exports = (props) => museumClosed ? <p style={{backgroundColor: '#ef3535', color: 'white', textAlign: 'center', padding: '1em'}}>
  The museum is temporarily closed, starting Saturday, November 21.
  {' '}<a href="https://new.artsmia.org/covid-19" style={{color: 'white', textDecoration: 'underline'}}>Learn more.</a>
</p> : <span />
