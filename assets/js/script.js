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
            postForecast( data )
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
    var location =  $( '<h2>' )
        .addClass( 'location' )    
        .text( `${ data.name }, ${ data.country }` )
    var title = $( '<div>' )
        .addClass( 'current-title' )
        .append( location )

    $( '.current-info' )
        .html( '' )
        .append( title )
}

function postCurrent( data ) {
    var datetime = data.current.dt
        // create moment item
    var momentTime = moment( ( datetime ) * 1000 ).format('dddd MMMM Do, YYYY' )
        // set data in title
    var date =  $( '<h2>' )
        .addClass( 'date' )    
        .text( `( ${ momentTime } )` )
    $( '.current-title' )
        .append( date )
    var iconImg = $( '<img>' )
        .attr( 'src', `http://openweathermap.org/img/wn/${data.current.weather[0].icon}@2x.png`)
    var iconDiv = $( '<div>' )
        .addClass( 'icon' )
        .append( iconImg  )
    $( '.current-icon' )
        .html( '' )
        .append( iconDiv )

    var tempTitle = $( '<h3>' )
        .text( 'Temperature: ')    
    var tempSpan = $( '<span> ')
        .text( `${(data.current.temp).toFixed(1)} °C` ) 
    var tempDiv = $( '<div>' )
        .addClass( 'current_entry' )
        .attr( 'id', 'cur-temperature')
        .append( tempTitle )
        .append( tempSpan )

    var humidityTitle = $( '<h3>' )
        .text( 'Humidity: ') 
    var humiditySpan = $( '<span>' )
        .text( `${data.current.humidity} %` )
    var humidityDiv = $( '<div>' )
        .addClass( 'current_entry' )
        .attr( 'id', 'cur-humidity')
        .append( humidityTitle )
        .append( humiditySpan )

    var WindTitle = $( '<h3>' )
        .text( 'Wind: ')    
    var windSpan = $( '<span>' )
        .text( `${( data.current.wind_speed * 3.6 ).toFixed(1)} km/h` )
    var windArrow = $( '<span>' )
        .html( '<i class="fas fa-location-arrow"></i>' )
        .css({ 'transform' : 'rotate('+ ( 135 + data.current.wind_deg ) +'deg)' })
    var windDiv = $( '<div>' )
        .addClass( 'current_entry' )
        .attr( 'id', 'cur-wind')
        .append( WindTitle )
        .append( windSpan )
        .append( windArrow )

    var uvTitle = $( '<h3>' )
        .text( 'UV: ')   
    var uvSpan = $( '<span>' )
        .text( data.current.uvi )
        .css({ 'background-color': `hsl(${ uvColor( data.current.uvi ) },  100%, 50%)` })
    var uvDiv = $( '<div>' )
        .addClass( 'current_entry' )
        .attr( 'id', 'cur-uv')
        .append( uvTitle )
        .append( uvSpan )

    $( '.current-info' )
        .append( tempDiv )    
        .append( humidityDiv )
        .append( windDiv )
        .append( uvDiv )


}

function postForecast( data ) {
    $( '.forecast-cards' )
        .html( '' )

    for ( var i = 0; i < 5; i++ ) {
            var datetime = data.daily[i+1].dt
                // create moment item
            var momentTime = moment( ( datetime ) * 1000 ).format('MM/DD/YY' )
                // title of the date
            var title = $( '<h3>' )
                .text( momentTime ) 

                // icon
            var iconImg = $( '<img>' )
                .attr( 'src', `http://openweathermap.org/img/wn/${data.daily[i+1].weather[0].icon}@2x.png`)
            var iconDiv = $( '<div>' )
                .addClass( 'icon' )
                .append( iconImg  )
                // dislay daytime temperature
            var tempTitle = $( '<span>' )
                .text( 'Temp: ')    
            var tempSpan = $( '<span> ')
                .text( `${(data.daily[i+1].temp.day).toFixed(1)} °C` )
            var tempDiv = $( '<div>' )
                .append( tempTitle )
                .append( tempSpan )
                // dislay humidity
            var humdityTitle = $( '<span>' )
                .text( 'Humidity: ')    
            var humiditySpan = $( '<span> ')
                .text( `${(data.daily[i+1].humidity).toFixed(1)} %` ) 
            var humidityDiv = $( '<div>' )
                .append( humdityTitle )
                .append( humiditySpan )

                // append elements    
            var card = $( '<div>' )
                .css({ 'display': 'block'})
                .addClass( 'card' )
                .append( title )
                .append( iconDiv )
                .append( tempDiv )
                .append( humidityDiv )

            $( '.forecast-cards' )
                .append( card )    
  
    }
}

// set angle of HSL wheel for apply for UV severity color
function uvColor( value ) {
        // get percentage of UV scale
    var scaleUV = value / 11    
        // apply scale to 0 (red) to 120 (green)
    var hslPos = 120 - ( 120 * scaleUV )
    return hslPos
}

//Search field
$( '#search-field' ).on( 'keyup change', function() {
    var text = $(this).val()
    var search = `https://api.teleport.org/api/cities/?search=${text}`
    
    fetch(search).then(function(response) {
        if (response.ok) {
          response.json().then(function(data) {
            $( '.dropdown' )
                .html( '' )
            dropDownList( data )
            });
        } else {
          console.log("Error: " + response.statusText);
        }
      })
      .catch( function ( error ) {
          console.log( 'Unable to connect to cities API' )
      });
})

// open drop down list and populate
function dropDownList( data ) {
    var count = Math.min( 10, data.count )
    $( '.dropdown' )
        .css( { 'display': 'inline-block' } )
    for ( var i = 0; i < count ; i++ ) {
        var li = $( "<li>" )
            .text( data._embedded['city:search-results'][i].matching_full_name )
            .attr( 'data-geoname', `${data._embedded['city:search-results'][i]._links['city:item'].href}` )
            .addClass( 'dropdown-item' )
        $( '.dropdown' )
            .append( li ) 
    }
}

// listen for click inside / outside the dropdown list for selections
$(document).click(function(event) { 
    var $target = $(event.target);
    if ( $target.closest('.dropdown').length ) {
        var data = event.target.dataset.geoname
        fetch(data).then(function(response) {
            if (response.ok) {
              response.json().then(function(data) {
                    console.log(data.location.latlon)
                    var latitude  = data.location.latlon.latitude;
                    var longitude = data.location.latlon.longitude;

                    var geocode = {
                        lat: latitude,
                        lon: longitude
                    }
                    getLocationToCity( geocode )

                    $( '.dropdown' )
                        .html( '' )
                        .css( { 'display': 'none' } )
                    $( '#search-field' )
                        .val( '' )

                });
            } else {
              console.log("Error: " + response.statusText);
            }
          })
          .catch( function ( error ) {
              console.log( 'Unable to connect to cities API' )
          });

    } else {
        $( '.dropdown' )
            .html( '' )
            .css( { 'display': 'none' } )
    }
  });


    // Initialize current date pull
geoLocation();

