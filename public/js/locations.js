/* global angular */

// Sensible Energy Solutions LLC

/* Location Configuration */

var locations = angular.module('ses_dashboard.locations', []);

// ***************************************************************************
// Base

locations.factory('Locations', [
  function() {
    'use strict';

    return {
      mc_fleet_maintenance: 'Mesa County Fleet Maintenance Shop',
      mc_hr_dept: 'Mesa County Human Resources Department',
      mc_workforce: 'Mesa County Workforce Center',
      cmu_bishop: 'CMU Bishop Campus'
    };

  }]);
