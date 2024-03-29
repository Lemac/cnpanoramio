/**
 * Created by any on 14-4-13.
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

    $window.cnmap.MapService = function(map) {

        var levelMap = {
            "国家": 3,
            "省": 7,
            "市": 9,
            "区县": 11,
            "乡镇": 13,
            "村庄": 16,
            "热点商圈": 16,
            "小区": 18,
            "兴趣点": 18,
            "门牌号": 19,
            "道路": 17,
            "道路交叉路口": 18,
            "公交站台、地铁站": 18
        };

        this.map = map || this.map;

        var geocoder;

        this.init = function(map, callback) {
            if(map) {
                if(map instanceof Function) {
                    callback = map;
                }else {
                    this.map = map;
                }
            }
            //加载地理编码插件
            this.map.plugin(["AMap.Geocoder"], function () { //加载地理编码插件
                geocoder = new AMap.Geocoder({
                    radius: 1000, //以已知坐标为中心点，radius为半径，返回范围内兴趣点和道路信息
                    extensions: "all" //返回地址描述以及附近兴趣点和道路信息，默认“base”
                });
                if(callback) {
                    callback.apply(geocoder, [geocoder]);
                }

            });
        };

        this.getAddress = function(lat, lng, callback) {
            var point = new AMap.LngLat(lng, lat);

            if (!geocoder) {
                this.init(function() {
                    ga();
                });
            }else {
                ga();
            }
            function ga() {
                AMap.event.addListenerOnce(geocoder, "complete", function(res) {
                    if (res.info == "OK") {
                        callback.apply(undefined, [res.regeocode.formattedAddress]);
                    }
                });
                geocoder.getAddress(point);
            }
        };

        this.getAddrPois = function(lat, lng, callback) {
            var point = new AMap.LngLat(lng, lat);
            if (!geocoder) {
                this.init(function() {
                    ga();
                });
            }else {
                ga();
            }
            function ga() {
                AMap.event.addListenerOnce(geocoder, "complete", function(res) {
                    if (res.info == "OK") {
                        var regeocode = res.regeocode;
                        var addresses = {};
                        var baseAddr = regeocode.addressComponent.province + regeocode.addressComponent.district
                            + regeocode.addressComponent.city + regeocode.addressComponent.township;

                        angular.forEach(regeocode.pois, function(poi, key) {
                            addresses[baseAddr + poi.name] = {
                                poiweight: poi.poiweight,
                                location: poi.location
                            };
                        });
                        callback.apply(undefined, [addresses, regeocode.formattedAddress]);
                    }
                });
                geocoder.getAddress(point);
            }
        };

        this.getLocation = function (address, callback) {
            if (!geocoder) {
                this.init(function() {
                    ga();
                });
            }else {
                ga();
            }
            function ga() {
                AMap.event.addListenerOnce(geocoder, "complete", function(res) {
                    if (res.info == "OK") {
                        callback.apply(undefined, [res]);
                    }
                });
                geocoder.getLocation(address);
            }
        };

        this.getLocPois = function (address, callback) {
            if (!geocoder) {
                this.init(function() {
                    ga();
                });
            }else {
                ga();
            }
            function ga() {
                AMap.event.addListenerOnce(geocoder, "complete", function(res) {
                    var addresses = [];
                    if(res.info == "OK") {
                        angular.forEach(res.geocodes, function(geocode, key) {
                            addresses.push({
                                address: geocode.formattedAddress,
                                location: geocode.location,
                                similarity: 1,
                                zoom: levelMap[geocode.level] || 4
                            });
                        });
                    }
                    callback.apply(undefined, [addresses]);
                });
                geocoder.getLocation(address);
            }
        };

    };

    $window.cnmap.MapService.prototype = $window.cnmap.IMapService;
    $window.cnmap.MapService.factory = function() {
        return new $window.cnmap.MapService();
    };
    return $window.cnmap.MapService;
});