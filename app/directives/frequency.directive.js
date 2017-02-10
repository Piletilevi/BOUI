(function() {
	'use strict';

	angular.module('boApp')
		.directive('frequency', frequency);

	function frequency() {
		return {
			restrict: 'A',
			scope: true,
			require: 'ngModel',
			link: link
		};

	}
	link.$inject = ['scope', 'elem', 'attrs'];
	function link (scope, elem, attrs) {
		scope.$watch(attrs.ngModel, function (newValue, oldValue) {
			if (!angular.equals(newValue, oldValue)) {
				var periods = angular.element("#email_popup_periods");
				var weekdays = angular.element("#email_popup_weekdays");
				var monthdays = angular.element("#email_popup_monthdays");

				periods.hide();
				weekdays.hide();
				monthdays.hide();

				switch(newValue){
					case 'Once': periods.show(); break;
					case 'Weekly': weekdays.show(); break;
					case 'Montly': monthdays.show(); break;
				}
			}
		});
	}
})();