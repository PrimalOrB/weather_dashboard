// openWeather API Key
var apiKey = '8462b9d4211d198b0ad040601557274b';
// global city search value
var searchCity
// global history val
var searchHistory = []
// get storage of update history array
getStorage()
// display history list
displayHistory()

// Initialize current date fetch
geoLocation();

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
            // declate lat/lon vairables
        var latitude
        var longitude
            // determine data source and post
       if( position.coords ) { //if positions.coords exists (from GeoLocationPosition)
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
       } else {
            latitude  = position.location.latlon.latitude;
            longitude = position.location.latlon.longitude;
       }

            // set lat/lon object
        var geocode = {
            lat: latitude,
            lon: longitude
        };
        getLocationToCity( geocode );
    };
    // if error, alert
    function geoError() {
        alert( 'Unable to retrieve your location' );
    };
    // reverse lookup of coordinates to find city  
    function getLocationToCity( geocode ) {
        var apiUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${geocode.lat}&lon=${geocode.lon}&limit=${1}&appid=${apiKey}`;

        fetch(apiUrl).then(function(response) {
            if (response.ok) {
            response.json().then(function(data) {
                geoCodeLocation( data[0].name, data[0].country )
            });
            } else {
                geoError();
            }
        })
        .catch( function ( error ) {
            alert( 'Unable to connect to openWeather' )
        });
    };

// get geoLocation based on city/country to get weather data (needed for onecall API)
function geoCodeLocation( location, country ){
    var apiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${location},${country}&limit=${1}&appid=${apiKey}`;

    fetch(apiUrl).then(function(response) {
        if (response.ok) {
          response.json().then(function(data) {
            fetchWeatherData( data[0] )
            postLocation( data[0] )
            });
        } else {
            geoError();
        }
      })
      .catch( function ( error ) {
          alert( 'Unable to connect to openWeather' )
      });
};

// get weather data based on geocode (onecall API requires lat/lon input)
function fetchWeatherData( geocode ) {
    var apiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${geocode.lat}&lon=${geocode.lon}&units=metric&appid=${apiKey}`;

    fetch(apiUrl).then(function(response) {
        if (response.ok) {
          response.json().then(function(data) {
            postCurrent( data )
            postForecast( data )
          });
        } else {
            geoError();
        }
      })
      .catch( function ( error ) {
          alert( 'Unable to connect to openWeather' )
      });
};

// post location ( city / country ) to title
function postLocation( data ) {
    var location =  $( '<h2>' )
        .addClass( 'location' )    
        .text( `${ data.name }, ${ data.country }` );
    var title = $( '<div>' )
        .addClass( 'current-title' )
        .append( location );

    $( '.current-info' )
        .html( '' )
        .append( title );

    setStorage( data )
};

// generate HTML and post data for the current date
function postCurrent( data ) {
    var datetime = data.current.dt;
        // create moment item
    var momentTime = moment( ( datetime ) * 1000 ).format('dddd MMMM Do, YYYY' );
        // set data in title
    var date =  $( '<h2>' )
        .addClass( 'date' )    
        .text( `( ${ momentTime } )` );
        // post date to title
    $( '.current-title' )
        .append( date );
        // capture weather status icon
    var iconImg = $( '<img>' )
        .attr( 'src', `https://openweathermap.org/img/wn/${data.current.weather[0].icon}@2x.png`);
        // create containing div and add
    var iconDiv = $( '<div>' )
        .addClass( 'icon' )
        .append( iconImg  );
        // add div to DOM
    $( '.current-icon' )
        .html( '' )
        .append( iconDiv );

        // title for temp
    var tempTitle = $( '<h3>' )
        .text( 'Temperature: ') ;  
        // span for temp pulling data and formatting it 
    var tempSpan = $( '<span> ')
        .text( `${(data.current.temp).toFixed(1)} °C` ) ;
        // create and append to div
    var tempDiv = $( '<div>' )
        .addClass( 'current_entry' )
        .attr( 'id', 'cur-temperature')
        .append( tempTitle )
        .append( tempSpan );

        // title for humidity
    var humidityTitle = $( '<h3>' )
        .text( 'Humidity: '); 
        // span for humidity pulling data and formatting it 
    var humiditySpan = $( '<span>' )
        .text( `${data.current.humidity} %` );
        // create and append to div
    var humidityDiv = $( '<div>' )
        .addClass( 'current_entry' )
        .attr( 'id', 'cur-humidity')
        .append( humidityTitle )
        .append( humiditySpan );

        // title for wind
    var WindTitle = $( '<h3>' )
        .text( 'Wind: ')  ;  
        // span for wind pulling data and formatting it 
    var windSpan = $( '<span>' )
        .text( `${( data.current.wind_speed * 3.6 ).toFixed(1)} km/h` );
        // create directional wind arrow, rotate to 135deg from original (pointing straight down is wind from north, aka 0°), and then rotate by wind direction
    var windArrow = $( '<span>' )
        .html( '<i class="fas fa-location-arrow"></i>' )
        .css({ 'transform' : 'rotate('+ ( 135 + data.current.wind_deg ) +'deg)' });
        // create and append to div
    var windDiv = $( '<div>' )
        .addClass( 'current_entry' )
        .attr( 'id', 'cur-wind')
        .append( WindTitle )
        .append( windSpan )
        .append( windArrow );

        // title for uv
    var uvTitle = $( '<h3>' )
        .text( 'UV: ') ;  
        // span for uv pulling data and formatting it 
    var uvSpan = $( '<span>' )
        .text( data.current.uvi )
        .css({ 'background-color': `hsl(${ uvColor( data.current.uvi ) },  100%, 50%)` });
        // create and append to div
    var uvDiv = $( '<div>' )
        .addClass( 'current_entry' )
        .attr( 'id', 'cur-uv')
        .append( uvTitle )
        .append( uvSpan );

        // append all to DOM
    $( '.current-info' )
        .append( tempDiv )    
        .append( humidityDiv )
        .append( windDiv )
        .append( uvDiv );
};

    // generate HTML for 5-day forecast
