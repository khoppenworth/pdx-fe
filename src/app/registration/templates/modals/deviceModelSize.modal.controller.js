(function() {
    'use strict';

    angular.module('pdx.controllers')
        .controller('DeviceModelSizeModalController', function(RegistrationConst, $uibModalInstance, deviceModelSize, $filter) {
            var vm = this;
            vm.add = _add;
            vm.editMode = deviceModelSize != null;
            vm.title = vm.editMode ? "Edit Model and Size" : "Add Model and Size";
            vm.submoduleTypeCode = RegistrationConst.SUB_MODULE_TYPE.MEDICAL_DEVICE;

            vm.deviceModelSize = _.isNull(deviceModelSize) ? {} : deviceModelSize;
            vm.deviceValidation = {
                mdDevicePresentation: []
            };

            vm.devicePackSizes = [];
            var mdDevicePresentations = [];

            init();

            function init() {
                if (!_.isNull(vm.deviceModelSize)) {
                    // prepare packsizes
                    _.each(vm.deviceModelSize.mdDevicePresentations, function(mdPres) {
                        vm.devicePackSizes.push(mdPres.packSize);
                    });
                }
            }


            function _add() {
                vm.deviceValidation.$showError = true;
                if (vm.deviceValidation.$isValid) {
                    $uibModalInstance.close(vm.deviceModelSize);
                    vm.deviceModelSize.presentation = '';
                    _.each(vm.devicePackSizes, function(packSize) {
                        var mdPresModel = {
                            mdModelSizeID: _.isNull(deviceModelSize) ? 0 : deviceModelSize.id,
                            packSizeID: packSize.id,
                            packSize: packSize
                        };
                        var mdPres = {};
                        if (angular.isDefined(vm.deviceModelSize.mdDevicePresentations)) {
                            mdPres = $filter('filter')(vm.deviceModelSize.mdDevicePresentations, { packSizeID: packSize.id })[0];
                        }
                        mdPresModel.id = angular.isDefined(mdPres) ? mdPres.id : 0;
                        mdDevicePresentations.push(mdPresModel);
                        vm.deviceModelSize.presentation += packSize.name + ', ';
                    });

                    vm.deviceModelSize.mdDevicePresentations = mdDevicePresentations;

                }
            }


        });
})();