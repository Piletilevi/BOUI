(function() {

	'use strict';

	angular
		.module('boApp')
		.directive('ngIncludeTemplate', IncludeTemplate);
	
	function IncludeTemplate() {
		return {  
			templateUrl: function(elem, attrs) { return 'views/' + attrs.ngIncludeTemplate; },
			restrict: 'A',  
			scope: {  
				'ngIncludeVariables': '&'
			},  
			link: function(scope, elem, attrs) {  

				var cache = scope.ngIncludeVariables();
				Object.keys(cache).forEach(function(key) {
					scope[key] = cache[key];
				});

				scope.$watch(function() {
				  var val = scope.ngIncludeVariables();
				  if (angular.equals(val, cache)) {
					return cache;
				  }
				  cache = val;
				  return val;
				},
				function(newValue, oldValue) {
					if (!angular.equals(newValue, oldValue)) {
						Object.keys(newValue).forEach(function(key) {
							scope[key] = newValue[key];
						});
					}
				});
			}  
		}
	}

})();