function postForecast( data ) {
        // clear current cards HTML
    $( '.forecast-cards' )
        .html( '' );

        // loop through 5 items to generate cards
    for ( var i = 0; i < 5; i++ ) {
            var datetime = data.daily[i+1].dt;
                // create moment item
            var momentTime = moment( ( datetime ) * 1000 ).format('MM/DD/YY' );
                // title of the date
            var title = $( '<h3>' )
                .text( momentTime ) ;
                // icon image
            var iconImg = $( '<img>' )
                .attr( 'src', `https://openweathermap.org/img/wn/${data.daily[i+1].weather[0].icon}@2x.png`);
                // containing div
            var iconDiv = $( '<div>' )
                .addClass( 'icon' )
                .append( iconImg  );
                // temp title
            var tempTitle = $( '<span>' )
                .text( 'Temp: ');
                // temp value, formatted
            var tempSpan = $( '<span> ')
                .text( `${(data.daily[i+1].temp.day).toFixed(1)} °C` );
                // temp div
            var tempDiv = $( '<div>' )
                .append( tempTitle )
                .append( tempSpan );
                // humidity title
            var humdityTitle = $( '<span>' )
                .text( 'Humidity: ');   
                // humidity value, formatted
            var humiditySpan = $( '<span> ')
                .text( `${(data.daily[i+1].humidity).toFixed(1)} %` );
                // humidity div
            var humidityDiv = $( '<div>' )
                .append( humdityTitle )
                .append( humiditySpan );

                // append elements    
            var card = $( '<div>' )
                .css({ 'display': 'block'})
                .addClass( 'card' )
                .append( title )
                .append( iconDiv )
                .append( tempDiv )
                .append( humidityDiv );

                // add card to DOM
            $( '.forecast-cards' )
                .append( card );  
      }
};

// set angle of HSL wheel for apply for UV severity color
function uvColor( value ) {
        // get percentage of UV scale
    var scaleUV = value / 11  ;  
        // apply scale to 0 (red) to 120 (green)
    var hslPos = 120 - ( 120 * scaleUV );
    return hslPos
};

//Search field when a key is pressed
$( '#search-field' ).on( 'keyup change', function() {
        // get current text value
    var text = $(this).val();
        // if text entry has length, show
    if( text.length ) {
        // search URL citites API for list using current string
        var search = `https://api.teleport.org/api/cities/?search=${text}`;
            // fetch request using search URL
        fetch(search).then(function(response) {
            if (response.ok) {
            response.json().then(function(data) {
                    // clear current dropdown
                $( '.dropdown' )
                    .html( '' );
                    // populate dropdown with updated entries
                dropDownList( data )
                searchCity = {}
                searchCity = data
                });
            } else {
                    // else error
                geoError();
            }
        })
        .catch( function ( error ) {
                // else error
            console.log( 'Unable to connect to cities API' );
        });
    } else {
            //otherwise, close/clear
        closeDropdown()
    }
});

