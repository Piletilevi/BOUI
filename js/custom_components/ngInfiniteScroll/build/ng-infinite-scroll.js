/* ng-infinite-scroll - v1.0.0 - 2013-02-23 */
var mod;

mod = angular.module('infinite-scroll', []);

mod.directive('infiniteScroll', [
    '$rootScope', '$window', '$timeout', function($rootScope, $window, $timeout) {
        return {
            link: function(scope, elem, attrs) {
                var checkWhenEnabled, handler, scrollDistance, scrollEnabled, reCheck, checkForScroll;
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
                    var shouldScroll = checkForScroll();
                    console.log("Scroll:" + shouldScroll + "," + scrollEnabled);
                    reCheck("handler");
                    if (shouldScroll && scrollEnabled) {
                        if ($rootScope.$$phase) {
                            return scope.$eval(attrs.infiniteScroll);
                        } else {
                            return scope.$apply(attrs.infiniteScroll);
                        }
                    } else if (shouldScroll) {
                        return checkWhenEnabled = true;
                    }
                };
                reCheck = function(type) {
                    var shouldScroll = checkForScroll();
                    console.log("TimeoutForScroll" + type);
                    if (shouldScroll && scrollEnabled) {
                        $timeout((function () {
                            console.log("TimeoutForScroll");
                            if (attrs.infiniteScrollImmediateCheck) {
                                if (scope.$eval(attrs.infiniteScrollImmediateCheck)) {
                                    return handler();
                                }
                            } else {
                                return handler();
                            }
                        }), 1000);
                    }
                    else if (type=="first") {
                        if (attrs.infiniteScrollImmediateCheck) {
                            if (scope.$eval(attrs.infiniteScrollImmediateCheck)) {
                                return handler();
                            }
                        } else {
                            return handler();
                        }
                    }
                };
                checkForScroll = function() {
                    var windowBottom = $window.height() + $window.scrollTop();
                    var elementBottom = elem.offset().top + elem.height();
                    var remaining = windowBottom - elementBottom;
                    var shouldScroll = remaining >= 0;
                    return shouldScroll;
                };
                $window.on('load', function() {
                    console.log("LoadOfWindow");
                    return handler();
                });
                $window.on('scroll', handler);
                scope.$on('$destroy', function() {
                    return $window.off('scroll', handler);
                });
                if (attrs.infiniteScrollListenForEvent != null) {
                    scope.$watch(attrs.infiniteScrollListenForEvent, function() {
                        console.log("EventListen:" + attrs.infiniteScrollListenForEvent);
                        return handler();
                    });
                }
                return reCheck("first");
            }
        };
    }
]);