/**
 * Created by kaur on 20.09.2016.
 */(function() {
    'use strict';

    angular
        .module('boApp')
        .factory('pointService', pointService);

    pointService.$inject = ['$rootScope','dataService'];


    function pointService($rootScope,dataService) {
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
            dataService.post('setPoint', {'pointId': pointId });
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