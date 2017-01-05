(function() {

	'use strict';

	angular
		.module('boApp')
		.directive('input', DateRangePicker);

    DateRangePicker.$inject = ['$compile', '$parse', '$filter', '$translate', '$rootScope'];

	function DateRangePicker($compile, $parse, $filter, $translate, $rootScope) {
			return {
				restrict: 'E',
				require: '?ngModel',
				link: function($scope, $element, $attributes, ngModel) {

					if ($element.attr('daterangepicker') === undefined || ngModel === null) {
						return;
					}

					var $datepickerBtn = $element.parent().find('[data-control="daterangepicker"]');


					var showCompareSelect = $attributes.hasOwnProperty("showcompareselect") ? true : false;

					var options = {};
					options.locale = {};
					options.locale.format = 'DD.MM.YYYY';
					options.locale.firstDay = 1;
					options.separator = $attributes.separator || ' - ';
					options.minDate = $attributes.mindate && moment($attributes.mindate);
					options.maxDate = $attributes.maxdate && moment($attributes.maxdate);
					options.dateLimit = $attributes.limit && moment.duration.apply(this, $attributes.limit.split(' ').map(function(elem, index) {
						return index === 0 && parseInt(elem, 10) || elem;
					}));
					options.ranges = $attributes.ranges && $parse($attributes.ranges)($scope);
					options.opens = $attributes.opens || $parse($attributes.opens)($scope);

					function datify(date) {
						return moment.isMoment(date) ? date.toDate() : date;
					}

					function momentify(date) {
						return (!moment.isMoment(date)) ? moment(date) : date;
					}

					function format(date) {
						return $filter('date')(datify(date), options.locale.format.replace(/Y/g, 'y').replace(/D/g, 'd')); //date.format(options.format);
					}

					function formatted(dates) {
						return [format(dates.startDate), format(dates.endDate)].join(options.separator);
					}

					function renderDateTimePicker() {
						options.locale.applyLabel = $translate.instant('api_calendar_applyLabel');
						options.locale.cancelLabel = $translate.instant('api_calendar_cancelLabel');
						options.locale.weekLabel = $translate.instant('api_calendar_weekLabel');
						options.template =
							'<div class="daterangepicker dropdown-menu">' +
								'<div class="calendar left">' +
									'<div class="calendar-table"></div>' +
								'</div>' +
								'<div class="calendar right">' +
									'<div class="calendar-table"></div>' +
								'</div>' +
								'<div class="third_block">' +
									'<div class="ranges">' +
										'<div class="calendar-links">' +
							            '<a href="#" id="todayLink">' + $translate.instant('api_calendar_today') + '</a>|' +
							            '<a href="#" id="weekLink">' + $translate.instant('api_calendar_week') + '</a>|' +
							            '<a href="#" id="monthLink">' + $translate.instant('api_calendar_month') + '</a></div>' +
										'<div class="daterangepicker_input_wrapper">' +
											'<div class="daterangepicker_input">' +
												'<input class="input-mini form-control" type="text" name="daterangepicker_start" value="" />' +
												'<div class="calendar-time">' +
												'<div></div>' +
												'<i class="fa fa-clock-o glyphicon glyphicon-time"></i>' +
												'</div>' +
											'</div><div class="daterangepicker_separator">-</div><div class="daterangepicker_input">' +
												'<input class="input-mini form-control" type="text" name="daterangepicker_end" value="" />' +
												'<div class="calendar-time">' +
												'<div></div>' +
												'<i class="fa fa-clock-o glyphicon glyphicon-time"></i>' +
												'</div>' +
											'</div>' +
										'</div>' +
									'</div>';
						if (showCompareSelect) {
							options.template +=
								'<div class="additional_row">' +
									 '<div class="compare_checkbox_block">' +
										 '<div class="checkbox">' +
											 '<input type="checkbox" id="compare_checkbox" ng-model="vm.filter.compare" /><label for="compare_checkbox">' + $translate.instant('api_calendar_compare') + '</label>' +
										 '</div>' +
									 '</div>' +
									 '<div class="select_period_block">' +
										  '<select class="selectpicker" ng-model="vm.filter.compareperiod">' +
											 '<option>' + $translate.instant('api_calendar_previous_period') + '</option>' +
											 '<option>' + $translate.instant('api_calendar_next_period') + '</option>' +
										 '</select>' +
									 '</div>' +
									 '<div class="clearer"></div>' +
								'</div>';
						}
						options.template +=
									'<div class="range_inputs">' +
										 '<button class="applyBtn" disabled="disabled" type="button"></button> ' +
										 '<button class="cancelBtn" type="button"></button>' +
										 '<div class="clearer"></div>' +
									'</div>' +
								'</div>' +
							'</div>';

						$element.daterangepicker(options, function(start, end, label) {
							var modelValue = ngModel.$viewValue;
							if (angular.equals(start, modelValue.startDate) && angular.equals(end, modelValue.endDate)) {
								return;
							}

							$scope.$apply(function() {
								ngModel.$setViewValue({
									startDate: (moment.isMoment(modelValue.startDate)) ? start : start.toDate(),
									endDate: (moment.isMoment(modelValue.endDate)) ? end : end.toDate()
								});
								ngModel.$render();
							});
						});
						angular.element(".selectpicker").selectpicker();
					}

					function updateCaledarDates(startDate, endDate) {
						$element.data('daterangepicker').setStartDate(startDate);
						$element.data('daterangepicker').setEndDate(endDate);
						$element.data('daterangepicker').updateView();
						$element.data('daterangepicker').updateCalendars();
					}

					ngModel.$render = function() {
						$("body").on("click", ".calendar-links > #todayLink", function($event) {
							$event.preventDefault();
							updateCaledarDates(moment(), moment());
						});

						$("body").on("click", ".calendar-links > #weekLink", function($event) {
							$event.preventDefault();
							updateCaledarDates(moment().startOf('week'), moment().endOf('week'));
						});

						$("body").on("click", ".calendar-links > #monthLink", function($event) {
							$event.preventDefault();
							updateCaledarDates(moment().startOf('month'), moment().endOf('month'));
						});

						$datepickerBtn.on("click", function() {
							$element.data('daterangepicker').toggle();
						});

						renderDateTimePicker();

						if (!ngModel.$viewValue || !ngModel.$viewValue.startDate) {
							return;
						}
						$element.val(formatted(ngModel.$viewValue));
					};

					$rootScope.$on('$translateChangeSuccess', function () {
						renderDateTimePicker();
					});

					$scope.$watch(function() {
						if (ngModel.$modelValue.startDate && options.startDate != ngModel.$modelValue.startDate) {
							$element.data('daterangepicker').setStartDate(ngModel.$modelValue.startDate);
						}
						if (ngModel.$modelValue.endDate && options.endDate != ngModel.$modelValue.endDate) {
							$element.data('daterangepicker').setEndDate(ngModel.$modelValue.endDate);
						}
						return $attributes.ngModel;
					}, function(modelValue, oldModelValue) {
						if (!ngModel.$modelValue || (!ngModel.$modelValue.startDate)) {
							ngModel.$setViewValue({
								startDate: moment().startOf('day'),
								endDate: moment().startOf('day')
							});
							return;
						}

						if (oldModelValue !== modelValue) {
							return;
						}

						$element.data('daterangepicker').updateView();
						$element.data('daterangepicker').updateCalendars();
					});
				}

			};

		}

})();