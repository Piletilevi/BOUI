(function() {
    'use strict';

	app.controller('AuthController', function ($scope, $rootScope, $routeParams, $location, $http, Data) {
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
			console.log("test");
			Data.get('logout').then(function (results) {
				Data.page(results);
				$location.path('login');
			});
		}
	});

})();