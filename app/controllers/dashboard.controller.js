(function () {

    'use strict';

    angular.module('boApp')
        .controller('dashboardController', DashboardController);

    DashboardController.$inject = ['$scope', '$rootScope', '$routeParams', '$location', 'eventService', 'newsService'];

    function DashboardController($scope, $rootScope, $routeParams, $location, eventService, newsService) {

        //initially set those objects to null to avoid undefined error
        var vm = this;
        vm.news = [];
        vm.tabs = [];
        vm.salesCount = 0;
        vm.draftCount = 0;
        vm.pastCount = 0;
        vm.tabActive = $routeParams.type ? $routeParams.type : 'onsale';

        vm.getMoreEvents = function () {
            eventService.getMoreEvents(vm.filter);
        };
        vm.goToEvent = function () {
            eventService.goToEvent(user.point,event.isShow,event.id);
        }

        $scope.$watch(
            function () {
                vm.salesCount = eventService.myOpenCount();
                vm.pastCount = eventService.myPastCount();
                vm.draftCount = eventService.myDraftCount();
                vm.myOpenEvents = eventService.myOpenEvents();
                vm.myDraftEvents = eventService.myDraftEvents();
                vm.myPastEvents = eventService.myPastEvents();
                vm.events = {
                    onsale:eventService.myOpenEvents(),
                    past:eventService.myPastEvents(),
                    draft:eventService.myDraftEvents()
                };
            }
        );

        var userListener = $scope.$watch('$root.user', function () {
            if ($rootScope.user) {
                userListener();
                if ($rootScope.hasFullAccess('api_reports_dashboard_tab_on_sale')) {
                    vm.tabs.push('onsale');
                }
                if ($rootScope.hasFullAccess('api_reports_dashboard_tab_not_active')) {
                    vm.tabs.push('draft');
                }
                if ($rootScope.hasFullAccess('api_reports_dashboard_tab_past')) {
                    vm.tabs.push('past');
                }

                if (vm.tabs.indexOf(vm.tabActive) === -1) {
                    vm.tabActive = vm.tabs[0];
                }

                // vm.news = newsService.news();

                if (angular.isUndefined(vm.filter)) {
                    vm.filter = angular.copy($rootScope.eventsFilter);
                    vm.filter.status = vm.tabActive;
                    eventService.getMyEvents(vm.filter);
                }
            }
        });

        $scope.$watch('$root.eventsFilter', function (newEventsFilter, oldEventsFilter) {
            if (angular.isUndefined(vm.filter) || angular.isUndefined(newEventsFilter)) {
                return;
            }
            if (!angular.equals(newEventsFilter.period, vm.filter.period) ||
                !angular.equals(newEventsFilter.name, vm.filter.name)) {
                vm.filter = angular.copy(newEventsFilter);
                vm.filter.status = vm.tabActive;
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

        $scope.$watch('vm.filter.groupByShow', function (newValue, oldValue) {
            if (!angular.isUndefined(oldValue) && newValue !== oldValue) {
                eventService.reset();
                eventService.getMyEvents(vm.filter);
            }
        });

        $scope.$watchCollection('[vm.salesCount, vm.draftCount, vm.pastCount]', function (oldVal, newVal) {
            if(!angular.equals(oldVal, newVal)) {
                if (vm.tabActive === 'onsale' && vm.salesCount === 0) {
                    if (vm.draftCount != 0 && vm.tabs.indexOf('draft') !== -1) {
                        vm.tabActive = 'draft';
                        $location.path('dashboard/' + vm.tabActive);
                    }
                    else if (vm.pastCount != 0 && vm.tabs.indexOf('past') !== -1) {
                        vm.tabActive = 'past';
                        $location.path('dashboard/' + vm.tabActive);
                    }
                }
                else if (vm.tabActive === 'draft' && vm.draftCount === 0) {
                    if (vm.salesCount != 0 && vm.tabs.indexOf('onsale') !== -1) {
                        vm.tabActive = 'onsale';
                        $location.path('dashboard/' + vm.tabActive);
                    }
                    else if (vm.pastCount != 0 && vm.tabs.indexOf('past') !== -1) {
                        vm.tabActive = 'past';
                        $location.path('dashboard/' + vm.tabActive);
                    }
                }
                else if (vm.tabActive === 'past' && vm.pastCount === 0) {
                    if (vm.salesCount != 0 && vm.tabs.indexOf('onsale') !== -1) {
                        vm.tabActive = 'onsale';
                        $location.path('dashboard/' + vm.tabActive);
                    }
                    else if (vm.draftCount != 0 && vm.tabs.indexOf('draft') !== -1) {
                        vm.tabActive = 'draft';
                        $location.path('dashboard/' + vm.tabActive);
                    }
                }
            }
        });

    }

})();