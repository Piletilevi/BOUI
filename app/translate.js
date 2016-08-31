(function() {
    'use strict';
    angular.module('boApp').config(['$translateProvider', translateProvider]);
    angular.module('boApp').factory('customLoader', customLoader);

    function translateProvider($translateProvider) {
        $translateProvider.preferredLanguage('ENG');
        $translateProvider.useSanitizeValueStrategy('escape');
        $translateProvider.useLoader('customLoader');
        $translateProvider.useLoaderCache(true);
        $translateProvider.fallbackLanguage('ENG');

        $translateProvider.useLocalStorage();


    }
    function customLoader ($q, Data ) {

        return function (options) {
            var deferred = $q.defer(), translations;
            Data.post('translations', {'languageId': options.key}).then(function (results) {
                translations = results.translations;
                deferred.resolve(translations);

            });

            return deferred.promise;

        };
    }


})();