// open drop down list and populate
function dropDownList( data ) {
        // get min value ( no more than 10, will show less if narrowed down adequately)
    var count = Math.min( 10, data.count );
        // shop the dropdown
    $( '.dropdown' )
        .css( { 'display': 'inline-block' } );
        //loop over desired number of items
    for ( var i = 0; i < count ; i++ ) {
            // create and li, apply text of the name, and add data of the reference href so it can pull additional data
        var li = $( "<li>" )
            .text( data._embedded['city:search-results'][i].matching_full_name )
            .attr( 'data-geoname', `${data._embedded['city:search-results'][i]._links['city:item'].href}` )
            .addClass( 'dropdown-item' );
            // append
        $( '.dropdown' )
            .append( li );
    }
};

// close dropdown and clear elements
function closeDropdown() {
    // clear dropdown
 $( '.dropdown' )
    .html( '' )
    .css( { 'display': 'none' } );
};

// fetch data from entry (dropdown or search)
function fetchLocationHref( data ) {
    fetch(data).then(function(response) {
        if (response.ok) {
          response.json().then(function(data) {
                    // send data to capture geocoding
                geoSuccess(data)
                    // close dropdown
                closeDropdown()
            });
        } else {
            // error
            geoError();
        }
      })
      .catch( function ( error ) {
          // error
          console.log( 'Unable to connect to cities API' );
      });
}

// listen for click inside / outside the dropdown list for selections
$( document ).click( function( event ) { 
        // listen for clicks on document
    var $target = $(event.target);
        // see if click is within the dropdown
    if ( $target.closest('.dropdown').length ) {
            // capture the dataset from dropDownList
        var data = event.target.dataset.geoname;
            // fetch based on the associated dataset
        fetchLocationHref( data )

    } else {
            // click outside means clear and hide the dropdown
        closeDropdown()
    }
});

// listen for form submit as another entry method
$( '#search-form' ).submit( function(event) {
    event.preventDefault()

    // cannot assume text entry is correct, so using the cities API, take the first entry of the dropdown as the "closest" match

        // send dataset to search the data
    fetchLocationHref( searchCity._embedded['city:search-results'][0]._links['city:item'].href )

        // clear search field
$( '#search-field' )
    .val( '' );
        // click outside means clear and hide the dropdown
    closeDropdown()
});  

// set storage entry
function setStorage( data ) {
    var storageItem = { 
        'location': `${ data.name }, ${ data.country }`,
        'lat': data.lat,
        'lon': data.lon,
        'timestamp': moment().valueOf()
     }

        // search history to see if current item exists. If yes, splice out. This will move current entry to the top of the desc list
    $.each(searchHistory, function(i){
        if(searchHistory[i].location === storageItem.location) {
            searchHistory.splice(i,1);
            return false;
        }
    });

        // push to storage item
    searchHistory.push( storageItem) 
        // stringify
    var string = JSON.stringify( searchHistory )
        // set to localStorage
    localStorage.setItem( 'weather-search-history', string )
        // clear current display
    $( '.search-history' )
        .html( '' )
     // post display
    displayHistory()
};

// get storage entries
function getStorage() {
    // set initial array
    searchHistory = []
    // if storage key exists, set variable as parse data
    if( JSON.parse( localStorage.getItem( 'weather-search-history') ) ) {
        searchHistory = JSON.parse( localStorage.getItem( 'weather-search-history') )
    }
}

// display history list
function displayHistory() {
        // sort history list descending (newest first)
    var sortedDesc = searchHistory.sort(({timestamp:a}, {timestamp:b}) => b-a);
        // set max value of list (20 items)
    var listValue = Math.min( sortedDesc.length, 20 )
    for ( var i = 0; i < listValue; i++) {
        var span = $( '<span>' )
            .text( sortedDesc[i].location )
            .attr( 'lat', sortedDesc[i].lat )
            .attr( 'lon', sortedDesc[i].lon )
        var li = $( '<li>' )
            .append( span )

        $( '.search-history' )
            .append( li )    
    }
};

// clear history
function clearHistory() {
        // remove from storage
    localStorage.removeItem( 'weather-search-history' )
        // get update storage
    getStorage()
        // clear current display
    $( '.search-history' )
            .html( '' )
        // display history   
    displayHistory()
};

// listen for click on clear history button
$( '#clear-history' ).click( clearHistory );

//listen for click on history item
$( '.search-history').on( 'click', 'li' , function() {
        // get lat and lon attributes
    var lat = $(this)
        .find( 'span' )
        .attr( 'lat' )
    var lon = $(this)
        .find( 'span' )
        .attr( 'lon' )
        // send coordinates to be generated into object for displaying
    postHistoryItem( lat, lon )
})

// generate geocode and send to posting process
function postHistoryItem( lat, lon ) {
    var geocode = {
        coords: {
            latitude: lat,
            longitude: lon
        }
    }
    geoSuccess( geocode )
}