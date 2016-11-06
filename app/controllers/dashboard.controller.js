(function() {

    'use strict';

	angular.module('boApp')
        .controller('dashboardController', DashboardController);

    DashboardController.$inject=['dashboardService', 'newsService'];

	function DashboardController (dashboardService, newsService) {
		//initially set those objects to null to avoid undefined error
        var vm = this;
        vm.news = [];
        vm.status = [];
		vm.filter = {period: {startDate: moment().add(-1, 'month'), endDate: moment()}, name: ''};
		
		vm.news = newsService.news();
		vm.getMyEvents = dashboardService.getMyEvents;
	}

})();