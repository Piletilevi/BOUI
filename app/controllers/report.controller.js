(function() {

    'use strict';

	angular.module('boApp')
        .controller('reportController', ReportController);

    ReportController.$inject=['$scope', '$routeParams', '$location', 'eventService'];

	function ReportController ($scope, $routeParams, $location, eventService) {
		if (!$routeParams && !$routeParams.id) {
			$location.path('dashboard');
		}
		
		//initially set those objects to null to avoid undefined error
        var vm = this;
		vm.event = {id: $routeParams.id, isShow: $routeParams.type == 'show'};
		vm.filter = {period: {startDate: moment().subtract(7, 'days'), endDate: moment()}, name: ''};
		
		eventService.getEventSales(vm.event, vm.filter);

		vm.getMyEvents = eventService.getMyEvents;
		vm.getEventSales = eventService.getEventSales;

		$scope.$watch(
            function() {
				
            }
        );
	}

})();