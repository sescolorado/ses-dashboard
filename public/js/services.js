/* global angular */
/* global google */
/* global ses_location_config */

// Sensible Energy Solutions LLC

/* Services */

var services = angular.module('ses_dashboard.services', [
  'googlechart'
]);

services.value('version', '1.0');

// ***************************************************************************
// Utility

services.factory('HelpersDate', [
  function () {
    'use strict';

    return {
      days: [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
      ],
      daysAbbr: [
        'Sun',
        'Mon',
        'Tues',
        'Wed',
        'Thurs',
        'Fri',
        'Sat'
      ],
      months: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
      ],
      monthsAbbr: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec'
      ],
      dateArrayConvertJS2MySQL: function (jsArray, onlyDay) {
        for (var i = 0; i < jsArray.length; i++) {
          jsArray[i] = this.dateConvertJS2MySQL(jsArray, onlyDay);
        }
      },
      dateArrayConvertLocal2UTC: function (mysqlArray) {
        for (var i = 0; i < mysqlArray.length; i++) {
          mysqlArray[i] = this.dateConvertLocal2UTC(mysqlArray[i]);
        }
      },
      dateArrayConvertMySQL2JS: function (mysqlArray, onlyDay) {
        for (var i = 0; i < mysqlArray.length; i++) {
          mysqlArray[i] = this.dateConvertMySQL2JS(mysqlArray[i], onlyDay);
        }
      },
      dateArrayConvertUTC2Local: function (mysqlArray) {
        for (var i = 0; i < mysqlArray.length; i++) {
          mysqlArray[i] = this.dateConvertUTC2Local(mysqlArray[i]);
        }
      },
      dateConvertJS2MySQL: function (js, onlyDay) {
        if (onlyDay) {
          return js.getFullYear() + "-" + ses_location_config_helpers.twoDigits(1 + js.getMonth()) + "-" + ses_location_config_helpers.twoDigits(js.getDate());
        } else {
          return js.getFullYear() + "-" + ses_location_config_helpers.twoDigits(1 + js.getMonth()) + "-" + ses_location_config_helpers.twoDigits(js.getDate()) + " " + ses_location_config_helpers.twoDigits(js.getHours()) + ":" + ses_location_config_helpers.twoDigits(js.getMinutes()) + ":" + ses_location_config_helpers.twoDigits(js.getSeconds());
        }
      },
      dateConvertLocal2UTC: function(date) {
        date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
        return date;
      },
      dateConvertMySQL2JS: function (mysql, onlyDay) {
        var t;
        t = mysql.split(/[- :]/);
        if (onlyDay) {
          return new Date(t[0], t[1] - 1, t[2]);
        } else {
          return new Date(t[0], t[1] - 1, t[2], t[3], t[4], t[5]);
        }
      },
      dateConvertUTC2Local: function(date) {
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        return date;
      },
      getDay: function (date) {
        return this.days[date.getMonth()];
      },
      getDayAbbr: function (date) {
        return this.daysAbbr[date.getMonth()];
      },
      getMonth: function (date) {
        return this.months[date.getMonth()];
      },
      getMonthAbbr: function (date) {
        return this.monthsAbbr[date.getMonth()];
      },
      lastCompleteWeek: function (date) {
        var d = new Date(date);
        if (d.getDay() === 6) {
          d.setDate(d.getDate() - d.getDay());
        } else {
          d.setDate(d.getDate() - (d.getDay() + 7));
        }
        return d;
      }
    };
  }]);

services.factory('Service', ['$http', '$q',
  function ($http, $q) {
    'use strict';

    return {
      call: function (promise, errorPrefix) {
        var deferred = $q.defer();
        promise.success(function(ret) {
          deferred.resolve(ret);
        })
          .error(function(error) {
            if (errorPrefix) {
              deferred.reject(errorPrefix + error);
            } else {
              deferred.reject(error);
            }
          });
        return deferred.promise;
      },
      callGet: function (url, errorPrefix) {
        return this.call($http.get(url), errorPrefix);
      },
      callPost: function (url, obj, errorPrefix) {
        return this.call($http.post(url, obj), errorPrefix);
      }
    };
  }]);

