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
}(), angular.module("oshinkoConsole").factory("clusterData", [ "$http", "$q", "ProjectsService", "DataService", "DeploymentsService", "$routeParams", function(a, b, c, d, e, f) {
function g(a, b) {
return d["delete"](b, a, u, null);
}
function h(a, c) {
var e = b.defer(), f = null;
return d.list("replicationcontrollers", u, function(b) {
var g = b.by("metadata.name");
angular.forEach(g, function(b) {
b.metadata.labels["oshinko-cluster"] === a && b.metadata.name.startsWith(c) && (!f || new Date(b.metadata.creationTimestamp) > new Date(f.metadata.creationTimestamp)) && (f && d["delete"]("replicationcontrollers", f.metadata.name, u, null).then(angular.noop), f = b);
}), f.spec.replicas = 0, d.update("replicationcontrollers", f.metadata.name, f, u).then(function() {
d["delete"]("replicationcontrollers", f.metadata.name, u, null).then(function(a) {
e.resolve(a);
})["catch"](function(a) {
e.reject(a);
});
})["catch"](function(a) {
e.reject(a);
});
}), e.promise;
}
function i(a, c, f) {
var g = b.defer();
return d.get("deploymentconfigs", c, u, null).then(function(a) {
e.scale(a, f).then(function(a) {
g.resolve(a);
});
}), g.promise;
}
function j(a) {
var c = a + "-m", d = a + "-w", e = b.defer();
return b.all([ h(a, c), h(a, d), g(c, "deploymentconfigs"), g(d, "deploymentconfigs"), g(a, "services"), g(a + "-ui", "services") ]).then(function(a) {
var b = !1;
angular.forEach(a, function(a) {
200 !== a.code && (b = !0);
}), b ? e.reject(a) :e.resolve(a);
}), e.promise;
}
function k(a, b, c, d) {
var e = [];
angular.forEach(a.deploymentConfig.envVars, function(a, b) {
e.push({
name:b,
value:a
});
});
var f = angular.copy(a.labels);
f.deploymentconfig = a.name;
var g = {
image:b.toString(),
name:a.name,
ports:c,
env:e,
resources:{},
terminationMessagePath:"/dev/termination-log",
imagePullPolicy:"IfNotPresent"
}, h = [];
d && (h = [ {
name:d,
configMap:{
name:d,
defaultMode:420
}
} ], g.volumeMounts = [ {
name:d,
readOnly:!0,
mountPath:"/etc/oshinko-spark-configs"
} ]), "master" === a.labels["oshinko-type"] ? (g.livenessProbe = {
httpGet:{
path:"/",
port:8080,
scheme:"HTTP"
},
timeoutSeconds:1,
periodSeconds:10,
successThreshold:1,
failureThreshold:3
}, g.readinessProbe = {
httpGet:{
path:"/",
port:8080,
scheme:"HTTP"
},
timeoutSeconds:1,
periodSeconds:10,
successThreshold:1,
failureThreshold:3
}) :g.livenessProbe = {
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
var i;
i = a.scaling.autoscaling ? a.scaling.minReplicas || 1 :a.scaling.replicas;
var j = {
apiVersion:"v1",
kind:"DeploymentConfig",
metadata:{
name:a.name,
labels:a.labels,
annotations:a.annotations
},
spec:{
replicas:i,
selector:{
"oshinko-cluster":a.labels["oshinko-cluster"]
},
triggers:[ {
type:"ConfigChange"
} ],
template:{
metadata:{
labels:f
},
spec:{
volumes:h,
containers:[ g ],
restartPolicy:"Always",
terminationGracePeriodSeconds:30,
dnsPolicy:"ClusterFirst",
securityContext:{}
}
}
}
};
return a.deploymentConfig.deployOnNewImage && j.spec.triggers.push({
type:"ImageChange",
imageChangeParams:{
automatic:!0,
containerNames:[ a.name ],
from:{
kind:b.kind,
name:b.toString()
}
}
}), a.deploymentConfig.deployOnConfigChange && j.spec.triggers.push({
type:"ConfigChange"
}), j;
}
function l(a, b, c, d, e, f) {
var g = "master" === c ? "-m" :"-w", h = {
deploymentConfig:{
envVars:{
OSHINKO_SPARK_CLUSTER:b
}
},
name:b + g,
labels:{
"oshinko-cluster":b,
"oshinko-type":c
},
scaling:{
autoscaling:!1,
minReplicas:1
}
};
"worker" === c && (h.deploymentConfig.envVars.SPARK_MASTER_ADDRESS = "spark://" + b + ":7077", h.deploymentConfig.envVars.SPARK_MASTER_UI_ADDRESS = "http://" + b + "-ui:8080"), f && (h.deploymentConfig.envVars.SPARK_CONF_DIR = "/etc/oshinko-spark-configs"), h.scaling.replicas = d ? d :1;
var i = k(h, a, e, f);
return i;
}
function m(a, b, c) {
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
function n(a, b, c, d) {
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
return m(e, a, d);
}
function o(a) {
return d.create("deploymentconfigs", null, a, u, null);
}
function p(a) {
return d.create("services", null, a, u, null);
}
function q(a, c, e, f) {
var g = b.defer(), h = {};
return a ? d.get("configmaps", a, u, null).then(function(a) {
a.data.workercount && (h.workerCount = parseInt(a.data.workercount)), a.data.sparkmasterconfig && (h.masterConfigName = a.data.sparkmasterconfig), a.data.sparkworkerconfig && (h.workerConfigName = a.data.sparkworkerconfig), c && (h.workerCount = c), e && (h.workerConfigName = e), f && (h.masterConfigName = f), g.resolve(h);
})["catch"](function() {
c && (h.workerCount = c), e && (h.workerConfigName = e), f && (h.masterConfigName = f), g.resolve(h);
}) :(c && (h.workerCount = c), e && (h.workerConfigName = e), f && (h.masterConfigName = f), g.resolve(h)), g.promise;
}
function r(a, c, d, e, f) {
var g = "docker.io/radanalyticsio/openshift-spark:latest", h = [ {
name:"spark-webui",
containerPort:8081,
protocol:"TCP"
} ], i = [ {
name:"spark-webui",
containerPort:8080,
protocol:"TCP"
}, {
name:"spark-master",
containerPort:7077,
protocol:"TCP"
} ], j = [ {
protocol:"TCP",
port:7077,
targetPort:7077
} ], k = [ {
protocol:"TCP",
port:8080,
targetPort:8080
} ], m = null, r = null, s = null, t = null, u = b.defer();
return q(d, c, f, e).then(function(c) {
m = l(g, a, "master", null, i, c.masterConfigName), r = l(g, a, "worker", c.workerCount, h, c.workerConfigName), s = n(a, a, "master", j), t = n(a + "-ui", a, "webui", k), b.all([ o(m), o(r), p(s), p(t) ]).then(function(a) {
u.resolve(a);
})["catch"](function(a) {
u.reject(a);
});
}), u.promise;
}
function s(a, c) {
var d = a + "-w", e = b.defer();
return b.all([ i(a, d, c) ]).then(function(a) {
e.resolve(a);
})["catch"](function(a) {
e.reject(a);
}), e.promise;
}
var t = f.project, u = null;
return c.get(t).then(_.spread(function(a, b) {
u = b;
})), {
sendDeleteCluster:j,
sendCreateCluster:r,
sendScaleCluster:s
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
var b = "";
if (!a || !a.master || !a.master.svc) return "";
var c = Object.keys(a.master.svc);
if (0 === c.length) return "";
for (var d = 0; d <= c.length; d++) if (7077 === a.master.svc[c[d]].spec.ports[0].port) {
b = "spark://" + c[d] + ":7077";
break;
}
return b;
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
})["catch"](function(b) {
if ("cancel" !== b) {
var c = "error-create";
a.alerts[c] = {
type:"error",
message:"Cluster create failed"
};
}
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
d.dismiss(a);
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
} ]).controller("OshinkoClusterNewCtrl", [ "$q", "$scope", "dialogData", "clusterData", "$uibModalInstance", "ProjectsService", "DataService", "$routeParams", function(a, b, c, d, e, f, g, h) {
function i(b, c, d) {
var e, f = a.defer();
return b || f.resolve(), g.get("configmaps", b, o, null).then(function() {
f.resolve();
})["catch"](function() {
e = new Error("The " + d + " named '" + b + "' does not exist"), e.target = c, f.reject(e);
}), f.promise;
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
workerconfigname:""
};
b.fields = m, b.advanced = !1;
var n = h.project, o = null;
f.get(n).then(_.spread(function(a, b) {
o = b;
})), b.toggleAdvanced = function() {
b.advanced = !b.advanced;
}, b.cancelfn = function() {
e.dismiss("cancel");
}, b.newCluster = function() {
var c = a.defer(), f = b.fields.name.trim(), g = b.advanced, h = b.fields.workers, k = g ? b.fields.configname :null, l = g ? b.fields.masterconfigname :null, m = g ? b.fields.workerconfigname :null;
return a.all([ j(f, h), i(k, "cluster-config-name", "cluster configuration"), i(l, "cluster-masterconfig-name", "master spark configuration"), i(m, "cluster-workerconfig-name", "worker spark configuration") ]).then(function() {
d.sendCreateCluster(f, h, k, l, m).then(function(a) {
e.close(a);
}, function(a) {
e.dismiss(a);
});
}, function(a) {
b.formError = a.message, c.reject(a);
}), c.promise;
};
} ]);