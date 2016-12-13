#!/bin/bash


while getopts c:fh opt; do
    case $opt in
        c)
            CONFIG_DIR=$OPTARG
            ;;
        f)
            FLUSH_IPTABLES="true"
            ;;
        h)
            echo "Usage: oshinko-setup.sh [-c <directory to use for origin config>] [-f]"
            echo "Example: oshinko-setup.sh -c /home/myname/originconfig"
            echo "    results in the cluster configuration being stored in /home/myname/originconfig"
            echo "If -c is not set, the default config directory will be /etc/originconfig"
            echo "If -f is used, 'sudo iptables -F' will be issued before oc cluster up"
            echo "    It may help resolve a potential skydns issue"
            echo ""
            exit
            ;;
        \?)
            echo "Invalid option: -$OPTARG" >&2
            exit
            ;;
    esac
done

if [ -z "$CONFIG_DIR" ]
then
    echo "CONFIG_DIR not set, using default of /etc/originconfig"
    CONFIG_DIR="/etc/originconfig"
fi

# install some stuff we need for building
rpm -qa | grep -qw git || sudo dnf -y install git
rpm -qa | grep -qw docker || sudo dnf -y install docker
rpm -qa | grep -qw wget || sudo dnf -y install wget
rpm -qa | grep -qw tar || sudo dnf -y install tar

############ get the oshinko repos and build the images

sudo systemctl start docker 

CURRDIR=`pwd`
export GOPATH=$CURRDIR/oshinko

SRCDIR=$CURRDIR/oshinko/src/github.com/radanalyticsio
mkdir -p $SRCDIR
cd $SRCDIR
if [ ! -d "oshinko-console" ]; then
    git clone http://github.com/radanalyticsio/oshinko-console
fi

########### get the origin image and run oc cluster up
########### this part can be replaced with some other openshift install recipe


cd $CURRDIR
ORIGIN_VERSION=v1.4.0-rc1
ORIGIN_TARBALL=openshift-origin-client-tools-v1.4.0-rc1.b4e0954-linux-64bit.tar.gz
ORIGIN_DIR=openshift-origin-client-tools-v1.4.0-rc1+b4e0954-linux-64bit

if [ ! -d "$ORIGIN_DIR" ]; then
    wget https://github.com/openshift/origin/releases/download/$ORIGIN_VERSION/$ORIGIN_TARBALL
    tar -xvzf $ORIGIN_TARBALL
    sudo cp ${ORIGIN_DIR}/* /usr/bin
fi

sudo sed -i -e "/^# INSECURE_REGISTRY/{ s/.*/INSECURE_REGISTRY='--insecure-registry 172.30.0.0\/16'/ }" /etc/sysconfig/docker
sudo systemctl restart docker

# make sure your local host name can be resolved!
# put it in /etc/hosts if you have to, otherwise you will have no nodes
sudo oc cluster up --host-config-dir=$CONFIG_DIR
sudo oc cluster down
sudo cp $SRCDIR/oshinko-console/dist/scripts/*.js $CONFIG_DIR/master
sudo cp $SRCDIR/oshinko-console/dist/styles/*.css $CONFIG_DIR/master
sudo sed -i -e "s/extensionDevelopment: false/extensionDevelopment: true/" $CONFIG_DIR/master/master-config.yaml
sudo sed -i -e "s/extensionScripts: null/extensionScripts:\n    - templates.js\n    - scripts.js/" $CONFIG_DIR/master/master-config.yaml
sudo sed -i -e "s/extensionStylesheets: null/extensionStylesheets:\n    - oshinko.css/" $CONFIG_DIR/master/master-config.yaml
if [ "$FLUSH_IPTABLES" == "true" ]
then
    echo "Flushing IP tables"
    sudo iptables -F
else
    echo "Not flushing IP tables"
fi
sudo oc cluster up --host-config-dir=$CONFIG_DIR --use-existing-config

############

# Push to a default oshinko project for a default oshinko user
oc login -u developer -p dev
oc new-project oshinko

# set up the oshinko service account
oc create sa oshinko                          # note, VV, first oshinko is the proj name :)
oc policy add-role-to-user edit system:serviceaccount:developer:oshinko -n oshinko

