(function () {

    'use strict';

    angular.module('boApp')
        .controller('reportController', ReportController);

    ReportController.$inject = ['$scope', '$rootScope', '$routeParams', '$location', '$filter', 'eventService', 'graphService'];

    function ReportController($scope, $rootScope, $routeParams, $location, $filter, eventService, graphService) {

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
        vm.overviewFilter = {period: {startDate: null, endDate: null}, display: 'tickets', groupBy: 'day', centerId: ''};
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
        vm.locationsFilter = {period: {startDate: null, endDate: null}, centerId: ''};
        vm.reset_search = false;
        vm.overviewBarGraph = graphService.overviewBarGraph;
        vm.overviewLineGraph = graphService.overviewLineGraph;
        vm.pricetypePieGraph = graphService.pricetypePieGraph;
        vm.pricetypeLineGraph = graphService.pricetypeLineGraph;
        vm.priceclassPieGraph = graphService.priceclassPieGraph;
        vm.priceclassLineGraph = graphService.priceclassLineGraph;
        // vm.printPdf = pdfService.printPdf;

        //Initialize
        eventService.getEventSales(vm.event);
        eventService.getRelatedEvents(vm.event);

		vm.exportAsCsv = function(currentTab) {
			var filter;
			if (currentTab == "overview") {
				filter = vm.overviewFilter;
			} else if (currentTab == "pricetype") {
				filter = vm.pricetypeFilter;
			} else if (currentTab == "priceclass") {
				filter = vm.priceclassFilter;
			} else if (currentTab == "sectors") {
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

		vm.exportAsExcel = function(currentTab) {
			var filter;
			if (currentTab == "overview") {
				filter = vm.overviewFilter;
			} else if (currentTab == "pricetype") {
				filter = vm.pricetypeFilter;
			} else if (currentTab == "priceclass") {
				filter = vm.priceclassFilter;
			} else if (currentTab == "sectors") {
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
            } else if (tab == 'sections') {
                eventService.getSectorsData(vm.event, vm.sectorsFilter);
            }
            else if (tab == 'locations') {
                eventService.getLocationsData(vm.event, vm.locationsFilter);
            }
            if(tab != 'sections') {
                $scope.selectedSectionId = false;
            }

            vm.currentTab = tab;
            var newPath = '/report/' + $routeParams.pointId + '/' + $routeParams.type + '/' + $routeParams.id + '/' + tab;
            if (tab == 'sections' && $scope.selectedSectionId) {
                newPath += '/' + $scope.selectedSectionId;
            }
            $location.update_path(newPath);
        };

        vm.currentTab = false;

        vm.getCurrentTabCode = function () {
            if (vm.currentTab == 'overview') {
                return 'api_' + vm.currentTab;
            } else {
                return 'api_by_' + vm.currentTab;
            }
        };

        vm.setSelectedSectionId = function (selectedSectionId) {
            $scope.selectedSectionId = selectedSectionId;
            vm.event.seatsMapConfig.sectionId = selectedSectionId;
            vm.priceclassFilter.sectionId = selectedSectionId;
            eventService.getPriceClassData(vm.event, vm.priceclassFilter);
            eventService.getSectorTickets(vm.event, vm.priceclassFilter);
            $location.update_path('/report/' + $routeParams.pointId + '/' + $routeParams.type + '/' + $routeParams.id + '/sections/' + selectedSectionId + '/');
        };

        vm.resetSelectedSectionId = function (selectedSectionId) {
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
			if (vm.event != null && vm.event.salespoints != null && vm.event.salespoints.length > 1) {
				return true;
			}
			return false;
        };
		
        $scope.setSelectedSectionId = vm.setSelectedSectionId;
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
                    tab: 'booking'
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
                        if ($routeParams.sectorId) {
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
                vm.mySectorsData = eventService.mySectorsData();
                vm.myLocationsData = eventService.myLocationsData();
                vm.relatedEvents = eventService.relatedEvents();
                vm.sectorTickets = eventService.sectorTickets();
            }
        );

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
              if (vm.currentTab == 'overview'){
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
                vm.filterPeriod.startDate = moment(newSellPeriod.start);
                vm.filterPeriod.endDate = moment(newSellPeriod.end);
                vm.overviewFilter.period.startDate = moment(newSellPeriod.start);
                vm.overviewFilter.period.endDate = moment(newSellPeriod.end);
                vm.pricetypeFilter.period.startDate = moment(newSellPeriod.start);
                vm.pricetypeFilter.period.endDate = moment(newSellPeriod.end);
                vm.priceclassFilter.period.startDate = moment(newSellPeriod.start);
                vm.priceclassFilter.period.endDate = moment(newSellPeriod.end);
                vm.sectorsFilter.period.startDate = moment(newSellPeriod.start);
                vm.sectorsFilter.period.endDate = moment(newSellPeriod.end);
                vm.locationsFilter.period.startDate = moment(newSellPeriod.start);
                vm.locationsFilter.period.endDate = moment(newSellPeriod.end);
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
                vm.overviewFilter.period = vm.filterPeriod;
                vm.pricetypeFilter.period = vm.filterPeriod;
                vm.priceclassFilter.period = vm.filterPeriod;
                vm.sectorsFilter.period = vm.filterPeriod;
                vm.locationsFilter.period = vm.filterPeriod;
                vm.tabSelectEvent(vm.currentTab);
            }
        });

    }

})();