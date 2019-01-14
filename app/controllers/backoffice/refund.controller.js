(function () {

    'use strict';

    angular.module('boApp')
        .controller('refundController', RefundController);

    RefundController.$inject = ['$scope', '$rootScope', '$routeParams', 'paymentService'];

    function RefundController($scope, $rootScope, $routeParams, paymentService) {

        var vm = this;
		vm.resetButton = false;
		vm.rows = null;
		
		$scope.$watch(
            function () {
            }
        );
		
		vm.validate = function () {
			if (vm.rows && vm.rows.length > 0) {
				var clone = vm.rows.slice(1);
				paymentService.refundValidate(clone);
			}
        };		
		
		vm.process = function () {
			if (vm.rows && vm.rows.length > 0) {
				var clone = vm.rows.slice(1);
				paymentService.refundProcess(clone);
			}
        };		

        $scope.$watch('vm.rows', function (newValue, oldValue) {
            if (!angular.isUndefined(oldValue) && !angular.equals(newValue, oldValue)) {				
            }
        });

        $scope.$watch('vm.resetButton', function (newValue, oldValue) {
            if (!angular.isUndefined(oldValue) && !angular.equals(newValue, oldValue) && newValue == true) {
				vm.rows = null;
            }
        });
    }

})();