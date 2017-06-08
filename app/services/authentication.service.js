/**
 * Created by kaur on 1.09.2016.
 */
(function() {
    'use strict';

    angular
        .module('boApp')
        .factory('authService', AuthService);

    AuthService.$inject = ['$rootScope', '$route', '$location', '$filter', 'dataService', 'pointService', 'eventService', '$cookies'];

    function AuthService($rootScope, $route, $location, $filter, dataService, pointService, eventService, $cookies) {
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
                            var redirectUrl = localStorage.getItem('redirectUrl');
                            if(redirectUrl) {
                                localStorage.removeItem('redirectUrl');
                                $location.path(redirectUrl);
                            }
                            else {
                                $location.path('dashboard');
                            }
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
                        $cookies.remove('boDashboardFilter');
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
                    var userPoint = $filter('filter')($rootScope.user.salesPoints, function (s) {return s.id == next.params.pointId;})[0];
                    if(next.params.pointId && userPoint) {
                        $rootScope.user.point = userPoint.id;
                    }
                    pointService.setPoint($rootScope.user.point);
                    if (typeof($location.search().key) !== 'undefined') {
                        $location.search('key', null);
                    }
                    if ( $rootScope.authenticated && nextUrl === "/" || nextUrl === '/login' ){
                        $location.path('dashboard');
                    }
                } else {
                    $rootScope.authenticated = false;
                    if(typeof($location.search().key) !== 'undefined'){
                        var searchkey =  $location.search().key;
                        $location.search('key', null);
                        verifySession(searchkey);
                    }

                    if (nextUrl == '/login') {
                    } else {
                        if($location.path() !== '/login') {
                            localStorage.setItem('redirectUrl', $location.path());
                        }
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