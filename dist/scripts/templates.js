angular.module('oshinkoConsoleTemplates', []).run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('views/oshinko/_cluster-details.html',
    "<div class=\"resource-details\">\n" +
    "<div class=\"row\">\n" +
    "<div class=\"col-lg-6\">\n" +
    "<dl class=\"dl-horizontal left\">\n" +
    "<dt>Number Of Masters:</dt>\n" +
    "<dd>\n" +
    "{{cluster_details.masterCount }}\n" +
    "</dd>\n" +
    "<dt>Number Of Workers:</dt>\n" +
    "<dd>\n" +
    "{{cluster_details.workerCount }}\n" +
    "</dd>\n" +
    "</dl>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>"
  );


  $templateCache.put('views/oshinko/cluster.html',
    "<project-header class=\"top-header\"></project-header>\n" +
    "<project-page>\n" +
    "\n" +
    "<div class=\"middle-section\">\n" +
    "<div class=\"middle-container\">\n" +
    "<div class=\"middle-header header-light\">\n" +
    "<div class=\"container-fluid\">\n" +
    "<tasks></tasks>\n" +
    "<alerts alerts=\"alerts\"></alerts>\n" +
    "<breadcrumbs breadcrumbs=\"breadcrumbs\"></breadcrumbs>\n" +
    "<div class=\"page-header page-header-bleed-right page-header-bleed-left\">\n" +
    "<div class=\"pull-right\">\n" +
    "<span uib-dropdown>\n" +
    "<button id=\"{{cluster}}-actions\" type=\"button\" class=\"dropdown-toggle btn btn-default actions-dropdown-btn hidden-xs\" data-toggle=\"dropdown\">\n" +
    "Actions\n" +
    "<span class=\"caret\" aria-hidden=\"true\"></span>\n" +
    "</button>\n" +
    "<ul class=\"uib-dropdown-menu dropdown-menu-right\">\n" +
    "<li>\n" +
    "<a href=\"\" id=\"{{cluster}}-scalebutton\" role=\"button\" ng-click=\"scaleCluster(cluster_details.name, countWorkers(cluster_details))\">Scale Cluster</a>\n" +
    "</li>\n" +
    "<li>\n" +
    "<a href=\"\" id=\"{{cluster}}-deletebutton\" role=\"button\" ng-click=\"deleteCluster(cluster_details.name)\">Delete Cluster</a>\n" +
    "</li>\n" +
    "</ul>\n" +
    "</span>\n" +
    "</div>\n" +
    "<h1>{{ cluster_details.name }}</h1>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class=\"middle-content\" persist-tab-state>\n" +
    "<div class=\"container-fluid\">\n" +
    "<div class=\"row\">\n" +
    "<div class=\"col-md-12\">\n" +
    "<uib-tabset>\n" +
    "<uib-tab heading=\"Details\" active=\"selectedTab.details\">\n" +
    "<uib-tab-heading>Details</uib-tab-heading>\n" +
    "<ng-include src=\"'views/oshinko/_cluster-details.html'\"></ng-include>\n" +
    "</uib-tab>\n" +
    "<uib-tab heading=\"Apps\" active=\"selectedTab.apps\">\n" +
    "<uib-tab-heading>Apps</uib-tab-heading>\n" +
    "<div>Placeholder for cluster -> app information</div>\n" +
    "</uib-tab>\n" +
    "</uib-tabset>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</project-page>"
  );


  $templateCache.put('views/oshinko/clusters.html',
    "<project-header class=\"top-header\"></project-header>\n" +
    "<project-page>\n" +
    "\n" +
    "<div class=\"middle-section\">\n" +
    "<div class=\"middle-container\">\n" +
    "<div class=\"middle-header header-light\">\n" +
    "<div class=\"container-fluid\">\n" +
    "<tasks></tasks>\n" +
    "<alerts alerts=\"alerts\"></alerts>\n" +
    "<breadcrumbs breadcrumbs=\"breadcrumbs\"></breadcrumbs>\n" +
    "<div class=\"page-header page-header-bleed-right page-header-bleed-left\">\n" +
    "<div class=\"pull-right\">\n" +
    "<button class=\"btn btn-primary\" id=\"startbutton\" ng-click=\"newCluster()\">Deploy</button>\n" +
    "</div>\n" +
    "<h1>Spark Clusters</h1>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class=\"middle-content\" in-view-container>\n" +
    "<div class=\"container-fluid\">\n" +
    "<div class=\"row\">\n" +
    "<div class=\"col-md-12 gutter-top\">\n" +
    "<div class=\"well blank-slate-pf spacious\" ng-if=\"!oshinkoClusters || oshinkoClusterNames.length <= 0\">\n" +
    "<div class=\"blank-slate-pf-icon\">\n" +
    "<i class=\"fa fa-hourglass-start\"></i>\n" +
    "</div>\n" +
    "<h3>No Spark Clusters present</h3>\n" +
    "<p>You can deploy a new spark cluster.</p>\n" +
    "</div>\n" +
    "<table class=\"table table-bordered table-hover table-mobile\" ng-if=\"oshinkoClusterNames.length > 0\">\n" +
    "<thead>\n" +
    "<tr>\n" +
    "<th>Name</th>\n" +
    "<th>Status</th>\n" +
    "<th>Master</th>\n" +
    "<th>Masters</th>\n" +
    "<th>Workers</th>\n" +
    "<th>Spark UI Link</th>\n" +
    "<th><span class=\"sr-only\">Actions</span></th>\n" +
    "</tr>\n" +
    "</thead>\n" +
    "<tbody ng-repeat=\"cluster in oshinkoClusterNames\" ng-init=\"id = cluster\" name=\"cluster-row-{{ $index }}\" data-id=\"{{ id }}\">\n" +
    "<tr>\n" +
    "<td data-title=\"Name\" id=\"clustername-{{ cluster }}\"><a href=\"\" ng-click=\"gotoCluster(cluster)\">{{ cluster }}</a></td>\n" +
    "<td data-title=\"Status\" ng-switch=\"getClusterStatus(oshinkoClusters[cluster])\">\n" +
    "<span ng-switch-when=\"Running\" class=\"fa fa-refresh\" aria-hidden=\"true\" ng-class=\"{'fa-spin' : spinning, 'fa-fw': fixedWidth}\"></span>\n" +
    "<span ng-switch-when=\"Error\" class=\"fa fa-times text-danger\" aria-hidden=\"true\" ng-class=\"{'fa-fw': fixedWidth}\"></span>\n" +
    "<span ng-switch-when=\"Scaling\" class=\"spinner spinner-xs spinner-inline\" aria-hidden=\"true\" ng-class=\"{'fa-fw': fixedWidth}\"></span>\n" +
    "<span ng-switch-when=\"Pending\" class=\"spinner spinner-xs spinner-inline\" aria-hidden=\"true\" ng-class=\"{'fa-fw': fixedWidth}\"></span>\n" +
    "<span ng-switch-default class=\"fa fa-question text-danger\" aria-hidden=\"true\" ng-class=\"{'fa-fw': fixedWidth}\"></span>\n" +
    "<span> {{ getClusterStatus(oshinkoClusters[cluster]) }}</span>\n" +
    "</td>\n" +
    "<td data-title=\"MasterURL\" name=\"masterurl-{{ cluster }}\">{{ getSparkMasterUrl(cluster) }}</td>\n" +
    "<td data-title=\"Masters\" name=\"mastercount-{{ cluster }}\">{{ countMasters(oshinkoClusters[cluster]) }}</td>\n" +
    "<td data-title=\"Workers\" name=\"workercount-{{ cluster }}\">{{ countWorkers(oshinkoClusters[cluster]) }}</td>\n" +
    "<td ng-if=\"getSparkWebUi(oshinkoClusters[cluster])\" data-title=\"WebUI\" name=\"webui-{{ cluster }}\"><a target=\"_blank\" href=\"{{ getSparkWebUi(oshinkoClusters[cluster]) }}\">Spark UI</a></td>\n" +
    "<td ng-if=\"!getSparkWebUi(oshinkoClusters[cluster])\" data-title=\"WebUI\" name=\"webui-{{ cluster }}\">N/A</td>\n" +
    "<td data-title=\"Actions\" class=\"text-xs-left text-right\">\n" +
    "<span uib-dropdown>\n" +
    "<button id=\"{{cluster}}-actions\" type=\"button\" class=\"dropdown-toggle btn btn-default actions-dropdown-btn hidden-xs\" data-toggle=\"dropdown\">\n" +
    "Actions\n" +
    "<span class=\"caret\" aria-hidden=\"true\"></span>\n" +
    "</button>\n" +
    "<ul class=\"uib-dropdown-menu dropdown-menu-right\">\n" +
    "<li>\n" +
    "<a href=\"\" id=\"{{cluster}}-scalebutton\" role=\"button\" ng-click=\"scaleCluster(cluster, countWorkers(oshinkoClusters[cluster]), countMasters(oshinkoClusters[cluster]))\">Scale Cluster</a>\n" +
    "</li>\n" +
    "<li>\n" +
    "<a href=\"\" id=\"{{cluster}}-deletebutton\" role=\"button\" ng-click=\"deleteCluster(cluster)\">Delete Cluster</a>\n" +
    "</li>\n" +
    "</ul>\n" +
    "</span>\n" +
    "</td>\n" +
    "</tr>\n" +
    "</tbody>\n" +
    "</table>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
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
    "<button id=\"deletebutton\" class=\"btn btn-danger\" translatable=\"yes\" ng-click=\"deleteCluster()\">Delete</button>\n" +
    "<button id=\"cancelbutton\" class=\"btn btn-default btn-cancel1\" translatable=\"yes\" ng-click=\"cancelfn()\">Cancel</button>\n" +
    "</div>"
  );


  $templateCache.put('views/oshinko/new-cluster.html',
    "<div class=\"modal-header\">\n" +
    "<h4 class=\"modal-title\" translatable=\"yes\">Deploy cluster</h4>\n" +
    "</div>\n" +
    "<div class=\"modal-body\" ng-keyup=\"submitForm($event, 'newCluster')\">\n" +
    "<form>\n" +
    "<fieldset ng-disabled=\"disableInputs\">\n" +
    "<div class=\"form-group\">\n" +
    "<label for=\"cluster-new-name\">Name</label>\n" +
    "<input id=\"cluster-new-name\" class=\"form-control input-lg\" type=\"text\" ng-model=\"fields.name\" autofocus/>\n" +
    "</div>\n" +
    "<div ng-show=\"!advanced\">\n" +
    "<div class=\"form-group\">\n" +
    "<label for=\"cluster-new-workers\">Number of workers</label>\n" +
    "<input id=\"cluster-new-workers\" class=\"form-control input-lg\" type=\"number\" ng-model=\"fields.workers\"/>\n" +
    "</div>\n" +
    "<div class=\"form-group\"><a href=\"#\" ng-click=\"toggleAdvanced()\">Advanced cluster configuration</a></div>\n" +
    "</div>\n" +
    "<div ng-show=\"advanced\">\n" +
    "<div class=\"form-group\">\n" +
    "<label for=\"cluster-new-workers\">Number of workers</label>\n" +
    "<input id=\"cluster-adv-workers\" class=\"form-control input-lg\" type=\"number\" ng-model=\"fields.workers\"/>\n" +
    "</div>\n" +
    "<div class=\"form-group\">\n" +
    "<label for=\"cluster-new-name\">Configuration name</label>\n" +
    "<input id=\"cluster-config-name\" class=\"form-control input-lg\" type=\"text\" ng-model=\"fields.configname\"/>\n" +
    "</div>\n" +
    "<div class=\"form-group\">\n" +
    "<label for=\"cluster-new-name\">Master configuration name</label>\n" +
    "<input id=\"cluster-masterconfig-name\" class=\"form-control input-lg\" type=\"text\" ng-model=\"fields.masterconfigname\"/>\n" +
    "</div>\n" +
    "<div class=\"form-group\">\n" +
    "<label for=\"cluster-new-name\">Worker configuration name</label>\n" +
    "<input id=\"cluster-workerconfig-name\" class=\"form-control input-lg\" type=\"text\" ng-model=\"fields.workerconfigname\"/>\n" +
    "</div>\n" +
    "<div class=\"form-group\">\n" +
    "<label for=\"cluster-sparkimage\">Apache Spark image (only radanalyticsio/openshift-spark is supported)</label>\n" +
    "<input id=\"cluster-sparkimage\" class=\"form-control input-lg\" type=\"text\" ng-model=\"fields.sparkimage\"/>\n" +
    "</div>\n" +
    "<div class=\"form-group\">\n" +
    "<label for=\"cluster-expose-ui\">Expose Apache Spark web ui via a route</label>\n" +
    "<input id=\"cluster-expose-ui\" class=\"form-control input-lg\" type=\"checkbox\" ng-model=\"fields.exposewebui\"/>\n" +
    "</div>\n" +
    "<div class=\"form-group\">\n" +
    "<label for=\"cluster-metrics\">Enable metrics on your cluster</label>\n" +
    "<input id=\"cluster-metrics\" class=\"form-control input-lg\" type=\"checkbox\" ng-model=\"fields.enablemetrics\"/>\n" +
    "</div>\n" +
    "<div class=\"form-group\"><a href=\"#\" ng-click=\"toggleAdvanced()\">Basic cluster configuration</a></div>\n" +
    "</div>\n" +
    "</fieldset>\n" +
    "</form>\n" +
    "<div ng-show=\"formError\">\n" +
    "<span class=\"form-error\">{{ formError }}</span>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class=\"modal-footer\">\n" +
    "<button id=\"cancelbutton\" class=\"btn btn-default btn-cancel1\" translatable=\"yes\" ng-click=\"cancelfn()\">Cancel</button>\n" +
    "<button id=\"createbutton\" class=\"btn btn-primary\" translatable=\"yes\" ng-click=\"newCluster()\">Deploy</button>\n" +
    "</div>"
  );


  $templateCache.put('views/oshinko/scale-cluster.html',
    "<div class=\"modal-header\">\n" +
    "<h4 class=\"modal-title\" translatable=\"yes\">Scale cluster {{clusterName}}</h4>\n" +
    "</div>\n" +
    "<div class=\"modal-body\" ng-keyup=\"submitForm($event, 'scaleCluster', workerCount, masterCount)\">\n" +
    "<form>\n" +
    "<fieldset ng-disabled=\"disableInputs\">\n" +
    "<div class=\"form-group\">\n" +
    "<label for=\"nummasters\" id=\"nummasters\">Number of masters</label>\n" +
    "<input class=\"form-control input-lg\" name=\"nummasters\" type=\"number\" min=\"0\" max=\"1\" ng-model=\"masterCount\" value=\"{{masterCount}}\"/>\n" +
    "</div>\n" +
    "<div class=\"form-group\">\n" +
    "<label for=\"numworkers\" id=\"numworkers\">Number of workers</label>\n" +
    "<input class=\"form-control input-lg\" name=\"numworkers\" type=\"number\" min=\"0\" ng-model=\"workerCount\" value=\"{{workerCount}}\"/>\n" +
    "</div>\n" +
    "</fieldset>\n" +
    "</form>\n" +
    "<div class=\"form-error\" ng-show=\"formError\">{{ formError }}</div>\n" +
    "</div>\n" +
    "<div class=\"modal-footer\">\n" +
    "<button id=\"cancelbutton\" class=\"btn btn-default btn-cancel\" translatable=\"yes\" ng-click=\"cancelfn()\">Cancel</button>\n" +
    "<button id=\"scalebutton\" class=\"btn btn-primary\" translatable=\"yes\" ng-click=\"scaleCluster(workerCount, masterCount)\">Scale</button>\n" +
    "</div>"
  );

}]);
