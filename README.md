Oshinko Console Extensions
==========================
The Oshinko console extensions in [OpenShift Origin](https://github.com/openshift/origin).

Contributing
------------

#### Getting started
1. Install [Nodejs](http://nodejs.org/) and [npm](https://www.npmjs.org/)
2. Install [grunt-cli](http://gruntjs.com/installing-grunt) and [bower](http://bower.io/) by running `npm install -g grunt-cli bower` (may need to be run with sudo)
3. Install [ruby](https://www.ruby-lang.org/en/)
4. Install bundler `gem install bundler`
5. Run `sudo npm install` & `bower install`
6. Build the code via `grunt build` for minified files or with `grunt dev`
7. Spin-up a server (TLS enabled) to host the files located in the dist directory.
If you're unsure on how to do this, see below for a tip.
8. Login as system:admin and change to the openshift-web-console project.
Modify the webconsole-config configmap `oc edit configmap webconsole-config` to point to the URL where your files are hosted.
```sh
assetConfig:
  ...
    extensionScripts:
    - /<path to>https://yourserver.org/dist/scripts/templates.js
    - /<path to>https://yourserver.org/dist/scripts/scripts.js
    extensionStylesheets:
    - /<path to>https://yourserver.org/dist/styles/oshinko.css
  ...
```
9. Trigger a restart of the webconsole by deleting the only pod in the openshift-web-console project.
The console will be restarted.

#### Setup
1. Start Cluster ```oc cluster up --public-hostname=<your IP> ```
2. Spin-up a server (TLS enabled) to host the files located in the dist directory.
If you're unsure on how to do this, see below for a tip.
3. Login as system:admin and change to the openshift-web-console project.
Modify the webconsole-config configmap `oc edit configmap webconsole-config` to point to the URL where your files are hosted.
```sh
assetConfig:
  ...
    extensionScripts:
    - /<path to>https://yourserver.org/dist/scripts/templates.js
    - /<path to>https://yourserver.org/dist/scripts/scripts.js
    extensionStylesheets:
    - /<path to>https://yourserver.org/dist/styles/oshinko.css
  ...
```
4. Trigger a restart of the webconsole by deleting the only pod in the openshift-web-console project.
The console will be restarted.


#### Running integration tests
1.  Have an instance up and running with the extension installed (See Getting Started above)
2.  oc create configmap storedconfig --from-literal=mastercount=1 --from-literal=workercount=4
3.  grunt test-integration --baseUrl=<address of your console>  (https://<ip address>:8443 would be common)

#### Quick method to host your extension scripts
1. Get a certificate (see comment in script) and run the following python script in your oshinko-console directory.
```python
# taken from http://www.piware.de/2011/01/creating-an-https-server-in-python/
# generate server.xml with the following command:
#    openssl req -new -x509 -keyout server.pem -out server.pem -days 365 -nodes
# run as follows:
#    python simple-https-server.py
# then in your browser, visit:
#    https://localhost:4443

import BaseHTTPServer, SimpleHTTPServer
import ssl

httpd = BaseHTTPServer.HTTPServer(('0.0.0.0', 4443), SimpleHTTPServer.SimpleHTTPRequestHandler)
httpd.socket = ssl.wrap_socket (httpd.socket, certfile='./server.pem', server_side=True)
httpd.serve_forever()
```
2. Verify that your scripts can be reached by pointing your browser at https://<yourIP>:4443/dist/scripts/scripts.js
(You may need to accept the certificate if you're using a self-signed cert).

#### Alternative method for hosting oshinko-console extension scripts
1.  Switch to a new project and run the following to serve the extension scripts (from github) via s2i.
```sh
oc new-app centos/httpd-24-centos7~https://github.com/radanalyticsio/oshinko-console --context-dir=dist
#optionally specify your server certs as part of the following command
oc create route edge --service oshinko-console 
```
2. 2. Verify that your scripts can be reached by pointing your browser at https://<the route you just created>/dist/scripts/scripts.js
   (You may need to accept the certificate if you're using a self-signed cert).
  