var Wikipedia = require('./wikipedia')

function Location (name, coords) {
  if (!(this instanceof Location)) {
    return new Location(name, coords)
  }
  
  this.name = name
  this.coords = coords
  this.wiki = Wikipedia(wiki.pageid, wiki.image)
}

Location.create = function (name, coords) {
  return new Location(name, coords)
}

module.exports = Location