var ses_dashboard_load_script_deferred = undefined;

services.factory('LoadScript', ['$document', '$q', '$timeout',
  function ($document, $q, $timeout) {
    'use strict';

    return function(src, deferred) {
      ses_dashboard_load_script_deferred = $q.defer();
      var script = $document[0].createElement('script');
      script.onload = script.onreadystatechange = function () {
      };
      script.onerror = function () {
        $timeout(function () {
          ses_dashboard_load_script_deferred.reject(e);
        });
      };
      script.src = src;
      $document[0].body.appendChild(script);
      return ses_dashboard_load_script_deferred.promise;
    };
  }]);

// ***************************************************************************
// SES Dashboard

services.factory('EnergyStat', ['Service',
  function(Service) {
    'use strict';

    return {
      fields: function(location) { return Service.callGet('/energystat/fields/' + location, 'Could not retrieve fields for location: ' + location + ': '); },
      locations: function() {
        if (this.locationPromise === undefined) {
          this.locationPromise = Service.callGet('/energystat/locations', 'Could not retrieve locations.');
        }
        return this.locationPromise;
      },
      locationPromise: undefined,
      range: function(location) { return Service.callGet('/energystat/range/' + location, 'Could not retrieve range for location: ' + location + ': '); },
      read: function(location, timeFrom, timeTo, fields) {
        return Service.callPost('/energystat/read/' + location,
          {
            timeFrom: timeFrom,
            timeTo: timeTo,
            fields: fields
          },
          'Could not retrieve fields for location: ' + location);
      }
    };
  }]);

