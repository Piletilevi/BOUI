(function() {
    'use strict';
    angular.module('boApp').controller('AuthController',AuthController);
	 function AuthController ($scope, $rootScope, $routeParams, $location, $http, Data) {
		//initially set those objects to null to avoid undefined error
		$scope.login = {};
		$scope.signup = {};

		$scope.doLogin = function (customer) {
			Data.post('login', {
				customer: customer
			}).then(function (results) {
				Data.page(results);
				if (results.status == "success") {
					$location.path('dashboard');
				}
			});
		};
		$scope.logout = function () {
			Data.get('logout').then(function (results) {
				Data.page(results);
				$location.path('login');
			});
		}
	}

})();