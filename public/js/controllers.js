/* global angular */
/* global ses_location_config */

// Sensible Energy Solutions LLC

/* Controllers */

var controllers = angular.module('ses_dashboard.controllers', [
  'googlechart'
]);

controllers.controller('AboutCtrl', ['$scope',
  function ($scope) {
  }
]);

controllers.controller('LocationCtrl', ['EnergyStat', 'LoadScript', '$location', 'LocationChart', 'LocationDatepickers', 'LocationFieldsCheck', 'Locations', '$q', '$routeParams', '$scope', '$timeout',
  function (EnergyStat, LoadScript, $location, LocationChart,  LocationDatepickers, LocationFieldsCheck, Locations, $q, $routeParams, $scope, $timeout) {

    'use strict';

    // ***********************************************************************
    // Check for configuration

    $scope.locationAlert = { message: 'Loading...', info: true };

    // Check to make sure that the locationID has been defined
    if ($routeParams.locationID === undefined) {
      $location.url('/');
      return;
    }

    $scope.location = {};
    $scope.location.locationID = $routeParams.locationID;

    // Check to make sure that the locationID has a valid entry in locations.js
    if (Locations[$scope.location.locationID] === undefined) {
      $scope.locationAlert = { message: 'locations.js - Location not defined: ' + $scope.location.locationID, danger: true };
      return;
    } else {
      $scope.location.label = Locations[$scope.location.locationID];
    }

    // ***********************************************************************
    // controller

    $scope.getFieldDisplayEnabled = function(fieldDisplay) {
      if (fieldDisplay.comparisonField !== undefined && fieldDisplay.comparisonField && !$scope.datepickers.timeCompareFrom.enabled) {
        return false;
      }
      return true;
    };

    $scope.getFieldDisplayTooltip = function(fieldDisplay) {
      if (fieldDisplay.comparisonField !== undefined && fieldDisplay.comparisonField && !$scope.datepickers.timeCompareFrom.enabled) {
        return 'Enable the comparison date range to view a comparison field.';
      }
      return undefined;
    };

    $scope.expandedDateRanges = true;
    $scope.expandedFields = true;

    // ***********************************************************************
    // chart

    $scope.chart = LocationChart;
    $scope.chart.displayObj = undefined;

    $scope.chart.onUpdate = function() {
      return $scope.chart.update(
        $scope.location.locationID,
        $scope.datepickers.timeFrom.date,
        $scope.datepickers.timeTo.date,
        ($scope.datepickers.timeCompareFrom.enabled) ? $scope.datepickers.timeCompareFrom.date : null,
        $scope.datepickers.timeCompareTo.date,
        $scope.location.fieldsDisplayChart,
        $scope.location.fieldsDisplayReductions,
        $scope.location.fieldsData);
    };

    // ***********************************************************************
    // datepickers

    $scope.datepickers = LocationDatepickers;

    $scope.datepickers.onTimeCompareFromChanged = function() {
      $scope.chart.dataCompareLoaded = false;
      this.updateTimeCompareFrom();
      $scope.chart.onUpdate();
    };

    $scope.datepickers.onTimeFromChanged = function() {
      $scope.chart.dataBaseLoaded = false;
      this.updateTimeFrom();
      $scope.chart.onUpdate();
    };

    $scope.datepickers.onTimeToChanged = function() {
      $scope.chart.dataBaseLoaded = false;
      this.updateTimeTo();
      $scope.chart.onUpdate();
    };

    $scope.datepickers.opened = function(datePicker, $event) {
      $event.preventDefault();
      $event.stopPropagation();
      this[datePicker].opened = true;
    };

    $scope.datepickers.options = {
      formatYear: 'yyyy',
      'show-weeks': false
    };

    // ***********************************************************************
    // load

    EnergyStat.locations().then(
      function(locations) {
        var deferred = $q.defer();
        $timeout(function() {
          // Make sure our location is in the server's list of locations
          if (locations.indexOf($scope.location.locationID) === -1) {
            deferred.reject('Server reports not a valid location');
          } else {
            // Download the location specific configuration script
            LoadScript('location_config/' + $scope.location.locationID + '.js').then(function() {
                if (ses_location_config[$scope.location.locationID].fieldsDisplayChart === undefined) {
                  deferred.reject($scope.location.locationID + '.js - Fields not defined');
                } else {
                  deferred.resolve();
                }
              },
              function() {
                deferred.reject($scope.location.locationID + '.js - Does not exist');
              });
          }
        }, 0, false);
        return deferred.promise;
      },
      function(error) {
        $scope.locationAlert = { message: error, danger: true };
      })
      .then(function() {
        return EnergyStat.fields($scope.location.locationID);
      }, function(error) {
        $scope.locationAlert = { message: error + ': ' + $scope.location.locationID, danger: true };
      })
      .then(function(fieldsData) {
        return LocationFieldsCheck($scope.location, fieldsData);
      }, function(error) {
        $scope.locationAlert = { message: error + ': ' + $scope.location.locationID, danger: true };
      })
      .then(function(location) {
        $scope.location = location;
        return EnergyStat.range($scope.location.locationID);
      }, function(error) {
        $scope.locationAlert = { message: error + ': ' + $scope.location.locationID, danger: true };
      })
      .then(function(range) {
        $scope.datepickers.initialize(range);
        $scope.location.loaded = true;
        delete $scope.locationAlert;
        return $scope.chart.onUpdate();
      }, function(error) {
        $scope.locationAlert = { message: error + ': ' + $scope.location.locationID, danger: true };
      });

  }

]);