services.factory('LocationChart', ['EnergyStat', 'googleChartApiPromise', 'HelpersDate', '$q', '$timeout',
  function (EnergyStat, googleChartApiPromise, HelpersDate, $q, $timeout) {
    'use strict';

    return {
      dataBase: {},
      dataBaseOpts: {},
      dataCompare: {},
      dataCompareOpts: {},
      displayObjDefault: {
        type: "LineChart",
        displayed: true,
        options: {
          chartArea: {
            //width: '100%'
          },
          explorer: {},
          hAxis: {
            //title: 'time'
          },
          legend: {
            position: 'top'
          },
          tooltip: {
            //isHtml: true
          }
        }
      },
      displayObj: undefined,
      invalid: false,
      loading: false,
      noData: false,
      reductions: [],
      renderChart: true,
      requestLast: {},
      requestWorking: {},
      trigger: 0,
      updatePromise: undefined,
      warnings: [],
      ready: function() {
        if (!angular.equals(this.requestWorking, this.requestLast)) {
          this.updatePromise = this.updateImpl();
        } else {
          this.loading = false;
        }
      },
      update: function (locationID, timeFrom, timeTo, timeCompareFrom, timeCompareTo, fieldsDisplayChart, fieldsDisplayReductions, fieldsData) {

        this.requestLast = {
          locationID: angular.copy(locationID),
          timeFrom: angular.copy(timeFrom),
          timeTo: angular.copy(timeTo),
          timeCompareFrom: angular.copy(timeCompareFrom),
          timeCompareTo: angular.copy(timeCompareTo),
          fieldsDisplayChart: angular.copy(fieldsDisplayChart),
          fieldsDisplayReductions: angular.copy(fieldsDisplayReductions),
          fieldsData: angular.copy(fieldsData)
        };

        if (this.requestLast.timeTo !== undefined) {
          this.requestLast.timeTo.setDate(this.requestLast.timeTo.getDate() + 1);
        }

        if (this.requestLast.timeCompareTo !== undefined) {
          this.requestLast.timeCompareTo.setDate(this.requestLast.timeCompareTo.getDate() + 1);
        }

        if (!this.loading) {
          this.loading = true;
          this.updatePromise = this.updateImpl();
        }
        return this.updatePromise;
      },
      updateChart: function () {

        var deferred = $q.defer();

        var chart = this;

        $timeout(function () {

          var promises = [];

          if (chart.renderChart) {
            promises.push(googleChartApiPromise);
          }

          $q.all(promises)
            .then(function () {

              var dataTable;

              if (chart.renderChart) {
                dataTable = new google.visualization.DataTable();
              } else {
                dataTable = {
                  columns: [],
                  rows: [],
                  addColumn: function(type, name) {
                    this.columns.push({type: type, name: name});
                  },
                  addRows: function(rows) {
                    angular.forEach(rows, function(row){
                      dataTable.rows.push(row);
                    }, dataTable);
                  }
                };
              }

              var timeline = [];

              var compareObj = {
                enabled: chart.requestWorking.timeCompareFrom !== null
              };

              if (compareObj.enabled) {
                compareObj.diffDays = ses_location_config_helpers.diffDays(chart.dataBaseOpts.timeFrom, chart.dataCompareOpts.timeCompareFrom);
                compareObj.mapCompareDate2Index = {};
                angular.forEach(chart.dataCompare.data.timeUTC, function (time, index) {
                  var date = new Date(time);
                  date.setDate(date.getDate() + compareObj.diffDays);
                  compareObj.mapCompareDate2Index[date.getTime()] = {index: index, used: false};
                });
              }

              angular.forEach(chart.dataBase.data.timeUTC, function (time, index) {
                var push = {
                  date: time,
                  indexBase: index
                };
                if (compareObj.enabled) {
                  if (compareObj.mapCompareDate2Index[push.date.getTime()] !== undefined) {
                    push.indexCompare = compareObj.mapCompareDate2Index[push.date.getTime()].index;
                    compareObj.mapCompareDate2Index[push.date.getTime()].used = true;
                  }
                }
                timeline.push(push);
              });

              if (compareObj.enabled) {
                angular.forEach(compareObj.mapCompareDate2Index, function (compareDate2Index, time) {
                  if (!compareDate2Index.used) {
                    var date = new Date();
                    date.setTime(time);
                    var push = {
                      date: date,
                      indexCompare: compareDate2Index.index
                    };
                    timeline.push(push);
                  }
                });
              }

              timeline.sort(function(a, b) {
                if (a.date < b.date) {
                  return -1;
                } else if (a.date > b.date) {
                  return 1;
                } else {
                  return 0;
                }
              });

              dataTable.addColumn('date', 'Time');

              var annotationsBase = {};
              var annotationsCompare = {};

              angular.forEach(chart.requestWorking.fieldsDisplayChart, function (fieldDisplay) {
                if (fieldDisplay.checked) {
                  if (compareObj.enabled && fieldDisplay.comparisonField) {

                    dataTable.addColumn('number', fieldDisplay.label);
                    dataTable.addColumn({type: 'string', role: 'tooltip'});

                  } else if (fieldDisplay.comparisonField === undefined || !fieldDisplay.comparisonField) {

                    var fieldPrefix = '';
                    if (compareObj.enabled) {
                      fieldPrefix = 'Base: ';
                    }

                    dataTable.addColumn('number', fieldPrefix.concat(fieldDisplay.label));
                    dataTable.addColumn({type: 'string', role: 'tooltip'});

                    if (fieldDisplay.annotations !== undefined) {
                      dataTable.addColumn({type: 'string', role: 'annotation'});
                      dataTable.addColumn({type: 'string', role: 'annotationText'});
                      annotationsBase[fieldDisplay.label] = fieldDisplay.annotations(chart.dataBaseOpts, chart.dataBase.data);
                    }

                    if (compareObj.enabled) {
                      dataTable.addColumn('number', 'Comparison: ' + fieldDisplay.label);
                      dataTable.addColumn({type: 'string', role: 'tooltip'});

                      if (fieldDisplay.annotations !== undefined) {
                        dataTable.addColumn({type: 'string', role: 'annotation'});
                        dataTable.addColumn({type: 'string', role: 'annotationText'});
                        annotationsCompare[fieldDisplay.label] = fieldDisplay.annotations(chart.dataCompareOpts, chart.dataCompare.data);
                      }
                    }
                  }
                }
              });

              var Helpers = {
                addField: function(row, fieldDisplay, singleDataObj, labelPrefix){
                  if (singleDataObj !== undefined && this.fieldsDataAvailable(fieldDisplay.fieldsData, singleDataObj)) {
                    var value = fieldDisplay.fun(singleDataObj);
                    var date = singleDataObj.timeUTC;

                    row.push(value);
                    var appendix = 'am';
                    var hours = date.getHours();
                    if (date.getHours() > 12) {
                      appendix = 'pm';
                      hours = date.getHours() - 12;
                    }
                    row.push(HelpersDate.getDayAbbr(date) + ' ' + HelpersDate.getMonthAbbr(date) + ' ' + date.getDate() + ', ' + date.getFullYear() +  ' ' + hours + ':' + ses_location_config_helpers.twoDigits(date.getMinutes()) + ' ' + appendix + ' : ' + value);
                  } else {
                    row.push(undefined);
                    row.push(undefined);
                  }
                },
                addAnnotation: function(row, index, annotations){
                  if (annotations[index] !== undefined) {
                    row.push(annotations[index].label);
                    row.push(annotations[index].value);
                  } else {
                    row.push(undefined);
                    row.push(undefined);
                  }
                },
                fieldsDataAvailable: function(fieldsData, obj) {
                  var available = true;
                  angular.forEach(fieldsData, function(fieldData) {
                    if (obj[fieldData] === null) {
                      available = false;
                    }
                  });
                  return available;
                },
                getSingleDataObj: function(data, fields, index) {
                  var singleDataObj = {};
                  singleDataObj.timeUTC = data.timeUTC[index];
                  angular.forEach(fields, function (field) {
                    singleDataObj[field] = data[field][index];
                  });
                  return singleDataObj;
                }
              };

              angular.forEach(timeline, function (entry) {

                var singleDataObjBase;
                if (entry.indexBase !== undefined) {
                  singleDataObjBase = Helpers.getSingleDataObj(chart.dataBase.data, chart.dataBaseOpts.fieldsData, entry.indexBase);
                }
                var singleDataObjCompare;
                if (entry.indexCompare !== undefined) {
                  singleDataObjCompare = Helpers.getSingleDataObj(chart.dataCompare.data, chart.dataCompareOpts.fieldsData, entry.indexCompare);
                }

                var row = [];

                row.push(entry.date);

                angular.forEach(chart.requestWorking.fieldsDisplayChart, function (fieldDisplay) {
                  if (fieldDisplay.checked) {
                    if (compareObj.enabled && fieldDisplay.comparisonField) {
                      if (singleDataObjBase !== undefined &&
                        singleDataObjCompare !== undefined &&
                        Helpers.fieldsDataAvailable(fieldDisplay.fieldsData, singleDataObjBase) &&
                        Helpers.fieldsDataAvailable(fieldDisplay.fieldsData, singleDataObjCompare)) {
                        var valueComparisonField = fieldDisplay.fun(singleDataObjBase, singleDataObjCompare);
                        row.push(valueComparisonField);
                        row.push('' + valueComparisonField);
                      } else {
                        row.push(undefined);
                        row.push(undefined);
                      }
                    } else if (fieldDisplay.comparisonField === undefined || !fieldDisplay.comparisonField) {
                      var fieldPrefix = '';
                      if (compareObj.enabled) {
                        fieldPrefix = 'Base: ';
                      }
                      Helpers.addField(row, fieldDisplay, singleDataObjBase, fieldPrefix);
                      if (fieldDisplay.annotations !== undefined) {
                        Helpers.addAnnotation(row, entry.indexBase, annotationsBase[fieldDisplay.label]);
                      }
                      if (compareObj.enabled) {
                        Helpers.addField(row, fieldDisplay, singleDataObjCompare, 'Comparison: ');
                        if (fieldDisplay.annotations !== undefined) {
                          Helpers.addAnnotation(row, entry.indexCompare, annotationsCompare[fieldDisplay.label]);
                        }
                      }
                    }
                  }
                });
                dataTable.addRows([row]);
              });

              var displayObj = angular.copy(chart.displayObjDefault);
              displayObj.data = dataTable;

              chart.displayObj = displayObj;

              chart.trigger++; // triggers the chart to draw

              if (!chart.renderChart) { // for testing
                chart.ready();
              }

              deferred.resolve();

            }, function () {
              deferred.reject('Could not load Google Chart API');
            });
        }, 0, false);

        return deferred.promise;
      },
      updateImpl: function() {

        var deferred = $q.defer();

        this.requestWorking = angular.copy(this.requestLast);

        this.warnings = [];

        this.invalid = false;

        var chart = this;

        $timeout(function () {

          var promises = [];

          var dataBaseOptsWorking = {
            locationID: angular.copy(chart.requestWorking.locationID),
            timeFrom: new Date(chart.requestWorking.timeFrom),
            timeTo: new Date(chart.requestWorking.timeTo),
            fieldsData: angular.copy(chart.requestWorking.fieldsData)
          };

          if (!angular.equals(chart.dataBaseOpts, dataBaseOptsWorking)) {

            var deferredInnerBase = $q.defer();
            EnergyStat.read(dataBaseOptsWorking.locationID,
              HelpersDate.dateConvertJS2MySQL(HelpersDate.dateConvertLocal2UTC(new Date(dataBaseOptsWorking.timeFrom))),
              HelpersDate.dateConvertJS2MySQL(HelpersDate.dateConvertLocal2UTC(new Date(dataBaseOptsWorking.timeTo))),
              dataBaseOptsWorking.fieldsData
            ).then(function(data){
                HelpersDate.dateArrayConvertMySQL2JS(data.data.timeUTC);
                HelpersDate.dateArrayConvertUTC2Local(data.data.timeUTC);
                chart.dataBase = data;
                chart.dataBaseOpts = dataBaseOptsWorking;
                deferredInnerBase.resolve();
              }, function(error){
                chart.warnings.push('Could not load base data: ' + error);
                deferredInnerBase.resolve();
              });
            promises.push(deferredInnerBase.promise);
          }

          var compareEnabled = chart.requestWorking.timeCompareFrom !== null;

          if (compareEnabled) {
            var dataCompareOptsWorking = {
              locationID: angular.copy(chart.requestWorking.locationID),
              timeCompareFrom: new Date(chart.requestWorking.timeCompareFrom),
              timeCompareTo: new Date(chart.requestWorking.timeCompareTo),
              fieldsData: angular.copy(chart.requestWorking.fieldsData)
            };

            if (!angular.equals(chart.dataCompareOpts, dataCompareOptsWorking)) {
              var deferredInnerCompare = $q.defer();
              EnergyStat.read(dataCompareOptsWorking.locationID,
                HelpersDate.dateConvertJS2MySQL(HelpersDate.dateConvertLocal2UTC(new Date(dataCompareOptsWorking.timeCompareFrom))),
                HelpersDate.dateConvertJS2MySQL(HelpersDate.dateConvertLocal2UTC(new Date(dataCompareOptsWorking.timeCompareTo))),
                dataCompareOptsWorking.fieldsData
              ).then(function(data){
                  HelpersDate.dateArrayConvertMySQL2JS(data.data.timeUTC);
                  HelpersDate.dateArrayConvertUTC2Local(data.data.timeUTC);
                  chart.dataCompare = data;
                  chart.dataCompareOpts = dataCompareOptsWorking;
                  deferredInnerCompare.resolve();
                }, function(error){
                  chart.warnings.push('Could not load base data: ' + error);
                  deferredInnerCompare.resolve();
                });
              promises.push(deferredInnerCompare.promise);
            }
          }

          $q.all(promises)
            .then(function() {
              return chart.updateReductions();
            })
            .then(function() {

              var fieldsDisplayChartValid = chart.requestWorking.fieldsDisplayChart !== undefined;
              if (fieldsDisplayChartValid) {
                fieldsDisplayChartValid = false;
                for (var i = 0; i < chart.requestWorking.fieldsDisplayChart.length; i++) {
                  if (chart.requestWorking.fieldsDisplayChart[i].checked) {
                    if (chart.requestWorking.fieldsDisplayChart[i].comparisonField !== undefined && chart.requestWorking.fieldsDisplayChart[i].comparisonField) {
                      if (chart.requestWorking.timeCompareFrom !== null) {
                        fieldsDisplayChartValid = true;
                        break;
                      }
                    } else {
                      fieldsDisplayChartValid = true;
                      break;
                    }
                  }
                }
              }

              if (!fieldsDisplayChartValid)
              {
                chart.warnings.push('No fields selected!');
                chart.invalid = true;
                chart.loading = false;
                return $q.defer().promise;
              } else {

                if (chart.dataBase.data === undefined || chart.dataBase.data.timeUTC === undefined || chart.dataBase.data.timeUTC.length === 0) {
                  chart.warnings.push('No data selected in base time range!');
                }
                if (compareEnabled && (chart.dataCompare.data === undefined || chart.dataCompare.data.timeUTC === undefined || chart.dataCompare.data.timeUTC.length === 0)) {
                  chart.warnings.push('No data selected in comparison time range!');
                }
                return chart.updateChart();
              }
            })
            .then(function() {
              deferred.resolve();
            });

        }, 0, false);

        return deferred.promise;
      },
      updateReductions: function() {

        var chart = this;

        return $timeout(function() {

          chart.reductions = [];

          var compareEnabled = chart.requestWorking.timeCompareFrom !== null;

          angular.forEach(chart.requestWorking.fieldsDisplayReductions, function(fieldDisplay) {

            if (compareEnabled && fieldDisplay.comparisonField) {
              chart.reductions.push({
                label: fieldDisplay.label,
                value: fieldDisplay.fun(chart.dataBaseOpts, chart.dataBase.data, chart.dataCompareOpts, chart.dataCompare.data)
              });
            } else if (fieldDisplay.comparisonField === undefined || !fieldDisplay.comparisonField) {

              var reductionObj;

              var fieldPrefix = '';
              if (compareEnabled) {
                fieldPrefix = 'Base: ';
              }

              chart.reductions.push({
                label: fieldPrefix.concat(fieldDisplay.label),
                value: fieldDisplay.fun(chart.dataBaseOpts, chart.dataBase.data)
              });

              if (compareEnabled) {
                chart.reductions.push({
                  label: 'Comparison: ' + fieldDisplay.label,
                  value: fieldDisplay.fun(chart.dataCompareOpts, chart.dataCompare.data)
                });
              }
            }
          });
        }, 0, false);
      }
    };
  }]);


