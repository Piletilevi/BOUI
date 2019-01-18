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

       // var originalWhen = $routeProvider.when;

        $routeProvider.accessWhen = function(path, route){

            route.resolve = {
                'currentUser':function(authService){
                    return authService.checkUser();
                }
            };

            return $routeProvider.when(path, route);
        };

        $routeProvider
            .when('/login', {
                title: 'Login',
                templateUrl: 'views/login/login.html',
                controller: 'mainController',
                controllerAs: 'vm'
            })
            .when('/', {
                title: 'Login',
                templateUrl: 'views/login/login.html',
                controller: 'mainController',
                controllerAs: 'vm',
                role: '0'
            })
            .when('/logout', {
                title: 'Logout',
                templateUrl: 'views/login/login.html',
                controller: 'mainController',
                controllerAs: 'vm'
            })
            .accessWhen('/changepassword', {
                title: 'Login',
                templateUrl: 'views/login/change_password.html',
                controller: 'mainController',
                controllerAs: 'vm'
            })

            .accessWhen('/report/:pointId/:type/:id', {
                title: 'Report',
                templateUrl: 'views/common/reports/report.html',
                controller: 'reportController',
                controllerAs: 'vm'
            })
            .accessWhen('/report/:pointId/:type/:id/:reportType', {
                title: 'Report',
                templateUrl: 'views/common/reports/report.html',
                controller: 'reportController',
                controllerAs: 'vm'
            })
            .accessWhen('/report/:pointId/:type/:id/:reportType/:sectorId', {
                title: 'Report',
                templateUrl: 'views/common/reports/report.html',
                controller: 'reportController',
                controllerAs: 'vm'
            })
            .accessWhen('/report/:pointId/:type/:id/:reportType/:sectorId/:reservation', {
                title: 'Report',
                templateUrl: 'views/common/reports/report.html',
                controller: 'reportController',
                controllerAs: 'vm'
            })
            .accessWhen('/dashboard/', {
                title: 'Events',
                templateUrl: 'views/common/reports/events.html',
                controller: 'dashboardController',
                controllerAs: 'vm'
            })
            .accessWhen('/dashboard/:type', {
                title: 'Events',
                templateUrl: 'views/common/reports/events.html',
                controller: 'dashboardController',
                controllerAs: 'vm'
            })
            .accessWhen('/invoices/', {
                title: 'Invoices',
                templateUrl: 'views/common/invoices/invoice_events.html',
                controller: 'invoiceController',
                controllerAs: 'vm'

            })
            .accessWhen('/invoices/:eventId/:viewName', {
                title: 'Invoices',
                templateUrl: 'views/common/invoices/invoice_transactions.html',
                controller: 'invoiceController',
                controllerAs: 'vm'
            })
 	        .accessWhen('/admin/', {
                title: 'Admin',
                templateUrl: 'views/common/admin/admin.html',
                controller: 'adminController',
                controllerAs: 'vm'
            })
            .accessWhen('/admin/jobs', {
                title: 'Jobs',
                templateUrl: 'views/common/admin/jobs.html',
                controller: 'jobController',
                controllerAs: 'vm'
            })
            .accessWhen('/backoffice/', {
                title: 'Backoffice',
                templateUrl: 'views/common/backoffice/backoffice.html',
                controller: 'backofficeController',
                controllerAs: 'vm'
            })
            .accessWhen('/backoffice/refund', {
                title: 'Refund',
                templateUrl: 'views/common/backoffice/refund.html',
                controller: 'refundController',
                controllerAs: 'vm'
            })
            .otherwise({
                redirectTo: '/login'
            });

    }
    
    runRouteProvider.$inject=['$rootScope', '$log', '$location', 'authService', 'menuService'];

    function runRouteProvider ( $rootScope, $log, $location, authService, menuService) {
        $rootScope.$on("$routeChangeStart", function (event, next, current) {
            $rootScope.$log = $log;
            authService.checkUserAuth(next);
            $rootScope.filterNotNeeded = ($location.path() == '/changepassword') || ($location.path().indexOf("invoices") > -1);
            menuService.route($location.path());
        });

        $rootScope.$on('$routeChangeSuccess', function(){
            ga('send', 'pageview', $location.path());
        });
    }

})();
