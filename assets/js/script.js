// openWeather API Key
var apiKey = '8462b9d4211d198b0ad040601557274b'

// On Page Load, get current location data and set as current selection
    // Get navigator geolocation (on user confirmation)
    function geoLocation() {
        if(!navigator.geolocation) {
            status.textContent = 'Geolocation is not supported by your browser';
        } else {
            status.textContent = 'Locating…';
            navigator.geolocation.getCurrentPosition( geoSuccess, geoError );
        }     
    };
    // if suucess, gather lat/lon into object and send to reverse lookup the city name
    function geoSuccess(position) {
        var latitude  = position.coords.latitude;
        var longitude = position.coords.longitude;

            var geocode = {
                lat: latitude,
                lon: longitude
            }
            getLocationToCity( geocode )
    };
    // if error, alert
    function geoError() {
        alert( 'Unable to retrieve your location' );
    };
    // reverse lookup of coordinates to find city  
    function getLocationToCity( geocode ) {
        var apiUrl = `http://api.openweathermap.org/geo/1.0/reverse?lat=${geocode.lat}&lon=${geocode.lon}&limit=${1}&appid=${apiKey}`

        fetch(apiUrl).then(function(response) {
            if (response.ok) {
            response.json().then(function(data) {
                geoCodeLocation( data[0].name, data[0].country )
            });
            } else {
            alert("Error: " + response.statusText);
            }
        })
        .catch( function ( error ) {
            alert( 'Unable to connect to openWeather' )
        });
    }

// get geoLocation based on city/country to get weather data (needed for onecall API)
function geoCodeLocation( location, country ){
    var apiUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${location},${country}&limit=${1}&appid=${apiKey}`

    fetch(apiUrl).then(function(response) {
        if (response.ok) {
          response.json().then(function(data) {
            fetchWeatherData( data[0] )
            postLocation( data[0] )
            });
        } else {
          alert("Error: " + response.statusText);
        }
      })
      .catch( function ( error ) {
          alert( 'Unable to connect to openWeather' )
      });
}

// get weather data based on geocode (onecall API requires lat/lon input)
function fetchWeatherData( geocode ) {
    var apiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${geocode.lat}&lon=${geocode.lon}&units=metric&appid=${apiKey}`

    fetch(apiUrl).then(function(response) {
        if (response.ok) {
          response.json().then(function(data) {
            postCurrent( data )
          });
        } else {
          alert("Error: " + response.statusText);
        }
      })
      .catch( function ( error ) {
          alert( 'Unable to connect to openWeather' )
      });
}

// post location ( city / country ) to title
function postLocation( data ) {
    $( '.location' )
        .text( `${ data.name }, ${ data.country }` )
}

function postCurrent( data ) {
    console.log(data)
        // get current time
    var datetime = data.current.dt
        // create moment item
    var momentTime = moment( ( datetime ) * 1000 ).format('dddd MMMM Do, YYYY' )
        // set data in title
    $( '.date' )
        .text( `( ${ momentTime } )` )

    $( '#cur-temperature' )
        .text( `${(data.current.temp).toFixed(1)} °C` )
    $( '#cur-humidity' )
        .text( `${data.current.humidity} %` )
    $( '#cur-wind' )
        .text( `${( data.current.wind_speed * 3.6 ).toFixed(1)} km/h` )
    $( '#cur-wind-dir' )
        .html( '<i class="fas fa-location-arrow"></i>' )
        .css({ 'transform' : 'rotate('+ ( -45 + data.current.wind_deg ) +'deg)' })
    $( '#cur-uv' )
        .text( data.current.uvi )
        .css({ 'background-color': `hsl(${ uvColor( data.current.uvi ) },  100%, 50%)` })


     var test = $( '#cur-wind' )
        .closest( 'i' )
}

function uvColor( value ) {
        // get percentage of UV scale
    var scaleUV = value / 11    
        // apply scale to 0 (red) to 120 (green)
    var hslPos = 120 - ( 120 * scaleUV )
    return hslPos
}









geoLocation()

