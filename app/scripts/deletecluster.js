/**
 * Created by croberts on 2/2/17.
 */

'use strict';

angular.module('openshiftConsole')
  .controller('OshinkoClusterDeleteCtrl',
    function ($q, $scope, clusterData, $uibModalInstance, dialogData, $routeParams, ProjectsService) {

      $scope.clusterName = dialogData.clusterName || "";
      $scope.workerCount = dialogData.workerCount || 0;

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
                  if (value.code >= 300 || value.code < 200) {
                    err = true;
                  }
                });
                if (err) {
                  $uibModalInstance.dismiss(values);
                } else {
                  $uibModalInstance.close(values);
                }
              }, function (error) {
                $uibModalInstance.dismiss(error);
              });
          }));
      };

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


      $scope.scaleCluster = function scaleCluster(count) {
        ProjectsService
          .get($routeParams.project)
          .then(_.spread(function (project, context) {
              $scope.project = project;
              $scope.context = context;
              validate(count)
                .then(function () {
                  clusterData.sendScaleCluster($scope.clusterName, count, $scope.context).then(function (response) {
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