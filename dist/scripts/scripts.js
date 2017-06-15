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

/**
 * Created by croberts on 2/2/17.
 */

'use strict';

angular.module('openshiftConsole')
  .controller('OshinkoClustersCtrl',
    function ($scope, $interval, $location, $route,
              DataService, ProjectsService, $routeParams,
              $rootScope, $filter, AlertMessageService, $uibModal) {
      var watches = [];
      var services, pods, routes;
      $scope.projectName = $routeParams.project;
      $scope.serviceName = $routeParams.service;
      $scope.currentCluster = $routeParams.cluster || '';
      $scope.projects = {};
      $scope.oshinkoClusters = {};
      $scope.oshinkoClusterNames = [];
      $scope.cluster_details = null;
      $scope.alerts = $scope.alerts || {};
      $scope.selectedTab = {};
      var label = $filter('label');
      $scope.cluster_id = $route.current.params.Id || '';
      $scope.breadcrumbs = [
        {
          title: $scope.projectName,
          link: "project/" + $scope.projectName
        },
        {
          title: "Spark Clusters",
          link: "project/" + $scope.projectName + "/oshinko"
        }
      ];
      if ($scope.currentCluster !== '') {
        $scope.breadcrumbs.push( {title: $scope.currentCluster});
      }

      AlertMessageService.getAlerts().forEach(function (alert) {
        $scope.alerts[alert.name] = alert.data;
      });
      AlertMessageService.clearAlerts();

      if($routeParams.tab) {
        $scope.selectedTab[$routeParams.tab] = true; // ex: tab=Group for Groups, pluralized in the template
      }

      function oshinkoCluster(resource) {
        if (label(resource, "oshinko-cluster")) {
          return true;
        }
        return false;
      }

      function groupByClusters(pods, services, routes) {
        var clusters = {};
        var clusterName;
        var type;
        var podName;
        var svcName;
        var svc;
        _.each(pods, function (pod) {
          if (!oshinkoCluster(pod)) {
            return;
          }
          clusterName = label(pod, "oshinko-cluster");
          podName = _.get(pod, 'metadata.name', '');
          type = label(pod, "oshinko-type");
          //find matching services
          svc = _.find(services, function (service) {
            var svcSelector = new LabelSelector(service.spec.selector);
            return svcSelector.matches(pod);
          });

          if (svc) {
            svcName = _.get(svc, 'metadata.name', '');
            _.set(clusters, [clusterName, type, 'svc', svcName], svc);
          }
          _.set(clusters, [clusterName, type, 'pod', podName], pod);
        });
        //find webui services
        _.each(services, function (service) {
          type = label(service, "oshinko-type");
          if (type === "webui") {
            clusterName = label(service, "oshinko-cluster");
            svcName = _.get(service, 'metadata.name', '');
            _.set(clusters, [clusterName, type, 'svc', svcName], service);
          }
        });
        _.each(routes, function (route) {
            clusterName = label(route, "oshinko-cluster");
          if (clusterName) {
            _.set(clusters, [clusterName, 'uiroute'], route);
          }

        });
        return clusters;
      }

      var setClusterDetails = function (clusterName, allClusters) {
        try {
          $scope.cluster_details = allClusters[clusterName];
          $scope.cluster_details['name'] = $scope.cluster_details.master.svc[Object.keys($scope.cluster_details.master.svc)[0]].metadata.labels['oshinko-cluster'];
          $scope.cluster_details['workerCount'] = Object.keys($scope.cluster_details.worker.pod).length;
          $scope.cluster_details['masterCount'] = Object.keys($scope.cluster_details.master.pod).length;
        } catch (e) {
          // most likely recently deleted
          $scope.cluster_details = null;
        }
      };

      var groupClusters = function () {
        if (!pods || !services) {
          return;
        }
        $scope.oshinkoClusters = groupByClusters(pods, services, routes);
        $scope.oshinkoClusterNames = Object.keys($scope.oshinkoClusters);
        if ($scope.currentCluster !== '' && $scope.oshinkoClusters[$scope.currentCluster]) {
          setClusterDetails($scope.currentCluster, $scope.oshinkoClusters);
        } else {
          $scope.cluster_details = null;
        }
      };
      $scope.countWorkers = function (cluster) {
        if (!cluster || !cluster.worker || !cluster.worker.pod) {
          return 0;
        }
        var pods = cluster.worker.pod;
        var length = Object.keys(pods).length;
        return length;
      };
      $scope.countMasters = function (cluster) {
        if (!cluster || !cluster.master || !cluster.master.pod) {
          return 0;
        }
        var pods = cluster.master.pod;
        var length = Object.keys(pods).length;
        return length;
      };
      $scope.getClusterName = function (cluster) {
        var name = Object.keys(cluster);
        return name[0];
      };
      $scope.getSparkWebUi = function (cluster) {
        var route = "";
        try {
          route = "http://" + cluster.uiroute.spec.host;
        } catch (e) {
          route = null;
        }
        return route;
      };
      $scope.getClusterStatus = function (cluster) {
        var status = "Starting...";
        var podStatus;
        var isPod = false;
        // no longer checking workers since scaling to zero is possible
        if (!cluster || !cluster.master || !cluster.master.pod) {
          return "Pending";
        }
        //TODO look at more states
        if (cluster.worker && cluster.worker.pod) {
          _.each(cluster.worker.pod, function (worker) {
            isPod = true;
            if (worker.status.phase !== "Running") {
              podStatus = worker.status.phase;
            }
          });
        }

        _.each(cluster.master.pod, function (master) {
          isPod = true;
          if (master.status.phase !== "Running") {
            podStatus = master.status.phase;
          }
        });
        //return pod status
        if (isPod && podStatus) {
          return podStatus;
        }
        else if (isPod) {
          return "Running";
        }
        //return starting...
        return status;
      };
      $scope.getSparkMasterUrl = function (clusterName) {
        var masterUrl = "spark://" + clusterName + ":7077";
        return masterUrl;
      };
      $scope.getCluster = function () {
        if (!$scope.oshinkoClusters || !$scope.cluster) {
          return;
        }

        var cluster = $scope.oshinkoClusters[$scope.cluster];
        return cluster;
      };
      
      $scope.gotoCluster = function (clusterName) {
        var newpath = $location.path() + '/' + encodeURIComponent(clusterName);
        $location.path(newpath);
      };

      var project = $routeParams.project;
      ProjectsService
        .get(project)
        .then(_.spread(function (project, context) {
          $scope.project = project;
          $scope.projectContext = context;
          watches.push(DataService.watch("pods", context, function (podsData) {
            $scope.pods = pods = podsData.by("metadata.name");
            groupClusters();
          }));

          watches.push(DataService.watch("services", context, function (serviceData) {
            $scope.services = services = serviceData.by("metadata.name");
            groupClusters();
          }));

          watches.push(DataService.watch("routes", context, function (routeData) {
            $scope.routes = routes = routeData.by("metadata.name");
            groupClusters();
          }));

          $scope.$on('$destroy', function () {
            DataService.unwatchAll(watches);
          });

        }));

      $scope.$on('$destroy', function () {
        DataService.unwatchAll(watches);
      });

      // Start cluster operations
      $scope.deleteCluster = function deleteCluster(clusterName) {
        var modalInstance = $uibModal.open({
          animation: true,
          controller: 'OshinkoClusterDeleteCtrl',
          templateUrl: 'views/oshinko/' + 'delete-cluster.html',
          backdrop: 'static',
          resolve: {
            dialogData: function () {
              return {clusterName: clusterName};
            }
          }
        });

        modalInstance.result.then(function () {
          var alertName = "cluster-delete";
          $scope.alerts = {};
          $scope.alerts[alertName] = {
            type: "success",
            message: clusterName + " has been marked for deletion"
          };
        }).catch(function (reason) {
          if (reason !== "cancel") {
            var alertName = clusterName + "-delete";
            $scope.alerts[alertName] = {
              type: "error",
              message: clusterName + " has been marked for deletion, but there were errors"
            };
          }
        });
      };

      $scope.newCluster = function newCluster() {
        var modalInstance = $uibModal.open({
          animation: true,
          controller: 'OshinkoClusterNewCtrl',
          templateUrl: 'views/oshinko/' + 'new-cluster.html',
          backdrop: 'static',
          resolve: {
            dialogData: function () {
              return {};
            }
          }
        });

        modalInstance.result.then(function (response) {
          var clusterName = response[0].metadata.labels["oshinko-cluster"];
          var alertName = "cluster-create";
          $scope.alerts = {};
          $scope.alerts[alertName] = {
            type: "success",
            message: clusterName + " has been created"
          };
        }).catch(function (reason) {
          if (reason !== "cancel") {
            var alertName = "error-create";
            $scope.alerts[alertName] = {
              type: "error",
              message: "Cluster create failed"
            };
          }
        });
      };

      $scope.scaleCluster = function scaleCluster(clusterName, workerCount, masterCount) {
        var modalInstance = $uibModal.open({
          animation: true,
          controller: 'OshinkoClusterScaleCtrl',
          templateUrl: 'views/oshinko/' + 'scale-cluster.html',
          backdrop: 'static',
          resolve: {
            dialogData: function () {
              return {
                clusterName: clusterName,
                workerCount: workerCount,
                masterCount: masterCount
              };
            }
          }
        });

        modalInstance.result.then(function (response) {
          var numWorkers = response[0].spec.replicas || 0;
          var numMasters = response[1].spec.replicas || 0;
          var alertName = clusterName + "-scale";
          var masters = numMasters !== 1 ? " masters" : " master";
          var workers = numWorkers !== 1 ? " workers" : " worker";
          $scope.alerts = {};
          $scope.alerts[alertName] = {
            type: "success",
            message: clusterName + " has been scaled to " + numWorkers + workers +
              " and " + numMasters + masters
          };
        }).catch(function (reason) {
          if (reason !== "cancel") {
            var alertName = "error-scale";
            $scope.alerts[alertName] = {
              type: "error",
              message: "Cluster scale failed"
            };
          }
        });
      };
      // end cluster operations
    }
  );
