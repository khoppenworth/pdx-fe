'use strict';

angular.module('pdx.services')
  .service('pendingRequests', function() {
    var pending = [];
    this.get = function() {
      return pending;
    };
    this.add = function(request) {
      pending.push(request);
    };
    this.remove = function(request) {
      pending = _.filter(pending, function(p) {
        return p.url !== request;
      });
    };
    this.cancelAll = function() {
      angular.forEach(pending, function(p) {
        console.log("Cancelled");
        p.canceller.resolve();
      });
      pending.length = 0;
    };
  });
