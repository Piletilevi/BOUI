(function () {

    'use strict';

    angular.module('boApp')
        .controller('reportController', ReportController);

    ReportController.$inject = ['$scope', '$sce', '$rootScope', '$routeParams', '$location',
        '$filter', '$translate', 'eventService', 'pointService',
        'graphService'];

    function ReportController($scope, $sce, $rootScope, $routeParams, $location,
                              $filter, $translate, eventService, pointService,
                              graphService) {

        if (!$routeParams && !$routeParams.id) {
            $location.path('dashboard');
        }
        //initially set those objects to null to avoid undefined error
        var vm = this;

        vm.event = {
            id: $routeParams.id,
            isShow: $routeParams.type == 'show',
            sectionsMapConfig: {
                concertId: $routeParams.id,
                type: 'sections',
                confId: null,
                sectionMapType: 'vector',
                sections: null,
                enabledSections: null
            },
            seatsMapConfig: {
                concertId: $routeParams.id,
                type: 'seats',
                confId: null,
                sectionMapType: 'vector',
                sections: [],
                enabledSections: [],
                seatsInfo: [],
                priceClasses: [],
                seatClick: false,
                sectionId: 37311,
                mapWidth: 388,
                mapHeight: 250
            },
            selectedSeats: []
        };
        vm.tabsConfig = [
            {
                accessRight: 'api_reports_overview',
                name: 'overview',
                translationCode: 'api_overview',
                icon: 'fa-area-chart',
            },
            {
                accessRight: 'api_reports_pricetype',
                name: 'pricetype',
                translationCode: 'api_by_pricetype',
                icon: 'fa-tags',
            },
            {
                accessRight: 'api_reports_priceclass',
                name: 'priceclass',
                translationCode: 'api_by_priceclass',
                icon: 'fa-cube',
            },
            {
                accessRight: 'api_reports_sections',
                name: 'sections',
                translationCode: 'api_by_sectors',
                icon: 'fa-th',
                hiddenInShows: true,
            },
            {
                accessRight: 'api_reports_locations',
                name: 'locations',
                translationCode: 'api_by_locations',
                icon: 'fa-map',
            },
            {
                accessRight: 'api_reports_reservations',
                name: 'bookings',
                translationCode: 'api_bookings',
                icon: 'fa-book',
            },
        ];
        vm.activeTabs = [];

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
        vm.defaultBookingFilter = {
            concertId: $routeParams.id,
            period: {startDate: moment().subtract(1, 'years'), endDate: moment().add(1, 'days')},
			statusId: 1,
            typeId: 0
        };
        vm.bookingFilter = angular.copy(vm.defaultBookingFilter);
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
        vm.reservationMode = $routeParams.reservation ? 'basket' : false;
        // vm.printPdf = pdfService.printPdf;

        //Initialize
        eventService.getEventSales(vm.event);
        eventService.getRelatedEvents(vm.event);

        vm.goToEvent = function (pointId,event) {
            eventService.goToEvent(pointId,event);
        }

        vm.reloadEvent = function () {
            eventService.reloadEvent(vm.event);
        }

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
                eventService.getBookingsData(vm.bookingFilter, function () {
                    if ($rootScope.bookingId) {
                        setTimeout(function () {
                            angular.forEach(vm.myBookings.bookings, function (value, key) {
                                if (value.id == $rootScope.bookingId) {
                                    vm.bookingsRowExpanded = key;
                                }
                            });
                        });
                    }
                });
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

        vm.getCurrentTabName = function () {
            for (var i = 0; i < vm.tabsConfig.length; ++i) {
                if (vm.tabsConfig[i].name == vm.currentTab) {
                    return $translate.instant(vm.tabsConfig[i].translationCode);
                }
            }
            return '';
        };

        vm.getReservationMode = function () {
            $scope.reservationMode = vm.reservationMode;
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

        vm.addSeatsToBasket = function (selectedSeatsIds) {
            if (!$rootScope.hasFullAccess('api_make_reservation') || !vm.event.active || !vm.reservationMode) {
                return;
            }
            var basketItems = [];
            for (var i= 0; i < selectedSeatsIds.length; ++i) {
                basketItems.push(                {
                    concertId: $routeParams.id,
                    sectionId: $scope.selectedSectionId,
                    seatId: selectedSeatsIds[i]
                });
            }
            eventService.addToBasketBulk(basketItems, function () {
                vm.getMyReservation();
            });
        };
        vm.removeSelectedSeatId = function (selectedSeatId) {
            if ($rootScope.hasFullAccess('api_make_reservation') && vm.event.active && vm.reservationMode) {
                eventService.removeFromBasket(
                    {
                        concertId: $routeParams.id,
                        sectionId: $scope.selectedSectionId,
                        seatId: selectedSeatId
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
            vm.event.seatsMapConfig.seatClick = true;
            vm.getMyReservation();
        };

        vm.getMyBooking = function (bookingId) {
            vm.reservationMode = 'booking';
            vm.event.seatsMapConfig.seatClick = true;
            vm.getMyReservation(bookingId);
        };

        vm.resetBookingFilter = function () {
            vm.bookingClientName = null;
            vm.bookingNr = null;
            vm.bookingFilter = angular.copy(vm.defaultBookingFilter);
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
                        vm.myBasket = {};
                        $rootScope.bookingSuccessAlert = true;
                        $rootScope.bookingId = eventService.bookingId();
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

        vm.prepareEmailContent = function (emailContent) {
            emailContent = emailContent.replace(/#api_add_event/g, vm.event.name);
            emailContent = emailContent.replace(/#api_add_firstname/g, vm.reservation.firstName);
            emailContent = emailContent.replace(/#api_add_lastname/g, vm.reservation.lastName);
            emailContent = emailContent.replace(/#api_add_reservation_expiration/g, vm.reservation.expireAt);
            emailContent = emailContent.replace(/#api_add_invoice_number/g, '<a href="#">Invoice Number<a\/>');
            emailContent = emailContent.replace(/#api_add_made_by_firstname/g, $rootScope.user.firstName);
            emailContent = emailContent.replace(/#api_add_made_by_lastname/g, $rootScope.user.lastName);
            emailContent = emailContent.replace(/#api_add_made_by_organization/g, $rootScope.user.organization);
            emailContent = emailContent.replace(/\n/g, "<br />");
            return $sce.trustAsHtml(emailContent);
        };

        /* Reservations */

        vm.cancelBooking = function (bookingId) {
            eventService.cancelBooking(
                bookingId, function () {
                    eventService.getBookingsData(vm.bookingFilter);
                }
            );
        };

        /* Booking form */

        vm.removeFromBasket = function (ticketId) {
            if(!ticketId || vm.myBasket.basket.length == 1) {
                vm.prevDiscount = 0;
            }
            eventService.removeFromBasket(
                ticketId, function () {
                    if (vm.reservationMode == 'basket') {
                        eventService.getMyBasket(
                            null, vm.reservation
                        );
                    } else if (vm.reservationMode == 'booking') {
                        eventService.getMyBooking(null, vm.reservation);
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
            angular.forEach($filter('filter')(vm.myBasket.basket, {'id': ticketId})[0].priceTypes, function (priceType) {
                priceType.active = (priceType.priceTypeId == typeId);
            });
            if (vm.reservationMode == 'basket') {
                eventService.changeBasketTicketType(ticketId, typeId,
                    function () {
                        eventService.getMyBasket(
                            null, vm.reservation
                        );
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

        vm.validateReservationForm = function () {
            vm.reservationFormFubmitted = true;
            vm.reservationFormRequredErr = !vm.reservation.firstName || !vm.reservation.lastName || !vm.reservation.from;
            vm.reservationFormEmailErr = !/\S+@\S+\.\S+/.test(vm.reservation.contactEmail);
        };

        vm.goToSectionsStep = function (reservationMode) {
            vm.bookingStep = null;
            vm.reservationMode = reservationMode;
            vm.event.seatsMapConfig.seatClick = reservationMode;
            var newPath = '/report/' + $routeParams.pointId + '/' + $routeParams.type + '/' + $routeParams.id + '/sections/';
            $location.update_path(newPath);
            $scope.selectedSectionId = false;
        };

        vm.goToStep2 = function () {
            vm.bookingStep = 'step2-3';
        };

        vm.goToStep4 = function () {
            eventService.getCountries();
            if (!vm.reservation.from) {
                vm.reservation.from = $rootScope.user.email;
            }
            vm.defaultReservationSubject = $translate.instant("api_reservation_email_subject" + pointService.getPointId());
            vm.defaultReservationBody = $translate.instant("api_reservation_email_body" + pointService.getPointId());
            vm.defaultInvitationSubject = $translate.instant("api_invitation_email_subject" + pointService.getPointId());
            vm.defaultInvitationBody = $translate.instant("api_invitation_email_body" + pointService.getPointId());

            if (!vm.reservation.subject) {
                if (vm.reservation.reservationType == 'invitation') {
					vm.reservation.subject = vm.defaultInvitationSubject;
				} else {
					vm.reservation.subject = vm.defaultReservationSubject;
				}
            }
            if (!vm.reservation.body) {
                if (vm.reservation.reservationType == 'invitation') {
					vm.reservation.body = vm.defaultInvitationBody;
				} else {
					vm.reservation.body = vm.defaultReservationBody;
				}
            }
            if (typeof vm.reservation.countryId == 'undefined') {
                vm.reservation.countryId = pointService.getPointCountryId();
            }
            if(!vm.reservation.contactPhoneCode) {
                vm.reservation.contactPhoneCode = vm.defaultContactPhoneCode;
            }
            vm.bookingStep = 'step4';
        };

        vm.goToStep5 = function () {
            if (!vm.reservation.contactPhone) {
                vm.reservation.contactPhoneCode = null;
            }
            if (!vm.reservation.address) {
                vm.reservation.countryId = null;
            }
            vm.bookingStep = 'step5';
        };

        vm.decreaseTicketsCount = function (ttSectorData) {
            if (ttSectorData.selected > 0) {
                ttSectorData.selected--;
            }
        };

        vm.addDiscount = function () {
            if(vm.prevDiscount == vm.reservation.discount) {
                return;
            }
            vm.prevDiscount = vm.reservation.discount;
            if (typeof vm.reservation.discount === 'undefined') {
                vm.reservation.discount = 0;
            }
            else {
                if (!vm.reservation.discount) {
                    vm.reservation.discount = 0;
                }
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
        };

        vm.focusDiscount = function () {
            if (vm.reservation.discount == 0) {
                delete vm.reservation.discount;
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
            return !isNaN(ticketsCount) ? ticketsCount : 0;
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
                            if (!vm.myBasket.basket) {
                                vm.reservation.discount = 0;
                            }
                            eventService.getMyBasket(
                                null, vm.reservation
                            );
                        } else if (vm.reservationMode == 'booking') {
                            eventService.getMyBasket(
                                null, vm.reservation
                            );
                        }

                        eventService.getSectorInfo( {
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
                vm.addDiscount();
            }
        };

        vm.increaseBasketDiscount = function () {
            if (vm.reservation.discount < 100) {
                vm.reservation.discount++;
                vm.addDiscount();
            }
        };

        vm.validateQuantity = function (ttSectorData) {
            ttSectorData.selected = parseInt(ttSectorData.selected, 10);
            if (ttSectorData.selected <= 0 || isNaN(ttSectorData.selected)) {
                ttSectorData.selected = 0;
            }
            else if (ttSectorData.selected > ttSectorData.freeTotal) {
                ttSectorData.selected = ttSectorData.freeTotal;
            }
        };

        vm.focusPriceClassQuantity = function (ttSectorData) {
            if (ttSectorData.selected == 0) {
                delete ttSectorData.selected;
            }
        };

        vm.blurPriceClassQuantity = function (ttSectorData) {
            if (!ttSectorData.selected) {
                ttSectorData.selected = 0;
            }
        };

        vm.selectContactPhoneCode = function (selectedContactPhoneCode) {
            if (selectedContactPhoneCode) {
                vm.reservation.contactPhoneCode = '+' + selectedContactPhoneCode.originalObject.areaCode;
                $scope.$broadcast('angucomplete-alt:changeInput', 'contact-phone-code-inp', vm.reservation.contactPhoneCode);
            }
        };
        vm.blurContactPhoneCode = function (selectedContactPhoneCode) {
            var contactPhoneCode = $('#contact-phone-code-inp_value').val(),
                selectedCountry = null;
            angular.forEach(vm.countries.countries, function (country) {
                if (parseInt(contactPhoneCode, 10) == country.areaCode || contactPhoneCode == country.name ) {
                    selectedCountry = country;
                }
            });
            if (!selectedCountry) {
                vm.reservation.contactPhoneCode = vm.defaultContactPhoneCode;
                $scope.$broadcast('angucomplete-alt:changeInput', 'contact-phone-code-inp', vm.reservation.contactPhoneCode);
            }
        };

        vm.selectContactCountry = function (selectedContactCountry) {
            if (selectedContactCountry) {
                vm.reservation.countryId = selectedContactCountry.originalObject.id;
                vm.reservation.contactCountry = selectedContactCountry.originalObject.name;
                vm.reservation.contactPhoneCode = '+' + selectedContactCountry.originalObject.areaCode;
                $scope.$broadcast('angucomplete-alt:changeInput', 'contact-country-inp', vm.reservation.contactCountry);
                $scope.$broadcast('angucomplete-alt:changeInput', 'contact-phone-code-inp', vm.reservation.contactPhoneCode);
            }
        };
        vm.blurContactCountry = function (selectedContactCountry) {
            var contactCountry = $('#contact-country-inp_value').val(), selectedCountry = null;
            angular.forEach(vm.countries.countries, function (country) {
                if (contactCountry == country.name) {
                    selectedCountry = country;
                }
            });
            if (!selectedCountry) {
                vm.reservation.countryId = vm.defaultContactCountry.id;
                vm.reservation.contactCountry = vm.defaultContactCountry.name;
                $scope.$broadcast('angucomplete-alt:changeInput', 'contact-country-inp', vm.reservation.contactCountry);
            }
        };

        vm.getMoreBookingsData = function () {
            eventService.getMoreBookingsData(vm.bookingFilter);
        };

        $scope.getReservationMode = vm.getReservationMode;
        $scope.setSelectedSectionId = vm.setSelectedSectionId;
        $scope.addSeatsToBasket = vm.addSeatsToBasket;
        $scope.removeSelectedSeatId = vm.removeSelectedSeatId;
        $scope.setMouseoverSectionId = vm.setMouseoverSectionId;

        /* watchers */

        $rootScope.$watch('user', function (oldUser, newUser) {
            if ($rootScope.user && !angular.equals(oldUser, newUser)) {
                if (!$rootScope.hasFullAccess('api_reports')) {
                    $location.path('dashboard');
                }
            }

            if ($routeParams.reportType && !vm.currentTab) {
                angular.forEach(vm.tabsConfig, function (tabConfig) {
                    if ($rootScope.hasFullAccess(tabConfig.accessRight) && tabConfig.name == $routeParams.reportType) {
                        vm.currentTab = tabConfig.name;
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
            vm.activeTabs = [];
            angular.forEach(vm.tabsConfig, function (tabConfig) {
                if (!$rootScope.hasFullAccess(tabConfig.accessRight)
                    || tabConfig.hiddenInShows && vm.event.isShow) {
                    return;
                }
                vm.activeTabs.push(tabConfig);
                if (!vm.currentTab) {
                    vm.currentTab = tabConfig.name;
                }
            });
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

        $scope.$watch('vm.myBasket', function(newValue, oldValue) {
            if (!angular.equals(newValue, oldValue)) {
                var seatArray = [];
                angular.forEach(vm.myBasket.basket, function(seat) {
                    seatArray.push(seat.seatId);
                });
                vm.event.selectedSeats = seatArray;
            }
        });

        $scope.$watch('vm.countries', function (newValue, oldValue) {
            if (!angular.equals(newValue, oldValue)) {
                angular.forEach(newValue.countries, function (country) {
                    country.phoneCodeOption = country.name + ' (+' + country.areaCode + ')';
                    country.countryOption = country.name;
                });
                if (typeof vm.reservation.contactPhoneCode == 'undefined' && vm.reservation.countryId) {
                    var country = $filter('filter')(vm.countries.countries, function (country) {
                        return country.id == vm.reservation.countryId;
                    });
                    if (country.length > 0) {
                        var contactPhoneCode = '+' + country[0].areaCode;
                        var contactCountry = {
                            id: country[0].id,
                            name: country[0].name
                        };
                        vm.defaultContactPhoneCode = contactPhoneCode;
                        vm.defaultContactCountry = contactCountry;
                        vm.reservation.contactPhoneCode = contactPhoneCode;
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
            console.log(newValue);
            console.log(oldValue);
            console.log(vm.sectorTickets);
            if (!angular.equals(newValue, oldValue)) {
                angular.forEach(newValue.tickets, function (ticket) {
                    ticket.id = ticket.seatId;
                    ticket.status = +ticket.status;
                    ticket.priceClass = ticket.priceClassId;
                });
                vm.event.seatsMapConfig.priceClasses = newValue.priceClasses;
                vm.event.seatsMapConfig.seatsInfo = newValue.tickets;
            }
            console.log(vm.event.seatsMapConfig);
        });

        //Rerender charts in overview tab when language has been changed. Other tabs' charts don't have translations.
        $rootScope.$on('$translateChangeSuccess', function () {
            if ($location.path().indexOf("report") != -1) {
                if (vm.currentTab == 'overview') {
                    graphService.renderOverviewBarGraph(vm.myOverviewBarData, vm.myOverviewBarData, vm.overviewBarGraph);
                    graphService.renderOverviewLineGraph(vm.myOverviewLineData, vm.overviewFilter, vm.overviewLineGraph);
                }
                if (vm.currentTab == 'sections') {
                    if (vm.reservation.subject == vm.defaultReservationSubject) {
                        vm.defaultReservationSubject = $translate.instant("api_reservation_email_subject" + pointService.getPointId());
                        vm.reservation.subject = vm.defaultReservationSubject;
                    }
                    if (vm.reservation.subject == vm.defaultInvitationSubject) {
                        vm.defaultInvitationSubject = $translate.instant("api_invitation_email_subject" + pointService.getPointId());
                        vm.reservation.subject = vm.defaultInvitationSubject;
                    }
                    if (vm.reservation.body == vm.defaultReservationBody) {
                        vm.defaultReservationBody = $translate.instant("api_reservation_email_body" + pointService.getPointId());
                        vm.reservation.body = vm.defaultReservationBody;
                    }
                    if (vm.reservation.body == vm.defaultInvitationBody) {
                        vm.defaultInvitationBody = $translate.instant("api_invitation_email_body" + pointService.getPointId());
                        vm.reservation.body = vm.defaultInvitationBody;
                    }
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

        $scope.$watch('vm.bookingFilter', function (newFilter, oldFilter) {
            if (oldFilter && (
                    !angular.equals(newFilter.period, oldFilter.period) ||
                    !angular.equals(newFilter.clientName, oldFilter.clientName) ||
                    !angular.equals(newFilter.bookingNr, oldFilter.bookingNr) ||
                    !angular.equals(newFilter.statusId, oldFilter.statusId) ||
                    !angular.equals(newFilter.typeId, oldFilter.typeId
                ))) {
                $rootScope.bookingSuccessAlert = false;
                eventService.getBookingsData(vm.bookingFilter);
            }
        }, true);

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
        });

    }

})();