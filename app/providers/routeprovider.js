(function() {
    'use strict';
	
	angular.module('boApp')
        .config(['$routeProvider',routeProvider])
        .run(runRouteProvider);

    routeProvider.$inject=['$routeProvider'];
    function routeProvider($routeProvider) {

        $routeProvider
            .when('/login', {
                title: 'Login',
                templateUrl: 'views/login.html',
                controller: 'MainController',
                controllerAs: 'vm'
            })
            .when('/changepassword', {
                title: 'Login',
                templateUrl: 'views/change_password.html',
                controller: 'MainController',
                controllerAs: 'vm'
            })
            .when('/logout', {
                title: 'Logout',
                templateUrl: 'views/login.html',
                controller: 'MainController',
                controllerAs: 'vm'
            })
            .when('/report', {
                title: 'Dashboard',
                templateUrl: 'views/report.html',
                controller: 'MainController',
                controllerAs: 'vm'
            })
            .when('/dashboard', {
                title: 'Dashboard',
                templateUrl: 'views/dashboard.html',
                controller: 'MainController',
                controllerAs: 'vm'
            })
            .when('/', {
                title: 'Login',
                templateUrl: 'views/login.html',
                controller: 'MainController',
                controllerAs: 'vm',
                role: '0'
            })
            .otherwise({
                redirectTo: '/login'
            });

    }
    runRouteProvider.$inject=['$rootScope', '$log', 'authService'];
    function runRouteProvider ( $rootScope, $log, authService) {

        $rootScope.$on("$routeChangeStart", function (event, next, current) {
            $rootScope.$log = $log;

            $rootScope.authenticated = false;

            authService.checkUserAuth(next);

        });
    }

})();