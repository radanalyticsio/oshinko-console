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
        exposewebui: true
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
        var name = $scope.fields.name.trim();
        var advanced = $scope.advanced;
        var workersInt = $scope.fields.workers;
        var configName = advanced ? $scope.fields.configname : null;
        var masterConfigName = advanced ? $scope.fields.masterconfigname : null;
        var workerConfigName = advanced ? $scope.fields.workerconfigname : null;
        var exposewebui = advanced ? $scope.fields.exposewebui : true;

        return ProjectsService
          .get($routeParams.project)
          .then(_.spread(function (project, context) {
            $scope.project = project;
            $scope.context = context;
            return $q.all([
              validate(name, workersInt),
              validateConfigMap(configName, "cluster-config-name", "cluster configuration", $scope.context),
              validateConfigMap(masterConfigName, "cluster-masterconfig-name", "master spark configuration", $scope.context),
              validateConfigMap(workerConfigName, "cluster-workerconfig-name", "worker spark configuration", $scope.context)
            ]).then(function () {
              clusterData.sendCreateCluster(name, workersInt, configName, masterConfigName, workerConfigName, exposewebui, $scope.context).then(function (response) {
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

