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
}(), angular.module("openshiftConsole").controller("OshinkoClustersCtrl", [ "$scope", "$interval", "$location", "$route", "DataService", "ProjectsService", "$routeParams", "$rootScope", "$filter", "AlertMessageService", "$uibModal", function(a, b, c, d, e, f, g, h, i, j, k) {
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
a.projectName = g.project, a.serviceName = g.service, a.currentCluster = g.cluster || "", a.projects = {}, a.oshinkoClusters = {}, a.oshinkoClusterNames = [], a.cluster_details = null, a.alerts = a.alerts || {}, a.selectedTab = {};
var r = i("label");
a.cluster_id = d.current.params.Id || "", a.breadcrumbs = [ {
title:a.projectName,
link:"project/" + a.projectName
}, {
title:"Spark Clusters",
link:"project/" + a.projectName + "/oshinko"
} ], "" !== a.currentCluster && a.breadcrumbs.push({
title:a.currentCluster
}), j.getAlerts().forEach(function(b) {
a.alerts[b.name] = b.data;
}), j.clearAlerts(), g.tab && (a.selectedTab[g.tab] = !0);
var s = function(b, c) {
try {
a.cluster_details = c[b], a.cluster_details.name = a.cluster_details.master.svc[Object.keys(a.cluster_details.master.svc)[0]].metadata.labels["oshinko-cluster"], a.cluster_details.workerCount = Object.keys(a.cluster_details.worker.pod).length, a.cluster_details.masterCount = Object.keys(a.cluster_details.master.pod).length;
} catch (d) {
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
var c = k.open({
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
var b = k.open({
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
var e = k.open({
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
}), g.spec.replicas = 0, c.update("replicationcontrollers", g.metadata.name, g, d).then(function() {
c["delete"]("replicationcontrollers", g.metadata.name, d, null).then(function(a) {
e.resolve(a);
})["catch"](function(a) {
e.reject(a);
});
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
"openshift-hawkular-agent":'collection_interval_secs: 10\nendpoints:\n- type: jolokia\n  protocol: "http"\n  port: 7777\n  path: /jolokia\n  tags:\n    name: ${POD:name}\n  metrics:\n  - name: java.lang:type=Threading#ThreadCount\n    type: counter\n    id:   VM Thread Count\n  - name: java.lang:type=Memory#HeapMemoryUsage#used\n    type: gauge\n    id:   VM Heap Memory Used'
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
function o(a, b, c, d, e, f, g) {
var h = "master" === c ? "-m" :"-w", i = {
deploymentConfig:{
envVars:{
OSHINKO_SPARK_CLUSTER:b
}
},
name:b + h,
labels:{
"oshinko-cluster":b,
"oshinko-type":c
},
annotations:{
"created-by":"oshinko-console"
},
scaling:{
autoscaling:!1,
minReplicas:1
}
};
"worker" === c && (i.deploymentConfig.envVars.SPARK_MASTER_ADDRESS = "spark://" + b + ":7077", i.deploymentConfig.envVars.SPARK_MASTER_UI_ADDRESS = "http://" + b + "-ui:8080"), g && (i.deploymentConfig.envVars.SPARK_CONF_DIR = "/etc/oshinko-spark-configs"), f && (i.deploymentConfig.envVars.SPARK_METRICS_ON = "true"), i.scaling.replicas = d ? d :1;
var j = n(i, a, e, g, f);
return j;
}
function p(a, b, c) {
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
function q(a, b, c, d) {
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
return p(e, a, d);
}
function r(a, b) {
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
return p(d, c, b);
}
function s(a, b) {
return c.create("deploymentconfigs", null, a, b, null);
}
function t(a, b) {
return c.create("services", null, a, b, null);
}
function u(a, b) {
var d = a.metadata.name, f = a.metadata.labels, g = {
name:d + "-route"
}, h = e.createRoute(g, d, f);
return c.create("routes", null, h, b);
}
function v(a, d, e, f, g) {
var h = b.defer(), i = {};
return a ? c.get("configmaps", a, g, null).then(function(a) {
a.data.workercount && (i.workerCount = parseInt(a.data.workercount)), a.data.sparkmasterconfig && (i.masterConfigName = a.data.sparkmasterconfig), a.data.sparkworkerconfig && (i.workerConfigName = a.data.sparkworkerconfig), d && (i.workerCount = d), e && (i.workerConfigName = e), f && (i.masterConfigName = f), h.resolve(i);
})["catch"](function() {
d && (i.workerCount = d), e && (i.workerConfigName = e), f && (i.masterConfigName = f), h.resolve(i);
}) :(d && (i.workerCount = d), e && (i.workerConfigName = e), f && (i.masterConfigName = f), h.resolve(i)), h.promise;
}
function w(a, c) {
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
} ], j = a.enablemetrics, k = null, n = null, p = null, w = null, x = null, y = null, z = b.defer();
return v(a.configName, a.workerCount, a.workerConfigName, a.masterConfigName).then(function(v) {
k = o(d, a.clusterName, "master", null, f, j, v.masterConfigName), n = o(d, a.clusterName, "worker", v.workerCount, e, j, v.workerConfigName), p = q(a.clusterName, a.clusterName, "master", g), w = q(a.clusterName + "-ui", a.clusterName, "webui", h);
var A = [ s(k, c), s(n, c), t(p, c), t(w, c) ];
a.enablemetrics && (x = r(a.clusterName, i), A.push(t(x, c)), y = l(a.clusterName + "-metrics", c), A.push(m(y, c))), a.exposewebui && A.push(u(w, c)), b.all(A).then(function(a) {
z.resolve(a);
})["catch"](function(a) {
z.reject(a);
});
}), z.promise;
}
function x(a, c, d, e) {
var f = a + "-w", g = a + "-m", h = [ i(a, f, c, e), i(a, g, d, e) ];
return b.all(h);
}
return {
sendDeleteCluster:k,
sendCreateCluster:w,
sendScaleCluster:x
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
b.advanced = !b.advanced;
}, b.cancelfn = function() {
e.dismiss("cancel");
}, b.newCluster = function() {
var c = b.advanced, g = {
clusterName:b.fields.name.trim(),
workerCount:b.fields.workers,
configName:c ? b.fields.configname :null,
masterConfigName:c ? b.fields.masterconfigname :null,
workerConfigName:c ? b.fields.workerconfigname :null,
exposewebui:!c || b.fields.exposewebui,
enablemetrics:!c || b.fields.enablemetrics
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
} ]);