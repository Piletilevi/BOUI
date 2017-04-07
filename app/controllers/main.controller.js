(function() {
    'use strict';

	angular.module('boApp')
        .controller('mainController', MainController);

    MainController.$inject=['authService', '$location', '$scope', '$rootScope'];
    function MainController (authService, $location, $scope, $rootScope) {
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

        // Filter

        function assingEventsFilter() {
            $rootScope.eventsFilter = angular.copy(vm.filter);
            if ($location.path().indexOf("dashboard") == -1) {
                $location.path('dashboard');
            }
        }

        vm.filter = {
            period: {startDate: moment().subtract(30, 'days'), endDate: moment().add(1, 'years')},
            name: '',
            loadingItems: false,
            groupByShow: false
        };

        var startDateUtcOffset = moment(vm.filter.period.startDate).utcOffset();
        vm.filter.period.startDate = moment(vm.filter.period.startDate).utc().add(startDateUtcOffset, 'm').startOf('day');

        var endDateUtcOffset = moment(vm.filter.period.endDate).utcOffset();
        vm.filter.period.endDate = moment(vm.filter.period.endDate).utc().add(endDateUtcOffset, 'm').endOf('day');


        $rootScope.eventsFilter = angular.copy(vm.filter);

        $scope.$watch('vm.filter.period', function (newPeriod, oldPeriod) {
            if (!angular.isUndefined(oldPeriod) && !angular.equals(newPeriod, oldPeriod)) {
                assingEventsFilter();
            }
        });

        $scope.$watch('vm.filter.name', function (newFilter, oldFilter) {
            if (newFilter !== oldFilter && vm.reset_search) {
                vm.reset_search = false;
            }
        });

        vm.search = function () {
            if (vm.reset_search) {
                vm.filter.name = '';
                vm.reset_search = false;
            }
            else {
                vm.reset_search = true;
            }
            assingEventsFilter();
        };
	}

})();