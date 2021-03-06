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

				var $datepickerWrapper = $element.parent();


				var showCompareSelect = $attributes.hasOwnProperty("showcompareselect") ? true : false;
                var defaultValuesSet = false;
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
					options.locale.applyLabel = $translate.instant('api_calendar_apply');
					options.locale.cancelLabel = '<i class="fa fa-times" />';
					options.locale.weekLabel = $translate.instant('api_calendar_week');
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
						'<a href="#" id="todayLink">' + $translate.instant('api_calendar_today') + '</a>' +
						'<a href="#" id="weekLink">' + $translate.instant('api_calendar_week') + '</a>' +
						'<a href="#" id="monthLink">' + $translate.instant('api_calendar_month') + '</a></div>' +
						'<div class="calendar-links">' +
						'<a href="#" id="lastWeekLink">' + $translate.instant('api_calendar_last_week') + '</a>' +
						'<a href="#" id="lastMonthLink">' + $translate.instant('api_calendar_last_month') + '</a></div>' +
						'<div class="daterangepicker_input_wrapper">' +
						'<div class="daterangepicker_input bo-input bo-input-sub">' +
						'<input class="input-mini form-control" type="text" name="daterangepicker_start" value="" />' +
						'<div class="calendar-time">' +
						'<div></div>' +
						'<i class="fa fa-clock-o glyphicon glyphicon-time"></i>' +
						'</div>' +
						'</div><div class="daterangepicker_separator">-</div><div class="daterangepicker_input bo-input bo-input-sub">' +
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
						'<button class="btn btn-default resetBtn" type="button">' + $translate.instant('api_calendar_reset') + '</button>' +
						'<div class="clearer"></div>' +
						'</div>' +
						'</div>' +
						'<button class="cancelBtn" type="button"></button>' +
						'</div>';

					options.autoApply = false;
					options.minDate = $attributes.minDate ? moment($attributes.minDate) : false;
					options.maxDate = $attributes.maxDate ? moment($attributes.maxDate) : false;
					options.defaultStartDate = $attributes.defaultStartDate ? moment($attributes.defaultStartDate) : false;
					options.defaultEndDate = $attributes.defaultEndDate ? moment($attributes.defaultEndDate) : false;

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

				function updateCalendarDates(startDate, endDate) {
					setTimeout(function() {
                        if($element.data('daterangepicker')) {
							$element.data('daterangepicker').setStartDate(startDate);
                            $element.data('daterangepicker').setEndDate(endDate);
                            $element.data('daterangepicker').updateView();
                            $element.data('daterangepicker').updateCalendars();
                        }
					}, 1);
				}

				ngModel.$render = function() {
					var datepickerContainer = '[data-binded-model="'+$element.attr('ng-model')+'"]';

					$('body').on("click", datepickerContainer + " .calendar-links > #todayLink", function($event) {
						$event.preventDefault();
						updateCalendarDates(moment(), moment());
					});

					$('body').on("keyup", datepickerContainer + " [name='daterangepicker_start']", function() {
						updateCalendarDates(
							moment($(this).val(), 'DD.MM.YYYY'),
							moment($(this).parent().parent().find('[name="daterangepicker_end"]').val(), 'DD.MM.YYYY')
						);
					});

					$('body').on("keyup", datepickerContainer + " [name='daterangepicker_end']", function() {
						updateCalendarDates(
							moment($(this).parent().parent().find('[name="daterangepicker_start"]').val(), 'DD.MM.YYYY'),
							moment($(this).val(), 'DD.MM.YYYY')
						);
					});

					$('body').on("click", datepickerContainer + " .calendar-links > #weekLink", function($event) {
						$event.preventDefault();
						updateCalendarDates(moment().startOf('week').add(1, 'days'), moment());
					});

					$('body').on("click", datepickerContainer + " .calendar-links > #lastWeekLink", function($event) {
						$event.preventDefault();
						updateCalendarDates(moment().subtract(7, 'days').startOf('week').add(1, 'days'), moment().subtract(7, 'days').endOf('week').add(1, 'days'));
					});

					$('body').on("click", datepickerContainer + " .calendar-links > #lastMonthLink", function($event) {
						$event.preventDefault();
						updateCalendarDates(moment().subtract(1, 'months').startOf('month'), moment().subtract(1, 'months').endOf('month'));
					});

					$('body').on("click", datepickerContainer + " .calendar-links > #monthLink", function($event) {
						$event.preventDefault();
						updateCalendarDates(moment().startOf('month'), moment());
					});

					//$('body').on("click", datepickerContainer + " .resetBtn", function($event) {
                     //   setTimeout(function() {
                     //       if($element.data('daterangepicker')) {
                     //           $element.data('daterangepicker').setStartDate(moment().subtract(7, 'days'));
                     //           $element.data('daterangepicker').setEndDate(moment().add(1, 'years'));
                     //           $element.data('daterangepicker').updateView();
                     //           $element.data('daterangepicker').updateCalendars();
                     //           $element.data('daterangepicker').hide();
                     //       }
                     //   }, 1);
					//});

					$datepickerWrapper.on("click", function() {
						$element.data('daterangepicker').show();
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
					if(!ngModel.$modelValue) {
						return false;
					}
                    if (ngModel.$modelValue.startDate && ngModel.$modelValue.endDate && !defaultValuesSet) {
                        $element.data('daterangepicker').setStartDate(ngModel.$modelValue.startDate);
                        $element.data('daterangepicker').setEndDate(ngModel.$modelValue.endDate);
                        defaultValuesSet = true;
                    }
					return ngModel.$modelValue.startDate;
				}, function(modelValue, oldModelValue) {
					if(!angular.equals(modelValue, oldModelValue)) {
						if (ngModel.$modelValue.startDate) {
							var startDateUtcOffset = moment(ngModel.$modelValue.startDate).utcOffset();
							ngModel.$modelValue.startDate = moment(ngModel.$modelValue.startDate).utc().add(startDateUtcOffset, 'm').startOf('day');
							$element.data('daterangepicker').setStartDate(ngModel.$modelValue.startDate);
						}
						if (ngModel.$modelValue.endDate) {
							var endDateUtcOffset = moment(ngModel.$modelValue.endDate).utcOffset();
							ngModel.$modelValue.endDate = moment(ngModel.$modelValue.endDate).utc().add(endDateUtcOffset, 'm').endOf('day');
							$element.data('daterangepicker').setEndDate(ngModel.$modelValue.endDate);
						}
						renderDateTimePicker();
					}
				});
			}

		};

	}

})();