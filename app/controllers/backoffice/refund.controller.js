(function () {

    'use strict';

    angular.module('boApp')
        .controller('refundController', RefundController);

    RefundController.$inject = ['$scope', '$rootScope', '$routeParams', 'paymentService'];

    function RefundController($scope, $rootScope, $routeParams, paymentService) {

        var vm = this;
		vm.resetButton = false;
		vm.filter = {
			processed: false
		}
		vm.rows = null;
		vm.headers = null;
		vm.processedRows = null;
		
		vm.validate = function () {
			if (vm.rows && vm.rows.length > 0) {
				paymentService.refundValidate(vm.rows, vm.filter);
			}
        };		

		vm.process = function () {
			if (vm.rows && vm.rows.length > 0) {
				paymentService.refundProcess(vm.rows, vm.filter);
			}
        };

		vm.feedback = function () {
			vm.processedRows = paymentService.refundRows();
			if (vm.rows && vm.rows.length > 0 && vm.processedRows && vm.processedRows.rows.length > 0) {
				if (!vm.headers.includes('paymentName')) {
					vm.headers.push('paymentName');
				}
				if (!vm.headers.includes('transactionCode')) {
					vm.headers.push('transactionCode');
				}
				if (!vm.headers.includes('amount')) {
					vm.headers.push('amount');
				}
				if (!vm.headers.includes('valid')) {
					vm.headers.push('valid');
				}
				if (!vm.headers.includes('info')) {
					vm.headers.push('info');
				}
				for (var j = 0; j < vm.rows.length; j++){
					var obj = vm.rows[j];
					for (var x = 0; x < vm.processedRows.rows.length; x++){
						var processedObj = vm.processedRows.rows[x];
						if (obj.orderNr == processedObj.orderNr) {
							obj.paymentName = processedObj.paymentName;
							obj.transactionCode = processedObj.transactionCode;
							obj.amount = processedObj.amount;
							obj.valid = processedObj.valid;
							obj.info = processedObj.info;
							continue;
						}
					}
				}				
			}
			vm.processed = false;
        };
		
        $scope.$watch('vm.filter.processed', function (newValue, oldValue) {
            if (!angular.isUndefined(oldValue) && !angular.equals(newValue, oldValue) && newValue == true) {				
				vm.feedback();
            }
        });
		
        $scope.$watch('vm.resetButton', function (newValue, oldValue) {
            if (!angular.isUndefined(oldValue) && !angular.equals(newValue, oldValue) && newValue == true) {
				vm.rows = null;
				vm.processedRows = null;
            }
        });
    }
})();