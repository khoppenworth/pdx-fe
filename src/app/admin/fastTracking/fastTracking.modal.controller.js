'use strict';

angular.module('pdx.controllers')
    .controller('FastTrackingModalController', function($scope, FastTrackingFactory, $uibModalInstance, FastTracking, NotificationService) {
        var vm = this;
        vm.title = "Fast Tacking Form";
        vm.editMode = false;
        vm.submoduleTypeCode = 'MDCN';

        if (FastTracking != null) {
            vm.editMode = true;
            vm.fastTracking = FastTracking;

        }
        //Get Therapeutic Groups
        vm.therapeuticGroup = FastTrackingFactory.therapeuticGroup.query({}, function(data) {
            return data;
        });

        vm.saveFastTracking = function() {
            vm.FastTrackingValidation.$showError = true;
            if (vm.FastTrackingValidation.$isValid && $scope.createFastTrackingForm.$valid) {

                vm.fastTracking.therapeuticGroupID = vm.fastTracking.therapeuticGroup.id;
                vm.fastTracking.innid = vm.fastTracking.inn.id;
                var model = angular.copy(vm.fastTracking);
                model.therapeuticGroup = null;
                model.inn = null;

                if (vm.editMode) {
                  FastTrackingFactory.fastTracking.update({ id: "" }, model, function(data) {
                        NotificationService.notify("Successfully Edited!", "alert-success");
                        $uibModalInstance.close("success");
                    }, function(error) {
                        NotificationService.notify("Unable to save data. Please try again!", "alert-danger");
                        $uibModalInstance.close("success");
                    });
                } else {
                  FastTrackingFactory.fastTracking.save({ id: "" }, model, function(data) {
                        NotificationService.notify("Successfully Added!", "alert-success");
                        $uibModalInstance.close("success");
                    }, function(error) {
                        NotificationService.notify("Unable to save data. Please try again!", "alert-danger");
                        $uibModalInstance.close("success");
                    });
                }
            }


        };
    });
