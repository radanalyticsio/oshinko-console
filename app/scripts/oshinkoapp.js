'use strict';

angular.module('openshiftConsole')
  .config([
    '$routeProvider',
    function ($routeProvider) {
      $routeProvider.when('/project/:project/oshinko', {
        templateUrl: 'views/clusters.html',
        controller: 'ClustersCtrl'
      });
    }
  ]);