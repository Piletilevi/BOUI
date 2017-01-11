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
            reset: reset,
            getMyEvents: getMyEvents,
			getMoreEvents: getMoreEvents,
            getEventSales: getEventSales,
            getEventInfo: getEventInfo,
            getEventOpSales: getEventOpSales,
			getEventSalesReport : getEventSalesReport
        };
		return service;

        function reset() {
			myOpenEvents = null;
			myPastEvents = null;
			myOpenCount = 0;
			myPastCount = 0;
		}

		function getMyEvents(filter) {
			if (filter.status == "onsale" && myOpenEvents != null) {
				return;
			}
			if (filter.status == "past" && myPastEvents != null) {
				return;
			}
			
			filter.openStart = null;
			filter.pastStart = null;
			filter.loadingItems = true;

			dataService.post('myEvents', {filter: filter}).then(function (results) {
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
					filter.loadingItems = false;
				}
            });
        }

        function getMoreEvents(filter) {
			
			if (filter.loadingItems) 
				return;
			
			if (filter.status == 'onsale' && myOpenEvents != null) {
				if (myOpenEvents.length % 10 == 0 && filter.openStart != myOpenEvents.length + 1) {
					filter.loadingItems = true;
					filter.openStart = myOpenEvents.length + 1;
					dataService.post('myEvents', {filter: filter}).then(function (results) {
						if (results.status == 'success') {
							results.data.forEach(function(eventItem) {
								myOpenEvents.push(eventItem);
							});
						}
						filter.loadingItems = false;
					});
				}
			} else if (filter.status == 'past' && myPastEvents != null) {
				if (myPastEvents.length % 10 == 0 && filter.pastStart != myPastEvents.length + 1) {
					filter.loadingItems = true;
					filter.pastStart = myPastEvents.length + 1;
					dataService.post('myEvents', {filter: filter}).then(function (results) {
						if (results.status == 'success') {
							results.data.forEach(function(eventItem) {
								myPastEvents.push(eventItem);
							});
						}
						filter.loadingItems = false;
					});
				}
			}
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
