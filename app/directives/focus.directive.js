(function() {
    'use strict';

    angular.module('boApp')
		.directive('focus',focus);

	function focus() {
		return function(scope, element) {
			element[0].focus();
		}
	}


})();
