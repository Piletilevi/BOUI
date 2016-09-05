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

    function runApp( $rootScope,$window,dataService,authService,translationService){
        $rootScope.isTranslated = false;

        $rootScope.setLangValue = translationService.setLangValue;
        $rootScope.toOldBO = toOldBo;
        $rootScope.logout =  authService.logout;



        $rootScope.$on('$translateChangeSuccess', function () {
            $rootScope.isTranslated = true;
        });

        translationService.sessionLanguage();
        translationService.getLanguages();

		function toOldBo (){
            var bobasicurl = '';
            dataService.getBoUrl().then(function(results){
                if (results.status === "success") {
                    bobasicurl = results.bobaseurl;
                }
                else  bobasicurl = '';
            });

            if ($rootScope.authenticated  ){
                dataService.getIp().then(function(result) {

                    dataService.post('getSessionKey',{'username':$rootScope.user.userId,'clientip':result.ip}).then(function (results) {
                        if (results.status === "success") {
                            var bourl = bobasicurl.replace("{sessionkey}", results.boSession.sessionkey);
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