services.factory('LocationDatepickers', ['HelpersDate',
  function (HelpersDate) {
    'use strict';

    return {
      timeCompareFrom: {
        enabled: false,
        date: new Date(),
        dateMin: new Date(),
        dateMax: new Date(),
        opened: false
      },
      timeCompareTo: {
        date: new Date()
      },
      timeDiffDays: 0,
      timeFrom: {
        date: new Date(),
        dateMin: new Date(),
        dateMax: new Date(),
        opened: false
      },
      timeTo: {
        date: new Date(),
        dateMin: new Date(),
        dateMax: new Date(),
        opened: false
      },
      initialize: function(range) {

        this.timeFrom.dateMin =  HelpersDate.dateConvertMySQL2JS(range[0], true);
        this.timeFrom.dateMax =  HelpersDate.dateConvertMySQL2JS(range[1], true);

        // try to set the starting dates on the first complete week if possible
        {
          this.timeFrom.date = HelpersDate.lastCompleteWeek(this.timeFrom.dateMax);
          if (this.timeFrom.date < this.timeFrom.dateMin) {
            this.timeFrom.date = new Date(this.timeFrom.dateMin);
          }

          this.timeCompareFrom.date = new Date(this.timeFrom.date);
          this.timeCompareFrom.date.setDate(this.timeCompareFrom.date.getDate() - 1);
          this.timeCompareFrom.date = HelpersDate.lastCompleteWeek(this.timeCompareFrom.date);
          if (this.timeCompareFrom.date < this.timeFrom.dateMin) {
            this.timeCompareFrom.date = new Date(this.timeFrom.dateMin);
          }

          this.timeDiffDays = 6;
        }

        this.updateTimeFrom();
      },
      updateTimeCompareFrom: function() {
        this.timeCompareTo.date = new Date(this.timeCompareFrom.date);
        this.timeCompareTo.date.setDate(this.timeCompareTo.date.getDate() + this.timeDiffDays);
      },
      updateTimeFrom: function() {

        this.timeTo.date = new Date(this.timeFrom.date);
        this.timeTo.date.setDate(this.timeTo.date.getDate() + this.timeDiffDays);
        if (this.timeTo.date > this.timeFrom.dateMax) {
          this.timeTo.date = new Date(this.timeFrom.dateMax);
        }

        this.timeTo.dateMin = new Date(this.timeFrom.date);

        this.timeTo.dateMax = new Date(this.timeFrom.date);
        this.timeTo.dateMax.setDate(this.timeTo.dateMax.getDate() + 6);
        if (this.timeTo.dateMax > this.timeFrom.dateMax) {
          this.timeTo.dateMax = new Date(this.timeFrom.dateMax);
        }

        this.updateTimeTo();
      },
      updateTimeTo: function() {

        this.timeDiffDays = ses_location_config_helpers.diffDays(this.timeTo.date, this.timeFrom.date);

        this.timeCompareFrom.dateMin = new Date(this.timeFrom.dateMin);
        this.timeCompareFrom.dateMax = new Date(this.timeFrom.dateMax);
        this.timeCompareFrom.dateMax.setDate(this.timeCompareFrom.dateMax.getDate() - this.timeDiffDays);

        if (this.timeCompareFrom.date > this.timeCompareFrom.dateMax) {
          this.timeCompareFrom.date = new Date(this.timeCompareFrom.dateMax);
        }

        this.updateTimeCompareFrom();
      }
    };
  }]);

