(function() {
    'use strict';
	
	angular.module('boApp')
        .config(['$routeProvider',routeProvider])
        .run(runRouteProvider);


    function routeProvider($routeProvider) {

        $routeProvider.
        when('/login', {
            title: 'Login',
            templateUrl: 'views/login.html',
            controller: 'MainController',
            controllerAs: 'vm'
        })
            .when('/logout', {
                title: 'Logout',
                templateUrl: 'views/login.html',
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

    function runRouteProvider ( $rootScope,  $log,   authService) {

        $rootScope.$on("$routeChangeStart", function (event, next, current) {
            $rootScope.$log = $log;

            $rootScope.authenticated = false;

            authService.checkUserAuth(next);

        });
    }

})();