"use strict";

!function() {
var a = "oshinkoConsole";
angular.module(a, [ "openshiftConsole", "oshinkoConsoleTemplates" ]).config([ "$routeProvider", function(a) {
a.when("/project/:project/oshinko", {
templateUrl:"views/oshinko/clusters.html",
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
}), d && b ? b :d ? "Running" :c) :"Pending";
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
backdrop:"static",
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
backdrop:"static",
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
} ]), angular.module("openshiftConsole").factory("clusterData", [ "$http", "$q", "DataService", "DeploymentsService", function(a, b, c, d) {
function e(a, b, d) {
return c["delete"](b, a, d, null);
}
function f(a, d, e) {
var f = b.defer(), g = null;
return c.list("replicationcontrollers", e, function(b) {
var h = b.by("metadata.name");
angular.forEach(h, function(b) {
b.metadata.labels["oshinko-cluster"] === a && b.metadata.name.startsWith(d) && (!g || new Date(b.metadata.creationTimestamp) > new Date(g.metadata.creationTimestamp)) && (g && c["delete"]("replicationcontrollers", g.metadata.name, e, null).then(angular.noop), g = b);
}), g.spec.replicas = 0, c.update("replicationcontrollers", g.metadata.name, g, e).then(function() {
c["delete"]("replicationcontrollers", g.metadata.name, e, null).then(function(a) {
f.resolve(a);
})["catch"](function(a) {
f.reject(a);
});
})["catch"](function(a) {
f.reject(a);
});
}), f.promise;
}
function g(a, e, f, g) {
var h = b.defer();
return c.get("deploymentconfigs", e, g, null).then(function(a) {
d.scale(a, f).then(function(a) {
h.resolve(a);
});
}), h.promise;
}
function h(a, c) {
var d = a + "-m", g = a + "-w";
return b.all([ f(a, d, c), f(a, g, c), e(d, "deploymentconfigs", c), e(g, "deploymentconfigs", c), e(a, "services", c), e(a + "-ui", "services", c) ]);
}
function i(a, b, c, d) {
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
function j(a, b, c, d, e, f) {
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
var j = i(h, a, e, f);
return j;
}
function k(a, b, c) {
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
function l(a, b, c, d) {
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
return k(e, a, d);
}
function m(a, b) {
return c.create("deploymentconfigs", null, a, b, null);
}
function n(a, b) {
return c.create("services", null, a, b, null);
}
function o(a, d, e, f, g) {
var h = b.defer(), i = {};
return a ? c.get("configmaps", a, g, null).then(function(a) {
a.data.workercount && (i.workerCount = parseInt(a.data.workercount)), a.data.sparkmasterconfig && (i.masterConfigName = a.data.sparkmasterconfig), a.data.sparkworkerconfig && (i.workerConfigName = a.data.sparkworkerconfig), d && (i.workerCount = d), e && (i.workerConfigName = e), f && (i.masterConfigName = f), h.resolve(i);
})["catch"](function() {
d && (i.workerCount = d), e && (i.workerConfigName = e), f && (i.masterConfigName = f), h.resolve(i);
}) :(d && (i.workerCount = d), e && (i.workerConfigName = e), f && (i.masterConfigName = f), h.resolve(i)), h.promise;
}
function p(a, c, d, e, f, g) {
var h = "docker.io/radanalyticsio/openshift-spark:latest", i = [ {
name:"spark-webui",
containerPort:8081,
protocol:"TCP"
} ], k = [ {
name:"spark-webui",
containerPort:8080,
protocol:"TCP"
}, {
name:"spark-master",
containerPort:7077,
protocol:"TCP"
} ], p = [ {
protocol:"TCP",
port:7077,
targetPort:7077
} ], q = [ {
protocol:"TCP",
port:8080,
targetPort:8080
} ], r = null, s = null, t = null, u = null, v = b.defer();
return o(d, c, f, e).then(function(c) {
r = j(h, a, "master", null, k, c.masterConfigName), s = j(h, a, "worker", c.workerCount, i, c.workerConfigName), t = l(a, a, "master", p), u = l(a + "-ui", a, "webui", q), b.all([ m(r, g), m(s, g), n(t, g), n(u, g) ]).then(function(a) {
v.resolve(a);
})["catch"](function(a) {
v.reject(a);
});
}), v.promise;
}
function q(a, c, d) {
var e = a + "-w";
return b.all([ g(a, e, c, d) ]);
}
return {
sendDeleteCluster:h,
sendCreateCluster:p,
sendScaleCluster:q
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
workerconfigname:""
};
b.fields = m, b.advanced = !1, b.toggleAdvanced = function() {
b.advanced = !b.advanced;
}, b.cancelfn = function() {
e.dismiss("cancel");
}, b.newCluster = function() {
var c = b.fields.name.trim(), g = b.advanced, k = b.fields.workers, l = g ? b.fields.configname :null, m = g ? b.fields.masterconfigname :null, n = g ? b.fields.workerconfigname :null;
return f.get(h.project).then(_.spread(function(f, g) {
return b.project = f, b.context = g, a.all([ j(c, k), i(l, "cluster-config-name", "cluster configuration", b.context), i(m, "cluster-masterconfig-name", "master spark configuration", b.context), i(n, "cluster-workerconfig-name", "worker spark configuration", b.context) ]).then(function() {
d.sendCreateCluster(c, k, l, m, n, b.context).then(function(a) {
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
function h(c) {
b.formError = "";
var d, e = a.defer();
return c ? i.test(c) ? c <= 0 && (d = new Error("Please give a value greater than 0.")) :d = new Error("Please give a valid number of workers.") :d = new Error("The number of workers cannot be empty or less than 1."), d && (d.target = "#numworkers", e.reject(d)), d || e.resolve(), e.promise;
}
b.clusterName = e.clusterName || "", b.workerCount = e.workerCount || 1, b.deleteCluster = function() {
g.get(f.project).then(_.spread(function(a, e) {
b.project = a, b.context = e, c.sendDeleteCluster(b.clusterName, b.context).then(function(a) {
var b = !1;
angular.forEach(a, function(a) {
200 !== a.code && (b = !0);
}), b ? d.dismiss(a) :d.close(a);
}, function(a) {
d.dismiss(a);
});
}));
}, b.cancelfn = function() {
d.dismiss("cancel");
};
var i = /^[0-9]*$/;
b.scaleCluster = function(a) {
g.get(f.project).then(_.spread(function(e, f) {
b.project = e, b.context = f, h(a).then(function() {
c.sendScaleCluster(b.clusterName, a, b.context).then(function(a) {
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