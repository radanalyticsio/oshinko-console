angular.module('oshinkoConsoleTemplates', []).run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('views/oshinko/cluster.html',
    "<project-header class=\"top-header\"></project-header>\n" +
    "<project-page class=\"project-overview-page\">\n" +
    "<div class=\"container-cards-pf dashboard-cards\">\n" +
    "<breadcrumbs breadcrumbs=\"breadcrumbs\"></breadcrumbs>\n" +
    "<div class=\"card-pf card-pf-double\" id=\"cluster-list\">\n" +
    "<div class=\"card-pf-heading\">\n" +
    "<div class=\"pull-right\">\n" +
    "<button class=\"btn btn-primary\" id=\"startbutton\" ng-click=\"newCluster()\" translatable=\"yes\">Deploy</button>\n" +
    "</div>\n" +
    "<h2 class=\"card-pf-title\" translatable=\"yes\">Spark Clusters</h2>\n" +
    "</div>\n" +
    "<div class=\"card-pf-body\">\n" +
    "<div class=\"well blank-slate-pf spacious\" ng-if=\"!oshinkoClusters || oshinkoClusterNames.length <= 0\">\n" +
    "<div class=\"blank-slate-pf-icon\">\n" +
    "<i class=\"fa fa-hourglass-start\"></i>\n" +
    "</div>\n" +
    "<h3>No Spark Clusters present</h3>\n" +
    "<p translatable=\"yes\">You can deploy a new spark cluster.</p>\n" +
    "</div>\n" +
    "<table class=\"table\" ng-if=\"oshinkoClusterNames.length > 0\">\n" +
    "<thead>\n" +
    "<tr>\n" +
    "<th>\n" +
    "<a ng-click=\"order('name')\">Name</a>\n" +
    "</th>\n" +
    "<th>\n" +
    "<a ng-click=\"order('status')\">Status</a>\n" +
    "</th>\n" +
    "<th>\n" +
    "<a ng-click=\"order('master_address')\">Master</a>\n" +
    "</th>\n" +
    "<th>\n" +
    "<a ng-click=\"order('worker_count')\">Worker count</a>\n" +
    "</th>\n" +
    "<th></th>\n" +
    "<th></th>\n" +
    "</tr>\n" +
    "</thead>\n" +
    "<tbody ng-repeat=\"(cluster, details) in oshinkoClusters | orderBy:predicate:reverse\" ng-init=\"id = cluster\" name=\"cluster-row-{{$index}}\" data-id=\"{{ id }}\">\n" +
    "<tr>\n" +
    "<td id=\"clustername-{{ cluster }}\" ng-click=\"gotoCluster(cluster)\">{{ cluster }}</td>\n" +
    "<td ng-switch=\"getClusterStatus(oshinkoClusters[cluster])\" ng-click=\"gotoCluster(cluster)\">\n" +
    "<span ng-switch-when=\"Running\" class=\"label label-success\">{{ getClusterStatus(oshinkoClusters[cluster]) }}</span>\n" +
    "<span ng-switch-when=\"Error\" class=\"label label-danger\">{{ getClusterStatus(oshinkoClusters[cluster]) }}</span>\n" +
    "<span ng-switch-when=\"Scaling\" class=\"label label-default\">{{ getClusterStatus(oshinkoClusters[cluster]) }}</span>\n" +
    "<span ng-switch-default class=\"label label-default\">{{ getClusterStatus(oshinkoClusters[cluster]) }}</span>\n" +
    "</td>\n" +
    "<td name=\"masterurl-{{ cluster }}\" ng-click=\"gotoCluster(cluster)\">{{ getSparkMasterUrl(oshinkoClusters[cluster]) }}</td>\n" +
    "<td name=\"workercount-{{ cluster }}\" ng-click=\"gotoCluster(cluster)\">{{ countWorkers(oshinkoClusters[cluster]) }}</td>\n" +
    "<td>\n" +
    "<button name=\"scalebutton-{{cluster}}\" class=\"btn btn-default\" translatable=\"yes\" ng-click=\"scaleCluster(cluster)\">Scale</button>\n" +
    "</td>\n" +
    "<td>\n" +
    "<a name=\"deletebutton-{{ cluster }}\" class=\"delete-icon\">\n" +
    "<i translatable=\"yes\" class=\"pficon-delete\" ng-click=\"deleteCluster(cluster)\"></i>\n" +
    "</a>\n" +
    "</td>\n" +
    "</tr>\n" +
    "</tbody>\n" +
    "</table>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</project-page>"
  );


  $templateCache.put('views/oshinko/clusters.html',
    "<project-header class=\"top-header\"></project-header>\n" +
    "<project-page class=\"project-overview-page\">\n" +
    "<div class=\"container-cards-pf dashboard-cards\">\n" +
    "<div class=\"card-pf card-pf-double\" id=\"cluster-list\">\n" +
    "<alerts alerts=\"alerts\"></alerts>\n" +
    "<breadcrumbs breadcrumbs=\"breadcrumbs\"></breadcrumbs>\n" +
    "<div class=\"card-pf-heading\">\n" +
    "<div class=\"pull-right\">\n" +
    "<button class=\"btn btn-primary\" id=\"startbutton\" ng-click=\"newCluster()\" translatable=\"yes\">Deploy</button>\n" +
    "</div>\n" +
    "<h2 class=\"card-pf-title\" translatable=\"yes\">Spark Clusters</h2>\n" +
    "</div>\n" +
    "<div class=\"card-pf-body\">\n" +
    "<div class=\"well blank-slate-pf spacious\" ng-if=\"!oshinkoClusters || oshinkoClusterNames.length <= 0\">\n" +
    "<div class=\"blank-slate-pf-icon\">\n" +
    "<i class=\"fa fa-hourglass-start\"></i>\n" +
    "</div>\n" +
    "<h3>No Spark Clusters present</h3>\n" +
    "<p translatable=\"yes\">You can deploy a new spark cluster.</p>\n" +
    "</div>\n" +
    "<table class=\"table table-bordered table-hover table-mobile\" ng-if=\"oshinkoClusterNames.length > 0\">\n" +
    "<thead>\n" +
    "<tr>\n" +
    "<th>Name</th>\n" +
    "<th>Status</th>\n" +
    "<th>Master</th>\n" +
    "<th>Worker count</th>\n" +
    "<th></th>\n" +
    "<th></th>\n" +
    "</tr>\n" +
    "</thead>\n" +
    "<tbody ng-repeat=\"cluster in oshinkoClusterNames\" ng-init=\"id = cluster\" name=\"cluster-row-{{ $index }}\" data-id=\"{{ id }}\">\n" +
    "<tr>\n" +
    "<td id=\"clustername-{{ cluster }}\" ng-click=\"gotoCluster(cluster)\">{{ cluster }}</td>\n" +
    "<td ng-switch=\"getClusterStatus(oshinkoClusters[cluster])\" ng-click=\"gotoCluster(cluster)\">\n" +
    "<span ng-switch-when=\"Running\" class=\"label label-success\">{{ getClusterStatus(oshinkoClusters[cluster]) }}</span>\n" +
    "<span ng-switch-when=\"Error\" class=\"label label-danger\">{{ getClusterStatus(oshinkoClusters[cluster]) }}</span>\n" +
    "<span ng-switch-when=\"Scaling\" class=\"label label-default\">{{ getClusterStatus(oshinkoClusters[cluster]) }}</span>\n" +
    "<span ng-switch-default class=\"label label-default\">{{ getClusterStatus(oshinkoClusters[cluster]) }}</span>\n" +
    "</td>\n" +
    "<td name=\"masterurl-{{ cluster }}\" ng-click=\"gotoCluster(cluster)\">{{ getSparkMasterUrl(oshinkoClusters[cluster]) }}</td>\n" +
    "<td name=\"workercount-{{ cluster }}\" ng-click=\"gotoCluster(cluster)\">{{ countWorkers(oshinkoClusters[cluster]) }}</td>\n" +
    "<td>\n" +
    "<button name=\"scalebutton-{{cluster}}\" class=\"btn btn-default\" translatable=\"yes\" ng-click=\"scaleCluster(cluster, countWorkers(oshinkoClusters[cluster]))\">Scale</button>\n" +
    "</td>\n" +
    "<td>\n" +
    "<a name=\"deletebutton-{{ cluster }}\" class=\"delete-icon\">\n" +
    "<i translatable=\"yes\" class=\"pficon-delete\" ng-click=\"deleteCluster(cluster)\"></i>\n" +
    "</a>\n" +
    "</td>\n" +
    "</tr>\n" +
    "</tbody>\n" +
    "</table>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</project-page>"
  );


  $templateCache.put('views/oshinko/delete-cluster.html',
    "<div class=\"modal-header\">\n" +
    "<h4 class=\"modal-title\" translatable=\"yes\">Delete cluster</h4>\n" +
    "</div>\n" +
    "<div class=\"modal-body\">\n" +
    "<span>Do you want to delete cluster: {{clusterName}}?</span>\n" +
    "</div>\n" +
    "<div class=\"modal-footer\">\n" +
    "<button id=\"cancelbutton\" class=\"btn btn-default btn-cancel1\" translatable=\"yes\" ng-click=\"cancelfn()\">Cancel</button>\n" +
    "<button id=\"deletebutton\" class=\"btn btn-primary\" translatable=\"yes\" ng-click=\"complete(deleteCluster())\">Delete</button>\n" +
    "</div>"
  );


  $templateCache.put('views/oshinko/new-cluster.html',
    "<div class=\"modal-header\">\n" +
    "<h4 class=\"modal-title\" translatable=\"yes\">Deploy cluster</h4>\n" +
    "</div>\n" +
    "<div class=\"modal-body\" ng-keyup=\"submitForm($event, 'newCluster')\">\n" +
    "<table class=\"form-table-ct\">\n" +
    "<tr>\n" +
    "<td class=\"top\">\n" +
    "<label translatable=\"yes\" class=\"control-label\" for=\"cluster-new-name\">Name</label>\n" +
    "</td>\n" +
    "<td>\n" +
    "<input id=\"cluster-new-name\" class=\"form-control\" type=\"text\" ng-model=\"fields.name\" autofocus>\n" +
    "</td>\n" +
    "</tr>\n" +
    "<tr>\n" +
    "<td class=\"top\">\n" +
    "<label class=\"control-label\" for=\"cluster-new-workers\" translatable=\"yes\">Number of workers</label>\n" +
    "</td>\n" +
    "<td>\n" +
    "<input id=\"cluster-new-workers\" class=\"form-control\" type=\"number\" ng-model=\"fields.workers\">\n" +
    "</td>\n" +
    "</tr>\n" +
    "<tr ng-show=\"formError\">\n" +
    "<td class=\"form-error\">{{ formError }}</td>\n" +
    "</tr>\n" +
    "</table>\n" +
    "</div>\n" +
    "<div class=\"modal-footer\">\n" +
    "<button id=\"cancelbutton\" class=\"btn btn-default btn-cancel1\" translatable=\"yes\" ng-click=\"cancelfn()\">Cancel</button>\n" +
    "<button id=\"createbutton\" class=\"btn btn-primary\" translatable=\"yes\" ng-click=\"complete(newCluster())\">Deploy</button>\n" +
    "</div>"
  );


  $templateCache.put('views/oshinko/scale-cluster.html',
    "<div class=\"modal-header\">\n" +
    "<h4 class=\"modal-title\" translatable=\"yes\">Scale cluster {{clusterName}}</h4>\n" +
    "</div>\n" +
    "<div class=\"modal-body\" ng-keyup=\"submitForm($event, 'scaleCluster', workerCount)\">\n" +
    "<form>\n" +
    "<label for=\"numworkers\" id=\"numworkers\">Number of workers</label>\n" +
    "<input name=\"numworkers\" type=\"number\" min=\"1\" ng-model=\"workerCount\" value=\"{{workerCount}}\"/>\n" +
    "</form>\n" +
    "<div class=\"form-error\" ng-show=\"formError\">{{ formError }}</div>\n" +
    "</div>\n" +
    "<div class=\"modal-footer\">\n" +
    "<button id=\"cancelbutton\" class=\"btn btn-default btn-cancel\" translatable=\"yes\" ng-click=\"cancelfn()\">Cancel</button>\n" +
    "<button id=\"scalebutton\" class=\"btn btn-primary\" translatable=\"yes\" ng-click=\"complete(scaleCluster(workerCount))\">Scale</button>\n" +
    "</div>"
  );

}]);
