var resolveHash = require('when/keys').all

function fetchComponentData(state, initialData) {
  var promises = state.routes.filter((route, index, allRoutes) => {
    // Don't `fetchData` twice for nested routes with the same `Handler`
    // Prefer the parent
    const prevRoute = index > 0 && allRoutes[index-1]
    if(prevRoute && route.handler.fetchData === prevRoute.handler.fetchData) return

    return route.handler.fetchData
  }).reduce((promises, route) => {
    if(initialData) {
      Object.keys(initialData)
      .forEach(key => {
        promises[key] = Promise.resolve(initialData[key])
      })
      return promises
    }

    // `fetchData` is either a function, or an object with keyed functions.
    // If a component requires custom-named data or pulls data from multiple sources,
    // each data is fetched from the value of each entry in the object and made
    // available under the key
    const fetchData = route.handler.fetchData
    if(typeof fetchData == 'function') {
      promises[route.name] = fetchData(state.params, state.query)
    } else if(typeof fetchData == 'object') {
      Object.entries(fetchData).map(([name, _fetchData]) => promises[name] = _fetchData(state.params, state.query))
    }

    return promises
  }, {})

  return resolveHash(promises)
}

module.exports = fetchComponentData
