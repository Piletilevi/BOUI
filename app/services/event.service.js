(function () {

    'use strict';

    angular
        .module('boApp')
        .factory('eventService', EventService);

    EventService.$inject = ['$rootScope', '$translate', 'dataService', '$filter', 'FileSaver', 'Blob', '$window'];

    function EventService($rootScope, $translate, dataService, $filter, FileSaver, Blob, $window) {

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
        var myLocationsData = null;
        var myPriceClassGraphData = null;
        var mySectorsData = null;
        var sectorTickets = null;
        var relatedEvents = null;
        var loadingRelatedItems = false;
        var myBasket = null;
        var myBookings = null;
        var bookingId = null;
        var bookingStatuses = null;
        var bookingTypes = null;
        var sectorInfo = null;
        var countries = null;

        var service = {
            myOpenEvents: function () {
                return myOpenEvents
            },
            myDraftEvents: function () {
                return myDraftEvents
            },
            myPastEvents: function () {
                return myPastEvents
            },
            myOpenCount: function () {
                return myOpenCount
            },
            myDraftCount: function () {
                return myDraftCount
            },
            myPastCount: function () {
                return myPastCount
            },
            myOverviewData: function () {
                return myOverviewData
            },
            myOverviewGraphData: function () {
                return myOverviewGraphData
            },
            myPriceTypeData: function () {
                return myPriceTypeData
            },
            myPriceTypeGraphData: function () {
                return myPriceTypeGraphData
            },
            myPriceClassData: function () {
                return myPriceClassData
            },
            myLocationsData: function () {
                return myLocationsData
            },
            myPriceClassGraphData: function () {
                return myPriceClassGraphData
            },
            mySectorsData: function () {
                return mySectorsData
            },
            sectorInfo: function () {
                return sectorInfo
            },
            countries: function () {
                return countries
            },
            sectorTickets: function () {
                return sectorTickets
            },
            relatedEvents: function () {
                return relatedEvents
            },
            myBasket: function () {
                return myBasket
            },
            myBookings: function () {
                return myBookings
            },
            bookingId: function () {
                return bookingId
            },
            bookingStatuses: function () {
                return bookingStatuses
            },
            bookingTypes: function () {
                return bookingTypes
            },
            reset: reset,
            getMyEvents: getMyEvents,
            getMyEventsCount: getMyEventsCount,
            getMoreEvents: getMoreEvents,
            getRelatedEvents: getRelatedEvents,
            getMoreRelatedEvents: getMoreRelatedEvents,
            hasMoreRelatedEvents: hasMoreRelatedEvents,
            getEventSales: getEventSales,
            getEventInfo: getEventInfo,
            getEventOpSales: getEventOpSales,
            getOverviewData: getOverviewData,
            getOverviewGraphData: getOverviewGraphData,
            getPriceTypeData: getPriceTypeData,
            getPriceClassData: getPriceClassData,
            getLocationsData: getLocationsData,
            getPriceClassGraphData: getPriceClassGraphData,
            getPriceTypeGraphData: getPriceTypeGraphData,
            getSectorsData: getSectorsData,
            getSectorInfo: getSectorInfo,
            getCountries: getCountries,
            getSectorTickets: getSectorTickets,
            exportAsExcel: exportAsExcel,
            exportAsCsv: exportAsCsv,
            addToBasket: addToBasket,
            addToBasketBulk: addToBasketBulk,
            confirmBasket: confirmBasket,
            confirmBooking: confirmBooking,
            removeFromBasket: removeFromBasket,
            cancelBooking: cancelBooking,
            changeBasketTicketType: changeBasketTicketType,
            changeBookingTicketType: changeBookingTicketType,
            getMyBasket: getMyBasket,
            getMyBooking: getMyBooking,
            getBookingsData: getBookingsData,
            getMoreBookingsData: getMoreBookingsData,
            getBookingStatuses: getBookingStatuses,
            getBookingTypes: getBookingTypes,
			reloadEvent: reloadEvent,
            goToEvent: goToEvent
        };
        return service;

        function reset() {
            myOpenEvents = null;
            myDraftEvents = null;
            myPastEvents = null;
            myOpenCount = 0;
            myDraftCount = 0;
            myPastCount = 0;
            myOverviewData = null;
            myOverviewGraphData = null;
            myPriceTypeData = null;
            myPriceTypeGraphData = null;
            myPriceClassData = null;
            myPriceClassGraphData = null;
            mySectorsData = null;
            myLocationsData = null;
            sectorInfo = null;
            countries = null;
            sectorTickets = null;
            relatedEvents = null;
            myBasket = null;
            myBookings = null;
            bookingId = null;
            bookingStatuses = null;
            bookingTypes = null;
        }

        function goToEvent(pointId,event) {
            var eventType = function() {
                if (event.isShow) {
                    return "show";
                }
                else {
                    return "event";
                }
            };
            $window.location.href = "#/report/" + pointId + "/" + eventType() + "/" + event.id;
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
            getMyEventsCount(filter);

            dataService.post('myEvents', {filter: filter}).then(function (results) {
                dataService.page(results);
                if (filter.status == 'onsale') {
                    myOpenEvents = results.status == 'success' ? results.data : [];
                } else if (filter.status == 'draft') {
                    myDraftEvents = results.status == 'success' ? results.data : [];
                } else if (filter.status == 'past') {
                    myPastEvents = results.status == 'success' ? results.data : [];
                }
                filter.loadingItems = false;
            });
        }

        function getMyEventsCount(filter) {
            dataService.post('myEventsCount', {filter: filter}).then(function (results) {
                myOpenCount = 0;
                myDraftCount = 0;
                myPastCount = 0;

                dataService.page(results);

                if (results && results.count) {
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
                            results.data.forEach(function (eventItem) {
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
                            results.data.forEach(function (eventItem) {
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
                            results.data.forEach(function (eventItem) {
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
                dataService.post('relatedEvents', {
                    id: event.id,
                    type: event.isShow ? 'show' : 'concert',
                    start: relatedEvents.start
                }).then(function (results) {
                    if (results.status == 'success') {
                        if (results.data && results.data.concerts) {
                            results.data.concerts.forEach(function (eventItem) {
                                relatedEvents.concerts.push(eventItem);
                            });
                        }
                    }
                    loadingRelatedItems = false;
                });
            }
        }

        function getRelatedEvents(event) {
            dataService.post('relatedEvents', {
                id: event.id,
                type: event.isShow ? 'show' : 'concert'
            }).then(function (results) {
                relatedEvents = null;
                if (results.status == 'success') {
                    relatedEvents = results.data;
                }
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
                if (results.status == 'success') {
                    event.name = results.data.name;
                    event.confId = results.data.confId;
                    event.eventPeriod = results.data.eventPeriod;
                    event.isSamePeriod = results.data.isSamePeriod;
                    event.sellPeriod = results.data.sellPeriod;
                    event.showId = results.data.showId;
                    event.location = results.data.location;
                    event.statistics = results.data.statistics;
                    event.websiteUrl = results.data.websiteUrl;
                    event.status = results.data.status;
                    event.statusName = results.data.statusName;
                    event.labelCode = results.data.labelCode;
                    event.salespoints = results.data.salespoints;
                    event.active = results.data.active;
                }
            });
        }

        function getSectorsData(event, filter) {
            dataService.post('eventSalesReportBySectors', {
                id: event.id,
                type: event.isShow ? 'show' : 'concert',
                filter: filter
            }).then(function (results) {
                mySectorsData = null;
                dataService.page(results);
                if (results.status == 'success') {
                    mySectorsData = results.data;
                    mySectorsData.salesTotal = {
                        soldTickets: 0,
                        bookedTickets: 0,
                        availableTickets: 0,
                        soldPercent: 0,
                        soldSumma: 0
                    };
                    angular.forEach(mySectorsData.sales, function (sectorItem) {
                        mySectorsData.salesTotal.soldTickets += sectorItem.statistics.soldTickets;
                        mySectorsData.salesTotal.bookedTickets += sectorItem.statistics.bookedTickets;
                        mySectorsData.salesTotal.availableTickets += sectorItem.statistics.availableTickets;
                        mySectorsData.salesTotal.soldPercent += sectorItem.statistics.soldPercent;
                        mySectorsData.salesTotal.soldSumma += sectorItem.statistics.soldSumma;
                    });
                }
            });
        }

        function getShowSales(event) {
            dataService.post('showSales', {id: event.id}).then(function (results) {
                dataService.page(results);
                if (results.status == 'success') {
                    event.name = results.data.name;
                    event.eventPeriod = results.data.eventPeriod;
                    event.isSamePeriod = results.data.isSamePeriod;
                    event.locations = results.data.locations;
                    event.concerts = results.data.concerts;
                    event.concertsCount = results.data.concertsCount;
                    event.sellPeriod = results.data.sellPeriod;
                    event.statistics = results.data.statistics;
                    event.websiteUrl = results.data.websiteUrl;
                    event.status = results.data.status;
                    event.statusName = results.data.statusName;
                    event.labelCode = results.data.labelCode;
                    event.salespoints = results.data.salespoints;
                }
            });
        }

        function getConcertInfo(event) {
            dataService.post('concertInfo', {id: event.id}).then(function (results) {
                dataService.page(results);
                if (results.status == 'success') {
                    event.name = results.data.name;
                    event.confId = results.data.confId;
                    event.eventPeriod = results.data.eventPeriod;
                    event.sellPeriod = results.data.sellPeriod;
                    event.showId = results.data.showId;
                    event.location = results.data.location;
                    event.websiteUrl = results.data.websiteUrl;
                    event.status = results.data.status;
                    event.statusName = results.data.statusName;
                    event.labelCode = results.data.labelCode;
                    event.salespoints = results.data.salespoints;
                }
            });
        }

        function getShowInfo(event) {
            dataService.post('showInfo', {id: event.id, includeConcerts: false}).then(function (results) {
                dataService.page(results);
                if (results.status == 'success') {
                    event.name = results.data.name;
                    event.eventPeriod = results.data.eventPeriod;
                    event.locations = results.data.locations;
                    event.concerts = results.data.concerts;
                    event.concertsCount = results.data.concertsCount;
                    event.sellPeriod = results.data.sellPeriod;
                    event.websiteUrl = results.data.websiteUrl;
                    event.status = results.data.status;
                    event.statusName = results.data.statusName;
                    event.labelCode = results.data.labelCode;
                    event.salespoints = results.data.salespoints;
                }
            });
        }

        function getConcertOpSales(event, filter) {
            dataService.post('concertOpSales', {id: event.id, filter: filter}).then(function (results) {
                dataService.page(results);
                if (results.status == 'success') {
                    event.statistics = results.data;
                }
            });
        }

        function getShowOpSales(event, filter) {
            dataService.post('showOpSales', {id: event.id, filter: filter}).then(function (results) {
                dataService.page(results);
                if (results.status == 'success') {
                    event.statistics = results.data;
                }
            });
        }

        function getOverviewData(event, filter) {
            dataService.post('eventSalesReportByStatus', {
                id: event.id,
                type: event.isShow ? 'show' : 'concert',
                filter: filter
            }).then(function (results) {
                myOverviewData = null;
                dataService.page(results);
                if (results.status == 'success') {
                    myOverviewData = results.data;
                }
            });
        }

        function getPriceTypeData(event, filter) {
            dataService.post('eventSalesReportByPriceType', {
                id: event.id,
                type: event.isShow ? 'show' : 'concert',
                filter: filter
            }).then(function (results) {
                myPriceTypeData = null;
                dataService.page(results);
                if (results.status == 'success') {
                    myPriceTypeData = results.data;
                }
            });
        }

        function getPriceClassData(event, filter) {
            dataService.post('eventSalesReportByPriceClass', {
                id: event.id,
                type: event.isShow ? 'show' : 'concert',
                filter: filter
            }).then(function (results) {
                myPriceClassData = null;
                dataService.page(results);
                if (results.status == 'success') {
                    myPriceClassData = results.data;
                }
            });
        }

        function getLocationsData(event, filter) {
            dataService.post('eventSalesReportByLocation', {
                id: event.id,
                type: event.isShow ? 'show' : 'concert',
                filter: filter
            }).then(function (results) {
                myLocationsData = null;
                if (results && results.data.sales.length > 0) {
                    results.data.salesTotal = {
                        internetCount: 0,
                        spCount: 0,
                        refundCount: 0,
                        totalCount: 0,
                        totalSum: 0,
                        percent: 100,
                        currency: results.data.sales[0].currency
                    };
                    angular.forEach(results.data.sales, function (country) {
                        country.totalCount = country.spCount + country.internetCount;
                        country.totalSum = country.spSum + country.internetSum;
                        results.data.salesTotal.internetCount += country.internetCount;
                        results.data.salesTotal.refundCount += country.refundCount;
                        results.data.salesTotal.spCount += country.spCount;
                        results.data.salesTotal.totalCount += country.totalCount;
                        results.data.salesTotal.totalSum += country.totalSum;
                    });
                    angular.forEach(results.data.sales, function (country) {
                        country.percent = country.totalCount / results.data.salesTotal.totalCount * 100;
                        angular.forEach(country.cities, function (city) {
                            city.totalCount = city.spCount + city.internetCount;
                            city.totalSum = city.spSum + city.internetSum;
                            city.percent = city.totalCount / results.data.salesTotal.totalCount * 100;
                        });
                    });
                }
                dataService.page(results);
                if (results.status == 'success') {
                    myLocationsData = results.data;
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
                dataService.post(report, {
                    id: event.id,
                    type: event.isShow ? 'show' : 'concert',
                    filter: filter
                }).then(function (results) {
                    myOverviewGraphData = null;
                    dataService.page(results);
                    if (results.status == 'success') {
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
                dataService.post(report, {
                    id: event.id,
                    type: event.isShow ? 'show' : 'concert',
                    filter: filter
                }).then(function (results) {
                    myPriceClassGraphData = null;
                    dataService.page(results);
                    if (results.status == 'success') {
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
                dataService.post(report, {
                    id: event.id,
                    type: event.isShow ? 'show' : 'concert',
                    filter: filter
                }).then(function (results) {
                    myPriceTypeGraphData = null;
                    dataService.page(results);
                    if (results.status == 'success') {
                        myPriceTypeGraphData = results.data;
                    }
                });
            } else {
                myPriceTypeGraphData = null;
            }
        }

        function getSectorTickets(event, filter) {
            dataService.post('sectionTickets', {concertId: event.id, filter: filter}).then(function (results) {
                sectorTickets = null;
                dataService.page(results);
                if (results.status == 'success') {
                    sectorTickets = results.data;
                }
            });
        }

        function getExportFileName(event, currentTab, type) {
            if (event.eventPeriod) {
                return 'Report-' + currentTab + '-' + event.name + '-' + $filter('date')(event.eventPeriod.start, "dd.MM.yyyy") + '-' + $filter('date')(event.eventPeriod.end, "dd.MM.yyyy") + "." + type;
            }
        };

        function exportAsExcel(event, currentTab, filter) {
            var callMethod;
            if (currentTab == 'overview') {
                callMethod = 'getXlsByOverview';
            } else if (currentTab == 'pricetype') {
                callMethod = 'getXlsByPriceType';
            } else if (currentTab == 'priceclass') {
                callMethod = 'getXlsByPriceClass';
            } else if (currentTab == 'sections') {
                if (filter.sectionId) {
                    callMethod = 'getXlsByPriceClass';
                } else {
                    callMethod = 'getXlsBySectors';
                }
            } else if (currentTab == 'locations') {
                callMethod = 'getXlsByLocation';
            }
            if (callMethod) {
                dataService.postBinary(callMethod, {
                    id: event.id,
                    type: event.isShow ? 'show' : 'concert',
                    filter: filter
                }).then(function (data) {
                    var file = new Blob([data], {type: 'application/vnd.ms-excel;charset=charset=utf-8'});
                    FileSaver.saveAs(file, getExportFileName(event, currentTab, 'xls'));
                });
            }
        }

		function reloadEvent(event) {
            dataService.post(event.isShow ? 'reloadShow' : 'reloadConcert', {id: event.id}).then(function (results) {
                if (results.status == 'success') {
                }
            });
		}

        function exportAsCsv(event, currentTab, filter) {
            var callMethod;
            if (currentTab == 'overview') {
                callMethod = 'getCsvByOverview';
            } else if (currentTab == 'pricetype') {
                callMethod = 'getCsvByPriceType';
            } else if (currentTab == 'priceclass') {
                callMethod = 'getCsvByPriceClass';
            } else if (currentTab == 'sections') {
                if (filter.sectionId) {
                    callMethod = 'getCsvByPriceClass';
                } else {
                    callMethod = 'getCsvBySectors';
                }
            } else if (currentTab == 'locations') {
                callMethod = 'getCsvByLocation';
            }
            if (callMethod) {
                dataService.postBinary(callMethod, {
                    id: event.id,
                    type: event.isShow ? 'show' : 'concert',
                    filter: filter
                }).then(function (data) {
                    var file = new Blob([data], {type: 'text/csv'});
                    FileSaver.saveAs(file, getExportFileName(event, currentTab, 'csv'));
                });
            }
        }

        function getWebsiteUrl(event) {

            var urlParts = [],
                links = $rootScope.eventLinks;

            if (event.isShow) {
                urlParts.push(links.showUrl);
            } else {
                urlParts.push(links.concertUrl);
            }

            /* TODO translate and replace url path
             var urlParts = ['http://www.piletilevi.ee'],
             availableLanguages = ['est', 'rus', 'eng', 'fin'],
             currentLang = $translate.proposedLanguage().toLowerCase();
             if(availableLanguages.indexOf(currentLang) == -1) {
             return false;
             }*/

            //urlParts.push(currentLang);
            urlParts.push((event.isShow ? 'show' : 'concert') + '=' + event.id);
            return urlParts.join('');
        }

        function addToBasketBulk(items, callback) {
            var pending = items.slice();
            var processItems = function() {
                if (pending.length > 0) {
                    var item = pending[0];
                    pending.splice(0, 1);
                    addToBasket(item, processItems);
                } else {
                    callback();
                }
            };
            processItems();
        }

        function addToBasket(item, callback) {
            dataService.post('addToBasket', {
                concertId: item.concertId,
                sectionId: item.sectionId,
                classes: item.classes,
                seatId: item.seatId,
            }).then(function (results) {
                if (results.hasOwnProperty('succeeded') && callback) {
                    callback();
                }
            });
        }

        function removeFromBasket(ticketId, callback) {
            dataService.post('removeFromBasket', {
                ticketId: ticketId
            }).then(function (results) {
                if (results.hasOwnProperty('succeeded') && callback) {
                    callback();
                }
            });
        }

        function cancelBooking(bookingId, callback) {
            dataService.post('cancelBooking', {
                bookingId: bookingId
            }).then(function (results) {
                if (results.hasOwnProperty('succeeded') && callback) {
                    callback();
                }
            });
        }

        function changeBasketTicketType(ticketId, typeId, callback) {
            dataService.post('changeBasketTicketType', {
                ticketId: ticketId,
                typeId: typeId
            }).then(function (results) {
                if (results.hasOwnProperty('succeeded') && callback) {
                    callback();
                }
            });
        }

        function changeBookingTicketType(ticketId, typeId, callback) {
            dataService.post('changeBookingTicketType', {
                ticketId: ticketId,
                typeId: typeId
            }).then(function (results) {
                if (results.hasOwnProperty('succeeded') && callback) {
                    callback();
                }
            });
        }

        function confirmBasket(reservation, callback) {
            dataService.post('confirmBasket', reservation).then(function (results) {
                if (results.hasOwnProperty('succeeded')) {
                    bookingId = results.bookingId;
                    if (callback) {
                        callback();
                    }
                }
            });
        }

        function confirmBooking(booking, callback) {
            dataService.post('confirmBooking', booking).then(function (results) {
                if (results.hasOwnProperty('succeeded') && callback) {
                    callback();
                }
            });
        }

        function getSectorInfo(item, callback) {
            dataService.post('getSectorInfo', {
                concertId: item.concertId,
                sectionId: item.sectionId
            }).then(function (results) {
                if (results.status == 'success') {
                    dataService.page(results);
                    sectorInfo = results.data;
                    if(callback) {
                        callback();
                    }
                }
            });
        }

        function getCountries() {
            dataService.post('getCountries').then(function (results) {
                dataService.page(results);
                if (results.status == 'success') {
                    countries = results.data;
                }
            });
        }

        function getMyBasket(callback, basket) {
            dataService.post('myBasket', basket).then(function (results) {
                dataService.page(results);
                if (results.status == 'success') {
                    myBasket = results.data;
                    if(callback) {
                        callback();
                    }
                }
            });
        }

        function getMyBooking(callback, booking) {
            dataService.post('myBooking', booking).then(function (results) {
                dataService.page(results);
                if (results.status == 'success') {
                    myBasket = results.data;
                    if(callback) {
                        callback();
                    }
                }
            });
        }

        function getBookingsData(filter, callback) {
            filter.loadingItems = true;
            filter.start = null;
            dataService.post('bookingList', {filter: filter}).then(function (results) {
                dataService.page(results);
                if (results.status == 'success') {
                    myBookings = results.data;
                    filter.loadingItems = false;
                    if(callback) {
                        callback();
                    }
                }
            });
        }

        function getMoreBookingsData(filter) {
            if(!myBookings || !myBookings.bookings) {
                return;
            }
            if (!filter.loadingItems && myBookings.bookings.length % 10 == 0 && filter.start != myBookings.bookings.length + 1) {
                filter.loadingItems = true;
                filter.start = myBookings.bookings.length + 1;
                dataService.post('bookingList', {filter: filter}).then(function (results) {
                    if (results.status == 'success') {
                        results.data.bookings.forEach(function (bookingItem) {
                            myBookings.bookings.push(bookingItem);
                        });
                    }
                    filter.loadingItems = false;
                });
            }
        }

        function getBookingStatuses() {
            dataService.post('getBookingStatuses').then(function (results) {
                dataService.page(results);
                if (results.status == 'success') {
                    bookingStatuses = results.data;
                }
            });
        }

        function getBookingTypes() {
            dataService.post('getBookingTypes').then(function (results) {
                dataService.page(results);
                if (results.status == 'success') {
                    bookingTypes = results.data;
                }
            });
        }

    }
})();
