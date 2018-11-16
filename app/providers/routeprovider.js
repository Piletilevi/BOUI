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
                templateUrl: 'views/login/login.html',
                controller: 'mainController',
                controllerAs: 'vm'
            })
            .when('/changepassword', {
                title: 'Login',
                templateUrl: 'views/login/change_password.html',
                controller: 'mainController',
                controllerAs: 'vm'
            })
            .when('/logout', {
                title: 'Logout',
                templateUrl: 'views/login/login.html',
                controller: 'mainController',
                controllerAs: 'vm'
            })
            .when('/report/:pointId/:type/:id', {
                title: 'Report',
                templateUrl: 'views/common/reports/report.html',
                controller: 'reportController',
                controllerAs: 'vm'
            })
            .when('/report/:pointId/:type/:id/:reportType', {
                title: 'Report',
                templateUrl: 'views/common/reports/report.html',
                controller: 'reportController',
                controllerAs: 'vm'
            })
            .when('/report/:pointId/:type/:id/:reportType/:sectorId', {
                title: 'Report',
                templateUrl: 'views/common/reports/report.html',
                controller: 'reportController',
                controllerAs: 'vm'
            })
            .when('/report/:pointId/:type/:id/:reportType/:sectorId/:reservation', {
                title: 'Report',
                templateUrl: 'views/common/reports/report.html',
                controller: 'reportController',
                controllerAs: 'vm'
            })
            .when('/dashboard/', {
                title: 'Events',
                templateUrl: 'views/common/reports/events.html',
                controller: 'dashboardController',
                controllerAs: 'vm'
            })
            .when('/dashboard/:type', {
                title: 'Events',
                templateUrl: 'views/common/reports/events.html',
                controller: 'dashboardController',
                controllerAs: 'vm'
            })
            .when('/invoices/', {
                title: 'Invoices',
                templateUrl: 'views/common/invoices/invoice_events.html',
                controller: 'invoiceController',
                controllerAs: 'vm'
            })
            .when('/invoices/:eventId/:viewName', {
                title: 'Invoices',
                templateUrl: 'views/common/invoices/invoice_transactions.html',
                controller: 'invoiceController',
                controllerAs: 'vm'
            })
            .when('/', {
                title: 'Login',
                templateUrl: 'views/login/login.html',
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
            $rootScope.filterNotNeeded = ($location.path() == '/changepassword') || ($location.path().indexOf("invoices") > -1);
        });

        $rootScope.$on('$routeChangeSuccess', function(){
            ga('send', 'pageview', $location.path());
        });
    }

})();