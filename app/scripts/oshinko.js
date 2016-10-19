'use strict';

angular.module('openshiftConsole')
  .factory('ClusterActions', function ($uibModal) {
    function deleteCluster(clusterName) {
      var modalInstance = $uibModal.open({
        animation: true,
        controller: 'ClusterDeleteCtrl',
        templateUrl: '/views/' + 'delete-cluster.html',
        resolve: {
          dialogData: function () {
            return {clusterName: clusterName};
          }
        }
      });

      modalInstance.result.then(function () {
        console.info("Modal completed");
      }, function () {
        console.info('Modal dismissed at: ' + new Date());
      });
    }

    function newCluster() {
      var modalInstance = $uibModal.open({
        animation: true,
        controller: 'ClusterNewCtrl',
        templateUrl: '/views/' + 'new-cluster.html',
        resolve: {
          dialogData: function () {
            return {};
          }
        }
      });

      modalInstance.result.then(function () {
        console.info("Modal completed");
      }, function () {
        console.info('Modal dismissed at: ' + new Date());
      });
    }

    function scaleCluster(cluster, workerCount) {
      var modalInstance = $uibModal.open({
        animation: true,
        controller: 'ClusterDeleteCtrl',
        templateUrl: '/views/' + 'scale-cluster.html',
        resolve: {
          dialogData: function () {
            return {
              clusterName: cluster,
              workerCount: workerCount
            };
          }
        }
      });

      modalInstance.result.then(function () {
        console.info("Modal completed");
      }, function () {
        console.info('Modal dismissed at: ' + new Date());
      });
    }

    return {
      deleteCluster: deleteCluster,
      newCluster: newCluster,
      scaleCluster: scaleCluster,
    };
  })
  .factory('clusterData', [
    '$http',
    '$q',
    "ProjectsService",
    "DataService",
    "$routeParams",
    function ($http, $q, ProjectsService, DataService, $routeParams) {
      var urlBase = "";
      var project = $routeParams.project;
      ProjectsService
        .get(project)
        .then(_.spread(function (project, context) {
          DataService.list("routes", context, function(routes) {
              var routesByName = routes.by("metadata.name");
              angular.forEach(routesByName, function(route) {
                if(route.spec.to.kind === "Service" && route.spec.to.name === "oshinko-rest") {
                  urlBase = new URI("https://" + route.spec.host);
                  console.log("Rest URL: " + urlBase);
                }
              });
            });
        }));

      function sendDeleteCluster(clusterName) {
        return $http({
          method: "DELETE",
          url: urlBase + 'clusters/' + clusterName,
          data: '',
          headers: {
            'Content-Type': 'application/json',
          }
        });
      }

      function sendCreateCluster(clusterName, workerCount) {
        var jsonData = {
          "masterCount": 1,
          "workerCount": workerCount,
          "name": clusterName
        };
        return $http.post(urlBase + "clusters", jsonData);
      }

      function sendScaleCluster(clusterName, workerCount) {
        var jsonData = {
          "masterCount": 1,
          "workerCount": workerCount,
          "name": clusterName
        };
        return $http.put(urlBase + 'clusters/' + clusterName, jsonData);
      }

      return {
        sendDeleteCluster: sendDeleteCluster,
        sendCreateCluster: sendCreateCluster,
        sendScaleCluster: sendScaleCluster,
      };
    }
  ])
  .controller('ClustersCtrl',
    function ($scope, $interval, $location, $route,
              ClusterActions, DataService, ProjectsService, $routeParams,
              $rootScope, $filter) {
      var watches = [];
      var services, pods;
      $scope.projectName = $routeParams.project;
      $scope.serviceName = $routeParams.service;
      $scope.projects = {};
      $scope.oshinkoClusters = {};
      $scope.oshinkoClusterNames = [];
      $scope.alerts = $scope.alerts || {};
      var label = $filter('label');
      $scope.cluster_id = $route.current.params.Id || '';
      $scope.breadcrumbs = [
        {
          title: $scope.projectName,
          link: "project/" + $scope.projectName
        },
        {
          title: "Spark Clusters"
        }
      ];
      angular.extend($scope, ClusterActions);

      function oshinkoCluster(resource) {
        if (label(resource, "oshinko-cluster")) {
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

        return clusters;
      }

      var groupClusters = function () {
        if (!pods || !services) {
          return;
        }
        $scope.oshinkoClusters = groupByClusters(pods, services);
        $scope.oshinkoClusterNames = Object.keys($scope.oshinkoClusters);
      };
      $scope.countWorkers = function (cluster) {
        if (!cluster || !cluster.worker || !cluster.worker.pod) {
          return 0;
        }
        var pods = cluster.worker.pod;
        var length = Object.keys(pods).length;
        return length;
      };
      $scope.getClusterName = function (cluster) {
        var name = Object.keys(cluster);
        return name[0];
      };
      $scope.getClusterStatus = function (cluster) {
        var status = "Starting...";
        var podStatus;
        var isPod = false;
        if (!cluster || !cluster.worker || !cluster.worker.pod || !cluster.master || !cluster.master.pod) {
          return "Error";
        }
        //TODO look at more states
        _.each(cluster.worker.pod, function (worker) {
          isPod = true;
          if (worker.status.phase !== "Running") {
            podStatus = worker.status.phase;
            return;
          }
        });

        _.each(cluster.master.pod, function (master) {
          isPod = true;
          if (master.status.phase !== "Running") {
            podStatus = master.status.phase;
            return;
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
      $scope.getSparkMasterUrl = function (cluster) {
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
      $scope.getCluster = function () {
        if (!$scope.oshinkoClusters || !$scope.cluster) {
          return;
        }

        var cluster = $scope.oshinkoClusters[$scope.cluster];
        return cluster;
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

          $scope.$on('$destroy', function () {
            DataService.unwatchAll(watches);
          });

        }));

      $scope.$on('$destroy', function () {
        DataService.unwatchAll(watches);
      });
    }
  )
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
      return new URI("/project/" + namespace + "/oshinko");
    };

    extensionRegistry.add('container-links', _.spread(function (container, pod) {
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
        return;
      }
      if (pod.metadata.annotations["openshift.io/deployment-config.name"] !== "oshinko") {
        return;
      }

      return {
        type: 'dom',
        node: template,
        onClick: gotoContainerView,
        url: oshinkoUrl
      };

    }));
  })
  .controller('ClusterDeleteCtrl', [
    '$q',
    '$scope',
    "clusterData",
    "$uibModalInstance",
    "dialogData",

    function ($q, $scope, clusterData, $uibModalInstance, dialogData) {

      $scope.clusterName = dialogData.clusterName || "";
      $scope.workerCount = dialogData.workerCount || 1;

      $scope.deleteCluster = function deleteCluster() {
        var defer = $q.defer();
        clusterData.sendDeleteCluster($scope.clusterName)
          .then(function (response) {
            $uibModalInstance.close(response);
          }, function (error) {
            $uibModalInstance.close(error);
          });
        return defer.promise;
      };

      $scope.cancelfn = function () {
        $uibModalInstance.dismiss('cancel');
      };

      $scope.scaleCluster = function scaleCluster(count) {
        var defer = $q.defer();
        clusterData.sendScaleCluster($scope.clusterName, count)
          .then(function (response) {
            $uibModalInstance.close(response);
          }, function (error) {
            $uibModalInstance.close(error);
          });
        return defer.promise;
      };
    }
  ])
  .controller('ClusterNewCtrl', [
    '$q',
    '$scope',
    "dialogData",
    "clusterData",
    "$uibModalInstance",
    function ($q, $scope, dialogData, clusterData, $uibModalInstance) {
      var NAME_RE = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/;
      var NUMBER_RE = /^[0-9]*$/;
      var fields = {
        name: "",
        workers: 1,
      };
      $scope.fields = fields;

      function validate(name, workers) {
        var defer = $q.defer();
        var ex;
        if (name !== undefined) {
          if (!name) {
            ex = new Error("The cluster name cannot be empty.");
          }
          else if (!NAME_RE.test(name)) {
            ex = new Error("The member name contains invalid characters.");
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
        var defer = $q.defer();
        var name = $scope.fields.name.trim();
        var workersInt = $scope.fields.workers;

        validate(name, workersInt)
          .then(function () {
            clusterData.sendCreateCluster(name, workersInt).then(function (response) {
              var successMsg = "New cluster " + name + " deployed.";
              console.log(successMsg);
              $uibModalInstance.close(response);
            }, function (error) {
              console.log(error);
              $uibModalInstance.close(error);
            });
          }, function (error) {
            console.log("Fields failed validation: " + error);
            defer.reject(error);
          });
        return defer.promise;
      };
    }
  ]);
