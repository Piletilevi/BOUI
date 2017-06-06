(function() {
	'use strict';
	angular.module('boApp')
		.directive('ngSlidingTabs', ngSlidingTabs);

	ngSlidingTabs.$inject = ['$translate', '$timeout'];
	function ngSlidingTabs($translate, $timeout) {
		return {
			restrict: 'C',
			scope: true,
			link: function(scope, elem, attrs) {
				var tabs = new SlidingTabs(elem);
				tabs.setTextMore($translate.instant('api_report_tabs_more'));
				tabs.initialize();//???
			}
		}
	}
})();