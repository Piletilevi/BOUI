

var app = angular.module('boApp', ['ngRoute','ngSanitize','ngAnimate','ngSanitize','bo','pascalprecht.translate']);




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
app.factory('customLoader', function (Data, $q,$timeout) {
    // return loaderFn
    return function (options) {
        var deferred = $q.defer(),translations;
        // do something with $http, $q and key to load localization files
        Data.post('translations',{ languageId: options.key }).then(function(results){

             translations = results.translations.translations;
        });


        $timeout(function () {
            deferred.resolve(translations);
        }, 2000);

        return deferred.promise;
    };
});
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
    .run(function ($rootScope, $location,$log ,$translate, Data) {
        $rootScope.$on("$routeChangeStart", function (event, next, current) {
            $rootScope.$log = $log;
            $rootScope.setLangValue =
                function(lang) {
                    $rootScope.language = lang;
                    $translate.use(lang.code);
            }
             Data.get('languages').then(function(results){
                    if (results.status == "success") {
                        //$rootScope.$log.log(results);
                        $rootScope.languages = results.languages;
                        $rootScope.setLangValue($rootScope.languages[0]);
                    }
                });
            $rootScope.$log.log($rootScope.languages);


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



