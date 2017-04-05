(function () {

    'use strict';

    angular.module('boApp')
        .controller('dashboardController', DashboardController);

    DashboardController.$inject = ['$scope', '$rootScope', '$routeParams', 'eventService', 'newsService'];

    function DashboardController($scope, $rootScope, $routeParams, eventService, newsService) {

        //initially set those objects to null to avoid undefined error
        var vm = this;
        vm.news = [];
        vm.salesCount = 0;
        vm.draftCount = 0;
        vm.pastCount = 0;
        vm.reset_search = false;
        vm.getEventSalesReport = eventService.getEventSalesReport;
        vm.tabActive = $routeParams.type ? $routeParams.type : 'onsale';

        vm.getMoreEvents = function () {
            eventService.getMoreEvents(vm.filter);
        };

        $scope.$watch(
            function () {
                vm.salesCount = eventService.myOpenCount();
                vm.pastCount = eventService.myPastCount();
                vm.draftCount = eventService.myDraftCount();
                vm.myOpenEvents = eventService.myOpenEvents();
                vm.myDraftEvents = eventService.myDraftEvents();
                vm.myPastEvents = eventService.myPastEvents();
            }
        );

        var userListener = $rootScope.$watch('user', function () {
            if($rootScope.user) {
                userListener();
                var tabs = [];
                if($rootScope.hasFullAccess('api_reports_dashboard_tab_on_sale')) {
                    tabs.push('onsale');
                }
                if($rootScope.hasFullAccess('api_reports_dashboard_tab_not_active')) {
                    tabs.push('draft');
                }
                if($rootScope.hasFullAccess('api_reports_dashboard_tab_past')) {
                    tabs.push('past');
                }

                if(tabs.indexOf(vm.tabActive) === -1) {
                    vm.tabActive = tabs[0];
                }

                vm.filter = {
                    period: {startDate: moment().subtract(30, 'days'), endDate: moment().add(1, 'years')},
                    name: '',
                    status: vm.tabActive,
                    loadingItems: false,
                    groupByShow: false
                };

                if (localStorage.getItem('reportsFilter')) {
                    vm.filter = JSON.parse(localStorage.getItem('reportsFilter'));
                    vm.filter.period.startDate = moment(vm.filter.period.startDate);
                    vm.filter.period.endDate = moment(vm.filter.period.endDate);
                    vm.reset_search = vm.filter.name && vm.filter.name.length > 0;
                    vm.filter.status = vm.tabActive;
                    localStorage.removeItem('reportsFilter');
                }

                //vm.news = newsService.news();
                vm.search = function () {
                    if (vm.reset_search) {
                        vm.filter.name = '';
                    }
                    vm.reset_search = true;
                    eventService.reset();
                    eventService.getMyEvents(vm.filter);
                };

                vm.getEventSales = eventService.getEventSales;
                vm.getEventInfo = eventService.getEventInfo;

                eventService.getMyEvents(vm.filter);
            }
        });

        $scope.$watch('vm.filter.period', function (newPeriod, oldPeriod) {
            if (!angular.isUndefined(oldPeriod) && !angular.equals(newPeriod, oldPeriod)) {
                eventService.reset();
                eventService.getMyEvents(vm.filter);
            }
        });

        $scope.$watch('vm.filter.name', function (newFilter, oldFilter) {
            if (newFilter !== oldFilter) {
                vm.reset_search = false;
            }
        });

        $scope.$watch('$root.user.point', function (newFilter, oldFilter) {
            if (newFilter && oldFilter && newFilter !== oldFilter) {
                eventService.reset();
                eventService.getMyEvents(vm.filter);
            }
        });

        $scope.$watch('vm.filter.groupByShow', function (newValue, oldValue) {
            if (!angular.isUndefined(oldValue) && newValue !== oldValue) {
                eventService.reset();
                eventService.getMyEvents(vm.filter);
            }
        });

    }

})();