(function() {

    'use strict';

	angular.module('boApp')
        .controller('dashboardController', DashboardController);

    DashboardController.$inject=['$scope', 'eventService', 'newsService'];

	function DashboardController ($scope, eventService, newsService) {
		//initially set those objects to null to avoid undefined error
        var vm = this;
        vm.news = [];
		vm.myevents = null;
		vm.salesCount = 0;
		vm.draftCount = 0;
		vm.pastCount = 0;
		vm.filter = {period: {startDate: moment().subtract(7, 'days'), endDate: moment()}, name: ''};
		
		vm.news = newsService.news();
		vm.getMyEvents = eventService.getMyEvents;
		vm.getEventSales = eventService.getEventSales;

		$scope.$watch(
            function() {
				vm.myevents = eventService.myevents();
				if (vm.myevents) {
					vm.salesCount = vm.myevents.length; 
				}
            }
        );
	}

})();