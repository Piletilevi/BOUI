/**
 * Created by kaur on 20.09.2016.
 */
(function() {

    'use strict';

    angular
        .module('boApp')
        .factory('menuService', MenuService);

    MenuService.$inject = ['$rootScope','$location','$window','dataService','authService'];

    function MenuService($rootScope,$location,$window,dataService,authService) {
        var service = {
            initialize:initialize,
            toChangePassword:toChangePassword,
            toOldBo:toOldBo
        };
        return service;

        function initialize() {
            $rootScope.toOldBO = toOldBo;
            $rootScope.toChangePassword = toChangePassword;
            $rootScope.logout = logout;

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
    }
})();
