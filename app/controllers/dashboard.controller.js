(function() {

    'use strict';

	angular.module('boApp')
        .controller('dashboardController', DashboardController);

    DashboardController.$inject=['$scope', 'dashboardService', 'newsService'];

	function DashboardController ($scope, dashboardService, newsService) {
		//initially set those objects to null to avoid undefined error
        var vm = this;
        vm.news = [];
        vm.status = [];
		vm.myevents = null;
		vm.filter = {period: {startDate: moment().add(-1, 'month'), endDate: moment()}, name: ''};
		
		vm.news = newsService.news();
		vm.getMyEvents = dashboardService.getMyEvents;
		vm.getEventSales = dashboardService.getEventSales;

		$scope.$watch(
            function() {
				vm.myevents = dashboardService.myevents();
            }
        );
	}

})();