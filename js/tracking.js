function getLayer(layer_id) {
    var projection = new ol.proj.get(config.projection);
    var projection_extent = projection.getExtent();
    var max_resolution = ol.extent.getWidth(projection_extent) / 256;
    var resolutions = new Array(19);
    var matrix_ids = new Array(19);

    for (var i = 0; i <= 19; i++) {
        resolutions[i] = max_resolution / Math.pow(2, i);
        matrix_ids[i] = i;
    }

    return layer = new ol.layer.Tile({
        extent: projection_extent,
        source: new ol.source.WMTS({
            url: config.wmts_service_url.replace('$api_key', config.api_key),
            version: config.wmts_service_version,
            layer: config.layers[layer_id].id,
            style: config.layers[layer_id].style,
            format: config.layers[layer_id].format,
            matrixSet: 'PM',
            tileGrid: new ol.tilegrid.WMTS({
                origin: ol.extent.getTopLeft(projection_extent),
                resolutions: resolutions,
                matrixIds: matrix_ids
            })
        })
    });
}

function initMap() {
    var projection = new ol.proj.get(config.projection);
    var projection_extent = projection.getExtent();
    var max_resolution = ol.extent.getWidth(projection_extent) / 256;
    var resolutions = new Array(19);
    var matrix_ids = new Array(19);

    for (var i = 0; i <= 19; i++) {
        resolutions[i] = max_resolution / Math.pow(2, i);
        matrix_ids[i] = i;
    }

    var bdortho = getLayer(0, config);
    var transportnet = getLayer(1, config);
    var scanexpress = getLayer(2, config);

    map.addLayer(bdortho);
    map.addLayer(transportnet);

    var zoom_level = map.getView().getZoom();
    wasOnSPM = 0;

    map.on('moveend', function() { // Display/hide some layers according to the zoom level.
        var new_zoom_level = map.getView().getZoom();
        
        var extent = map.getView().getCenter();
        extent = ol.proj.transform(extent, 'EPSG:3857', 'EPSG:4326');
        
        if(isInSPM(extent[0],extent[1])) {
            if (layerExists(scanexpress)) {
                map.removeLayer(scanexpress);
                map.addLayer(bdortho);
                map.addLayer(transportnet);
            }
            wasOnSPM = 1;
        } else {
            if ((new_zoom_level < 16) && (zoom_level >= 16)) {
                map.removeLayer(bdortho);
                map.removeLayer(transportnet);
                map.addLayer(scanexpress);
            }
            if ((new_zoom_level >= 16) && (zoom_level < 16)) {
                map.removeLayer(scanexpress);
                map.addLayer(bdortho);
                map.addLayer(transportnet);
            }
            if(wasOnSPM == 1) {
                wasOnSPM = 0;
                map.removeLayer(bdortho);
                map.removeLayer(transportnet);
                map.addLayer(scanexpress);
            }
        }
        zoom_level = new_zoom_level;
    });
}

function layerExists(layer) {
    for (var i=0;i<map.getLayers().getLength();i++) {
        if (map.getLayers().getArray()[i] === layer) // If the layer is present in the map
            return true;
    }
    return false;
}

function isInSPM(long,lat) {
    if((long < -64.7809) || (long > -47.4554) || (lat < 42.1980) || (lat > 50.3227))  // St-Pierre et Miquelon display area
        return false;
    else
        return true;
}

function isOnFrenchTerritory(long,lat) {
    if(ratio <= 0.01) // if ratio<=0.01 it's SRTM, so allow overseas mapping
        return true;

    // /!\ TEMPORARY ... To improve in the future (conditions are not clean)
    if ((long < -5.22) || (long > 9.6) || (lat < 41.3) || (lat > 51.1))  // Those coordinates are France's territory in WGS84.
        if ((long < 44.88) || (long > 45.33) || (lat < -13.1) || (lat > -12.53))  // Those coordinates are Mayotte's territory in WGS84.
            if((long < 55.18) || (long > 55.85) || (lat < -21.40) || (lat > -20.85))  // Those coordinates are Reunion's territory in WGS84.
                if((long < -61.25) || (long > -60.78) || (lat < 14.37) || (lat > 14.91))  // Those coordinates are Martinique's territory in WGS84.
                    if((long < -61.83) || (long > -60.97) || (lat < 15.81) || (lat > 16.54))  // Those coordinates are Guadeloupe's territory in WGS84.
                        if((long < -54.67) || (long > -51.44) || (lat < 2.06) || (lat > 5.86)) // Those coordinates are Guyane's territory in WGS84
                            if((long < -56.52) || (long > -56.07) || (lat < 46.74) || (lat > 47.16))  // Those coordinates are St-Pierre et Miquelon's territory in WGS84.
                                return false;
    return true;
}

