"use strict";

!function() {
var a = "oshinkoConsole";
angular.module(a, [ "openshiftConsole", "oshinkoConsoleTemplates" ]).config([ "$routeProvider", function(a) {
a.when("/project/:project/oshinko", {
templateUrl:"views/oshinko/clusters.html",
controller:"OshinkoClustersCtrl"
});
} ]).run([ "$routeParams", "extensionRegistry", function(a, b) {
var c = [ "<div row ", 'ng-show="item.url" ', 'class="icon-row" ', 'title="Connect to container">', "<div>", '<i class="fa fa-share" aria-hidden="true"></i>', "</div>", "<div flex>", '<a ng-href="{{item.url}}">', "Manage Spark Clusters", "</a>", "</div>", "</div>" ].join(""), d = function() {
var b = a.project;
return new URI("project/" + b + "/oshinko");
};
b.add("container-links", _.spread(function(a, b) {
console.log("oshinko extensions");
var e = d().toString(), f = _.find(a.ports || [], function(a) {
return a.name && "o-rest-port" === a.name.toLowerCase();
});
if (f && "oshinko" === b.metadata.annotations["openshift.io/deployment-config.name"]) return {
type:"dom",
node:c,
url:e
};
}));
} ]), hawtioPluginLoader.addModule(a);
}(), angular.module("oshinkoConsole").factory("clusterData", [ "$http", "$q", "ProjectsService", "DataService", "$routeParams", function(a, b, c, d, e) {
function f(a, b) {
return d["delete"](b, a, s, null);
}
function g(a, b) {
var c = null;
d.list("replicationcontrollers", s, function(e) {
var f = e.by("metadata.name");
angular.forEach(f, function(e) {
e.metadata.labels["oshinko-cluster"] === a && e.metadata.name.startsWith(b) && (!c || new Date(e.metadata.creationTimestamp) > new Date(c.metadata.creationTimestamp)) && (c && d["delete"]("replicationcontrollers", c.metadata.name, s, null).then(angular.noop), c = e);
}), c.spec.replicas = 0, d.update("replicationcontrollers", c.metadata.name, c, s).then(function() {
return d["delete"]("replicationcontrollers", c.metadata.name, s, null);
});
});
}
function h(a, c, e) {
var f = b.defer(), g = null;
return d.list("replicationcontrollers", s, function(b) {
var h = b.by("metadata.creationTimestamp");
angular.forEach(h, function(b) {
b.metadata.labels["oshinko-cluster"] === a && b.metadata.name.startsWith(c) && (!g || new Date(b.metadata.creationTimestamp) > new Date(g.metadata.creationTimestamp)) && (g = b);
}), g.spec.replicas = e, d.update("replicationcontrollers", g.metadata.name, g, s).then(function(a) {
f.resolve(a);
});
}), f.promise;
}
function i(a) {
var c = a + "-m", d = a + "-w", e = b.defer();
return b.all([ f(c, "deploymentconfigs"), f(d, "deploymentconfigs"), g(a, c), g(a, d), f(a, "services"), f(a + "-ui", "services") ]).then(function(a) {
e.resolve(a);
}), e.promise;
}
function j(a, b, c) {
var d = [];
angular.forEach(a.deploymentConfig.envVars, function(a, b) {
d.push({
name:b,
value:a
});
});
var e = angular.copy(a.labels);
e.deploymentconfig = a.name;
var f = {
image:b.toString(),
name:a.name,
ports:c,
env:d,
resources:{},
terminationMessagePath:"/dev/termination-log",
imagePullPolicy:"IfNotPresent"
};
"master" === a.labels["oshinko-type"] ? (f.livenessProbe = {
httpGet:{
path:"/",
port:8080,
scheme:"HTTP"
},
timeoutSeconds:1,
periodSeconds:10,
successThreshold:1,
failureThreshold:3
}, f.readinessProbe = {
httpGet:{
path:"/",
port:8080,
scheme:"HTTP"
},
timeoutSeconds:1,
periodSeconds:10,
successThreshold:1,
failureThreshold:3
}) :f.livenessProbe = {
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
var g;
g = a.scaling.autoscaling ? a.scaling.minReplicas || 1 :a.scaling.replicas;
var h = {
apiVersion:"v1",
kind:"DeploymentConfig",
metadata:{
name:a.name,
labels:a.labels,
annotations:a.annotations
},
spec:{
replicas:g,
selector:{
"oshinko-cluster":a.labels["oshinko-cluster"]
},
triggers:[ {
type:"ConfigChange"
} ],
template:{
metadata:{
labels:e
},
spec:{
containers:[ f ],
restartPolicy:"Always",
terminationGracePeriodSeconds:30,
dnsPolicy:"ClusterFirst",
securityContext:{}
}
}
}
};
return a.deploymentConfig.deployOnNewImage && h.spec.triggers.push({
type:"ImageChange",
imageChangeParams:{
automatic:!0,
containerNames:[ a.name ],
from:{
kind:b.kind,
name:b.toString()
}
}
}), a.deploymentConfig.deployOnConfigChange && h.spec.triggers.push({
type:"ConfigChange"
}), h;
}
function k(a, b, c, d, e) {
var f = "master" === c ? "-m" :"-w", g = {
deploymentConfig:{
envVars:{
OSHINKO_SPARK_CLUSTER:b
}
},
name:b + f,
labels:{
"oshinko-cluster":b,
"oshinko-type":c
},
scaling:{
autoscaling:!1,
minReplicas:1
}
};
"worker" === c && (g.deploymentConfig.envVars.SPARK_MASTER_ADDRESS = "spark://" + b + ":7077", g.deploymentConfig.envVars.SPARK_MASTER_UI_ADDRESS = "http://" + b + "-ui:8080"), g.scaling.replicas = d ? d :1;
var h = j(g, a, e);
return h;
}
function l(a, b, c) {
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
function m(a, b, c, d) {
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
return l(e, a, d);
}
function n(a) {
return d.create("deploymentconfigs", null, a, s, null);
}
function o(a) {
return d.create("services", null, a, s, null);
}
function p(a, c) {
var d = "docker.io/radanalyticsio/openshift-spark:latest", e = [ {
name:"spark-webui",
containerPort:8081,
protocol:"TCP"
} ], f = [ {
name:"spark-webui",
containerPort:8080,
protocol:"TCP"
}, {
name:"spark-master",
containerPort:7077,
protocol:"TCP"
} ], g = [ {
protocol:"TCP",
port:7077,
targetPort:7077
} ], h = [ {
protocol:"TCP",
port:8080,
targetPort:8080
} ], i = k(d, a, "master", null, f), j = k(d, a, "worker", c, e), l = m(a, a, "master", g), p = m(a + "-ui", a, "webui", h), q = b.defer();
return b.all([ n(i), n(j), o(l), o(p) ]).then(function(a) {
q.resolve(a);
}), q.promise;
}
function q(a, c) {
var d = a + "-w", e = b.defer();
return b.all([ h(a, d, c) ]).then(function(a) {
e.resolve(a);
}), e.promise;
}
var r = e.project, s = null;
return c.get(r).then(_.spread(function(a, b) {
s = b;
})), {
sendDeleteCluster:i,
sendCreateCluster:p,
sendScaleCluster:q
};
} ]).controller("OshinkoClustersCtrl", [ "$scope", "$interval", "$location", "$route", "DataService", "ProjectsService", "$routeParams", "$rootScope", "$filter", "AlertMessageService", "$uibModal", function(a, b, c, d, e, f, g, h, i, j, k) {
function l(a) {
return !!q(a, "oshinko-cluster");
}
function m(a, b) {
var c, d, e, f, g, h = {};
return _.each(a, function(a) {
l(a) && (c = q(a, "oshinko-cluster"), e = _.get(a, "metadata.name", ""), d = q(a, "oshinko-type"), g = _.find(b, function(b) {
var c = new LabelSelector(b.spec.selector);
return c.matches(a);
}), g && (f = _.get(g, "metadata.name", ""), _.set(h, [ c, d, "svc", f ], g)), _.set(h, [ c, d, "pod", e ], a));
}), _.each(b, function(a) {
d = q(a, "oshinko-type"), "webui" === d && (c = q(a, "oshinko-cluster"), f = _.get(a, "metadata.name", ""), _.set(h, [ c, d, "svc", f ], a));
}), h;
}
var n, o, p = [];
a.projectName = g.project, a.serviceName = g.service, a.projects = {}, a.oshinkoClusters = {}, a.oshinkoClusterNames = [], a.alerts = a.alerts || {};
var q = i("label");
a.cluster_id = d.current.params.Id || "", a.breadcrumbs = [ {
title:a.projectName,
link:"project/" + a.projectName
}, {
title:"Spark Clusters"
} ], j.getAlerts().forEach(function(b) {
a.alerts[b.name] = b.data;
}), j.clearAlerts();
var r = function() {
o && n && (a.oshinkoClusters = m(o, n), a.oshinkoClusterNames = Object.keys(a.oshinkoClusters));
};
a.countWorkers = function(a) {
if (!a || !a.worker || !a.worker.pod) return 0;
var b = a.worker.pod, c = Object.keys(b).length;
return c;
}, a.getClusterName = function(a) {
var b = Object.keys(a);
return b[0];
}, a.getClusterStatus = function(a) {
var b, c = "Starting...", d = !1;
return a && a.worker && a.worker.pod && a.master && a.master.pod ? (_.each(a.worker.pod, function(a) {
if (d = !0, "Running" !== a.status.phase) return void (b = a.status.phase);
}), _.each(a.master.pod, function(a) {
if (d = !0, "Running" !== a.status.phase) return void (b = a.status.phase);
}), d && b ? b :d ? "Running" :c) :"Error";
}, a.getSparkMasterUrl = function(a) {
if (!a || !a.master || !a.master.svc) return "";
var b = Object.keys(a.master.svc);
if (0 === b.length) return "";
var c = b[0], d = a.master.svc[c].spec.ports[0].port;
return "spark://" + c + ":" + d;
}, a.getCluster = function() {
if (a.oshinkoClusters && a.cluster) {
var b = a.oshinkoClusters[a.cluster];
return b;
}
};
var s = g.project;
f.get(s).then(_.spread(function(b, c) {
a.project = b, a.projectContext = c, p.push(e.watch("pods", c, function(b) {
a.pods = o = b.by("metadata.name"), r();
})), p.push(e.watch("services", c, function(b) {
a.services = n = b.by("metadata.name"), r();
})), a.$on("$destroy", function() {
e.unwatchAll(p);
});
})), a.$on("$destroy", function() {
e.unwatchAll(p);
}), a.deleteCluster = function(b) {
var c = k.open({
animation:!0,
controller:"OshinkoClusterDeleteCtrl",
templateUrl:"views/oshinko/delete-cluster.html",
resolve:{
dialogData:function() {
return {
clusterName:b
};
}
}
});
c.result.then(function() {
var c = b + "-delete";
a.alerts[c] = {
type:"success",
message:b + " has been marked for deletion"
};
});
}, a.newCluster = function() {
var b = k.open({
animation:!0,
controller:"OshinkoClusterNewCtrl",
templateUrl:"views/oshinko/new-cluster.html",
resolve:{
dialogData:function() {
return {};
}
}
});
b.result.then(function(b) {
var c = b[0].metadata.labels["oshinko-cluster"], d = c + "-create";
a.alerts[d] = {
type:"success",
message:c + " has been created"
};
});
}, a.scaleCluster = function(b, c) {
var d = k.open({
animation:!0,
controller:"OshinkoClusterDeleteCtrl",
templateUrl:"views/oshinko/scale-cluster.html",
resolve:{
dialogData:function() {
return {
clusterName:b,
workerCount:c
};
}
}
});
d.result.then(function(c) {
var d = c[0].spec.replicas, e = b + "-scale", f = d > 1 ? "workers" :"worker";
a.alerts[e] = {
type:"success",
message:b + " has been scaled to " + d + " " + f
};
});
};
} ]).controller("OshinkoClusterDeleteCtrl", [ "$q", "$scope", "clusterData", "$uibModalInstance", "dialogData", function(a, b, c, d, e) {
function f(c) {
b.formError = "";
var d, e = a.defer();
return c ? g.test(c) ? c <= 0 && (d = new Error("Please give a value greater than 0.")) :d = new Error("Please give a valid number of workers.") :d = new Error("The number of workers cannot be empty or less than 1."), d && (d.target = "#numworkers", e.reject(d)), d || e.resolve(), e.promise;
}
b.clusterName = e.clusterName || "", b.workerCount = e.workerCount || 1, b.deleteCluster = function() {
var e = a.defer();
return c.sendDeleteCluster(b.clusterName).then(function(a) {
d.close(a);
}, function(a) {
d.close(a);
}), e.promise;
}, b.cancelfn = function() {
d.dismiss("cancel");
};
var g = /^[0-9]*$/;
b.scaleCluster = function(e) {
var g = a.defer();
return f(e).then(function() {
c.sendScaleCluster(b.clusterName, e).then(function(a) {
d.close(a);
}, function(a) {
d.close(a);
});
}, function(a) {
b.formError = a.message, g.reject(a);
}), g.promise;
};
} ]).controller("OshinkoClusterNewCtrl", [ "$q", "$scope", "dialogData", "clusterData", "$uibModalInstance", function(a, b, c, d, e) {
function f(c, d) {
b.formError = "";
var e, f = a.defer();
return void 0 !== c && (c ? g.test(c) || (e = new Error("The cluster name contains invalid characters.")) :e = new Error("The cluster name cannot be empty."), e && (e.target = "#cluster-new-name", f.reject(e))), void 0 !== d && (d ? h.test(d) ? d <= 0 && (e = new Error("Please give a value greater than 0.")) :e = new Error("Please give a valid number of workers.") :e = new Error("The number of workers count cannot be empty."), e && (e.target = "#cluster-new-workers", f.reject(e))), e || f.resolve(), f.promise;
}
var g = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/, h = /^[0-9]*$/, i = {
name:"",
workers:1
};
b.fields = i, b.cancelfn = function() {
e.dismiss("cancel");
}, b.newCluster = function() {
var c = a.defer(), g = b.fields.name.trim(), h = b.fields.workers;
return f(g, h).then(function() {
d.sendCreateCluster(g, h).then(function(a) {
e.close(a);
}, function(a) {
e.close(a);
});
}, function(a) {
b.formError = a.message, c.reject(a);
}), c.promise;
};
} ]);