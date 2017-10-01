const ready = require('document-ready')
const GoogleMapsLoader = require('google-maps')
const applyBindings = require('knockout').applyBindings

const FilteredLocationViewModel = require('./lib/viewmodels/location')

const config = require('./config.json')

GoogleMapsLoader.KEY = config.google_maps_api.key
GoogleMapsLoader.LANGUAGE = config.google_maps_api.language
GoogleMapsLoader.REGION = config.google_maps_api.region

ready(() => {
  const container = document.querySelector('#map')

  if (!container) {
    throw new Error('Map container (#map) not found. Unable to initialize google maps')
  }

  const flvm = new FilteredLocationViewModel(
    config.default_locations || [])

  GoogleMapsLoader.load((google) => {
    const map = new google.maps.Map(container, {
      center: config.center,
      zoom: 11,
      fullscreenControl: true
    })
    
    //flvm.search.subscribe(flvm.update.bind(flvm))
    
    /*
    let marker = new google.maps.Marker({
      position: {},
      title: 'Test'
    })
    // to add -> marker.setMap(map)
    // to delete -> marker.setMap(null) && marker = null
      */
  })
  
  applyBindings(flvm)
})
