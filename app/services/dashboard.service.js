(function() {

    'use strict';

    angular
        .module('boApp')
        .factory('dashboardService', DashboardService);

    DashboardService.$inject = ['$rootScope', 'dataService'];

    function DashboardService($rootScope, dataService) {
        var service = {
            initialize: initialize,
            getMyEvents: getMyEvents
        };
        return service;

        function initialize() {
            $rootScope.myEvents = myEvents;
        }

        function getMyEvents(filter) {
            dataService.post('myEvents', {filter: filter}).then(function (results) {
                if (results.status == "success"){
					$rootScope.myevents = results.data;
					return results.data;
                }
            });
        }
    }
})();
