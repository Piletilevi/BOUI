(function() {
    'use strict';

angular.module('boApp', ['ngRoute','ngSanitize','ngAnimate','ngSanitize','bo','ngCookies','pascalprecht.translate']);

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
})();