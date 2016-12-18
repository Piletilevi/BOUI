(function() {

    'use strict';

    angular
        .module('boApp')
        .factory('eventService', EventService);

    EventService.$inject = ['$rootScope', 'dataService'];

    function EventService($rootScope, dataService) {
        
		var myEvents = null;

		var myEventSalesReport = null;

		var service = {
			myEvents: function() { return myEvents },
			myEventSalesReport: function() { return myEventSalesReport },
            initialize: initialize,
            getMyEvents: getMyEvents,
            getEventSales: getEventSales,
            getEventOpSales: getEventOpSales,
			getEventSalesReport : getEventSalesReport
        };
        return service;

        function initialize() {
			myEvents = null;
        }

        function getMyEvents(filter) {
			dataService.post('myEvents', {filter: filter}).then(function (results) {
	            myEvents = null;
				dataService.page(results);
                if (results.status == 'success'){
					myEvents = results.data;
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

		function getEventOpSales(event, filter) {
			if (event.isShow) {
				getShowOpSales(event, filter);
			} else {
				getConcertOpSales(event, filter);
			}
        }

		function getConcertSales(event, filter) {
			dataService.post('concertSales', {id: event.id, filter: filter}).then(function (results) {
				dataService.page(results);
				if (results.status == 'success'){
					event.eventData = results.data;
                }
            });
        }

		function getShowSales(event, filter) {
            dataService.post('showSales', {id: event.id, filter: filter}).then(function (results) {
				dataService.page(results);
                if (results.status == 'success'){
					event.eventData = results.data;
					processShowData(event);
                }
            });
        }

		function getConcertOpSales(event, filter) {
			dataService.post('concertOpSales', {id: event.id, filter: filter}).then(function (results) {
				dataService.page(results);
				if (results.status == 'success'){
					event.eventData = results.data;
                }
            });
        }

		function getShowOpSales(event, filter) {
            dataService.post('showOpSales', {id: event.id, filter: filter}).then(function (results) {
				dataService.page(results);
                if (results.status == 'success'){
					event.eventData = results.data;
					processShowData(event);
                }
            });
        }

		function getEventSalesReport(event, filter) {
			dataService.post('eventSalesReport', {id: event.id, type: event.isShow ? 'show' : 'concert', filter: filter}).then(function (results) {
                myEventSalesReport = null;
				dataService.page(results);
				if (results.status == 'success'){
					myEventSalesReport = results.data;
                }
            });
        }

		function processShowData(event) {
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
    }
})();
