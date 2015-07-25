/* global afterEach */
/* global angular */
/* global beforeEach */
/* global describe */
/* global expect */
/* global inject */
/* global it */
/* global module */
/* global ses_location_config */
/* global ses_location_config_helpers */

ses_location_config // <- don't change this variable name!

  .mc_courthouse = { // <- make sure you change this one to the same name as the location's table!!!

    fieldsDisplayChart: [
      {
        label: 'Total Net Instantaneous Real Power (kW)',
        fieldsData: ['Total_Net_Instantaneous_Real_Power_kW'],
        annotations: function(dataOpts, data) {
          'use strict';

          return ses_location_config_helpers.generateAnnotationsMinMaxByDay(data, 'Total_Net_Instantaneous_Real_Power_kW');
        },
        checked: true,
        fun: function(data) {
          'use strict';

          return data.Total_Net_Instantaneous_Real_Power_kW;
        }
      },
      {
        label: 'Difference in Total Net Instantaneous Real Power (kW)',
        fieldsData: ['Total_Net_Instantaneous_Real_Power_kW'],
        comparisonField: true,
        checked: true,
        fun: function(dataBase, dataComparison) {
          'use strict';

          return dataBase.Total_Net_Instantaneous_Real_Power_kW - dataComparison.Total_Net_Instantaneous_Real_Power_kW;
        }
      },
      {
        label: 'Basement Office (F)',
        fieldsData: ['Basement_office_Degrees_F'],
        checked: true,
        fun: function(data) {
          'use strict';

          return data.Basement_office_Degrees_F;
        }
      },
      {
        label: 'Supply Boiler (F)',
        fieldsData: ['Supply_boiler_Degrees_F'],
        checked: true,
        fun: function(data) {
          'use strict';

          return data.Supply_boiler_Degrees_F;
        }
      }
    ],
    fieldsDisplayReductions: [
      {
        label: 'Savings / Loss',
        fieldsData: ['Total_Net_Instantaneous_Real_Power_kW'],
        comparisonField: true,
        fun: function(dataBaseOpts, dataBase, dataComparisonOpts, dataComparison) {
          'use strict';

          var base = ses_location_config_helpers.calculateIntegral(dataBase,'Total_Net_Instantaneous_Real_Power_kW');
          var comparison = ses_location_config_helpers.calculateIntegral(dataComparison,'Total_Net_Instantaneous_Real_Power_kW');

          return ses_location_config_helpers.formatPercent(((comparison - base) / base));
        }
      },
      {
        label: 'kWh',
        fieldsData: ['Total_Net_Instantaneous_Real_Power_kW'],
        fun: function(dataOpts, data) {
          'use strict';

          return ses_location_config_helpers.calculateIntegral(data,'Total_Net_Instantaneous_Real_Power_kW');
        }
      },
      {
        label: 'Peak kW',
        fieldsData: ['Total_Net_Instantaneous_Real_Power_kW'],
        fun: function(dataOpts, data) {
          'use strict';

          return Math.max.apply(Math, data.Total_Net_Instantaneous_Real_Power_kW);
        }
      }
    ]};