/**
 * Created by croberts on 2/2/17.
 */

'use strict';

angular.module('openshiftConsole')
  .filter('depName', function () {
    var labelMap = {
      'replicationController': ["openshift.io/deployment-config.name"]
    };
    return function (labelKey) {
      return labelMap[labelKey];
    };
  })
  .filter('clusterName', function () {
    var labelMap = {
      'route': ["oshinko-cluster"]
    };
    return function (labelKey) {
      return labelMap[labelKey];
    };
  })
  .factory('clusterData',
    function ($http, $q, DataService, DeploymentsService, ApplicationGenerator, $filter) {

      // Start delete-related functions
      function deleteObject(name, resourceType, context) {
        return DataService.delete(resourceType, name, context, null);
      }

      function scaleDeleteReplication(deploymentName, context) {
        var deferred = $q.defer();
        var mostRecentRC = null;
        // we need to determine the most recent replication controller in the event that
        // changes have been made to the deployment, we can not assume clustername-w-1
        DataService.list('replicationcontrollers', context, function (result) {
          var rcs = result.by("metadata.name");
          angular.forEach(rcs, function (rc) {
            if (!mostRecentRC || new Date(rc.metadata.creationTimestamp) > new Date(mostRecentRC.metadata.creationTimestamp)) {
              // if we have a mostRecentRC, it's about to be replaced, so we
              // can delete it as it's most definitely not the most recent one
              if (mostRecentRC) {
                DataService.delete('replicationcontrollers', mostRecentRC.metadata.name, context, null).then(angular.noop);
              }
              mostRecentRC = rc;
            }
          });
          mostRecentRC.spec.replicas = 0;
          DataService.update('replicationcontrollers', mostRecentRC.metadata.name, mostRecentRC, context).then(function () {
            DataService.delete('replicationcontrollers', mostRecentRC.metadata.name, context, null).then(function (result) {
              deferred.resolve(result);
            }).catch(function (err) {
              deferred.reject(err);
            });
          }).catch(function (err) {
            deferred.reject(err);
          });
        }, {
          http: {
            params: {
              labelSelector: $filter('depName')('replicationController') + '=' + deploymentName
            }
          }
        });
        return deferred.promise;
      }

      function scaleReplication(clusterName, deploymentName, count, context) {
        var deferred = $q.defer();
        DataService.get('deploymentconfigs', deploymentName, context, null).then(function (dc) {
          DeploymentsService.scale(dc, count).then(function (result) {
            deferred.resolve(result);
          });
        });
        return deferred.promise;
      }

      function deleteRoute(clusterName, context) {
        return DataService.list('routes', context, function (result) {
          var routes = result.by("metadata.name");
          angular.forEach(routes, function(route) {
            deleteObject(route.metadata.name, 'routes', context);
          });
        }, {
          http: {
            params: {
              labelSelector: $filter('clusterName')('route') + '=' + clusterName
            }
          }
        });
      }

      function sendDeleteCluster(clusterName, context) {
        var masterDeploymentName = clusterName + "-m";
        var workerDeploymentName = clusterName + "-w";

        var steps = [
          scaleDeleteReplication(masterDeploymentName, context),
          scaleDeleteReplication(workerDeploymentName, context),
          deleteObject(masterDeploymentName, 'deploymentconfigs', context),
          deleteObject(workerDeploymentName, 'deploymentconfigs', context),
          deleteObject(clusterName, 'services', context),
          deleteRoute(clusterName, context),
          deleteObject(clusterName + "-ui", 'services', context),
          deleteObject(clusterName + "-metrics", 'services', context)
        ];

        return $q.all(steps);
      }

      // Start create-related functions
      function makeDeploymentConfig(input, imageSpec, ports, specialConfig) {
        var env = [];
        angular.forEach(input.deploymentConfig.envVars, function (value, key) {
          env.push({name: key, value: value});
        });
        var templateLabels = angular.copy(input.labels);
        templateLabels.deploymentconfig = input.name;

        var container = {
          image: imageSpec.toString(),
          name: input.name,
          ports: ports,
          env: env,
          resources: {},
          terminationMessagePath: "/dev/termination-log",
          imagePullPolicy: "IfNotPresent"
        };

        var volumes = [];
        if (specialConfig) {
          volumes = [
            {
              name: specialConfig,
              configMap: {
                name: specialConfig,
                defaultMode: 420
              }
            }
          ];
          container.volumeMounts = [
            {
              name: specialConfig,
              readOnly: true,
              mountPath: "/etc/oshinko-spark-configs"
            }
          ];
        }

        if (input.labels["oshinko-type"] === "master") {
          container.livenessProbe = {
            httpGet: {
              path: "/",
              port: 8080,
              scheme: "HTTP"
            },
            timeoutSeconds: 1,
            periodSeconds: 10,
            successThreshold: 1,
            failureThreshold: 3
          };
          container.readinessProbe = {
            httpGet: {
              path: "/",
              port: 8080,
              scheme: "HTTP"
            },
            timeoutSeconds: 1,
            periodSeconds: 10,
            successThreshold: 1,
            failureThreshold: 3
          };
        } else {
          container.livenessProbe = {
            httpGet: {
              path: "/",
              port: 8081,
              scheme: "HTTP"
            },
            timeoutSeconds: 1,
            periodSeconds: 10,
            successThreshold: 1,
            failureThreshold: 3
          };
        }

        var replicas;
        if (input.scaling.autoscaling) {
          replicas = input.scaling.minReplicas || 1;
        } else {
          replicas = input.scaling.replicas;
        }

        var deploymentConfig = {
          apiVersion: "v1",
          kind: "DeploymentConfig",
          metadata: {
            name: input.name,
            labels: input.labels,
            annotations: input.annotations
          },
          spec: {
            replicas: replicas,
            selector: {
              "oshinko-cluster": input.labels["oshinko-cluster"]
            },
            triggers: [
              {
                type: "ConfigChange"
              }
            ],
            template: {
              metadata: {
                labels: templateLabels
              },
              spec: {
                volumes: volumes,
                containers: [container],
                restartPolicy: "Always",
                terminationGracePeriodSeconds: 30,
                dnsPolicy: "ClusterFirst",
                securityContext: {}
              }
            }
          }
        };
        if (input.deploymentConfig.deployOnNewImage) {
          deploymentConfig.spec.triggers.push(
            {
              type: "ImageChange",
              imageChangeParams: {
                automatic: true,
                containerNames: [
                  input.name
                ],
                from: {
                  kind: imageSpec.kind,
                  name: imageSpec.toString()
                }
              }
            }
          );
        }
        return deploymentConfig;
      }

      function sparkDC(image, clusterName, sparkType, workerCount, ports, metrics, sparkConfig) {
        var suffix = sparkType === "master" ? "-m" : "-w";
        var input = {
          deploymentConfig: {
            envVars: {
              OSHINKO_SPARK_CLUSTER: clusterName
            }
          },
          name: clusterName + suffix,
          labels: {
            "oshinko-cluster": clusterName,
            "oshinko-type": sparkType
          },
          annotations: {"created-by": "oshinko-console"},
          scaling: {
            autoscaling: false,
            minReplicas: 1
          }
        };
        if (sparkType === "worker") {
          input.deploymentConfig.envVars.SPARK_MASTER_ADDRESS = "spark://" + clusterName + ":" + 7077;
          input.deploymentConfig.envVars.SPARK_MASTER_UI_ADDRESS = "http://" + clusterName + "-ui:" + 8080;
        }
        if (sparkConfig) {
          input.deploymentConfig.envVars.SPARK_CONF_DIR = "/etc/oshinko-spark-configs";
        }
        if (metrics) {
          input.deploymentConfig.envVars.SPARK_METRICS_ON = "true";
        }
        input.scaling.replicas = workerCount ? workerCount : 1;
        var dc = makeDeploymentConfig(input, image, ports, sparkConfig);
        return dc;
      }

      function makeService(input, serviceName, ports) {
        if (!ports || !ports.length) {
          return null;
        }

        var service = {
          kind: "Service",
          apiVersion: "v1",
          metadata: {
            name: serviceName,
            labels: input.labels,
            annotations: input.annotations
          },
          spec: {
            selector: input.selectors,
            ports: ports
          }
        };

        return service;
      }

      function sparkService(serviceName, clusterName, serviceType, ports) {
        var input = {
          labels: {
            "oshinko-cluster": clusterName,
            "oshinko-type": serviceType
          },
          annotations: {},
          name: serviceName + "-" + serviceType,
          selectors: {
            "oshinko-cluster": clusterName,
            "oshinko-type": "master"
          }
        };
        return makeService(input, serviceName, ports);
      }

      function metricsService(clusterName, ports) {
        var serviceName = clusterName + "-metrics";
        var input = {
          labels: {
            "oshinko-cluster": clusterName,
            "oshinko-type": "oshinko-metrics"
          },
          annotations: {},
          name: serviceName,
          selectors: {
            "oshinko-cluster": clusterName,
            "oshinko-type": "master"
          }
        };
        return makeService(input, serviceName, ports);
      }

      function createDeploymentConfig(dcObject, context) {
        return DataService.create("deploymentconfigs", null, dcObject, context, null);
      }

      function createService(srvObject, context) {
        return DataService.create("services", null, srvObject, context, null);
      }

      function createRoute(srvObject, context) {
        var serviceName = srvObject.metadata.name;
        var labels = srvObject.metadata.labels;
        var routeOptions = {
          name: serviceName + "-route"
        };
        var route = ApplicationGenerator.createRoute(routeOptions, serviceName, labels);
        return DataService.create('routes', null, route, context);
      }

      function getFinalConfigs(configName, workerCount, sparkWorkerConfig, sparkMasterConfig, context) {
        var deferred = $q.defer();
        var finalConfig = {};
        if (configName) {
          DataService.get('configmaps', configName, context, null).then(function (cm) {
            if (cm.data["workercount"]) {
              finalConfig["workerCount"] = parseInt(cm.data["workercount"]);
            }
            if (cm.data["sparkmasterconfig"]) {
              finalConfig["masterConfigName"] = cm.data["sparkmasterconfig"];
            }
            if (cm.data["sparkworkerconfig"]) {
              finalConfig["workerConfigName"] = cm.data["sparkworkerconfig"];
            }
            if (workerCount) {
              finalConfig["workerCount"] = workerCount;
            }
            if (sparkWorkerConfig) {
              finalConfig["workerConfigName"] = sparkWorkerConfig;
            }
            if (sparkMasterConfig) {
              finalConfig["masterConfigName"] = sparkMasterConfig;
            }
            deferred.resolve(finalConfig);
          }).catch(function () {
            if (workerCount) {
              finalConfig["workerCount"] = workerCount;
            }
            if (sparkWorkerConfig) {
              finalConfig["workerConfigName"] = sparkWorkerConfig;
            }
            if (sparkMasterConfig) {
              finalConfig["masterConfigName"] = sparkMasterConfig;
            }
            deferred.resolve(finalConfig);
          });
        } else {
          if (workerCount) {
            finalConfig["workerCount"] = workerCount;
          }
          if (sparkWorkerConfig) {
            finalConfig["workerConfigName"] = sparkWorkerConfig;
          }
          if (sparkMasterConfig) {
            finalConfig["masterConfigName"] = sparkMasterConfig;
          }
          deferred.resolve(finalConfig);
        }
        return deferred.promise;
      }

      function sendCreateCluster(clusterConfigs, context) {
        var sparkImage = "docker.io/radanalyticsio/openshift-spark:latest";
        var workerPorts = [
          {
            "name": "spark-webui",
            "containerPort": 8081,
            "protocol": "TCP"
          },
          {
            "name": "spark-metrics",
            "containerPort": 7777,
            "protocol": "TCP"
          }
        ];
        var masterPorts = [
          {
            "name": "spark-webui",
            "containerPort": 8080,
            "protocol": "TCP"
          },
          {
            "name": "spark-master",
            "containerPort": 7077,
            "protocol": "TCP"
          },
          {
            "name": "spark-metrics",
            "containerPort": 7777,
            "protocol": "TCP"
          }
        ];
        var masterServicePort = [
          {
            protocol: "TCP",
            port: 7077,
            targetPort: 7077
          }
        ];
        var uiServicePort = [
          {
            protocol: "TCP",
            port: 8080,
            targetPort: 8080
          }
        ];
        var jolokiaServicePort = [
          {
            protocol: "TCP",
            port: 7777,
            targetPort: 7777
          }
        ];

        var enableMetrics = clusterConfigs.enablemetrics;

        var sm = null;
        var sw = null;
        var smService = null;
        var suiService = null;
        var jolokiaService = null;
        var deferred = $q.defer();
        getFinalConfigs(clusterConfigs.configName, clusterConfigs.workerCount, clusterConfigs.workerConfigName, clusterConfigs.masterConfigName).then(function (finalConfigs) {
          sm = sparkDC(sparkImage, clusterConfigs.clusterName, "master", null, masterPorts, enableMetrics, finalConfigs["masterConfigName"]);
          sw = sparkDC(sparkImage, clusterConfigs.clusterName, "worker", finalConfigs["workerCount"], workerPorts, enableMetrics, finalConfigs["workerConfigName"]);
          smService = sparkService(clusterConfigs.clusterName, clusterConfigs.clusterName, "master", masterServicePort);
          suiService = sparkService(clusterConfigs.clusterName + "-ui", clusterConfigs.clusterName, "webui", uiServicePort);

          var steps = [
            createDeploymentConfig(sm, context),
            createDeploymentConfig(sw, context),
            createService(smService, context),
            createService(suiService, context)

          ];

          // Only create the metrics service if we're going to be using it
          if (clusterConfigs.enablemetrics) {
            jolokiaService = metricsService(clusterConfigs.clusterName, jolokiaServicePort);
            steps.push(createService(jolokiaService, context));
          }

          // if expose webui was checked, we expose the apache spark webui via a route
          if (clusterConfigs.exposewebui) {
            steps.push(createRoute(suiService, context));
          }

          $q.all(steps).then(function (values) {
            deferred.resolve(values);
          }).catch(function (err) {
            deferred.reject(err);
          });
        });
        return deferred.promise;
      }

      // Start scale-related functions
      function sendScaleCluster(clusterName, workerCount, masterCount, context) {
        var workerDeploymentName = clusterName + "-w";
        var masterDeploymentName = clusterName + "-m";
        var steps = [
          scaleReplication(clusterName, workerDeploymentName, workerCount, context),
          scaleReplication(clusterName, masterDeploymentName, masterCount, context)
        ];

        return $q.all(steps);
      }

      return {
        sendDeleteCluster: sendDeleteCluster,
        sendCreateCluster: sendCreateCluster,
        sendScaleCluster: sendScaleCluster
      };
    }
  );
