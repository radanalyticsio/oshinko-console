/**
 * Created by croberts on 2/2/17.
 */

'use strict';
angular.module('oshinkoConsole')
  .controller('OshinkoClusterNewCtrl', [
    '$q',
    '$scope',
    "dialogData",
    "clusterData",
    "$uibModalInstance",
    "ProjectsService",
    "DataService",
    "$routeParams",
    function ($q, $scope, dialogData, clusterData, $uibModalInstance, ProjectsService, DataService, $routeParams) {
      var NAME_RE = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/;
      var NUMBER_RE = /^[0-9]*$/;
      var fields = {
        name: "",
        workers: 1,
        advworkers: 1,
        configname: "",
        masterconfigname: "",
        workerconfigname: ""
      };
      $scope.fields = fields;
      $scope.advanced = false;

      var project = $routeParams.project;
      var myContext = null;
      ProjectsService
        .get(project)
        .then(_.spread(function (project, context) {
          myContext = context;
        }));

      $scope.toggleAdvanced = function () {
        $scope.advanced = $scope.advanced ? false : true;
      };

      function validateConfigMap(name, errTarget, errName) {
        var ex;
        var defer = $q.defer();
        if (!name) {
          defer.resolve();
        }
        DataService.get('configmaps', name, myContext, null).then(function () {
          defer.resolve();
        }).catch(function() {
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
        var name = $scope.fields.name.trim();
        var advanced = $scope.advanced;
        var workersInt = $scope.fields.workers;
        var configName = advanced ? $scope.fields.configname : null;
        var masterConfigName = advanced ? $scope.fields.masterconfigname : null;
        var workerConfigName = advanced ? $scope.fields.workerconfigname : null;

        return $q.all([
          validate(name, workersInt),
          validateConfigMap(configName, "cluster-config-name", "cluster configuration"),
          validateConfigMap(masterConfigName, "cluster-masterconfig-name", "master spark configuration"),
          validateConfigMap(workerConfigName, "cluster-workerconfig-name", "worker spark configuration")
        ]).then(function () {
            clusterData.sendCreateCluster(name, workersInt, configName, masterConfigName, workerConfigName).then(function (response) {
              $uibModalInstance.close(response);
            }, function (error) {
              $scope.formError = error.data.message;
            });
          }, function (error) {
            $scope.formError = error.message;
          });
      };
    }
  ]);

