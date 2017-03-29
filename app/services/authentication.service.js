/**
 * Created by kaur on 1.09.2016.
 */
(function() {
    'use strict';

    angular
        .module('boApp')
        .factory('authService', AuthService);

    AuthService.$inject = ['$rootScope', '$route', '$location', 'dataService', 'pointService', 'eventService'];

    function AuthService($rootScope, $route, $location, dataService, pointService, eventService) {
        var service = {
            initialize : initialize,
            login : login,
            logout : logout,
            verifySession : verifySession,
            checkUserAuth : checkUserAuth,
            changePassword : changePassword,
            getRememberedUser: getRememberedUser
        };
        return service;
        
        function initialize(){
            $rootScope.hasFullAccess = function(name) {
                var hasFullAccess = false;
                if($rootScope.user && $rootScope.user.roles) {
                    angular.forEach($rootScope.user.roles, function(role) {
                        if (role.name === name && role.fullAccess === true) {
                            hasFullAccess = true;
                        }
                    });
                }
                return hasFullAccess;
            }
        }
        
        function login (customer) {
            rememberMe(customer);
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

        function rememberMe(customer) {
            if(customer && customer.rememberMe) {
                localStorage.setItem('bo-user', JSON.stringify(customer));
            }
            else {
                localStorage.removeItem('bo-user');
            }
        }

        function getRememberedUser() {
            return JSON.parse(localStorage.getItem('bo-user'));
        }

        function logout(){
            dataService.get('logout').then(function (results) {
                dataService.page(results);
                dataService.get('session').then(function (results) {
                    if (!results.user) {
                        eventService.reset();
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
                    pointService.setPoint($rootScope.user.point);
                    $rootScope.user.roles = [
                        {"name": "api_reports", "fullAccess": true, "readAccess": false},
                        {"name": "api_reports_overview", "fullAccess": true, "readAccess": false},
                        {"name": "api_reports_pricetype", "fullAccess": true, "readAccess": false},
                        {"name": "api_reports_priceclass", "fullAccess": true, "readAccess": false},
                        {"name": "api_reports_sections", "fullAccess": true, "readAccess": false},
                        {"name": "api_reports_locations", "fullAccess": true, "readAccess": false},
                        {"name": "api_reports_revenue", "fullAccess": true, "readAccess": false},
                        {"name": "api_reports_dashboard_tab_on_sale", "fullAccess": true, "readAccess": false},
                        {"name": "api_reports_export_to_file", "fullAccess": true, "readAccess": false},
                        {"name": "api_reports_sub_prmtr_db", "fullAccess": true, "readAccess": false},
                        {"name": "api_salespoint", "fullAccess": true, "readAccess": false}
                    ];
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