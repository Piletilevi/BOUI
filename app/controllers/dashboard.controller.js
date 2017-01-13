(function() {

    'use strict';

	angular.module('boApp')
        .controller('dashboardController', DashboardController);

    DashboardController.$inject=['$scope', 'eventService', 'newsService', '$location', '$anchorScroll'];

	function DashboardController ($scope, eventService, newsService, $location, $anchorScroll) {
		//initially set those objects to null to avoid undefined error
        var vm = this;
				var prevFilterName = null;
        vm.news = [];
		vm.salesCount = 0;
		vm.draftCount = 0;
		vm.pastCount = 0;

		vm.filter = {period: {startDate: moment().subtract(7, 'days'), endDate: moment().add(1, 'years')}, name: '', status: 'onsale', loadingItems: false};

		if(localStorage.getItem('reportsPeriod')) {
			vm.filter = JSON.parse(localStorage.getItem('reportsPeriod'));
			vm.filter.period.startDate = moment(vm.filter.period.startDate);
			vm.filter.period.endDate = moment(vm.filter.period.endDate);
			localStorage.removeItem('reportsPeriod');
		}

		//scroll to top
		$location.hash('top');
		$anchorScroll();

		//vm.news = newsService.news();
		vm.search = function() {
			eventService.reset();
			if(prevFilterName === vm.filter.name) {
				vm.filter.name = '';
				vm.reset_search = false;
			}
			else {}
			prevFilterName = vm.filter.name;
			eventService.getMyEvents(vm.filter);
		};

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