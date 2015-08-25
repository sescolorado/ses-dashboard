/* global angular */
/* global ses_dashboard_load_script_deferred */
/* global ses_location_config */
/* global ses_location_config_helpers */

// Sensible Energy Solutions LLC

ses_location_config // <- don't change this variable name!

  .cmu_bishop = { // <- make sure you change this one to the same name as the location name!!!

    fieldsDisplayChart: [
      {
        label: 'Outdoor Temperature (F)',
        fieldsData: ['Outdoor_Ave_Degrees_F'],
        checked: true,
        fun: function(data) {
          'use strict';

          return data.Outdoor_Ave_Degrees_F;
        }
      },
      {
        label: 'Middle Class Temperature (F)',
        fieldsData: ['Middle_Classroom_Ave_Degrees_F'],
        checked: true,
        fun: function(data) {
          'use strict';

          return data.Middle_Classroom_Ave_Degrees_F;
        }
      },
      {
        label: 'South Class Temperature (F)',
        fieldsData: ['South_Classroom_Ave_Degrees_F'],
        checked: true,
        fun: function(data) {
          'use strict';

          return data.South_Classroom_Ave_Degrees_F;
        }
      },
      {
        label: 'Main Class Offices Temperature (F)',
        fieldsData: ['Main_ClassroomOffices_Ave_Degrees_F'],
        checked: true,
        fun: function(data) {
          'use strict';

          return data.Main_ClassroomOffices_Ave_Degrees_F;
        }
      },
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
