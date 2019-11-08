(function () {
    'use strict';
    angular
        .module('boApp')
        .factory('eventService', EventService);
    EventService.$inject = ['$rootScope', '$translate', 'dataService', '$filter', 'FileSaver', 'Blob', '$window'];
    function EventService($rootScope, $translate, dataService, $filter, FileSaver, Blob, $window) {
        const SUCCESS_STATUS = 'success';

        const SALE_STATUS = 'onsale';
        const DRAFT_STATUS = 'draft';
        const PAST_STATUS = 'past';

        const GROUP_DAY = 'day';
        const GROUP_WEEK = 'week';
        const GROUP_MONTH = 'month';

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
            myOpenEvents: function () { return myOpenEvents },
            myDraftEvents: function () { return myDraftEvents },
            myPastEvents: function () { return myPastEvents },
            myOpenCount: function () { return myOpenCount },
            myDraftCount: function () { return myDraftCount },
            myPastCount: function () { return myPastCount },
            myOverviewData: function () { return myOverviewData },
            myOverviewGraphData: function () { return myOverviewGraphData },
            myPriceTypeData: function () { return myPriceTypeData },
            myPriceTypeGraphData: function () { return myPriceTypeGraphData },
            myPriceClassData: function () { return myPriceClassData },
            myLocationsData: function () { return myLocationsData },
            myPriceClassGraphData: function () { return myPriceClassGraphData },
            mySectorsData: function () { return mySectorsData },
            sectorInfo: function () { return sectorInfo },
            countries: function () { return countries },
            sectorTickets: function () { return sectorTickets },
            relatedEvents: function () { return relatedEvents },
            myBasket: function () { return myBasket },
            myBookings: function () { return myBookings },
            bookingId: function () { return bookingId },
            bookingStatuses: function () { return bookingStatuses },
            bookingTypes: function () { return bookingTypes },
            reset: reset,
            getMyEvents: getMyEvents,
            getMoreEvents: getMoreEvents,
            getRelatedEvents: getRelatedEvents,
            getMoreRelatedEvents: getMoreRelatedEvents,
            hasMoreRelatedEvents: hasMoreRelatedEvents,
            getEventSales: getEventSales,
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
            goToEvent: goToEvent,
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
            if (!filter) return;
            if (filter.loadingItems) return;
            if (filter.status === SALE_STATUS && myOpenEvents != null) return;
            if (filter.status === PAST_STATUS && myPastEvents != null) return;
            if (filter.status === DRAFT_STATUS && myDraftEvents != null) return;

            filter.openStart = null;
            filter.draftStart = null;
            filter.pastStart = null;
            getMyEventsCount(filter);
            if ($rootScope.hideEvents) {
                $rootScope.hideEvents = false;
                return;
            }
            filter.loadingItems = true;
            dataService.post('myEvents', {filter: filter}).then(function (results) {
                dataService.page(results);
                if (results) {
                    if (filter.status === SALE_STATUS) {
                        myOpenEvents = results.status === SUCCESS_STATUS ? results.data : [];
                    } else if (filter.status === DRAFT_STATUS) {
                        myDraftEvents = results.status === SUCCESS_STATUS ? results.data : [];
                    } else if (filter.status === PAST_STATUS) {
                        myPastEvents = results.status === SUCCESS_STATUS ? results.data : [];
                    }
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
                    myDraftCount = results.count.draft;
                    myPastCount = results.count.past;
                }
            });
        }

        function getMoreEvents(filter) {
            if (filter == null) {
                return;
            }
            if (filter.loadingItems) {
                return;
            }
            if ($rootScope.hideEvents) {
                return;
            }
            if (filter.status === SALE_STATUS && myOpenEvents != null) {
                if (myOpenEvents.length % 5 === 0 && filter.openStart !== myOpenEvents.length + 1) {
                    filter.loadingItems = true;
                    filter.openStart = myOpenEvents.length + 1;
                    dataService.post('myEvents', {filter: filter}).then(function (results) {
                        if (results && results.status === SUCCESS_STATUS) {
                            results.data.forEach(function (eventItem) {
                                if (myOpenEvents !== null ) {
                                    myOpenEvents.push(eventItem);
                                }
                            });
                        }
                        filter.loadingItems = false;
                    });
                }
            } else if (filter.status === DRAFT_STATUS && myDraftEvents != null) {
                if (myDraftEvents.length % 5 === 0 && filter.draftStart !== myDraftEvents.length + 1) {
                    filter.loadingItems = true;
                    filter.draftStart = myDraftEvents.length + 1;
                    dataService.post('myEvents', {filter: filter}).then(function (results) {
                        if (results && results.status === SUCCESS_STATUS) {
                            results.data.forEach(function (eventItem) {
                                if (myDraftEvents !== null ) {
                                    myDraftEvents.push(eventItem);
                                }
                            });
                        }
                        filter.loadingItems = false;
                    });
                }
            } else if (filter.status === PAST_STATUS && myPastEvents != null) {
                if (myPastEvents.length % 5 === 0 && filter.pastStart !== myPastEvents.length + 1) {
                    filter.loadingItems = true;
                    filter.pastStart = myPastEvents.length + 1;
                    dataService.post('myEvents', {filter: filter}).then(function (results) {
                        if (results && results.status === SUCCESS_STATUS) {
                            results.data.forEach(function (eventItem) {
                                if (myPastEvents !== null ) {
                                    myPastEvents.push(eventItem);
                                }
                            });
                        }
                        filter.loadingItems = false;
                    });
                }
            }
        }

        function hasMoreRelatedEvents(event) {
            if (relatedEvents && relatedEvents.concerts && relatedEvents.concerts.length % 5 === 0 && relatedEvents.start !== relatedEvents.concerts.length + 1) {
                return true;
            }
            return false;
        }

        function getMoreRelatedEvents(event) {
            if (loadingRelatedItems) return;
            if (hasMoreRelatedEvents(event)) {
                loadingRelatedItems = true;
                relatedEvents.start = relatedEvents.concerts.length + 1;
                dataService.post('relatedEvents', {
                    id: event.id,
                    type: event.isShow ? 'show' : 'concert',
                    start: relatedEvents.start
                }).then(function (results) {
                    if (results && results.status === SUCCESS_STATUS) {
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
                if (results && results.status === SUCCESS_STATUS) {
                    relatedEvents = results.data;
                }
            });
        }

        function getEventSales(event) {
            if (event.isShow) {
                getShowSales(event);
            }
            else {
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
                if (results && results.status === SUCCESS_STATUS) {
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
                if (results && results.status === SUCCESS_STATUS) {
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
                if (results && results.status === SUCCESS_STATUS) {
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
                if (results && results.status === SUCCESS_STATUS) {
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
                if (results && results.status === SUCCESS_STATUS) {
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
                if (results && results.status === SUCCESS_STATUS) {
                    event.statistics = results.data;
                }
            });
        }

        function getShowOpSales(event, filter) {
            dataService.post('showOpSales', {id: event.id, filter: filter}).then(function (results) {
                dataService.page(results);
                if (results && results.status === SUCCESS_STATUS) {
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
                if (results && results.status === SUCCESS_STATUS) {
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
                if (results && results.status === SUCCESS_STATUS) {
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
                if (results && results.status === SUCCESS_STATUS) {
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
                if (results && results.status === SUCCESS_STATUS) {
                    myLocationsData = results.data;
                }
            });
        }

        function getOverviewGraphData(event, filter) {
            var report = '';
            if (filter.groupBy === GROUP_DAY) {
                report = 'eventSalesReportByDate';
            } else if (filter.groupBy === GROUP_WEEK) {
                report = 'eventSalesReportByWeek';
            } else if (filter.groupBy === GROUP_MONTH) {
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
                    if (results && results.status === SUCCESS_STATUS) {
                        myOverviewGraphData = results.data;
                    }
                });
            } else {
                myOverviewGraphData = null;
            }
        }

        function getPriceClassGraphData(event, filter) {
            var report = '';
            if (filter.groupBy === GROUP_DAY) {
                report = 'eventSalesReportByPriceClassDate';
            } else if (filter.groupBy === GROUP_WEEK) {
                report = 'eventSalesReportByPriceClassWeek';
            } else if (filter.groupBy === GROUP_MONTH) {
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
                    if (results && results.status === SUCCESS_STATUS) {
                        myPriceClassGraphData = results.data;
                    }
                });
            } else {
                myPriceClassGraphData = null;
            }
        }

        function getPriceTypeGraphData(event, filter) {
            var report = '';
            if (filter.groupBy === GROUP_DAY) {
                report = 'eventSalesReportByPriceTypeDate';
            } else if (filter.groupBy === GROUP_WEEK) {
                report = 'eventSalesReportByPriceTypeWeek';
            } else if (filter.groupBy === GROUP_MONTH) {
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
                    if (results && results.status === SUCCESS_STATUS) {
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
                if (results && results.status === SUCCESS_STATUS) {
                    sectorTickets = results.data;
                }
            });
        }

        function getExportFileName(event, currentTab, type) {
            if (event.eventPeriod) {
                return 'Report-' + currentTab + '-' + event.name + '-' + $filter('date')(event.eventPeriod.start, "dd.MM.yyyy") +
                    '-' + $filter('date')(event.eventPeriod.end, "dd.MM.yyyy") + "." + type;
            }
        };

        function exportAsExcel(event, currentTab, filter) {
            var callMethod = getExportCallMethod(currentTab, 'Xls', filter);
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

        function exportAsCsv(event, currentTab, filter) {
            var callMethod = getExportCallMethod(currentTab, 'Csv', filter);
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

        function getExportCallMethod(currentTab, type, filter) {
            var callMethod = 'get' + type;
            switch (currentTab) {
                case 'overview': callMethod = callMethod + 'ByOverview'; break;
                case 'pricetype': callMethod = callMethod + 'ByPriceType'; break;
                case 'priceclass': callMethod = callMethod + 'ByPriceClass'; break;
                case 'locations': callMethod = callMethod + 'ByLocation'; break;
                case 'sections':
                    if (filter.sectionId) {
                        callMethod = callMethod + 'ByPriceClass';
                    } else {
                        callMethod = callMethod + 'BySectors';
                    }
                    break;
            }
            return callMethod;
        }

        function reloadEvent(event) {
            dataService.post(event.isShow ? 'reloadShow' : 'reloadConcert', {id: event.id}).then(function (results) {
                if (results && results.status === SUCCESS_STATUS) {
                    // Add success message
                }
            });
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
                if (results && results.status === SUCCESS_STATUS) {
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
                if (results && results.status === SUCCESS_STATUS) {
                    countries = results.data;
                }
            });
        }

        function getMyBasket(callback, basket) {
            dataService.post('myBasket', basket).then(function (results) {
                dataService.page(results);
                if (results && results.status === SUCCESS_STATUS) {
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
                if (results && results.status === SUCCESS_STATUS) {
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
                if (results && results.status === SUCCESS_STATUS) {
                    myBookings = results.data;
                    if(callback) {
                        callback();
                    }
                }
                filter.loadingItems = false;
            });
        }

        function getMoreBookingsData(filter) {
            if(!myBookings || !myBookings.bookings) {
                return;
            }
            if (!filter.loadingItems && myBookings.bookings.length % 10 === 0 && filter.start !== myBookings.bookings.length + 1) {
                filter.loadingItems = true;
                filter.start = myBookings.bookings.length + 1;
                dataService.post('bookingList', {filter: filter}).then(function (results) {
                    if (results && results.status === SUCCESS_STATUS) {
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
                if (results && results.status === SUCCESS_STATUS) {
                    bookingStatuses = results.data;
                }
            });
        }

        function getBookingTypes() {
            dataService.post('getBookingTypes').then(function (results) {
                dataService.page(results);
                if (results && results.status === SUCCESS_STATUS) {
                    bookingTypes = results.data;
                }
            });
        }



    }
})();
