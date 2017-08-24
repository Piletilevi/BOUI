(function() {
	'use strict';
	angular.module('boApp')
		.directive('ngSlidingTabs', ngSlidingTabs);

	ngSlidingTabs.$inject = ['$translate'];
	function ngSlidingTabs($translate) {
		return {
			restrict: 'C',
			scope: true,
			link: function(scope, elem, attrs) {
				var tabs = new SlidingTabs(elem[0]);
				var unwatch = scope.$watch(
					function() {
						return elem[0].offsetHeight;
					},
					function(newValue, oldValue) {
						if (newValue > 0) {
							// tabs DOM should be ready
							tabs.setTextMore($translate.instant('api_tabs_more'));
							tabs.initialize();
							unwatch();
						}
					}
				);
				scope.$on('$destroy', function() {
					// clean up
					tabs.destroyed();
				});
			}
		}
	}
})();