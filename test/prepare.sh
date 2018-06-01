#!/bin/bash

export OPENSHIFT_VERSION=v3.9

function prepare() {
  ip addr show eth0
  export HOST_IP_ADDRESS="$(ip addr show eth0 | grep "inet\b" | awk '{print $2}' | cut -d/ -f1)"
  echo "Host IP is $HOST_IP_ADDRESS"
  sudo docker cp $(docker create docker.io/openshift/origin:$OPENSHIFT_VERSION):/bin/oc /usr/local/bin/oc
  oc cluster up --version=$OPENSHIFT_VERSION --public-hostname=$HOST_IP_ADDRESS
  docker pull docker.io/radanalyticsio/openshift-spark
  oc login -u system:admin
  export REGISTRY_URL=$(oc get svc -n default docker-registry -o jsonpath='{.spec.clusterIP}:{.spec.ports[0].port}')
  oc login -u developer -p developer
}

function install_extension() {
  # serve our extension code as an s2i application
  oc login -u system:admin
  oc new-project oshinko-console
  oc new-app centos/httpd-24-centos7~https://github.com/${TRAVIS_REPO_SLUG}#${TRAVIS_COMMIT} --context-dir=dist
  sleep 20
  oc create route edge --service oshinko-console
  sleep 5
  export CONSOLE_BASE_ROUTE=$(oc get route oshinko-console --template={{.spec.host}})
  # change the console config to reference our extension
  oc project openshift-web-console
  oc get configmap webconsole-config -o yaml > webconfig.yaml
  sed -i "s#scriptURLs\: \[\]#scriptURLs\:\n        - https://$CONSOLE_BASE_ROUTE/scripts/scripts.js\n        - https://$CONSOLE_BASE_ROUTE/scripts/templates.js#" webconfig.yaml
  sed -i "s#stylesheetURLs: \[\]#stylesheetURLs\:\n        - https://$CONSOLE_BASE_ROUTE/styles/oshinko.css\n#" webconfig.yaml
  oc replace -f webconfig.yaml
  echo "Here is the updated config for webconsole"
  oc get configmap webconsole-config -o yaml
  #restart web console
  oc project openshift-web-console
  export CONSOLE_POD=$(oc get pods -l webconsole=true --template="{{range .items}}{{.metadata.name}}{{end}}")
  oc delete pod $CONSOLE_POD
  sleep 5
  export CONSOLE_POD=$(oc get pods -l webconsole=true --template="{{range .items}}{{.metadata.name}}{{end}}")
  oc logs $CONSOLE_POD
  echo "Listing of all pods"
  oc get pods --all-namespaces
}

prepare
install_extension
