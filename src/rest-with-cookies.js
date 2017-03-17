var rest = require('rest')

var restDefaultInterceptor = require('rest/interceptor/defaultRequest')
var restWithCorsCookies = rest.wrap(restDefaultInterceptor, {
  mixin: {
    withCredentials: true
  }
})

module.exports = restWithCorsCookies
