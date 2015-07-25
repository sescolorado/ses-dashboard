/* global angular */
/* global ses_dashboard_load_script_deferred */
/* global ses_location_config */
/* global ses_location_config_helpers */

// Sensible Energy Solutions LLC

ses_location_config // <- don't change this variable name!

  .mc_courthouse = { // <- make sure you change this one to the same name as the location name!!!

    fieldsDisplayChart: [
      {
        label: 'Total Net Instantaneous Real Power (kW)',
        fieldsData: ['Total_Net_Instantaneous_Real_Power_kW'],
        checked: true,
        annotations: function(dataOpts, data) {
          'use strict';

          return ses_location_config_helpers.generateAnnotationsMinMaxByDay(data, 'Total_Net_Instantaneous_Real_Power_kW');
        },
        fun: function(data) {
          'use strict';

          return data.Total_Net_Instantaneous_Real_Power_kW;
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

ses_dashboard_load_script_deferred.resolve(); // <- do not remove this line (solves an IE issue)
