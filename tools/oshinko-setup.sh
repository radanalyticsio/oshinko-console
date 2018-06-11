#!/bin/bash

OPENSHIFT_VERSION=v3.9
while getopts c:f:i:oh opt; do
    case $opt in
        f)
            FLUSH_IPTABLES="true"
            ;;
        h)
            echo "Usage: oshinko-setup.sh [-f]"
            echo "Example: oshinko-setup.sh -i 192.168.1.10"
            echo "If -o is used, it will be the version of openshift used, default is v3.9"
            echo "If -i is used, the value will be the host used for your openshift cluster"
            echo "If -f is used, 'sudo iptables -F' will be issued before oc cluster up"
            echo "    It may help resolve a potential skydns issue"
            echo ""
            exit
            ;;
        i)
            HOST_IP_ADDRESS=$OPTARG
            ;;
        o)
            OPENSHIFT_VERSION=$OPTARG
            ;;
        \?)
            echo "Invalid option: -$OPTARG" >&2
            exit
            ;;
    esac
done



function setup_openshift() {
  sudo docker cp $(docker create docker.io/openshift/origin:$OPENSHIFT_VERSION):/bin/oc /usr/local/bin/oc
  oc cluster up --version=$OPENSHIFT_VERSION --public-hostname=$HOST_IP_ADDRESS
  docker pull docker.io/radanalyticsio/openshift-spark
  oc login -u system:admin
  export REGISTRY_URL=$(oc get svc -n default docker-registry -o jsonpath='{.spec.clusterIP}:{.spec.ports[0].port}')
  oc login -u developer -p developer
}

function install_extension() {
  export SOURCE_TREE="radanalyticsio/oshinko-console"
  oc login -u system:admin
  oc new-project oshinko-console
  oc new-app centos/httpd-24-centos7~https://github.com/${SOURCE_TREE} --context-dir=dist
  sleep 30s
  oc create route edge --service oshinko-console
  sleep 2s
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
  export OLD_CONSOLE_POD=$(oc get pods -l webconsole=true --template="{{range .items}}{{.metadata.name}}{{end}}")
  oc delete pod $OLD_CONSOLE_POD
  sleep 20s
  export NEW_CONSOLE_POD=$(oc get pods -l webconsole=true --template="{{range .items}}{{.metadata.name}}{{end}}")
  oc logs $NEW_CONSOLE_POD
  echo "Listing of all pods"
  oc get pods --all-namespaces
}

function setup_docker_insecure_registry() {
  rpm -qa | grep -qw git || sudo dnf -y install git
  rpm -qa | grep -qw docker || sudo dnf -y install docker
  sudo systemctl start docker
  sudo sed -i -e "/^# INSECURE_REGISTRY/{ s/.*/INSECURE_REGISTRY='--insecure-registry 172.30.0.0\/16'/ }" /etc/sysconfig/docker
  sudo systemctl restart docker
}


if [ "$FLUSH_IPTABLES" == "true" ]
then
    echo "Flushing IP tables"
    sudo iptables -F
else
    echo "Not flushing IP tables"
fi

setup_docker_insecure_registry
setup_openshift
install_extension
