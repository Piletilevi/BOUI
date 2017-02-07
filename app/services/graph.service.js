(function () {

  'use strict';

  angular
    .module('boApp')
    .factory('graphService', GraphService);

  GraphService.$inject = ['colorService'];

  function GraphService(colorService) {
    var defaultSteps = 3;
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
        chart: {
          type: 'area'
        },
        title: false,
        xAxis: {
          categories: null,
          tickmarkPlacement: 'on',
          title: {
            enabled: false
          }
        },
        yAxis: {
          title: false,
          labels: {
            formatter: function () {
              return this.value;
            }
          }
        },
        tooltip: {
          split: true
        },
        plotOptions: {
          area: {
            stacking: 'normal',
            lineColor: '#666666',
            lineWidth: 1,
            marker: {
              lineWidth: 1,
              lineColor: '#666666'
            }
          }
        },
        series: null
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
        chart: {
          type: 'area'
        },
        title: false,
        xAxis: {
          categories: null,
          tickmarkPlacement: 'on',
          title: {
            enabled: false
          }
        },
        yAxis: {
          title: false,
          labels: {
            formatter: function () {
              return this.value;
            }
          }
        },
        tooltip: {
          split: true
        },
        plotOptions: {
          area: {
            stacking: 'normal',
            lineColor: '#666666',
            lineWidth: 1,
            marker: {
              lineWidth: 1,
              lineColor: '#666666'
            }
          }
        },
        series: null
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
        series: null,
        data: null,
        datasetOverride: [],
        options: {}
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
        var steps = defaultSteps;
        var step = 0;

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
          step++;
          var seriesItem = {
            name: type.typeName,
            data: [],
            color: colorService.getRandomColor(steps, step)
          };
          newValue.sales.forEach(function (sale) {
            var seriesItemValue = 0;
            sale.sellTypes.forEach(function (saleType) {
              if (type.type == saleType.type) {
                if (filter.display == 'tickets') {
                  seriesItemValue = saleType.rowCount;
                } else {
                  seriesItemValue = saleType.rowSum;
                }
              }
            });
            seriesItem.data.push(seriesItemValue);
          });
          series.push(seriesItem);
        });

        if (labels && labels.length) {
          overviewGraph.xAxis.categories = labels;
          overviewGraph.series = series;
        }
      }
    }

    function renderOverviewBarGraph(newValue, overviewData, overviewBarGraph) {
      if (newValue && newValue.sales) {
        var step = 0;
        var steps = defaultSteps;
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


    function renderPriceTypePieGraph(newValue, pricetypeData, pricetypePieGraph) {
      if (newValue && newValue.sales) {
        var step = 0;
        var steps = defaultSteps;
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
            pricetypeRow.color = colorService.getRandomColor(steps, step);
            colors.push(pricetypeRow.color);
            data.push(pricetypeRow.count);
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
        var steps = defaultSteps;
        var step = 0;

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

          sale.sellTypes.forEach(function (sellType) {
            step++;

            if ($.grep(series, function (e) {
                return e.name == sellType.priceTypeName;
              }).length === 0) {
              var seriesItem = {
                name: sellType.priceTypeName,
                data: [],
                color: colorService.getRandomColor(steps, step)
              };
              newValue.sales.forEach(function (sale) {
                var seriesItemValue = 0;
                sale.sellTypes.forEach(function (sellType) {
                  if (sellType.priceTypeName == seriesItem.name) {
                    if (filter.display == 'tickets') {
                      seriesItemValue = sellType.rowCount;
                    } else {
                      seriesItemValue = sellType.rowSum;
                    }
                  }
                });
                seriesItem.data.push(seriesItemValue);
              });
              series.push(seriesItem);
            }
          });
        });

        if (labels && labels.length) {
          pricetypeGraph.xAxis.categories = labels;
          pricetypeGraph.series = series;
        }
      }
    }

    function renderPriceClassPieGraph(newValue, filter, priceclassData, priceclassPieGraph) {
      if (newValue && newValue.sales) {
        var step = 0;
        var steps = 0;
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
            steps++;
            labels.push(priceclassRow.priceClassName +
              ' (' + Math.round(priceclassRow.count / priceclassData.generatedCount * 100) + '%)');
          });
        });

        newValue.sales.forEach(function (myPriceclassData) {
          myPriceclassData.priceClasses.forEach(function (priceclassRow) {
            step++;
            priceclassRow.color = colorService.getRandomColor(steps, step);
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
        var labels = [];
        var series = [];
        var data = [];

        newValue.sales.forEach(function (sale) {
          sale.sellTypes.forEach(function (saleType) {
            series.push(saleType.priceClassName);
          });
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

        newValue.sales.forEach(function (type) {
          var dataItem = [];
          newValue.sales.forEach(function (sale) {
            sale.sellTypes.forEach(function (saleType) {
              if (type.type == saleType.type) {
                if (filter.display == 'tickets') {
                  dataItem.push(saleType.rowCount);
                } else {
                  dataItem.push(saleType.rowSum);
                }
              }
            });
          });
          data.push(dataItem);
        });

        if (labels && labels.length) {
          priceclassGraph.labels = labels;
          priceclassGraph.series = series;
          priceclassGraph.data = data;
        } else {
          priceclassGraph.labels = null;
          priceclassGraph.series = null;
          priceclassGraph.data = null;
        }
      }
    }

  }
})();
