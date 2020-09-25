/**
 * Created by kaur on 1.09.2016.
 */
(function() {
    'use strict';

    angular
        .module('boApp')
        .factory('authService', AuthService);

    AuthService.$inject = ['$rootScope', '$route', '$location', '$filter', 'dataService', 'pointService', 'eventService','translationService', '$cookies', '$q'];

    function AuthService($rootScope, $route, $location, $filter, dataService, pointService, eventService,translationService, $cookies, $q) {
        var service = {
            initialize : initialize,
            login : login,
            logout : logout,
            verifySession : verifySession,
            checkUser : checkUser,
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
                            translationService.setLangValue($rootScope.language);
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

        function verifySession(){
			dataService.post('verifySessionKey').then(function(results){
                dataService.page(results);
                if (results && results.status == "success"){
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

        function checkUser(){
            var deferred = $q.defer();
            dataService.get('session').then(function (results) {
                if (results.user) {
                    $rootScope.authenticated = true;
                    $rootScope.user = results.user;
                    deferred.resolve(results.user);
                    return deferred.promise;
                }
                else {
                    $rootScope.authenticated = false;
                    $rootScope.user = null;
                    deferred.reject("No user");
                }
            });
            return deferred.promise;
        }
        function checkUserAuth(next){
            var nextUrl = next.$$route.originalPath;
            $rootScope.loadedView = false;
            checkUser().then(
                function(user){
                    pointService.setPoint($rootScope.user.point);
                    if (typeof($location.search().key) !== 'undefined') {
                        $location.search('key', null);
                    }
                    if ( $rootScope.authenticated && nextUrl === "/" || nextUrl === '/login' ){
                        $location.path('dashboard');
                    }
                },
                function(message){
                    if(typeof($location.search().key) !== 'undefined'){
                        var searchkey =  $location.search().key;
                        $location.search('key', null);
                        verifySession();
                    }

                    if (nextUrl == '/login') {
                    } else {
                        if($location.path() !== '/login') {
                            localStorage.setItem('redirectUrl', $location.path());
                        }
                        $location.path("/login");
                    }
                }
            );

        }

        function changePassword(change) {
            dataService.post('changePassword', {passwordSet: change})
                .then(function (results) {
                    dataService.page(results);
                    if (results.status == "success") {
                        $location.path('dashboard');
                        $rootScope.passwordChangeError = false;
                    }else {
                        $rootScope.passwordChangeError = results.message;
                    }
                });
        }
    }

})();
