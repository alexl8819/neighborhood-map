function Location (name, coords, wiki) {
  if (!(this instanceof Location)) {
    return new Location(name, coords, wiki)
  }
  
  this.name = name
  this.coords = coords
  this.wiki = wiki
}

Location.create = function (name, coords, wiki) {
  return new Location(name, coords, wiki)
}

module.exports = Location
