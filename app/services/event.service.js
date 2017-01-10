(function() {

    'use strict';

    angular
        .module('boApp')
        .factory('eventService', EventService);

    EventService.$inject = ['$rootScope', 'dataService'];

    function EventService($rootScope, dataService) {
        
		var myOpenEvents = null;
		var myPastEvents = null;
		var myOpenCount = 0;
		var myPastCount = 0;

		var myEventSalesReport = null;

		var service = {
			myOpenEvents: function() { return myOpenEvents },
			myPastEvents: function() { return myPastEvents },
			myOpenCount: function() { return myOpenCount },
			myPastCount: function() { return myPastCount },
			myEventSalesReport: function() { return myEventSalesReport },
            initialize: initialize,
            getMyEvents: getMyEvents,
            getEventSales: getEventSales,
            getEventInfo: getEventInfo,
            getEventOpSales: getEventOpSales,
			getEventSalesReport : getEventSalesReport
        };
        return service;

        function initialize() {
			myEvents = null;
        }

        function getMyEvents(filter) {
			dataService.post('myEvents', {filter: filter}).then(function (results) {
	            myOpenEvents = null;
	            myPastEvents = null;
	            myOpenCount = 0;
	            myPastCount = 0;

				dataService.page(results);

				if (results.status == 'success'){
					myOpenCount = results.count.open;
					if (results.count.hasMoreOpen) {
						myOpenCount = myOpenCount + "+";
					}

					myPastCount = results.count.past;
					if (results.count.hasMorePast) {
						myPastCount = myPastCount + "+";
					}

					if (filter.status == 'past') {
						myPastEvents = results.data;
					} else {
						myOpenEvents = results.data;
					}
				}
            });
        }

		function getEventSales(event) {
			if (event.isShow || event.concertsCount > 1) {
				getShowSales(event);
			} else {
				getConcertSales(event);
			}
        }

		function getEventInfo(event, filter) {
			if (event.isShow) {
				getShowInfo(event);
			} else {
				getConcertInfo(event);
			}
        }

		function getEventOpSales(event, filter) {
			if (event.isShow || event.concertsCount > 1) {
				getShowOpSales(event, filter);
			} else {
				getConcertOpSales(event, filter);
			}
        }

		function getConcertSales(event) {
			dataService.post('concertSales', {id: event.id}).then(function (results) {
				dataService.page(results);
				if (results.status == 'success'){
					event.sell = results.data.sell;
                }
            });
        }

		function getShowSales(event) {
            dataService.post('showSales', {id: event.id}).then(function (results) {
				dataService.page(results);
                if (results.status == 'success'){
					event.sell = results.data.sell;
                }
            });
        }

		function getConcertInfo(event) {
			dataService.post('concertInfo', {id: event.id}).then(function (results) {
				dataService.page(results);
				if (results.status == 'success'){
					event.name = results.data.name;
					event.eventDateTime = results.data.eventDateTime;
					event.location = results.data.location;
                }
            });
        }

		function getShowInfo(event) {
            dataService.post('showInfo', {id: event.id}).then(function (results) {
				dataService.page(results);
                if (results.status == 'success'){
					event.name = results.data.name;
					event.period = results.data.period;
					event.locations = results.data.locations;
					event.concerts = results.data.concerts;
					event.concertsCount = results.data.concertsCount;
                }
            });
        }

		function getConcertOpSales(event, filter) {
			dataService.post('concertOpSales', {id: event.id, filter: filter}).then(function (results) {
				dataService.page(results);
				if (results.status == 'success'){
					event.sell = results.data;
                }
            });
        }

		function getShowOpSales(event, filter) {
            dataService.post('showOpSales', {id: event.id, filter: filter}).then(function (results) {
				dataService.page(results);
                if (results.status == 'success'){
					event.sell = results.data;
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
    }
})();
