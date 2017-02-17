/**
 * Created by kaur on 20.09.2016.
 */

(function () {
    'use strict';

    angular
        .module('boApp')
        .factory('pointService', PointService);

    PointService.$inject = ['$rootScope', '$location', 'dataService'];

    function PointService($rootScope, $location, dataService) {
        var service = {
            getPointName: getPointName,
            setPoint: setPoint,
            getPointMenuBackgroundColor: getPointMenuBackgroundColor,
            getPointMenuActiveColor: getPointMenuActiveColor,
            getPointMenuLogo: getPointMenuLogo,
            initialize: initialize
        };
        return service;


        function findPoint(point) {
            return point.id === $rootScope.user.point;
        }

        function getPointName() {
            return $rootScope.user.salesPoints.find(findPoint).name
        }

        function setPoint(pointId) {
            // Redirect to dashboard after changing the point
            if ($rootScope.user.point !== pointId) {
                $location.path('dashboard');
            }

            $rootScope.user.point = pointId;
            $rootScope.pointMenuLogo = getPointMenuLogo();
            $rootScope.pointMenuBackgroundColor = getPointMenuBackgroundColor();
            $rootScope.pointMenuActiveColor = getPointMenuActiveColor();
        }

        function getPointMenuLogo() {
            var settings = getPointSettings();
            if (settings != null) {
                var setting = settings.find(getPointTopMenuLogo);
                if (setting != null) {
                    return setting.value;
                }
            }
            return "img/logo.png";
        }

        function getPointMenuBackgroundColor() {
            var settings = getPointSettings();
            if (settings != null) {
                var setting = settings.find(getPointTopMenuBackgroundColorSetting);
                if (setting != null) {
                    return setting.value;
                }
            }
            return "";
        }

        function getPointMenuActiveColor() {
            var settings = getPointSettings();
            if (settings != null) {
                var setting = settings.find(getPointTopMenuColorSetting);
                if (setting != null) {
                    return setting.value;
                }
            }
            return "";
        }

        function getPointTopMenuLogo(setting) {
            if (setting != null) {
                return setting.name === "api_headerlogo";
            }
            return;
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

        function initialize() {
            $rootScope.getPointName = getPointName;
            $rootScope.setPoint = setPoint;
        }
    }
})();