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
		vm.reset_search = false;
	    vm.getEventSalesReport = eventService.getEventSalesReport;

		vm.filter = {period: {startDate: moment().subtract(7, 'days'), endDate: moment().add(1, 'years')}, name: ''};

		if(localStorage.getItem('reportsFilter')) {
			vm.filter = JSON.parse(localStorage.getItem('reportsFilter'));
			vm.filter.period.startDate = moment(vm.filter.period.startDate);
			vm.filter.period.endDate = moment(vm.filter.period.endDate);
			localStorage.removeItem('reportsFilter');
		}

		if(localStorage.getItem('resetSearch')) {
			vm.reset_search = JSON.parse(localStorage.getItem('resetSearch'));
			localStorage.removeItem('resetSearch');
		}

		vm.filter.status = 'onsale';
		vm.filter.loadingItems = false;
		vm.filter.groupByShow = false;

		//scroll to top
		$location.hash('top');
		$anchorScroll();

		//vm.news = newsService.news();
		vm.search = function() {
			if(vm.reset_search) {
				vm.filter.name = '';
			}
			vm.reset_search = true;
			eventService.reset();
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
				vm.draftCount = eventService.myDraftCount();
				vm.myOpenEvents = eventService.myOpenEvents();
				vm.myDraftEvents = eventService.myDraftEvents();
				vm.myPastEvents = eventService.myPastEvents();
            }
        );

		$scope.$watch('vm.filter.period', function(newPeriod, oldPeriod) {
			if(newPeriod !== oldPeriod) {
				eventService.reset();
				eventService.getMyEvents(vm.filter);
			}
		});

		$scope.$watch('vm.filter.name', function (newFilter, oldFilter) {
			if (newFilter !== oldFilter) {
				vm.reset_search = false;
			}
		});

		$scope.$watch('$root.user.point', function(newFilter, oldFilter) {
			if (newFilter && oldFilter && newFilter !== oldFilter) {
				eventService.reset();
				eventService.getMyEvents(vm.filter);
			}
		});

		$scope.$watch('vm.filter.groupByShow', function (newValue, oldValue) {
			if (newValue !== oldValue) {
				eventService.reset();
				eventService.getMyEvents(vm.filter);
			}
		});

	}

})();