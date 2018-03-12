/**
 * Created by kaur on 5.09.2016.
 */
(function() {
    'use strict';
    angular
        .module('boApp')
        .factory('translationService', TranslationService);

    TranslationService.$inject = ['$rootScope', '$routeParams', '$translate', 'dataService'];

    function TranslationService($rootScope, $routeParams, $translate, dataService) {
        var service = {
            initialize : initialize,
            sessionLanguage : sessionLanguage,
            getLanguages : getLanguages,
            setLangValue : setLangValue
        };
        return service;

        function sessionLanguage() {
            dataService.get('sessionLang').then(function (results) {
                if (results.lang) {
                    $rootScope.setLangValue(results.lang);
                }
            });
        }

        function getLanguages(){
            $rootScope.languages = [
                {"code":"ENG","name":"English"},
                {"code":"EST","name":"Eesti keel"},
                {"code":"LAT","name":"Latvie\u0161u valoda"},
                {"code":"RUS","name":"\u0420\u0443\u0441\u0441\u043a\u0438\u0439 \u044f\u0437\u044b\u043a"},
                {"code":"LIT","name":"Lietuvi\u0173 kalba"},
                {"code":"FIN","name":"Suomi"},
                {"code":"BEL","name":"\u0411\u0435\u043b\u0430\u0440\u0443\u0441\u043a\u0430\u044f \u043c\u043e\u0432\u0430"}
            ];
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

        function getMomentLocaleCode(code) {
            var momentLocaleCode = 'en-gb';
            switch(code.toLowerCase()) {
                case 'est':
                    momentLocaleCode = 'et';
                    break;
                case 'lat':
                    momentLocaleCode = 'lv';
                    break;
                case 'rus':
                    momentLocaleCode = 'ru';
                    break;
                case 'lit':
                    momentLocaleCode = 'lt';
                    break;
                case 'fin':
                    momentLocaleCode = 'fi';
            }
            return momentLocaleCode;
        }

        function setLangValue(lang){
            if (lang !== $rootScope.language) {
                $translate.use(lang.code);
                $rootScope.language = lang;
                dataService.post('setLanguage', {'lang': lang });
            }
        }

        function initialize(){
            $rootScope.setLangValue = setLangValue;
            sessionLanguage();
            getLanguages();

            $rootScope.$watch('language', function(newLanguage, oldLanguage) {
                if(newLanguage && !angular.equals(newLanguage, oldLanguage)) {
                    moment.locale(getMomentLocaleCode(newLanguage.code));
                }
            });
            $rootScope.isTranslated = false;
            $rootScope.$on('$translateChangeSuccess', function () {
                $rootScope.isTranslated = true;
            });

        }
    }


})();