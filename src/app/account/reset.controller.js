'use strict';

angular.module('pdx.controllers')
    .controller('ResetController', function(AccountService, CommonService, $log, $state, validateToken, $scope, $stateParams, AccountFactory, NotificationService) {
        var vm = this;
        vm.year = (new Date()).getFullYear();
        vm.company = "John Snow Inc | AIDSFree Project";

        //build the login Model
        vm.resetModel = {};
        vm.resetValidation = {};
        vm.showInvalidTokenPage = false;
        vm.passwordConfirmed = true;

        if (validateToken.status === 401) {
            vm.showInvalidTokenPage = true;
        } else {
            vm.showInvalidTokenPage = false;
        }

        vm.resetPassword = function() {
            vm.resetValidation.$showError = true;
            if (vm.resetValidation.$isValid && $scope.resetForm.$valid) {
                if (vm.resetModel.newPassword === vm.resetModel.Confirm) {
                    vm.passwordConfirmed = true;
                    var model = {
                        userID: $stateParams.id,
                        newPassword: vm.resetModel.newPassword,
                        hasOldPassword: false
                    };

                    AccountFactory.changePassword.save(model, function(result) {
                        if (result.success) {
                            NotificationService.notify('Password changed successfully!', 'alert-success');
                            $state.go('login');
                        } else {
                            NotificationService.notify('Password change is not successful!', 'alert-danger');
                        }

                    }, function(error) {})
                } else {
                    vm.passwordConfirmed = false;
                }

            }
        }

    });