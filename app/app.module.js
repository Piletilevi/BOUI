(function() {
    'use strict';

    angular.module('boApp', [
        'ngRoute',
        'ngSanitize',
        'ngAnimate',
        'ngSanitize',
        'bo',
        'ngCookies',
        'pascalprecht.translate',
        'ui.validate',
        'angular-loading-bar',
        'blockUI',
		'infinite-scroll',
		'ui.toggle',
		'chart.js',
        'sticky',
        'ngLocationUpdate',
		'ngFileSaver',
        '720kb.datepicker',
        'angucomplete-alt',
        'ui.bootstrap'
    ]);
    angular.module('boApp').config(function(blockUIConfig) {
        blockUIConfig.autoInjectBodyBlock = false;
    });

    angular.module('boApp').run(runApp);
    runApp.$inject = ['authService', 'translationService', 'pointService', 'menuService'];
    function runApp( authService, translationService, pointService, menuService){

        authService.initialize();
        translationService.initialize();
        pointService.initialize();
        menuService.initialize();

    }
})();