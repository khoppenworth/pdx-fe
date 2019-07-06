(function() {
    'use strict';

    angular.module('pdx.controllers')
        .controller('DeviceAccessoryModalController', function($uibModalInstance, $filter, device_accessory, accessory_type_code, accessoryTypeList) {
            var vm = this;
            vm.addDeviceAccessory = _addDeviceAccessory;
            vm.editMode = device_accessory != null;

            vm.device_accessory = angular.copy(device_accessory);
            vm.deviceAccessoryValidation = {};

            _init();

            function _init() {
                if (!_.isNull(accessory_type_code)) {
                    vm.device_accessory = {};
                    var accessoryTypeObj = $filter('filter')(accessoryTypeList, { accessoryTypeCode: accessory_type_code })[0];
                    vm.device_accessory.accessoryTypeID = accessoryTypeObj.id;
                    vm.device_accessory.accessoryType = accessoryTypeObj;
                    vm.title = vm.editMode ? "Edit " + accessoryTypeObj.name : "Add New " + accessoryTypeObj.name;
                } else {
                    vm.title = vm.editMode ? "Edit " + vm.device_accessory.accessoryType.name : "Add New " + vm.device_accessory.accessoryType.name;
                }

            }

            function _addDeviceAccessory() {
                vm.deviceAccessoryValidation.$showError = true;
                if (vm.deviceAccessoryValidation.$isValid) {
                    $uibModalInstance.close(vm.device_accessory);
                } else return;
            }


        });
})();