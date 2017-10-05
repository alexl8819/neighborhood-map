var concat = require('simple-get').concat

var pkg = require('../../package.json')

var WIKIMEDIA_API_BASE = 'https://en.wikipedia.org/w/api.php'

function Wikipedia (pageid, image) {
  this.pageid = pageid
  this.image = image
}

Wikipedia.getPlainTexts = function (ids, done) {
  if (!Array.isArray(ids)) {
    return done(new Error('ids must be an array'))
  }

  return concat({
    url: WIKIMEDIA_API_BASE + 
      '?action=query&prop=extracts&exlimit=max&explaintext&exintro&format=json&pageids=' + 
      ids.join('|'),
    headers: {
      'User-Agent': pkg.name + '@' + pkg.version
    },
    json: true
  }, function (err, res, data) {
    if (err) {
      return done(err)
    }

    if (res.statusCode !== 200) {
      return done(new Error('Invalid status code: ' + res.statusCode))
    }

    done(null, data.query.pages)
  })
}

Wikipedia.getImages = function (files) {
  return concat({
    url: WIKIMEDIA_API_BASE + 
      '?action=query&prop=imageinfo&iiprop=url&format=json&titles=' + 
      files.join('|'),
    json: true
  }, function (err, res, data) {
    if (err) {
      return done(err)
    }

    if (res.statusCode !== 200) {
      return done(new Error('Invalid status code: ' + res.statusCode))
    }

    done(null, data.query.pages)
  })
}

module.exports = Wikipedia
