(function() {

	'use strict';

	angular
		.module('boApp')
		.factory('eventService', EventService);

	EventService.$inject = ['$rootScope', '$translate', 'dataService'];

	function EventService($rootScope, $translate, dataService) {

		var myOpenEvents = null;
		var myDraftEvents = null;
		var myPastEvents = null;
		var myOpenCount = 0;
		var myDraftCount = 0;
		var myPastCount = 0;

		var myOverviewData = null;
		var myOverviewGraphData = null;
		var myPriceTypeData = null;
		var myPriceTypeGraphData = null;
		var myPriceClassData = null;
		var myPriceClassGraphData = null;
		var mySectorsData = null;
		var sectorInfo = null;
		var sectorTickets = null;
		var relatedEvents = null;
		var loadingRelatedItems = false;
		
		var service = {
			myOpenEvents: function() { return myOpenEvents },
			myDraftEvents: function() { return myDraftEvents },
			myPastEvents: function() { return myPastEvents },
			myOpenCount: function() { return myOpenCount },
			myDraftCount: function() { return myDraftCount },
			myPastCount: function() { return myPastCount },
			myOverviewData: function() { return myOverviewData },
			myOverviewGraphData: function() { return myOverviewGraphData },
			myPriceTypeData: function() { return myPriceTypeData },
			myPriceTypeGraphData: function() { return myPriceTypeGraphData },
			myPriceClassData: function() { return myPriceClassData },
			myPriceClassGraphData: function() { return myPriceClassGraphData },
			mySectorsData: function() { return mySectorsData },
			sectorInfo: function() { return sectorInfo },
			sectorTickets: function() { return sectorTickets },
			relatedEvents: function() { return relatedEvents },
			reset: reset,
			getMyEvents: getMyEvents,
			getMoreEvents: getMoreEvents,
			getRelatedEvents: getRelatedEvents,
			getMoreRelatedEvents: getMoreRelatedEvents,
			hasMoreRelatedEvents: hasMoreRelatedEvents,
			getEventSales: getEventSales,
			getEventInfo: getEventInfo,
			getEventOpSales: getEventOpSales,
			getOverviewData : getOverviewData,
			getOverviewGraphData : getOverviewGraphData,
			getPriceTypeData : getPriceTypeData,
			getPriceClassData : getPriceClassData,
			getPriceClassGraphData : getPriceClassGraphData,
			getPriceTypeGraphData : getPriceTypeGraphData,
			getSectorsData: getSectorsData,
			getSectorInfo: getSectorInfo,
			getSectorTickets: getSectorTickets
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
			if (filter.status == "onsale" && myOpenEvents != null) {
				return;
			}
			if (filter.status == "past" && myPastEvents != null) {
				return;
			}
			if (filter.status == "draft" && myDraftEvents != null) {
				return;
			}

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
				if (myOpenEvents.length % 5 == 0 && filter.openStart != myOpenEvents.length + 1) {
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
				if (myDraftEvents.length % 5 == 0 && filter.draftStart != myDraftEvents.length + 1) {
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
				if (myPastEvents.length % 5 == 0 && filter.pastStart != myPastEvents.length + 1) {
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

		function hasMoreRelatedEvents(event) {
			if (relatedEvents && relatedEvents.concerts && relatedEvents.concerts.length % 5 == 0 && relatedEvents.start != relatedEvents.concerts.length + 1) {
				return true;
			}
			return false;
		}
		
		function getMoreRelatedEvents(event) {

			if (loadingRelatedItems)
				return;
			
			if (hasMoreRelatedEvents(event)) {
				loadingRelatedItems = true;
				relatedEvents.start = relatedEvents.concerts.length + 1;
				dataService.post('relatedEvents', {id: event.id, type: event.isShow ? 'show' : 'concert', start: relatedEvents.start}).then(function (results) {
					if (results.status == 'success') {
						results.data.concerts.forEach(function(eventItem) {
							getConcertSales(eventItem);
							relatedEvents.concerts.push(eventItem);
						});
					}
					loadingRelatedItems = false;
				});
			}
		}
		
		function getRelatedEvents(event) {
			dataService.post('relatedEvents', {id: event.id, type: event.isShow ? 'show' : 'concert'}).then(function (results) {
				relatedEvents = null;
				if (results.status == 'success'){
					relatedEvents = results.data;
					processRelatedEvents(relatedEvents);
				}
			});
		}
		
		function processRelatedEvents(relatedEvents) {
			getShowSales(relatedEvents);
			relatedEvents.concerts.forEach(function(eventItem) {
				getConcertSales(eventItem);
			});			
		}
		
		function getEventSales(event) {
			if (event.isShow) {
				getShowSales(event);
			} else {
				getConcertSales(event);
			}
		}

		function getEventSalesBySectors(event, filter) {
			if (event.isShow) {
				//nothing,
			} else {
				getConcertSalesBySectors(event, filter);
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
			if (event.isShow) {
				getShowOpSales(event, filter);
			} else {
				getConcertOpSales(event, filter);
			}
		}

		function getConcertSales(event) {
			dataService.post('concertSales', {id: event.id}).then(function (results) {
				dataService.page(results);
				if (results.status == 'success'){
					event.statistics = results.data.statistics;
					event.websiteUrl = getWebsiteUrl(event);
				}
			});
		}

		function getSectorsData(event, filter) {
			dataService.post('eventSalesReportBySectors', {id: event.id, type: event.isShow ? 'show' : 'concert', filter: filter}).then(function (results) {
				mySectorsData = null;
				results = JSON.parse('{"status":"success","data":{"sales":[{"sectorId":30418,"name":"Parter (SEISUKOHT), sissep\u00e4\u00e4s A2 v\u00f5i B2","statistics":{"generatedTickets":2600,"availableTickets":267,"soldTickets":2313,"bookedTickets":20,"soldPercent":89,"bookedPercent":1,"availablePercent":10,"soldSumma":72144,"currency":"\u20ac"}},{"sectorId":30422,"name":"xRatastoolikoht, sektor 102\/103","statistics":{"generatedTickets":12,"availableTickets":9,"soldTickets":3,"bookedTickets":0,"soldPercent":25,"bookedPercent":0,"availablePercent":75,"soldSumma":87,"currency":"\u20ac"}},{"sectorId":30447,"name":"Sektor 102","statistics":{"generatedTickets":130,"availableTickets":7,"soldTickets":123,"bookedTickets":0,"soldPercent":95,"bookedPercent":0,"availablePercent":5,"soldSumma":2989,"currency":"\u20ac"}},{"sectorId":30448,"name":"Sektor 103","statistics":{"generatedTickets":247,"availableTickets":73,"soldTickets":174,"bookedTickets":0,"soldPercent":70,"bookedPercent":0,"availablePercent":30,"soldSumma":5366,"currency":"\u20ac"}},{"sectorId":30449,"name":"Sektor 104","statistics":{"generatedTickets":266,"availableTickets":74,"soldTickets":192,"bookedTickets":0,"soldPercent":72,"bookedPercent":0,"availablePercent":28,"soldSumma":4740,"currency":"\u20ac"}},{"sectorId":30452,"name":"Sektor 105","statistics":{"generatedTickets":266,"availableTickets":59,"soldTickets":207,"bookedTickets":0,"soldPercent":78,"bookedPercent":0,"availablePercent":22,"soldSumma":6113,"currency":"\u20ac"}},{"sectorId":30453,"name":"Sektor 106","statistics":{"generatedTickets":241,"availableTickets":36,"soldTickets":205,"bookedTickets":0,"soldPercent":85,"bookedPercent":0,"availablePercent":15,"soldSumma":6765,"currency":"\u20ac"}},{"sectorId":30455,"name":"Sektor 107","statistics":{"generatedTickets":128,"availableTickets":6,"soldTickets":122,"bookedTickets":0,"soldPercent":95,"bookedPercent":0,"availablePercent":5,"soldSumma":5978,"currency":"\u20ac"}},{"sectorId":30458,"name":"Sektor 202","statistics":{"generatedTickets":60,"availableTickets":35,"soldTickets":25,"bookedTickets":0,"soldPercent":42,"bookedPercent":0,"availablePercent":58,"soldSumma":975,"currency":"\u20ac"}},{"sectorId":30459,"name":"Sektor 203","statistics":{"generatedTickets":178,"availableTickets":113,"soldTickets":45,"bookedTickets":20,"soldPercent":25,"bookedPercent":11,"availablePercent":64,"soldSumma":1570,"currency":"\u20ac"}},{"sectorId":30460,"name":"Sektor 204","statistics":{"generatedTickets":170,"availableTickets":107,"soldTickets":37,"bookedTickets":26,"soldPercent":22,"bookedPercent":15,"availablePercent":63,"soldSumma":1258,"currency":"\u20ac"}},{"sectorId":30461,"name":"Sektor 205","statistics":{"generatedTickets":132,"availableTickets":90,"soldTickets":42,"bookedTickets":0,"soldPercent":32,"bookedPercent":0,"availablePercent":68,"soldSumma":1538,"currency":"\u20ac"}},{"sectorId":30462,"name":"Sektor 206","statistics":{"generatedTickets":132,"availableTickets":93,"soldTickets":39,"bookedTickets":0,"soldPercent":30,"bookedPercent":0,"availablePercent":70,"soldSumma":1456,"currency":"\u20ac"}},{"sectorId":30463,"name":"Sektor 207","statistics":{"generatedTickets":170,"availableTickets":114,"soldTickets":26,"bookedTickets":30,"soldPercent":15,"bookedPercent":18,"availablePercent":67,"soldSumma":874,"currency":"\u20ac"}},{"sectorId":30464,"name":"Sektor 208","statistics":{"generatedTickets":164,"availableTickets":110,"soldTickets":36,"bookedTickets":18,"soldPercent":22,"bookedPercent":11,"availablePercent":67,"soldSumma":1303,"currency":"\u20ac"}},{"sectorId":30465,"name":"Sektor 209","statistics":{"generatedTickets":84,"availableTickets":56,"soldTickets":28,"bookedTickets":0,"soldPercent":33,"bookedPercent":0,"availablePercent":67,"soldSumma":1092,"currency":"\u20ac"}},{"sectorId":30467,"name":"RESTORAN, istekoht lauas (B1 p\u00e4\u00e4sla)","statistics":{"generatedTickets":114,"availableTickets":94,"soldTickets":20,"bookedTickets":0,"soldPercent":18,"bookedPercent":0,"availablePercent":82,"soldSumma":580,"currency":"\u20ac"}},{"sectorId":30468,"name":"Loo\u017e KULD","statistics":{"generatedTickets":64,"availableTickets":0,"soldTickets":0,"bookedTickets":64,"soldPercent":0,"bookedPercent":100,"availablePercent":0,"soldSumma":0,"currency":"\u20ac"}},{"sectorId":30472,"name":"Kontori r\u00f5du","statistics":{"generatedTickets":20,"availableTickets":0,"soldTickets":0,"bookedTickets":20,"soldPercent":0,"bookedPercent":100,"availablePercent":0,"soldSumma":0,"currency":"\u20ac"}},{"sectorId":42694,"name":"LOO\u017dID","statistics":{"generatedTickets":471,"availableTickets":0,"soldTickets":20,"bookedTickets":607,"soldPercent":4,"bookedPercent":129,"availablePercent":-33,"soldSumma":580,"currency":"\u20ac"}}]}}');
				dataService.page(results);
				if (results.status == 'success'){
					mySectorsData = results.data;
				}
			});
		}

		function getShowSales(event) {
			dataService.post('showSales', {id: event.id}).then(function (results) {
				dataService.page(results);
				if (results.status == 'success'){
					event.statistics = results.data.statistics;
					event.websiteUrl = getWebsiteUrl(event);
				}
			});
		}
		
		function getConcertInfo(event) {
			dataService.post('concertInfo', {id: event.id}).then(function (results) {
				dataService.page(results);
				if (results.status == 'success'){
					event.name = results.data.name;
					event.confId = results.data.confId;
					event.eventPeriod = results.data.eventPeriod;
					event.sellPeriod = results.data.sellPeriod;
					event.showId = results.data.showId;
					event.location = results.data.location;
					event.websiteUrl = getWebsiteUrl(event);
				}
			});
		}

		function getShowInfo(event) {
			dataService.post('showInfo', {id: event.id, includeConcerts: false}).then(function (results) {
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
					event.statistics = results.data;
				}
			});
		}

		function getShowOpSales(event, filter) {
			dataService.post('showOpSales', {id: event.id, filter: filter}).then(function (results) {
				dataService.page(results);
				if (results.status == 'success'){
					event.statistics = results.data;
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

		function getPriceTypeData(event, filter) {
			dataService.post('eventSalesReportByPriceType', {id: event.id, type: event.isShow ? 'show' : 'concert', filter: filter}).then(function (results) {
				myPriceTypeData = null;
				dataService.page(results);
				if (results.status == 'success'){
					myPriceTypeData = results.data;
				}
			});
		}

		function getPriceClassData(event, filter) {
			dataService.post('eventSalesReportByPriceClass', {id: event.id, type: event.isShow ? 'show' : 'concert', filter: filter}).then(function (results) {
				myPriceClassData = null;
				dataService.page(results);
				if (results.status == 'success'){
					myPriceClassData = results.data;
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

		function getPriceClassGraphData(event, filter) {
			var report = '';
			if (filter.groupBy == 'day') {
				report = 'eventSalesReportByPriceClassDate';
			} else if (filter.groupBy == 'week') {
				report = 'eventSalesReportByPriceClassWeek';
			} else if (filter.groupBy == 'month') {
				report = 'eventSalesReportByPriceClassMonth';
			}
			if (report) {
				dataService.post(report, {id: event.id, type: event.isShow ? 'show' : 'concert', filter: filter}).then(function (results) {
					myPriceClassGraphData = null;
					dataService.page(results);
					if (results.status == 'success'){
						myPriceClassGraphData = results.data;
					}
				});
			} else {
				myPriceClassGraphData = null;
			}
		}

		function getPriceTypeGraphData(event, filter) {
			var report = '';
			if (filter.groupBy == 'day') {
				report = 'eventSalesReportByPriceTypeDate';
			} else if (filter.groupBy == 'week') {
				report = 'eventSalesReportByPriceTypeWeek';
			} else if (filter.groupBy == 'month') {
				report = 'eventSalesReportByPriceTypeMonth';
			}
			if (report) {
				dataService.post(report, {id: event.id, type: event.isShow ? 'show' : 'concert', filter: filter}).then(function (results) {
					myPriceTypeGraphData = null;
					dataService.page(results);
					if (results.status == 'success'){
						myPriceTypeGraphData = results.data;
					}
				});
			} else {
				myPriceTypeGraphData = null;
			}
		}

		function getSectorInfo(event, filter) {
			dataService.post('sectionInfo', {concertId: event.id, sectionId: event.sectorId, filter: filter}).then(function (results) {
				sectorInfo = null;
				dataService.page(results);
				if (results.status == 'success'){
					sectorInfo = results.data;
				}
			});
		}

		function getSectorInfo(event, filter) {
			dataService.post('sectionInfo', {concertId: event.id, filter: filter}).then(function (results) {
				sectorInfo = null;
				dataService.page(results);
				if (results.status == 'success'){
					sectorInfo = results.data;
				}
			});
		}

		function getSectorTickets(event, filter) {
			dataService.post('sectionTickets', {concertId: event.id, filter: filter}).then(function (results) {
				sectorTickets = null;
				dataService.page(results);
				if (results.status == 'success'){
					sectorTickets = results.data;
				}
			});
		}
				
		function getWebsiteUrl(event) {
			var urlParts = ['http://www.piletilevi.ee'],
				availableLanguages = ['est', 'rus', 'eng', 'fin'],
				currentLang = $translate.proposedLanguage().toLowerCase();
			if(availableLanguages.indexOf(currentLang) == -1) {
				return false;
			}
			urlParts.push(currentLang);
			urlParts.push((event.isShow ? 'show' : 'concert') + '=' + event.id);
			return urlParts.join('/');
		}

	}
})();
