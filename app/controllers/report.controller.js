(function() {

    'use strict';

	angular.module('boApp')
        .controller('reportController', ReportController);

    ReportController.$inject=['$scope', '$routeParams', '$location', '$anchorScroll', 'eventService'];

	function ReportController ($scope, $routeParams, $location, $anchorScroll, eventService) {
		if (!$routeParams && !$routeParams.id) {
			$location.path('dashboard');
		}
		
		//scroll to top
		$location.hash('top');
		$anchorScroll();

		//initially set those objects to null to avoid undefined error
        var vm = this;
		vm.event = {id: $routeParams.id, isShow: $routeParams.type == 'show'};
		vm.getEventOpSales = eventService.getEventOpSales;
		vm.getEventSalesReport = eventService.getEventSalesReport;
		vm.filter = {period: {startDate: moment().subtract(7, 'days'), endDate: moment()}, name: ''};
		vm.overviewFilter = {period: {startDate: moment().subtract(7, 'days'), endDate: moment()}};

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

		// This function generates vibrant, "evenly spaced" colours (i.e. no clustering). 
		// This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
		vm.randomColor = function(numOfSteps, step) {
			var r, g, b;
			var h = step / numOfSteps;
			var i = ~~(h * 6);
			var f = h * 6 - i;
			var q = 1 - f;
			switch(i % 6){
				case 0: r = 1; g = f; b = 0; break;
				case 1: r = q; g = 1; b = 0; break;
				case 2: r = 0; g = 1; b = f; break;
				case 3: r = 0; g = q; b = 1; break;
				case 4: r = f; g = 0; b = 1; break;
				case 5: r = 1; g = 0; b = q; break;
			}
			var c = "#" + ("00" + (~ ~(r * 255)).toString(16)).slice(-2) + ("00" + (~ ~(g * 255)).toString(16)).slice(-2) + ("00" + (~ ~(b * 255)).toString(16)).slice(-2);
			return (c);
		}

		eventService.getEventSales(vm.event, vm.filter);
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
							priceData.color = vm.randomColor(steps, step);
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
	}

})();