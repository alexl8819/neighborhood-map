var ready = require('document-ready')
var xtend = require('xtend')
var GoogleMapsLoader = require('google-maps')
var localForage = require('localforage')
var applyBindings = require('knockout/build/output/knockout-latest').applyBindings
var fall = require('fastfall')()

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

  if (!container) {
    throw new Error(
      'Map container not found. Unable to initialize google maps')
  }
  
  fall([
    // Get stored location information from LS if available
    function (done) {
      if (LS_SUPPORTED) {
        return localForage.getItem(LOCATIONS_KEY, function (err, locations) {
          if (err || (!locations || !Array.isArray(locations))) {
            return done(null, config.default_locations, false)
          }
          
          done(null, locations, true)
        })
      }

      done(null, config.default_locations, false)
    },
    // Fetch location descriptions
    function (locations, complete, done) {
      if (complete) {
        return done(null, locations, true)
      }
      
      var pids = locations.map(function (location) {
        return location.wikipedia.pageid
      })

      Wikipedia.getDescriptions(pids, function (err, descriptions) {
        if (err) {
          // Silently fail, as we don't depend on this 
          console.error(err)
          // Complete but don't persist
          return done(null, locations, true)
        }

        done(null, locations.map(function (location) {
          if (!location.hasOwnProperty('wikipedia')) {
            return location
          }

          return xtend(location, {
            wikipedia: {
              file: location.wikipedia.file,
              description: descriptions[location.wikipedia.pageid]
            }
          })
        }), false)
      })
    },
    // Fetch location images
    function (locations, complete, done) {
      if (complete) {
        return done(null, locations, true)
      }

      var files = locations.map(function (location) {
        return location.wikipedia.file
      })

      Wikipedia.getImages(files, function (err, images) {
        if (err) {
          // Silently fail, we don't depend on this
          console.error(err)
          // Complete, but don't persist
          return done(null, locations, true)
        }

        done(null, locations.map(function (location) {
          if (!location.hasOwnProperty('wikipedia')) {
            return location
          }

          return xtend(location, {
            wikipedia: {
              description: location.wikipedia.description,
              image: images[location.wikipedia.file]
            }
          })
        }), false)
      })
    },
    // Save information to LS if available
    function (locations, complete, done) {
      if (complete) {
        return done(null, locations)
      }

      if (LS_SUPPORTED) {
        return localForage.setItem(LOCATIONS_KEY, locations, function (err) {
          if (err) {
            console.error(err)
          }
          
          done(null, locations)
        })
      }

      done(null, locations)
    }
  ], function (err, locations) {
    var flvm = FilteredLocationViewModel(locations)

    GoogleMapsLoader.load(function (google) {
      var markers = {}
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

      // Set initial markers from computed
      flvm.filtered().forEach(function (location) {
        var marker = new google.maps.Marker({
          title: location.name,
          position: location.coords,
          animation: google.maps.Animation.DROP
        })

        var content = '<h3>' + location.name + '</h3>' +
          (location.wiki.image ? '<img src="' + location.wiki.image + '" width=75 height=75 />' : '') +
          '<p>' + (location.wiki.description || '?') + '</p>'

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
})
