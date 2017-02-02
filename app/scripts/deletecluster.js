/**
 * Created by croberts on 2/2/17.
 */

'use strict';

angular.module('openshiftConsole')
  .controller('OshinkoClusterDeleteCtrl', [
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
            $uibModalInstance.dismiss(error);
          });
        return defer.promise;
      };

      $scope.cancelfn = function () {
        $uibModalInstance.dismiss('cancel');
      };

      var NUMBER_RE = /^[0-9]*$/;

      function validate(workers) {
        $scope.formError = "";
        var defer = $q.defer();
        var ex;
        if (!workers) {
          ex = new Error("The number of workers cannot be empty or less than 1.");
        }
        else if (!NUMBER_RE.test(workers)) {
          ex = new Error("Please give a valid number of workers.");
        }
        else if (workers <= 0) {
          ex = new Error("Please give a value greater than 0.");
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
        var defer = $q.defer();

        validate(count)
          .then(function () {
            clusterData.sendScaleCluster($scope.clusterName, count).then(function (response) {
              $uibModalInstance.close(response);
            }, function (error) {
              $uibModalInstance.close(error);
            });
          }, function (error) {
            $scope.formError = error.message;
            defer.reject(error);
          });
        return defer.promise;
      };
    }
  ]);