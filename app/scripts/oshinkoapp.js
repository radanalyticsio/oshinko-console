'use strict';


(function() {
    var extName = 'oshinkoOpenshiftConsole';
    angular.module(extName, ['openshiftConsole'])
    //angular.module('openshiftConsole')
      .config([
        '$routeProvider',
        function ($routeProvider) {
          $routeProvider.when('/project/:project/oshinko', {
            templateUrl: 'views/clusters.html',
            controller: 'ClustersCtrl'
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
            '<a ng-click="item.onClick($event)" ',
            'ng-href="{{item.url}}">',
            'Oshinko Console',
            '</a>',
            '</div>',
            '</div>'
        ].join('');

        var makeOshinkoUrl = function () {
            var namespace = $routeParams.project;
            return new URI("project/" + namespace + "/oshinko");
        };

        extensionRegistry.add('container-links', _.spread(function (container, pod) {
            console.log("extensionRegistry.add");
            var oshinkoUrl = makeOshinkoUrl().toString();

            var gotoContainerView = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                window.location.href = oshinkoUrl;
            };
            var oshinkoPort = _.find((container.ports || []), function (port) {
                return port.name && port.name.toLowerCase() === 'o-rest-port';
            });

            if (!oshinkoPort) {
                console.log("extensionRegistry.add !oshinkoPort");
                return;
            }
            if (pod.metadata.annotations["openshift.io/deployment-config.name"] !== "oshinko") {
                console.log("extensionRegistry.add !annotations");
                return;
            }

            return {
                type: 'dom',
                node: template,
                onClick: gotoContainerView,
                url: oshinkoUrl
            };

        }));
    });
    hawtioPluginLoader.addModule(extName);

})();