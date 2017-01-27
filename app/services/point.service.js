/**
 * Created by kaur on 20.09.2016.
 */

(function() {
    'use strict';

    angular
        .module('boApp')
        .factory('pointService', PointService);

    PointService.$inject = ['$rootScope','dataService','$filter'];

    function PointService($rootScope,dataService,$filter) {
        var service = {
            getPointName : getPointName,
            setPoint : setPoint,
            getPointMenuBackgroundColor:getPointMenuBackgroundColor,
            getPointMenuActiveColor:getPointMenuActiveColor,
            initialize:initialize
        };
        return service;


        function findPoint(point) {
            return point.id === $rootScope.user.point;
        }

        function getPointName(){
            return $rootScope.user.salesPoints.find(findPoint).name
        }

        function setPoint(pointId){
            $rootScope.user.point= pointId;

            $rootScope.headerLogoUrl = setHeaderLogo($rootScope.user.point);

            dataService.post('setPoint', {'pointId': pointId });

        }
        function setHeaderLogo(pointId) {
            var header_logo = $filter('filter')($rootScope.user.salesPoints, function (d) {
                return d.id === pointId;
            })[0];
            header_logo = $filter('filter')(header_logo.parameters, function (d) {
                return d.name === "api_headerlogo";
            })[0];

            if (typeof header_logo !== 'undefined' && typeof (header_logo.value) != 'undefined') {
               return header_logo.value;
            } else {
                return "img/logo.png";
            }
        }

        function getPointMenuBackgroundColor(){
            var settings = getPointSettings();
            if (settings != null) {
                var setting = settings.find(getPointTopMenuBackgroundColorSetting);
                if (setting != null) {
                    return setting.value;
                }
            }
            return "";
        }

        function getPointMenuActiveColor(){
            var settings = getPointSettings();
            if (settings != null) {
                var setting = settings.find(getPointTopMenuColorSetting);
                if (setting != null) {
                    return setting.value;
                }
            }
            return "";
        }

        function getPointTopMenuBackgroundColorSetting(setting) {
            if (setting != null) {
                return setting.name === "api_topmenu_background";
            }
            return;
        }

        function getPointTopMenuColorSetting(setting) {
            if (setting != null) {
                return setting.name === "api_topmenu_color";
            }
            return;
        }

        function getPointSettings() {
            if ($rootScope.authenticated) {
                var parameters = $rootScope.user.salesPoints.find(findPoint).parameters;
                return parameters;
            }
            return [];
        }

        function  initialize() {
            $rootScope.getPointName = getPointName;
            $rootScope.setPoint = setPoint;
            $rootScope.pointMenuBackgroundColor = getPointMenuBackgroundColor;
            $rootScope.pointMenuActiveColor = getPointMenuActiveColor;
        }
    }
})();