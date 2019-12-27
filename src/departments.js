/** @format
 */
var React = require('react')
var Router = require('react-router')
var { Link } = Router
var Helmet = require('react-helmet')

var Home = require('./home')
var Departments = Home.Departments
var findDepartment = require('./department-slug')

var DepartmentsIndexPage = React.createClass({
  mixins: [Router.State],

  render() {
    return (
      <div>
        <div className="explore-header" />
        <Departments />
        <Helmet title="Departments" />
      </div>
    )
  },
})

var Departments = React.createClass({
  departments: [
    'Art of Africa and the Americas',
    'Chinese, South and Southeast Asian Art',
    'Contemporary Art',
    'Decorative Arts, Textiles and Sculpture',
    'Japanese and Korean Art',
    'Paintings',
    'Photography and New Media',
    'Prints and Drawings',
  ],

  render() {
    const { active, compact } = this.props
    // TODO implement "expanded" view vs compact?

    return (
      <div className="departmentList mdl-grid" id="departments">
        <h2 style={this.props.style} role="heading" aria-level={1}>Departments</h2>
        {this.departments.map(dept => {
          var name = index => findDepartment(dept)[index]
          var isActive = active === dept

          return (
            <Link
              to="department"
              key={name(1)}
              params={{ dept: name(2) }}
              className={`departmentLink mdl-cell mdl-cell--3-col ${isActive &&
              'isActive'}`}
            >
              <div className={[name(1), 'departmentListItem'].join(' ')} />
              <h2 style={this.props.style}>{dept}</h2>
            </Link>
          )
        })}
      </div>
    )
  },
})

module.exports = { index: DepartmentsIndexPage, component: Departments }