/**
 * Created by croberts on 2/2/17.
 */

'use strict';
angular.module('oshinkoConsole')
  .controller('OshinkoClusterNewCtrl',
    function ($q, $scope, dialogData, clusterData, $uibModalInstance, ProjectsService, DataService, $routeParams) {
      var NAME_RE = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/;
      var NUMBER_RE = /^[0-9]*$/;
      var fields = {
        name: "",
        workers: 1,
        advworkers: 1,
        configname: "",
        masterconfigname: "",
        workerconfigname: "",
        enablemetrics: true,
        exposewebui: true,
        sparkimage: "docker.io/radanalyticsio/openshift-spark:latest"
      };
      $scope.fields = fields;
      $scope.advanced = false;

      $scope.toggleAdvanced = function () {
        $scope.advanced = $scope.advanced ? false : true;
      };

      function validateConfigMap(name, errTarget, errName, context) {
        var ex;
        var defer = $q.defer();
        if (!name) {
          defer.resolve();
        }
        DataService.get('configmaps', name, context, null).then(function () {
          defer.resolve();
        }).catch(function () {
          ex = new Error("The " + errName + " named '" + name + "' does not exist");
          ex.target = errTarget;
          defer.reject(ex);
        });
        return defer.promise;
      }

      function validate(name, workers) {
        $scope.formError = "";
        var defer = $q.defer();
        var ex;
        if (name !== undefined) {
          if (!name) {
            ex = new Error("The cluster name cannot be empty.");
          }
          else if (!NAME_RE.test(name)) {
            ex = new Error("The cluster name contains invalid characters.");
          }
          if (ex) {
            ex.target = "#cluster-new-name";
            defer.reject(ex);
          }
        }
        if (workers !== undefined) {
          if (!workers) {
            ex = new Error("The number of workers count cannot be empty.");
          }
          else if (!NUMBER_RE.test(workers)) {
            ex = new Error("Please give a valid number of workers.");
          }
          else if (workers <= 0) {
            ex = new Error("Please give a value greater than 0.");
          }
          if (ex) {
            ex.target = "#cluster-new-workers";
            defer.reject(ex);
          }
        }
        if (!ex) {
          defer.resolve();
        }
        return defer.promise;
      }

      $scope.cancelfn = function () {
        $uibModalInstance.dismiss('cancel');
      };

      $scope.newCluster = function newCluster() {
        var advanced = $scope.advanced;

        var clusterConfigs = {
          clusterName: $scope.fields.name.trim(),
          workerCount: $scope.fields.workers,
          configName: advanced ? $scope.fields.configname : null,
          masterConfigName: advanced ? $scope.fields.masterconfigname : null,
          workerConfigName: advanced ? $scope.fields.workerconfigname : null,
          exposewebui: advanced ? $scope.fields.exposewebui : true,
          enablemetrics: advanced ? $scope.fields.enablemetrics : true
        };

        return ProjectsService
          .get($routeParams.project)
          .then(_.spread(function (project, context) {
            $scope.project = project;
            $scope.context = context;
            return $q.all([
              validate(clusterConfigs.clusterName, clusterConfigs.workersInt),
              validateConfigMap(clusterConfigs.configName, "cluster-config-name", "cluster configuration", $scope.context),
              validateConfigMap(clusterConfigs.masterConfigName, "cluster-masterconfig-name", "master spark configuration", $scope.context),
              validateConfigMap(clusterConfigs.workerConfigName, "cluster-workerconfig-name", "worker spark configuration", $scope.context)
            ]).then(function () {
              clusterData.sendCreateCluster(clusterConfigs, $scope.context).then(function (response) {
                $uibModalInstance.close(response);
              }, function (error) {
                $scope.formError = error.data.message;
              });
            }, function (error) {
              $scope.formError = error.message;
            });
          }));
      };
    }
  );


