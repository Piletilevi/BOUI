(function() {
    'use strict';

    angular.module('boApp', [
        'ngRoute',
        'ngSanitize',
        'ngAnimate',
        'ngSanitize',
        'bo',
        'ngCookies',
        'pascalprecht.translate'
    ]);

    angular.module('boApp').run(runApp);
    runApp.$inject = ['$rootScope','$window','dataService','authService','translationService'];
    function runApp( $rootScope,$window,dataService,authService,translationService){

        $rootScope.toOldBO = toOldBo;

        authService.initialize();
        translationService.initialize();

        $rootScope.isTranslated = false;
        $rootScope.$on('$translateChangeSuccess', function () {
            $rootScope.isTranslated = true;
        });

		function toOldBo(){
            var boBasicUrl = '';
            dataService.getBoUrl().then(function(results){
                if (results.status === "success") {
                    boBasicUrl = results.boBaseUrl;
                }
                else  boBasicUrl = '';
            });

            if ($rootScope.authenticated  ){
                dataService.getIp().then(function(result) {
                    dataService.post('getSessionKey',{'username':$rootScope.user.userId,'clientip':result.ip}).then(function (results) {
                        if (results.status === "success") {
                            var bourl = boBasicUrl.replace("{sessionkey}", results.boSession.sessionkey);
                            $window.location.href = bourl;
                        }
                    });
                }, function(e) {
                    //alert("error");
                });

            }

        }
    }
})();