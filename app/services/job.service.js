(function () {

    'use strict';

    angular
        .module('boApp')
        .factory('jobService', JobService);

    JobService.$inject = ['$rootScope', '$translate', 'dataService'];

    function JobService($rootScope, $translate, dataService) {

        var jobs = null;
        var jobPriorities = null;
        var jobFrequencies = null;
        var jobsCount = null;

        var service = {
            jobs: function () {
                return jobs
            },
            jobsCount: function () {
                return jobsCount
            },
            jobPriorities: function () {
                return jobPriorities
            },
            jobFrequencies: function () {
                return jobFrequencies
            },
			fetchJobs: fetchJobs,
			fetchJobsCount: fetchJobsCount,
			fetchMoreJobs: fetchMoreJobs,
			fetchJobPriorities: fetchJobPriorities,
			fetchJobFrequencies: fetchJobFrequencies
        };
        return service;

        function fetchJobs(filter) {
            dataService.post('getJobs', {filter: filter}).then(function (results) {
                dataService.page(results);
                if (results.status == 'success') {
                    jobs = results.status == 'success' ? results.data : [];
                }
            });
			filter.loadingItems = false;
        }

        function fetchJobsCount() {
            dataService.post('getJobsCount').then(function (results) {
                dataService.page(results);
                if (results.status == 'success') {
                    jobsCount = results.status == 'success' ? results.data : [];
                }
            });
        }
		
		function fetchMoreJobs(filter) {
			if (filter == null) {
                return;
            }
            if (filter.loadingItems) {
                return;
            }
			
			filter.loadingItems = true;
			filter.start = jobs.length + 1;
			dataService.post('getJobs', {filter: filter}).then(function (results) {
				if (results.status == 'success') {
					results.data.forEach(function (jobItem) {
						if (jobs !== null ) {
							jobs.push(jobItem);
						}
					});
				}
				filter.loadingItems = false;
			});
        }
		
        function fetchJobPriorities() {
            dataService.post('getJobPriorities').then(function (results) {
                dataService.page(results);
                if (results.status == 'success') {
                    jobPriorities = results.data;
                }
            });
        }
		
        function fetchJobFrequencies() {
            dataService.post('getJobFrequencies').then(function (results) {
                dataService.page(results);
                if (results.status == 'success') {
                    jobFrequencies = results.data;
                }
            });
        }
		
    }
})();
