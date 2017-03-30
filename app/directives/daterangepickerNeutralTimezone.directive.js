(function() {
    'use strict';

    angular.module('boApp')
		.directive('daterangepickerNeutralTimezone',daterangepickerNeutralTimezone);

	function daterangepickerNeutralTimezone() {
		return {
			restrict: 'A',
			priority: 1,
			require: 'ngModel',
			link: function (scope, element, attrs, ctrl) {
				ctrl.$parsers.push(function (value) {
					console.log(value, 'parser');
					if (value.startDate && value.endDate) {
						var startDateUtcOffset = moment(value.startDate).utcOffset();
						var startDate = moment(value.startDate).utc().add(startDateUtcOffset, 'm').startOf('day');

						var endDateUtcOffset = moment(value.endDate).utcOffset();
						var endDate = moment(value.endDate).utc().add(endDateUtcOffset, 'm').endOf('day');

						return {startDate: startDate, endDate: endDate};
					} else {
						return value;
					}
				});
			}
		};
	}


})();