/**
 * Created by croberts on 2/2/17.
 */

'use strict';

angular.module('openshiftConsole')
  .controller('OshinkoClusterDeleteCtrl',
    function ($q, $scope, clusterData, $uibModalInstance, dialogData, $routeParams, ProjectsService) {

      $scope.clusterName = dialogData.clusterName || "";
      $scope.workerCount = dialogData.workerCount || 0;
      $scope.masterCount = dialogData.masterCount || 0;

      $scope.deleteCluster = function deleteCluster() {
        ProjectsService
          .get($routeParams.project)
          .then(_.spread(function (project, context) {
            $scope.project = project;
            $scope.context = context;
            clusterData.sendDeleteCluster($scope.clusterName, $scope.context)
              .then(function (values) {
                var err = false;
                angular.forEach(values, function (value) {
                  // allow 404 error on delete since it doesn't exist
                  if ((value.code >= 300 || value.code < 200) && value.code !== 404) {
                    err = true;
                  }
                });
                if (err) {
                  $uibModalInstance.dismiss(values);
                } else {
                  $uibModalInstance.close(values);
                }
              }, function (error) {
                // allow 404 error on delete since it doesn't exist
                if(error.status !== 404) {
                  $uibModalInstance.dismiss(error);
                } else {
                  $uibModalInstance.close(error);
                }
              });
          }));
      };

      $scope.cancelfn = function () {
        $uibModalInstance.dismiss('cancel');
      };
    }
  );

