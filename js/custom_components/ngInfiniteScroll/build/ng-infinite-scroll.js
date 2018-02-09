/* ng-infinite-scroll - v1.0.0 - 2013-02-23 */
var mod;

mod = angular.module('infinite-scroll', []);

mod.directive('infiniteScroll', [
    '$rootScope', '$window', '$timeout', function($rootScope, $window, $timeout) {
        return {
            link: function(scope, elem, attrs) {
                var checkWhenEnabled, handler, scrollDistance, scrollEnabled;
                $window = angular.element($window);
                scrollDistance = 0;
                if (attrs.infiniteScrollDistance != null) {
                    scope.$watch(attrs.infiniteScrollDistance, function(value) {
                        return scrollDistance = parseInt(value, 10);
                    });
                }
                scrollEnabled = true;
                checkWhenEnabled = false;
                if (attrs.infiniteScrollDisabled != null) {
                    scope.$watch(attrs.infiniteScrollDisabled, function(value) {
                        scrollEnabled = !value;
                        if (scrollEnabled && checkWhenEnabled) {
                            checkWhenEnabled = false;
                            return handler();
                        }
                    });
                }
                handler = function() {
                    console.log("ScrollHandler");
                    var shouldScroll = checkForScroll();
                    if (shouldScroll && scrollEnabled) {
                        $timeout((function() {
                            console.log("SecondaryTimeoutForScroll");
                            if (attrs.infiniteScrollImmediateCheck) {
                                if (scope.$eval(attrs.infiniteScrollImmediateCheck)) {
                                    return handler();
                                }
                            } else {
                                return handler();
                            }
                        }), 1000);
                        if ($rootScope.$$phase) {
                            return scope.$eval(attrs.infiniteScroll);
                        } else {
                            return scope.$apply(attrs.infiniteScroll);
                        }
                    } else if (shouldScroll) {
                        return checkWhenEnabled = true;
                    }
                };
                checkForScroll = function() {
                    var windowBottom = $window.height() + $window.scrollTop();
                    var elementBottom = elem.offset().top + elem.height();
                    var remaining = windowBottom - elementBottom;
                    var shouldScroll = remaining >= 0;
                    return shouldScroll;
                };
                $window.onload(function() {
                    console.log("LoadOfWindow");
                    handler();
                });
                $window.on('scroll', handler);
                if (scope.$eval(attrs.infiniteScrollListenForEvent)) {
                    scope.$on(attrs.infiniteScrollListenForEvent, handler);
                }
                scope.$on('$destroy', function() {
                    return $window.off('scroll', handler);
                });
                return $timeout((function() {
                    console.log("MainTimeoutForScroll");
                    if (attrs.infiniteScrollImmediateCheck) {
                        if (scope.$eval(attrs.infiniteScrollImmediateCheck)) {
                            return handler();
                        }
                    } else {
                        return handler();
                    }
                }), 0);
            }
        };
    }
]);