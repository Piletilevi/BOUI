(function () {
    'use strict';

    angular
        .module('boApp')
        .factory('invoiceService', InvoiceService);

    InvoiceService.$inject = ['$rootScope', 'dataService', '$filter', '$window', '$interval'];

    function InvoiceService($rootScope, dataService, $filter, $window, $interval ) {

        var myInvoiceEvents = null;
        var myInvoiceTransactions = null;
        var currentInvoiceTransaction = null;
        var currentInvoiceEvent = null;

        var invoicesSent = {
            sent: false,
            message: ""
        };

        var service = {
            myInvoiceEvents: function () {
                return myInvoiceEvents;
            },
            myInvoiceTransactions: function () {
                return myInvoiceTransactions;
            },
            currentInvoiceTransaction: function () {
                return currentInvoiceTransaction
            },
            currentInvoiceEvent: function () {
                return currentInvoiceEvent;
            },
            invoicesSent: function () {
                return invoicesSent;
            },
            reset: reset,
            getInvoiceEvents: getInvoiceEvents,
            getMoreInvoiceEvents: getMoreInvoiceEvents,
            getMoreInvoiceTransactions: getMoreInvoiceTransactions,
            goToInvoiceEvents: goToInvoiceEvents,
            goToEventTransactions: goToEventTransactions,
            getInvoiceTransactions: getInvoiceTransactions,
            getInvoiceTransactionInfo: getInvoiceTransactionInfo,
            setTransactionsInfo: setTransactionsInfo,
            setTransactionDateTime: setTransactionDateTime,
            setCurrentInvoiceEvent: setCurrentInvoiceEvent,
            removeCurrentTransaction: removeCurrentTransaction,
            saveInvoiceTransactionInfo: saveInvoiceTransactionInfo,
            deleteInvoiceInfo: deleteInvoiceInfo,
            sendInvoiceEmail: sendInvoiceEmail,
            downloadInvoice: downloadInvoice,
            openInvoice: openInvoice
        };
        return service;

        function reset(view) {
            myInvoiceEvents = null;
            myInvoiceTransactions = null;
            currentInvoiceTransaction = null;
            invoicesSent.sent = false;
            invoicesSent.message = "";
            if (!angular.equals(view, "transactions")) {
                currentInvoiceEvent = null;
            }
        }

        function goToInvoiceEvents() {
            reset("events");
            $window.location.href = "#/invoices/";
        }

        function goToEventTransactions(event) {
            setCurrentInvoiceEvent(event);
            $window.location.href = "#/invoices/" + event.id + "/transactions";
        }

        function getInvoiceEvents(filter) {
            if (filter == null) {
                return;
            }
            if (filter.loadingItems) {
                return;
            }
            filter.loadingItems = true;
            var dataFilter = filter;
            setUtcOffset(dataFilter);
            dataService.post('invoiceEvents', {filter: dataFilter}).then(function (results) {
                dataService.page(results);
                myInvoiceEvents = results != undefined && results.status == 'success' ? results.events : [];
                if (results != undefined && results.status == 'success') {
                    setInvoiceEventPromoters(myInvoiceEvents,results.promoters);
                    if (!angular.equals(currentInvoiceEvent, myInvoiceEvents[0])) {
                        setCurrentInvoiceEvent(myInvoiceEvents[0]);
                    }
                }
                filter.loadingItems = false;
            });
        }
        function getMoreInvoiceEvents(filter) {
            if (filter == null) {
                return;
            }
            if (filter.loadingItems) {
                return;
            }
            if (myInvoiceEvents != null && myInvoiceEvents.length > 0) {
                if (myInvoiceEvents.length % 5 == 0 && filter.start != myInvoiceEvents.length + 1) {
                    filter.loadingItems = true;
                    filter.start = myInvoiceEvents.length + 1;
                    var dataFilter = filter;
                    setUtcOffset(dataFilter);
                    dataService.post('invoiceEvents', {filter: dataFilter}).then(function (results) {
                        if (results != undefined && results.status == 'success') {
                            setInvoiceEventPromoters(results.events,results.promoters);
                            results.events.forEach(function (eventItem) {
                                if (myInvoiceEvents !== null ) {
                                    myInvoiceEvents.push(eventItem);
                                }
                            });
                        }
                        filter.loadingItems = false;
                    });
                }
            }
        }
        function setCurrentInvoiceEvent(event) {
            currentInvoiceEvent = event;
        }
        function setInvoiceEventPromoters(events,promoters) {
            events.forEach(function (event) {
                promoters.forEach(function (promoter) {
                    if (event.promoterId == promoter.id) {
                        event.promoter = promoter;
                    }
                });
            });
        }

        function getInvoiceTransactions(filter) {
            if (filter == null) {
                return;
            }
            if (filter.loadingItems) {
                return;
            }
            filter.start = 0;
            filter.limit = 20;
            if (filter.concertId > 0) {
                filter.loadingItems = true;
                var dataFilter = filter;
                setUtcOffset(dataFilter);
                dataService.post('invoiceTransactions', {filter: dataFilter}).then(function (results) {
                    dataService.page(results);
                    myInvoiceTransactions = results != undefined && results.status == 'success' ? results.data : [];
                    if (results != undefined && results.status == 'success') {
                        setTransactionsInfo(myInvoiceTransactions);
                    }
                    filter.loadingItems = false;
                });
            }
        }

        function getMoreInvoiceTransactions(filter) {
            if (filter == null) {
                return;
            }
            if (filter.loadingItems) {
                return;
            }
            if (filter.noMoreTransactions) {
                return;
            }
            if (myInvoiceTransactions != null && myInvoiceTransactions.length > 0) {
                filter.loadingItems = true;
                if (filter.start == 0) {
                    filter.start = filter.limit + 1;
                } else {
                    filter.start = filter.start + filter.limit;
                }
                var dataFilter = filter;
                setUtcOffset(dataFilter);
                dataService.post('invoiceTransactions', {filter: dataFilter}).then(function (results) {
                    dataService.page(results);
                    var moreTransactions = results != undefined && results.status == 'success' ? results.data : [];
                    if (results != undefined && results.status == 'success') {
                        filter.noMoreTransactions = false;
                        myInvoiceTransactions = combineTransactionInfoArrays(myInvoiceTransactions,moreTransactions);
                        setTransactionsInfo(myInvoiceTransactions);
                    }
                    else filter.noMoreTransactions = true;
                    filter.loadingItems = false;
                });
            }
        }
        function combineTransactionInfoArrays(baseArray,newArray) {
            var result = baseArray.map(val => {
                const newValue = newArray.filter(v => v.transactionId === val.transactionId)[0];
                var index = newArray.indexOf(newValue);
                if (index > -1) {
                    newArray.splice(index, 1);
                }
                if (typeof(newValue) != "undefined") {
                    newValue.amount = newValue.amount + val.amount;
                    newValue.total = newValue.total + val.total;
                    const newprices = val.prices.map( priceObj =>{
                        const price = newValue.prices.filter(p => p.price === priceObj.price)[0];
                        if (typeof(price) != "undefined"){
                            price.amount = price.amount +  priceObj.amount;
                        }
                        return Object.assign({}, priceObj, price);
                    });
                    newValue.prices = newprices;
                }
                return Object.assign({}, val, newValue);
            });
            result = result.concat(newArray);
            return result;
        }

        function getInvoiceTransactionInfo(filter,transaction) {
            if (filter.loadingItems) {
                return;
            }
            currentInvoiceTransaction = transaction;
            if (filter.concertId > 0 && filter.transactionId > 0) {
                filter.loadingItems = true;
                dataService.post('invoiceInfo', {filter: filter}).then(function (results) {
                    dataService.page(results);
                    currentInvoiceTransaction.info = results != undefined && results.status == 'success' ? results.data : [];
                    setTransactionDetails(currentInvoiceTransaction.info);
                    filter.loadingItems = false;
                });
            }
        }

        function saveInvoiceTransactionInfo(transaction) {
            if (transaction.loadingItems) {
                return;
            }
            currentInvoiceTransaction = transaction;
            if (currentInvoiceEvent.id > 0 && currentInvoiceTransaction.transactionId > 0) {
                transaction.loadingItems = true;
                dataService.post('invoiceSave', {filter: transaction}).then(function (results) {
                    dataService.page(results);
                    transaction.deleteAlert = false;
                    transaction.sendAlert = false;
                    transaction.saveAlert = true;
                    transaction.saveMessage = "";
                    $interval( function(){ transaction.saveAlert = false; }, 5000);
                    if (results != undefined && results.status == 'success' ){
                        currentInvoiceTransaction.info.saveResults = results.status;
                        transaction.saveMessage = results.status;
                        updateTransaction(transaction,results);
                    }
                    else currentInvoiceTransaction.info.saveResults = [];
                    transaction.loadingItems = false;
                });
            }
        }

        function deleteInvoiceInfo(transaction) {
            if (transaction.loadingItems) {
                return;
            }
            currentInvoiceTransaction = transaction;
            if (currentInvoiceEvent.id > 0
                && currentInvoiceTransaction.transactionId > 0
                && currentInvoiceTransaction.info.invoiceInfoId > 0) {
                transaction.loadingItems = true;
                dataService.post('invoiceDelete', {filter: transaction}).then(function (results) {
                    dataService.page(results);
                    transaction.saveAlert = false;
                    transaction.sendAlert = false;
                    transaction.deleteAlert = true;
                    transaction.deleteMessage = "";
                    $interval( function(){ transaction.deleteAlert = false; }, 5000);
                    if (results != undefined && results.status == 'success' ){
                        currentInvoiceTransaction.info.saveResults = results.status;
                        transaction.deleteMessage = results.status;
                        updateTransaction(transaction,results);
                    }
                    else currentInvoiceTransaction.info.saveResults =  [];
                    transaction.loadingItems = false;

                });
            }
        }
        //myInvoiceTransactions
        function sendInvoiceEmail(invoiceInfoIds) {
            dataService.post('invoiceSend', {filter: invoiceInfoIds}).then(function (results) {
                dataService.page(results);
                invoicesSent.sent = true;
                invoicesSent.message = "";
                $interval( function(){ invoicesSent.sent = false; }, 5000);
                if (invoiceInfoIds.length == 1) {
                    angular.forEach(myInvoiceTransactions, function(transaction) {
                        if (angular.equals(transaction.invoiceInfoId,invoiceInfoIds[0])) {
                            transaction.deleteAlert = false;
                            transaction.saveAlert = false;
                            transaction.sendAlert = true;
                            transaction.sendMessage = "";
                            $interval( function(){ transaction.sendAlert = false; }, 5000);
                        }
                    });
                }
                if (results != undefined && results.status != null && results.status != undefined ){
                    invoicesSent.message = results.status;
                    if (invoiceInfoIds.length == 1) {
                        angular.forEach(myInvoiceTransactions, function(transaction) {
                            if (angular.equals(transaction.invoiceInfoId,invoiceInfoIds[0])) {
                                transaction.sendMessage = results.status;
                            }
                        });
                    }
                }
            });
        }

        function openInvoice(invoiceInfoId, url) {
            $window.open(url + '/invoiceOpen?invoiceInfoId=' + invoiceInfoId);
        }
        function downloadInvoice(invoiceInfoId, url) {
            $window.open(url + '/invoiceDownload?invoiceInfoId=' + invoiceInfoId);
        }

        function updateTransaction(transaction,newData) {
            if(newData != undefined && newData.invoiceInfoId != undefined ) {
                transaction.invoiceStatus = newData.invoiceStatus;
                transaction.statusLabel = newData.statusLabel;
                transaction.invoiceInfoId = newData.invoiceInfoId;
                transaction.info.invoiceInfoId = newData.invoiceInfoId;
                transaction.info.invoiceStatus = newData.invoiceStatus;
                transaction.info.statusLabel = newData.statusLabel;
                transaction.buyerName = newData.buyerName;
            }
            setTransactionLabel(transaction);
        }

        function removeCurrentTransaction() {
            currentInvoiceTransaction = null;
        }

        function setTransactionDetails(transactionDetails) {
            setTransactionDateTime(transactionDetails,transactionDetails.invoiceDate);
            if (transactionDetails.products) {
                if (transactionDetails.products.extra) {
                    transactionDetails.products.extraItems = [];
                    transactionDetails.products.extra.sort(compareProducts);
                    mergeProducts(transactionDetails.products.extra,transactionDetails.products.extraItems);
                }
                if (transactionDetails.products.delivery) {
                    transactionDetails.products.deliveryItems = [];
                    transactionDetails.products.delivery.sort(compareProducts);
                    mergeProducts(transactionDetails.products.delivery,transactionDetails.products.deliveryItems);
                }
                if (transactionDetails.products.fee) {
                    transactionDetails.products.feeItems = [];
                    transactionDetails.products.fee.sort(compareProducts);
                    mergeProducts(transactionDetails.products.fee,transactionDetails.products.feeItems);
                }
            }
        }

        function setTransactionsInfo(transactionsList) {
            angular.forEach(transactionsList, function(transactionItem) {
                setTransactionDateTime(transactionItem,transactionItem.datetime);
                setTransactionLabel(transactionItem);
            });
        }
        function setTransactionLabel(transactionItem){
            if (angular.equals(transactionItem.invoiceStatus, "generated")) {
                transactionItem.labelStyle = "primary";
            }
            else if (angular.equals(transactionItem.invoiceStatus, "sent")) {
                transactionItem.labelStyle = "success";
            }
            else if (angular.equals(transactionItem.invoiceStatus, "deleted")) {
                transactionItem.labelStyle = "danger";
            }
            else {
                transactionItem.labelStyle = "default";
            }
        };
        function setTransactionDateTime(transactionItem,unixField) {
            transactionItem.dateString = getDateFromUnix(unixField);
            transactionItem.timeString = getTimeFromUnix(unixField);
        }
        function getDateFromUnix(unixTime) {
            var date = new Date(unixTime*1000);
            var year = date.getFullYear();
            var month = "0" + (date.getMonth() + 1);
            var day = "0" + date.getDate();
            var formattedDate = day.substr(-2) + "." + month.substr(-2) + "." + year;
            return formattedDate;
        }
        function getTimeFromUnix(unixTime) {
            var date = new Date(unixTime*1000);
            var hours = "0" + date.getHours();
            var minutes = "0" + date.getMinutes();
            var formattedTime = hours.substr(-2) + ":" + minutes.substr(-2);
            return formattedTime;
        }

        function compareProducts(a,b) {
            if (a.productName < b.productName)
                return -1;
            if (a.productName > b.productName)
                return 1;
            return 0;
        }
        function mergeProducts(inputArray,outputArray) {
            var newElement = {itemName:null,persistent:null,priceTotal:0,amount:0};
            for (var i = 0; i < inputArray.length; i++) {
                if (inputArray[i].productName != newElement.itemName) {
                    newElement = {
                        itemName:inputArray[i].productName,
                        persistent:inputArray[i].isPersistent,
                        priceTotal:inputArray[i].price,
                        amount:1
                    };
                    outputArray.push(newElement);
                } else {
                    newElement.amount++;
                    newElement.priceTotal += inputArray[i].price;
                }
            }
        }

        function setUtcOffset(filter) {
            if (filter.period) {
                filter.period.startDate = moment(filter.period.startDate).utc().add(moment(filter.period.startDate).utcOffset(), 'm');
                filter.period.endDate = moment(filter.period.endDate).utc().add(moment(filter.period.endDate).utcOffset(), 'm');
            }
        }
    };

})();