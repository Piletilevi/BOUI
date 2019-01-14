(function () {

    'use strict';

    angular
        .module('boApp')
        .factory('paymentService', PaymentService);

    PaymentService.$inject = ['$rootScope', '$translate', 'dataService'];

    function PaymentService($rootScope, $translate, dataService) {

        var jobs = null;
        var jobPriorities = null;
        var jobFrequencies = null;

        var service = {
            jobs: function () {
                return jobs
            },
            jobPriorities: function () {
                return jobPriorities
            },
            jobFrequencies: function () {
                return jobFrequencies
            },
			refundValidate: refundValidate,
			refundProcess: refundProcess,
			fetchJobs: fetchJobs
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

        function refundValidate(filter) {
            dataService.post('refundValidate', {filter: filter}).then(function (results) {
                dataService.page(results);
                if (results.status == 'success') {
                    jobs = results.status == 'success' ? results.data : [];
                }
            });
			filter.loadingItems = false;
        }
		
        function refundProcess(filter) {
            dataService.post('refundProcess', {filter: filter}).then(function (results) {
                dataService.page(results);
                if (results.status == 'success') {
                    jobs = results.status == 'success' ? results.data : [];
                }
            });
			filter.loadingItems = false;
        }
    }
})();
