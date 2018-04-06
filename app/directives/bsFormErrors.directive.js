'use strict';

// toggles Bootstrap's "has-error" class to .form-group elements
// usage: add 'bs-form-errors' to a form

angular
	.module('boApp')
	.directive('bsFormErrors', BsFormErrorsDirective);

function BsFormErrorsDirective() {
	var link = function(scope, element, attrs, ctrl) {
		$(element).find('.form-group').each(function() {
			var $formGroup = $(this);
			var $inputs = $formGroup.find('input[ng-model],textarea[ng-model],select[ng-model]');
			if (!$inputs || !$inputs.length) {
				return;
			}
			$inputs.each(function() {
				var $input = $(this);
				scope.$watch(function() {
					// should also check ctrl.$submitted?
					return !$input.controller('ngModel').$dirty
						|| !$input.controller('ngModel').$invalid;
				}, function(valid) {
					$formGroup.toggleClass('has-error', !valid);
				});
			});
		});
	};
	return {
		restrict: 'A',
		require: 'form',
		link: link
	};
}