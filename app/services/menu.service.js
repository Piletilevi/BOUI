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
	var activeTopMenu = null;
	var activeSubMenu = null;
        var service = {
            initialize:initialize,
            toChangePassword:toChangePassword,
            toOldBo:toOldBo,
            route: route,
            setActiveTopMenu: setActiveTopMenu,
            getActiveTopMenu: getActiveTopMenu
        };
        return service;

        function initialize() {
            $rootScope.toOldBO = toOldBo;
            $rootScope.toChangePassword = toChangePassword;
            $rootScope.logout = logout;
            $rootScope.isActiveTopMenu = function(menuName) {
                return activeTopMenu==menuName;
            }
            $rootScope.isActiveSubMenu = function(menuName) {
                return activeSubMenu==menuName;
            }
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
							    console.log(sessionResults.boSession);
								if (sessionResults.status === "success") {
									var bourl = boBasicUrl.replace("{sessionkey}", sessionResults.boSession.sessionkey);
									bourl = bourl.replace("{resource}", "menu.p");
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
        function setActiveBackground() {
            if($rootScope.pointMenuGamma) {
                return $rootScope.pointMenuGammaAccent;
            }
            return '#fff';
        }
		
        function route(locationPath){
			if (locationPath && locationPath !== '') {
				var array = locationPath.split('/');
				if (array.length > 1) {
					setActiveTopMenu(array[1]);
					if (array.length > 2) {
						setActiveSubMenu(array[2]);
					}
				}
			} 
        }

        function setActiveTopMenu(menu){
            activeTopMenu = menu;
        }
		
        function getActiveTopMenu(){
            return activeTopMenu;
        }

        function setActiveSubMenu(menu){
            activeSubMenu = menu;
        }
		
        function getActiveSubMenu(){
            return activeSubMenu;
        }
		
    }
})();
