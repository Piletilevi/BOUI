var app = angular.module('myApp', ['ngRoute', 'ngAnimate', 'bo']);

app.config(['$routeProvider',
  function ($routeProvider) {
        $routeProvider.
        when('/login', {
            title: 'Login',
            templateUrl: 'views/login.html',
            controller: 'auth.controller'
        })
            .when('/logout', {
                title: 'Logout',
                templateUrl: 'views/login.html',
                controller: 'auth.controller'
            })
            .when('/dashboard', {
                title: 'Dashboard',
                templateUrl: 'views/dashboard.html',
                controller: 'auth.controller'
            })
            .when('/', {
                title: 'Login',
                templateUrl: 'views/login.html',
                controller: 'auth.controller',
                role: '0'
            })
            .otherwise({
                redirectTo: '/login'
            });
  }])
    .run(function ($rootScope, $location, Data) {
        $rootScope.$on("$routeChangeStart", function (event, next, current) {
            $rootScope.authenticated = false;
            Data.get('session').then(function (results) {
                if (results.user) {
                    $rootScope.authenticated = true;
                    $rootScope.uid = results.user.id;
                    $rootScope.name = results.user.name;
                    $rootScope.username = results.user.userId;
                } else {
                    var nextUrl = next.$$route.originalPath;
                    if (nextUrl == '/login') {

                    } else {
                        $location.path("/login");
                    }
                }
            });
        });
    });