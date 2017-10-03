module.exports = class Location {
  constructor (name, coords) {
    this.name = name
    this.coords = coords
  }

  static create (name, coords) {
    return new Location(name, coords)
  }
}
