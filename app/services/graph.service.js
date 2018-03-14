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
                        stacked: false,
                        ticks: {
                            maxTicksLimit: 5
                        }
                    }],
                    xAxes: [{
                        ticks: {
                            maxTicksLimit: 7,
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
                        usePointStyle: true,
                        generateLabels: function(chart) {
                            var data = chart.data;
                            if (data.datasets.length) {
                                return data.datasets.map(function(legend, i) {
                                    return {
                                        text: legend.label,
                                        fillStyle: legend.pointHoverBackgroundColor,
                                        lineWidth: 0,
                                        strokeStyle: legend.pointHoverBackgroundColor,
                                        pointStyle: 'rectRounded'
                                    };
                                });
                            }
                            return [];
                        }
                    }
                },
                elements: {
                    point: {
                        radius: 4,
                        hoverRadius: 5,
                        hitRadius: 1,
                        pointStyle: 'rectRounded',
                        borderWidth: 3
                    },
                    line: {
                        fill: false,
                        borderWidth: 3
                    }
                },
                tooltips: {
                    backgroundColor: '#000',
                    bodyFontColor: '#fff',
                    titleFontColor: '#fff',
                    filter: function(tooltipItems, data) {
                        var data = data.datasets[tooltipItems.datasetIndex].data[tooltipItems.index];
                        return data !== 0;
                    }
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
                cornerRadius: 16,
                scales: {
                    xAxes: [{
                        stacked: true,
                        ticks: {
                            maxRotation: 0,
                            minRotation: 0,
                            autoSkip: false
                        },
                        gridLines: {
                            display: false
                        },
                        barPercentage: 0.6,
                        categoryPercentage: 1
                    }],
                    yAxes: [{
                        stacked: true,
                        beginAtZero: false,
                        display: true,
                        gridLines: {
                            display: true
                        }
                    }]
                },
                tooltips: {
                    intersect: false,
                    callbacks: {
                        label: function (tooltipItems, data) {
                            return data.datasets[tooltipItems.datasetIndex].barLabel[tooltipItems.index] + ': ' + data.datasets[tooltipItems.datasetIndex].data[tooltipItems.index];
                        }
                    },
                    filter: function(tooltipItems, data) {
                        var data = data.datasets[tooltipItems.datasetIndex].data[tooltipItems.index];
                        return data !== undefined;
                    }
                }
            }
        };

        var defaultPieGraph = {
            colors: [],
            labels: null,
            data: null,
            options: {
                cutoutPercentage: 50,
                legend: {
                    display: false
                },
                tooltips: {
                    backgroundColor: '#000',
                    bodyFontColor: '#fff',
                    titleFontColor: '#fff'
                }
            }
        };

        var service = {
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
        service.priceclassLineGraph = angular.copy(defaultLineGraph);
        return service;

        function reset() {
            service.overviewLineGraph = angular.copy(defaultLineGraph);
            service.overviewBarGraph = angular.copy(defaultBarGraph);
            service.pricetypePieGraph = angular.copy(defaultPieGraph);
            service.priceclassPieGraph = angular.copy(defaultPieGraph);
            service.pricetypeLineGraph = angular.copy(defaultLineGraph);
            service.priceclassLineGraph = angular.copy(defaultLineGraph);
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
                var filterType = {
                    filterArray: newValue.types,
                    compareField: 'saleType'
                };
                var stats = new GraphStats(newValue.sales, filterType, filter);
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
                    });
                    if (!dataItem.every(function (v) {
                            return v === 0;
                        })) {
                        data.push(dataItem);
                        series.push($translate.instant(type.typeName));
                        step++;
                        var baseColor = colorService.getColorByType(type.typeName);
                        colors.push({
                            borderColor: baseColor,
                            backgroundColor: '#ffffff',
                            pointHoverBackgroundColor: baseColor,
                            pointHoverBorderColor: baseColor
                        });
                    }
                });

                if (labels && labels.length) {
                    overviewGraph.options.scales.yAxes[0].ticks.max = stats.getStatsMax();
                    overviewGraph.options.scales.yAxes[0].ticks.min = stats.getStatsMin();

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

                var cats = [];
                var catStep = 0;

                newValue.sales.forEach(function (myOverviewData) {
                    if (myOverviewData.groupId == 'generated') {
                        overviewData.generatedCount = myOverviewData.rowCount;
                        overviewData.generatedSum = myOverviewData.rowSum;
                        overviewData.currency = myOverviewData.currency;
                    } else {
                        if (myOverviewData.groupName == 'api_overview_venue_occupancy') {
                            labels.push(formatLabel($translate.instant('api_avail_for_sale')));
                        } else {
                            labels.push(formatLabel($translate.instant(myOverviewData.groupName)));
                        }
                        var step = 0;
                        var rowSeries = [];
                        if (typeof(cats[catStep]) == "undefined") {
                            cats[catStep] = [];
                        }
                        myOverviewData.rows.forEach(function (overviewRow) {
                            overviewRow.color = colorService.getColorByType(overviewRow.typeName);
                            rowSeries.push($translate.instant(overviewRow.typeName));
                            if (typeof(data[step]) == "undefined") {
                                data[step] = [];
                            }
                            data[step].push(overviewRow.count);
                            cats[catStep].push(overviewRow.count);
                            if (typeof(colors[step]) == "undefined") {
                                colors[step] = [];
                            }
                            colors[step].push(overviewRow.color);
                            if (typeof(barSeries[step]) == "undefined") {
                                barSeries[step] = [];
                            }
                            barSeries[step].push($translate.instant(overviewRow.typeName));
                            step++;
                        });
                        series.push(rowSeries);
                        catStep++;
                    }
                });
                for (var i = 0; i < data.length; i++) {
                    for (var j = 0; j < cats.length; j++) {
                        var dataStep = j;
                        var seriesData = barSeries[i][j];
                        var colorData = colors[i][j];
                        var dataData = data[i][j];
                        if (!isInArray(data[i][j], cats[j])) {
                            barSeries[i][j] = undefined;
                            colors[i][j] = undefined;
                            data[i][j] = undefined;
                            dataStep++;
                        }
                        if (dataData != undefined) {
                            barSeries[i][dataStep] = seriesData;
                            colors[i][dataStep] = colorData;
                            data[i][dataStep] = dataData;
                        }
                    }
                    datasetOverride.push({
                        barLabel: barSeries[i],
                        backgroundColor: colors[i],
                        borderColor: colors[i],
                        hoverBackgroundColor: colors[i],
                        hoverBorderColor: colors[i]
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
                        var percentage = Math.round(pricetypeRow.count / pricetypeData.generatedCount * 100);
                        if (percentage == 0) {
                            percentage = '<1';
                        }
                        labels.push(pricetypeRow.priceTypeName + ' (' + percentage + '%)');
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
                for (var i = 0;i < colors.length;i++) {
                    var baseColor = colors[i];
                    colors[i] = {
                        backgroundColor: baseColor,
                        pointBackgroundColor: baseColor
                    };
                }

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
                        if ($.grep(ids, function (e) {
                                return e == parseInt(sellType.priceTypeId, 10);
                            }).length === 0) {
                            series.push(sellType.priceTypeName);
                            colors.push(sellType.color);
                            ids.push(parseInt(sellType.priceTypeId, 10));
                        }
                    });
                });
                // Sort by priceTypeId
                sortGraphData(series);
                sortGraphData(colors);

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
                var filterType = {
                    filterArray: ids,
                    compareField: 'priceType'
                };
                var stats = new GraphStats(newValue.sales, filterType, filter);
                ids.forEach(function (idItem) {
                    var dataItem = [];
                    newValue.sales.forEach(function (sale) {
                        var dataItemValue = 0;
                        sale.sellTypes.forEach(function (sellType) {
                            if (sellType.priceTypeId == idItem) {
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
                    });
                    data.push(dataItem);
                });
                sortGraphData(data);
                for (var i = 0;i < colors.length;i++) {
                    var baseColor = colors[i];
                    colors[i] = {
                        borderColor: baseColor,
                        backgroundColor: '#ffffff',
                        pointHoverBackgroundColor: baseColor,
                        pointHoverBorderColor: baseColor
                    };
                }

                if (labels && labels.length) {
                    pricetypeGraph.options.scales.yAxes[0].ticks.max = stats.getStatsMax();
                    pricetypeGraph.options.scales.yAxes[0].ticks.min = stats.getStatsMin();
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
                        labels.push(priceclassRow.priceClassName + ' (' + Math.round(priceclassRow.count / priceclassData.generatedCount * 100) + '%)');
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
                for (var i = 0;i < colors.length;i++) {
                    var baseColor = colors[i];
                    colors[i] = {
                        backgroundColor: baseColor,
                        pointBackgroundColor: baseColor
                    };
                }

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
                sortGraphData(series);
                sortGraphData(colors);

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
                var filterType = {
                    filterArray: series,
                    compareField: 'priceClass'
                };
                var stats = new GraphStats(newValue.sales, filterType, filter);

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
                    });
                    data.push(dataItem);
                });
                sortGraphData(data);
                for (var i = 0;i < colors.length;i++) {
                    var baseColor = colors[i];
                    colors[i] = {
                        borderColor: baseColor,
                        backgroundColor: '#ffffff',
                        pointHoverBackgroundColor: baseColor,
                        pointHoverBorderColor: baseColor
                    };
                }

                if (labels && labels.length) {
                    priceclassGraph.options.scales.yAxes[0].ticks.max = stats.getStatsMax();
                    priceclassGraph.options.scales.yAxes[0].ticks.min = stats.getStatsMin();
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

        function GraphStats(salesData, filterData, filter) {
            var positiveMax;
            var negativeMin;
            this.getStatsMax = function () {
                if (!positiveMax){
                    calculateStats(filter);
                }
                return positiveMax;
            };
            this.getStatsMin = function () {
                if (!negativeMin){
                    calculateStats(filter);
                }
                return negativeMin;
            };
            var calculateStats = function(){
                positiveMax = 0;
                negativeMin = 0;
                filterData.filterArray.forEach(function (arrayElement) {
                    salesData.forEach(function (sale) {
                        sale.sellTypes.forEach(function (saleType) {
                            var compareField;
                            var arrayValue = arrayElement;
                            if (filterData.compareField == 'saleType') {
                                compareField = saleType.type;
                                arrayValue = arrayElement.type;
                            } else if (filterData.compareField == 'priceType') {
                                compareField = saleType.priceTypeId;
                            } else if (filterData.compareField == 'priceClass') {
                                compareField = saleType.priceClassName;
                            }
                            if (compareField == arrayValue) {
                                var columnPositiveSum = 0;
                                var columnNegativeSum = 0;
                                if (filter.display == 'tickets') {
                                    if (saleType.rowCount > 0) {
                                        columnPositiveSum = saleType.rowCount;
                                    } else {
                                        columnNegativeSum = saleType.rowCount;
                                    }
                                } else {
                                    if (saleType.rowSum > 0) {
                                        columnPositiveSum = saleType.rowSum;
                                    } else {
                                        columnNegativeSum = saleType.rowSum;
                                    }
                                }
                                positiveMax = Math.max(columnPositiveSum, positiveMax);
                                negativeMin = Math.min(columnNegativeSum, negativeMin);
                            }
                        });
                    });
                });
            }
        }

        function sortGraphData(data) {
            var ids = [];
            data = ids.map(function (e, i) {
                return i;
            }).sort(function (a, b) {
                return ids[a] - ids[b];
            }).map(function (e) {
                return data[e];
            });
        }

        function formatLabel(str){
            var maxwidth = 10;
            var sections = [];
            var words = str.split(' ');
            var temp = '';
            words.forEach(function(item, index) {
                if(temp.length > 0) {
                    var concat = temp + ' ' + item;
                    if(concat.length > maxwidth){
                        sections.push(temp);
                        temp = '';
                    } else {
                        if(index == (words.length-1)) {
                            sections.push(concat);
                            return;
                        } else {
                            temp = concat;
                            return;
                        }
                    }
                }
                if(index == (words.length-1)) {
                    sections.push(item);
                    return;
                }
                if(item.length < maxwidth) {
                    temp = item;
                }
                else {
                    sections.push(item);
                }
            });
            return sections;
        }

        function isInArray(value, array) {
            var exists = false;
            for (var i = 0; i < array.length; i++) {
                if (array[i] == value) {
                    exists = true;
                }
            }
            return exists;
        }
    }
})();
