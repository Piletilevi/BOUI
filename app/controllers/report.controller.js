(function () {

    'use strict';

    angular.module('boApp')
        .controller('reportController', ReportController);

    ReportController.$inject = ['$scope', '$sce', '$rootScope', '$routeParams', '$location', '$filter', 'eventService', 'pointService', 'graphService'];

    function ReportController($scope, $sce, $rootScope, $routeParams, $location, $filter, eventService, pointService, graphService) {

        if (!$routeParams && !$routeParams.id) {
            $location.path('dashboard');
        }
        //initially set those objects to null to avoid undefined error
        var vm = this;

        vm.event = {
            id: $routeParams.id,
            isShow: $routeParams.type == 'show',
            sectionsMapConfig: {
                type: 'sections',
                confId: null,
                sectionMapType: 'vector',
                sections: null,
                enabledSections: null
            },
            seatsMapConfig: {
                type: 'seats',
                confId: null,
                sectionMapType: 'vector',
                sections: [],
                enabledSections: [],
                seatsInfo: [],
                priceClasses: [],
                sectionId: 37311,
                mapWidth: 388,
                mapHeight: 250
            }
        };

        eventService.reset();
        graphService.reset();

        vm.getDatetime = new Date();
        vm.getEventSales = eventService.getEventSales;
        vm.getConcertSales = eventService.getConcertSales;
        vm.getShowSales = eventService.getShowSales;
        vm.getMoreRelatedEvents = eventService.getMoreRelatedEvents;
        vm.hasMoreRelatedEvents = eventService.hasMoreRelatedEvents;
        vm.filter = {period: {startDate: moment().subtract(30, 'days'), endDate: moment().add(1, 'years')}, name: ''};
        vm.filterPeriod = {period: {startDate: null, endDate: null}};
        vm.overviewFilter = {
            period: {startDate: null, endDate: null},
            display: 'tickets',
            groupBy: 'day',
            centerId: ''
        };
        vm.pricetypeFilter = {
            period: {startDate: null, endDate: null},
            display: 'tickets',
            pieDisplay: 'tickets',
            groupBy: 'day',
            centerId: ''
        };
        vm.priceclassFilter = {
            period: {startDate: null, endDate: null},
            sectionId: null,
            pieDisplay: 'tickets',
            display: 'tickets',
            groupBy: 'day',
            centerId: ''
        };
        vm.sectorsFilter = {period: {startDate: null, endDate: null}, centerId: ''};
        vm.bookingFilter = {concertId: $routeParams.id, period: {startDate: moment().subtract(1, 'years'), endDate: moment().add(1, 'days')}};
        vm.locationsFilter = {period: {startDate: null, endDate: null}, centerId: ''};
        vm.reset_search = false;
        vm.overviewBarGraph = graphService.overviewBarGraph;
        vm.overviewLineGraph = graphService.overviewLineGraph;
        vm.pricetypePieGraph = graphService.pricetypePieGraph;
        vm.pricetypeLineGraph = graphService.pricetypeLineGraph;
        vm.priceclassPieGraph = graphService.priceclassPieGraph;
        vm.priceclassLineGraph = graphService.priceclassLineGraph;

        vm.filters = [vm.overviewFilter, vm.pricetypeFilter, vm.priceclassFilter, vm.sectorsFilter, vm.locationsFilter, vm.bookingFilter];

        vm.reservation = {
            reservationType: 'with_price',
            personType: 'person',
            concertId: $routeParams.id
        };

        vm.reservationStartDate = moment().subtract(1, 'days');
        vm.reservationMode = $routeParams.reservation? 'basket' : false;
        // vm.printPdf = pdfService.printPdf;

        //Initialize
        eventService.getEventSales(vm.event);
        eventService.getRelatedEvents(vm.event);

        vm.exportAsCsv = function (currentTab) {
            var filter;
            if (currentTab == "overview") {
                filter = vm.overviewFilter;
            } else if (currentTab == "pricetype") {
                filter = vm.pricetypeFilter;
            } else if (currentTab == "priceclass") {
                filter = vm.priceclassFilter;
            } else if (currentTab == "sections") {
                if ($scope.selectedSectionId) {
                    filter = vm.priceclassFilter;
                } else {
                    filter = vm.sectorsFilter;
                }
            } else if (currentTab == "locations") {
                filter = vm.locationsFilter;
            }
            eventService.exportAsCsv(vm.event, currentTab, filter);
        }

        vm.exportAsExcel = function (currentTab) {
            var filter;
            if (currentTab == "overview") {
                filter = vm.overviewFilter;
            } else if (currentTab == "pricetype") {
                filter = vm.pricetypeFilter;
            } else if (currentTab == "priceclass") {
                filter = vm.priceclassFilter;
            } else if (currentTab == "sections") {
                if ($scope.selectedSectionId) {
                    filter = vm.priceclassFilter;
                } else {
                    filter = vm.sectorsFilter;
                }
            } else if (currentTab == "locations") {
                filter = vm.locationsFilter;
            }
            eventService.exportAsExcel(vm.event, currentTab, filter);
        }

        vm.setOverviewDisplay = function (display) {
            vm.overviewFilter.display = display;
        }

        vm.setOverviewGroupBy = function (groupBy) {
            vm.overviewFilter.groupBy = groupBy;
        }

        vm.setPricetypeDisplay = function (display) {
            vm.pricetypeFilter.display = display;
        }

        vm.setPricetypePieDisplay = function (display) {
            vm.pricetypeFilter.pieDisplay = display;
        }

        vm.setPricetypeGroupBy = function (groupBy) {
            vm.pricetypeFilter.groupBy = groupBy;
        }

        vm.setPriceclassPieDisplay = function (display) {
            vm.priceclassFilter.pieDisplay = display;
        }

        vm.setPriceclassDisplay = function (display) {
            vm.priceclassFilter.display = display;
        }

        vm.setPriceclassGroupBy = function (groupBy) {
            vm.priceclassFilter.groupBy = groupBy;
        }

        vm.tabSelectEvent = function (tab) {
            if (tab == 'overview') {
                eventService.getOverviewData(vm.event, vm.overviewFilter);
                eventService.getOverviewGraphData(vm.event, vm.overviewFilter);
            } else if (tab == 'pricetype') {
                eventService.getPriceTypeData(vm.event, vm.pricetypeFilter);
                eventService.getPriceTypeGraphData(vm.event, vm.pricetypeFilter);
            } else if (tab == 'priceclass') {
                vm.priceclassFilter.sectionId = null;
                eventService.getPriceClassData(vm.event, vm.priceclassFilter);
                eventService.getPriceClassGraphData(vm.event, vm.priceclassFilter);
            } else if (tab == 'sections' && !$routeParams.reservation) {
                eventService.getSectorsData(vm.event, vm.sectorsFilter);
            }
            else if (tab == 'locations') {
                eventService.getLocationsData(vm.event, vm.locationsFilter);
            }
            else if (tab == 'bookings') {
                if($rootScope.bookingSuccessAlert) {
                    vm.bookingsRowExpanded = 0;
                }
                eventService.getBookingsData(vm.bookingFilter);
                eventService.getBookingStatuses();
                eventService.getBookingTypes();
            }
            if (tab != 'sections') {
                $scope.selectedSectionId = false;
            }

            vm.currentTab = tab;
            var newPath = '/report/' + $routeParams.pointId + '/' + $routeParams.type + '/' + $routeParams.id + '/' + vm.currentTab;
            if (tab == 'sections' && $scope.selectedSectionId) {
                newPath += '/' + $scope.selectedSectionId;
            }
            $location.update_path(newPath);
        };

        vm.getCurrentTabCode = function () {
            if (vm.currentTab == 'overview') {
                return 'api_' + vm.currentTab;
            } else {
                return 'api_by_' + vm.currentTab;
            }
        };

        vm.setSelectedSectionId = function (selectedSectionId) {
            $scope.selectedSectionId = selectedSectionId;
            var newPath = '/report/' + $routeParams.pointId + '/' + $routeParams.type + '/' + $routeParams.id + '/sections/' + selectedSectionId + '/';
            if (vm.reservationMode) {
                newPath += 'reservation/';
                eventService.getSectorsData(vm.event, vm.sectorsFilter);
                vm.getMyReservation();
            } else {
                vm.event.seatsMapConfig.sectionId = selectedSectionId;
                vm.priceclassFilter.sectionId = selectedSectionId;
                eventService.getPriceClassData(vm.event, vm.priceclassFilter);
                eventService.getSectorTickets(vm.event, vm.priceclassFilter);
            }
            $location.update_path(newPath);
        };

        vm.setSelectedSeatId = function (selectedSeatId) {
            $('.place_tooltip').remove();
            $scope.selectedSeatId = selectedSeatId;
            if ($rootScope.hasFullAccess('api_make_reservation') && vm.event.active) {
                eventService.addToBasket(
                    {
                        concertId: $routeParams.id,
                        sectionId: $scope.selectedSectionId,
                        seatId: $scope.selectedSeatId
                    }, function () {
                        vm.getMyReservation();
                    }
                );
            }
        };

        vm.changeReservationType = function (reservationType) {
            if (vm.reservation.reservationType != reservationType) {
                vm.reservation.reservationType = reservationType;
                if (reservationType == 'invitation') {
                    vm.myBasket.summary.reservationSumTotal = angular.copy(vm.myBasket.summary.sumTotal);
                    vm.myBasket.summary.sumTotal = 0;
                }
                else if (reservationType == 'with_price' && vm.myBasket.summary.reservationSumTotal) {
                    vm.myBasket.summary.sumTotal = angular.copy(vm.myBasket.summary.reservationSumTotal);
                }
            }
        };

        vm.getMyReservation = function (bookingId) {
            if (!$scope.selectedSectionId && !bookingId) {
                return;
            }
            var newPath = '/report/' + $routeParams.pointId + '/' + $routeParams.type + '/' + $routeParams.id + '/sections/' + $scope.selectedSectionId + '/reservation/';
            $location.update_path(newPath);
            if (vm.reservationMode == 'basket') {
                eventService.getMyBasket(
                    function () {
                        eventService.getSectorInfo(
                            {
                                concertId: $routeParams.id,
                                sectionId: $scope.selectedSectionId
                            }, function () {
                                vm.goToStep2();
                            });
                    }
                );
            } else if (vm.reservationMode == 'booking') {
                eventService.getMyBooking(
                    function () {
                        eventService.getSectorInfo(
                            {
                                bookingId: $routeParams.id,
                                sectionId: $scope.selectedSectionId
                            }, function () {
                                vm.goToStep2();
                            });
                    }, {bookingId: bookingId}
                );
            }
        };

        vm.getMyBasket = function () {
            vm.reservationMode = 'basket';
            vm.getMyReservation();
        };

        vm.getMyBooking = function (bookingId) {
            vm.reservationMode = 'booking';
            vm.getMyReservation(bookingId);
        };

        vm.confirmReservation = function () {
            vm.reservationToConfirm = angular.copy(vm.reservation);
            var basketExpireAt = moment(vm.myBasket.summary.expireAt);
            vm.reservationToConfirm.expireAt = moment(vm.reservationToConfirm.expireAt, 'DD-MM-YYYY HH:mm');
            vm.reservationToConfirm.expireAt = vm.reservationToConfirm.expireAt.hour(basketExpireAt.get('hours'));
            vm.reservationToConfirm.expireAt = vm.reservationToConfirm.expireAt.minute(basketExpireAt.get('minutes'));
            vm.reservationToConfirm.expireAt = vm.reservationToConfirm.expireAt.second(basketExpireAt.get('seconds'));
            vm.reservationToConfirm.expireAt = vm.reservationToConfirm.expireAt.format('YYYY-MM-DDTHH:mm:ss');

            vm.reservationToConfirm.contactPhone = vm.reservation.contactPhoneCode + ' ' + vm.reservation.contactPhone;
            var newPath = '/report/' + $routeParams.pointId + '/' + $routeParams.type + '/' + $routeParams.id + '/bookings';
            if (vm.reservationMode == 'basket') {
                eventService.confirmBasket(
                    vm.reservationToConfirm, function () {
                        $rootScope.bookingSuccessAlert = true;
                        $location.path(newPath);
                    }
                );
            } else if (vm.reservationMode == 'booking') {
                eventService.confirmBooking(
                    vm.reservationToConfirm, function () {
                        $location.path(newPath);
                    }
                );
            }
        };

        vm.resetSelectedSectionId = function () {
            vm.event.sectionsMapConfig.mouseoverPrevSectionId = false;
            vm.event.sectionsMapConfig.mouseoverSectionId = false;
            $scope.selectedSectionId = false;
        };

        vm.setMouseoverSectionId = function (mouseoverSectionId) {
            vm.event.sectionsMapConfig.mouseoverPrevSectionId = angular.copy($scope.mouseoverSectionId);
            vm.event.sectionsMapConfig.mouseoverSectionId = mouseoverSectionId;
            $scope.mouseoverSectionId = mouseoverSectionId;
        };

        vm.hasSalesPoint = function () {
            return vm.event != null && vm.event.salespoints != null && vm.event.salespoints.length > 1;
        };

        vm.prepareEmailBody = function (emailBody) {
            emailBody = emailBody.replace(/#api_add_event/g, vm.event.name);
            emailBody = emailBody.replace(/#api_add_firstname/g, vm.reservation.firstName);
            emailBody = emailBody.replace(/#api_add_lastname/g, vm.reservation.lastName);
            emailBody = emailBody.replace(/#api_add_reservation_expiration/g, vm.reservation.expireAt);
            emailBody = emailBody.replace(/#api_add_invoice_number/g, '<a href="#">Invoice Number<a\/>');
            emailBody = emailBody.replace(/#api_add_made_by_firstname/g, $rootScope.user.firstName);
            emailBody = emailBody.replace(/#api_add_made_by_lastname/g, $rootScope.user.lastName);
            emailBody = emailBody.replace(/#api_add_made_by_organization/g, $rootScope.user.organization);
            return $sce.trustAsHtml(emailBody);
        };

        /* Reservations */

        vm.removeFromBooking = function (bookingId) {
            eventService.removeFromBooking(
                bookingId, function () {
                    eventService.getBookingsData(vm.bookingFilter);
                }
            );
        };

        /* Booking form */

        vm.removeFromBasket = function (ticketId) {
            eventService.removeFromBasket(
                ticketId, function () {
                    if (vm.reservationMode == 'basket') {
                        eventService.getMyBasket();
                    } else if (vm.reservationMode == 'booking') {
                        eventService.getMyBooking();
                    }
                    eventService.getSectorInfo(
                        {
                            concertId: $routeParams.id,
                            sectionId: $scope.selectedSectionId
                        });
                }
            );
        };

        vm.changeBasketTicketType = function (ticketId, typeId) {
            if (vm.reservationMode == 'basket') {
                eventService.changeBasketTicketType(ticketId, typeId,
                    function () {
                        eventService.getMyBasket();
                    }
                );
            }
            else if (vm.reservationMode == 'booking') {
                eventService.changeBookingTicketType(ticketId, typeId,
                    function () {
                        eventService.getMyBooking();
                    }
                );
            }
        };

        vm.goToSectionsStep = function (reservationMode) {
            vm.bookingStep = null;
            vm.reservationMode = reservationMode;
            var newPath = '/report/' + $routeParams.pointId + '/' + $routeParams.type + '/' + $routeParams.id + '/sections/';
            $location.update_path(newPath);
            $scope.selectedSectionId = false;
        };

        vm.goToStep2 = function () {
            vm.bookingStep = 'step2-3';
        };

        vm.goToStep4 = function () {
            eventService.getCountries();
            if (!vm.reservation.subject) {
                vm.reservation.subject = pointService.getPointReservationEmailSubject();
            }
            if (!vm.reservation.body) {
                vm.reservation.body = pointService.getPointReservationEmailBody();
            }
            if (!vm.reservation.countryId) {
                vm.reservation.countryId = pointService.getPointCountryId();
            }
            vm.bookingStep = 'step4';
        };

        vm.goToStep5 = function () {
            vm.bookingStep = 'step5';
        };

        vm.decreaseTicketsCount = function (ttSectorData) {
            if (ttSectorData.selected > 0) {
                ttSectorData.selected--;
            }
        };

        vm.increaseTicketsCount = function (ttSectorData) {
            if (ttSectorData.selected < ttSectorData.freeTotal) {
                ttSectorData.selected++;
            }
        };

        vm.ticketsCount = function () {
            var ticketsCount = 0;
            angular.forEach(vm.sectorInfo.ttSector, function (ttSector) {
                angular.forEach(ttSector.ttSectorData, function (ttSectorData) {
                    ticketsCount += parseInt(ttSectorData.selected, 10);
                });
            });
            return ticketsCount;
        };

        vm.offerTickets = function () {
            var classes = {},
                sectionId = null;
            if (vm.ticketsCount() > 0) {
                angular.forEach(vm.sectorInfo.ttSector, function (ttSector) {
                    if (!sectionId) {
                        sectionId = ttSector.sectorId;
                    }
                    angular.forEach(ttSector.ttSectorData, function (ttSectorData) {
                        if (ttSectorData.selected > 0) {
                            classes[ttSectorData.priceClass] = ttSectorData.selected;
                        }
                        ttSectorData.selected = 0;
                    });
                });
                eventService.addToBasket(
                    {
                        concertId: $routeParams.id,
                        sectionId: sectionId,
                        classes: classes
                    }, function () {
                        if (vm.reservationMode == 'basket') {
                            eventService.getMyBasket();
                        } else if (vm.reservationMode == 'booking') {
                            eventService.getMyBasket();
                        }
                        eventService.getSectorInfo(
                            {
                                concertId: $routeParams.id,
                                sectionId: $scope.selectedSectionId
                            });
                    }
                );
            }

        };

        vm.decreaseBasketDiscount = function () {
            if (vm.reservation.discount > 0) {
                vm.reservation.discount--;
            }
        };

        vm.increaseBasketDiscount = function () {
            if (vm.reservation.discount < 100) {
                vm.reservation.discount++;
            }
        };

        vm.validateQuantity = function (ttSectorData) {
            if (ttSectorData.selected < 0) {
                ttSectorData.selected = 0;
            }
            else if (ttSectorData.selected > ttSectorData.freeTotal) {
                ttSectorData.selected = ttSectorData.freeTotal;
            }
        };

        vm.getMoreBookingsData = function () {
            eventService.getMoreBookingsData(vm.bookingFilter);
        };

        $scope.setSelectedSectionId = vm.setSelectedSectionId;
        $scope.setSelectedSeatId = vm.setSelectedSeatId;
        $scope.setMouseoverSectionId = vm.setMouseoverSectionId;


        /* watchers */

        $rootScope.$watch('user', function (oldUser, newUser) {
            if ($rootScope.user && !angular.equals(oldUser, newUser)) {
                if (!$rootScope.hasFullAccess('api_reports')) {
                    $location.path('dashboard');
                }
            }

            var accessRights = [
                {
                    accessRight: 'api_reports_reservations',
                    tab: 'bookings'
                },
                {
                    accessRight: 'api_reports_locations',
                    tab: 'locations'
                },
                {
                    accessRight: 'api_reports_sections',
                    tab: 'sections'
                },
                {
                    accessRight: 'api_reports_priceclass',
                    tab: 'priceclass'
                },
                {
                    accessRight: 'api_reports_pricetype',
                    tab: 'pricetype'
                },
                {
                    accessRight: 'api_reports_overview',
                    tab: 'overview'
                }
            ];

            if ($routeParams.reportType && !vm.currentTab) {
                angular.forEach(accessRights, function (accessRight) {
                    if ($rootScope.hasFullAccess(accessRight.accessRight) && accessRight.tab == $routeParams.reportType) {
                        vm.currentTab = accessRight.tab;
                        if (parseInt($routeParams.sectorId, 10)) {
                            $scope.$watch('vm.event.sellPeriod', function (newSellPeriod, oldSellPeriod) {
                                if (newSellPeriod !== oldSellPeriod) {
                                    vm.priceclassFilter.period.startDate = moment(newSellPeriod.start);
                                    vm.priceclassFilter.period.endDate = moment(newSellPeriod.end);
                                    vm.setSelectedSectionId($routeParams.sectorId);
                                }
                            });
                        }
                    }
                });
            }

            if (!vm.currentTab) {
                angular.forEach(accessRights, function (accessRight) {
                    if ($rootScope.hasFullAccess(accessRight.accessRight)) {
                        vm.currentTab = accessRight.tab;
                    }
                });
            }
        });

        $scope.$watch(
            function () {
                vm.myOverviewBarData = eventService.myOverviewData();
                vm.myOverviewLineData = eventService.myOverviewGraphData();
                vm.myPriceTypePieData = eventService.myPriceTypeData();
                vm.myPriceTypeLineData = eventService.myPriceTypeGraphData();
                vm.myPriceClassPieData = eventService.myPriceClassData();
                vm.myPriceClassLineData = eventService.myPriceClassGraphData();
                vm.myBasket = eventService.myBasket();
                vm.myBookings = eventService.myBookings();
                vm.bookingStatuses = eventService.bookingStatuses();
                vm.bookingTypes = eventService.bookingTypes();
                vm.sectorInfo = eventService.sectorInfo();
                vm.mySectorsData = eventService.mySectorsData();
                vm.myLocationsData = eventService.myLocationsData();
                vm.relatedEvents = eventService.relatedEvents();
                vm.sectorTickets = eventService.sectorTickets();
                vm.countries = eventService.countries();
            }
        );

        $scope.$watch('vm.countries', function (newValue, oldValue) {
            if (!angular.equals(newValue, oldValue)) {
                if (!vm.reservation.contactPhoneCode && vm.reservation.countryId) {
                    var country = $filter('filter')(vm.countries.countries, function (country) {
                        return country.id == vm.reservation.countryId;
                    });
                    if (country.length > 0) {
                        vm.reservation.contactPhoneCode = '+' + country[0].areaCode;
                    }
                }
            }
        }, true);

        $scope.$watch('selectedSectionId', function (newValue, oldValue) {
            if (newValue && !angular.equals(newValue, oldValue)) {
                vm.event.seatsMapConfig.sectionId = newValue;
            }
        });

        $scope.$watch('vm.sectorTickets', function (newValue, oldValue) {
            if (!angular.equals(newValue, oldValue)) {
                angular.forEach(newValue.tickets, function (ticket) {
                    ticket.id = ticket.seatId;
                    ticket.available = !!ticket.status;
                    ticket.priceClass = ticket.priceClassId;
                });
                vm.event.seatsMapConfig.priceClasses = newValue.priceClasses;
                vm.event.seatsMapConfig.seatsInfo = newValue.tickets;
            }
        });

        //Rerender charts in overview tab when language has been changed. Other tabs' charts don't have translations.
        $rootScope.$on('$translateChangeSuccess', function () {
            if ($location.path().indexOf("report") != -1) {
                if (vm.currentTab == 'overview') {
                    graphService.renderOverviewBarGraph(vm.myOverviewBarData, vm.myOverviewBarData, vm.overviewBarGraph);
                    graphService.renderOverviewLineGraph(vm.myOverviewLineData, vm.overviewFilter, vm.overviewLineGraph);
                }
            }
        });
        $scope.$watch('vm.myOverviewBarData', function (newValue, oldValue) {
            if (!angular.equals(newValue, oldValue)) {
                graphService.renderOverviewBarGraph(newValue, vm.myOverviewBarData, vm.overviewBarGraph);
            }
        });

        $scope.$watch('vm.myOverviewLineData', function (newValue, oldValue) {
            if (!angular.equals(newValue, oldValue)) {
                graphService.renderOverviewLineGraph(newValue, vm.overviewFilter, vm.overviewLineGraph);
            }
        });

        $scope.$watch('vm.myPriceTypePieData', function (newValue, oldValue) {
            if (!angular.equals(newValue, oldValue)) {
                graphService.renderPriceTypePieGraph(newValue, vm.pricetypeFilter, vm.myPriceTypePieData, vm.pricetypePieGraph);
            }
        });

        $scope.$watch('vm.myPriceTypeLineData', function (newValue, oldValue) {
            if (!angular.equals(newValue, oldValue)) {
                graphService.renderPriceTypeLineGraph(newValue, vm.pricetypeFilter, vm.pricetypeLineGraph);
            }
        });

        $scope.$watch('vm.myPriceClassPieData', function (newValue, oldValue) {
            if (!angular.equals(newValue, oldValue)) {
                graphService.renderPriceClassPieGraph(newValue, vm.priceclassFilter, vm.myPriceClassPieData, vm.priceclassPieGraph);
            }
        });

        $scope.$watch('vm.myPriceClassLineData', function (newValue, oldValue) {
            if (!angular.equals(newValue, oldValue)) {
                graphService.renderPriceClassLineGraph(newValue, vm.priceclassFilter, vm.priceclassLineGraph);
            }
        });

        $scope.$watch('vm.overviewFilter.display', function (newValue, oldValue) {
            if (!angular.equals(newValue, oldValue)) {
                if (vm.myOverviewLineData == null) {
                    eventService.getOverviewGraphData(vm.event, vm.overviewFilter);
                } else {
                    graphService.renderOverviewLineGraph(vm.myOverviewLineData, vm.overviewFilter, vm.overviewLineGraph);
                }
            }
        });

        $scope.$watch('vm.overviewFilter.groupBy', function (newValue, oldValue) {
            if (!angular.equals(newValue, oldValue)) {
                eventService.getOverviewGraphData(vm.event, vm.overviewFilter);
            }
        });

        $scope.$watch('vm.overviewFilter.centerId', function (newValue, oldValue) {
            if (!angular.equals(newValue, oldValue)) {
                eventService.getOverviewData(vm.event, vm.overviewFilter);
                eventService.getOverviewGraphData(vm.event, vm.overviewFilter);
            }
        });

        $scope.$watch('vm.pricetypeFilter.pieDisplay', function (newValue, oldValue) {
            if (!angular.equals(newValue, oldValue)) {
                if (vm.myPriceTypePieData == null) {
                    eventService.getPriceTypeData(vm.event, vm.pricetypeFilter);
                } else {
                    graphService.renderPriceTypePieGraph(vm.myPriceTypePieData, vm.pricetypeFilter, vm.myPriceTypePieData, vm.pricetypePieGraph);
                }
            }
        });

        $scope.$watch('vm.pricetypeFilter.display', function (newValue, oldValue) {
            if (!angular.equals(newValue, oldValue)) {
                if (vm.myPriceTypeLineData == null) {
                    eventService.getPriceTypeGraphData(vm.event, vm.pricetypeFilter);
                } else {
                    graphService.renderPriceTypeLineGraph(vm.myPriceTypeLineData, vm.pricetypeFilter, vm.pricetypeLineGraph);
                }
            }
        });

        $scope.$watch('vm.pricetypeFilter.groupBy', function (newValue, oldValue) {
            if (!angular.equals(newValue, oldValue)) {
                eventService.getPriceTypeGraphData(vm.event, vm.pricetypeFilter);
            }
        });

        $scope.$watch('vm.pricetypeFilter.centerId', function (newValue, oldValue) {
            if (!angular.equals(newValue, oldValue)) {
                eventService.getPriceTypeData(vm.event, vm.pricetypeFilter);
                eventService.getPriceTypeGraphData(vm.event, vm.pricetypeFilter);
            }
        });

        $scope.$watch('vm.priceclassFilter.pieDisplay', function (newValue, oldValue) {
            if (!angular.equals(newValue, oldValue)) {
                if (vm.myPriceClassPieData == null) {
                    eventService.getPriceClassData(vm.event, vm.priceclassFilter);
                } else {
                    graphService.renderPriceClassPieGraph(vm.myPriceClassPieData, vm.priceclassFilter, vm.myPriceClassPieData, vm.priceclassPieGraph);
                }
            }
        });

        $scope.$watch('vm.priceclassFilter.display', function (newValue, oldValue) {
            if (!angular.equals(newValue, oldValue)) {
                if (vm.myPriceClassLineData == null) {
                    eventService.getPriceClassGraphData(vm.event, vm.priceclassFilter);
                } else {
                    graphService.renderPriceClassLineGraph(vm.myPriceClassLineData, vm.priceclassFilter, vm.priceclassLineGraph);
                }
            }
        });

        $scope.$watch('vm.priceclassFilter.groupBy', function (newValue, oldValue) {
            if (!angular.equals(newValue, oldValue)) {
                eventService.getPriceClassGraphData(vm.event, vm.priceclassFilter);
            }
        });

        $scope.$watch('vm.priceclassFilter.centerId', function (newValue, oldValue) {
            if (!angular.equals(newValue, oldValue)) {
                eventService.getPriceClassData(vm.event, vm.priceclassFilter);
                eventService.getPriceClassGraphData(vm.event, vm.priceclassFilter);
            }
        });

        $scope.$watch('vm.sectorsFilter.centerId', function (newValue, oldValue) {
            if (!angular.equals(newValue, oldValue)) {
                eventService.getSectorsData(vm.event, vm.sectorsFilter);
            }
        });

        $scope.$watch('vm.locationsFilter.centerId', function (newValue, oldValue) {
            if (!angular.equals(newValue, oldValue)) {
                eventService.getLocationsData(vm.event, vm.locationsFilter);
            }
        });

        vm.search = function () {
            localStorage.setItem('reportsFilter', JSON.stringify(vm.filter));
            $location.path('dashboard');
        };

        $scope.$watch('vm.event.sellPeriod', function (newSellPeriod, oldSellPeriod) {
            if (newSellPeriod !== oldSellPeriod) {
                vm.filterPeriod.startDate = newSellPeriod.start;
                vm.filterPeriod.endDate = newSellPeriod.end;
                vm.overviewFilter.period.startDate = newSellPeriod.start;
                vm.overviewFilter.period.endDate = newSellPeriod.end;
                vm.pricetypeFilter.period.startDate = newSellPeriod.start;
                vm.pricetypeFilter.period.endDate = newSellPeriod.end;
                vm.priceclassFilter.period.startDate = newSellPeriod.start;
                vm.priceclassFilter.period.endDate = newSellPeriod.end;
                vm.sectorsFilter.period.startDate = newSellPeriod.start;
                vm.sectorsFilter.period.endDate = newSellPeriod.end;
                vm.locationsFilter.period.startDate = newSellPeriod.start;
                vm.locationsFilter.period.endDate = newSellPeriod.end;
                vm.minFilterDate = vm.overviewFilter.period.startDate;
                vm.maxFilterDate = vm.overviewFilter.period.endDate;
                vm.tabSelectEvent(vm.currentTab);
            }
        });

        $scope.$watch('vm.event.confId', function (newConfId, oldConfId) {
            if (newConfId !== oldConfId) {
                vm.event.sectionsMapConfig.confId = newConfId;
                vm.event.seatsMapConfig.confId = newConfId;
            }
        });

        $scope.$watch('vm.mySectorsData.sales', function (newValue, oldValue) {
            if (!angular.equals(newValue, oldValue)) {
                var sections = newValue.map(function (s) {
                    return s.sectorId;
                });
                if (sections.length === 1) {
                    vm.setSelectedSectionId(sections[0]);
                }
                else {
                    vm.event.sectionsMapConfig.sections = sections;
                    vm.event.sectionsMapConfig.enabledSections = sections;
                }
            }
        });

        $scope.$watch('vm.filterPeriod', function (newPeriod, oldPeriod) {
            if (newPeriod !== oldPeriod) {
                angular.forEach(vm.filters, function (filter) {
                    filter.period = vm.filterPeriod;
                });
                vm.tabSelectEvent(vm.currentTab);
            }
        });

        //$scope.$watch('vm.bookingFilter', function (newFilter, oldFilter) {
        //    if (oldFilter && !angular.equals(newFilter, oldFilter) && newFilter.period.startDate) {
        //        eventService.getBookingsData(vm.bookingFilter);
        //    }
        //}, true);

        $scope.$watch('vm.salesPoint', function (newSalesPoint, oldSalesPoint) {
            if (oldSalesPoint !== newSalesPoint) {
                angular.forEach(vm.filters, function (filter) {
                    filter.centerId = newSalesPoint.id;
                    filter.centerName = newSalesPoint.name;
                });
                vm.tabSelectEvent(vm.currentTab);
            }
        });

        $scope.$watch('vm.reservation.discount', function (newDiscount, oldDiscount) {
            if (typeof newDiscount !== 'undefined') {
                vm.reservation.discount = parseInt(newDiscount, 10);
            }
            if (vm.reservation.discount > 100) {
                vm.reservation.discount = 100;
            } else if (vm.reservation.discount < 0) {
                vm.reservation.discount = 0;
            }
            if (typeof oldDiscount !== 'undefined' && oldDiscount !== newDiscount) {
                if (vm.reservationMode == 'basket') {
                    eventService.getMyBasket(
                        null, vm.reservation
                    );
                } else if (vm.reservationMode == 'booking') {
                    eventService.getMyBooking(
                        null, vm.reservation
                    );
                }
            }
        });

    }

})();