describe('ses_location_config_helpers', function () {
  'use strict';

  beforeEach(module('ses_dashboard.services'));

  describe('ses_location_config_helpers', function () {

    var HelpersDate;

    beforeEach(inject(function (_HelpersDate_) {
      HelpersDate = _HelpersDate_;
    }));

    it('should have null equal to zero', function () {
      expect(null < 0.1).toBe(true);
      expect(null > -0.1).toBe(true);
    });

    it('should pick the minimum and maximum over a set of days', function () {

      var data = {
        "timeUTC": ["2014-07-13 00:00:00", "2014-07-13 00:15:00", "2014-07-13 00:30:00", "2014-07-13 00:45:00", "2014-07-13 01:00:00",
          "2014-07-14 00:00:00", "2014-07-14 00:15:00", "2014-07-14 00:30:00", "2014-07-14 00:45:00", "2014-07-14 01:00:00",
          "2014-07-15 00:00:00", "2014-07-15 00:15:00", "2014-07-15 00:30:00", "2014-07-15 00:45:00", "2014-07-15 01:00:00",
          "2014-07-16 00:00:00", "2014-07-16 00:15:00", "2014-07-16 00:30:00", "2014-07-16 00:45:00", "2014-07-16 01:00:00"],
        "Total_Net_Instantaneous_Real_Power_kW": [149.33, 132.23, 167.8, 123.0, 150.86,
          12.6, 84.3, 28.4, 45.3, 105.23,
          124.6, 834.3, 28.4, 454.3, 15.23,
          null, 12.0, 28.4, null, null]
      };

      HelpersDate.dateArrayConvertMySQL2JS(data.timeUTC);

      var annotations = ses_location_config.mc_courthouse.fieldsDisplayChart[0].annotations(null, data, 'Total_Net_Instantaneous_Real_Power_kW');

      expect(annotations).toBeDefined();
      var count = 0;
      angular.forEach(annotations, function (annotation) {
        count++;
      });
      expect(count).toBe(8);

      expect(annotations[2].label).toBe('max');
      expect(annotations[2].value).toBe('167.8');
      expect(annotations[3].label).toBe('min');
      expect(annotations[3].value).toBe('123');

      expect(annotations[5].label).toBe('min');
      expect(annotations[5].value).toBe('12.6');
      expect(annotations[9].label).toBe('max');
      expect(annotations[9].value).toBe('105.23');

      expect(annotations[11].label).toBe('max');
      expect(annotations[11].value).toBe('834.3');
      expect(annotations[14].label).toBe('min');
      expect(annotations[14].value).toBe('15.23');

      expect(annotations[16].label).toBe('min');
      expect(annotations[16].value).toBe('12');
      expect(annotations[17].label).toBe('max');
      expect(annotations[17].value).toBe('28.4');

    });

  });

});

