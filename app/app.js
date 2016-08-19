'use strict';

angular.module('boApp', ['ngRoute','ngSanitize','ngAnimate','ngSanitize','bo','pascalprecht.translate']);

var app = angular.module('boApp');

angular.module('boApp').factory('customLoader', customLoader);


angular.module('boApp').config(['$translateProvider',translateProvider ]);

angular.module('boApp').config(['$routeProvider',routeProvider]).run(runRouteProvider);

function routeProvider($routeProvider) {

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

}
function runRouteProvider ( $rootScope, $location, $log, $translate, Data) {
    $rootScope.$on("$routeChangeStart", function (event, next, current) {
        $rootScope.$log = $log;
        $rootScope.setLangValue = function(lang){
            if (lang !== $rootScope.language) {
                console.log(lang);
                $translate.use(lang.code);
                $rootScope.language = lang;
                Data.post('setlanguage', {'lang': lang });
            }
        };
        Data.get('sessionlang').then(function (results) {
            console.log('11',results);
            if (results.lang) $rootScope.setLangValue(results.lang);
        });
        if (!$rootScope.languages)
        getLanguages(Data,$rootScope);

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
}
function translateProvider ($translateProvider) {
    $translateProvider.useSanitizeValueStrategy('escape');
    $translateProvider.useLoader('customLoader');
    $translateProvider.useLoaderCache(true);
    $translateProvider.fallbackLanguage('ENG');

}


function getLanguages(Data,$rootScope) {
    Data.get('languages').then(function (results) {
        if (results.status == "success") {
            //$rootScope.$log.log(results.languages);
            $rootScope.languages = results.languages;
            if (!$rootScope.language)
                $rootScope.setLangValue(results.languages[0]);
        }
    });
}

function customLoader ($q, Data,$log) {
    // return loaderFn
    return function (options) {
        var deferred = $q.defer(), translations;
        //$log.log(Data);
        // do something with $http, $q and key to load localization files
        Data.post('translations', {'languageId': options.key}).then(function (results) {
            // $log.log(results);
            translations = results.translations;
            //$log.log(results.translations.translations);
            deferred.resolve(translations);
        });

        return deferred.promise;
    };
}