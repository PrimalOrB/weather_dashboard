# Weather Dashboard

## Purpose
A weather dashboard allowing you to search cities and be presented with current, and forecast weather conditions. History of searches is saved for quick reference

## Image
![image](https://user-images.githubusercontent.com/69044956/112733861-bb579b80-8f18-11eb-9c14-be4d13614475.png)

## Built With
* HTML
* CSS
* [jQuery](https://jquery.com/)
* JavaScript
* [OpenWeather API](https://openweathermap.org/)
* [Moment.js](https://momentjs.com/)
* [Teleport Cities API](http://developers.teleport.org/)
* [FontAwesome](https://fontawesome.com/)

## Website
https://primalorb.github.io/weather_dashboard/

## Application Flow

Page Load
* Ask user to permission to geolocate their browser
  * If no
    * must wait for user to submit at search query
  * If yes
    * extract lat/lon positions, and then query [openweather reverse geocoding api](https://openweathermap.org/api/geocoding-api#reverse)
      * presents an output city / country to pass forward (needed for posting to DOM as a location name)
      * this method is used due to multiple input methods available, so that they all pass through the same route
    * using previous city / country data, query the [openweather direct geocoding api](https://openweathermap.org/api/geocoding-api#direct)
      * presents further lat / lon data
    * using the lat / lon from the direct geocoding, query the [openweather onecall api](https://openweathermap.org/api/one-call-api)
      * this API requires lat/lon input, and will provide all required data for our return
      * post the city / country designation (from the reverse geocoding api) to the DOM as the title in the current forecast
      * send the location to storage as a search history item
      * parse the current conditions data and post to the DOM (generated jQuery content)
      * parse the 5 day forecast data and post the the DOM (generated jQuery content)

Storage Items
* Storage entries can be selected to load weather data into the page
  * Each entry is stored with lat / lon data points, as well as a timestamp
  * timestamp is use to order the list of history items from newest to oldest (limited visbility)
  * If a location is visited more than once, existing records will be removed so that history is unique and ordered by most current queries
  * Simply clicking the entry from history will inject the object into the above process at the reverse geocoding step (follows same process from there)

Search Field
* Locations can be typed into the entry
  * The [Teleport Cities API](http://developers.teleport.org/) is continually called to generate a suggestion dropdown of locations
* When a selection is made by:
  *  Submitting form
     * The top entry (likely closest to your search) is chosen and passed into the [Teleport Cities Information API Endpoint](http://developers.teleport.org/api/getting_started/#city_info) which provides lat/lon coordinates
     * These coordinates are passed into the openweather reverse geocoding process, as described above
     * This method is chosen so that it guarantees that a search query returns a matched location to look up in weather, as it is being queried by lat/lon coordinates.
  * Clicking entry from dropdown
     * as with submitting a form, the selection is passed to the cities information API endpoint, and then is processed through the same process of openweather reverse geocoding