/**
 * Created by croberts on 5/3/17.
 */

'use strict';

angular.module('openshiftConsole')
  .controller('OshinkoClusterScaleCtrl',
    function ($q, $scope, clusterData, $uibModalInstance, dialogData, $routeParams, ProjectsService) {

      $scope.clusterName = dialogData.clusterName || "";
      $scope.workerCount = dialogData.workerCount || 0;
      $scope.masterCount = dialogData.masterCount || 0;

      $scope.cancelfn = function () {
        $uibModalInstance.dismiss('cancel');
      };

      var NUMBER_RE = /^[0-9]*$/;

      function validate(workers) {
        $scope.formError = "";
        var defer = $q.defer();
        var ex;
        if (workers === undefined || workers === null) {
          ex = new Error("The number of workers cannot be empty or less than 0.");
        }
        else if (!NUMBER_RE.test(workers)) {
          ex = new Error("Please give a valid number of workers.");
        }
        else if (workers < 0) {
          ex = new Error("Please give a value greater than or equal to 0.");
        }
        if (ex) {
          ex.target = "#numworkers";
          defer.reject(ex);
        }
        if (!ex) {
          defer.resolve();
        }
        return defer.promise;
      }

      $scope.scaleCluster = function scaleCluster(workercount, mastercount) {
        ProjectsService
          .get($routeParams.project)
          .then(_.spread(function (project, context) {
              $scope.project = project;
              $scope.context = context;
              validate(workercount)
                .then(function () {
                  clusterData.sendScaleCluster($scope.clusterName, workercount, mastercount, $scope.context).then(function (response) {
                    $uibModalInstance.close(response);
                  }, function (error) {
                    $scope.formError = error.data.message;
                  });
                }, function (error) {
                  $scope.formError = error.message;
                });
            })
          );
      };
    }
  );
