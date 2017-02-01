'use strict';

var h = require('./helpers.js');

describe('Initial page functionality', function () {

  it('should login', function () {
    h.commonSetup();
    h.login(false);
  });
});

// describe('Cluster page functionality', function () {
//   it('should display clusters', function () {
//     var EC = protractor.ExpectedConditions;
//     browser.get('/console/project/myproject/oshinko');
//
//     // Create a cluster
//     element(by.id('startbutton')).click();
//     element(by.id('cluster-new-name')).sendKeys('testcluster');
//     element(by.id('createbutton')).click();
//     browser.wait(EC.visibilityOf(element(by.id('clustername-testcluster'))));
//
//     // Scale
//     element(by.name('scalebutton-testcluster')).click();
//     element(by.name('numworkers')).sendKeys(protractor.Key.CONTROL, "a", protractor.Key.NULL, "3");
//     element(by.id('scalebutton')).click();
//     browser.wait(EC.textToBePresentInElement(element(by.name('workercount-testcluster')), "3"));
//
//     // Scale down
//     element(by.name('scalebutton-testcluster')).click();
//     element(by.name('numworkers')).sendKeys(protractor.Key.CONTROL, "a", protractor.Key.NULL, "2");
//     element(by.id('scalebutton')).click();
//     browser.wait(EC.textToBePresentInElement(element(by.name('workercount-testcluster')), "2"));
//
//     //Delete
//     browser.wait(EC.visibilityOf(element(by.id('clustername-testcluster'))));
//     element(by.name('deletebutton-testcluster')).click();
//     element(by.id('deletebutton')).click();
//     browser.get('/#/clusters');
//   });
// });
