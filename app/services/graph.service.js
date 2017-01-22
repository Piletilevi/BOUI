(function() {

    'use strict';

    angular
        .module('boApp')
        .factory('graphService', GraphService);

	GraphService.$inject = ['colorService'];

    function GraphService(colorService) {
        
		var service = {
			overviewBarGraph: {
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
			},
			overviewLineGraph: {
				labels: null,
				series: null,
				data: null,
				datasetOverride: [{ yAxisID: 'y-axis-office' }, { yAxisID: 'y-axis-web' }],
				options: {
					scales: {
					  yAxes: [
						{
						  id: 'y-axis-office',
						  type: 'linear',
						  display: true,
						  position: 'left'
						},
						{
						  id: 'y-axis-web',
						  type: 'linear',
						  display: false,
						  position: 'left'
						}
					  ]
					}
				}
			},
			renderOverviewLineGraph : renderOverviewLineGraph,
			renderOverviewBarGraph : renderOverviewBarGraph
        };
        return service;

		function renderOverviewLineGraph(newValue, filter, overviewGraph) {
			if (newValue && newValue.sales) {
			  var series = [];
			  var labels = [];
			  var data = [];
			  
			  newValue.types.forEach(function (type) {
				series.push(type.typeName);
			  });

			  newValue.sales.forEach(function (sale) {
				if (filter.groupBy == 'day') {
					labels.push(moment(sale.sellDate).format('DD.MM.YYYY'));
				} else if (filter.groupBy == 'week') {
					var weekStart = moment(sale.sellYear + "W" + (sale.sellWeek <= 9 ? "0" + sale.sellWeek : sale.sellWeek));
					labels.push(weekStart.format('DD.MM.YYYY') + " - " + weekStart.add(7, 'days').format('DD.MM.YYYY'));
				} else if (filter.groupBy == 'month') {
					var firstDayOfMonth = new Date(sale.sellYear, sale.sellMonth, 1);
					var firstDayNextMonth = null;
					if (sale.sellMonth > 11) {
						firstDayNextMonth = new Date(sale.sellYear + 1, 1, 1);
					} else {
						firstDayNextMonth = new Date(sale.sellYear, sale.sellMonth + 1, 1);
					}
					labels.push(moment(firstDayOfMonth).format('DD.MM.YYYY') + " - " + moment(firstDayNextMonth).subtract(1, 'days').format('DD.MM.YYYY'));
				}
			  });

			  newValue.types.forEach(function (type) {
				var dataItem = [];
				newValue.sales.forEach(function (sale) {
					sale.sellTypes.forEach(function (saleType) {
						if (type.type == saleType.type) {
							if (filter.display == 'tickets') {
								dataItem.push(saleType.rowCount);
							} else {
								dataItem.push(saleType.rowSum);
							}
						} else {
							dataItem.push(0);
						}
					});
				});
				data.push(dataItem);
			  });

			  if (labels && labels.length) {
				overviewGraph.labels = labels;
				overviewGraph.series = series;
				overviewGraph.data = data;
			  } else {
				overviewGraph.labels = null;
				overviewGraph.series = null;
				overviewGraph.data = null;
			  }
			}
		}

		function renderOverviewBarGraph(newValue, overviewData, overviewBarGraph) {
			if (newValue && newValue.sales) {
				var step = 0;
				var steps = 0;
				overviewData.generatedCount = 0;
				overviewData.generatedSum = 0;
				overviewData.currency = '';
				var series = [];
				var labels = [];
				var data = [];
				var datasetOverride = [];

				newValue.sales.forEach(function (myOverviewData) {
					if (myOverviewData.groupId == 'generated') {
						overviewData.generatedCount = myOverviewData.rowCount;
						overviewData.generatedSum = myOverviewData.rowSum;
						overviewData.currency = myOverviewData.currency;
					}
				});
				
				newValue.sales.forEach(function (myOverviewData) {
					if (myOverviewData.groupId != 'generated') {
						labels.push(myOverviewData.groupName);
						var barSeries = [];
						myOverviewData.rows.forEach(function (overviewRow) {
							steps++;
							barSeries.push(overviewRow.typeName);
						});
						series.push(barSeries);
					}
				});			  
				
				newValue.sales.forEach(function (myOverviewData) {
					if (myOverviewData.groupId != 'generated') {
						var color = [];
						var barSeries = [];
						var barData = [];
						myOverviewData.rows.forEach(function (overviewRow) {
							step++;
							overviewRow.color = colorService.getRandomColor(steps, step);
							color.push(overviewRow.color);
							barSeries.push(overviewRow.typeName);
							barData.push(overviewRow.count);
						});
						datasetOverride.push({backgroundColor: color, series: barSeries, data: barData});
						data.push(myOverviewData.rowCount);
					}
				});
			
				if (labels && labels.length) {
					overviewBarGraph.labels = labels;
					overviewBarGraph.series = series;
					overviewBarGraph.data = data;
					overviewBarGraph.datasetOverride = datasetOverride;
				} else {
					overviewBarGraph.labels = null;
					overviewBarGraph.series = null;
					overviewBarGraph.data = null;
					overviewBarGraph.datasetOverride = null;
				}
			}
		}
    }
})();
