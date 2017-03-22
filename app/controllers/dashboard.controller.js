(function () {

    'use strict';

    angular.module('boApp')
        .controller('dashboardController', DashboardController);

    DashboardController.$inject = ['$scope', '$rootScope', 'eventService', 'newsService', '$location', '$anchorScroll'];

    function DashboardController($scope, $rootScope, eventService, newsService, $location, $anchorScroll) {
        //initially set those objects to null to avoid undefined error
        var vm = this;
        vm.news = [];
        vm.salesCount = 0;
        vm.draftCount = 0;
        vm.pastCount = 0;
        vm.reset_search = false;
        vm.getEventSalesReport = eventService.getEventSalesReport;
        vm.tabActive = 'onsale';

        vm.tabSelectEvent = function (status) {
            vm.filter.status = status;
            eventService.getMyEvents(vm.filter);

            var toggler = angular.element("#onSaleToggler");
            if (status == 'onsale') {
                toggler.show();
            } else {
                toggler.hide();
            }
        };

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

        $rootScope.$watch('user', function () {
            if($rootScope.user) {
                if (!$rootScope.hasFullAccess('api_reports_dashboard_tab_on_sale')) {
                    vm.tabActive = 'draft';
                }
                if (!$rootScope.hasFullAccess('api_reports_dashboard_tab_not_active')
                    && !$rootScope.hasFullAccess('api_reports_dashboard_tab_on_sale')) {
                    vm.tabActive = 'past';
                }
                if (!$rootScope.hasFullAccess('api_reports_dashboard_tab_not_active')
                    && !$rootScope.hasFullAccess('api_reports_dashboard_tab_on_sale')
                    && !$rootScope.hasFullAccess('api_reports_dashboard_tab_past')) {
                    vm.tabActive = false;
                }


                vm.filter = {
                    period: {startDate: moment().subtract(1, 'years'), endDate: moment().add(1, 'years')},
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
                    eventService.getMyEvents(vm.filter);
                    localStorage.removeItem('reportsFilter');
                }

                //scroll to top
                $location.hash('top');
                $anchorScroll();

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
            if (!angular.isUndefined(oldPeriod) && newPeriod !== oldPeriod) {
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