/**
 * Created by kaur on 1.09.2016.
 */
(function() {
    'use strict';

    angular
        .module('boApp')
        .factory('authService', ['$rootScope', '$route', '$location', 'Data', authService]);

    function authService($rootScope, $route, $location, Data) {
        return {
            login: login,
            logout : logout,
            verifySession : verifySession,
            checkUserAuth: checkUserAuth
        };
        function login (customer) {
			Data.getIp().then(function(result) {
				customer['clientip'] = result.ip;
				Data.post('login', {customer: customer})
					.then(function (results) {
						Data.page(results);
						if (results.status == "success") {
							$location.path('dashboard');
						}
					});
			}, function(e) {
				//alert("error");
			});

        }

        function logout(){
            Data.get('logout').then(function (results) {
                Data.page(results);
                Data.get('session').then(function (results) {
                    if (!results.user) {
                        $rootScope.user = null;
                        $rootScope.authenticated = false;
                        $location.path('login');
                        $route.reload();
                    }});
            });
        }

		function verifySession(){
            Data.post('verifySessionKey',{ "sessionkey" : searchkey }).then(function(results){
                Data.page(results);
                console.log(results);
                if (results.status == "success"){
                    Data.get('session').then(function (results) {
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
            Data.get('session').then(function (results) {
                if (results.user) {
                    $rootScope.authenticated = true;
                    $rootScope.user = results.user;
                    if (typeof($location.search().key) !== 'undefined') {
                        $location.path('dashboard');
                        $location.search('key', null);
                    }
                } else {
                    if(!$rootScope.authenticated && typeof($location.search().key) !== 'undefined'){
                        var searchkey =  $location.search().key;
                        $location.search('key', null);
                        authService.verifySession(searchkey);
                    }
                    var nextUrl = next.$$route.originalPath;
                    if (nextUrl == '/login') {
                    } else {
                        $location.path("/login");
                    }
                }
            });
        }
    }

})();