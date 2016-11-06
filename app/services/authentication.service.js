/**
 * Created by kaur on 1.09.2016.
 */
(function() {
    'use strict';

    angular
        .module('boApp')
        .factory('authService', AuthService);

    AuthService.$inject = ['$rootScope', '$route', '$location', 'dataService'];

    function AuthService($rootScope, $route, $location, dataService) {
        var service = {
            initialize : initialize,
            login : login,
            logout : logout,
            verifySession : verifySession,
            checkUserAuth : checkUserAuth,
            changePassword : changePassword
        };
        return service;
        
        function initialize(){
        }
        
        function login (customer) {
			dataService.getIp().then(function(result) {
				customer['clientip'] = result.ip;
				dataService.post('login', {customer: customer})
					.then(function (results) {
						dataService.page(results);
						if (results.status == "success") {
							$location.path('dashboard');
						}
					});
			}, function(e) {
				//alert("error");
			});
        }

        function logout(){
            dataService.get('logout').then(function (results) {
                dataService.page(results);
                dataService.get('session').then(function (results) {
                    if (!results.user) {
                        $rootScope.user = null;
                        $rootScope.authenticated = false;
                        $location.path('login');
                        $route.reload();
                    }});
            });
        }

		function verifySession(searchkey){

            dataService.post('verifySessionKey',{ "sessionkey" : searchkey }).then(function(results){
                dataService.page(results);
                if (results.status == "success"){
                    dataService.get('session').then(function (results) {
                        if (results.user) {
                            $rootScope.authenticated = true;
                            $rootScope.user = results.user;
                            $location.path('dashboard');
                        }
                    });
                }
            });

        }
        function checkUserAuth(next){
            var nextUrl = next.$$route.originalPath;
            dataService.get('session').then(function (results) {
                if (results.user) {
                    $rootScope.authenticated = true;
                    $rootScope.user = results.user;
                    if (typeof($location.search().key) !== 'undefined') {
                        $location.search('key', null);
                    }
                    if ( $rootScope.authenticated && nextUrl === "/" || nextUrl === '/login' ){
                        $location.path('dashboard');
                    }
                } else {
                    if(!$rootScope.authenticated && typeof($location.search().key) !== 'undefined'){
                        var searchkey =  $location.search().key;
                        $location.search('key', null);
                        verifySession(searchkey);
                    }

                    if (nextUrl == '/login') {
                    } else {
                        $location.path("/login");
                    }
                }
            });
        }

		function changePassword(change) {
            dataService.post('changePassword', {passwordSet: change})
                .then(function (results) {
                    dataService.page(results);
                    if (results.status == "success") {
                        $location.path('dashboard');
                    }
                });
        }
    }

})();