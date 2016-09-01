(function() {
    'use strict';

    angular.module('boApp', ['ngRoute','ngSanitize','ngAnimate','ngSanitize','bo','ngCookies','pascalprecht.translate']);

    angular.module('boApp').run(runApp);

    function runApp( $rootScope,$translate,$window,Data,authService){
        $rootScope.isTranslated = false;

        $rootScope.setLangValue = setLangValue;
        $rootScope.toOldBO = toOldBo;
        $rootScope.logout =  authService.logout;
        var bobasicurl;
        if ( bobasicurl !== "" )
            bobasicurl = getbourl();

        $rootScope.$on('$translateChangeSuccess', function () {
            $rootScope.isTranslated = true;
        });

        Data.get('sessionlang').then(function (results) {

            if (results.lang) $rootScope.setLangValue(results.lang);
        });

        if (!$rootScope.languages)
            getLanguages(Data,$rootScope);

        function getbourl(){

            Data.get('bourl').then(function(results){
                $rootScope.$log.log(results.status === "succcess");
                if (results.status === "succcess"){

                    $rootScope.$log.log(results);
                    return results.bobaseurl;
                }
                else return "";
            }) ;
        }

		function setLangValue(lang){
            if (lang !== $rootScope.language) {
                console.log(lang);
                $translate.use(lang.code);
                $rootScope.language = lang;
                Data.post('setlanguage', {'lang': lang });
            }
        };
        
		function toOldBo (){
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

        function getLanguages(Data, $rootScope) {
            Data.get('languages').then(function (results) {
                if (results.status === "success") {
                    //$rootScope.$log.log(results.languages);
                    $rootScope.languages = results.languages;
                    if (!$rootScope.language)
                        $rootScope.setLangValue(results.languages[0]);
                }
            });
        }

    }

})();