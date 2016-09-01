(function() {
    'use strict';
angular.module('boApp').config(['$routeProvider',routeProvider]).run(runRouteProvider);

    function routeProvider($routeProvider) {

        $routeProvider.
        when('/login', {
            title: 'Login',
            templateUrl: 'views/login.html',
            controller: 'AuthController',
            controllerAs: 'vm'
        })
            .when('/logout', {
                title: 'Logout',
                templateUrl: 'views/login.html',
                controller: 'AuthController',
                controllerAs: 'vm'
            })
            .when('/dashboard', {
                title: 'Dashboard',
                templateUrl: 'views/dashboard.html',
                controller: 'AuthController',
                controllerAs: 'vm'
            })
            .when('/', {
                title: 'Login',
                templateUrl: 'views/login.html',
                controller: 'AuthController',
                controllerAs: 'vm',
                role: '0'
            })
            .otherwise({
                redirectTo: '/login'
            });

    }

    function runRouteProvider ( $rootScope, $location, $log,  Data, authService) {

        $rootScope.$on("$routeChangeStart", function (event, next, current) {
            $rootScope.$log = $log;

            $rootScope.authenticated = false;

            authService.checkUserAuth(next);

        });
    }

})();