services.factory('LocationFieldsCheck', ['$q', '$timeout',
  function ($q, $timeout) {
    'use strict';

    return function(location, fieldsData) {

      var deferred = $q.defer();
      $timeout(function(){

        location.warnings = [];

        // Check the location configuration file
        location.fieldsData = [];
        location.fieldsDisplayChart = angular.copy(ses_location_config[location.locationID].fieldsDisplayChart);
        location.fieldsDisplayReductions = angular.copy(ses_location_config[location.locationID].fieldsDisplayReductions);

        var processFieldDisplay = function(fieldsDisplay) {

          var fieldsDisplayRemove = [];

          angular.forEach(fieldsDisplay, function(fieldDisplay) {
            if (fieldDisplay.fieldsData === undefined) {
              location.warnings.push(location.locationID + '.js - Field does not contain fieldsData entry: ' + fieldDisplay.label);
              fieldsDisplayRemove.push(fieldDisplay);
            } else {
              angular.forEach(fieldDisplay.fieldsData, function(fieldData) {
                if (fieldsData.indexOf(fieldData) < 0) {
                  location.warnings.push(location.locationID + '.js - fieldDisplay `' + fieldDisplay.label + '` contains a field `' + fieldData + '` that is not a field on the server');
                  fieldsDisplayRemove.push(fieldDisplay);
                } else {
                  if (location.fieldsData.indexOf(fieldData) < 0){
                    location.fieldsData.push(fieldData);
                  }
                }
              });
            }
          });

          angular.forEach(fieldsDisplayRemove, function(fieldDisplayRemove) {
            var index = fieldsDisplay.indexOf(fieldDisplayRemove);
            if (index >= 0) {
              fieldsDisplay.splice(index, 1);
            }
          });

        };

        processFieldDisplay(location.fieldsDisplayChart);
        processFieldDisplay(location.fieldsDisplayReductions);

        deferred.resolve(location);
      }, 0, false);

      return deferred.promise;

    };
  }]);


