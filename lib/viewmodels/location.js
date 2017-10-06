var observable = require('knockout/build/output/knockout-latest').observable
var observableArray = require('knockout/build/output/knockout-latest').observableArray
var pureComputed = require('knockout/build/output/knockout-latest').pureComputed
var arrayFilter = require('knockout/build/output/knockout-latest').utils.arrayFilter

var Location = require('../models/location')

function FilteredLocationViewModel (locations) {
  if (!(this instanceof FilteredLocationViewModel)) {
    return new FilteredLocationViewModel(locations)
  }

  var _locations = locations.map(function (location) {
    return Location.create(location.name, location.coords)
  })
  
  // Observables
  this.locations = observableArray(_locations)
  this.search = observable('')
  this.active = observable('')
    
  // Computed
  this.filtered = pureComputed(function () {
    var filter = this.search()

    if (!filter) {
      return this.locations()
    }
      
    return arrayFilter(this.locations(), function (location) {
      return location.name.toLowerCase().indexOf(filter.toLowerCase()) > -1
    })
  }, this)
  
  // TODO: FIXME - This is really ugly
  this.select = function (location) {
    this.active(location && location.name ? location.name : '')
  }.bind(this)
}

module.exports = FilteredLocationViewModel
