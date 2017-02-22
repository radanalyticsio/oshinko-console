'use strict';

var h = require('./helpers.js');

describe('Initial page functionality', function () {
  it('should login', function () {
    h.commonSetup();
    h.login(false);
  });
});

describe('Cluster page functionality', function () {
  it('should create, scale, and delete a cluster', function () {
    var EC = protractor.ExpectedConditions;
    browser.get('/console/project/myproject/oshinko');

    // Create a cluster
    element(by.id('startbutton')).click();
    element(by.id('cluster-new-name')).sendKeys('testcluster');
    element(by.id('createbutton')).click();
    browser.wait(EC.visibilityOf(element(by.id('clustername-testcluster'))));

    // Scale
    browser.wait(EC.visibilityOf(element(by.id('testcluster-actions'))));
    element(by.id('testcluster-actions')).click();
    element(by.id('testcluster-scalebutton')).click();
    element(by.name('numworkers')).sendKeys(protractor.Key.CONTROL, "a", protractor.Key.NULL, "3");
    element(by.id('scalebutton')).click();
    browser.wait(EC.textToBePresentInElement(element(by.name('workercount-testcluster')), "3"));

    //Delete
    element(by.id('testcluster-actions')).click();
    element(by.id('testcluster-deletebutton')).click();
    element(by.id('deletebutton')).click();
    var topelement = element(by.css('html'));
    topelement.getText().then(function(text){expect(text).toContain("testcluster has been marked for deletion")});
  });
});
