'use strict';

angular.module('pdx.controllers')
    .controller('SRAModalController', function($scope, SRAFactory, $uibModalInstance, SRA, NotificationService) {
        var vm = this;
        vm.title = "SRA Form";
        vm.editMode = false;

        if (SRA != null) {
            vm.editMode = true;
            vm.sra = SRA;

        }
        //Get SRA Types
        vm.sraTypes = SRAFactory.sraTypes.query({}, function(data) {
            return data;
        });

        vm.saveSRA = function() {
            vm.SRAValidation.$showError = true;
            if (vm.SRAValidation.$isValid && $scope.createSRAForm.$valid) {

                vm.sra.sraTypeID = vm.sra.sraType.id;
                var model = angular.copy(vm.sra);
                model.sraType = null;

                if (vm.editMode) {
                    SRAFactory.sras.update({ id: "" }, model, function(data) {
                        NotificationService.notify("Successfully Edited!", "alert-success");
                        $uibModalInstance.close("success");
                    }, function(error) {
                        NotificationService.notify("Unable to save data. Please try again!", "alert-danger");
                        $uibModalInstance.close("success");
                    });
                } else {
                    SRAFactory.sras.save({ id: "" }, model, function(data) {
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
