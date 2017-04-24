(function () {

  'use strict';

  angular
    .module('boApp')
    .factory('graphService', GraphService);

  GraphService.$inject = ['colorService', '$translate'];

  function GraphService(colorService, $translate) {
    var defaultLineGraph = {
      labels: null,
      series: [],
      data: null,
      colors: [],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          yAxes: [{
            stacked: true,
            ticks: {
              maxTicksLimit: 3
            }
          }],
          xAxes: [{
            ticks: {
              maxTicksLimit: 9,
              maxRotation: 0,
              minRotation: 0
            },
            gridLines: {
              display: false
            }
          }]
        },
        legend: {
          display: true,
          labels: {
            boxWidth: 13
          }
        },
        elements: {
          point: {
            radius: 0,
            hoverRadius: 3,
            hitRadius: 5
          }
        },
        tooltips: {
          backgroundColor: '#fff',
          bodyFontColor: '#000',
          titleFontColor: '#000'
        }
      }
    };

    var defaultBarGraph = {
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
              maxRotation: 0,
              minRotation: 0
            },
            gridLines: {
              display: false
            },
            categoryPercentage: 1.0
          }],
          yAxes: [{
            stacked: true,
            display: false,
            gridLines: {
              display: false
            }
          }]
        },
        tooltips: {
          callbacks: {
            label: function (tooltipItems, data) {
              return data.datasets[tooltipItems.datasetIndex].barLabel[tooltipItems.index] + ': ' + data.datasets[tooltipItems.datasetIndex].data[tooltipItems.index];
            }
          }
        }
      }
    };

    var defaultPieGraph = {
      labels: null,
      data: null,
      options: {
        legend: {
          display: false
        },
        tooltips: {
          backgroundColor: '#fff',
          bodyFontColor: '#000',
          titleFontColor: '#000'
        }
      }
    };

    var service;
    service = {
      renderOverviewBarGraph: renderOverviewBarGraph,
      renderOverviewLineGraph: renderOverviewLineGraph,
      renderPriceTypePieGraph: renderPriceTypePieGraph,
      renderPriceTypeLineGraph: renderPriceTypeLineGraph,
      renderPriceClassPieGraph: renderPriceClassPieGraph,
      renderPriceClassLineGraph: renderPriceClassLineGraph,
      reset: reset
    };

    service.overviewLineGraph = angular.copy(defaultLineGraph);
    service.overviewBarGraph = angular.copy(defaultBarGraph);
    service.pricetypePieGraph = angular.copy(defaultPieGraph);
    service.priceclassPieGraph = angular.copy(defaultPieGraph);
    service.pricetypeLineGraph = angular.copy(defaultLineGraph);

    angular.merge(service.pricetypeLineGraph, {
      options: {
        scales: {
          yAxes: [{
            stacked: false,
            ticks: {
              maxTicksLimit: 3
            }
          }]
        },
        elements: {
          line: {
            fill: false
          }
        }
      }
    });

    service.priceclassLineGraph = angular.copy(service.pricetypeLineGraph);

    return service;

    function reset() {
      service.overviewLineGraph = angular.copy(defaultLineGraph);
      service.overviewBarGraph = angular.copy(defaultBarGraph);
      service.pricetypePieGraph = angular.copy(defaultPieGraph);
      service.priceclassPieGraph = angular.copy(defaultPieGraph);
      service.pricetypeLineGraph = angular.copy(defaultLineGraph);
    }

    function renderOverviewLineGraph(newValue, filter, overviewGraph) {
      if (newValue && newValue.sales) {
        var series = [];
        var labels = [];
        var data = [];
        var colors = [];
        var step = 0;
        var totals = [];

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
        var stats = new GraphStats();
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
            if (!totals[dataItem.length]) {
              totals[dataItem.length] = 0;
            }
            totals[dataItem.length] += dataItemValue;
            dataItem.push(dataItemValue);
            stats.updateStats(stats, dataItemValue);
          });
          if (!dataItem.every(function (v) {
              return v === 0;
            })) {
            data.push(dataItem);
            series.push($translate.instant(type.typeName));
            step++;
            colors.push(colorService.getColorByType(type.typeName));
          }
        });

        if (labels && labels.length) {
          var max = stats.getStatsMax();
          if (max !== false) {
            overviewGraph.options.scales.yAxes[0].ticks.max = max;
          }
          var min = stats.getStatsMin();
          if (min !== false) {
            overviewGraph.options.scales.yAxes[0].ticks.min = min;
          }
          overviewGraph.labels = labels;
          overviewGraph.series = series;
          overviewGraph.data = data;
          overviewGraph.colors = colors;
          overviewGraph.totals = totals;
        } else {
          overviewGraph.labels = null;
          overviewGraph.series = null;
          overviewGraph.data = [];
          overviewGraph.colors = null;
          overviewGraph.totals = null
        }
      }
    }

    function renderOverviewBarGraph(newValue, overviewData, overviewBarGraph) {
      if (newValue && newValue.sales) {
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
          else {
            if (myOverviewData.groupName == 'api_overview_venue_occupancy') {
              labels.push($translate.instant('api_avail_for_sale'));
            } else {
              labels.push($translate.instant(myOverviewData.groupName));
            }
            var rowSeries = [];
            myOverviewData.rows.forEach(function (overviewRow) {
              rowSeries.push($translate.instant(overviewRow.typeName));
            });
            series.push(rowSeries);

            var step = 0;
            myOverviewData.rows.forEach(function (overviewRow) {
              if (typeof(data[step]) == "undefined") {
                data[step] = [];
              }
              data[step].push(overviewRow.count);

              if (typeof(colors[step]) == "undefined") {
                colors[step] = [];
              }
              overviewRow.color = colorService.getColorByType(overviewRow.typeName);
              colors[step].push(overviewRow.color);

              if (typeof(barSeries[step]) == "undefined") {
                barSeries[step] = [];
              }
              barSeries[step].push($translate.instant(overviewRow.typeName));

              step++;
            });
          }
        });

        for (var i = 0; i < data.length; i++) {
          datasetOverride.push({
            label: '',
            barLabel: barSeries[i],
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
        var ids = [];
        var colors = [];
        var totals = [];

        newValue.sales.forEach(function (sale) {
          sale.sellTypes.forEach(function (sellType) {
            if ($.grep(series, function (e) {
                return e == sellType.priceTypeName;
              }).length === 0) {
              series.push(sellType.priceTypeName);
              colors.push(sellType.color);
              ids.push(parseInt(sellType.priceTypeId, 10));
            }
          });
        });

        // Sort by priceTypeId
        series = ids.map(function (e, i) {
            return i;
          })
          .sort(function (a, b) {
            return ids[a] - ids[b];
          })
          .map(function (e) {
            return series[e];
          });

        colors = ids.map(function (e, i) {
            return i;
          })
          .sort(function (a, b) {
            return ids[a] - ids[b];
          })
          .map(function (e) {
            return colors[e];
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

        var stats = new GraphStats();
        series.forEach(function (seriesItem) {
          var dataItem = [];

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
            if (!totals[dataItem.length]) {
              totals[dataItem.length] = 0;
            }
            totals[dataItem.length] += dataItemValue;
            dataItem.push(dataItemValue);
            stats.updateStats(stats, dataItemValue);
          });
          data.push(dataItem);
        });

        if (labels && labels.length) {
          var max = stats.getStatsMax();
          if (max !== false) {
            pricetypeGraph.options.scales.yAxes[0].ticks.max = max;
          }
          var min = stats.getStatsMin();
          if (min !== false) {
            pricetypeGraph.options.scales.yAxes[0].ticks.min = min;
          }
          pricetypeGraph.labels = labels;
          pricetypeGraph.series = series;
          pricetypeGraph.data = data;
          pricetypeGraph.colors = colors;
          pricetypeGraph.totals = totals;
        } else {
          pricetypeGraph.labels = null;
          pricetypeGraph.series = null;
          pricetypeGraph.data = [];
          pricetypeGraph.colors = null;
          pricetypeGraph.totals = null;
        }
      }
    }

    function renderPriceClassPieGraph(newValue, filter, priceclassData, priceclassPieGraph) {
      if (newValue && newValue.sales) {
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
        var ids = [];
        var totals = [];

        newValue.sales.forEach(function (sale) {
          sale.sellTypes.forEach(function (sellType) {
            if ($.grep(series, function (e) {
                return e == sellType.priceClassName;
              }).length === 0) {
              series.push(sellType.priceClassName);
              colors.push(sellType.color);
              ids.push(parseInt(sellType.priceClassId, 10));
            }
          });
        });

        // Sort by priceClassId
        series = ids.map(function (e, i) {
            return i;
          })
          .sort(function (a, b) {
            return ids[a] - ids[b];
          })
          .map(function (e) {
            return series[e];
          });

        // Sort by priceClassId
        colors = ids.map(function (e, i) {
            return i;
          })
          .sort(function (a, b) {
            return ids[a] - ids[b];
          })
          .map(function (e) {
            return colors[e];
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
        var stats = new GraphStats();

        series.forEach(function (seriesItem) {
          var dataItem = [];

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
            if (!totals[dataItem.length]) {
              totals[dataItem.length] = 0;
            }
            totals[dataItem.length] += dataItemValue;
            dataItem.push(dataItemValue);
            stats.updateStats(stats, dataItemValue);
          });
          data.push(dataItem);
        });

        if (labels && labels.length) {
          var max = stats.getStatsMax();
          if (max !== false) {
            priceclassGraph.options.scales.yAxes[0].ticks.max = max;
          }
          var min = stats.getStatsMin();
          if (min !== false) {
            priceclassGraph.options.scales.yAxes[0].ticks.min = min;
          }
          priceclassGraph.labels = labels;
          priceclassGraph.series = series;
          priceclassGraph.data = data;
          priceclassGraph.colors = colors;
          priceclassGraph.totals = totals;
        } else {
          priceclassGraph.labels = null;
          priceclassGraph.series = null;
          priceclassGraph.data = [];
          priceclassGraph.colors = null;
          priceclassGraph.totals = null;
        }
      }
    }

    function GraphStats() {
      var coefficient = 5;
      var positiveSum = 0;
      var negativeSum = 0;
      var positiveTotal = 0;
      var negativeTotal = 0;
      var positiveMax = 0;
      var negativeMin = 0;
      this.updateStats = function (stats, value) {
        if (value > 0) {
          positiveSum += value;
          positiveTotal++;
        } else if (value < 0) {
          negativeSum += value;
          negativeTotal++;
        }
        if (value > positiveMax) {
          positiveMax = value;
        }
        if (value < negativeMin) {
          negativeMin = value;
        }
      };
      this.getStatsMax = function () {
        var max = false;
        if (positiveTotal > 0) {
          max = positiveSum / positiveTotal * coefficient;
          if (max > positiveMax) {
            max = positiveMax;
          }
        }
        return max;
      };
      this.getStatsMin = function () {
        var min = false;
        if (negativeTotal > 0) {
          min = negativeSum / negativeTotal * coefficient;
          if (min < negativeMin) {
            min = negativeMin;
          }
        }
        return min;
      };
    }
  }
})();
