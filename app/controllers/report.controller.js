(function () {

  'use strict';

  angular.module('boApp')
    .controller('reportController', ReportController);

  ReportController.$inject = ['$scope', '$routeParams', '$location', '$anchorScroll', 'eventService', 'graphService'];

  function ReportController($scope, $routeParams, $location, $anchorScroll, eventService, graphService) {

    if (!$routeParams && !$routeParams.id) {
      $location.path('dashboard');
    }

    //scroll to top
    $location.hash('top');
    $anchorScroll();

    //initially set those objects to null to avoid undefined error
    var vm = this;
    var prevFilterName = null;
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
        seatsInfo: [
          {"id": 3735584, "row": "7", "place": "8", "price": "31.00", "available": true, "priceClass": 2}
        ],
        priceClasses: [
          {
            id: 1,
            color: 'rgb(255, 98, 92)',
            price: 10
          },
          {
            id: 2,
            color: 'rgb(244, 207, 74)',
            price: 20
          }
        ],
        sectionId: 37311,
        mapWidth: 388,
        mapHeight: 250
      }
    };

    vm.getEventSales = eventService.getEventSales;
	vm.getConcertSales = eventService.getConcertSales;
	vm.getShowSales = eventService.getShowSales;
	vm.getMoreRelatedEvents = eventService.getMoreRelatedEvents;
	vm.hasMoreRelatedEvents = eventService.hasMoreRelatedEvents;
    vm.filter = {period: {startDate: moment().subtract(7, 'days'), endDate: moment().add(1, 'years')}, name: ''};
    vm.overviewFilter = {period: {startDate: null, endDate: null}, display: 'tickets', groupBy: 'day'};
    vm.pricetypeFilter = {period: {startDate: null, endDate: null}, display: 'tickets', pieDisplay: 'tickets', groupBy: 'day'};
    vm.priceclassFilter = {
      period: {startDate: null, endDate: null},
      pieDisplay: 'tickets',
      display: 'tickets',
      groupBy: 'day'
    };
    vm.sectorsFilter = {period: {startDate: null, endDate: null}};
    // Min & Max dates get from api when ready on the backend
    vm.minFilterDate = moment();
    vm.maxFilterDate = moment().subtract(7, 'days');
    vm.reset_search = false;
    vm.overviewBarGraph = graphService.overviewBarGraph;
    vm.overviewLineGraph = graphService.overviewLineGraph;
    vm.pricetypePieGraph = graphService.pricetypePieGraph;
    vm.pricetypeLineGraph = graphService.pricetypeLineGraph;
    vm.priceclassPieGraph = graphService.priceclassPieGraph;
    vm.priceclassLineGraph = graphService.priceclassLineGraph;

	//Initialize
    eventService.getEventInfo(vm.event);
    eventService.getEventSales(vm.event);
    eventService.getRelatedEvents(vm.event);

    vm.getEventOpSales = function () {
      if (vm.reset_search) {
        vm.filter.name = '';
      }
      vm.reset_search = true;
      localStorage.setItem('reportsFilter', JSON.stringify(vm.filter));
      localStorage.setItem('resetSearch', JSON.stringify(vm.reset_search));
      $location.path('dashboard');
    };

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
        eventService.getPriceClassData(vm.event, vm.priceclassFilter);
        eventService.getPriceClassGraphData(vm.event, vm.priceclassFilter);
      } else if (tab == 'sectors') {
        eventService.getSectorsData(vm.event, vm.sectorsFilter);
      }

      currentTab = tab;
    };

    var currentTab = 'overview';
    vm.getCurrentTabCode = function() {
      if(currentTab == 'overview') {
        return 'api_' + currentTab;
      }else {
        return 'api_by_' + currentTab;
      }
    }

    vm.setSelectedSectionId = function (selectedSectionId) {
      $scope.selectedSectionId = selectedSectionId;
    };


    /* watchers */
    $scope.$watch(
      function () {
        vm.myOverviewBarData = eventService.myOverviewData();
        vm.myOverviewLineData = eventService.myOverviewGraphData();
        vm.myPriceTypePieData = eventService.myPriceTypeData();
        vm.myPriceTypeLineData = eventService.myPriceTypeGraphData();
        vm.myPriceClassPieData = eventService.myPriceClassData();
        vm.myPriceClassLineData = eventService.myPriceClassGraphData();
        vm.mySectorsData = eventService.mySectorsData();
		vm.relatedEvents = eventService.relatedEvents();
      }
    );

    $scope.$watch('selectedSectionId', function (newValue, oldValue) {
      if (newValue && !angular.equals(newValue, oldValue)) {
        vm.event.seatsMapConfig.sectionId = newValue;
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

    $scope.$watch('vm.filter.period', function (newPeriod, oldPeriod) {
      if (newPeriod !== oldPeriod) {
        localStorage.setItem('reportsFilter', JSON.stringify(vm.filter));
        localStorage.setItem('resetSearch', JSON.stringify(vm.reset_search));
        $location.path('dashboard');
      }
    });

    $scope.$watch('vm.filter.name', function (newFilter, oldFilter) {
      if (newFilter !== oldFilter) {
        vm.reset_search = false;
      }
    });

    $scope.$watch('vm.event.sellPeriod', function (newSellPeriod, oldSellPeriod) {
      if (newSellPeriod !== oldSellPeriod) {
        vm.overviewFilter.period.startDate = moment(newSellPeriod.start);
        vm.overviewFilter.period.endDate = moment(newSellPeriod.end);
        vm.pricetypeFilter.period.startDate = moment(newSellPeriod.start);
        vm.pricetypeFilter.period.endDate = moment(newSellPeriod.end);
        vm.priceclassFilter.period.startDate = moment(newSellPeriod.start);
        vm.priceclassFilter.period.endDate = moment(newSellPeriod.end);
        vm.sectorsFilter.period.startDate = moment(newSellPeriod.start);
        vm.sectorsFilter.period.endDate = moment(newSellPeriod.end);
        vm.minFilterDate = vm.overviewFilter.period.startDate;
        vm.maxFilterDate = vm.overviewFilter.period.endDate;

        vm.tabSelectEvent('overview');
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
        var sections = newValue.map(function(s) {return s.sectorId;});
        vm.event.sectionsMapConfig.sections = sections;
        vm.event.sectionsMapConfig.enabledSections = sections;
      }
    });

    $scope.$watch('vm.overviewFilter.period', function (newPeriod, oldPeriod) {
      if (newPeriod !== oldPeriod) {
        vm.tabSelectEvent('overview');
      }
    });

    $scope.$watch('vm.sectorsFilter.period', function (newPeriod, oldPeriod) {
      if (newPeriod !== oldPeriod) {
        vm.tabSelectEvent('sectors');
      }
    });

  }

})();