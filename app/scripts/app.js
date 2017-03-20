'use strict';
(function() {
    var extName = 'oshinkoConsole';
    angular.module(extName, ['openshiftConsole', 'oshinkoConsoleTemplates'])
      .config([
        '$routeProvider',
        function ($routeProvider) {
          $routeProvider.when('/project/:project/oshinko', {
            templateUrl: 'views/oshinko/clusters.html',
            controller: 'OshinkoClustersCtrl'
          });
          $routeProvider.when('/project/:project/oshinko/:cluster', {
            templateUrl: 'views/oshinko/cluster.html',
            controller: 'OshinkoClustersCtrl'
          });
        }
      ])
    .run(function () {
        window.OPENSHIFT_CONSTANTS.PROJECT_NAVIGATION.push({href: "/oshinko", label: "Spark Clusters", iconClass:"pficon  pficon-cluster"});
    });
    hawtioPluginLoader.addModule(extName);

})();
