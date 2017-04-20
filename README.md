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
7. Add the files to master-config.yaml in the below order
```sh
assetConfig:
  ...
    extensionScripts:
    - /<path to>/oshinko-console/dist/scripts/templates.js
    - /<path to>/oshinko-console/dist/scripts/scripts.js
    extensionStylesheets:
    - /<path to>/oshinko-console/dist/styles/oshinko.css
  ...
```

#### Setup
1. Start Cluster ```oc cluster up --host-config-dir=/home/oshinko ```
2. copy dist/scripts/ & dist/styles/ files into /home/oshinko folder
3. Stop Cluster ```oc cluster down ```
4. Add the files to master-config.yaml in the below order & Start Cluster ```oc cluster up --host-config-dir=/home/oshinko --use-existing-config=true ```
```sh
assetConfig:
  ...
    extensionScripts:
    - templates.js
    - scripts.js
    extensionStylesheets:
    - oshinko.css
  ...
```

#### Running integration tests
1.  Have an instance up and running with the extension installed (See Getting Started above)
2.  grunt test-integration --baseUrl=<address of your console>  (https://<ip address>:8443 would be common)
