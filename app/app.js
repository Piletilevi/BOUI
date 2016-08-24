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
function runRouteProvider ( $rootScope, $location, $log, $translate, $window, Data) {
    $rootScope.$on("$routeChangeStart", function (event, next, current) {
        $rootScope.$log = $log;
        var bobasicurl = "http://bo.piletilevi-ru.test.helmes.ee/cgi-bin/wspd_cgi.sh/WService=plevi/proc/menu.p?key={sessionkey}";
        $rootScope.toOldBO = function (){
            if ($rootScope.authenticated){
               // $rootScope.$log.log($rootScope.user);
                Data.post('getSessionKey',{'username':$rootScope.user.userId}).then(function (results) {
                    $rootScope.$log.log(results);
                    if (results.status == "success") {

                        var bourl = bobasicurl.replace("{sessionkey}", results.boSession.sessionkey);
                        $rootScope.$log.log(bourl);
                       // $window.location.href = bourl;
                    }
                });

            }

        }
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

function customLoader ($q, Data) {

    return function (options) {
        var deferred = $q.defer(), translations;
        Data.post('translations', {'languageId': options.key}).then(function (results) {
            translations = results.translations;
            deferred.resolve(translations);
        });

        return deferred.promise;
    };
}