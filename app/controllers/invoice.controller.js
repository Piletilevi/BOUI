(function () {
    'use strict';
    angular.module('boApp')
        .controller('invoiceController', InvoiceController);

    InvoiceController.$inject = ['$scope', '$rootScope', '$routeParams', '$location', 'eventService', '$cookies'];

    function InvoiceController($scope, $rootScope, $routeParams, $location, eventService, $cookies) {
        var vm = this;
        vm.view = {
            name: $routeParams.viewName ? $routeParams.viewName : 'events',
            currentEvent: null,
            currentTransaction: null
        };

        $scope.$watch(
            function () {
                vm.myEvents = eventService.myInvoiceEvents();
                vm.myTransactions = eventService.myInvoiceTransactions();
                vm.view.currentEvent = eventService.currentInvoiceEvent();
                vm.view.currentTransaction = eventService.currentInvoiceTransaction();
            }
        );

        vm.defaultStartDate = moment().subtract(1, 'days');
        vm.defaultEndDate = moment().subtract(1, 'days');
        if (vm.view.name == "transactions") {
            vm.view.currentEvent = eventService.currentInvoiceEvent();
            if (vm.view.currentEvent == null) {
                var tempFilter = {
                    name: 'cid:' + $routeParams.eventId,
                    loadingItems: false
                };
                eventService.getInvoiceEvents(tempFilter);
            }
            if (vm.view.currentEvent != null) {
                vm.defaultStartDate = vm.view.currentEvent.sellPeriod.start;
                vm.defaultEndDate = vm.view.currentEvent.sellPeriod.end;
            }
        }
        vm.eventsFilter = {
            period: {startDate: vm.defaultStartDate, endDate: vm.defaultEndDate},
            name: '',
            promoter: '',
            loadingItems: false,
            start: 0,
            limit: 20
        };
        setDateUtcOffset(vm.eventsFilter);
        vm.transactionsFilter = {
            period: {startDate: vm.defaultStartDate, endDate: vm.defaultEndDate},
            loadingItems: false,
            concertId: 0,
            start: 0,
            limit: 20
        };
        setDateUtcOffset(vm.transactionsFilter);

        if (angular.equals(vm.view.name, "events")) {
            vm.currentFilter = angular.copy(vm.eventsFilter);
        }
        else if (angular.equals(vm.view.name, "transactions")) {
            vm.currentFilter = angular.copy(vm.transactionsFilter);
        }

        vm.goToEvents = function () {
            eventService.goToEvents();
        };
        vm.goToEventTransactions = function (event) {
            vm.view.name = "transactions";
            eventService.goToEventTransactions(event);
        };
        vm.setCurrentTransaction = function (transaction) {
            vm.view.currentTransaction = transaction;
        };

        vm.getMoreEvents = function () {
            eventService.getMoreInvoiceEvents(vm.currentFilter);
        };
        vm.getMoreTransactions = function () {
            eventService.getMoreInvoiceTransactions(vm.currentFilter);
        };

        vm.getTransactionDate = function (transaction) {
            transaction.dateString = eventService.getDateFromUnix(transaction.datetime);
        };
        vm.getTransactionTime = function (transaction) {
            transaction.timeString = eventService.getTimeFromUnix(transaction.datetime);
        };


        var userListener = $scope.$watch('$root.user', function () {
            if ($rootScope.user) {
                userListener();
                if (angular.equals(vm.view.name, "events")) {
                    if (angular.isUndefined(vm.eventsFilter)) {
                        vm.eventsFilter = angular.copy(vm.currentFilter);
                        eventService.getInvoiceEvents(vm.eventsFilter);
                    }
                }
                else if (angular.equals(vm.view.name, "transactions")) {
                    if (angular.isUndefined(vm.transactionsFilter)) {
                        vm.transactionsFilter = angular.copy(vm.currentFilter);
                        eventService.getInvoiceEvents(vm.transactionsFilter);
                    }
                }
            }
        });
        $scope.$watch('$root.user.point', function (newValue, oldValue) {
            if (newValue && oldValue && newValue !== oldValue) {
                eventService.resetInvoice();
                if (angular.equals(vm.view.name, "events")) {
                    eventService.getInvoiceEvents(vm.eventsFilter);
                }
                else if (angular.equals(vm.view.name, "transactions")) {
                    eventService.getInvoiceEvents(vm.transactionsFilter);
                }
            }
        });

        $scope.$watch('$routeParams.eventId', function (newValue, oldValue) {
            if($routeParams.eventId > 0 && (vm.view.currentEvent == null || !angular.equals($routeParams.eventId, vm.view.currentEvent.id))) {
                vm.view.currentEvent = {
                    id: $routeParams.eventId,
                    isShow: false
                };
                vm.transactionsFilter.concertId = $routeParams.eventId;
                eventService.getInvoiceTransactions(vm.transactionsFilter);
            }
        });

        $scope.$watch('vm.currentFilter', function (newEventsFilter, oldEventsFilter) {
            if (angular.isUndefined(vm.currentFilter) || angular.isUndefined(newEventsFilter)) {
                return;
            }
            if (angular.equals(vm.view.name, "events")) {
                if (!angular.equals(oldEventsFilter.period, vm.eventsFilter.period) ||
                    !angular.equals(oldEventsFilter.name, vm.eventsFilter.name) ||
                    !angular.equals(oldEventsFilter.promoter, vm.eventsFilter.promoter)) {
                    vm.eventsFilter = angular.copy(newEventsFilter);
                    eventService.resetInvoice(vm.view.name);
                    eventService.getInvoiceEvents(vm.eventsFilter);
                }
            }
            else if (angular.equals(vm.view.name, "transactions")) {
                if (!angular.equals(oldEventsFilter.period, vm.transactionsFilter.period)) {
                    vm.transactionsFilter = angular.copy(newEventsFilter);
                    eventService.resetInvoice(vm.view.name);
                    eventService.getInvoiceTransactions(vm.transactionsFilter);
                }
            }
        });

        $scope.$watch('vm.eventsFilter.period', function (newPeriod, oldPeriod) {
            if (!angular.isUndefined(oldPeriod) && !angular.equals(newPeriod, oldPeriod)) {
                assignEventsFilter();
            }
        });
        $scope.$watch('vm.eventsFilter.name', function (newFilter, oldFilter) {
            if (newFilter !== oldFilter && vm.reset_search) {
                vm.reset_search = false;
            }
        });
        $scope.$watch('vm.eventsFilter.promoter', function (newFilter, oldFilter) {
            if (newFilter !== oldFilter && vm.reset_search) {
                vm.reset_search = false;
            }
        });

        $scope.$watch('vm.transactionsFilter.period', function (newPeriod, oldPeriod) {
            if (!angular.isUndefined(oldPeriod) && !angular.equals(newPeriod, oldPeriod)) {
                assignTransactionsFilter();
            }
        });

        vm.search = function () {
            if (vm.reset_search) {
                vm.eventsFilter.name = '';
                vm.eventsFilter.promoter = '';
                vm.reset_search = false;
            }
            else {
                vm.reset_search = true;
            }
            assignEventsFilter();
        };

        function setDateUtcOffset (filter) {
            var startDateUtcOffset = moment(filter.period.startDate).utcOffset();
            filter.period.startDate = moment(filter.period.startDate).utc().add(startDateUtcOffset, 'm').startOf('day');
            var endDateUtcOffset = moment(filter.period.endDate).utcOffset();
            filter.period.endDate = moment(filter.period.endDate).utc().add(endDateUtcOffset, 'm').endOf('day');
        }

        function assignEventsFilter() {
            vm.currentFilter = vm.eventsFilter;
            if ($location.path().indexOf("invoices") == -1) {
                $location.path('invoices');
            }
        }
        function assignTransactionsFilter() {
            vm.currentFilter = vm.transactionsFilter;
            if ($location.path().indexOf("invoices") == -1) {
                $location.path('invoices');
            }
        }
    }
})();