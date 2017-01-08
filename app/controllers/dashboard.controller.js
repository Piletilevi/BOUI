(function() {

    'use strict';

	angular.module('boApp')
        .controller('dashboardController', DashboardController);

    DashboardController.$inject=['$scope', 'eventService', 'newsService', '$location', '$anchorScroll'];

	function DashboardController ($scope, eventService, newsService, $location, $anchorScroll) {
		//initially set those objects to null to avoid undefined error
        var vm = this;
        vm.news = [];
		vm.salesCount = 0;
		vm.draftCount = 0;
		vm.pastCount = 0;
		vm.filter = {period: {startDate: moment().subtract(7, 'days'), endDate: moment()}, name: '', status: ''};

		//scroll to top
		$location.hash('top');
		$anchorScroll();

		//vm.news = newsService.news();
		vm.getMyEvents = eventService.getMyEvents;
		vm.getEventSales = eventService.getEventSales;
		vm.getEventInfo = eventService.getEventInfo;
		eventService.getMyEvents(vm.filter);
		
		vm.tabSelectEvent = function (status) {
			vm.filter.status = status;
			eventService.getMyEvents(vm.filter);
		};

		$scope.$watch(
            function() {
				vm.salesCount = eventService.myOpenCount();
				vm.pastCount = eventService.myPastCount();
				vm.myOpenEvents = eventService.myOpenEvents();
				vm.myPastEvents = eventService.myPastEvents();
            }
        );

		$scope.$watch('vm.filter.period', function(newPeriod, oldPeriod) {
			if(newPeriod !== oldPeriod) {
				eventService.getMyEvents(vm.filter);
			}
		});
	}

})();