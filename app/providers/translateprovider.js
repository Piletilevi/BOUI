(function() {
    'use strict';
    angular.module('boApp').config(['$translateProvider', translateProvider]);
    angular.module('boApp').factory('customLoader', customLoader);
    translateProvider.$inject=['$translateProvider'];
    function translateProvider($translateProvider) {
        $translateProvider.preferredLanguage('ENG');
        $translateProvider.useSanitizeValueStrategy('escape');
        $translateProvider.useLoader('customLoader');
        $translateProvider.useLoaderCache(true);
        $translateProvider.fallbackLanguage('ENG');

        $translateProvider.useLocalStorage();


    }
    customLoader.$inject=['$q','dataService'];
    function customLoader ($q, dataService ) {

        return function (options) {
            var deferred = $q.defer(), translations;
            dataService.post('translations', {'languageId': options.key}).then(function (results) {
                translations = results.translations;
                deferred.resolve(translations);

            });

            return deferred.promise;

        };
    }


})();
