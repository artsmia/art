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
    'Department of the Arts of Global Africa',
    'Department of Global Contemporary Art',
    'Department of European Art',
    'Department of Asian Art',
    'Department of the Arts of the Americas',
  ],

  render() {
    const { active, compact } = this.props
    // TODO implement "expanded" view vs compact?

    return (
      <div className="departmentList mdl-grid" id="departments">
        <h2 style={this.props.style}>Departments</h2>
        {this.departments.map(dept => {
          var name = index => findDepartment(dept)[index]
          var isActive = active === dept
          var deptLink = `https://new.artsmia.org/art-artists/curatorial-departments/${name(2)}`

          return (
            <a
              href={deptLink}
              className={`departmentLink mdl-cell mdl-cell--3-col ${isActive &&
                'isActive'}`}
            >
              <div className={[name(1), 'departmentListItem'].join(' ')} />
              <h2 style={this.props.style}>{dept}</h2>
            </a>
          )
        })}
      </div>
    )
  },
})

module.exports = { index: DepartmentsIndexPage, component: Departments }
