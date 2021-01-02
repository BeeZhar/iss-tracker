var $ = jQuery.noConflict();

const iss_api = 'https://api.wheretheiss.at/v1/satellites/25544/';

////////////////////////////////////////////////////////////////////////
////   MAPBOX   ////
///////////////////////////////////////////////////////////////////////
mapboxgl.accessToken = 'pk.eyJ1IjoiYmVlemhhciIsImEiOiJja2hseGw4cDMwNTYwMnJsOXFlaTkzZWJtIn0.kRrWzwBBtd9CTZEiBhf4Dw';


// implementation of CustomLayerInterface to draw a pulsing dot icon on the map
// see https://docs.mapbox.com/mapbox-gl-js/api/#customlayerinterface for more info
var size = 120

var pulsingDot = {
    width: size,
    height: size,
    data: new Uint8Array(size * size * 4),
    // get rendering context for the map canvas when layer is added to the map
    onAdd: function () {
        var canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        this.context = canvas.getContext('2d');
    },

    // called once before every frame where the icon will be used
    render: function () {
        var duration = 1000;
        var t = (performance.now() % duration) / duration;
        
        var radius = (size / 2) * 0.3;
        var outerRadius = (size / 2) * 0.7 * t + radius;
        var context = this.context;

        // draw outer circle
        context.clearRect(0, 0, this.width, this.height);
        context.beginPath();
        context.arc(
            this.width / 2,
            this.height / 2,
            outerRadius,
            0,
            Math.PI * 2
        );
        context.fillStyle = 'rgba(68, 19, 160,' + (1 - t) + ')';
        context.fill();

        // draw inner circle
        context.beginPath();
        context.arc(
            this.width / 2,
            this.height / 2,
            radius,
            0,
            Math.PI * 2
        );
        context.fillStyle = 'rgba(80, 19, 140, 1)';
        context.strokeStyle = 'rgba(255, 116, 240, .6)';
        context.lineWidth = 2 + 2 * (1 - t);
        context.fill();
        context.stroke();

        // update this image's data with data from the canvas
        this.data = context.getImageData(
            0,
            0,
            this.width,
            this.height
        ).data;

        // continuously repaint the map, resulting in the smooth animation of the dot
        map.triggerRepaint();
 
        // return `true` to let the map know that the image was updated
        return true;
    }
};


var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v10?optimize=true',
    zoom: 3,
    maxZoom: 8
});
// Simple function to convert coordinates to GEOjson format.
function geoJSONPosition(lng, lat) {
    return {
        'type': 'Point',
        'coordinates': [lng, lat]
    };
}
// Mapbox onload function
map.on('load', function () {

    var iss_lng = [];
    var iss_lat = [];
    var iss_visibility = '';

    //API calls - storing/using data and error handling (WIP) 
    var request = new XMLHttpRequest();
    window.setInterval(function () {
        request.open('GET', iss_api, true);
        request.onload = function () {
            if (this.status >= 200 && this.status < 400) {
                var data = JSON.parse(this.response);
                iss_lng = data.longitude
                iss_lat = data.latitude
                iss_visibility = data.visibility

                //Update data and append to DOM
                $(document).ready(function() {   
                    $("#longitude").html(data.longitude.toFixed(2));
                    $("#latitude").html(data.latitude.toFixed(2));
                    $("#altitude").html(data.altitude.toFixed(1));
                    $("#velocity").html(data.velocity.toFixed(1));
                    $("#visibility").html(data.visibility); 
                });  
                // Could try to change map style depending on visibility (day and night) 
            }
        };
        request.send();
    }, 2000);

    map.addImage('pulsing-dot', pulsingDot, { pixelRatio: 2 });

    map.addSource('points', {
        'type': 'geojson',
        'data': geoJSONPosition(iss_lng, iss_lat)
    });

    map.addLayer({
        'id': 'points',
        'type': 'symbol',
        'source': 'points',
        'layout': {
            'icon-image': 'pulsing-dot'
        }
    });
    
    function animateMarker() {
        // Update the icon to a new position based on current position
        map.getSource('points').setData(geoJSONPosition(iss_lng, iss_lat));
        // Request the next frame of the animation.
        requestAnimationFrame(animateMarker);
    }  
    animateMarker();

    //Center the map on ISS current location
    $(document).on('click', '#issLocate', function(){ 
        map.flyTo({
            center: [iss_lng, iss_lat],
            zoom: 3,
            speed: 0.4,
        });
    });
    
    //Function to follow the ISS on click, stops when user drags/pan the map.
    $(document).on('click', '#issFollow', function(){
        var handle = setInterval(issFollow, 1500);
        issFollow();
        function issFollow() {
            if (map.dragPan.isActive() == true) {
                clearInterval(handle);
            } else {
                map.flyTo({
                    center: [iss_lng, iss_lat],
                    speed: 0.4,
                });  
            };  
        };
    });
//End of onload map function  
});








    





