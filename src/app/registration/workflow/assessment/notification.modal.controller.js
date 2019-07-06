'use strict';

angular.module('pdx.controllers')
    .controller('NotificationModalController', function($scope, ma, $uibModalInstance, $q, NotificationService, AccountService, MAFactory, RegistrationFactory) {
        var vm = this;

        vm.ma = ma;
        vm.today = new Date();
        vm.userInfo = AccountService.userInfo();
        vm.maStatusModel = { ma: vm.ma.ma };
        vm.approveValidation = {};

        vm.approve = function() {
            vm.approveValidation.$showError = true;
            if (vm.approveValidation.$isValid) {
                vm.maStatusModel.toStatusCode = "APR";
                vm.maStatusModel.ma.modifiedByUserID = vm.userInfo.id;
                MAFactory.approve.save({ isNotificationType: true }, vm.maStatusModel, function(response) {
                    RegistrationFactory.submitMAResponse(response, {
                        stateName: 'maregistration.list.info',
                        params: { maId: vm.ma.ma.id }
                    });
                    $uibModalInstance.close("success");
                }, function() {
                    NotificationService.notify('Unable to approve. Please try again!', 'alert-danger');
                    $uibModalInstance.close("error");
                });
            } else return false;
        }
    });