var ses_location_config_helpers = {
  calculateIntegral: function(data, field) {
    'use strict';

    if (data.timeUTC === undefined || data.timeUTC.length <= 1) {
      return 0;
    }

    var total = 0;

    var d0 = data.timeUTC[0];

    for (var i = 1; i < data.timeUTC.length; i++) {
      if (data[field][i] !== undefined && data[field][i] !== null) {
        var d1 = data.timeUTC[i];
        var hour = (d1.getTime() - d0.getTime()) / (1000 * 60 * 60);
        total += hour * data[field][i];
        d0 = d1;
      }
    }

    return total.toFixed(2);
  },
  diffDays: function(a, b) {
    'use strict';

    var timeDiff = a.getTime() - b.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  },
  formatPercent: function(value) {
    'use strict';

    var valueNeg = value < 0;
    var parensA = '';
    var parensB = '';
    if (valueNeg) {
      parensA = '(';
      parensB = ')';
    }
    return parensA + (Math.abs(value) * 100).toFixed(2) + '%' + parensB;
  },
  generateAnnotationsMinMaxByDay: function(data, field) {
    'use strict';

    var annotations = {};

    if (data.timeUTC === undefined || data.timeUTC.length <= 0) {
      return annotations;
    }

    var setDateToZero = function(date) {
      date.setHours(0);
      date.setMinutes(0);
      date.setMilliseconds(0);
      return date;
    };

    var minMaxObj = {
      reset: function(index, value) {
        delete this.max;
        delete this.maxIndex;
        delete this.min;
        delete this.minIndex;

        this.update(index, value);
      },
      update: function(index, value) {
        if (value !== undefined && value !== null) {
          if (this.max === undefined || value > this.max) {
            this.max = value;
            this.maxIndex = index;
          }
          if (this.min === undefined || value < this.min) {
            this.min = value;
            this.minIndex = index;
          }
        }
      }
    };

    var addAnnotation = function(minMaxObj) {
      if (minMaxObj.minIndex !== minMaxObj.maxIndex) {
        annotations[minMaxObj.minIndex] = { label: 'min', value: '' + minMaxObj.min };
        annotations[minMaxObj.maxIndex] = { label: 'max', value: '' + minMaxObj.max };
      } else {
        annotations[minMaxObj.minIndex] = { label: 'min/max', value: '' + minMaxObj.min };
      }
    };

    var d0 = setDateToZero(new Date(data.timeUTC[0]));

    minMaxObj.reset(0, data[field][0]);

    for (var i = 1; i < data.timeUTC.length; i++) {
      var d1 = setDateToZero(new Date(data.timeUTC[i]));

      var diffDays = this.diffDays(d1, d0);

      var value = data[field][i];

      if (diffDays > 0) {
        addAnnotation(minMaxObj);
        minMaxObj.reset(i, value);
        d0 = d1;
      } else {
        minMaxObj.update(i, value);
      }
    }

    addAnnotation(minMaxObj);

    return annotations;
  },
  twoDigits: function (d) {
    'use strict';

    if(0 <= d && d < 10) {
      return "0" + d.toString();
    }
    if(-10 < d && d < 0) {
      return "-0" + (-1 * d).toString();
    }
    return d.toString();
  }
};
