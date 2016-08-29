

angular.module('boApp', ['ngRoute','ngSanitize','ngAnimate','ngSanitize','bo','ngCookies','pascalprecht.translate']);

var app = angular.module('boApp');






angular.module('boApp').config(['$routeProvider',routeProvider]).run(runRouteProvider);

angular.module('boApp').run(runApp);

function runApp( $rootScope,$translate,$window,Data){
    $rootScope.isTranslated = false;
    $rootScope.$on('$translateChangeSuccess', function () {
        $rootScope.isTranslated = true;
    });
    $rootScope.setLangValue = function(lang){
        if (lang !== $rootScope.language) {
            console.log(lang);
            $translate.use(lang.code);
            $rootScope.language = lang;
            Data.post('setlanguage', {'lang': lang });
        }
    };
    Data.get('sessionlang').then(function (results) {

        if (results.lang) $rootScope.setLangValue(results.lang);
    });
    if (!$rootScope.languages)
        getLanguages(Data,$rootScope);

    var bobasicurl = "";
    Data.get('bourl').then(function(results){
        $rootScope.$log.log(results.status === "succcess");
        if (results.status === "succcess"){

            $rootScope.$log.log(results);
            bobasicurl = results.bobaseurl;
        }
    }) ;

    $rootScope.toOldBO = function (){
        $rootScope.$log.log(bobasicurl);
        if ($rootScope.authenticated && bobasicurl !== "" ){
            // $rootScope.$log.log($rootScope.user);
            Data.getIp().then(function(result) {

                Data.post('getSessionKey',{'username':$rootScope.user.userId,'clientip':result.ip}).then(function (results) {
                    $rootScope.$log.log(results);
                    if (results.status === "success") {

                        var bourl = bobasicurl.replace("{sessionkey}", results.boSession.sessionkey);
                        $rootScope.$log.log(bourl);
                        $window.location.href = bourl;
                    }
                });
            }, function(e) {
                //alert("error");
            });


        }

    }


}

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

function runRouteProvider ( $rootScope, $location, $log,  Data) {

    $rootScope.$on("$routeChangeStart", function (event, next, current) {
        $rootScope.$log = $log;

        $rootScope.authenticated = false;

        Data.get('session').then(function (results) {
            if (results.user) {
                $rootScope.authenticated = true;
                $rootScope.user = results.user;
                $location.search('key', null);
            } else {
                if(!$rootScope.authenticated && typeof($location.search().key) !== 'undefined'){
                    var searchkey =  $location.search().key;

                    Data.post('verifySessionKey',{ "sessionkey" : searchkey }).then(function(results){
                        Data.page(results);
                        console.log(results);
                        if (results.status == "success"){
                            Data.get('session').then(function (results) {
                                if (results.user) {
                                    $rootScope.authenticated = true;
                                    $rootScope.user = results.user;
                                    $location.path('dashboard');
                                }
                            });
                        }
                    });
                }
                var nextUrl = next.$$route.originalPath;
                if (nextUrl == '/login') {
                } else {
                    $location.path("/login");
                }
            }
        });

    });
}
