(function() {
    'use strict';

	angular.module('boApp')
        .controller('MainController', MainController);

    MainController.$inject=['authService'];
    function MainController (authService) {
		//initially set those objects to null to avoid undefined error
        var vm = this;
        vm.login = {};
        vm.change = {};
        vm.signup = {};

		vm.doLogin = authService.login;
        vm.changePassword = authService.changePassword;


	}

})();