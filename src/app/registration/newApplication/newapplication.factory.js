(function() {

    'use strict';
    angular.module('pdx.factories')
        .factory('MAFactory', function($resource, AppConst, CommonService, $uibModal, $ngConfirm) {
            var maFactory = {};

            maFactory.maNewApplication = $resource(CommonService.buildUrl(AppConst.API_URL.MA.MANewApplication), { id: "@id" }, AppConst.ResourceMethods.All);
            maFactory.ma = $resource(CommonService.buildUrl(AppConst.API_URL.MA.MA), { id: "@id" }, AppConst.ResourceMethods.Readonly);
            maFactory.maSingle = $resource(CommonService.buildUrl(AppConst.API_URL.MA.MASingle), { maId: "@maId" }, AppConst.ResourceMethods.Readonly);
            maFactory.maProduct = $resource(CommonService.buildUrl(AppConst.API_URL.MA.MAProduct), { id: "@id" }, AppConst.ResourceMethods.Readonly);

            maFactory.submoduleFee = $resource(CommonService.buildUrl(AppConst.API_URL.MA.SubmoduleFeeType), { submoduleCode: "@submoduleCode" }, AppConst.ResourceMethods.Readonly);
            maFactory.maLogStatus = $resource(CommonService.buildUrl(AppConst.API_URL.MA.MALogStatus), { maId: "@maID" }, AppConst.ResourceMethods.Readonly);
            maFactory.maChangeStatus = $resource(CommonService.buildUrl(AppConst.API_URL.MA.MAChangeStatus), {}, AppConst.ResourceMethods.All);
            maFactory.maChangReviewStatus = $resource(CommonService.buildUrl(AppConst.API_URL.MA.MAChangeReviewStatus), { changeStatus: "@changeStatus" }, AppConst.ResourceMethods.All);
            maFactory.approve = $resource(CommonService.buildUrl(AppConst.API_URL.MA.Approve), { isNotificationType: "@isNotificationType" }, AppConst.ResourceMethods.All);
            maFactory.approveNotification = $resource(CommonService.buildUrl(AppConst.API_URL.MA.ApproveNotification), {}, AppConst.ResourceMethods.All);

            maFactory.maDelete = $resource(CommonService.buildUrl(AppConst.API_URL.MA.MADelete), {}, AppConst.ResourceMethods.Save);

            maFactory.maChecklist = $resource(CommonService.buildUrl(AppConst.API_URL.MA.MAChecklist), {}, AppConst.ResourceMethods.All);
            maFactory.maChecklistAnswer = $resource(CommonService.buildUrl(AppConst.API_URL.MA.MAChecklistAnswer), { maId: "@maId", submoduleCode: "@submoduleCode", userId: "@userId", isSra: "@isSra" }, AppConst.ResourceMethods.All);
            maFactory.maUserResponderType = $resource(CommonService.buildUrl(AppConst.API_URL.MA.MAUserResponderType), { maId: "@maId", userId: "@userId" }, AppConst.ResourceMethods.All);
            maFactory.maReviewWithChecklist = $resource(CommonService.buildUrl(AppConst.API_URL.MA.MAReviewWithChecklist), { maId: "@maId", submoduleCode: "@submoduleCode" }, AppConst.ResourceMethods.All);
            maFactory.maCommentTimeline = $resource(CommonService.buildUrl(AppConst.API_URL.MA.MACommentTimeline), { maId: "@maId", statusID: "@statusID" }, AppConst.ResourceMethods.All);
            maFactory.maVariationChange = $resource(CommonService.buildUrl(AppConst.API_URL.MA.MAVariationChange), { maId: "@maId" }, AppConst.ResourceMethods.All);
            maFactory.maReviewPrintChecklist = $resource(CommonService.buildUrl(AppConst.API_URL.MA.MAReviewPrintChecklist), { maId: "@maId", submoduleCode: "@submoduleCode", checklistTypeCode: "@checklistTypeCode" }, AppConst.ResourceMethods.All);
            maFactory.reprintMA = $resource(CommonService.buildUrl(AppConst.API_URL.MA.ReprintMA), { maID: "@maID", userID: "@userID" }, AppConst.ResourceMethods.All);

            // ---------------- Product Composition Helpers ----------------------------
            maFactory.addFoodComposition = function(vm, composition_type) {
                $uibModal.open({
                    backdrop: 'static',
                    templateUrl: 'app/registration/templates/modals/foodComposition.modal.template.html',
                    size: 'md',
                    controller: 'FoodCompositionModalController',
                    controllerAs: 'vm',
                    resolve: {
                        food_composition: null,
                        composition_type: function() { return composition_type.CODE; }
                    }
                }).result.then(function(received) {
                    vm.foodCompositions.push(received);
                }, function() {});
            };
            maFactory.editFoodComposition = function(vm, data) {
                var index = vm.foodCompositions.indexOf(data);
                $uibModal.open({
                    backdrop: 'static',
                    templateUrl: 'app/registration/templates/modals/foodComposition.modal.template.html',
                    size: 'md',
                    controller: 'FoodCompositionModalController',
                    controllerAs: 'vm',
                    resolve: {
                        food_composition: data,
                        composition_type: function() { return data.compositionType; }
                    }
                }).result.then(function(modal_response) {
                    vm.foodCompositions[index] = modal_response;
                }, function() {});
            };
            maFactory.removeFoodComposition = function(vm, data) {
                var index = vm.foodCompositions.indexOf(data);
                if (index >= 0) {
                    vm.foodCompositions.splice(index, 1);
                }
            };

            // --------------------------------Device Model Size-------------------------------------
            maFactory.addDeviceModelSize = function(vm) {
                $uibModal.open({
                    backdrop: 'static',
                    templateUrl: 'app/registration/templates/modals/deviceModelSize.modal.template.html',
                    size: 'md',
                    controller: 'DeviceModelSizeModalController',
                    controllerAs: 'vm',
                    resolve: {
                        deviceModelSize: null
                    }
                }).result.then(function(received) {
                    vm.deviceModelSizes.push(received);
                }, function() {});
            };

            maFactory.editDeviceModelSize = function(vm, data) {
                var index = vm.deviceModelSizes.indexOf(data);
                $uibModal.open({
                    backdrop: 'static',
                    templateUrl: 'app/registration/templates/modals/deviceModelSize.modal.template.html',
                    size: 'md',
                    controller: 'DeviceModelSizeModalController',
                    controllerAs: 'vm',
                    resolve: {
                        deviceModelSize: data
                    }
                }).result.then(function(modal_response) {
                    vm.deviceModelSizes[index] = modal_response;
                }, function() {});
            };

            maFactory.removeDeviceModelSize = function(vm, data) {
                $ngConfirm({
                    title: "Remove Model/Size",
                    content: "Are you sure you want to delete this model/size?",
                    type: 'red',
                    typeAnimated: true,
                    buttons: {
                        confirm: {
                            text: "Confirm",
                            btnClass: 'btn-warning',
                            action: function() {
                                var index = vm.deviceModelSizes.indexOf(data);
                                if (index >= 0) {
                                    vm.deviceModelSizes.splice(index, 1);
                                }
                            }
                        },
                        cancel: {
                            back: "Cancel"
                        }
                    }
                });
            };

            // ----------------------------DEVICE ACCESSORY-------------------------------
            maFactory.addDeviceAccessory = function(vm, accessory_type_code) {
                $uibModal.open({
                    backdrop: 'static',
                    templateUrl: 'app/registration/templates/modals/deviceAccessory.modal.template.html',
                    size: 'md',
                    controller: 'DeviceAccessoryModalController',
                    controllerAs: 'vm',
                    resolve: {
                        device_accessory: function() { return null; },
                        accessory_type_code: function() { return accessory_type_code; },
                        accessoryTypeList: function() { return vm.accessoryTypes; }
                    }
                }).result.then(function(received) {
                    vm.deviceAccessories.push(received);
                }, function() {});
            };

            maFactory.editDeviceAccessory = function(vm, data) {
                var index = vm.deviceAccessories.indexOf(data);
                $uibModal.open({
                    backdrop: 'static',
                    templateUrl: 'app/registration/templates/modals/deviceAccessory.modal.template.html',
                    size: 'md',
                    controller: 'DeviceAccessoryModalController',
                    controllerAs: 'vm',
                    resolve: {
                        device_accessory: function() { return data; },
                        accessory_type_code: function() { return null; },
                        accessoryTypeList: function() { return null; }
                    }
                }).result.then(function(modal_response) {
                    vm.deviceAccessories[index] = modal_response;
                }, function() {});
            };

            maFactory.removeDeviceAccessory = function(vm, data) {
                $ngConfirm({
                    title: "Remove " + data.accessoryType.name,
                    content: "Are you sure you want to delete this " + data.accessoryType.name + "?",
                    type: 'red',
                    typeAnimated: true,
                    buttons: {
                        confirm: {
                            text: "Confirm",
                            btnClass: 'btn-warning',
                            action: function() {
                                var index = vm.deviceAccessories.indexOf(data);
                                if (index >= 0) {
                                    vm.deviceAccessories.splice(index, 1);
                                }
                            }
                        },
                        cancel: {
                            back: "Cancel"
                        }
                    }
                });
            };
            return maFactory;
        });

})();