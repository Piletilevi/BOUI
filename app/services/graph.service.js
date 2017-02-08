(function () {

  'use strict';

  angular
    .module('boApp')
    .factory('graphService', GraphService);

  GraphService.$inject = ['colorService', '$translate'];

  function GraphService(colorService, $translate) {
    var service = {
		overviewBarGraph: {
		  labels: null,
		  type: 'StackedBar',
		  series: null,
		  colors: [],
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
        series: [],
        data: null,
        colors: [],
        options: {
          scales: {
            yAxes: [{
              stacked: true
            }]
          },
          legend: {
            display: true
          }
        }
      },
      pricetypePieGraph: {
        labels: null,
        data: null,
        options: {
          legend: {
            display: true
          }
        }
      },

      pricetypeLineGraph: {
        labels: null,
        series: [],
        data: null,
        colors: [],
        options: {
          scales: {
            yAxes: [{
              stacked: true
            }]
          },
          legend: {
            display: true
          }
        }
      },
      priceclassPieGraph: {
        labels: null,
        data: null,
        options: {
          legend: {
            display: true
          }
        }
      },
      priceclassLineGraph: {
        labels: null,
        series: [],
        data: null,
        colors: [],
        options: {
          scales: {
            yAxes: [{
              stacked: true
            }]
          },
          legend: {
            display: true
          }
        }
      },
      renderOverviewBarGraph: renderOverviewBarGraph,
      renderOverviewLineGraph: renderOverviewLineGraph,
      renderPriceTypePieGraph: renderPriceTypePieGraph,
      renderPriceTypeLineGraph: renderPriceTypeLineGraph,
      renderPriceClassPieGraph: renderPriceClassPieGraph,
      renderPriceClassLineGraph: renderPriceClassLineGraph
    };
    return service;

    function renderOverviewLineGraph(newValue, filter, overviewGraph) {
      if (newValue && newValue.sales) {
        var series = [];
        var labels = [];
        var data = [];
        var colors = [];
        var step = 0;
        var maxTicks = 0;

        newValue.sales.forEach(function (sale) {
          if (filter.groupBy == 'day') {
            labels.push(moment(sale.sellDate).format('DD.MM.YYYY'));
          } else if (filter.groupBy == 'week') {
            var weekStart = moment(sale.sellYear + "W" + (sale.sellWeek <= 9 ? "0" + sale.sellWeek : sale.sellWeek));
            labels.push(weekStart.format('DD.MM.YYYY') + " - " + weekStart.add(7, 'days').format('DD.MM.YYYY'));
          } else if (filter.groupBy == 'month') {
            var firstDayOfMonth = new Date(sale.sellYear, sale.sellMonth - 1, 1);
            var firstDayNextMonth = null;
            if (sale.sellMonth < 12) {
              firstDayNextMonth = new Date(sale.sellYear, sale.sellMonth, 1);
            } else {
              firstDayNextMonth = new Date(sale.sellYear + 1, 0, 1);
            }
            labels.push(moment(firstDayOfMonth).format('DD.MM.YYYY') + " - " + moment(firstDayNextMonth).subtract(1, 'days').format('DD.MM.YYYY'));
          }
        });

        newValue.types.forEach(function (type) {
          var dataItem = [];
          newValue.sales.forEach(function (sale) {
            var dataItemValue = 0;
            sale.sellTypes.forEach(function (saleType) {
              if (type.type == saleType.type) {
                if (filter.display == 'tickets') {
                  dataItemValue = saleType.rowCount;
                } else {
                  dataItemValue = saleType.rowSum;
                }
              }
            });
            dataItem.push(dataItemValue);
          });
          if (!dataItem.every(function (v) {
              return v === 0;
            })) {
            data.push(dataItem);
            series.push($translate.instant(type.typeName));
            step++;
            colors.push(colorService.getRandomColor((newValue.types.length + 1), step));
          }
        });
        if (labels && labels.length) {
          overviewGraph.labels = labels;
          overviewGraph.series = series;
          overviewGraph.data = data;
          overviewGraph.colors = colors;
        } else {
          overviewGraph.labels = null;
          overviewGraph.series = null;
          overviewGraph.data = null;
          overviewGraph.colors = null;
        }
      }
    }

	function renderOverviewBarGraph(newValue, overviewData, overviewBarGraph) {
		if (newValue && newValue.sales) {
			var steps = 0;
			overviewData.generatedCount = 0;
			overviewData.generatedSum = 0;
			overviewData.currency = '';
			var series = [];
			var labels = [];
			var data = [];
			var colors = [];
			var barSeries = [];
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
					var step = 0;
					myOverviewData.rows.forEach(function (overviewRow) {
						if(typeof(data[step]) == "undefined") {
							data[step] = [];
						}
						data[step].push(overviewRow.count);

						if(typeof(colors[step]) == "undefined") {
							colors[step] = [];
						}
						overviewRow.color = colorService.getColorByType(overviewRow.typeName);
						colors[step].push(overviewRow.color);

						if(typeof(barSeries[step]) == "undefined") {
							barSeries[step] = [];
						}
						barSeries[step].push(overviewRow.typeName);

						step++;
					});
				}
			});

			for (var i = 0; i < data.length; i++) {
				datasetOverride.push({
					label: '',
					backgroundColor: colors[i],
					borderColor: colors[i],
					data: data[i],
				});
			}

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

	function renderPriceTypePieGraph(newValue, filter, pricetypeData, pricetypePieGraph) {
      if (newValue && newValue.sales) {
        var step = 0;
        pricetypeData.generatedCount = 0;
        pricetypeData.generatedSum = 0;
        pricetypeData.currency = '';
        var labels = [];
        var data = [];
        var colors = [];

        newValue.sales.forEach(function (myPricetypeData) {
          pricetypeData.generatedCount += myPricetypeData.rowCount;
          pricetypeData.generatedSum += myPricetypeData.rowSum;
          pricetypeData.currency = myPricetypeData.currency;
        });

        newValue.sales.forEach(function (myPricetypeData) {
          myPricetypeData.priceTypes.forEach(function (pricetypeRow) {
            labels.push(pricetypeRow.priceTypeName +
              ' (' + Math.round(pricetypeRow.count / pricetypeData.generatedCount * 100) + '%)');
          });
        });

        newValue.sales.forEach(function (myPricetypeData) {
          myPricetypeData.priceTypes.forEach(function (pricetypeRow) {
            step++;
            pricetypeRow.color = colorService.getRandomColor(labels.length, step);
            colors.push(pricetypeRow.color);
            if (filter.pieDisplay === 'tickets') {
              data.push(pricetypeRow.count);
            }
            else {
              data.push(pricetypeRow.sum);
            }
          });
        });

        if (labels && labels.length) {
          pricetypePieGraph.labels = labels;
          pricetypePieGraph.data = data;
          pricetypePieGraph.colors = colors;
        } else {
          pricetypePieGraph.labels = null;
          pricetypePieGraph.data = null;
          pricetypePieGraph.colors = null;
        }
      }
    }

    function renderPriceTypeLineGraph(newValue, filter, pricetypeGraph) {
      if (newValue && newValue.sales) {
        var series = [];
        var labels = [];
        var data = [];
        var colors = [];
        var step = 0;

        newValue.sales.forEach(function (sale) {
          sale.sellTypes.forEach(function (sellType) {
            if ($.grep(series, function (e) {
                return e == sellType.priceTypeName;
              }).length === 0) {
              series.push(sellType.priceTypeName);
            }
          });
        });

        // @TODO Return series in the same sequence as for pie chart from backend
        series = series.sort();

        newValue.sales.forEach(function (sale) {
          if (filter.groupBy == 'day') {
            labels.push(moment(sale.sellDate).format('DD.MM.YYYY'));
          } else if (filter.groupBy == 'week') {
            var weekStart = moment(sale.sellYear + "W" + (sale.sellWeek <= 9 ? "0" + sale.sellWeek : sale.sellWeek));
            labels.push(weekStart.format('DD.MM.YYYY') + " - " + weekStart.add(7, 'days').format('DD.MM.YYYY'));
          } else if (filter.groupBy == 'month') {
            var firstDayOfMonth = new Date(sale.sellYear, sale.sellMonth - 1, 1);
            var firstDayNextMonth = null;
            if (sale.sellMonth < 12) {
              firstDayNextMonth = new Date(sale.sellYear, sale.sellMonth, 1);
            } else {
              firstDayNextMonth = new Date(sale.sellYear + 1, 0, 1);
            }
            labels.push(moment(firstDayOfMonth).format('DD.MM.YYYY') + " - " + moment(firstDayNextMonth).subtract(1, 'days').format('DD.MM.YYYY'));
          }
        });

        series.forEach(function (seriesItem) {
          step++;
          var dataItem = [];
          var color = colorService.getRandomColor(series.length, step);

          newValue.sales.forEach(function (sale) {
            var dataItemValue = 0;
            sale.sellTypes.forEach(function (sellType) {
              if (sellType.priceTypeName == seriesItem) {
                if (filter.display == 'tickets') {
                  dataItemValue = sellType.rowCount;
                } else {
                  dataItemValue = sellType.rowSum;
                }
              }
            });
            dataItem.push(dataItemValue);
          });
          data.push(dataItem);
          colors.push(color);
        });


        if (labels && labels.length) {
          pricetypeGraph.labels = labels;
          pricetypeGraph.series = series;
          pricetypeGraph.data = data;
          pricetypeGraph.colors = colors;
        } else {
          pricetypeGraph.labels = null;
          pricetypeGraph.series = null;
          pricetypeGraph.data = null;
          pricetypeGraph.colors = null;
        }
      }
    }

    function renderPriceClassPieGraph(newValue, filter, priceclassData, priceclassPieGraph) {
      if (newValue && newValue.sales) {
        var step = 0;
        priceclassData.generatedCount = 0;
        priceclassData.generatedSum = 0;
        priceclassData.currency = '';
        var labels = [];
        var data = [];
        var colors = [];

        newValue.sales.forEach(function (myPriceclassData) {
          priceclassData.generatedCount += myPriceclassData.rowCount;
          priceclassData.generatedSum += myPriceclassData.rowSum;
          priceclassData.currency = myPriceclassData.currency;
        });

        newValue.sales.forEach(function (myPriceclassData) {
          myPriceclassData.priceClasses.forEach(function (priceclassRow) {
            labels.push(priceclassRow.priceClassName +
              ' (' + Math.round(priceclassRow.count / priceclassData.generatedCount * 100) + '%)');
          });
        });

        newValue.sales.forEach(function (myPriceclassData) {
          myPriceclassData.priceClasses.forEach(function (priceclassRow) {
            step++;
            priceclassRow.color = colorService.getRandomColor(labels.length, step);
            colors.push(priceclassRow.color);
            if (filter.pieDisplay == 'tickets') {
              data.push(priceclassRow.count);
            } else {
              data.push(priceclassRow.sum);
            }
          });
        });

        if (labels && labels.length) {
          priceclassPieGraph.labels = labels;
          priceclassPieGraph.data = data;
          priceclassPieGraph.colors = colors;
        } else {
          priceclassPieGraph.labels = null;
          priceclassPieGraph.data = null;
          priceclassPieGraph.colors = null;
        }
      }
    }


    function renderPriceClassLineGraph(newValue, filter, priceclassGraph) {
      if (newValue && newValue.sales) {
        var series = [];
        var labels = [];
        var data = [];
        var colors = [];
        var step = 0;

        newValue.sales.forEach(function (sale) {
          sale.sellTypes.forEach(function (sellType) {
            if ($.grep(series, function (e) {
                return e == sellType.priceClassName;
              }).length === 0) {
              series.push(sellType.priceClassName);
            }
          });
        });

        // @TODO Return series in the same sequence as for pie chart from backend
        series = series.sort(function(a,b){
          return (parseInt(a, 10) - parseInt(b, 10));
        });

        newValue.sales.forEach(function (sale) {
          if (filter.groupBy == 'day') {
            labels.push(moment(sale.sellDate).format('DD.MM.YYYY'));
          } else if (filter.groupBy == 'week') {
            var weekStart = moment(sale.sellYear + "W" + (sale.sellWeek <= 9 ? "0" + sale.sellWeek : sale.sellWeek));
            labels.push(weekStart.format('DD.MM.YYYY') + " - " + weekStart.add(7, 'days').format('DD.MM.YYYY'));
          } else if (filter.groupBy == 'month') {
            var firstDayOfMonth = new Date(sale.sellYear, sale.sellMonth - 1, 1);
            var firstDayNextMonth = null;
            if (sale.sellMonth < 12) {
              firstDayNextMonth = new Date(sale.sellYear, sale.sellMonth, 1);
            } else {
              firstDayNextMonth = new Date(sale.sellYear + 1, 0, 1);
            }
            labels.push(moment(firstDayOfMonth).format('DD.MM.YYYY') + " - " + moment(firstDayNextMonth).subtract(1, 'days').format('DD.MM.YYYY'));
          }
        });

        series.forEach(function (seriesItem) {
          step++;
          var dataItem = [];
          var color = colorService.getRandomColor(series.length, step);

          newValue.sales.forEach(function (sale) {
            var dataItemValue = 0;
            sale.sellTypes.forEach(function (sellType) {
              if (sellType.priceClassName == seriesItem) {
                if (filter.display == 'tickets') {
                  dataItemValue = sellType.rowCount;
                } else {
                  dataItemValue = sellType.rowSum;
                }
              }
            });
            dataItem.push(dataItemValue);
          });
          data.push(dataItem);
          colors.push(color);
        });

        if (labels && labels.length) {
          priceclassGraph.labels = labels;
          priceclassGraph.series = series;
          priceclassGraph.data = data;
          priceclassGraph.colors = colors;
        } else {
          priceclassGraph.labels = null;
          priceclassGraph.series = null;
          priceclassGraph.data = null;
          priceclassGraph.colors = null;
        }
      }
    }

  }
})();
