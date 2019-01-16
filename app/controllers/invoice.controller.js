(function () {
    'use strict';
    angular.module('boApp')
        .controller('invoiceController', InvoiceController);

    InvoiceController.$inject = ['$scope', '$rootScope', '$routeParams', '$location', 'eventService', 'dataService', '$cookies'];

    function InvoiceController($scope, $rootScope, $routeParams, $location, eventService, dataService, $cookies) {
        var vm = this;
        const defaultLimit = 10 ;
        //check rights
        if (!$rootScope.hasFullAccess('api_invoices')
            || $rootScope.getValuePointParam('api_invoices') !== 'true'
            || !$rootScope.isPointSuperCentre()){
            $location.path('dashboard');
        }
        vm.view = {
            name: $routeParams.viewName ? $routeParams.viewName : 'events',
            currentEvent: null,
            currentTransaction: null,
            invoicesSentAlert: false,
            selectedTransactions: []
        };
        $scope.$watch(
            function () {
                vm.myEvents = eventService.myInvoiceEvents();
                vm.myTransactions = eventService.myInvoiceTransactions();
                vm.view.currentEvent = eventService.currentInvoiceEvent();
                vm.view.currentTransaction = eventService.currentInvoiceTransaction();
                vm.view.invoicesSentAlert = eventService.invoicesSent();
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
            limit: defaultLimit
        };
        setDateUtcOffset(vm.eventsFilter);
        vm.transactionsFilter = {
            period: {startDate: vm.defaultStartDate, endDate: vm.defaultEndDate},
            loadingItems: false,
            concertId: 0
        };
        setDateUtcOffset(vm.transactionsFilter);
        if (angular.equals(vm.view.name, "events")) {
            vm.currentFilter = angular.copy(vm.eventsFilter);
            if($cookies.getObject('boInvoiceTransactionsFilter')) {
                $cookies.remove('boInvoiceTransactionsFilter');
            }
            if($cookies.getObject('boInvoiceEventsFilter')) {
                vm.currentFilter = $cookies.getObject('boInvoiceEventsFilter').filter;
                vm.reset_search = $cookies.getObject('boInvoiceEventsFilter').resetSearch;
                setDateUtcOffset(vm.currentFilter);
            }
        }
        else if (angular.equals(vm.view.name, "transactions")) {
            vm.currentFilter = angular.copy(vm.transactionsFilter);
            if($cookies.getObject('boInvoiceTransactionsFilter')) {
                vm.currentFilter = $cookies.getObject('boInvoiceTransactionsFilter').filter;
                setDateUtcOffset(vm.currentFilter);
            }
        }

        vm.goToEvents = function () {
            eventService.goToInvoiceEvents();
        };
        vm.goToEventTransactions = function (event) {
            vm.view.name = "transactions";
            eventService.goToEventTransactions(event);
        };
        vm.setCurrentTransaction = function (transaction) {
            vm.view.currentTransaction = transaction;
            vm.view.currentTransaction.saveAlert = false;
            vm.view.currentTransaction.deleteAlert = false;
            eventService.getInvoiceTransactionInfo({concertId:vm.view.currentEvent.id,transactionId:vm.view.currentTransaction.transactionId},transaction);
        };
        vm.removeCurrentTransaction = function () {
            vm.view.currentTransaction = null;
            eventService.removeCurrentTransaction();
        };
        vm.saveTransactionInfo = function (transaction) {
            eventService.saveInvoiceTransactionInfo(transaction);
        };
        vm.deleteInvoiceInfo = function (transaction) {
            if ( transaction.info.invoiceInfoId > 0 ) {
                eventService.deleteInvoiceInfo(transaction);
            }
        };
        vm.sendInvoiceEmail = function (transaction) {
            eventService.sendInvoiceEmail([transaction.invoiceInfoId]);
        };
        vm.invoiceDownload = function (transaction) {
            dataService.getApiUrl().then(function(results) {
                if (results.status === "success") {
                    eventService.downloadInvoice(transaction.invoiceInfoId, results.apiBaseUrl);
                }
            });
        };
        vm.invoiceOpen = function (transaction) {
            dataService.getApiUrl().then(function(results) {
                if (results.status === "success") {
                    eventService.openInvoice(transaction.invoiceInfoId, results.apiBaseUrl);
                }
            });
        };

        vm.sendSelectedInvoiceEmails = function () {
            var invoiceIds = vm.view.selectedTransactions.map(val => {
                const selectedTransaction = vm.myTransactions.filter(v =>(v.transactionId === val && v.invoiceInfoId !==0))[0];
                if (typeof(selectedTransaction) != "undefined")
                    return selectedTransaction.invoiceInfoId;
            }).filter(val=> (typeof(val) != "undefined"));
            eventService.sendInvoiceEmail(invoiceIds);
        };

        vm.viewInvoiceReport = function(){
            var boBaseUrl = '';
            dataService.getBoUrl().then(function(results) {
                if (results.status === "success") {
                    boBaseUrl = results.boBaseUrl;
                    if ($rootScope.authenticated) {
                        dataService.getIp().then(function(result) {
                            dataService.post('getYellowSessionKey',{'clientip':result.ip}).then(function (sessionResults) {
                                if (sessionResults.status === "success") {
                                    var boReportUrl = boBaseUrl.replace("{sessionkey}", sessionResults.boSession.sessionkey);
                                    boReportUrl = boReportUrl.replace("{resource}", "a_subinvoices.p");
                                    boReportUrl = boReportUrl.concat("&concertId=").concat(vm.view.currentEvent.id);
                                    var win = window.open(boReportUrl, '_blank');
                                    win.focus();
                                }
                            });
                        }, function(e) {
                            //alert("error");
                        });
                    }
                }
            });
        };

        vm.getMoreEvents = function () {
            eventService.getMoreInvoiceEvents(vm.eventsFilter);
        };
        vm.getMoreTransactions = function () {
            eventService.getMoreInvoiceTransactions(vm.transactionsFilter);
        };

        vm.getTransactionDate = function (transaction) {
            transaction.dateString = eventService.getDateFromUnix(transaction.datetime);
        };
        vm.getTransactionTime = function (transaction) {
            transaction.timeString = eventService.getTimeFromUnix(transaction.datetime);
        };

        vm.addToSelectedTransactions = function(transactionId) {
            if (!vm.isSelectedTransaction(transactionId)) {
                vm.view.selectedTransactions.push(transactionId);
            }
        };
        vm.removeFromSelectedTransactions = function(transactionId) {
            if (vm.isSelectedTransaction(transactionId)) {
                var idIndex = vm.view.selectedTransactions.findIndex(x => x == transactionId);
                vm.view.selectedTransactions.splice(idIndex,1);
            }
        };
        vm.isSelectedTransaction = function(transactionId) {
            if (vm.view.selectedTransactions.length > 0 && vm.view.selectedTransactions.findIndex(x => x == transactionId) >= 0) {
                return true;
            }
            return false;
        };
        vm.selectAllTransactions = function () {
            vm.myTransactions.forEach(function (transactionItem) {
                vm.addToSelectedTransactions(transactionItem.transactionId);
            });
        }
        vm.deselectAllTransactions = function () {
            vm.view.selectedTransactions = [];
        }

        $scope.$watch('$root.user', function () {
            if ($rootScope.user) {
                eventService.resetInvoice(vm.view.name);
                if (angular.equals(vm.view.name, "events")) {
                    eventService.getInvoiceEvents(vm.eventsFilter);
                }
                else if (angular.equals(vm.view.name, "transactions")) {
                    eventService.getInvoiceTransactions(vm.transactionsFilter);
                }
            }
        });
        $scope.$watch('$root.user.point', function (newValue, oldValue) {
            if (newValue && oldValue && newValue !== oldValue) {
                eventService.resetInvoice(vm.view.name);
                if (angular.equals(vm.view.name, "events")) {
                    eventService.getInvoiceEvents(vm.eventsFilter);
                }
                else if (angular.equals(vm.view.name, "transactions")) {
                    eventService.getInvoiceTransactions(vm.transactionsFilter);
                }
            }
        });

        $scope.$watch('vm.view.name', function (newValue, oldValue) {
            if (newValue && oldValue && newValue !== oldValue) {
                eventService.resetInvoice(vm.view.name);
                if (angular.equals(vm.view.name, "events")) {
                    eventService.getInvoiceEvents(vm.eventsFilter);
                }
                else if (angular.equals(vm.view.name, "transactions")) {
                    eventService.getInvoiceTransactions(vm.transactionsFilter);
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
                    vm.view.selectedTransactions = [];
                    eventService.resetInvoice(vm.view.name);
                    eventService.getInvoiceEvents(vm.eventsFilter);
                }
            }
            else if (angular.equals(vm.view.name, "transactions")) {
                if (!angular.equals(oldEventsFilter.period, vm.transactionsFilter.period)) {
                    vm.transactionsFilter = angular.copy(newEventsFilter);
                    vm.view.selectedTransactions = [];
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

        function setDateUtcOffset(filter) {
            var startDateUtcOffset = moment(filter.period.startDate).utcOffset();
            filter.period.startDate = moment(filter.period.startDate).utc().add(startDateUtcOffset, 'm').startOf('day');
            var endDateUtcOffset = moment(filter.period.endDate).utcOffset();
            filter.period.endDate = moment(filter.period.endDate).utc().add(endDateUtcOffset, 'm').endOf('day');
        }

        function assignEventsFilter() {
            //reset query start
            vm.eventsFilter.start = 0;
            vm.eventsFilter.limit = defaultLimit;
            $cookies.putObject('boInvoiceEventsFilter', {filter: vm.eventsFilter, resetSearch: vm.reset_search});
            vm.currentFilter = vm.eventsFilter;
            if ($location.path().indexOf("invoices") == -1) {
                $location.path('invoices');
            }
        }
        function assignTransactionsFilter() {
            vm.transactionsFilter.start = 0;
            vm.transactionsFilter.limit = defaultLimit;
            $cookies.putObject('boInvoiceTransactionsFilter', {filter: vm.transactionsFilter});
            vm.currentFilter = vm.transactionsFilter;
            if ($location.path().indexOf("invoices") == -1) {
                $location.path('invoices');
            }
        }
    }
})();