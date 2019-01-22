(function () {

    'use strict';

    angular
        .module('boApp')
        .factory('paymentService', PaymentService);

    PaymentService.$inject = ['$rootScope', '$translate', 'dataService'];

    function PaymentService($rootScope, $translate, dataService) {

        var refundRows = null;

        var service = {
            refundRows: function () {
                return refundRows
            },
			refundValidate: refundValidate,
			refundProcess: refundProcess
        };
        return service;

        function refundValidate(rows, filter) {
            dataService.post('refundValidate', {filter: rows}).then(function (results) {
                dataService.page(results);
                if (results.status == 'success') {
                    refundRows = results.status == 'success' ? results.data : [];
					filter.processed = true;
                }
            });
			filter.processed = false;
        }
		
        function refundProcess(rows, filter) {
            dataService.post('refundProcess', {filter: rows}).then(function (results) {
                dataService.page(results);
                if (results.status == 'success') {
                    refundRows = results.status == 'success' ? results.data : [];
					filter.processed = true;
                }
            });
			filter.processed = false;
        }
	}
})();
