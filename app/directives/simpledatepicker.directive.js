'use strict';

angular
	.module('boApp')
	.directive('simpledatepicker', SimpleDatePickerDirective);

SimpleDatePickerDirective.$inject = ['$translate'];

function SimpleDatePickerDirective($translate) {
	var DATE_FORMAT = 'DD.MM.YYYY';
	var pickerOptions = {
		singleDatePicker: true,
		locale: {
			format: DATE_FORMAT,
			firstDay: 1
		}
	};

	var link = function(scope, element, $attributes, ngModel) {
		var picker;
		var unwatch;
		var options = JSON.parse(JSON.stringify(pickerOptions));
		var selectedDate = scope.text ? moment(scope.text, DATE_FORMAT) : null;
		if (!selectedDate || !selectedDate.isValid()) {
			selectedDate = moment();
		}
		options.startDate = selectedDate.format(DATE_FORMAT);
		options.endDate = null;

		element.daterangepicker(options, function(start) {
			var selectedValue;
			if (start) {
				selectedValue = start.format(DATE_FORMAT);
			}
			if (selectedValue != scope.text) {
				scope.$apply(function() {
					ngModel.$setViewValue(selectedValue);
					ngModel.$render();
				});
			}
		});
		picker = element.data('daterangepicker');
		unwatch = scope.$watch(
			function() {
				return scope.text;
			},
			function(newValue, oldValue) {
				if (!newValue || angular.equals(newValue, oldValue)) {
					return;
				}
				var newdate = moment(newValue, DATE_FORMAT);
				if (!newdate.isValid()) {
					return;
				}
				picker.setStartDate(newValue);
				picker.setEndDate(null);
				picker.updateView();
				picker.updateCalendars();
			}
		);
		scope.$on('$destroy', function() {
			if (picker) {
				picker.remove();
			}
			if (unwatch) {
				unwatch();
			}
		});
	};
	return {
		restrict: 'E',
		require: 'ngModel',
		templateUrl: 'views/simpledatepicker.html',
		replace: true,
		link: link,
		scope: {
			text: '=ngModel',
			placeholder: '=placeholder'
		},
	};
}