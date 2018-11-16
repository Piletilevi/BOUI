(function() {
    'use strict';
    angular
        .module('boApp')
        .factory('menuService', MenuService);
    MenuService.$inject = ['$rootScope','$location','$window','dataService','authService'];
    function MenuService($rootScope,$location,$window,dataService,authService) {
        $rootScope.userMenuOpen = false;
        $rootScope.languageMenuOpen = false;
        $rootScope.salespointMenuOpen = false;
        var service = {
            initialize:initialize,
            toChangePassword:toChangePassword,
            toOldBo:toOldBo,
            isActiveMenu:isActiveMenu,
            setActiveBackground:setActiveBackground
        };
        return service;

        function initialize() {
            $rootScope.toOldBO = toOldBo;
            $rootScope.toChangePassword = toChangePassword;
            $rootScope.logout = logout;
            $rootScope.isActiveMenu = isActiveMenu;
            $rootScope.setActiveBackground = setActiveBackground;
        }

        function toChangePassword(){
            $location.path("/changepassword");
        }
        function logout(){
            authService.logout();
        }
        function toOldBo() {
            var boBasicUrl = '';
            dataService.getBoUrl().then(function(results) {
				if (results.status === "success") {
                    boBasicUrl = results.boBaseUrl;
					if ($rootScope.authenticated) {
						dataService.getIp().then(function(result) {
							dataService.post('getYellowSessionKey',{'clientip':result.ip}).then(function (sessionResults) {
								if (sessionResults.status === "success") {
									var bourl = boBasicUrl.replace("{sessionkey}", sessionResults.boSession.sessionkey);
									$window.location.href = bourl;
								}
							});
						}, function(e) {
							//alert("error");
						});
					}
				}
            });
        }
        function isActiveMenu(menu) {
            if ($location.path().indexOf(menu) >= 0) {
                return true;
            }
            return false;
        }
        function setActiveBackground() {
            if($rootScope.pointMenuGamma) {
                return $rootScope.pointMenuGammaAccent;
            }
            return '#fff';
        }
    }
})();
