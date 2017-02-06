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
        'blockUI',
		'infinite-scroll',
		'ui.toggle',
		'chart.js',
    'highcharts-ng'
    ]);

    angular.module('boApp').run(runApp);
    runApp.$inject = ['authService', 'translationService', 'pointService', 'menuService'];
    function runApp( authService, translationService, pointService, menuService){

        authService.initialize();
        translationService.initialize();
        pointService.initialize();
        menuService.initialize();

    }
})();