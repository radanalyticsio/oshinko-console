'use strict';

angular.module('openshiftConsole')
    .controller('ClustersCtrl',
        function($scope, $interval, $location, $route,
                 DataService, ProjectsService, $routeParams,
                 $rootScope, $filter) {

            var watches = [];
            var services, pods;
            $scope.projectName = $routeParams.project;
            $scope.serviceName = $routeParams.service;
            $scope.projects = {};
            $scope.oshinkoClusters;
            $scope.oshinkoClusterNames = [];
            $scope.alerts = $scope.alerts || {};
            var label = $filter('label');
            $scope.cluster_id = $route.current.params.Id || '';
            $scope.predicate = 'name';
            $scope.reverse = false;
            $scope.order = function(predicate) {
                $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
                $scope.predicate = predicate;
            };
            $scope.breadcrumbs = [
                {
                    title: $scope.projectName,
                    link: "project/" + $scope.projectName
                },
                {
                    title: "Spark Clusters"
                }
            ];

            function oshinkoCluster(resource) {
                if(label(resource, "oshinko-cluster")) {
                    return true;
                }
                return false;
            }

            function groupByClusters(pods, services) {
                var clusters = {};
                var clusterName;
                var type;
                var podName;
                var svcName;
                var svc;
                _.each(pods, function(pod) {
                    if (!oshinkoCluster(pod)) {
                        return;
                    }
                    clusterName = label(pod, "oshinko-cluster");
                    podName = _.get(pod, 'metadata.name', '');
                    type = label(pod, "oshinko-type");
                    //find matching services
                    svc = _.find(services, function(service) {
                        var svcSelector = new LabelSelector(service.spec.selector);
                        return svcSelector.matches(pod);
                    });

                    if(svc) {
                        svcName = _.get(svc, 'metadata.name', '');
                        _.set(clusters, [clusterName, type, 'svc', svcName], svc);
                    }
                    _.set(clusters, [clusterName, type, 'pod', podName], pod);
                });
                //find webui services
                _.each(services, function(service) {
                    type = label(service, "oshinko-type");
                    if(type === "webui") {
                        clusterName = label(service, "oshinko-cluster");
                        svcName = _.get(service, 'metadata.name', '');
                        _.set(clusters, [clusterName, type, 'svc', svcName], service);
                    }
                });

                return clusters;
            }
            var groupClusters = function() {
                if (!pods || !services) {
                    return;
                }
                $scope.oshinkoClusters = groupByClusters(pods, services);
                $scope.oshinkoClusterNames = Object.keys($scope.oshinkoClusters);
            };
            $scope.countWorkers = function(cluster) {
                if (!cluster || !cluster.worker || !cluster.worker.pod) {
                  return 0;
                }
                var pods =  cluster.worker.pod;
                var length = Object.keys(pods).length;
                return length;
            };
            $scope.getClusterName = function(cluster) {
                var name = Object.keys(cluster);
                return name[0];
            };
            $scope.getClusterStatus = function(cluster) {
                var status = "Starting...";
                var podStatus;
                var isPod = false;
                if (!cluster || !cluster.worker || !cluster.worker.pod ||
                  !cluster.master || !cluster.master.pod) {
                    return "Error";
                }
                //TODO look at more states
                _.each(cluster.worker.pod, function(worker) {
                    isPod = true;
                    if(worker.status.phase !== "Running") {
                        podStatus = worker.status.phase;
                        return;
                    }
                });

                _.each(cluster.master.pod, function(master) {
                    isPod = true;
                    if(master.status.phase !== "Running") {
                        podStatus = master.status.phase;
                        return;
                    }
                });
                //return pod status
                if(isPod && podStatus) {
                  return podStatus;
                }
                else if (isPod) {
                  return "Running";
                }

                //return starting...
                return status;
            };
            $scope.getSparkMasterUrl = function(cluster) {
                if (!cluster || !cluster.master || !cluster.master.svc) {
                    return "";
                }
                var masterSvc = Object.keys(cluster.master.svc);
                if (masterSvc.length === 0) {
                    return "";
                }
                var svcName = masterSvc[0];
                var port = cluster.master.svc[svcName].spec.ports[0].port;
                return "spark://" + svcName + ":" + port;
            };
            $scope.getCluster = function() {
                if(!$scope.oshinkoClusters || !$scope.cluster) {
                  return;
                }

                var cluster = $scope.oshinkoClusters[$scope.cluster];
                return cluster;
            };

            ProjectsService
                .get("oshinko")
                .then(_.spread(function(project, context) {
                    $scope.project = project;
                    $scope.projectContext = context;
                    console.log("In Project : " +project);
                    watches.push(DataService.watch("pods", context, function(podsData) {
                        $scope.pods =pods = podsData.by("metadata.name");
                        groupClusters();
                    }));

                    watches.push(DataService.watch("services", context, function(serviceData) {
                        $scope.services = services = serviceData.by("metadata.name");
                        groupClusters();
                    }));

                    $scope.$on('$destroy', function(){
                        DataService.unwatchAll(watches);
                    });

                }));

            $scope.$on('$destroy', function(){
                DataService.unwatchAll(watches);
            });
        }
    )
    .run(function(extensionRegistry) {
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

        extensionRegistry.add('container-links', _.spread(function(container, pod) {

            var gotoContainerView = function($event) {
              $event.preventDefault();
              $event.stopPropagation();
              window.location.href = "/project/oshinko/oshinko";
            };
            var oshinkoPort = _.find((container.ports || []), function(port) {
                return port.name && port.name.toLowerCase() === 'o-rest-port';
            });

            if(!oshinkoPort) {
              return;
            }
            if (pod.metadata.annotations["openshift.io/deployment-config.name"] !== "oshinko") {
              return;
            }

            return {
                type: 'dom',
                node: template,
                onClick: gotoContainerView,
                url: "/project/oshinko/oshinko"
            };

        }));
    });


