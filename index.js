'use strict'

var createServer = require('http').createServer
var ecstatic = require('ecstatic')
var logger = require('pino')()

var server = createServer(ecstatic({
  root: 'public'
})).listen(process.env.PORT || 8080, function () {
  logger.info('Listening on port %d', server.address().port)
})
