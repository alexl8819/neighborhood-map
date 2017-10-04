const ready = require('document-ready')
const GoogleMapsLoader = require('google-maps')
const applyBindings = require('knockout/build/output/knockout-latest').applyBindings

const FilteredLocationViewModel = require('./lib/viewmodels/location')

const config = require('./config.json')

GoogleMapsLoader.KEY = config.google_maps_api.key
GoogleMapsLoader.LANGUAGE = config.google_maps_api.language
GoogleMapsLoader.REGION = config.google_maps_api.region

ready(() => {
  const container = document.querySelector('#map')
  const markers = new Map()

  if (!container) {
    throw new Error(
      'Map container not found. Unable to initialize google maps')
  }

  const flvm = new FilteredLocationViewModel(
    config.default_locations || [])

  GoogleMapsLoader.load((google) => {
    const map = new google.maps.Map(container, {
      center: config.center,
      zoom: 11,
      fullscreenControl: true
    })

    // Filter out markers on changes
    flvm.filtered.subscribe((changes) => {
      const names = changes.map(change => change.name)
      // Change up existing markers
      markers.forEach((pair) => {
        if (names.indexOf(pair.title) === -1) {
          pair.setVisible(false)
        } else {
          pair.setVisible(true)
        }
      })
    })

    // Set initial markers from computed
    flvm.filtered().forEach((location) => {
      const infoWindow = new google.maps.InfoWindow({
        content: `<h3>${location.name}</h3>`
      })
      
      const marker = new google.maps.Marker({
        title: location.name,
        position: location.coords,
        animation: google.maps.Animation.DROP
      })
      
      marker.addListener('click', () => {
        infoWindow.open(map, marker)
      })
      
      marker.setMap(map)
      
      if (!markers.has(location.name)) {
        markers.set(location.name, marker)
      }
    })

    applyBindings(flvm)
  })
})