controllers.controller('LocationsAllCtrl', ['EnergyStat', '$location', 'Locations', '$scope',
  function (EnergyStat, $location, Locations, $scope) {
    'use strict';

    $scope.go = $location;

    $scope.locationsAlert = { message: 'Loading all locations...', info: true };
    $scope.locationsError = [];
    $scope.locations = [];

    EnergyStat.locations().then(
      function(locations) {

        delete $scope.locationsAlert;

        angular.forEach(locations, function(location) {

          if (Locations[location]) {
            $scope.locations.push({ name: Locations[location], locationID: location});
          }
          else {
            $scope.locationsError.push(location);

            $scope.locationsAlert = { message: 'locations.js - Location(s) not defined: ', warning: true };

            $scope.locationsAlert.message = $scope.locationsAlert.message.concat(': ');

            angular.forEach($scope.locationsError, function(locationError, index) {
              if (index > 0) {
                this.locationsAlert.message = this.locationsAlert.message.concat(', ');
              }
              this.locationsAlert.message = this.locationsAlert.message.concat(locationError);
            }, $scope);
          }
        });

        $scope.locationLoaded = true;

      },
      function(error) {
        $scope.locationsAlert = { message: error, danger: true };
      });
  }
]);

controllers.controller('RootCtrl', [
  function () {
    'use strict';

  }
]);

controllers.controller('ServiceTestCtrl', ['googleChartApiPromise', '$q', '$scope', 'Service', '$timeout',
  function (googleChartApiPromise, $q, $scope, Service, $timeout) {
    'use strict';

    $scope.showPower = 'false';

    $scope.chartLoaded = false;

    $scope.updateChart = function () {

      $scope.chartLoaded = false;

      $timeout(function () {

        var dataTable = new google.visualization.DataTable();
        dataTable.addColumn('date', 'Time');
        dataTable.addColumn('number', 'Basement_office_Degrees_F');
        dataTable.addColumn('number', 'Supply_boiler_Degrees_F');

        if ($scope.showPower === 'true') {
          dataTable.addColumn('number', 'Total_Net_Instantaneous_Real_Power_kW');
        }

        // A column for custom tooltip content
        /*
         dataTable.addColumn(
         {
         type: 'string',
         role: 'tooltip'
         });
         */

        var data = $scope.stats.data;

        data.timeUTC.forEach(function (time, index) {

          var t = time.split(/[- :]/);

          if ($scope.showPower === 'true') {
            dataTable.addRows([
              [new Date(t[0], t[1] - 1, t[2], t[3], t[4], t[5]),
                data.Basement_office_Degrees_F[index],
                data.Supply_boiler_Degrees_F[index],
                data.Total_Net_Instantaneous_Real_Power_kW[index]
              ]
            ]);
          }
          else {
            dataTable.addRows([
              [new Date(t[0], t[1] - 1, t[2], t[3], t[4], t[5]),
                data.Basement_office_Degrees_F[index],
                data.Supply_boiler_Degrees_F[index]
              ]
            ]);
          }
        });

        $scope.chart = {
          type: "LineChart",
          displayed: true,
          data: dataTable,
          options: {
            explorer: {},
            hAxis: {
              title: 'time'
            }
          }
        };

      });
    };

    $scope.chartReady = function() {
      $scope.chartLoaded = true;
    };

    $scope.alertLocations = { message: 'Loading the Googles...', info: true };

    googleChartApiPromise.then(function () {
      return Service.callGet('/energystat/locations', 'Could not retrieve locations.');
    })
      .then(function (locations) {

        $scope.alertLocations = { message: 'Retrieving locations...', info: true };

        $scope.alertLocations = { message: 'Locations retrieved!', success: true };
        $scope.locations = locations;


        $scope.alertFields = { message: 'Retrieving fields for location mc_courthouse...', info: true };
        return Service.callGet('/energystat/fields/mc_courthouse', 'Could not retrieve fields for mc_courthouse.');
      })
      .then(function (fields) {
        // FIELDS
        $scope.alertFields = { message: 'Fields for location mc_courthouse Retrieved!', success: true };
        $scope.fields = fields;

        // DATA
        $scope.alertRead = { message: 'Retrieving data for location mc_courthouse...', info: true };
        return Service.callPost('/energystat/read/mc_courthouse',
          {
            timeFrom: '2014-03-14',
            timeTo: '2014-03-17',
            fields: ['1st_Floor_Occupied_Degrees_F', 'Basement_office_Degrees_F', 'Supply_boiler_Degrees_F', 'Total_Net_Instantaneous_Real_Power_kW']
          },
          'Could not retrieve fields for mc_courthouse.');
      })
      .then(function (stats) {
        $scope.alertRead = { message: 'Read data for location mc_courthouse!', success: true };
        $scope.stats = stats;
        $scope.updateChart();
      },
      function (error) {
        $scope.alertRead = { message: 'Could not retrieve data for location mc_courthouse.', danger: true };
      });
  }

]);
