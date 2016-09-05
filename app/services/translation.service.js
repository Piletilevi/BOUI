/**
 * Created by kaur on 5.09.2016.
 */
(function() {
    'use strict';
    angular
        .module('boApp')
        .factory('translationService', translationService);

    translationService.$inject = ['$rootScope','$translate', 'dataService'];

    function translationService($rootScope,$translate,dataService) {
        var service = {
            sessionLanguage : sessionLanguage,
            getLanguages : getLanguages,
            setLangValue : setLangValue
        };
        return service;

        function sessionLanguage() {
            dataService.get('sessionlang').then(function (results) {
                if (results.lang) {
                    $rootScope.setLangValue(results.lang);
                }
            });
        }

        function getLanguages(){
            if (!$rootScope.languages) {
                dataService.get('languages').then(function (results) {
                    if (results.status === "success") {
                        $rootScope.languages = results.languages;
                        if (!$rootScope.language)
                            $rootScope.setLangValue(results.languages[0]);
                    }
                });
            }
        }
        function setLangValue(lang){
            if (lang !== $rootScope.language) {
                $translate.use(lang.code);
                $rootScope.language = lang;
                dataService.post('setlanguage', {'lang': lang });
            }
        };
    }

})();