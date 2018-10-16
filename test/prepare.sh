#!/bin/bash

export OPENSHIFT_VERSION=v3.11

function prepare() {
  ip addr show eth0
  export HOST_IP_ADDRESS="$(ip addr show eth0 | grep "inet\b" | awk '{print $2}' | cut -d/ -f1)"
  echo "Host IP is $HOST_IP_ADDRESS"
  sudo docker cp $(docker create quay.io/openshift/origin-cli:$OPENSHIFT_VERSION):/bin/oc /usr/local/bin/oc
  oc cluster up --public-hostname=$HOST_IP_ADDRESS
  docker pull docker.io/radanalyticsio/openshift-spark
  oc login -u system:admin
  export REGISTRY_URL=$(oc get svc -n default docker-registry -o jsonpath='{.spec.clusterIP}:{.spec.ports[0].port}')
  oc login -u developer -p developer
  oc project myproject
  oc create configmap storedconfig --from-literal=mastercount=1 --from-literal=workercount=4
}

function install_extension() {
  # serve our extension code as an s2i application
  if [ "$TRAVIS_PULL_REQUEST" != "false" ]; then
    echo "Doing s2i for pull request"
    export COMMIT_HASH=$(git rev-parse HEAD)
    echo "TRAVIS_PULL_REQUEST_BRANCH is ${TRAVIS_PULL_REQUEST_BRANCH}"
    echo "TRAVIS_PULL_REQUEST is ${TRAVIS_PULL_REQUEST}"
    echo "TRAVIS_PULL_REQUEST_SLUG is ${TRAVIS_PULL_REQUEST_SLUG}"
    echo "COMMIT_HASH is ${COMMIT_HASH}"
    export SOURCE_TREE="${TRAVIS_PULL_REQUEST_SLUG}#${TRAVIS_PULL_REQUEST_BRANCH}"
  else
    export SOURCE_TREE="${TRAVIS_REPO_SLUG}#${TRAVIS_COMMIT}"
  fi
  oc login -u system:admin
  oc new-project oshinko-console
  oc new-app centos/httpd-24-centos7~https://github.com/${SOURCE_TREE} --context-dir=dist
  sleep 30s
  oc create route edge --service oshinko-console
  sleep 2s
  export CONSOLE_BASE_ROUTE=$(oc get route oshinko-console --template={{.spec.host}})
  # change the console config to reference our extension
  oc project openshift-web-console
  # This is not the standard webconsole-config configmap.  Instead we need to edit the one used by the web console operator used in oc cluster up
  oc get openshiftwebconsoleconfigs.webconsole.operator.openshift.io -o yaml > webconfig.yaml
  echo "Here is the original webconsole config"
  cat webconfig.yaml
  sed -i "s#scriptURLs\: null#scriptURLs\:\n        - https://$CONSOLE_BASE_ROUTE/scripts/scripts.js\n        - https://$CONSOLE_BASE_ROUTE/scripts/templates.js#" webconfig.yaml
  sed -i "s#stylesheetURLs: null#stylesheetURLs\:\n        - https://$CONSOLE_BASE_ROUTE/styles/oshinko.css\n#" webconfig.yaml
  oc replace -f webconfig.yaml
  echo "Here is the updated config for webconsole"
  oc get openshiftwebconsoleconfigs.webconsole.operator.openshift.io -o yaml
  #restart web console
  oc project openshift-web-console
  export OLD_CONSOLE_POD=$(oc get pods -l webconsole=true --template="{{range .items}}{{.metadata.name}}{{end}}")
  oc delete pod $OLD_CONSOLE_POD
  sleep 20s
  export NEW_CONSOLE_POD=$(oc get pods -l webconsole=true --template="{{range .items}}{{.metadata.name}}{{end}}")
  oc logs $NEW_CONSOLE_POD
  echo "Listing of all pods"
  oc get pods --all-namespaces
}

prepare
install_extension
