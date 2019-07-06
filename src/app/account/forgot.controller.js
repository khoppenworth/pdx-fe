'use strict';

angular.module('pdx.controllers')
    .controller('ForgotController', function(AccountService, CommonService, $log, $state, AccountFactory,NotificationService) {
        var vm = this;
        vm.year = (new Date()).getFullYear();
        vm.company = "John Snow Inc | AIDSFree Project";

        //build the login Model
        vm.forgotModel = {};
        vm.forgotValidation = {};

        vm.submitEmail = function() {
            vm.forgotValidation.$showError = true;
            if (vm.forgotValidation.$isValid) {
                var model = { username: vm.forgotModel.username };
                AccountFactory.resetPassword.save(model, function(result) {
                    $state.go('login');
                    NotificationService.notify('An instruction is sent to your email to reset your password. Please follow the link to proceed.','alert-success',1000*60*60);
                }, function(error) {})
            }
        }

    });
