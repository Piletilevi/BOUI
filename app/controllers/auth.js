(function() {
    'use strict';
    angular.module('boApp').controller('AuthController',AuthController);

	function AuthController ($rootScope, $location, $route, Data) {
		//initially set those objects to null to avoid undefined error
        var vm = this;
        vm.login = {};
        vm.signup = {};

		this.doLogin = function (customer) {
			Data.post('login', {
				customer: customer
			}).then(function (results) {
				Data.page(results);
				if (results.status == "success") {
					$location.path('dashboard');
				}
			});
		};
		vm.logout = function () {
			Data.get('logout').then(function (results) {

				Data.page(results);
				Data.get('session').then(function (results) {
					if (!results.user) {
						$rootScope.user = null;
						$rootScope.authenticated = false;
						$location.path('login');
						$route.reload();
					}});
			});
		}
	}

})();