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

    function runApp( $rootScope,$translate,$window,Data,authService){
        $rootScope.isTranslated = false;

        $rootScope.setLangValue = setLangValue;
        $rootScope.toOldBO = toOldBo;
        $rootScope.logout =  authService.logout;



        $rootScope.$on('$translateChangeSuccess', function () {
            $rootScope.isTranslated = true;
        });

        Data.get('sessionlang').then(function (results) {
            if (results.lang) {
				$rootScope.setLangValue(results.lang);
			}
        });

        if (!$rootScope.languages) {
            getLanguages(Data,$rootScope);
		}

        function getbourl(){
            return Data.get('bourl').then(function(results){
                if (results.status === "succcess"){
                    return results.bobaseurl;
                } else {
					return "";
				}
            });
        }

		function setLangValue(lang){
            if (lang !== $rootScope.language) {
                $translate.use(lang.code);
                $rootScope.language = lang;
                Data.post('setlanguage', {'lang': lang });
            }
        };
        
		function toOldBo (){
            var bobasicurl = getbourl();
            if ($rootScope.authenticated  ){
                Data.getIp().then(function(result) {

                    Data.post('getSessionKey',{'username':$rootScope.user.userId,'clientip':result.ip}).then(function (results) {
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

        function getLanguages(Data, $rootScope) {
            Data.get('languages').then(function (results) {
                if (results.status === "success") {
                    $rootScope.languages = results.languages;
                    if (!$rootScope.language)
                        $rootScope.setLangValue(results.languages[0]);
                }
            });
        }

    }
})();