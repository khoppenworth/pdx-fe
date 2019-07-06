'use strict';

angular.module('pdx.controllers')
  .controller('LookupTableDetailController', function ($stateParams, LookupService, $uibModal, $scope, $ngConfirm, LookupConst, NotificationService) {
    var vm = this;
    var index;
    vm.openAddModal = _openAddModal;
    vm.removeMember = _removeLookupMember;

    init();

    function _openAddModal(member) {

      if (vm.lookupTable.name === 'MAType' && Object.keys(member).length)
        member.submoduleType = LookupService.mapToOptions(member.submoduleType);
      LookupConst.LOOKUPS[index].selectedLookup = member;

      $uibModal.open({
        controller: 'lookupModalController',
        controllerAs: 'vm',
        templateUrl: 'app/admin/lookupManager/templates/lookupFormModal.html',
        size: 'lg',
        ariaLabelledBy: 'modal-title',
        resolve: {
          id: function () {
            return vm.id;
          }
        }
      }).closed.then(function () {
        getLookupList();
      });
    }

    function _removeLookupMember(member) {
      $ngConfirm({
        title: "Delete Lookup Member",
        contentUrl: 'app/admin/lookupManager/templates/removeModal.html',
        type: "red",
        typeAnimated: true,
        closeIcon: true,
        scope: $scope,
        columnClass: 'col-md-6 col-md-offset-3',
        buttons: {
          update: {
            text: "Ok",
            btnClass: "btn-danger",
            action: function () {
              LookupService.allLookupResources[vm.lookupTable.resourceAccessName].delete({
                id: member.id
              }, function () {
                NotificationService.notify("Successfully deleted!", "alert-success");
                getLookupList();
              }, function () {
                NotificationService.notify("Unable to delete data. Please try again!", "alert-danger");
              });
            }
          }
        }
      });
    }

    function getLookupList() {
      LookupService.allLookupResources[vm.lookupTable.resourceAccessName].query({}).$promise.then(function (data) {
        vm.lookupTable.data = data
      });
    }

    function init() {
      vm.id = parseInt($stateParams.id);
      index = _.findIndex(LookupConst.LOOKUPS, {
        id: vm.id
      });
      vm.lookupTable = LookupConst.LOOKUPS[index];
      vm.codePropName = vm.lookupTable.resourceAccessName + 'Code';
      vm.showRemove = false;
      getLookupList();
    }

  })
