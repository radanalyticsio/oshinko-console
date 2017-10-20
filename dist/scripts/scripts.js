"use strict";

!function() {
var a = "oshinkoConsole";
angular.module(a, [ "openshiftConsole", "oshinkoConsoleTemplates" ]).config([ "$routeProvider", function(a) {
a.when("/project/:project/oshinko", {
templateUrl:"views/oshinko/clusters.html",
controller:"OshinkoClustersCtrl"
}), a.when("/project/:project/oshinko/:cluster", {
templateUrl:"views/oshinko/cluster.html",
controller:"OshinkoClustersCtrl"
});
} ]).run(function() {
window.OPENSHIFT_CONSTANTS.PROJECT_NAVIGATION.push({
href:"/oshinko",
label:"Spark Clusters",
iconClass:"pficon  pficon-cluster"
});
}), hawtioPluginLoader.addModule(a);
}(), angular.module("openshiftConsole").controller("OshinkoClustersCtrl", [ "$scope", "$interval", "$location", "$route", "DataService", "ProjectsService", "$routeParams", "$rootScope", "$filter", "$uibModal", "MetricsService", function(a, b, c, d, e, f, g, h, i, j, k) {
function l(a) {
return !!r(a, "oshinko-cluster");
}
function m(a, b, c) {
var d, e, f, g, h, i = {};
return _.each(a, function(a) {
l(a) && (d = r(a, "oshinko-cluster"), f = _.get(a, "metadata.name", ""), e = r(a, "oshinko-type"), h = _.find(b, function(b) {
var c = new LabelSelector(b.spec.selector);
return c.matches(a);
}), h && (g = _.get(h, "metadata.name", ""), _.set(i, [ d, e, "svc", g ], h)), _.set(i, [ d, e, "pod", f ], a));
}), _.each(b, function(a) {
e = r(a, "oshinko-type"), "webui" === e && (d = r(a, "oshinko-cluster"), g = _.get(a, "metadata.name", ""), _.set(i, [ d, e, "svc", g ], a));
}), _.each(c, function(a) {
d = r(a, "oshinko-cluster"), d && _.set(i, [ d, "uiroute" ], a);
}), i;
}
var n, o, p, q = [];
a.projectName = g.project, a.serviceName = g.service, a.currentCluster = g.cluster || "", a.projects = {}, a.oshinkoClusters = {}, a.oshinkoClusterNames = [], a.cluster_details = null, a.alerts = a.alerts || {}, a.selectedTab = {}, a.metricsAvailable = !1;
var r = i("label");
a.cluster_id = d.current.params.Id || "", a.breadcrumbs = [ {
title:a.projectName,
link:"project/" + a.projectName
}, {
title:"Spark Clusters",
link:"project/" + a.projectName + "/oshinko"
} ], "" !== a.currentCluster && a.breadcrumbs.push({
title:a.currentCluster
}), g.tab && (a.selectedTab[g.tab] = !0), k.isAvailable().then(function(b) {
a.OSmetricsAvailable = b;
});
var s = function(b, c) {
try {
a.cluster_details = c[b], a.cluster_details.name = a.cluster_details.master.svc[Object.keys(a.cluster_details.master.svc)[0]].metadata.labels["oshinko-cluster"], a.cluster_details.workerCount = Object.keys(a.cluster_details.worker.pod).length, a.cluster_details.masterCount = Object.keys(a.cluster_details.master.pod).length, a.cluster_details.allPods = Object.values(a.cluster_details.worker.pod), a.cluster_details.allPods.push(Object.values(a.cluster_details.master.pod)[0]), a.cluster_details.containers = b + "-m|" + b + "-w";
var d = Object.keys(a.cluster_details.master.pod)[0], e = a.cluster_details.master.pod[d].metadata.labels["oshinko-metrics-enabled"] && "true" === a.cluster_details.master.pod[d].metadata.labels["oshinko-metrics-enabled"];
a.metricsAvailable = !(!e || !a.OSmetricsAvailable);
} catch (f) {
a.cluster_details = null;
}
}, t = function() {
o && n && (a.oshinkoClusters = m(o, n, p), a.oshinkoClusterNames = Object.keys(a.oshinkoClusters), "" !== a.currentCluster && a.oshinkoClusters[a.currentCluster] ? s(a.currentCluster, a.oshinkoClusters) :a.cluster_details = null);
};
a.countWorkers = function(a) {
if (!a || !a.worker || !a.worker.pod) return 0;
var b = a.worker.pod, c = Object.keys(b).length;
return c;
}, a.countMasters = function(a) {
if (!a || !a.master || !a.master.pod) return 0;
var b = a.master.pod, c = Object.keys(b).length;
return c;
}, a.getClusterName = function(a) {
var b = Object.keys(a);
return b[0];
}, a.getSparkWebUi = function(a) {
var b = "";
try {
b = "http://" + a.uiroute.spec.host;
} catch (c) {
b = null;
}
return b;
}, a.getClusterStatus = function(a) {
var b, c = "Starting...", d = !1;
return a && a.master && a.master.pod ? (a.worker && a.worker.pod && _.each(a.worker.pod, function(a) {
d = !0, "Running" !== a.status.phase && (b = a.status.phase);
}), _.each(a.master.pod, function(a) {
d = !0, "Running" !== a.status.phase && (b = a.status.phase);
}), d && b ? b :d ? "Running" :c) :"Pending";
}, a.getSparkMasterUrl = function(a) {
var b = "spark://" + a + ":7077";
return b;
}, a.getCluster = function() {
if (a.oshinkoClusters && a.cluster) {
var b = a.oshinkoClusters[a.cluster];
return b;
}
}, a.gotoCluster = function(a) {
var b = c.path() + "/" + encodeURIComponent(a);
c.path(b);
};
var u = g.project;
f.get(u).then(_.spread(function(b, c) {
a.project = b, a.projectContext = c, q.push(e.watch("pods", c, function(b) {
a.pods = o = b.by("metadata.name"), t();
})), q.push(e.watch("services", c, function(b) {
a.services = n = b.by("metadata.name"), t();
})), q.push(e.watch("routes", c, function(b) {
a.routes = p = b.by("metadata.name"), t();
})), a.$on("$destroy", function() {
e.unwatchAll(q);
});
})), a.$on("$destroy", function() {
e.unwatchAll(q);
}), a.deleteCluster = function(b) {
var c = j.open({
animation:!0,
controller:"OshinkoClusterDeleteCtrl",
templateUrl:"views/oshinko/delete-cluster.html",
backdrop:"static",
resolve:{
dialogData:function() {
return {
clusterName:b
};
}
}
});
c.result.then(function() {
var c = "cluster-delete";
a.alerts = {}, a.alerts[c] = {
type:"success",
message:b + " has been marked for deletion"
};
})["catch"](function(c) {
if ("cancel" !== c) {
var d = b + "-delete";
a.alerts[d] = {
type:"error",
message:b + " has been marked for deletion, but there were errors"
};
}
});
}, a.newCluster = function() {
var b = j.open({
animation:!0,
controller:"OshinkoClusterNewCtrl",
templateUrl:"views/oshinko/new-cluster.html",
backdrop:"static",
resolve:{
dialogData:function() {
return {};
}
}
});
b.result.then(function(b) {
var c = b[0].metadata.labels["oshinko-cluster"], d = "cluster-create";
a.alerts = {}, a.alerts[d] = {
type:"success",
message:c + " has been created"
};
})["catch"](function(b) {
if ("cancel" !== b) {
var c = "error-create";
a.alerts[c] = {
type:"error",
message:"Cluster create failed"
};
}
});
}, a.scaleCluster = function(b, c, d) {
var e = j.open({
animation:!0,
controller:"OshinkoClusterScaleCtrl",
templateUrl:"views/oshinko/scale-cluster.html",
backdrop:"static",
resolve:{
dialogData:function() {
return {
clusterName:b,
workerCount:c,
masterCount:d
};
}
}
});
e.result.then(function(c) {
var d = c[0].spec.replicas || 0, e = c[1].spec.replicas || 0, f = b + "-scale", g = 1 !== e ? " masters" :" master", h = 1 !== d ? " workers" :" worker";
a.alerts = {}, a.alerts[f] = {
type:"success",
message:b + " has been scaled to " + d + h + " and " + e + g
};
})["catch"](function(b) {
if ("cancel" !== b) {
var c = "error-scale";
a.alerts[c] = {
type:"error",
message:"Cluster scale failed"
};
}
});
};
} ]), angular.module("openshiftConsole").filter("depName", function() {
var a = {
replicationController:[ "openshift.io/deployment-config.name" ]
};
return function(b) {
return a[b];
};
}).filter("clusterName", function() {
var a = {
route:[ "oshinko-cluster" ]
};
return function(b) {
return a[b];
};
}).factory("clusterData", [ "$http", "$q", "DataService", "DeploymentsService", "ApplicationGenerator", "$filter", function(a, b, c, d, e, f) {
function g(a, b, d) {
return c["delete"](b, a, d, null);
}
function h(a, d) {
var e = b.defer(), g = null;
return c.list("replicationcontrollers", d, function(a) {
var b = a.by("metadata.name");
angular.forEach(b, function(a) {
(!g || new Date(a.metadata.creationTimestamp) > new Date(g.metadata.creationTimestamp)) && (g && c["delete"]("replicationcontrollers", g.metadata.name, d, null).then(angular.noop), g = a);
}), g.spec.replicas = 0, c["delete"]("replicationcontrollers", g.metadata.name, d, null).then(function(a) {
e.resolve(a);
})["catch"](function(a) {
e.reject(a);
});
}, {
http:{
params:{
labelSelector:f("depName")("replicationController") + "=" + a
}
}
}), e.promise;
}
function i(a, e, f, g) {
var h = b.defer();
return c.get("deploymentconfigs", e, g, null).then(function(a) {
d.scale(a, f).then(function(a) {
h.resolve(a);
});
}), h.promise;
}
function j(a, b) {
return c.list("routes", b, function(a) {
var c = a.by("metadata.name");
angular.forEach(c, function(a) {
g(a.metadata.name, "routes", b);
});
}, {
http:{
params:{
labelSelector:f("clusterName")("route") + "=" + a
}
}
});
}
function k(a, c) {
var d = a + "-m", e = a + "-w", f = [ h(d, c), h(e, c), g(d, "deploymentconfigs", c), g(e, "deploymentconfigs", c), g(a, "services", c), j(a, c), g(a + "-ui", "services", c), g(a + "-metrics", "services", c), g(a + "-metrics", "configmaps", c) ];
return b.all(f);
}
function l(a) {
var b = {
apiVersion:"v1",
kind:"ConfigMap",
metadata:{
name:a
},
data:{
"hawkular-openshift-agent":'collection_interval_secs: 60\nendpoints:\n- type: jolokia\n  protocol: "http"\n  port: 7777\n  path: /jolokia/\n  tags:\n    name: ${POD:name}\n  metrics:\n  - name: java.lang:type=Threading#ThreadCount\n    type: counter\n    id:   VM Thread Count\n  - name: java.lang:type=Memory#HeapMemoryUsage#used\n    type: gauge\n    id:   VM Heap Memory Used'
}
};
return b;
}
function m(a, b) {
return c.create("configmaps", null, a, b, null);
}
function n(a, b, c, d, e) {
var f = [], g = [];
angular.forEach(a.deploymentConfig.envVars, function(a, b) {
f.push({
name:b,
value:a
});
});
var h = angular.copy(a.labels);
h.deploymentconfig = a.name;
var i = {
image:b.toString(),
name:a.name,
ports:c,
env:f,
resources:{},
terminationMessagePath:"/dev/termination-log",
imagePullPolicy:"IfNotPresent"
};
d && (g = [ {
name:d,
configMap:{
name:d,
defaultMode:420
}
} ], i.volumeMounts = [ {
name:d,
readOnly:!0,
mountPath:"/etc/oshinko-spark-configs"
} ]), e && g.push({
name:"hawkular-openshift-agent",
configMap:{
name:a.labels["oshinko-cluster"] + "-metrics"
}
}), "master" === a.labels["oshinko-type"] ? (i.livenessProbe = {
httpGet:{
path:"/",
port:8080,
scheme:"HTTP"
},
timeoutSeconds:1,
periodSeconds:10,
successThreshold:1,
failureThreshold:3
}, i.readinessProbe = {
httpGet:{
path:"/",
port:8080,
scheme:"HTTP"
},
timeoutSeconds:1,
periodSeconds:10,
successThreshold:1,
failureThreshold:3
}) :i.livenessProbe = {
httpGet:{
path:"/",
port:8081,
scheme:"HTTP"
},
timeoutSeconds:1,
periodSeconds:10,
successThreshold:1,
failureThreshold:3
};
var j;
j = a.scaling.autoscaling ? a.scaling.minReplicas || 1 :a.scaling.replicas;
var k = {
apiVersion:"v1",
kind:"DeploymentConfig",
metadata:{
name:a.name,
labels:a.labels,
annotations:a.annotations
},
spec:{
replicas:j,
selector:{
"oshinko-cluster":a.labels["oshinko-cluster"]
},
triggers:[ {
type:"ConfigChange"
} ],
template:{
metadata:{
labels:h
},
spec:{
volumes:g,
containers:[ i ],
restartPolicy:"Always",
terminationGracePeriodSeconds:30,
dnsPolicy:"ClusterFirst",
securityContext:{}
}
}
}
};
return a.deploymentConfig.deployOnNewImage && k.spec.triggers.push({
type:"ImageChange",
imageChangeParams:{
automatic:!0,
containerNames:[ a.name ],
from:{
kind:b.kind,
name:b.toString()
}
}
}), k;
}
function o(a) {
return {
MasterCount:a.masterCount,
WorkerCount:a.workerCount,
Name:a.configName || "",
SparkMasterConfig:a.masterConfigName || "",
SparkWorkerConfig:a.workerConfigName || "",
SparkImage:a.sparkImage,
ExposeWebUI:a.exposewebui,
Metrics:a.metrics
};
}
function p(a, b, c, d, e, f, g, h) {
var i = "master" === c ? "-m" :"-w", j = {
deploymentConfig:{
envVars:{
OSHINKO_SPARK_CLUSTER:b
}
},
name:b + i,
labels:{
"oshinko-cluster":b,
"oshinko-type":c,
"oshinko-metrics-enabled":f ? "true" :"false"
},
annotations:{
"created-by":"oshinko-console",
"oshinko-config":JSON.stringify(o(h))
},
scaling:{
autoscaling:!1,
minReplicas:1
}
};
"worker" === c && (j.deploymentConfig.envVars.SPARK_MASTER_ADDRESS = "spark://" + b + ":7077", j.deploymentConfig.envVars.SPARK_MASTER_UI_ADDRESS = "http://" + b + "-ui:8080"), g && (j.deploymentConfig.envVars.SPARK_CONF_DIR = "/etc/oshinko-spark-configs"), f && (j.deploymentConfig.envVars.SPARK_METRICS_ON = "true"), j.scaling.replicas = d ? d :1;
var k = n(j, a, e, g, f);
return k;
}
function q(a, b, c) {
if (!c || !c.length) return null;
var d = {
kind:"Service",
apiVersion:"v1",
metadata:{
name:b,
labels:a.labels,
annotations:a.annotations
},
spec:{
selector:a.selectors,
ports:c
}
};
return d;
}
function r(a, b, c, d) {
var e = {
labels:{
"oshinko-cluster":b,
"oshinko-type":c
},
annotations:{},
name:a + "-" + c,
selectors:{
"oshinko-cluster":b,
"oshinko-type":"master"
}
};
return q(e, a, d);
}
function s(a, b) {
var c = a + "-metrics", d = {
labels:{
"oshinko-cluster":a,
"oshinko-type":"oshinko-metrics"
},
annotations:{},
name:c,
selectors:{
"oshinko-cluster":a,
"oshinko-type":"master"
}
};
return q(d, c, b);
}
function t(a, b) {
return c.create("deploymentconfigs", null, a, b, null);
}
function u(a, b) {
return c.create("services", null, a, b, null);
}
function v(a, b) {
var d = a.metadata.name, f = a.metadata.labels, g = {
name:d + "-route"
}, h = e.createRoute(g, d, f);
return c.create("routes", null, h, b);
}
function w(a, d) {
var e = b.defer(), f = {};
return f.clusterName = a.clusterName, a.configName ? c.get("configmaps", a.configName, d, null).then(function(b) {
b.data.workercount && (f.workerCount = parseInt(b.data.workercount)), b.data.mastercount && (f.masterCount = parseInt(b.data.mastercount)), b.data.sparkmasterconfig && (f.masterConfigName = b.data.sparkmasterconfig), b.data.sparkworkerconfig && (f.workerConfigName = b.data.sparkworkerconfig), b.data.sparkimage && (f.sparkImage = b.data.sparkimage), b.data.exposeui && (f.exposewebui = b.data.exposeui), b.data.metrics && (f.metrics = b.data.metrics), a.workerCount && a.workerCount >= 0 && (f.workerCount = a.workerCount), a.workerConfigName && (f.workerConfigName = a.workerConfigName), a.masterConfigName && (f.masterConfigName = a.masterConfigName), a.sparkImage && (f.sparkImage = a.sparkImage), e.resolve(f);
})["catch"](function() {
a.workerConfigName && (f.workerConfigName = a.workerConfigName), a.masterConfigName && (f.masterConfigName = a.masterConfigName), a.sparkImage && (f.sparkImage = a.sparkImage), f.exposewebui = a.exposewebui, f.metrics = a.metrics, f.workerCount = a.workerCount, f.masterCount = a.masterCount, e.resolve(f);
}) :(a.workerConfigName && (f.workerConfigName = a.workerConfigName), a.masterConfigName && (f.masterConfigName = a.masterConfigName), a.sparkImage && (f.sparkImage = a.sparkImage), f.exposewebui = a.exposewebui, f.metrics = a.metrics, f.workerCount = a.workerCount, f.masterCount = a.masterCount, e.resolve(f)), f.workerCount < 0 && (f.workerCount = 1), e.promise;
}
function x(a, c) {
var d = "docker.io/radanalyticsio/openshift-spark:latest", e = [ {
name:"spark-webui",
containerPort:8081,
protocol:"TCP"
}, {
name:"spark-metrics",
containerPort:7777,
protocol:"TCP"
} ], f = [ {
name:"spark-webui",
containerPort:8080,
protocol:"TCP"
}, {
name:"spark-master",
containerPort:7077,
protocol:"TCP"
}, {
name:"spark-metrics",
containerPort:7777,
protocol:"TCP"
} ], g = [ {
protocol:"TCP",
port:7077,
targetPort:7077
} ], h = [ {
protocol:"TCP",
port:8080,
targetPort:8080
} ], i = [ {
protocol:"TCP",
port:7777,
targetPort:7777
} ], j = a.enablemetrics, k = null, n = null, o = null, q = null, x = null, y = null, z = b.defer();
return w(a, c).then(function(w) {
k = p(d, a.clusterName, "master", null, f, j, w.masterConfigName, w), n = p(d, a.clusterName, "worker", w.workerCount, e, j, w.workerConfigName, w), o = r(a.clusterName, a.clusterName, "master", g), q = r(a.clusterName + "-ui", a.clusterName, "webui", h);
var A = [ t(k, c), t(n, c), u(o, c), u(q, c) ];
a.enablemetrics && (x = s(a.clusterName, i), A.push(u(x, c)), y = l(a.clusterName + "-metrics", c), A.push(m(y, c))), a.exposewebui && A.push(v(q, c)), b.all(A).then(function(a) {
z.resolve(a);
})["catch"](function(a) {
z.reject(a);
});
}), z.promise;
}
function y(a, c, d, e) {
var f = a + "-w", g = a + "-m", h = [ i(a, f, c, e), i(a, g, d, e) ];
return b.all(h);
}
return {
sendDeleteCluster:k,
sendCreateCluster:x,
sendScaleCluster:y
};
} ]), angular.module("oshinkoConsole").controller("OshinkoClusterNewCtrl", [ "$q", "$scope", "dialogData", "clusterData", "$uibModalInstance", "ProjectsService", "DataService", "$routeParams", function(a, b, c, d, e, f, g, h) {
function i(b, c, d, e) {
var f, h = a.defer();
return b || h.resolve(), g.get("configmaps", b, e, null).then(function() {
h.resolve();
})["catch"](function() {
f = new Error("The " + d + " named '" + b + "' does not exist"), f.target = c, h.reject(f);
}), h.promise;
}
function j(c, d) {
b.formError = "";
var e, f = a.defer();
return void 0 !== c && (c ? k.test(c) || (e = new Error("The cluster name contains invalid characters.")) :e = new Error("The cluster name cannot be empty."), e && (e.target = "#cluster-new-name", f.reject(e))), void 0 !== d && (d ? l.test(d) ? d <= 0 && (e = new Error("Please give a value greater than 0.")) :e = new Error("Please give a valid number of workers.") :e = new Error("The number of workers count cannot be empty."), e && (e.target = "#cluster-new-workers", f.reject(e))), e || f.resolve(), f.promise;
}
var k = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/, l = /^[0-9]*$/, m = {
name:"",
workers:1,
advworkers:1,
configname:"",
masterconfigname:"",
workerconfigname:"",
enablemetrics:!0,
exposewebui:!0,
sparkimage:"docker.io/radanalyticsio/openshift-spark:latest"
};
b.fields = m, b.advanced = !1, b.toggleAdvanced = function() {
b.advanced = !b.advanced, b.advanced ? b.fields.workers = -1 :b.fields.workers = 1;
}, b.cancelfn = function() {
e.dismiss("cancel");
}, b.newCluster = function() {
var c = b.advanced, g = {
clusterName:b.fields.name.trim(),
masterCount:1,
workerCount:b.fields.workers,
configName:c ? b.fields.configname :null,
masterConfigName:c ? b.fields.masterconfigname :null,
workerConfigName:c ? b.fields.workerconfigname :null,
exposewebui:!c || b.fields.exposewebui,
metrics:!c || b.fields.enablemetrics
};
return f.get(h.project).then(_.spread(function(c, f) {
return b.project = c, b.context = f, a.all([ j(g.clusterName, g.workersInt), i(g.configName, "cluster-config-name", "cluster configuration", b.context), i(g.masterConfigName, "cluster-masterconfig-name", "master spark configuration", b.context), i(g.workerConfigName, "cluster-workerconfig-name", "worker spark configuration", b.context) ]).then(function() {
d.sendCreateCluster(g, b.context).then(function(a) {
e.close(a);
}, function(a) {
b.formError = a.data.message;
});
}, function(a) {
b.formError = a.message;
});
}));
};
} ]), angular.module("openshiftConsole").controller("OshinkoClusterDeleteCtrl", [ "$q", "$scope", "clusterData", "$uibModalInstance", "dialogData", "$routeParams", "ProjectsService", function(a, b, c, d, e, f, g) {
b.clusterName = e.clusterName || "", b.workerCount = e.workerCount || 0, b.masterCount = e.masterCount || 0, b.deleteCluster = function() {
g.get(f.project).then(_.spread(function(a, e) {
b.project = a, b.context = e, c.sendDeleteCluster(b.clusterName, b.context).then(function(a) {
var b = !1;
angular.forEach(a, function(a) {
(a.code >= 300 || a.code < 200) && 404 !== a.code && (b = !0);
}), b ? d.dismiss(a) :d.close(a);
}, function(a) {
404 !== a.status ? d.dismiss(a) :d.close(a);
});
}));
}, b.cancelfn = function() {
d.dismiss("cancel");
};
} ]), angular.module("openshiftConsole").controller("OshinkoClusterScaleCtrl", [ "$q", "$scope", "clusterData", "$uibModalInstance", "dialogData", "$routeParams", "ProjectsService", function(a, b, c, d, e, f, g) {
function h(c) {
b.formError = "";
var d, e = a.defer();
return void 0 === c || null === c ? d = new Error("The number of workers cannot be empty or less than 0.") :i.test(c) ? c < 0 && (d = new Error("Please give a value greater than or equal to 0.")) :d = new Error("Please give a valid number of workers."), d && (d.target = "#numworkers", e.reject(d)), d || e.resolve(), e.promise;
}
b.clusterName = e.clusterName || "", b.workerCount = e.workerCount || 0, b.masterCount = e.masterCount || 0, b.cancelfn = function() {
d.dismiss("cancel");
};
var i = /^[0-9]*$/;
b.scaleCluster = function(a, e) {
g.get(f.project).then(_.spread(function(f, g) {
b.project = f, b.context = g, h(a).then(function() {
c.sendScaleCluster(b.clusterName, a, e, b.context).then(function(a) {
d.close(a);
}, function(a) {
b.formError = a.data.message;
});
}, function(a) {
b.formError = a.message;
});
}));
};
} ]), angular.module("oshinkoConsole").directive("clusterMetrics", [ "$interval", "$parse", "$timeout", "$q", "$rootScope", "ChartsService", "ConversionService", "MetricsCharts", "ClusterMetricsService", function(a, b, c, d, e, f, g, h, i) {
return {
restrict:"E",
scope:{
pods:"=",
containers:"=",
profile:"@",
alerts:"=?"
},
templateUrl:function() {
return "views/oshinko/clustermetrics.html";
},
link:function(b) {
function c(a) {
return null === a.value || void 0 === a.value;
}
function d(a) {
var b;
b = v ? a.compactDatasetLabel || a.label :"Average Usage";
var d = {}, e = [ "Date" ], f = [ b ], g = [ e, f ], h = function(a) {
var b = "" + a.start;
return d[b] || (d[b] = {
total:0,
count:0
}), d[b];
};
return _.each(z[a.descriptor], function(a) {
_.each(a, function(a) {
var b = h(a);
(!x || x < a.end) && (x = a.end), c(a) || (b.total += a.value, b.count = b.count + 1);
});
}), _.each(d, function(b, c) {
var d;
d = b.count ? b.total / b.count :null, e.push(Number(c)), f.push(a.convert ? a.convert(d) :d);
}), f.length > 1 && (a.lastValue = _.last(f) || 0), g;
}
function f(a, e) {
var f = [], g = {
type:"spline"
};
return b.showAverage ? (_.each(a[e.descriptor], function(a, b) {
q(e.descriptor, b, a);
}), g.type = "area-spline", v && e.compactType && (g.type = e.compactType), g.x = "Date", g.columns = d(e), g) :(_.each(a[e.descriptor], function(a, b) {
q(e.descriptor, b, a);
var d = b + "-dates";
_.set(g, [ "xs", b ], d);
var h = [ d ], i = [ b ];
f.push(h), f.push(i), _.each(z[e.descriptor][b], function(a) {
if (h.push(a.start), (!x || x < a.end) && (x = a.end), c(a)) i.push(a.value); else {
var b = e.convert ? e.convert(a.value) :a.value;
i.push(b);
}
});
}), g.columns = _.sortBy(f, function(a) {
return a[0];
}), g);
}
function j(a) {
w || (D = 0, b.showAverage = _.size(b.pods) > 7 || v, _.each(b.metrics, function(c) {
var d, e = f(a, c), g = c.descriptor;
v && c.compactCombineWith && (g = c.compactCombineWith, c.lastValue && (C[g].lastValue = (C[g].lastValue || 0) + c.lastValue)), t[g] ? (t[g].load(e), b.showAverage ? t[g].legend.hide() :t[g].legend.show()) :(d = E(c), d.data = e, t[g] = c3.generate(d));
}));
}
function k() {
return v ? "-15mn" :"-" + b.options.timeRange.value + "mn";
}
function l() {
return 60 * b.options.timeRange.value * 1e3;
}
function m() {
return v ? "1mn" :Math.floor(l() / u) + "ms";
}
function n() {
var a = _.find(b.pods, "metadata.namespace");
if (a) {
var c = {
pods:b.pods,
namespace:a.metadata.namespace,
bucketDuration:m()
};
return c.containerName = b.containers, x ? c.start = x :c.start = k(), c;
}
}
function o(a) {
if (!w) {
if (D++, b.noData) return void (b.metricsError = {
status:_.get(a, "status", 0),
details:_.get(a, "data.errorMsg") || _.get(a, "statusText") || "Status code " + _.get(a, "status", 0)
});
if (!(D < 2) && b.alerts) {
var c = "metrics-failed-" + b.uniqueID;
b.alerts[c] = {
type:"error",
message:"An error occurred updating metrics.",
links:[ {
href:"",
label:"Retry",
onClick:function() {
delete b.alerts[c], D = 1, r();
}
} ]
};
}
}
}
function p() {
var a = _.isEmpty(b.pods);
return a ? (b.loaded = !0, !1) :!b.metricsError && D < 2;
}
function q(a, c, d) {
b.noData = !1;
var e = _.initial(d), f = _.get(z, [ a, c ]);
if (!f) return void _.set(z, [ a, c ], e);
var g = _.takeRight(f.concat(e), u);
_.set(z, [ a, c ], g);
}
function r() {
if (!A && p()) {
y = Date.now();
var a = n();
i.getClusterMetrics(a).then(j, o)["finally"](function() {
b.loaded = !0;
});
}
}
var s, t = {}, u = 30, v = "compact" === b.profile, w = !1;
b.uniqueID = h.uniqueID();
var x, y, z = {}, A = v, B = function(a) {
return a >= 1024;
};
b.metrics = [ {
label:"JVM Threads",
descriptor:"custom/VM Thread Count",
type:"pod",
units:"threads",
usageUnits:function() {
return "threads";
},
compactDatasetLabel:"Active",
compactType:"spline",
chartID:"threads-active-" + b.uniqueID
}, {
label:"JVM Heap Memory",
descriptor:"custom/VM Heap Memory Used",
type:"pod",
units:"MiB",
convert:g.bytesToMiB,
formatUsage:function(a) {
return B(a) && (a /= 1024), h.formatUsage(a);
},
usageUnits:function(a) {
return B(a) ? "GiB" :"MiB";
},
compactType:"spline",
chartID:"vm-heap-mem" + b.uniqueID
}, {
label:"Pod Memory",
units:"MiB",
convert:g.bytesToMiB,
formatUsage:function(a) {
return B(a) && (a /= 1024), h.formatUsage(a);
},
usageUnits:function(a) {
return B(a) ? "GiB" :"MiB";
},
descriptor:"memory/usage",
type:"pod_container",
chartID:"memory-" + b.uniqueID
}, {
label:"Pod CPU",
units:"cores",
convert:g.millicoresToCores,
formatUsage:h.formatUsage,
usageUnits:function() {
return "cores";
},
descriptor:"cpu/usage_rate",
type:"pod_container",
chartID:"cpu-" + b.uniqueID
} ];
var C = _.indexBy(b.metrics, "descriptor");
b.loaded = !1, b.noData = !0;
var D = 0;
i.getMetricsURL().then(function(a) {
b.metricsURL = a;
}), b.options = {
rangeOptions:h.getTimeRangeOptions()
}, b.options.timeRange = _.head(b.options.rangeOptions);
var E = function(a) {
var c = h.getDefaultSparklineConfig(a.chartID, a.units, v);
return _.set(c, "legend.show", !v && !b.showAverage), c;
};
b.$watch("pods", function() {
z = {}, x = null, delete b.metricsError, r();
}, !0), b.$watch("options", function() {
z = {}, x = null, delete b.metricsError, r();
}, !0), s = a(r, h.getDefaultUpdateInterval(), !1), b.updateInView = function(a) {
A = !a, a && (!y || Date.now() > y + h.getDefaultUpdateInterval()) && r();
};
var F = e.$on("metrics.charts.resize", function() {
h.redraw(t);
});
b.$on("$destroy", function() {
s && (a.cancel(s), s = null), F && (F(), F = null), angular.forEach(t, function(a) {
a.destroy();
}), t = null, w = !0;
});
}
};
} ]), angular.module("oshinkoConsole").factory("ClusterMetricsService", [ "$filter", "$http", "$q", "$rootScope", "APIDiscovery", function(a, b, c, d, e) {
function f() {
return angular.isDefined(k) ? c.when(k) :e.getMetricsURL().then(function(a) {
return k = (a || "").replace(/\/$/, "");
});
}
function g(a) {
if (a.length) return _.each(a, function(a) {
a.empty || !_.isNumber(a.avg) ? a.value = null :a.value = a.avg;
}), a;
}
function h(a) {
return a.join("|");
}
function i() {
return f().then(function(a) {
return a ? a + "/metrics/stats/query" :a;
});
}
function j(a) {
return f().then(function(b) {
var c;
return c = "counter" === a.type ? b + o :b + n, URI.expand(c, {
podUID:a.pod.metadata.uid,
containerName:a.containerName,
metric:a.metric
}).toString();
});
}
var k, l, m, n = "/gauges/{containerName}%2F{podUID}%2F{metric}/data", o = "/counters/{containerName}%2F{podUID}%2F{metric}/data", p = function(a) {
return f().then(function(c) {
return !!c && (!a || (!!l || !m && b.get(c).then(function() {
return l = !0, !0;
}, function(a) {
return m = !0, d.$broadcast("metrics-connection-failed", {
url:c,
response:a
}), !1;
})));
});
}, q = function(a) {
var b = a.split("/");
return {
podUID:b[1],
descriptor:b[2] + "/" + b[3]
};
}, r = function(a, c, d) {
var e = _.indexBy(d.pods, "metadata.uid");
return b.post(a, c, {
auth:{},
headers:{
Accept:"application/json",
"Content-Type":"application/json",
"Hawkular-Tenant":d.namespace
}
}).then(function(a) {
var b = {}, c = function(a, c) {
var d = q(c), f = _.get(e, [ d.podUID, "metadata", "name" ]), h = g(a);
_.set(b, [ d.descriptor, f ], h);
};
return _.each(a.data.counter, c), _.each(a.data.gauge, c), b;
});
}, s = _.template("pod_id:<%= uid %>"), t = function(a) {
return i().then(function(b) {
var d = {
bucketDuration:a.bucketDuration,
start:a.start
};
a.end && (d.end = a.end);
var e = [], f = [], g = h(_.map(a.pods, "metadata.uid"));
return a.containerName ? e.push(_.assign({
tags:s({
uid:g,
containerName:a.containerName
})
}, d)) :e.push(_.assign({
tags:s({
uid:g
})
}, d)), _.each(e, function(c) {
var d = r(b, c, a);
f.push(d);
}), c.all(f).then(function(a) {
var b = {};
return _.each(a, function(a) {
_.assign(b, a);
}), b;
});
});
};
return {
isAvailable:p,
getMetricsURL:f,
get:function(a) {
return j(a).then(function(c) {
if (!c) return null;
var d = {
bucketDuration:a.bucketDuration,
start:a.start
};
return a.end && (d.end = a.end), b.get(c, {
auth:{},
headers:{
Accept:"application/json",
"Hawkular-Tenant":a.namespace
},
params:d
}).then(function(b) {
return _.assign(b, {
metricID:a.metric,
data:g(b.data)
});
});
});
},
getCurrentUsage:function(a) {
return j(a).then(function(c) {
if (!c) return null;
var d = {
bucketDuration:"1mn",
start:"-1mn"
};
return b.get(c, {
auth:{},
headers:{
Accept:"application/json",
"Hawkular-Tenant":a.namespace
},
params:d
}).then(function(b) {
return _.assign(b, {
metricID:a.metric,
usage:_.head(g(b.data))
});
});
});
},
getClusterMetrics:t
};
} ]);