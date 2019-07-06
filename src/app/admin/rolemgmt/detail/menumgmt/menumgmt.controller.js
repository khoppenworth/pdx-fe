/**
 * Created by abenitrust on 4/6/17.
 */
'use strict';

angular.module('pdx.controllers')
    .controller('MenuMgmtController', function($rootScope, AdminRoleMgmtFactory, $q, $filter) {
        var vm = this;

        vm.descriptionText = 'admin role managment page';
        var currentRoleID;

        function loadData(roleID) {
            vm.roleID = angular.isDefined(roleID) ? roleID : 1; //If role id is not defined ... by default use 1.
            vm.rowExpanded = true;
            vm.showButtons = false; //flag to show/hide action buttons ... activated when there is atleast one change on permission status
            vm.changedMenus = []; //Holds those menus whose permission for the user has changed!
            var roleMenu = AdminRoleMgmtFactory.roles.get({ id: vm.roleID }).$promise;
            var allMenu = AdminRoleMgmtFactory.menus.query().$promise;

            $q.all([roleMenu, allMenu]).then(function(results) {
                vm.menusForThisRole = results[0].menuRoles;
                vm.allMenusRaw = results[1];
                prepareMenu();
            });
        }

        //Listen to role changes (through id) and reload Data
        //This event is fired from the RoleList Controller through $rootScope.$emit
        $rootScope.$on('AdminRoleMgmtroleID', function(event, roleID) {
            currentRoleID = roleID;
            loadData(currentRoleID);
        })

        loadData();




        vm.notify = function(changedMenu) {
            if (!vm.showButtons) {
                //If button is not already shown .... show it.
                vm.showButtons = true;
            }
            if (vm.changedMenus.indexOf(changedMenu) === -1) {
                //the menu is not in changed list .. so add it.
                vm.changedMenus.push(changedMenu);
            }
        }

        //1. Addes another property ... "isActiveToRole" which indicates if the menu is active for the role or not.
        //2 Builds  parent child hierarchy
        //
        function prepareMenu() {

            _.each(vm.allMenusRaw, function(allMenu) {
                var roleMenu = _.find(vm.menusForThisRole, function(m) {
                    return allMenu.id === m.menuID;
                })
                if (angular.isDefined(roleMenu)) {
                    //Role permission already exists... find its relationShip id, and its status
                    allMenu.isActiveToRole = roleMenu.isActive; //rolePermission  status
                    allMenu.roleMenuID = roleMenu.id; //role and permission r/n ship id.
                } else {
                    //This permission is new to the role.
                    allMenu.isActiveToRole = false;
                }

            });


            var hierarchicalMenu = unflatten(vm.allMenusRaw);
            vm.allMenuList = $filter('orderBy')(hierarchicalMenu, 'id');

        }

        function unflatten(array, parent, tree) {

            tree = typeof tree !== 'undefined' ? tree : [];
            parent = typeof parent !== 'undefined' ? parent : { id: null };

            var children = _.filter(array, function(child) { return child.parentMenuID == parent.id; });

            if (!_.isEmpty(children)) {
                if (_.isNull(parent.id)) {
                    tree = children;
                } else {
                    parent['Children'] = children;
                }
                _.each(children, function(child) { unflatten(array, child); });
            }

            return tree;
        }

        vm.updateMenuRole = function() {
            var menuRoles = []

            var updatedIds = [];

            //loop through all changed menus to construct the update model;
            _.each(vm.changedMenus, function(changedM) {
                var menus = {
                    "menuID": changedM.id,
                    "roleID": vm.roleID,
                    "isActive": changedM.isActiveToRole,
                    "id": changedM.roleMenuID
                };
                menuRoles.push(menus);
                updatedIds.push(changedM.id);
            });

            //Find those menus that are not changed and include them.
            _.each(vm.menusForThisRole, function(ExsitingMenu) {
                if (updatedIds.indexOf(ExsitingMenu.menuID) === -1) {
                    //this menu is not found in the updated list ... so include it.
                    var menus = {
                        "menuID": ExsitingMenu.menuID,
                        "roleID": ExsitingMenu.roleID,
                        "isActive": ExsitingMenu.isActive,
                        "id": ExsitingMenu.id
                    };
                    menuRoles.push(menus);
                }

            })


            AdminRoleMgmtFactory.createRoleMenu.save(menuRoles, function() {
                vm.showButtons = false;
                loadData(currentRoleID);
            });

        };

    });