'use strict';

var h = require('./helpers.js');

describe('Initial page functionality', function () {
  it('should show the login page and login', function () {
    h.commonSetup();
    browser.waitForAngularEnabled(false);
    browser.get('/login');
    // The login page doesn't use angular, so we have to use the underlying WebDriver instance
    var driver = browser.driver;
    driver.wait(function() {
      return driver.findElements(by.name("username"));
    }, 10000);

    h.login(true);
    browser.waitForAngularEnabled(true);
    expect(browser.getTitle()).toEqual("OpenShift Web Console");
    expect(element(by.css(".navbar-iconic .username")).getText()).toEqual("developer");
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
    browser.refresh();
    browser.wait(EC.visibilityOf(element(by.id('testcluster-actions'))));
    element(by.id('testcluster-actions')).click();
    element(by.id('testcluster-scalebutton')).click();
    element(by.name('numworkers')).sendKeys(protractor.Key.CONTROL, "a", protractor.Key.NULL, "3");
    element(by.id('scalebutton')).click();
    browser.wait(EC.textToBePresentInElement(element(by.name('workercount-testcluster')), "3"));

    //Delete
    browser.refresh();
    element(by.id('testcluster-actions')).click();
    element(by.id('testcluster-deletebutton')).click();
    element(by.id('deletebutton')).click();
    var topelement = element(by.css('html'));
    topelement.getText().then(function(text){expect(text).toContain("testcluster has been marked for deletion")});
  });
});

describe('Test advanced create functionality', function () {
  it('should create, scale, and delete a cluster', function () {
    var EC = protractor.ExpectedConditions;
    // Create a cluster
    browser.get('/console/project/myproject/oshinko');
    element(by.id('startbutton')).click();
    element(by.id('toggle-adv')).click();
    element(by.id('cluster-new-name')).sendKeys('advcluster');
    element(by.id('createbutton')).click();
    browser.refresh();
    browser.wait(EC.visibilityOf(element(by.id('advcluster-actions'))));
    // Delete
    element(by.id('advcluster-actions')).click();
    element(by.id('advcluster-deletebutton')).click();
    element(by.id('deletebutton')).click();
    browser.wait(EC.invisibilityOf(element(by.name('advcluster-actions'))));
  });
});

describe('Test advanced create functionality', function () {
  it('should create and delete a cluster with a stored config', function () {
    var EC = protractor.ExpectedConditions;
    // Create a cluster
    browser.get('/console/project/myproject/oshinko');
    element(by.id('startbutton')).click();
    element(by.id('toggle-adv')).click();
    element(by.id('cluster-new-name')).sendKeys('advcluster');
    element(by.id('cluster-config-name')).sendKeys('storedconfig');
    element(by.id('createbutton')).click();
    browser.refresh();
    browser.wait(EC.visibilityOf(element(by.id('advcluster-actions'))));
    // Delete
    element(by.id('advcluster-actions')).click();
    element(by.id('advcluster-deletebutton')).click();
    element(by.id('deletebutton')).click();
    browser.refresh();
    browser.wait(EC.invisibilityOf(element(by.name('advcluster-actions'))));
  });
});
