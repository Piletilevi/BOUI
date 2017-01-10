(function() {
    'use strict';
	
	angular.module('boApp')
        .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
            routeProvider($routeProvider);
            $locationProvider.hashPrefix('');
        }])
        .run(runRouteProvider);

    routeProvider.$inject=['$routeProvider'];
    function routeProvider($routeProvider) {

        $routeProvider
            .when('/login', {
                title: 'Login',
                templateUrl: 'views/login.html',
                controller: 'mainController',
                controllerAs: 'vm'
            })
            .when('/changepassword', {
                title: 'Login',
                templateUrl: 'views/change_password.html',
                controller: 'mainController',
                controllerAs: 'vm'
            })
            .when('/logout', {
                title: 'Logout',
                templateUrl: 'views/login.html',
                controller: 'mainController',
                controllerAs: 'vm'
            })
            .when('/report/:type/:id', {
                title: 'Report',
                templateUrl: 'views/report.html',
                controller: 'reportController',
                controllerAs: 'vm'
            })
            .when('/dashboard', {
                title: 'Dashboard',
                templateUrl: 'views/dashboard.html',
                controller: 'dashboardController',
                controllerAs: 'vm'
            })
            .when('/', {
                title: 'Login',
                templateUrl: 'views/login.html',
                controller: 'mainController',
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