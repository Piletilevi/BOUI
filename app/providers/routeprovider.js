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
            .when('/report/:pointId/:type/:id', {
                title: 'Report',
                templateUrl: 'views/report.html',
                controller: 'reportController',
                controllerAs: 'vm'
            })
            .when('/report/:pointId/:type/:id/:reportType', {
                title: 'Report',
                templateUrl: 'views/report.html',
                controller: 'reportController',
                controllerAs: 'vm'
            })
            .when('/report/:pointId/:type/:id/:reportType/:sectorId', {
                title: 'Report',
                templateUrl: 'views/report.html',
                controller: 'reportController',
                controllerAs: 'vm'
            })
            .when('/report/:pointId/:type/:id/:reportType/:sectorId/:reservation', {
                title: 'Report',
                templateUrl: 'views/report.html',
                controller: 'reportController',
                controllerAs: 'vm'
            })
            .when('/dashboard/', {
                title: 'Dashboard',
                templateUrl: 'views/dashboard.html',
                controller: 'dashboardController',
                controllerAs: 'vm'
            })
            .when('/dashboard/:type', {
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
    
    runRouteProvider.$inject=['$rootScope', '$log', '$location', 'authService'];

    function runRouteProvider ( $rootScope, $log, $location, authService) {
        $rootScope.$on("$routeChangeStart", function (event, next, current) {
            $rootScope.$log = $log;
            authService.checkUserAuth(next);
        });

        $rootScope.$on('$routeChangeSuccess', function(){
            ga('send', 'pageview', $location.path());
        });
    }

})();