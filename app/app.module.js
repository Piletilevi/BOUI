(function() {
    'use strict';

    angular.module('boApp', [
        'ngRoute',
        'ngSanitize',
        'ngAnimate',
        'ngSanitize',
        'bo',
        'ngCookies',
        'pascalprecht.translate'
    ]);

    angular.module('boApp').run(runApp);
    runApp.$inject = ['$rootScope','$window','dataService','authService','translationService'];
    function runApp( $rootScope,$window,dataService,authService,translationService){

        $rootScope.toOldBO = toOldBo;
        $rootScope.getPointName = getPointName;
        $rootScope.setPoint = setPoint;
        $rootScope.pointMenuBackgroundColor = getPointMenuBackgroundColor;
        $rootScope.pointMenuActiveColor = getPointMenuActiveColor;
		

        authService.initialize();
        translationService.initialize();

        $rootScope.isTranslated = false;
        $rootScope.$on('$translateChangeSuccess', function () {
            $rootScope.isTranslated = true;
        });

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
			var parameters = $rootScope.user.salesPoints.find(findPoint).parameters;
			return parameters;
        }

		function toOldBo() {
            var boBasicUrl = '';
            dataService.getBoUrl().then(function(results) {
                if (results.status === "success") {
                    boBasicUrl = results.boBaseUrl;
                }
                else  boBasicUrl = '';
            });

            if ($rootScope.authenticated) {
                dataService.getIp().then(function(result) {
                    dataService.post('getSessionKey',{'username':$rootScope.user.userId,'clientip':result.ip}).then(function (results) {
                        if (results.status === "success") {
                            var bourl = boBasicUrl.replace("{sessionkey}", results.boSession.sessionkey);
                            $window.location.href = bourl;
                        }
                    });
                }, function(e) {
                    //alert("error");
                });

            }
        }
    }
})();