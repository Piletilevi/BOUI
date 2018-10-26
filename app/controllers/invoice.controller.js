(function () {
    'use strict';
    angular.module('boApp')
        .controller('invoiceController', InvoiceController);

    InvoiceController.$inject = ['$scope', '$rootScope', '$routeParams', '$location', 'eventService', '$cookies'];

    function InvoiceController($scope, $rootScope, $routeParams, $location, eventService, $cookies) {
        var vm = this;
        vm.view = "";
        vm.eventsCount = 0;
        vm.defaultStartDate = moment().subtract(30, 'days');
        vm.defaultEndDate = moment().add(1, 'years');

        vm.filter = {
            period: {startDate: vm.defaultStartDate, endDate: vm.defaultEndDate},
            name: '',
            loadingItems: false,
            groupByShow: false,
        };

        var startDateUtcOffset = moment(vm.filter.period.startDate).utcOffset();
        vm.filter.period.startDate = moment(vm.filter.period.startDate).utc().add(startDateUtcOffset, 'm').startOf('day');

        var endDateUtcOffset = moment(vm.filter.period.endDate).utcOffset();
        vm.filter.period.endDate = moment(vm.filter.period.endDate).utc().add(endDateUtcOffset, 'm').endOf('day');

        if($cookies.getObject('boInvoicesFilter')) {
            vm.filter = $cookies.getObject('boInvoicesFilter').filter;
            vm.reset_search = $cookies.getObject('boInvoicesFilter').resetSearch;
            vm.filter.period.startDate = moment(vm.filter.period.startDate).utc().startOf('day');
            vm.filter.period.endDate = moment(vm.filter.period.endDate).utc().startOf('day');
        }

        vm.eventsFilter = angular.copy(vm.filter);

        vm.getMoreEvents = function () {
            eventService.getMoreEvents(vm.filter);
        };
        vm.goToEventTransactions = function (event) {
            eventService.goToEventTransactions(event);
        };
        vm.goToEvents = function () {
            eventService.goToEvents();
        };

        $scope.$watch(
            function () {
                vm.eventsCount = eventService.myOpenCount();
                vm.myEvents = eventService.myOpenEvents();
                $rootScope.hideEvents = false;
            }
        );

        var userListener = $scope.$watch('$root.user', function () {
            if ($rootScope.user) {
                userListener();
                if (angular.isUndefined(vm.filter)) {
                    vm.filter = angular.copy(vm.eventsFilter);
                    eventService.getMyEvents(vm.filter);
                }
            }
        });

        $scope.$watch('$routeParams.eventId', function (newValue, oldValue) {
            if($routeParams.eventId > 0) {
                vm.currentEvent = {
                    id:$routeParams.eventId,
                    isShow:false
                };
                eventService.getEventInfo(vm.currentEvent);
            }
        });

        $scope.$watch('vm.currentEvent', function (newValue, oldValue) {
            console.log(vm.currentEvent);
        });

        $scope.$watch('vm.eventsFilter', function (newEventsFilter, oldEventsFilter) {
            if (angular.isUndefined(vm.filter) || angular.isUndefined(newEventsFilter)) {
                return;
            }
            if (!angular.equals(oldEventsFilter.period, vm.filter.period) ||
                !angular.equals(oldEventsFilter.name, vm.filter.name)) {
                vm.filter = angular.copy(newEventsFilter);
                eventService.reset();
                eventService.getMyEvents(vm.filter);
            }
        });

        $scope.$watch('$root.user.point', function (newFilter, oldFilter) {
            if (newFilter && oldFilter && newFilter !== oldFilter) {
                eventService.reset();
                eventService.getMyEvents(vm.filter);
            }
        });

        function assignEventsFilter() {
            $cookies.putObject('boInvoicesFilter', {filter: vm.filter, resetSearch: vm.reset_search});
            vm.eventsFilter = angular.copy(vm.filter);
            if ($location.path().indexOf("invoices") == -1) {
                $location.path('invoices');
            }
        }

        $scope.$watch('vm.filter.period', function (newPeriod, oldPeriod) {
            if (!angular.isUndefined(oldPeriod) && !angular.equals(newPeriod, oldPeriod)) {
                assignEventsFilter();
            }
        });

        $scope.$watch('vm.filter.name', function (newFilter, oldFilter) {
            if (newFilter !== oldFilter && vm.reset_search) {
                vm.reset_search = false;
            }
        });

        $scope.$watch('vm.filter.status', function (newValue, oldValue) {
            if( vm.filter.status !== "onsale" ) {
                vm.filter.status = "onsale";
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
            assignEventsFilter();
        };
    }
})();