function isXOnFrenchTerritory(long) {
    // /!\ TEMPORARY ... To improve in the future (conditions are not clean)
    if ((long < -5.22) || (long > 9.6))  // Those coordinates are France's territory in WGS84.
        if ((long < 44.88) || (long > 45.33))  // Those coordinates are Mayotte's territory in WGS84.
            if((long < 55.18) || (long > 55.85))  // Those coordinates are Reunion's territory in WGS84.
                if((long < -61.25) || (long > -60.78))  // Those coordinates are Martinique's territory in WGS84.
                    if((long < -61.83) || (long > -60.97))  // Those coordinates are Guadeloupe's territory in WGS84.
                        if((long < -54.67) || (long > -51.44)) // Those coordinates are Guyane's territory in WGS84
                            if((long < -56.52) || (long > -56.07))  // Those coordinates are St-Pierre et Miquelon's territory in WGS84.
                                return false;
    return true;
}

function isYOnFrenchTerritory(lat) {
    // /!\ TEMPORARY ... To improve in the future (conditions are not clean)
    if ((lat < 41.3) || (lat > 51.1))  // Those coordinates are France's territory in WGS84.
        if ((lat < -13.1) || (lat > -12.53))  // Those coordinates are Mayotte's territory in WGS84.
            if((lat < -21.40) || (lat > -20.85))  // Those coordinates are Reunion's territory in WGS84.
                if((lat < 14.37) || (lat > 14.91))  // Those coordinates are Martinique's territory in WGS84.
                    if((lat < 15.81) || (lat > 16.54))  // Those coordinates are Guadeloupe's territory in WGS84.
                        if((lat < 2.06) || (lat > 5.86)) // Those coordinates are Guyane's territory in WGS84
                            if((lat < 46.74) || (lat > 47.16))  // Those coordinates are St-Pierre et Miquelon's territory in WGS84.
                                return false;
    return true;
}

function initDragAbility() { // http://openlayers.org/en/v3.6.0/examples/drag-features.html
    window.app = {};
    var app = window.app;
    app.Drag = function() {
        ol.interaction.Pointer.call(this, {
            handleDownEvent: app.Drag.prototype.handleDownEvent,
            handleDragEvent: app.Drag.prototype.handleDragEvent,
            handleMoveEvent: app.Drag.prototype.handleMoveEvent,
            handleUpEvent: app.Drag.prototype.handleUpEvent
        });
        this.coordinate_ = null;
        this.cursor_ = 'pointer';
        this.feature_ = null;
        this.previousCursor_ = undefined;
    };

    ol.inherits(app.Drag, ol.interaction.Pointer);

    app.Drag.prototype.handleDownEvent = function(evt) {
        var map = evt.map;
        var feature = map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
            return feature;
        });

        if (feature) {
            this.coordinate_ = evt.coordinate;
            this.feature_ = feature;
        }

        return !!feature;
    };

    app.Drag.prototype.handleDragEvent = function(evt) {
        var map = evt.map;
        var feature = map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
            return feature;
        });

        var deltaX = evt.coordinate[0] - this.coordinate_[0];
        var deltaY = evt.coordinate[1] - this.coordinate_[1];

        this.coordinate_[0] = evt.coordinate[0];
        this.coordinate_[1] = evt.coordinate[1];

    };

    app.Drag.prototype.handleMoveEvent = function(evt) {
        if (this.cursor_) {
            var map = evt.map;
            var feature = map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
                return feature;
            });
            var element = evt.map.getTargetElement();
            if (feature) {
                if (element.style.cursor != this.cursor_) {
                    this.previousCursor_ = element.style.cursor;
                    element.style.cursor = this.cursor_;
                }
            } else if (this.previousCursor_ !== undefined) {
                element.style.cursor = this.previousCursor_;
                this.previousCursor_ = undefined;
            }
        }
    };

    app.Drag.prototype.handleUpEvent = function(evt) {
        this.coordinate_ = null;
        this.feature_ = null;
        return false;
    };
}

$(document).ready(function() {
    $.getJSON('../inc/config.json', {_: new Date().getTime()}, function(data) {
        config = data;
        config.default_location = [parseFloat(document.getElementById("x_coord").value), parseFloat(document.getElementById("y_coord").value)];
        initDragAbility();
        
        map = new ol.Map({
            target: 'tracking_map_container',
            controls: [
                new ol.control.Zoom(),
                new ol.control.ScaleLine(),
                new ol.control.MousePosition({
                    coordinateFormat: ol.coordinate.createStringXY(4),
                    projection: 'EPSG:4326',
                    className: 'custom-mouse-position',
                    target: document.getElementById('mouse_position'),
                    undefinedHTML: '&nbsp;'
                })
            ],
            view: new ol.View({
                    center: ol.proj.transform(config.default_location, 'EPSG:4326', 'EPSG:3857'),
                    zoom: config.default_zoom_level,
                    minZoom: 6,
                    maxZoom: 18
            }),
            interactions: ol.interaction.defaults().extend([new app.Drag()])
        });
        initMap();
    });
});