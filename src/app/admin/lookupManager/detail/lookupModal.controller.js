angular.module('pdx.controllers')
  .controller('lookupModalController', function (id, LookupConst, $uibModalInstance, LookupService) {

    var Constants = _.find(LookupConst.LOOKUPS, {
      id: id
    });
    var accessName = Constants.resourceAccessName;
    var vm = this;

    vm.lookupElement = {
      isActive: true,
    };

    vm.formFields = Constants.columns;
    vm.editMode = Object.keys(Constants.selectedLookup).length > 0;
    vm.saveLookup = _saveLookup;
    vm.addLookupForm;

    if (vm.editMode)
      vm.lookupElement = Constants.selectedLookup;

    function model_map(model) {
      var update_model = model;
      var modelIndex = -1;

      if (vm.editMode) {
        /**Add to model, properties that are part of the form  plus 'id' of lookup*/
        update_model = {}
        _.each(model, function (value, prop) {
          modelIndex = _.findIndex(vm.formFields, {
            'model': prop
          });
          if (modelIndex > -1 || prop == 'id')
            update_model[prop] = value;
        })     
      }

      if (model.submoduleType) {
        update_model.submoduleTypeID = model.submoduleType.submoduleTypeID;
        delete update_model.submoduleType;
      }
      
      return update_model;

    }


    function _saveLookup() {
      var model = angular.copy(vm.lookupElement);
      if (vm.addLookupForm.$valid) {
        model = model_map(model);
        if (vm.editMode) {
          LookupService.allLookupResources[accessName].update({
            id: ""
          }, model, function (data) {
            data ? LookupService.alertResult(true, 'Edited') : LookupService.alertResult(false)
          }, function (error) {
            LookupService.alertResult(false, error)
          });
        } else {
          LookupService.allLookupResources[accessName].save(model, function (data) {
            data ? LookupService.alertResult(true, 'Added') : LookupService.alertResult(false)
          }, function (error) {
            LookupService.alertResult(false, error)
          });
        }
        $uibModalInstance.dismiss('closing');
      }

    }
  })
