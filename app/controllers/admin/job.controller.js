(function () {

    'use strict';

    angular.module('boApp')
        .controller('jobController', JobController);

    JobController.$inject = ['$scope', '$rootScope', '$routeParams', 'jobService'];

    function JobController($scope, $rootScope, $routeParams, jobService) {

        var vm = this;
		vm.resetButton = false;
		
        vm.init = function () {
			vm.jobs = null;
			vm.jobFilter = {
				name : '',
				status : '',
				priorityId: '',
				frequencyId: ''
			};
        };
		
		vm.init();
		jobService.fetchJobPriorities();
		jobService.fetchJobFrequencies();
		jobService.fetchJobs(vm.jobFilter);

        vm.search = function () {
			jobService.fetchJobs(vm.jobFilter);
        };
		
		vm.resetSearch = function () {
			vm.init();
			jobService.fetchJobs(vm.jobFilter);
        };

        vm.getMoreJobs = function () {
			jobService.fetchMoreJobs(vm.jobFilter);
        };

		$scope.$watch(
            function () {
                vm.jobPriorities = jobService.jobPriorities();
                vm.jobFrequencies = jobService.jobFrequencies();
				vm.jobs = jobService.jobs();
            }
        );

        $scope.$watch('vm.jobFilter.priorityId', function (newValue, oldValue) {
            if (!angular.isUndefined(oldValue) && !angular.equals(newValue, oldValue)) {
				vm.resetButton = true;
                vm.search();
            }
        });
		
        $scope.$watch('vm.resetButton', function (newValue, oldValue) {
            if (!angular.isUndefined(oldValue) && newValue == false) {
				vm.resetSearch();
            }
        });

        $scope.$watch('vm.jobFilter.frequencyId', function (newValue, oldValue) {
            if (!angular.isUndefined(oldValue) && !angular.equals(newValue, oldValue)) {
				vm.resetButton = true;
                vm.search();
            }
        });

        $scope.$watch('vm.jobFilter.name', function (newValue, oldValue) {
            if (!angular.isUndefined(oldValue) && !angular.equals(newValue, oldValue) && newValue !=='') {
				vm.resetButton = true;
            }
        });

        $scope.$watch('vm.jobFilter.status', function (newValue, oldValue) {
            if (!angular.isUndefined(oldValue) && !angular.equals(newValue, oldValue) && newValue !=='') {
				vm.resetButton = true;
            }
        });
    }

})();