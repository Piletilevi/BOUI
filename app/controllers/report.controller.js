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
    vm.event = {id: $routeParams.id, isShow: $routeParams.type == 'show'};

	vm.getEventInfo = eventService.getEventInfo;
    vm.getEventSalesReport = eventService.getEventSalesReport;
    vm.getEventSales = eventService.getEventSales;
    vm.filter = {period: {startDate: moment().subtract(7, 'days'), endDate: moment().add(1, 'years')}, name: ''};
    vm.overviewFilter = {period: {startDate:null, endDate: null}, display: 'tickets', groupBy: 'day'};
    // Min & Max dates get from api when ready on the backend
    vm.minFilterDate = moment().subtract(7, 'days');
    vm.maxFilterDate = moment();
    vm.reset_search = false;
	vm.overviewBarGraph = graphService.overviewBarGraph;
	vm.overviewLineGraph = graphService.overviewLineGraph;

	eventService.getEventInfo(vm.event);
    eventService.getEventSales(vm.event);

	vm.getEventOpSales = function () {
      if(vm.reset_search) {
        vm.filter.name = '';
      }
      vm.reset_search = true;
      localStorage.setItem('reportsFilter', JSON.stringify(vm.filter));
      localStorage.setItem('resetSearch', JSON.stringify(vm.reset_search));
      $location.path('dashboard');
    };
	
	vm.setOverviewDisplay = function(display) {
		vm.overviewFilter.display = display;
	}

	vm.setOverviewGroupBy = function(groupBy) {
		vm.overviewFilter.groupBy = groupBy;
	}
		
	/* watchers */
    $scope.$watch(
      function () {
		vm.myOverviewBarData = eventService.myOverviewData();
		vm.myOverviewLineData = eventService.myOverviewGraphData();
      }
    );

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

    $scope.$watch('vm.overviewFilter.display', function (newValue, oldValue) {
      if (!angular.equals(newValue, oldValue)) {
		  if (vm.myOverviewGraphData == null) {
			eventService.getOverviewGraphData(vm.event, vm.overviewFilter);
		  } else {
			graphService.renderOverviewLineGraph(vm.myOverviewGraphData, vm.overviewFilter, vm.overviewLineGraph);
		  }
      }
    });

    $scope.$watch('vm.overviewFilter.groupBy', function (newValue, oldValue) {
      if (!angular.equals(newValue, oldValue)) {
		  eventService.getOverviewGraphData(vm.event, vm.overviewFilter);
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
		vm.minFilterDate = vm.overviewFilter.period.startDate;
		vm.maxFilterDate = vm.overviewFilter.period.endDate;
		eventService.getOverviewData(vm.event, vm.overviewFilter);
		eventService.getOverviewGraphData(vm.event, vm.overviewFilter);
      }
    });

    $scope.$watch('vm.overviewFilter.period', function (newPeriod, oldPeriod) {
	  if (newPeriod !== oldPeriod) {
		eventService.getOverviewData(vm.event, vm.overviewFilter);
		eventService.getOverviewGraphData(vm.event, vm.overviewFilter);
      }
    });

  }

})();