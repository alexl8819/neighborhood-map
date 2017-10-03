const observable = require('knockout/build/output/knockout-latest').observable
const observableArray = require('knockout/build/output/knockout-latest').observableArray
const pureComputed = require('knockout/build/output/knockout-latest').pureComputed
const arrayFilter = require('knockout/build/output/knockout-latest').utils.arrayFilter

const Location = require('../models/location')

module.exports = class FilteredLocationViewModel {
  constructor (locations = []) {
    this.locations = observableArray(locations.map(
      location => Location.create(location.name, location.coords)))
    this.search = observable('')
    this.filtered = pureComputed(() => {
      const filter = this.search()

      if (!filter) {
        return this.locations()
      }
      
      return arrayFilter(this.locations(), (location) => {
        return location.name.toLowerCase().indexOf(filter.toLowerCase()) > -1
      })
    }, this)
  }
}
