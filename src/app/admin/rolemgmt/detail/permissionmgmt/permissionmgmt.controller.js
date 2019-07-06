/**
 * Created by abenitrust on 4/6/17.
 */
'use strict';

angular.module('pdx.controllers')
    .controller('PermissionMgmtController', function($rootScope, AdminRoleMgmtFactory, $q) {
        var vm = this;

        vm.descriptionText = 'admin role managment page';
        var currentRoleID;

        function loadData(roleID) {
            vm.roleID = angular.isDefined(roleID) ? roleID : 1; //If role id is not defined ... by default use 1.
            vm.rowExpanded = true;
            vm.showButtons = false; //flag to show/hide action buttons ... activated when there is atleast one change on permission status
            vm.changedPermissions = []; //Holds those menus whose permission for the user has changed!
            var rolePermissions = AdminRoleMgmtFactory.roles.get({ id: vm.roleID }).$promise;
            var allPermissions = AdminRoleMgmtFactory.permissions.query().$promise;

            $q.all([rolePermissions, allPermissions]).then(function(results) {
                vm.permissionsForThisRole = results[0].permissions;
                vm.allPermissions = results[1];
                preparePermission();
            });
        }

        //Listen to role changes (through id) and reload Data
        //This event is fired from the RoleList Controller through $rootScope.$emit
        $rootScope.$on('AdminRoleMgmtroleID', function(event, roleID) {
            currentRoleID = roleID;
            loadData(currentRoleID);
        })

        loadData();




        vm.notify = function(changedPerm) {
            if (!vm.showButtons) {
                //If button is not already shown .... show it.
                vm.showButtons = true;
            }
            if (vm.changedPermissions.indexOf(changedPerm) === -1) {
                //the permission is not in changed list .. so add it.
                vm.changedPermissions.push(changedPerm);
            }
        }

        //1. Adds another property ... "isActiveToRole" which indicates if the menu is active for the role or not.
        function preparePermission() {
            //get permission IDs in the role

            _.each(vm.allPermissions, function(allPerm) {
                var rolePerm = _.find(vm.permissionsForThisRole, function(p) {
                    return allPerm.id === p.permissionID;
                })
                if (angular.isDefined(rolePerm)) {
                    //Role permission already exists... find its relationShip id, and its status
                    allPerm.isActiveToRole = rolePerm.isActive; //rolePermission  status
                    allPerm.rolePermissionID = rolePerm.id; //role and permission r/n ship id.
                } else {
                    //This permission is new to the role.
                    allPerm.isActiveToRole = false;
                }
            });


            /*vm.allReports=$filter('orderBy')(vm.allReports,'id');*/

            //Group the permissions by type. This will return an object.
            var groupedPermission = _.groupBy(vm.allPermissions, "category");

            /*
             * Process the grouped object and create an array!
             * */
            vm.allPermissionsGrouped = [];
            angular.forEach(groupedPermission, function(value, key) {
                vm.allPermissionsGrouped.push({ groupName: key, permissons: value });
            })
        }



        vm.updateRolePermission = function() {
            var updateModel = [];
            var updatedIds = [];
            //loop through all changed menus to construct the update model;
            _.each(vm.changedPermissions, function(changedPerm) {
                var model = {
                    "permissionID": changedPerm.id,
                    "roleID": vm.roleID,
                    "isActive": changedPerm.isActiveToRole,
                    "id": changedPerm.rolePermissionID
                };
                updateModel.push(model);
                updatedIds.push(changedPerm.id);

            });

            //Find those menus that are not changed and include them.
            _.each(vm.permissionsForThisRole, function(ExistingPerm) {
                if (updatedIds.indexOf(ExistingPerm.permissionID) === -1) {
                    //this permission is not found in the updated list ... so include it.
                    var perm = {
                        "permissionID": ExistingPerm.permissionID,
                        "roleID": ExistingPerm.roleID,
                        "isActive": ExistingPerm.isActive,
                        "id": ExistingPerm.id
                    };
                    updateModel.push(perm);
                }

            })


            AdminRoleMgmtFactory.createRolePermissions.save(updateModel, function() {
                vm.showButtons = false;
                loadData(currentRoleID); //reload data
            });

        };

    });