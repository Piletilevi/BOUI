(function() {

    'use strict';

    angular
        .module('boApp')
        .factory('eventService', EventService);

    EventService.$inject = ['$rootScope', 'dataService', '$translate'];

    function EventService($rootScope, dataService, translate) {

		var myOpenEvents = null;
		var myDraftEvents = null;
		var myPastEvents = null;
		var myOpenCount = 0;
		var myDraftCount = 0;
		var myPastCount = 0;

		var myOverviewData = null;
		var myOverviewGraphData = null;

		var service = {
			myOpenEvents: function() { return myOpenEvents },
			myDraftEvents: function() { return myDraftEvents },
			myPastEvents: function() { return myPastEvents },
			myOpenCount: function() { return myOpenCount },
			myDraftCount: function() { return myDraftCount },
			myPastCount: function() { return myPastCount },
			myOverviewData: function() { return myOverviewData },
			myOverviewGraphData: function() { return myOverviewGraphData },
            reset: reset,
            getMyEvents: getMyEvents,
			getMoreEvents: getMoreEvents,
            getEventSales: getEventSales,
            getEventInfo: getEventInfo,
            getEventOpSales: getEventOpSales,
			getOverviewData : getOverviewData,
			getOverviewGraphData : getOverviewGraphData
        };
		return service;

        function reset() {
			myOpenEvents = null;
			myDraftEvents = null;
			myPastEvents = null;
			myOpenCount = 0;
			myDraftCount = 0;
			myPastCount = 0;
		}

		function getMyEvents(filter) {
			filter.openStart = null;
			filter.draftStart = null;
			filter.pastStart = null;
			filter.loadingItems = true;

			dataService.post('myEvents', {filter: filter}).then(function (results) {
	            myOpenCount = 0;
	            myDraftCount = 0;
	            myPastCount = 0;

				dataService.page(results);
				if (results.status == 'success'){
					myOpenCount = results.count.open;
					if (results.count.hasMoreOpen) {
						myOpenCount = myOpenCount + "+";
					}

					myDraftCount = results.count.draft;
					if (results.count.hasMoreDraft) {
						myDraftCount = myDraftCount + "+";
					}

					myPastCount = results.count.past;
					if (results.count.hasMorePast) {
						myPastCount = myPastCount + "+";
					}

					if (filter.status == 'onsale') {
						myOpenEvents = results.data;
					} else if (filter.status == 'draft') {
						myDraftEvents = results.data;
					} else {
						myPastEvents = results.data;
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
			} else if (filter.status == 'draft' && myDraftEvents != null) {
				if (myDraftEvents.length % 10 == 0 && filter.draftStart != myDraftEvents.length + 1) {
					filter.loadingItems = true;
					filter.draftStart = myDraftEvents.length + 1;
					dataService.post('myEvents', {filter: filter}).then(function (results) {
						if (results.status == 'success') {
							results.data.forEach(function(eventItem) {
								myDraftEvents.push(eventItem);
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

		function getEventInfo(event) {
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
					event.websiteUrl = getWebsiteUrl(event);
                }
            });
        }

		function getShowSales(event) {
            dataService.post('showSales', {id: event.id}).then(function (results) {
				dataService.page(results);
                if (results.status == 'success'){
					event.sell = results.data.sell;
					event.websiteUrl = getWebsiteUrl(event);
                }
            });
        }

		function getConcertInfo(event) {
			dataService.post('concertInfo', {id: event.id}).then(function (results) {
				dataService.page(results);
				if (results.status == 'success'){
					event.name = results.data.name;
					event.eventPeriod = results.data.eventPeriod;
					event.sellPeriod = results.data.sellPeriod;
					event.location = results.data.location;
          event.websiteUrl = getWebsiteUrl(event);
                }
            });
        }

		function getShowInfo(event) {
            dataService.post('showInfo', {id: event.id}).then(function (results) {
				dataService.page(results);
                if (results.status == 'success'){
					event.name = results.data.name;
					event.eventPeriod = results.data.eventPeriod;
					event.locations = results.data.locations;
					event.concerts = results.data.concerts;
					event.concertsCount = results.data.concertsCount;
					event.sellPeriod = results.data.sellPeriod;
          event.websiteUrl = getWebsiteUrl(event);
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

		function getOverviewData(event, filter) {
			dataService.post('eventSalesReportByStatus', {id: event.id, type: event.isShow ? 'show' : 'concert', filter: filter}).then(function (results) {
                myOverviewData = null;
				dataService.page(results);
				if (results.status == 'success'){
					myOverviewData = results.data;
                }
            });
        }

		function getOverviewGraphData(event, filter) {
			var report = '';
			if (filter.groupBy == 'day') {
				report = 'eventSalesReportByDate';
			} else if (filter.groupBy == 'week') {
				report = 'eventSalesReportByWeek';
			} else if (filter.groupBy == 'month') {
				report = 'eventSalesReportByMonth';
			}
			if (report) {
				dataService.post(report, {id: event.id, type: event.isShow ? 'show' : 'concert', filter: filter}).then(function (results) {
					myOverviewGraphData = null;
					dataService.page(results);
					if (results.status == 'success'){
						myOverviewGraphData = results.data;
					}
				});
			} else {
				myOverviewGraphData = null;
			}
        }

			function getWebsiteUrl(event) {
				var urlParts = ['http://www.piletilevi.ee'],
						availableLanguages = ['est', 'rus', 'eng', 'fin'],
            currentLang = translate.proposedLanguage().toLowerCase();
        if(availableLanguages.indexOf(currentLang) == -1) {
					return false;
				}
        urlParts.push(currentLang);
        urlParts.push((event.isShow ? 'show' : 'concert') + '=' + event.id);
        return urlParts.join('/');
			}
    }
})();
