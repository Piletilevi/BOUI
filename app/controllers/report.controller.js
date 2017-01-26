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

    /* Section map dummy config */

    vm.sectionsMapConfig = {
      type: 'sections',
      confId: 110,
      sectionMapType: 'vector',
      sections: [9159, 36521, 36522],
      enabledSections: [9159, 36521, 36522]
    };

    /* Seats map dummy config */

    vm.seatsMapConfig = {
      type: 'seats',
      confId: 110,
      sectionMapType: 'vector',
      sections: [9159, 36521, 36522],
      enabledSections: [9159, 36521, 36522],
      seatsInfo: [{"id":3735584,"row":"7","place":"8","price":"31.00","available":true,"priceClass":2},{"id":3735583,"row":"7","place":"7","price":"31.00","available":true,"priceClass":2},{"id":3735582,"row":"7","place":"6","price":"31.00","available":true,"priceClass":2},{"id":3735581,"row":"7","place":"5","price":"31.00","available":true,"priceClass":2},{"id":3735561,"row":"7","place":"4","price":false,"available":false,"priceClass":0},{"id":3735560,"row":"7","place":"3","price":false,"available":false,"priceClass":0},{"id":3735559,"row":"7","place":"2","price":false,"available":false,"priceClass":0},{"id":3735558,"row":"7","place":"1","price":false,"available":false,"priceClass":0},{"id":3735547,"row":"6","place":"10","price":"31.00","available":true,"priceClass":2},{"id":3735546,"row":"6","place":"9","price":"31.00","available":true,"priceClass":2},{"id":3735545,"row":"6","place":"8","price":"31.00","available":true,"priceClass":2},{"id":3735544,"row":"6","place":"7","price":"31.00","available":true,"priceClass":2},{"id":3735543,"row":"6","place":"6","price":"31.00","available":true,"priceClass":2},{"id":3735525,"row":"6","place":"5","price":false,"available":false,"priceClass":0},{"id":3735524,"row":"6","place":"4","price":false,"available":false,"priceClass":0},{"id":3735523,"row":"6","place":"3","price":false,"available":false,"priceClass":0},{"id":3735522,"row":"6","place":"2","price":false,"available":false,"priceClass":0},{"id":3735521,"row":"6","place":"1","price":false,"available":false,"priceClass":0},{"id":3735511,"row":"5","place":"28","price":"44.00","available":true,"priceClass":1},{"id":3735510,"row":"5","place":"27","price":"44.00","available":true,"priceClass":1},{"id":3735509,"row":"5","place":"26","price":"44.00","available":true,"priceClass":1},{"id":3735508,"row":"5","place":"25","price":"44.00","available":true,"priceClass":1},{"id":3735507,"row":"5","place":"24","price":"44.00","available":true,"priceClass":1},{"id":3735506,"row":"5","place":"23","price":"44.00","available":true,"priceClass":1},{"id":3735505,"row":"5","place":"22","price":"44.00","available":true,"priceClass":1},{"id":3735504,"row":"5","place":"21","price":"44.00","available":true,"priceClass":1},{"id":3735503,"row":"5","place":"20","price":"44.00","available":true,"priceClass":1},{"id":3735502,"row":"5","place":"19","price":"44.00","available":true,"priceClass":1},{"id":3735501,"row":"5","place":"18","price":"44.00","available":true,"priceClass":1},{"id":3735500,"row":"5","place":"17","price":"44.00","available":true,"priceClass":1},{"id":3735499,"row":"5","place":"16","price":"44.00","available":true,"priceClass":1},{"id":3735498,"row":"5","place":"15","price":"44.00","available":true,"priceClass":1},{"id":3735495,"row":"5","place":"14","price":"44.00","available":true,"priceClass":1},{"id":3735494,"row":"5","place":"13","price":"44.00","available":true,"priceClass":1},{"id":3735493,"row":"5","place":"12","price":"44.00","available":true,"priceClass":1},{"id":3735492,"row":"5","place":"11","price":"44.00","available":true,"priceClass":1},{"id":3735491,"row":"5","place":"10","price":"44.00","available":true,"priceClass":1},{"id":3735490,"row":"5","place":"9","price":"44.00","available":true,"priceClass":1},{"id":3735489,"row":"5","place":"8","price":"44.00","available":true,"priceClass":1},{"id":3735488,"row":"5","place":"7","price":"44.00","available":true,"priceClass":1},{"id":3735487,"row":"5","place":"6","price":"44.00","available":true,"priceClass":1},{"id":3735486,"row":"5","place":"5","price":"44.00","available":true,"priceClass":1},{"id":3735485,"row":"5","place":"4","price":"44.00","available":true,"priceClass":1},{"id":3735484,"row":"5","place":"3","price":"44.00","available":true,"priceClass":1},{"id":3735483,"row":"5","place":"2","price":"44.00","available":true,"priceClass":1},{"id":3735482,"row":"5","place":"1","price":"44.00","available":true,"priceClass":1},{"id":3735474,"row":"4","place":"28","price":false,"available":false,"priceClass":0},{"id":3735473,"row":"4","place":"27","price":false,"available":false,"priceClass":0},{"id":3735472,"row":"4","place":"26","price":false,"available":false,"priceClass":0},{"id":3735471,"row":"4","place":"25","price":false,"available":false,"priceClass":0},{"id":3735470,"row":"4","place":"24","price":false,"available":false,"priceClass":0},{"id":3735469,"row":"4","place":"23","price":false,"available":false,"priceClass":0},{"id":3735468,"row":"4","place":"22","price":false,"available":false,"priceClass":0},{"id":3735467,"row":"4","place":"21","price":false,"available":false,"priceClass":0},{"id":3735466,"row":"4","place":"20","price":false,"available":false,"priceClass":0},{"id":3735465,"row":"4","place":"19","price":false,"available":false,"priceClass":0},{"id":3735464,"row":"4","place":"18","price":false,"available":false,"priceClass":0},{"id":3735463,"row":"4","place":"17","price":false,"available":false,"priceClass":0},{"id":3735462,"row":"4","place":"16","price":false,"available":false,"priceClass":0},{"id":3735461,"row":"4","place":"15","price":false,"available":false,"priceClass":0},{"id":3735458,"row":"4","place":"14","price":false,"available":false,"priceClass":0},{"id":3735457,"row":"4","place":"13","price":false,"available":false,"priceClass":0},{"id":3735456,"row":"4","place":"12","price":false,"available":false,"priceClass":0},{"id":3735455,"row":"4","place":"11","price":false,"available":false,"priceClass":0},{"id":3735454,"row":"4","place":"10","price":false,"available":false,"priceClass":0},{"id":3735453,"row":"4","place":"9","price":false,"available":false,"priceClass":0},{"id":3735452,"row":"4","place":"8","price":false,"available":false,"priceClass":0},{"id":3735451,"row":"4","place":"7","price":false,"available":false,"priceClass":0},{"id":3735450,"row":"4","place":"6","price":false,"available":false,"priceClass":0},{"id":3735449,"row":"4","place":"5","price":false,"available":false,"priceClass":0},{"id":3735448,"row":"4","place":"4","price":false,"available":false,"priceClass":0},{"id":3735447,"row":"4","place":"3","price":false,"available":false,"priceClass":0},{"id":3735446,"row":"4","place":"2","price":false,"available":false,"priceClass":0},{"id":3735445,"row":"4","place":"1","price":false,"available":false,"priceClass":0},{"id":3735437,"row":"3","place":"30","price":"44.00","available":true,"priceClass":1},{"id":3735436,"row":"3","place":"29","price":"44.00","available":true,"priceClass":1},{"id":3735435,"row":"3","place":"28","price":"44.00","available":true,"priceClass":1},{"id":3735434,"row":"3","place":"27","price":"44.00","available":true,"priceClass":1},{"id":3735433,"row":"3","place":"26","price":"44.00","available":true,"priceClass":1},{"id":3735432,"row":"3","place":"25","price":"44.00","available":true,"priceClass":1},{"id":3735431,"row":"3","place":"24","price":"44.00","available":true,"priceClass":1},{"id":3735430,"row":"3","place":"23","price":"44.00","available":true,"priceClass":1},{"id":3735429,"row":"3","place":"22","price":"44.00","available":false,"priceClass":1},{"id":3735428,"row":"3","place":"21","price":"44.00","available":false,"priceClass":1},{"id":3735427,"row":"3","place":"20","price":"44.00","available":false,"priceClass":1},{"id":3735426,"row":"3","place":"19","price":"44.00","available":false,"priceClass":1},{"id":3735425,"row":"3","place":"18","price":false,"available":false,"priceClass":0},{"id":3735424,"row":"3","place":"17","price":false,"available":false,"priceClass":0},{"id":3735423,"row":"3","place":"16","price":false,"available":false,"priceClass":0},{"id":3735422,"row":"3","place":"15","price":false,"available":false,"priceClass":0},{"id":3735421,"row":"3","place":"14","price":false,"available":false,"priceClass":0},{"id":3735420,"row":"3","place":"13","price":false,"available":false,"priceClass":0},{"id":3735419,"row":"3","place":"12","price":false,"available":false,"priceClass":0},{"id":3735418,"row":"3","place":"11","price":false,"available":false,"priceClass":0},{"id":3735417,"row":"3","place":"10","price":false,"available":false,"priceClass":0},{"id":3735416,"row":"3","place":"9","price":false,"available":false,"priceClass":0},{"id":3735415,"row":"3","place":"8","price":false,"available":false,"priceClass":0},{"id":3735414,"row":"3","place":"7","price":false,"available":false,"priceClass":0},{"id":3735413,"row":"3","place":"6","price":false,"available":false,"priceClass":0},{"id":3735412,"row":"3","place":"5","price":false,"available":false,"priceClass":0},{"id":3735411,"row":"3","place":"4","price":false,"available":false,"priceClass":0},{"id":3735410,"row":"3","place":"3","price":false,"available":false,"priceClass":0},{"id":3735409,"row":"3","place":"2","price":false,"available":false,"priceClass":0},{"id":3735408,"row":"3","place":"1","price":false,"available":false,"priceClass":0},{"id":3735403,"row":"2","place":"35","price":"31.00","available":true,"priceClass":2},{"id":3735402,"row":"2","place":"34","price":"31.00","available":true,"priceClass":2},{"id":3735401,"row":"2","place":"33","price":"44.00","available":true,"priceClass":1},{"id":3735400,"row":"2","place":"32","price":"44.00","available":true,"priceClass":1},{"id":3735398,"row":"2","place":"31","price":"44.00","available":true,"priceClass":1},{"id":3735397,"row":"2","place":"30","price":"44.00","available":true,"priceClass":1},{"id":3735396,"row":"2","place":"29","price":"44.00","available":true,"priceClass":1},{"id":3735395,"row":"2","place":"28","price":"44.00","available":true,"priceClass":1},{"id":3735394,"row":"2","place":"27","price":"44.00","available":true,"priceClass":1},{"id":3735393,"row":"2","place":"26","price":"44.00","available":true,"priceClass":1},{"id":3735392,"row":"2","place":"25","price":"44.00","available":false,"priceClass":1},{"id":3735391,"row":"2","place":"24","price":"44.00","available":false,"priceClass":1},{"id":3735390,"row":"2","place":"23","price":"44.00","available":false,"priceClass":1},{"id":3735389,"row":"2","place":"22","price":"44.00","available":false,"priceClass":1},{"id":3735388,"row":"2","place":"21","price":false,"available":false,"priceClass":0},{"id":3735387,"row":"2","place":"20","price":false,"available":false,"priceClass":0},{"id":3735386,"row":"2","place":"19","price":false,"available":false,"priceClass":0},{"id":3735385,"row":"2","place":"18","price":false,"available":false,"priceClass":0},{"id":3735384,"row":"2","place":"17","price":false,"available":false,"priceClass":0},{"id":3735383,"row":"2","place":"16","price":false,"available":false,"priceClass":0},{"id":3735382,"row":"2","place":"15","price":false,"available":false,"priceClass":0},{"id":3735381,"row":"2","place":"14","price":false,"available":false,"priceClass":0},{"id":3735380,"row":"2","place":"13","price":false,"available":false,"priceClass":0},{"id":3735379,"row":"2","place":"12","price":false,"available":false,"priceClass":0},{"id":3735378,"row":"2","place":"11","price":false,"available":false,"priceClass":0},{"id":3735377,"row":"2","place":"10","price":false,"available":false,"priceClass":0},{"id":3735376,"row":"2","place":"9","price":false,"available":false,"priceClass":0},{"id":3735375,"row":"2","place":"8","price":false,"available":false,"priceClass":0},{"id":3735374,"row":"2","place":"7","price":false,"available":false,"priceClass":0},{"id":3735373,"row":"2","place":"6","price":false,"available":false,"priceClass":0},{"id":3735372,"row":"2","place":"5","price":false,"available":false,"priceClass":0},{"id":3735370,"row":"2","place":"4","price":false,"available":false,"priceClass":0},{"id":3735369,"row":"2","place":"3","price":false,"available":false,"priceClass":0},{"id":3735368,"row":"2","place":"2","price":false,"available":false,"priceClass":0},{"id":3735367,"row":"2","place":"1","price":false,"available":false,"priceClass":0},{"id":3735633,"row":"1","place":"36","price":"31.00","available":false,"priceClass":2},{"id":3735626,"row":"1","place":"35","price":"31.00","available":false,"priceClass":2},{"id":3735366,"row":"1","place":"34","price":"31.00","available":false,"priceClass":2},{"id":3735365,"row":"1","place":"33","price":"31.00","available":false,"priceClass":2},{"id":3735364,"row":"1","place":"32","price":"44.00","available":false,"priceClass":1},{"id":3735363,"row":"1","place":"31","price":"44.00","available":false,"priceClass":1},{"id":3735361,"row":"1","place":"30","price":"44.00","available":false,"priceClass":1},{"id":3735360,"row":"1","place":"29","price":"44.00","available":false,"priceClass":1},{"id":3735359,"row":"1","place":"28","price":"44.00","available":false,"priceClass":1},{"id":3735358,"row":"1","place":"27","price":"44.00","available":false,"priceClass":1},{"id":3735357,"row":"1","place":"26","price":"44.00","available":false,"priceClass":1},{"id":3735356,"row":"1","place":"25","price":"44.00","available":false,"priceClass":1},{"id":3735355,"row":"1","place":"24","price":"44.00","available":false,"priceClass":1},{"id":3735354,"row":"1","place":"23","price":"44.00","available":false,"priceClass":1},{"id":3735353,"row":"1","place":"22","price":"44.00","available":false,"priceClass":1},{"id":3735352,"row":"1","place":"21","price":"44.00","available":false,"priceClass":1},{"id":3735350,"row":"1","place":"20","price":false,"available":false,"priceClass":0},{"id":3735349,"row":"1","place":"19","price":false,"available":false,"priceClass":0},{"id":3735348,"row":"1","place":"18","price":false,"available":false,"priceClass":0},{"id":3735347,"row":"1","place":"17","price":false,"available":false,"priceClass":0},{"id":3735346,"row":"1","place":"16","price":false,"available":false,"priceClass":0},{"id":3735345,"row":"1","place":"15","price":false,"available":false,"priceClass":0},{"id":3735344,"row":"1","place":"14","price":false,"available":false,"priceClass":0},{"id":3735343,"row":"1","place":"13","price":false,"available":false,"priceClass":0},{"id":3735342,"row":"1","place":"12","price":false,"available":false,"priceClass":0},{"id":3735341,"row":"1","place":"11","price":false,"available":false,"priceClass":0},{"id":3735340,"row":"1","place":"10","price":false,"available":false,"priceClass":0},{"id":3735339,"row":"1","place":"9","price":false,"available":false,"priceClass":0},{"id":3735338,"row":"1","place":"8","price":false,"available":false,"priceClass":0},{"id":3735337,"row":"1","place":"7","price":false,"available":false,"priceClass":0},{"id":3735335,"row":"1","place":"6","price":false,"available":false,"priceClass":0},{"id":3735334,"row":"1","place":"5","price":false,"available":false,"priceClass":0},{"id":3735333,"row":"1","place":"4","price":false,"available":false,"priceClass":0},{"id":3735332,"row":"1","place":"3","price":false,"available":false,"priceClass":0},{"id":3735331,"row":"1","place":"2","price":false,"available":false,"priceClass":0},{"id":3735330,"row":"1","place":"1","price":false,"available":false,"priceClass":0}],
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
      sectionId: 36521,
      mapWidth: 388,
      mapHeight: 250
    };
		
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