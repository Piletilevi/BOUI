(function() {

    'use strict';

	angular.module('boApp')
        .controller('reportController', ReportController);

    ReportController.$inject=['$scope', '$routeParams', '$location', '$anchorScroll', 'eventService', 'colorService'];

	function ReportController ($scope, $routeParams, $location, $anchorScroll, eventService, colorService) {
		if (!$routeParams && !$routeParams.id) {
			$location.path('dashboard');
		}
		
		//scroll to top
		$location.hash('top');
		$anchorScroll();

		//initially set those objects to null to avoid undefined error
        var vm = this;
		var prevFilterName = null;
		vm.event = {id: $routeParams.id, isShow: $routeParams.type == 'show'};
		vm.getEventInfo = eventService.getEventInfo;
		vm.getEventSalesReport = eventService.getEventSalesReport;
		vm.filter = {period: {startDate: moment().subtract(7, 'days'), endDate: moment().add(1, 'years')}, name: ''};
		vm.overviewFilter = {period: {startDate: moment().subtract(7, 'days'), endDate: moment()}};
		// Min & Max dates get from api when ready on the backend
		vm.minFilterDate = moment().subtract(7, 'days');
		vm.maxFilterDate = moment();
		vm.getEventOpSales = function() {
			if(prevFilterName === vm.filter.name) {
				vm.filter.name = '';
				vm.reset_search = false;
			}
			else {
				vm.reset_search = true;
			}
			prevFilterName = vm.filter.name;
			eventService.getEventOpSales(vm.event, vm.filter)
		};

		vm.overviewData = {
			labels: null,
			type: 'StackedBar',
			series: null,
			datasetOverride: null,
			data: null,
			options: {
			  scales: {
				xAxes: [{
				  stacked: true,
				  ticks: {
					maxRotation: 60,
					minRotation: 60,
				  }
				}],
				yAxes: [{
				  stacked: true,
				  display: false
				}]
			  }
			}
		};

		eventService.getEventInfo(vm.event);
		eventService.getEventSales(vm.event);
		eventService.getEventSalesReport(vm.event, vm.overviewFilter);

		$scope.$watch('vm.myEventSalesReport', function(newValue, oldValue){
			if(!angular.equals(newValue, oldValue)){
				if (vm.myEventSalesReport && vm.myEventSalesReport.sales) {
					var step = 0;
					var steps = 0;
					var totalCount = 0;
					var totalSum = 0;
					var series = [];
					var labels = [];
					var data = [];
					var dataH = [];
					var datasetOverride = [];

					vm.myEventSalesReport.sales.forEach(function(eventSaleData) {
						totalCount += eventSaleData.rowCount;
						totalSum += eventSaleData.rowSum;
						vm.myEventSalesReport.currency = eventSaleData.currency;
						
						labels.push(eventSaleData.rowTypeName);

						var dataItem = [];

						eventSaleData.prices.forEach(function(priceData) {
							series.push(priceData.pricetype);
							dataItem.push(priceData);
							steps++;
						});

						var dataObj = {name: eventSaleData.rowTypeName, list: dataItem};

						dataH.push(dataObj);
					});
					
					vm.myEventSalesReport.totalCount = totalCount; 
					vm.myEventSalesReport.totalSum = totalSum; 
					
					vm.myEventSalesReport.sales.forEach(function(eventSaleData) {
						eventSaleData.prices.forEach(function(priceData) {
							step++;
							priceData.color = colorService.getRandomColor(steps, step);
						});
					});
					
					var uniqSeries = series.unique();
					uniqSeries.forEach(function(serie) {
						var dataItem = [];
						var color = [];
						dataH.forEach(function(dh) {
							var diVal = 0;
							dh.list.forEach(function(di) {
								if (di.pricetype == serie) {
									diVal = di.count;
									color.push(di.color);
								}
							});
							dataItem.push(diVal);
						});
						var overrideObj = { backgroundColor: color };
						datasetOverride.push(overrideObj);
						data.push(dataItem);
					})
					
					if (labels && labels.length) {
						vm.overviewData.labels = labels;
						vm.overviewData.series = uniqSeries;
						vm.overviewData.data = data;
						vm.overviewData.datasetOverride = datasetOverride;
					}
				}
			}
		});

		$scope.$watch(
            function() {
				vm.myEventSalesReport = eventService.myEventSalesReport();
            }
        );

		$scope.$watch('vm.filter.period', function(newPeriod, oldPeriod) {
			if(newPeriod !== oldPeriod) {
				localStorage.setItem('reportsPeriod', JSON.stringify(vm.filter));
				$location.path('dashboard');
			}
		});
	}

})();