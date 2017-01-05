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
	            myEvents = null;
				dataService.page(results);
                if (results.status == 'success'){
					myEvents = results.data;
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
					event.eventDateTime = results.data.eventDateTime;
					event.location = results.data.location;
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
