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
            getEventSales: getEventSales
        };
        return service;

        function initialize() {
			myevents = null;
        }

        function getMyEvents(filter) {
            dataService.post('myEvents', {filter: filter}).then(function (results) {
				dataService.page(results);
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
					if (event.eventData && event.eventData.concerts) {
						event.eventData.concertsCount = event.eventData.concerts.length;
						
						event.eventData.showHasData = false;
						if (event.eventData.concertsCount > 0) {
							var showLocation = "";
							var sameLocation = true;
							event.eventData.concerts.forEach(function(concert) {
								if (showLocation == "") {
									showLocation = concert.location;
								}
								if (showLocation != concert.location) {
									sameLocation = false;
								}
							});

							if (sameLocation) {
								event.eventData.showHasData = true;
								event.eventData.name = event.eventData.concerts[0].name;
								event.eventData.eventDateTime = event.eventData.concerts[0].eventDateTime;
								event.eventData.location = event.eventData.concerts[0].location;
							}
						}
					}
                }
            });
        }
    }
})();
