/**
 * Created by abenitrust on 4/5/17.
 */
'use strict';

angular.module('pdx.controllers')
    .controller('RoleListController', function($rootScope, AdminRoleMgmtFactory, $filter) {
        var vm = this;
        vm.descriptionText = 'admin role managment page'
        vm.title = "Manage role menus";

        AdminRoleMgmtFactory.roles.query(function(role) {
            vm.roleList = $filter('orderBy')(role, 'id');
        });

        vm.selectedID = 1; //By default the selected roleID wil be 1.

        vm.roleChanged = function(roleID) {
            vm.selectedID = roleID;
            $rootScope.$emit('AdminRoleMgmtroleID', roleID);
        };

    });