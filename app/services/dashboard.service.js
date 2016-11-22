(function() {

    'use strict';

    angular
        .module('boApp')
        .factory('dashboardService', DashboardService);

    DashboardService.$inject = ['$rootScope', 'dataService'];

    function DashboardService($rootScope, dataService) {
        
		var myevents = null;

		var service = {
			myevents: function() { return myevents },
            initialize: initialize,
            getMyEvents: getMyEvents,
            getEventSales: getEventSales,
            getConcertSales: getConcertSales,
            getShowSales: getShowSales
        };
        return service;

        function initialize() {
			myevents = null;
        }

        function getMyEvents(filter) {
            dataService.post('myEvents', {filter: filter}).then(function (results) {
                if (results.status == "success"){
					myevents = results.data;
                }
            });
        }

		function getEventSales(event, filter) {
			if (event.isShow) {
				getShowSales(event, filter);
			} else {
				getConcertSales(event, filter);
			}
        }

		function getConcertSales(event, filter) {
			dataService.post('concertSales', {id: event.id, filter: filter}).then(function (results) {
				if (results.status == "success"){
					event.eventData = results.data;
                }
            });
        }

		function getShowSales(event, filter) {
            dataService.post('showSales', {id: event.id, filter: filter}).then(function (results) {
                if (results.status == "success"){
					event.eventData = results.data;
                }
            });
        }
    }
})();
