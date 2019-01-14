(function () {

    'use strict';

    angular.module('boApp')
        .controller('adminController', AdminController);

    AdminController.$inject = ['$scope', '$rootScope', '$routeParams', 'jobService'];

    function AdminController($scope, $rootScope, $routeParams, jobService) {

        var vm = this;
		
		jobService.fetchJobsCount();

		$scope.$watch(
            function () {
				vm.jobsCount = jobService.jobsCount();
            }
        );
    }

})();