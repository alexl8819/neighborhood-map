function Location (name, coords) {
  if (!(this instanceof Location)) {
    return new Location(name, coords)
  }
  
  this.name = name
  this.coords = coords
}

Location.create = function (name, coords) {
  return new Location(name, coords)
}

module.exports = Location
