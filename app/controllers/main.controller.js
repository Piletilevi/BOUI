(function() {
    'use strict';

	angular.module('boApp')
        .controller('mainController', MainController);

    MainController.$inject=['authService'];
    function MainController (authService) {
		//initially set those objects to null to avoid undefined error
        var vm = this;
        vm.login = {};
        vm.change = {};
        vm.signup = {};
        vm.validPassword = validPassword;

		vm.doLogin = authService.login;
        vm.changePassword = authService.changePassword;

        function validPassword(password){
            if (typeof( password) !== 'undefined')
                return password.match( /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/);
            else return true;
        }

        vm.login = authService.getRememberedUser();
	}

})();