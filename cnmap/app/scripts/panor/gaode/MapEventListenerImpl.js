/**
 * Created by any on 14-4-12.
 */
'use strict';

(function (factory) {

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as anonymous module.
        define([window, 'jquery', 'cnmap'], factory);
    } else {
        // Browser globals.
        factory(window, jQuery);
    }

})(function ($window, $jQuery) {

    $window.cnmap.MapEventListener = function(opts) {

        this.opts = opts || this.opts;

        this.addLocationHashListener = function(map, callback) {

            $window.AMap.event.addListener(map, 'zoomend', MapListener);

            $window.AMap.event.addListener(map, 'moveend', MapListener);

            function MapListener(evt) {
                var lnglat = map.getCenter();
                callback.apply(this, [lnglat.lat, lnglat.lng, map.getZoom()]);
            }

        };

        this.addToolBar = function(mapObj) {
            mapObj.plugin(["AMap.ToolBar"], function () {
                //加载工具条
                var tool = new AMap.ToolBar();
                mapObj.addControl(tool);
            });
        };

        this.setCenter = function(map, lat, lng) {
            var point = new AMap.LngLat(lng, lat);
            map.setCenter(point);
        };

        this.setZoom = function(map, zoom) {
            map.setZoom(zoom);
        };

        this.setBounds = function(map, southwest, northeast){
            map.setBounds(new AMap.Bounds(
                new AMap.LngLat(southwest.lng, southwest.lat),
                new AMap.LngLat(northeast.lng, northeast.lat)
            ))
        };

        this.clearMap = function(map) {
            return map && map.clearMap();
        };

        this.inMapView = function(lat, lng, map) {
            map = map || this.opts.map;
            var point = new AMap.LngLat(lng, lat);
            return map.getBounds().contains(point);
        };

        this.addMarker = function(map, lat, lng) {
            return new AMap.Marker({
                map: map,
                position: new AMap.LngLat(lng, lat)
            });
        };

        this.createDraggableMarker = function(map, lat, lng) {
            return new AMap.Marker({
                draggable: true,
                map: map,
                position: new AMap.LngLat(lng, lat)
            });
        };

        this.activeMarker = function(marker) {
            if(marker) {
                marker.setzIndex(2);
                marker.setIcon("images/marker.png");
            }
        };

        this.deactiveMarker = function(marker){
            if(marker) {
                marker.setzIndex(1);
                marker.setIcon("");
            }
        };

        this.addMarkerActiveListener = function(marker, callback) {
            AMap.event.addListener(marker, "click", cback);
            AMap.event.addListener(marker, "touchstart", cback);
            AMap.event.addListener(marker, "dragend", cback);
            function cback(evt) {
                callback.apply(marker, []);
            }
        };

        this.addDragendListener = function(marker, callback) {
            AMap.event.addListener(marker, "dragend", function (event) {
                callback.apply(marker, [event.lnglat.lat, event.lnglat.lng]);
            });
        };

        this.addMapClickListener = function(map, callback) {
            AMap.event.addListener(map, "click", function (event) {
                var lnglat = event.lnglat;
                callback.apply(map, [lnglat.lat, lnglat.lng]);
            });
        };

        this.setPosition = function(target, lat, lng) {
            var point = new AMap.LngLat(lng, lat);
            target.setPosition(point);
        };

        this.setMap = function(target, map){
            target.setMap(map);
            target.show();
        };
    };

    $window.cnmap.MapEventListener.prototype = $window.cnmap.IMapEventListener;
    $window.cnmap.MapEventListener.factory = function() {
        return new $window.cnmap.MapEventListener();
    }
    return $window.cnmap.MapEventListener;
});