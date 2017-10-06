var ready = require('document-ready')
var GoogleMapsLoader = require('google-maps')
var localForage = require('localforage')
var applyBindings = require('knockout/build/output/knockout-latest').applyBindings
var fastfall = require('fastfall')({ results: true })

var FilteredLocationViewModel = require('./lib/viewmodels/location')
var Wikipedia = require('./lib/models/wikipedia')

var config = require('./config.json')

var LOCATIONS_KEY = 'locations'
var LS_SUPPORTED = localForage.supports(localForage.LOCALSTORAGE)

GoogleMapsLoader.KEY = config.google_maps_api.key
GoogleMapsLoader.LANGUAGE = config.google_maps_api.language
GoogleMapsLoader.REGION = config.google_maps_api.region

localForage.config({
  driver: localForage.LOCALSTORAGE,
  name: 'neighborhood-app'
})

ready(function () {
  var container = document.querySelector('#map')
  var markers = {}

  if (!container) {
    throw new Error(
      'Map container not found. Unable to initialize google maps')
  }

  var flvm = FilteredLocationViewModel(defaultLocations)

  GoogleMapsLoader.load(function (google) {
    var map = new google.maps.Map(container, {
      center: config.center,
      zoom: 11,
      fullscreenControl: true
    })

    // Subscribe to 'active' selection
    flvm.active.subscribe(function (active) {
      // Iterate markers and clear/set animations
      Object.keys(markers).forEach(function (name) {
        var marker = markers[name]

        if (name === active) {
          marker.setAnimation(google.maps.Animation.BOUNCE)
          marker.infoWindow.open(map, marker)
        } else {
          marker.infoWindow.close()
          marker.setAnimation(null)
        }
      })
    })

    // Subscribe to 'changes' on computed filter
    flvm.filtered.subscribe(function (changes) {
      var names = changes.map(function (change) {
        return change.name
      })

      flvm.select(null)
      
      // Show only markers found in filter
      Object.keys(markers).forEach(function (name) {
        var marker = markers[name]

        if (names.indexOf(name) === -1) {
          marker.infoWindow.close()
          marker.setAnimation(null)
          marker.setVisible(false)
        } else {
          marker.setVisible(true)
        }
      })
    })
    
    // Run initial map build step
    var initial = flvm.filtered()

    if (LS_SUPPORTED) {
      return localForage
        .getItem(LOCATIONS_KEY, function (err, value) {
          if (err || 
            (!locations || !Array.isArray(locations))) {
              return createInitial(locations)
            }
          //
        })
    }

    // Set initial markers from computed
    initial.forEach(function (location) {
      var marker = new google.maps.Marker({
        title: location.name,
        position: location.coords,
        animation: google.maps.Animation.DROP
      })

      var content = '<h3>' + location.name + '</h3>'

      marker.infoWindow = new google.maps.InfoWindow({
        content: content
      })
      
      marker.addListener('click', function () {
        flvm.select(location)
      })
      
      marker.setMap(map)
      
      if (!markers.hasOwnProperty(location.name)) {
        markers[location.name] = marker
      }
    })

    applyBindings(flvm)
  })
})
