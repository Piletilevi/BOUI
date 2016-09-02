(function() {
    'use strict';

	angular.module('boApp')
        .controller('MainController', MainController);

	function MainController (authService) {
		//initially set those objects to null to avoid undefined error
        var vm = this;
        vm.login = {};
        vm.signup = {};

		vm.doLogin = authService.login;

	}

})();