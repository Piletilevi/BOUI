(function() {

    'use strict';

	angular.module('boApp')
        .controller('dashboardController', DashboardController);

    DashboardController.$inject=['$scope', 'dashboardService', 'newsService'];

	function DashboardController ($scope, dashboardService, newsService) {
		//initially set those objects to null to avoid undefined error
        var vm = this;
        vm.news = [];
		vm.myevents = null;
		vm.salesCount = 0;
		vm.draftCount = 0;
		vm.pastCount = 0;
		vm.filter = {period: {startDate: moment().subtract(7, 'days'), endDate: moment()}, name: ''};
		
		vm.news = newsService.news();
		vm.getMyEvents = dashboardService.getMyEvents;
		vm.getEventSales = dashboardService.getEventSales;

		$scope.$watch(
            function() {
				vm.myevents = dashboardService.myevents();
				if (vm.myevents) {
					vm.salesCount = vm.myevents.length; 
				}
            }
        );
	}

})();