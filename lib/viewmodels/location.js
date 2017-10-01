const observable = require('knockout').observable
const observableArray = require('knockout').observableArray
const computed = require('knockout').computed

const Location = require('../models/location')

module.exports = class FilteredLocationViewModel {
  constructor (locations) {
    const _locations = locations.map(location => new Location(location.name, location.coords))

    this.filtered = observableArray(_locations)
    this.search = observable('')
    
    const self = this

    self.search.subscribe((input) => {
      //self.filtered.removeAll()
      console.log(_locations.length)
      /*self._locations.forEach((loc) => {
        console.log(loc.name)
        self.filtered.push(loc)
      })*/
      
      /*
      if (!input) {
        self._backed().forEach((loc) => {
          self.filtered.push(loc)
        })
        return
      }
      
      const l = self._backed().filter((location) => {
        return location.name.toLowerCase().indexOf(input.toLowerCase()) > -1
      })
      console.log(l)
      l.forEach(l => self.filtered.push(l))*/
    })
  }
}
