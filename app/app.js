'use strict';

angular.module('boApp', ['ngRoute','ngSanitize','ngAnimate','ngSanitize','bo','pascalprecht.translate']);

var app = angular.module('boApp');


app.factory('customLoader', function ($q, Data,$log) {
    // return loaderFn
    return function (options) {
        var deferred = $q.defer(),translations;
        $log.log(Data);
        // do something with $http, $q and key to load localization files
        Data.post('translations',{ 'languageId': options.key }).then(function(results){
            $log.log(results);
            translations = results.translations.translations;
            $log.log(results.translations.translations);
            deferred.resolve(translations);
        });

        return deferred.promise;
    };
});

app.config(['$translateProvider', function ($translateProvider) {
    $translateProvider.useSanitizeValueStrategy('escape');
    $translateProvider.useLoader('customLoader');
    $translateProvider.useLoaderCache(true);
    $translateProvider.fallbackLanguage('ENG');
    //Data.post('translations',{ languageId: "ENG" });
    // .then(function(results){
       // $translateProvider.translations(results.translations.languageId, results.translations.transaltions)

    //});

}]);

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
    .run(function ($rootScope, $location, $log, $translate, Data) {
        $rootScope.$on("$routeChangeStart", function (event, next, current) {
            $rootScope.$log = $log;
            $rootScope.setLangValue =
                function(lang) {
                    $rootScope.language = lang;
                    $translate.use(lang.code);
				}

             Data.get('languages').then(function(results){
                    if (results.status == "success") {
                        $rootScope.$log.log(results.languages);
                        $rootScope.languages = results.languages;
                        $rootScope.setLangValue($rootScope.languages[0]);
                    }
                });

            $rootScope.$log.log($rootScope.languages);

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
