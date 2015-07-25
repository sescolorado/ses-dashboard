/* global angular */
/* global Holder */

// Sensible Energy Solutions LLC

/* Directives */

var directives = angular.module('ses_dashboard.directives', []);

directives.directive('alertBox', function() {
  'use strict';

  return {
    restrict: 'E',
    replace: true,
    scope: {
      alert: '=alertObj'
    },
    template: '<div class="alert" ng-class="{\'alert-success\': alert.success, \'alert-info\': alert.info, \'alert-warning\': alert.warning, \'alert-danger\': alert.danger}" ng-show="alert.message != null" ng-bind="alert.message"></div>'
  };
});

directives.directive('holderFix', function () {
  'use strict';

  return {
    link: function (scope, element, attrs) {
      Holder.run({ images: element[0], nocss: true });
    }
  };
});
