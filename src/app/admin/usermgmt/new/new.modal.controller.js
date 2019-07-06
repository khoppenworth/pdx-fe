'use strict';

angular.module('pdx.controllers')
    .controller('NewUserModalController', function($scope, AdminUserMgmtFactory, $uibModalInstance, NotificationService, LookUpFactory) {
        var vm = this;
        vm.descriptionText = 'New User Modal Controller'

        vm.title = "Create New User";

        vm.selectedRole = {};

        vm.user = new AdminUserMgmtFactory.user();

        vm.roles = AdminUserMgmtFactory.role.query();

        vm.applicationList = LookUpFactory.subModuleType.query();

        vm.userType = AdminUserMgmtFactory.userTypes.query();

        vm.morePhones = []; //Holds additional phone numbers. (2-extra)

        vm.userValidation = {};

        vm.roleChanged = _roleChanged;
        vm.ontabSelected = _ontabSelected;

        vm.createUser = function() {
            vm.userValidation.$showError = true;
            if (vm.userValidation.$isValid && $scope.createUserForm.$valid) {
                var createModel = {
                    firstName: vm.user.firstName,
                    lastName: vm.user.lastName,
                    username: vm.user.username,
                    email: vm.user.email,
                    id: vm.user.id,
                    userTypeID: vm.user.userType.id,
                    phone: vm.user.phone,
                    userRoles: []
                };
                _.each(vm.user.roles, function(role) {
                    // userSubmoduleTypes
                    var userSubmoduleTypes = [];
                    _.each(role.userSubmoduleTypes, function(subModuleType) {
                        userSubmoduleTypes.push({ submoduleTypeID: subModuleType.id });
                    });
                    createModel.userRoles.push({ roleID: role.id, userSubmoduleTypes: userSubmoduleTypes });
                });

                if (vm.morePhones.length > 0) {
                    createModel.phone2 = vm.morePhones[0].phoneNumber;
                    if (vm.morePhones.length > 1) {
                        createModel.phone3 = vm.morePhones[1].phoneNumber;
                    }
                }
                AdminUserMgmtFactory.user.save({ id: "" }, createModel, function() {
                    //once done, close the modal with success;
                    vm.userValidation.$showError = false;
                    $uibModalInstance.close("success");
                });

            } else {
                return;
            }
        };

        vm.addMorePhone = function() {
            if (vm.morePhones.length >= 2) {
                NotificationService.notify("Cannot have more than 3 phone numbes", "alert-warning");
                return;
            }
            vm.morePhones.push({ phoneNumber: undefined });
        }

        vm.removeAdditionalPhone = function(extraPhone) {
            var index = vm.morePhones.indexOf(extraPhone);
            if (index != undefined && index != null) {
                vm.morePhones.splice(index, 1);
            }
        }

        function _roleChanged(role) {
            vm.selectedRole = role;
        }

        function _ontabSelected(tab) {
            /*
            when we are switching to USER tab, reset the currently selected role on ROLE tab,
            since the user may change list of roles on USER tab
            */
            if (tab == 'USER') {
                vm.selectedRole = {};
            }
        }
    });