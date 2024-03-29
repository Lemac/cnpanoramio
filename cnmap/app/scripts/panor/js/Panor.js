/**
 * Created with JetBrains WebStorm.
 * User: tiwen.wang
 * Date: 13-11-30
 * Time: 下午3:16
 * To change this template use File | Settings | File Templates.
 */

(function ($) {
    "use strict";

    $.panorMap = function (mapType, mapCanvas) {

        this.vendor = {
            google: "google",
            soso: "soso",
            baidu: "baidu",
            gaode: "gaode",
            alimap: "alimap"
        };

        var vendor = this.vendor;

        this.map;

        var methodMaps = {
            panTo: {
                soso: "panTo",
                baidu: "centerAndZoom"
            }
        };

        if (mapType == this.vendor.soso) {
            var myOptions = {
                zoom: 10,
                mapTypeId: soso.maps.MapTypeId.ROADMAP
            };
            this.map = new soso.maps.Map(document.getElementById(mapCanvas), myOptions);
        } else if (mapType == this.vendor.baidu) {
            this.map = new BMap.Map(mapCanvas);          // 创建地图实例
            this.map.enableScrollWheelZoom();
            this.map.addControl(new BMap.NavigationControl());
            this.map.addControl(new BMap.ScaleControl());
            var overviewMapControl = new BMap.OverviewMapControl();
            overviewMapControl.changeView();
            this.map.addControl(overviewMapControl);
            this.map.addControl(new BMap.MapTypeControl());
        } else if (mapType == this.vendor.google) {
            var myLatlng = new google.maps.LatLng(-25.363882, 131.044922);
            var mapOptions = {
                zoom: 4,
                center: myLatlng,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            }
            this.map = new google.maps.Map(document.getElementById(mapCanvas), mapOptions);

            var marker = new google.maps.Marker({
                position: myLatlng,
                map: map,
                title: 'Hello World!'
            });
        }else if(mapType == this.vendor.gaode) {
//            var position = new AMap.LngLat(116.404,39.915);//创建中心点坐标
            this.map = new AMap.Map(mapCanvas);//创建地图实例
            var mapObj = this.map;
            this.map.plugin(["AMap.ToolBar"], function(){
                var toolBar = new AMap.ToolBar();
                mapObj.addControl(toolBar);
            });
            mapObj.plugin(["AMap.MapType"],function(){
                //地图类型切换
                var type= new AMap.MapType({
                    defaultType:0 //使用2D地图
                });
                mapObj.addControl(type);
            });
        }else if (mapType == this.vendor.alimap) {
            this.map = new AliMap(mapCanvas); //使用id为mapDiv的层创建一个地图对象
            //创建一个导航控件并添加到地图
            var control=new AliMapLargeControl()
            this.map.addControl(control);
            //给地图添加滚轮缩放功能
            control = new AliMapMouseWheelControl();
            this.map.addControl(control);

        }

        this.panTo = function (lat, lng, zoom) {
            var latLng = this.LatLng(lat, lng);
            switch (mapType) {
                case this.vendor.google:
                    this.map.panTo(latLng);
                    if (zoom) {
                        this.map.setZoom(zoom);
                    }
                    break;
                case this.vendor.soso:
                    this.map.panTo(latLng);
                    if (zoom) {
                        this.map.zoomTo(zoom);
                    }
                    break;
                case this.vendor.baidu:
                    if(zoom) {
                        return this.map.centerAndZoom(latLng, zoom);
                    }else {
                        return this.map.centerAndZoom(latLng, this.map.getZoom());
                    }
                    break;
                case this.vendor.gaode:
                    this.map.setCenter(latLng);
                    this.map.setZoom(zoom);
                    break;
                case this.vendor.alimap:
                    this.map.centerAndZoom(latLng, zoom);//显示地图
                    break;
            }
        };

        this.LatLng = function (lat, lng) {
            switch (mapType) {
                case this.vendor.google:
                    return new google.maps.LatLng(lat, lng);
                case this.vendor.soso:
                    return new soso.maps.LatLng(lat, lng);
                    break;
                case this.vendor.baidu:
                    return new BMap.Point(lng, lat);
                    break;
                case this.vendor.gaode:
                    return new AMap.LngLat(lng, lat);
                    break;
                case this.vendor.alimap:
                    return new AliLatLng(lat, lng);
                    break;
            }
        };

        this.Marker = function(opts) {
           this.marker = null;
           switch (mapType) {
                case vendor.google:
                    this.marker = new google.maps.Marker({
                        position: opts.latLng
                    });
                    break;
                case vendor.soso:
                    marker = new soso.maps.Marker({
                        position: opts.latLng
                    });
                    break;
                case vendor.baidu:
                    marker = new BMap.Marker(latLng);
                    break;
                case vendor.gaode:
                    marker = new AMap.Marker({
                        position: latLng
                    });
                    break;
            }

            this.setPosition = function(latlng /*:LatLng*/) {
                switch (mapType) {
                    case vendor.google:
                        this.marker.setPosition(latlng);
                        break;
                    case vendor.soso:
                        this.marker.setPosition(latlng);
                        break;
                    case vendor.baidu:
                        this.marker.setPosition(latlng);
                        break;
                    case vendor.gaode:
                        this.marker.setPosition(latlng);
                        break;
                };
            };

            this.getPosition = function() {
                this.marker.getPosition();
            };

            this.setMap = function(map /*:Map|StreetViewPanorama*/) {
                switch (mapType) {
                    case vendor.google:
                        this.marker.setMap(map);
                        break;
                    case vendor.soso:
                        this.marker.setMap(map);
                        break;
                    case vendor.baidu:
                        map.addOverlay(this.marker);
                        break;
                    case vendor.gaode:
                        this.marker.setMap(map);
                        break;
                }
            };
        };

        this.setMarker = function (latLng) {
            var marker;
            switch (mapType) {
                case this.vendor.google:
                    marker = new google.maps.Marker({
                        map: this.map,
                        position: latLng
                    });
                    break;
                case this.vendor.soso:
                    marker = new soso.maps.Marker({
                        map: this.map,
                        position: latLng
                    });
                    break;
                case this.vendor.baidu:
                    marker = new BMap.Marker(latLng);
                    this.map.addOverlay(marker);
                    break;
                case this.vendor.gaode:
                    marker = new AMap.Marker({
                        map: this.map,
                        position: latLng
                    });
                    break;
            }

        };

        this.InfoWindow = function(opts) {
            var infoWindow;
            switch (mapType) {
                case this.vendor.google:
                    infoWindow = new google.maps.InfoWindow({context: opts.content, position: opts.position});
                    infoWindow.open(this.map);
                    break;
                case this.vendor.soso:
                    infoWindow = new soso.maps.Label({map:this.map, content: opts.content, position: opts.position});
                    break;
//                case this.vendor.baidu:
//                    marker = new BMap.Marker(latLng);
//                    map.addOverlay(marker);
//                    break;
//                case this.vendor.gaode:
//                    marker = new AMap.Marker({
//                        map: this.map,
//                        position: latLng
//                    });
//                    break;
            }

            return infoWindow;
        };

        this.geocoder = {
            myGeo: null,
            init: function() {
                switch (mapType) {
                    case vendor.google:
                        this.myGeo = new google.maps.Geocoder();
                        break;
//                    case vendor.soso:
//                        this.myGeo = new soso.maps.Marker({
//                            map: this.map,
//                            position: latLng
//                        });
//                        break;
                    case vendor.baidu:
                        this.myGeo = new BMap.Geocoder();
                        break;
//                    case vendor.gaode:
//                        marker = new AMap.Marker({
//                            map: this.map,
//                            position: latLng
//                        });
//                        break;
                }
            },

            geocode: function(address, callBack) {
                if(!this.myGeo) {
                   this.init();
                }
                switch (mapType) {
                    case vendor.google:
                        this.myGeo.geocode({'address': address}, function(results, status) {
                            if (status == google.maps.GeocoderStatus.OK) {
                                callBack.apply(undefined, [results[0].geometry.location]);
                            }
                        });
                        break;
//                    case vendor.soso:
//                        this.myGeo = new soso.maps.Marker({
//                            map: this.map,
//                            position: latLng
//                        });
//                        break;
                    case vendor.baidu:
                        this.myGeo.getPoint(address, function(point) {
                            callBack.apply(undefined, [point]);
                        });
                        break;
//                    case vendor.gaode:
//                        marker = new AMap.Marker({
//                            map: this.map,
//                            position: latLng
//                        });
//                        break;
                }
            }
        }
    };
})(jQuery);