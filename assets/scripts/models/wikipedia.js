'use strict'

var jsonp = require('jsonp')

var WIKIMEDIA_API_BASE = 'https://en.wikipedia.org/w/api.php'

exports.getDescriptions = function (pageids, done) {
  if (!Array.isArray(pageids)) {
    return done(new Error('pageids must be an array'))
  }

  return jsonp(
    WIKIMEDIA_API_BASE +
    '?action=query&prop=extracts&exlimit=max&explaintext&exintro&format=json&pageids=' +
    pageids.join('|'),
    function (err, data) {
      if (err) {
        return done(err)
      }

      if (!data || !data.query) {
        return done(new Error('Unexpected document result'))
      }

      if (!data.query.hasOwnProperty('pages')) {
        return done(new Error('Unexpected query result'))
      }

      var pages = Object.keys(data.query.pages)
      var descriptions = {}

      pages.forEach(function (page) {
        var description = data.query.pages[page]
        var pageid = parseInt(page, 10) || -1

        descriptions[pageid] = description.extract
      })

      done(null, descriptions)
    })
}

exports.getImages = function (files, done) {
  if (!Array.isArray(files)) {
    return done(new Error('files must be an array'))
  }

  return jsonp(
    WIKIMEDIA_API_BASE +
    '?action=query&prop=imageinfo&iiprop=url&format=json&titles=' +
    files.join('|'),
    function (err, data) {
      if (err) {
        return done(err)
      }

      if (!data || !data.query) {
        return done(new Error('Unexpected document result'))
      }

      if (!data.query.hasOwnProperty('pages')) {
        return done(new Error('Unexpected query result'))
      }

      var pages = Object.keys(data.query.pages)
      var images = {}

      pages.forEach(function (page) {
        var image = data.query.pages[page]

        if (Array.isArray(image.imageinfo) &&
            image.imageinfo.length > 0) {
          images[image.title] = image.imageinfo[0].url || null
        }
      })

      done(null, images)
    })
}
