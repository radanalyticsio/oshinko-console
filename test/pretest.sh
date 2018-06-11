#!/bin/bash

function try_until_success {
    # This is a really simple case that just tests for success.
    # If more complicated waits are needed, we can use the oc commandline testsuite
    echo $1
    while true; do
        set +e
        eval $1
        res=$?
        set -e
        if [ "$res" = 0 ]; then
            break
        fi
        sleep 20s
    done
}

function wait_for_webui {
  echo "Verifying that the console webui is running"
  local command=
  TESTROUTE=https://$IP:8443/console
  command="time wget --no-check-certificate $TESTROUTE"
  echo "Waiting for console to come up."
  try_until_success "$command"
  head console && rm console
}

function verify_build {
## Check to make sure the files in dist are in sync with the actual source code
  grunt build
  oc login -u system:admin
  oc project oshinko-console
  export CONSOLE_BASE_ROUTE=$(oc get route oshinko-console --template={{.spec.host}})
  wget --no-check-certificate https://$CONSOLE_BASE_ROUTE/scripts/scripts.js -O scripts.js
  wget --no-check-certificate https://$CONSOLE_BASE_ROUTE/scripts/templates.js -O templates.js
  if [[ `diff scripts.js dist/scripts/scripts.js` ]]; then echo "Compiled scripts.js does not match dist"; exit 1; else echo "Compiled scripts.js matches source code"; fi
  if [[ `diff templates.js dist/scripts/templates.js` ]]; then echo "Compiled templates.js does not match dist"; exit 1; else echo "Compiled templates.js matches source code"; fi
}

function show_chrome_version {
  export CHROME_VERSION=$(google-chrome --version)
  echo "Chrome version is $CHROME_VERSION"
}

wait_for_webui
verify_build
show_chrome_version
