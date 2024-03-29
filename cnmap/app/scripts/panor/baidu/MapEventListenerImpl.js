// Generated by CoffeeScript 1.7.1
(function() {
  var $window, BMap, MapEventListener,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  $window = window;

  BMap = $window.BMap;

  MapEventListener = (function(_super) {
    __extends(MapEventListener, _super);

    function MapEventListener() {
      return MapEventListener.__super__.constructor.apply(this, arguments);
    }

    MapEventListener.prototype.addLocationHashListener = function(map, callback) {
      var MapListener;
      map.addEventListener("moveend", MapListener);
      map.addEventListener("zoomend", MapListener);
      map.addEventListener("dragend", MapListener);
      return MapListener = function(e) {
        return callback.apply(this, [e.point.lat, e.point.lng, this.getZoom()]);
      };
    };

    MapEventListener.prototype.addToolBar = function(map) {
      map.addControl(new BMap.NavigationControl());
      map.addControl(new BMap.ScaleControl());
      map.addControl(new BMap.OverviewMapControl());
      return map.addControl(new BMap.MapTypeControl());
    };

    MapEventListener.prototype.setCenter = function(map, lat, lng) {
      return map.setCenter(new BMap.Point(lng, lat));
    };

    MapEventListener.prototype.setZoom = function(map, zoom) {
      return map.setZoom(zoom);
    };

    MapEventListener.prototype.setBounds = function(map, sw, ne) {
      return map.setViewport([new BMap.Point(sw.lng, sw.lat), new BMap.Point(ne.lng, ne.lat)]);
    };

    MapEventListener.prototype.inMapView = function(lat, lng, map) {
      map = map || this.opts.map;
      return map.getBounds().containsPoint(new BMap.Point(lng, lat));
    };

    MapEventListener.prototype.addMarker = function(map, lat, lng) {
      return map.addOverlay(new BMap.Marker(new BMap.Point(lng, lat)));
    };

    MapEventListener.prototype.createDraggableMarker = function(map, lat, lng) {
      return map.addOverlay(new BMap.Marker(new BMap.Point(lng, lat), {
        enableDragging: true
      }));
    };

    MapEventListener.prototype.activeMarker = function(marker) {
      if (marker) {
        return marker.setIcon(new BMap.Icon("images/marker.png", new BMap.Size(20, 30)));
      }
    };

    MapEventListener.prototype.deactiveMarker = function(marker) {
      if (marker) {
        return marker.setIcon("");
      }
    };

    MapEventListener.prototype.addMarkerActiveListener = function(marker, callback) {
      var ActiveListener;
      marker.addEventListener("click", ActiveListener);
      marker.addEventListener("dragend", ActiveListener);
      marker.addEventListener("rightclick", ActiveListener);
      return ActiveListener = function(e) {
        return callback.apply(marker, []);
      };
    };

    MapEventListener.prototype.addDragendListener = function(marker, callback) {
      return marker.addEventListener("dragend", function(e) {
        return callback.apply(marker, [e.point.lat, e.point.lng]);
      });
    };

    MapEventListener.prototype.addMapClickListener = function(map, callback) {
      return map.addEventListener("click", function(e) {
        return callback.apply(map, [e.point.lat, e.point.lng]);
      });
    };

    MapEventListener.prototype.setPosition = function(target, lat, lng) {
      return target.setPosition(new BMap.Point(lng, lat));
    };

    MapEventListener.prototype.setMap = function(target, map) {
      return map.addOverlay(target);
    };

    return MapEventListener;

  })(window.cnmap.IMapEventListener);

  window.cnmap = window.cnmap || {};

  window.cnmap.MapEventListener = MapEventListener;

}).call(this);

//# sourceMappingURL=MapEventListenerImpl.map
