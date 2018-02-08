/* ng-infinite-scroll - v1.0.0 - 2013-02-23 */
var mod;

mod = angular.module('infinite-scroll', []);

mod.directive('infiniteScroll', [
  '$rootScope', '$window', '$timeout', function($rootScope, $window, $timeout) {
    return {
      link: function(scope, elem, attrs) {
        var checkWhenEnabled, handler, scrollDistance, scrollEnabled, prefill;
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

        prefill = function() {
          var distance = this.getPrefillDistance();
          this.isPrefilling = distance >= 0;
          if (this.isPrefilling && scrollEnabled) {
            if ($rootScope.$$phase) {
              console.log("Debug1:" + distance);
              return scope.$eval(attrs.infiniteScroll);

            } else {
                console.log("Debug2:" + distance);
              return scope.$apply(attrs.infiniteScroll);
            }
          }
        }
        this.getPrefillDistance = function() {
            var windowBottom = $window.height() + $window.scrollTop();
            var elementBottom = elem.offset().top + elem.height();
            return elementBottom - windowBottom;
        };

        handler = function() {
          var windowBottom = $window.height() + $window.scrollTop();
          var elementBottom = elem.offset().top + elem.height();
          var remaining = elementBottom - windowBottom;
          var shouldScroll = remaining <= $window.height() * scrollDistance;
          if (shouldScroll && scrollEnabled) {
            if ($rootScope.$$phase) {
                console.log("Debug3:" + remaining);
              return scope.$eval(attrs.infiniteScroll);
            } else {
              return function() {
                  console.log("Debug4:" + remaining);
                scope.$apply(attrs.infiniteScroll);
              }
            }
          } else if (shouldScroll) {
            return checkWhenEnabled = true;
          }
        };
        $window.on('load', prefill);
        $window.on('scroll', handler);
        scope.$on('$destroy', function() {
          return $window.off('scroll', handler);
        });
        return $timeout((function() {
          if (attrs.infiniteScrollImmediateCheck) {
            if (scope.$eval(attrs.infiniteScrollImmediateCheck)) {
              return handler();
            }
          } else {
            return handler();
          }
        }), 10);
      }
    };
  }
]);
