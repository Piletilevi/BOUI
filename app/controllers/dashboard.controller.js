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
		vm.filter = {period: {}, name: '', status: 'onsale', loadingItems: false};

		//scroll to top
		$location.hash('top');
		$anchorScroll();

		//vm.news = newsService.news();
		vm.search = function() {
			eventService.reset();
			eventService.getMyEvents(vm.filter);
		}
		vm.getEventSales = eventService.getEventSales;
		vm.getEventInfo = eventService.getEventInfo;
		
		eventService.getMyEvents(vm.filter);
		
		vm.tabSelectEvent = function (status) {
			vm.filter.status = status;
			eventService.getMyEvents(vm.filter);
		};

		vm.getMoreEvents = function () {
			eventService.getMoreEvents(vm.filter);
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
				eventService.reset();
				eventService.getMyEvents(vm.filter);
			}
		});
	}

})();