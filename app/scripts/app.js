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
        }
      ])
    .run(function ($routeParams, extensionRegistry) {
        var template = [
            '<div row ',
            'ng-show="item.url" ',
            'class="icon-row" ',
            'title="Connect to container">',
            '<div>',
            '<i class="fa fa-share" aria-hidden="true"></i>',
            '</div>',
            '<div flex>',
            '<a ng-href="{{item.url}}">',
            'Manage Spark Clusters',
            '</a>',
            '</div>',
            '</div>'
        ].join('');

        var makeOshinkoUrl = function () {
            var namespace = $routeParams.project;
            return new URI("project/" + namespace + "/oshinko");
        };

        extensionRegistry.add('container-links', _.spread(function (container, pod) {
            console.log("oshinko extensions");
            var oshinkoUrl = makeOshinkoUrl().toString();
            var oshinkoPort = _.find((container.ports || []), function (port) {
                return port.name && port.name.toLowerCase() === 'o-rest-port';
            });

            if (!oshinkoPort) {
                return;
            }
            if (pod.metadata.annotations["openshift.io/deployment-config.name"] !== "oshinko") {
                return;
            }

            return {
                type: 'dom',
                node: template,
                url: oshinkoUrl
            };

        }));
    });
    hawtioPluginLoader.addModule(extName);

})();