describe('service', function () {
  'use strict';

  beforeEach(module('ses_dashboard.services'));

  describe('LocationChart', function () {

    var $httpBackend, HelpersDate, LocationChart, $timeout;

    beforeEach(inject(function (_$httpBackend_, _HelpersDate_, _LocationChart_, _$timeout_) {

      $httpBackend = _$httpBackend_;

      HelpersDate = _HelpersDate_;

      LocationChart = _LocationChart_;
      LocationChart.renderChart = false;

      $timeout = _$timeout_;
    }));

    afterEach(function () {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should create a chart with a gap in one of the data sets', function () {

      expect(LocationChart.invalid).toBe(false);
      expect(LocationChart.loading).toBe(false);

      var readBaseResponseObj = {
        "errors": [],
        "data": {
          "timeUTC": ["2014-07-13 00:00:00", "2014-07-13 00:15:00", "2014-07-13 00:30:00", "2014-07-13 00:45:00", "2014-07-13 01:00:00"],
          "Total_Net_Instantaneous_Real_Power_kW": [149.33, null, null, null, 150.86],
          "Basement_office_Degrees_F": [73.93, 73.72, 73.73, 73.7, 74.16],
          "Supply_boiler_Degrees_F": [143.44, 141.82, 144.44, 144.05, 142.43]
        }
      };

      $httpBackend.expectPOST('/energystat/read/mc_courthouse').respond(200, readBaseResponseObj);

      var readCompareResponseObj = {
        "errors": [],
        "data": {
          "timeUTC": ["2014-07-06 00:00:00", "2014-07-06 00:42:00", "2014-07-06 01:00:00"],
          "Total_Net_Instantaneous_Real_Power_kW": [85.11, 86.2, 87.26],
          "Basement_office_Degrees_F": [null, 64.7, 71.79],
          "Supply_boiler_Degrees_F": [145.06, null, 144.79]
        }
      };

      $httpBackend.expectPOST('/energystat/read/mc_courthouse').respond(200, readCompareResponseObj);

      var fieldsData = [];

      var fieldsDisplayChart = ses_location_config.mc_courthouse.fieldsDisplayChart;

      angular.forEach(fieldsDisplayChart, function (fieldDisplay) {
        angular.forEach(fieldDisplay.fieldsData, function (fieldData) {
          if (fieldsData.indexOf(fieldData) < 0) {
            fieldsData.push(fieldData);
          }
        });
      });

      var fieldsDisplayReductions = ses_location_config.mc_courthouse.fieldsDisplayReductions;

      angular.forEach(fieldsDisplayReductions, function (fieldDisplay) {
        angular.forEach(fieldDisplay.fieldsData, function (fieldData) {
          if (fieldsData.indexOf(fieldData) < 0) {
            fieldsData.push(fieldData);
          }
        });
      });

      var resolved;

      LocationChart.update(
        'mc_courthouse',
        HelpersDate.dateConvertMySQL2JS("2014-07-13 00:00:00"),
        HelpersDate.dateConvertMySQL2JS("2014-07-13 01:15:00"),
        HelpersDate.dateConvertMySQL2JS("2014-07-06 00:00:00"),
        HelpersDate.dateConvertMySQL2JS("2014-07-06 01:15:00"),
        fieldsDisplayChart,
        fieldsDisplayReductions,
        fieldsData
      );

      $timeout.flush();
      $httpBackend.flush();
      $timeout.flush();

      expect(LocationChart.displayObj).toBeDefined();
      expect(LocationChart.displayObj.data).toBeDefined();
      expect(LocationChart.displayObj.data.columns.length).toBe(19);

      expect(LocationChart.displayObj.data.columns[0].name).toBe('Time');
      expect(LocationChart.displayObj.data.columns[1].name).toBe('Base: Total Net Instantaneous Real Power (kW)');
      expect(LocationChart.displayObj.data.columns[2].name).toBeUndefined();
      expect(LocationChart.displayObj.data.columns[3].name).toBeUndefined();
      expect(LocationChart.displayObj.data.columns[4].name).toBeUndefined();
      expect(LocationChart.displayObj.data.columns[5].name).toBe('Comparison: Total Net Instantaneous Real Power (kW)');
      expect(LocationChart.displayObj.data.columns[6].name).toBeUndefined();
      expect(LocationChart.displayObj.data.columns[7].name).toBeUndefined();
      expect(LocationChart.displayObj.data.columns[8].name).toBeUndefined();
      expect(LocationChart.displayObj.data.columns[9].name).toBe('Difference in Total Net Instantaneous Real Power (kW)');
      expect(LocationChart.displayObj.data.columns[10].name).toBeUndefined();
      expect(LocationChart.displayObj.data.columns[11].name).toBe('Base: Basement Office (F)');
      expect(LocationChart.displayObj.data.columns[12].name).toBeUndefined();
      expect(LocationChart.displayObj.data.columns[13].name).toBe('Comparison: Basement Office (F)');
      expect(LocationChart.displayObj.data.columns[14].name).toBeUndefined();
      expect(LocationChart.displayObj.data.columns[15].name).toBe('Base: Supply Boiler (F)');
      expect(LocationChart.displayObj.data.columns[16].name).toBeUndefined();
      expect(LocationChart.displayObj.data.columns[17].name).toBe('Comparison: Supply Boiler (F)');
      expect(LocationChart.displayObj.data.columns[18].name).toBeUndefined();

      expect(LocationChart.displayObj.data.rows[0][0].toUTCString()).toBe(HelpersDate.dateConvertUTC2Local(HelpersDate.dateConvertMySQL2JS("2014-07-13 00:00:00")).toUTCString());
      expect(LocationChart.displayObj.data.rows[1][0].toUTCString()).toBe(HelpersDate.dateConvertUTC2Local(HelpersDate.dateConvertMySQL2JS("2014-07-13 00:15:00")).toUTCString());
      expect(LocationChart.displayObj.data.rows[2][0].toUTCString()).toBe(HelpersDate.dateConvertUTC2Local(HelpersDate.dateConvertMySQL2JS("2014-07-13 00:30:00")).toUTCString());
      expect(LocationChart.displayObj.data.rows[3][0].toUTCString()).toBe(HelpersDate.dateConvertUTC2Local(HelpersDate.dateConvertMySQL2JS("2014-07-13 00:42:00")).toUTCString());
      expect(LocationChart.displayObj.data.rows[4][0].toUTCString()).toBe(HelpersDate.dateConvertUTC2Local(HelpersDate.dateConvertMySQL2JS("2014-07-13 00:45:00")).toUTCString());
      expect(LocationChart.displayObj.data.rows[5][0].toUTCString()).toBe(HelpersDate.dateConvertUTC2Local(HelpersDate.dateConvertMySQL2JS("2014-07-13 01:00:00")).toUTCString());

      expect(LocationChart.displayObj.data.rows[0][1]).toBe(149.33);
      expect(LocationChart.displayObj.data.rows[1][1]).toBeUndefined();
      expect(LocationChart.displayObj.data.rows[2][1]).toBeUndefined();
      expect(LocationChart.displayObj.data.rows[3][1]).toBeUndefined();
      expect(LocationChart.displayObj.data.rows[4][1]).toBeUndefined();
      expect(LocationChart.displayObj.data.rows[5][1]).toBe(150.86);

      expect(LocationChart.displayObj.data.rows[0][3]).toBe('min');
      expect(LocationChart.displayObj.data.rows[1][3]).toBeUndefined();
      expect(LocationChart.displayObj.data.rows[2][3]).toBeUndefined();
      expect(LocationChart.displayObj.data.rows[3][3]).toBeUndefined();
      expect(LocationChart.displayObj.data.rows[4][3]).toBeUndefined();
      expect(LocationChart.displayObj.data.rows[5][3]).toBe('max');

      expect(LocationChart.displayObj.data.rows[0][4]).toBe('149.33');
      expect(LocationChart.displayObj.data.rows[1][4]).toBeUndefined();
      expect(LocationChart.displayObj.data.rows[2][4]).toBeUndefined();
      expect(LocationChart.displayObj.data.rows[3][4]).toBeUndefined();
      expect(LocationChart.displayObj.data.rows[4][4]).toBeUndefined();
      expect(LocationChart.displayObj.data.rows[5][4]).toBe('150.86');

      expect(LocationChart.displayObj.data.rows[0][5]).toBe(85.11);
      expect(LocationChart.displayObj.data.rows[1][5]).toBeUndefined();
      expect(LocationChart.displayObj.data.rows[2][5]).toBeUndefined();
      expect(LocationChart.displayObj.data.rows[3][5]).toBe(86.2);
      expect(LocationChart.displayObj.data.rows[4][5]).toBeUndefined();
      expect(LocationChart.displayObj.data.rows[5][5]).toBe(87.26);

      expect(LocationChart.displayObj.data.rows[0][9]).toBe(64.22000000000001);
      expect(LocationChart.displayObj.data.rows[1][9]).toBeUndefined();
      expect(LocationChart.displayObj.data.rows[2][9]).toBeUndefined();
      expect(LocationChart.displayObj.data.rows[3][9]).toBeUndefined();
      expect(LocationChart.displayObj.data.rows[4][9]).toBeUndefined();
      expect(LocationChart.displayObj.data.rows[5][9]).toBe(63.60000000000001);

      expect(LocationChart.reductions[0].label).toBe('Savings / Loss');
      expect(LocationChart.reductions[0].value).toBe('(42.65%)');
      expect(LocationChart.reductions[1].label).toBe('Base: kWh');
      expect(LocationChart.reductions[1].value).toBe('150.86');
      expect(LocationChart.reductions[2].label).toBe('Comparison: kWh');
      expect(LocationChart.reductions[2].value).toBe('86.52');
      expect(LocationChart.reductions[3].label).toBe('Base: Peak kW');
      expect(LocationChart.reductions[3].value).toBe(150.86);
      expect(LocationChart.reductions[4].label).toBe('Comparison: Peak kW');
      expect(LocationChart.reductions[4].value).toBe(87.26);

  });

    describe('LocationDatepickers', function () {

      var HelpersDate, LocationDatepickers;

      beforeEach(inject(function (_HelpersDate_, _LocationDatepickers_) {

        HelpersDate = _HelpersDate_;

        LocationDatepickers = _LocationDatepickers_;

      }));

      it('should initialize itself properly', function () {

        var testRange = function(range, timeFrom, timeTo, timeCompareFrom) {

          LocationDatepickers.initialize(range);

          var rangeMin = HelpersDate.dateConvertMySQL2JS(range[0], true);
          var rangeMax = HelpersDate.dateConvertMySQL2JS(range[1], true);
          var rangeMaxPlus1 = new Date(rangeMax);
          rangeMaxPlus1.setDate(rangeMaxPlus1.getDate() + 1);

          expect(LocationDatepickers.timeFrom.date.toUTCString()).toBe(HelpersDate.dateConvertMySQL2JS(timeFrom).toUTCString());
          expect(LocationDatepickers.timeFrom.dateMin.toUTCString()).toBe(rangeMin.toUTCString());
          expect(LocationDatepickers.timeFrom.dateMax.toUTCString()).toBe(rangeMax.toUTCString());

          var timeToMin = new Date(LocationDatepickers.timeFrom.date);
          var timeToMax = new Date(LocationDatepickers.timeFrom.date);
          timeToMax.setDate(timeToMax.getDate() + 6);

          if (timeToMax > rangeMax) {
            timeToMax = new Date(rangeMax);
          }

          expect(LocationDatepickers.timeTo.date.toUTCString()).toBe(HelpersDate.dateConvertMySQL2JS(timeTo).toUTCString());
          expect(LocationDatepickers.timeTo.dateMin.toUTCString()).toBe(timeToMin.toUTCString());
          expect(LocationDatepickers.timeTo.dateMax.toUTCString()).toBe(timeToMax.toUTCString());

          var timeCompareFromMax = new Date(rangeMax);
          timeCompareFromMax.setDate(timeCompareFromMax.getDate() - ses_location_config_helpers.diffDays(LocationDatepickers.timeTo.date, LocationDatepickers.timeFrom.date));

          expect(LocationDatepickers.timeCompareFrom.date.toUTCString()).toBe(HelpersDate.dateConvertMySQL2JS(timeCompareFrom).toUTCString());
          expect(LocationDatepickers.timeCompareFrom.dateMin.toUTCString()).toBe(rangeMin.toUTCString());
          expect(LocationDatepickers.timeCompareFrom.dateMax.toUTCString()).toBe(timeCompareFromMax.toUTCString());

          var timeCompareTo = new Date(LocationDatepickers.timeCompareFrom.date);
          timeCompareTo.setDate(timeCompareTo.getDate() + ses_location_config_helpers.diffDays(LocationDatepickers.timeTo.date, LocationDatepickers.timeFrom.date));

          expect(LocationDatepickers.timeCompareTo.date.toUTCString()).toBe(timeCompareTo.toUTCString());
          expect(LocationDatepickers.timeCompareTo.date).toBeLessThan(rangeMaxPlus1);
        };

        testRange(["2014-06-16 00:00:00", "2014-07-04 00:00:00"], "2014-06-22 00:00:00", "2014-06-28 00:00:00", "2014-06-16 00:00:00");

        /*
        LocationDatepickers.initialize(["2014-06-16 00:00:00", "2014-07-04 00:00:00"]);

        expect(LocationDatepickers.timeFrom.dateMin.toUTCString()).toBe(HelpersDate.dateConvertMySQL2JS("2014-06-16 00:00:00").toUTCString());
        expect(LocationDatepickers.timeFrom.dateMax.toUTCString()).toBe(HelpersDate.dateConvertMySQL2JS("2014-06-16 00:00:00").toUTCString());


        expect(LocationDatepickers.timeTo.date.toUTCString()).toBe(HelpersDate.dateConvertMySQL2JS("2014-06-29 00:00:00").toUTCString());
        expect(LocationDatepickers.timeCompareFrom.date.toUTCString()).toBe(HelpersDate.dateConvertMySQL2JS("2014-06-16 00:00:00").toUTCString());
        expect(LocationDatepickers.timeCompareTo.date.toUTCString()).toBe(HelpersDate.dateConvertMySQL2JS("2014-06-24 00:00:00").toUTCString());


        LocationDatepickers.initialize(["2014-06-23 00:00:00", "2014-07-04 00:00:00"]);
        expect(LocationDatepickers.timeFrom.date.toUTCString()).toBe(HelpersDate.dateConvertMySQL2JS("2014-06-23 00:00:00").toUTCString());
        expect(LocationDatepickers.timeTo.date.toUTCString()).toBe(HelpersDate.dateConvertMySQL2JS("2014-06-30 00:00:00").toUTCString());
        expect(LocationDatepickers.timeCompareFrom.date.toUTCString()).toBe(HelpersDate.dateConvertMySQL2JS("2014-06-23 00:00:00").toUTCString());
        expect(LocationDatepickers.timeCompareTo.date.toUTCString()).toBe(HelpersDate.dateConvertMySQL2JS("2014-06-30 00:00:00").toUTCString());

        LocationDatepickers.initialize(["2014-06-29 00:00:00", "2014-07-04 00:00:00"]);
        expect(LocationDatepickers.timeFrom.date.toUTCString()).toBe(HelpersDate.dateConvertMySQL2JS("2014-06-23 00:00:00").toUTCString());
        expect(LocationDatepickers.timeTo.date.toUTCString()).toBe(HelpersDate.dateConvertMySQL2JS("2014-06-30 00:00:00").toUTCString());
        expect(LocationDatepickers.timeCompareFrom.date.toUTCString()).toBe(HelpersDate.dateConvertMySQL2JS("2014-06-23 00:00:00").toUTCString());
        expect(LocationDatepickers.timeCompareTo.date.toUTCString()).toBe(HelpersDate.dateConvertMySQL2JS("2014-06-30 00:00:00").toUTCString());

        */

      });

    });

  });

});
