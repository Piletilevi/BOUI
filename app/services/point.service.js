/**
 * Created by kaur on 20.09.2016.
 */

(function () {
    'use strict';

    angular
        .module('boApp')
        .factory('pointService', PointService);

    PointService.$inject = ['$rootScope', '$location', 'dataService', 'eventService'];

    function PointService($rootScope, $location, dataService, eventService) {
        var service = {
            getPointName: getPointName,
            getPointCountryId: getPointCountryId,
            setPoint: setPoint,
            setHideEvents: setHideEvents,
            getPointMenuBackgroundColor: getPointMenuBackgroundColor,
            getPointId: getPointId,
            getPointMenuLogo: getPointMenuLogo,
            getPointMenuGamma: getPointMenuGamma,
            getPointMenuGammaAccent: getPointMenuGammaAccent,
            getPointAccentColor: getPointAccentColor,
            isPointSuperCentre: isPointSuperCentre,
            initialize: initialize
        };
        return service;


        function findPoint(point) {
            return point.id === $rootScope.user.point;
        }

        function getPointName() {
            if ($rootScope.user.salesPoints != null) {
				return $rootScope.user.salesPoints.find(findPoint).name;
			}
			return "";
        }

        function isPointSuperCentre(){
            var point;

            if ($rootScope.user.salesPoints != null) {
                point = $rootScope.user.salesPoints.find(findPoint);
                return point.superCentreCentreId === point.id;
            }
            return false;
        }
        function getPointCountryId() {
            if ($rootScope.user.salesPoints != null) {
                return $rootScope.user.salesPoints.find(findPoint).country;
            }
            return "";
        }

		function getPointId() {
            if ($rootScope.user.salesPoints != null) {
                return $rootScope.user.salesPoints.find(findPoint).id;
            }
            return "";
        }

        function getPointLinks() {
            if ($rootScope.user.salesPoints != null) {
				return $rootScope.user.salesPoints.find(findPoint).links;
			}
			return "";
        }

        function setPoint(pointId) {
            var prevPoint = $rootScope.user.point;
            dataService.post('setPoint', {'pointId': pointId});

            $rootScope.user.point = pointId;
            $rootScope.pointMenuLogo = getPointMenuLogo();
            $rootScope.pointMenuBackgroundColor = getPointMenuBackgroundColor();
            $rootScope.eventLinks = getPointLinks();
            $rootScope.pointMenuGamma = getPointMenuGamma();
            $rootScope.pointAccentColor = getPointAccentColor($rootScope.pointMenuGamma,$rootScope.pointMenuBackgroundColor);
            $rootScope.pointMenuActiveColor = getPointMenuActiveColor();
            if ($rootScope.hideEventsForPointInit == null) {
                $rootScope.hideEventsForPointInit = setHideEvents();
                $rootScope.hideEvents = $rootScope.hideEventsForPointInit;
            }

            if (prevPoint !== pointId) {
                $rootScope.hideEventsForPointInit = setHideEvents();
                $rootScope.hideEvents = $rootScope.hideEventsForPointInit;
                eventService.reset();
                if ($location.path().indexOf("dashboard") == -1) {
                    $location.path('dashboard');
                }
            }
        }

        function getPointMenuActiveColor() {
            if ($rootScope.pointMenuGamma) {
                return $rootScope.pointAccentColor;
            }
            return '#fff';
        }

        function getPointAccentColor(pointGamma,pointColor) {
            var accentColor = pointColor;
            if (pointGamma) {
                accentColor = $rootScope.pointMenuGammaAccent;
            }
            return accentColor;
        }
        function getPointMenuGamma() {
            var settings = getPointSettings();
            if (settings != null) {
                var setting = settings.find(getPointTopMenuGamma);
                if (setting != null) {
                    if (setting.value == "true") {
                        return true;
                    }
                }
            }
            return false;
        }
        function getPointMenuGammaAccent() {
            var settings = getPointSettings();
            if (settings != null) {
                var setting = settings.find(getPointTopMenuGammaAccent);
                if (setting != null) {
                    return setting.value;
                }
            }
            return "#5e7287";
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
            return "#5e7287";
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
        function getPointTopMenuGamma(setting) {
            if (setting != null) {
                return setting.name === "api_headerGamma";
            }
            return;
        }
        function getPointTopMenuGammaAccent(setting) {
            if (setting != null) {
                return setting.name === "api_headerGammaAccent";
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

        function getParameter(parameters, name) {
            var parameter = null;
            angular.forEach(parameters, function(param) {
                if (param.name === name) {
                    parameter = param;
                }
            });
            return parameter;
        }

        function setHideEvents() {
            var hideEvents = false;
            if ($rootScope.user.salesPoints.find(findPoint).country !== $rootScope.user.salesPoints.find(findPoint).id) {
                return hideEvents;
            }
            var settings = getPointSettings();
            if (settings != null) {
                var setting = settings.find(getHideEvents);
                if (setting != null) {
                    if (setting.value == "true") {
                        hideEvents = true;
                    }
                }
                if (hideEvents) {
                    if($rootScope.user && $rootScope.user.roles) {
                        hideEvents = false;
                        angular.forEach($rootScope.user.roles, function(role) {
                            if (role.name === "api_hideEvents" && role.fullAccess === true) {
                                hideEvents = true;
                            }
                        });
                    }
                }
            }
            return hideEvents;
        }
        function getHideEvents(setting) {
            if (setting != null) {
                return setting.name === "api_hideEventsOnStart";
            }
            return;
        }

        function initialize() {
            $rootScope.getPointName = getPointName;
            $rootScope.setPoint = setPoint;
            $rootScope.isPointSuperCentre = isPointSuperCentre;
            $rootScope.getLogicalPointParam = function(name) {
                var hasCentreParam = false;
                if($rootScope.user && $rootScope.user.salesPoints) {
                    var parameters = $rootScope.user.salesPoints.find(findPoint).parameters;
                    if (parameters != null) {
                        var parameter = getParameter(parameters, name);
                        if (parameter != null) {
                            if (parameter.value == "true") {
                                hasCentreParam = true;
                            }
                        }
                    }
                }
                return hasCentreParam;
            };
            $rootScope.getValuePointParam = function(name) {
                var hasCentreParam = "";
                if($rootScope.user && $rootScope.user.salesPoints) {
                    var parameters = $rootScope.user.salesPoints.find(findPoint).parameters;
                    if (parameters != null) {
                        var parameter = getParameter(parameters, name);
                        if (parameter != null) {
                            if (parameter.value != null) {
                                hasCentreParam = parameter.value;
                            }
                        }
                    }
                }
                return hasCentreParam;
            };

        }
    }
})();