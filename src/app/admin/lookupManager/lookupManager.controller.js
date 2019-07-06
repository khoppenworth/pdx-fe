'use strict';

angular.module('pdx.controllers')
  .controller('LookupManagerController', function (LookupConst, $state) {
    var vm = this;
    vm.lookups = LookupConst.LOOKUPS;
    vm.lookupDetail = _lookupDetail
    function _lookupDetail (lookup){
      $state.go('lookups.detail',{id: lookup.id});
    }
  })
