'use strict';

angular.module('pdx.controllers')
    .controller('UpdateUserModalController', function($scope, CommonService, AdminUserMgmtFactory, userID, $uibModalInstance, $q, NotificationService, LookUpFactory) {

        var vm = this;
        vm.descriptionText = 'Update User Modal Controller'

        vm.title = "Update User";

        vm.selectedRole = {};

        var userDetail = AdminUserMgmtFactory.user.get({ id: userID }).$promise;
        var roles = AdminUserMgmtFactory.role.query().$promise;
        vm.applicationList = LookUpFactory.subModuleType.query();

        vm.userType = AdminUserMgmtFactory.userTypes.query();

        vm.userValidation = {};

        vm.roleChanged = _roleChanged;
        vm.ontabSelected = _ontabSelected;

        //Chain the two promises use $q.all ... to process role data
        $q.all([userDetail, roles]).then(function(results) {
            vm.user = results[0];
            vm.roles = results[1];
            //Find those roles that are in the user ...
            var userRolesId = _.pluck(vm.user.roles, "id");
            vm.user.roles = _.filter(vm.roles, function(role) {
                var found = _.find(vm.user.userRoles, function(userRole) {
                    return role.id == userRole.roleID;
                });
                if (found) {
                    found.userSubmoduleTypes = _.map(found.userSubmoduleTypes, function(sm) {
                        sm.submoduleType.userSubmoduleTypeId = sm.id;
                        return sm.submoduleType;
                    });
                    role.userSubmoduleTypes = found.userSubmoduleTypes;
                }
                return userRolesId.indexOf(role.id) !== -1;
            });

            vm.morePhones = []; //Holds additional phone numbers. (2-extra)
            if (CommonService.checkUndefinedOrNull(vm.user.phone2)) {
                vm.morePhones.push({ phoneNumber: vm.user.phone2 })
            }
            if (CommonService.checkUndefinedOrNull(vm.user.phone3)) {
                vm.morePhones.push({ phoneNumber: vm.user.phone3 })
            }


        });

        vm.updateUser = function() {
            vm.userValidation.$showError = true;
            if (vm.userValidation.$isValid && $scope.createUserForm.$valid) {
                //passed id null because otherwise it will pass the vm.user.id to the url.
                var updateModel = {
                    firstName: vm.user.firstName,
                    lastName: vm.user.lastName,
                    username: vm.user.username,
                    email: vm.user.email,
                    id: vm.user.id,
                    userTypeID: vm.user.userType.id,
                    phone: vm.user.phone,
                    userRoles: [],
                    isActive: vm.user.isActive
                };
                // Roles
                _.each(vm.user.roles, function(role) {
                    // get user role id for existing userRoles
                    var userRoleObject = _.find(vm.user.userRoles, function(userRole) {
                        return userRole.roleID == role.id;
                    });
                    var userRoleId = angular.isDefined(userRoleObject) ? userRoleObject.id : 0;

                    // userSubmoduleTypes
                    var userSubmoduleTypes = [];
                    _.each(role.userSubmoduleTypes, function(subModuleType) {
                        // get user_submodule_type id for existing user_submodule_type
                        var userSubmoduleTypeObject = undefined;
                        if (angular.isDefined(userRoleObject)) {
                            userSubmoduleTypeObject = _.find(userRoleObject.userSubmoduleTypes, function(ust) {
                                return ust.submoduleTypeCode == subModuleType.submoduleTypeCode;
                            });
                        }
                        var userSubModuleTypeId = angular.isDefined(userSubmoduleTypeObject) ? userSubmoduleTypeObject.userSubmoduleTypeId : 0;
                        userSubmoduleTypes.push({ id: userSubModuleTypeId, submoduleTypeID: subModuleType.id });
                    });

                    updateModel.userRoles.push({ id: userRoleId, roleID: role.id, userSubmoduleTypes: userSubmoduleTypes });
                });

                if (vm.morePhones.length > 0) {
                    updateModel.phone2 = vm.morePhones[0].phoneNumber;
                    if (vm.morePhones.length > 1) {
                        updateModel.phone3 = vm.morePhones[1].phoneNumber;
                    }
                }
                AdminUserMgmtFactory.user.update({ id: "" }, updateModel, function() {
                    //once done, close the modal with success;
                    vm.userValidation.$showError = false;
                    $uibModalInstance.close("success");
                });

            } else {
                //Invalid input .. .get back to form
                NotificationService.notify("Please check all required fields on both tabs", "alert-warning");
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