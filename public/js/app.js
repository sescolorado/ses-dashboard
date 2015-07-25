'use strict';
// ASD Software Design LLC

// Declare app level module which depends on filters, and services
var app = angular.module('ses_dashboard', [
  // AngularJS Modules
  'ngRoute',
  // Third Party Modules
  'googlechart',
  'ui.bootstrap',
  // SES Dashboard Modules
  'ses_dashboard.filters',
  'ses_dashboard.services',
  'ses_dashboard.directives',
  'ses_dashboard.controllers',
  'ses_dashboard.locations'
]);

app.config(['$routeProvider', function($routeProvider) {

  $routeProvider.when('/', {
    templateUrl: 'partials/root.html',
    controller: 'RootCtrl'
  });

  $routeProvider.when('/about', {
    templateUrl: 'partials/about.html',
    controller: 'AboutCtrl'
  });

  $routeProvider.when('/locations', {
    templateUrl: 'partials/locations.html',
    controller: 'LocationsAllCtrl'
  });

  $routeProvider.when('/location/:locationID', {
    templateUrl: 'partials/location.html',
    controller: 'LocationCtrl'
  });

  $routeProvider.when('/service_test', {
    templateUrl: 'partials/service_test.html',
    controller: 'ServiceTestCtrl'
  });

  $routeProvider.otherwise({redirectTo: '/'});

}]);

var ses_location_config = {};
