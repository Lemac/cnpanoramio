/**
 * Created by any on 2014/6/6.
 */
'use strict';
angular.module('ponmApp.test', ['ponmApp.directives', 'ponmApp.services'])
    .controller('photoFluidContainerCtrl', ['$scope', '$http', '$log', 'TravelService', 'deparam', '$location',
        function($scope, $http, $log, TravelService, deparam, $location) {

            $scope.apirest = window.apirest;

//            getTravel(11);
            $scope.$watch(function () {
                return $location.search();
            }, function (searchObject) {
                $log.debug(deparam("id=12"));
                if(searchObject.id) {
                    $scope.travelId = searchObject.id;
                    getTravel(searchObject.id);
                }
            });

            function getTravel(travelId) {
                TravelService.getTravel({travelId: travelId}, function(res) {
                    if(res.status == "OK") {
                        $scope.travel = res.travel;
                        if(!angular.isArray($scope.travel.spots)) {
                            $scope.travel.spots = [];
                        }
                        if($scope.travel.spot) {
                            $scope.travel.spots.push($scope.travel.spot);
                        }
                    }
                });
            }

            $scope.enterHover = function(e) {
                $log.debug("enterHover");
            }
            $scope.leaveHover = function(e) {
                $log.debug("leaveHover");
            }
        }])
;