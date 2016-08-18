'use strict';

angular.module('boApp', ['ngRoute', 'ngAnimate', 'bo']);

var app = angular.module('boApp');

app.config(['$routeProvider',
  function ($routeProvider) {
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
  }])
    .run(function ($rootScope, $location, Data) {
        $rootScope.$on("$routeChangeStart", function (event, next, current) {
            $rootScope.languages=getLanguages(Data);
            $rootScope.authenticated = false;
            Data.get('session').then(function (results) {
                if (results.user) {
                    $rootScope.authenticated = true;
                    $rootScope.user = results.user;
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

function getLanguages(Data){
    Data.get('languages').then(
        function(results){
            return results;
        }
    )

}