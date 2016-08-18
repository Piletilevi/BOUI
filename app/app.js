

var app = angular.module('boApp', ['ngRoute', 'ngAnimate', 'bo','pascalprecht.translate']);

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
    .run(function ($rootScope, $location,$log , Data) {
        $rootScope.$on("$routeChangeStart", function (event, next, current) {
            $rootScope.$log = $log;
            $rootScope.setLangValue =
                function(lang) {
                    $rootScope.language = lang;
                    Data.post('translations',{
                        languageId: lang.code
                    }).then(
                        function(results){
                            Data.page(results);
                            $rootScope.$log.log(results);
                            app.config(['$translateProvider', function ($translateProvider) {

                                $translateProvider.translations(results.translations.languageId,results.translations.translations );

                                $translateProvider.preferredLanguage('en');
                            }]);

                        });
                }
             Data.get('languages').then(function(results){
                    if (results.status == "success") {
                        $rootScope.$log.log(results);
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



