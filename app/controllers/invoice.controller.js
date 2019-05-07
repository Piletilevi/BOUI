(function () {
    'use strict';
    angular.module('boApp')
        .controller('invoiceController', InvoiceController);

    InvoiceController.$inject = ['$scope', '$rootScope', '$routeParams', '$location', 'dataService', '$cookies','invoiceService'];

    function InvoiceController($scope, $rootScope, $routeParams, $location, dataService, $cookies, invoiceService) {

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
                vm.myEvents = invoiceService.myInvoiceEvents();
                vm.myTransactions = invoiceService.myInvoiceTransactions();
                vm.view.currentEvent = invoiceService.currentInvoiceEvent();
                vm.view.currentTransaction = invoiceService.currentInvoiceTransaction();
                vm.view.invoicesSentAlert = invoiceService.invoicesSent();
            }
        );

        vm.defaultStartDate = moment().startOf('day').subtract(1,'day');
        vm.defaultEndDate = moment().endOf('day').subtract(1,'day');

        if (vm.view.name == "transactions") {
            vm.view.currentEvent = invoiceService.currentInvoiceEvent();
            if (vm.view.currentEvent == null) {
                var tempFilter = {
                    name: 'cid:' + $routeParams.eventId,
                    loadingItems: false
                };
                invoiceService.getInvoiceEvents(tempFilter);
            }
            if (vm.view.currentEvent != null) {
                vm.defaultStartDate = vm.view.currentEvent.sellPeriod.start;
                vm.defaultEndDate = vm.view.currentEvent.sellPeriod.end;
            }
        }
        vm.eventsFilter = {
            period: {
                startDate: vm.defaultStartDate,
                endDate: vm.defaultEndDate
            },
            name: '',
            promoter: '',
            loadingItems: false,
            start: 0,
            limit: defaultLimit
        };
        vm.transactionsFilter = {
            period: {
                startDate: vm.defaultStartDate,
                endDate: vm.defaultEndDate
            },
            loadingItems: false,
            concertId: 0,
            orderNumber: '',
            customerName: ''
        };
        if (angular.equals(vm.view.name, "events")) {
            vm.currentFilter = angular.copy(vm.eventsFilter);
            if($cookies.getObject('boInvoiceTransactionsFilter')) {
                $cookies.remove('boInvoiceTransactionsFilter');
            }
            if($cookies.getObject('boInvoiceEventsFilter')) {
                vm.currentFilter = $cookies.getObject('boInvoiceEventsFilter').filter;
                vm.reset_search = $cookies.getObject('boInvoiceEventsFilter').resetSearch;
                getDateFromString(vm.currentFilter);
            }
            vm.eventsFilter = angular.copy(vm.currentFilter);
        }
        else if (angular.equals(vm.view.name, "transactions")) {
            vm.currentFilter = angular.copy(vm.transactionsFilter);
            if($cookies.getObject('boInvoiceTransactionsFilter')) {
                vm.currentFilter = $cookies.getObject('boInvoiceTransactionsFilter').filter;
                getDateFromString(vm.currentFilter);
            } else {
                $cookies.putObject('boInvoiceTransactionsFilter', {filter: vm.currentFilter});
            }
            vm.transactionsFilter = angular.copy(vm.currentFilter);
        }

        vm.goToEvents = function () {
            invoiceService.goToInvoiceEvents();
        };
        vm.goToEventTransactions = function (event) {
            vm.view.name = "transactions";
            invoiceService.goToEventTransactions(event);
        };
        vm.setCurrentTransaction = function (transaction) {
            vm.view.currentTransaction = transaction;
            vm.view.currentTransaction.saveAlert = false;
            vm.view.currentTransaction.deleteAlert = false;
            invoiceService.getInvoiceTransactionInfo({
                    concertId:vm.view.currentEvent.id,
                    transactionId:vm.view.currentTransaction.transactionId
                },
                transaction);
        };
        vm.removeCurrentTransaction = function () {
            vm.view.currentTransaction = null;
            invoiceService.removeCurrentTransaction();
        };
        vm.saveTransactionInfo = function (transaction) {
            invoiceService.saveInvoiceTransactionInfo(transaction);
        };
        vm.deleteInvoiceInfo = function (transaction) {
            if ( transaction.info.invoiceInfoId > 0 ) {
                invoiceService.deleteInvoiceInfo(transaction);
            }
        };
        vm.sendInvoiceEmail = function (transaction) {
            invoiceService.sendInvoiceEmail([transaction.invoiceInfoId]);
        };
        vm.invoiceDownload = function (transaction) {
            dataService.getApiUrl().then(function(results) {
                if (results.status === "success") {
                    invoiceService.downloadInvoice(transaction.invoiceInfoId, results.apiBaseUrl);
                }
            });
        };
        vm.invoiceOpen = function (transaction) {
            dataService.getApiUrl().then(function(results) {
                if (results.status === "success") {
                    invoiceService.openInvoice(transaction.invoiceInfoId, results.apiBaseUrl);
                }
            });
        };

        vm.sendSelectedInvoiceEmails = function () {
            var invoiceIds = vm.view.selectedTransactions.map(val => {
                const selectedTransaction = vm.myTransactions.filter(v =>(v.transactionId === val && v.invoiceInfoId !==0))[0];
                if (typeof(selectedTransaction) != "undefined")
                    return selectedTransaction.invoiceInfoId;
            }).filter(val=> (typeof(val) != "undefined"));
            invoiceService.sendInvoiceEmail(invoiceIds);
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
            invoiceService.getMoreInvoiceEvents(vm.eventsFilter);
        };
        vm.getMoreTransactions = function () {
            invoiceService.getMoreInvoiceTransactions(vm.transactionsFilter);
        };

        vm.getTransactionDate = function (transaction) {
            transaction.dateString = invoiceService.getDateFromUnix(transaction.datetime);
        };
        vm.getTransactionTime = function (transaction) {
            transaction.timeString = invoiceService.getTimeFromUnix(transaction.datetime);
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
                invoiceService.reset(vm.view.name);
                if (angular.equals(vm.view.name, "events")) {
                    invoiceService.getInvoiceEvents(vm.eventsFilter);
                }
                else if (angular.equals(vm.view.name, "transactions")) {
                    invoiceService.getInvoiceTransactions(vm.transactionsFilter);
                }
            }
        });
        $scope.$watch('$root.user.point', function (newValue, oldValue) {
            if (newValue && oldValue && newValue !== oldValue) {
                invoiceService.reset(vm.view.name);
                if (angular.equals(vm.view.name, "events")) {
                    invoiceService.getInvoiceEvents(vm.eventsFilter);
                }
                else if (angular.equals(vm.view.name, "transactions")) {
                    invoiceService.getInvoiceTransactions(vm.transactionsFilter);
                }
            }
        });

        $scope.$watch('vm.view.name', function (newValue, oldValue) {
            if (newValue && oldValue && newValue !== oldValue) {
                invoiceService.reset(vm.view.name);
                if (angular.equals(vm.view.name, "events")) {
                    invoiceService.getInvoiceEvents(vm.eventsFilter);
                }
                else if (angular.equals(vm.view.name, "transactions")) {
                    invoiceService.getInvoiceTransactions(vm.transactionsFilter);
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
                invoiceService.getInvoiceTransactions(vm.transactionsFilter);
            }
        });

        $scope.$watch('vm.currentFilter', function (newFilter, oldFilter) {
            if (angular.isUndefined(vm.currentFilter) || angular.isUndefined(newFilter)) {
                return;
            }
            if (angular.equals(vm.view.name, "events")) {
                if (!angular.equals(oldFilter.period, newFilter.period) ||
                    !angular.equals(oldFilter.name, newFilter.name) ||
                    !angular.equals(oldFilter.promoter, newFilter.promoter)) {
                    vm.eventsFilter = angular.copy(newFilter);
                    vm.view.selectedTransactions = [];
                    invoiceService.reset(vm.view.name);
                    invoiceService.getInvoiceEvents(vm.eventsFilter);
                }
            }
            else if (angular.equals(vm.view.name, "transactions")) {
                if (!angular.equals(oldFilter.period, newFilter.period) ||
                    !angular.equals(oldFilter.orderNumber, newFilter.orderNumber) ||
                    !angular.equals(oldFilter.customerName, newFilter.customerName) ||
                    !angular.equals(oldFilter.bookingNumber, newFilter.bookingNumber) ||
                    !angular.equals(oldFilter.ticketId, newFilter.ticketId)){
                    vm.transactionsFilter = angular.copy(newFilter);
                    vm.view.selectedTransactions = [];
                    invoiceService.reset(vm.view.name);
                    invoiceService.getInvoiceTransactions(vm.transactionsFilter);
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

        vm.searchTransactions = function () {
            assignTransactionsFilter();
        };

        function getDateFromString(filter) {
            filter.period.startDate = moment(filter.period.startDate).startOf('day');
            filter.period.endDate = moment(filter.period.endDate).endOf('day').subtract(1,'day');
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
            $cookies.putObject('boInvoiceTransactionsFilter', {
                filter: vm.transactionsFilter,
            });
            vm.currentFilter = vm.transactionsFilter;
            if ($location.path().indexOf("invoices") == -1) {
                $location.path('invoices');
            }
        }
    }
})();
