(function () {

    'use strict';

    angular.module('boApp')
        .controller('backofficeController', BackofficeController);

    BackofficeController.$inject = ['$scope', '$rootScope', '$routeParams', 'paymentService'];

    function BackofficeController($scope, $rootScope, $routeParams, paymentService) {

        var vm = this;
		
        vm.init = function () {
			
        };
		
		vm.init();
		
		$scope.$watch(
            function () {
            }
        );
    }

})();