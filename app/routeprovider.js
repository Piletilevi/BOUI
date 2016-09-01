(function() {
    'use strict';
angular.module('boApp').config(['$routeProvider',routeProvider]).run(runRouteProvider);

    function routeProvider($routeProvider) {

        $routeProvider.
        when('/login', {
            title: 'Login',
            templateUrl: 'views/login.html',
            controller: 'AuthController'
        })
            .when('/logout', {
                title: 'Logout',
                templateUrl: 'views/login.html',
                controller: 'AuthController'
            })
            .when('/dashboard', {
                title: 'Dashboard',
                templateUrl: 'views/dashboard.html',
                controller: 'AuthController'
            })
            .when('/', {
                title: 'Login',
                templateUrl: 'views/login.html',
                controller: 'AuthController',
                role: '0'
            })
            .otherwise({
                redirectTo: '/login'
            });

    }

    function runRouteProvider ( $rootScope, $location, $log,  Data) {

        $rootScope.$on("$routeChangeStart", function (event, next, current) {
            $rootScope.$log = $log;

            $rootScope.authenticated = false;

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
                    var nextUrl = next.$$route.originalPath;
                    if (nextUrl == '/login') {
                    } else {
                        $location.path("/login");
                    }
                }
            });

        });
    }

})();