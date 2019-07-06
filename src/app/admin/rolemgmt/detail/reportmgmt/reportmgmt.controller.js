/**
 * Created by abenitrust on 4/6/17.
 */
'use strict';

angular.module('pdx.controllers')
    .controller('ReportMgmtController', function($rootScope, AdminRoleMgmtFactory, $q) {
        var vm = this;

        vm.descriptionText = 'admin role managment page';
        var currentRoleID;

        function loadData(roleID) {
            vm.roleID = angular.isDefined(roleID) ? roleID : 1; //If role id is not defined ... by default use 1.
            vm.showButtons = false; //flag to show/hide action buttons ... activated when there is atleast one change on permission status
            vm.changedReports = []; //Holds those reports whose permission for the user has changed!
            var roleReports = AdminRoleMgmtFactory.roles.get({ id: vm.roleID }).$promise;
            var allReports = AdminRoleMgmtFactory.reports.query().$promise;

            $q.all([roleReports, allReports]).then(function(results) {
                vm.reportsForThisRole = results[0].reportRoles;
                vm.allReports = results[1];
                prepareReports();
            });
        }

        //Listen to role changes (through id) and reload Data
        //This event is fired from the RoleList Controller through $rootScope.$emit
        $rootScope.$on('AdminRoleMgmtroleID', function(event, roleID) {
            currentRoleID = roleID;
            loadData(currentRoleID);
        })

        loadData();



        vm.notify = function(changedReport) {
            if (!vm.showButtons) {
                //If button is not already shown .... show it.
                vm.showButtons = true;
            }
            if (vm.changedReports.indexOf(changedReport) === -1) {
                //the permission is not in changed list .. so add it.
                vm.changedReports.push(changedReport);
            }
        }

        //1. Adds another property ... "isActiveToRole" which indicates if the report is active for the role or not.
        function prepareReports() {




            _.each(vm.allReports, function(allReport) {
                var roleReport = _.find(vm.reportsForThisRole, function(rep) {
                    return allReport.id === rep.reportID;
                })

                if (angular.isDefined(roleReport)) {
                    //Role report already exists... find its relationShip id, and its status
                    allReport.isActiveToRole = roleReport.isActive; //rolePermission  status
                    allReport.roleReportID = roleReport.id; //role and permission r/n ship id.
                } else {
                    //This report is new to the role.
                    allReport.isActiveToRole = false;
                }
            });

            /*vm.allReports=$filter('orderBy')(vm.allReports,'id');*/
            //Group reports by type ->  this will generate an object
            var groupedReports = _.groupBy(vm.allReports, function(d) { return d.reportType.name });

            /*
             * Process the grouped object and create an array!
             * */
            vm.allReportsGrouped = [];
            angular.forEach(groupedReports, function(value, key) {
                vm.allReportsGrouped.push({ groupName: key, reports: value });
            })

        }

        vm.updateRoleReport = function() {
            var updateModel = [];
            var updatedIds = [];
            //loop through all changed menus to construct the update model;
            _.each(vm.changedReports, function(changedReport) {
                var model = {
                    "reportID": changedReport.id,
                    "roleID": vm.roleID,
                    "isActive": changedReport.isActiveToRole,
                    "id": changedReport.roleReportID
                };
                updateModel.push(model);
                updatedIds.push(changedReport.id);

            });

            //Find those reports that are not changed and include them.
            _.each(vm.reportsForThisRole, function(ExistingReport) {
                if (updatedIds.indexOf(ExistingReport.reportID) === -1) {
                    //this report is not found in the updated list ... so include it.
                    var report = {
                        "reportID": ExistingReport.reportID,
                        "roleID": ExistingReport.roleID,
                        "isActive": ExistingReport.isActive,
                        "id": ExistingReport.id
                    };
                    updateModel.push(report);
                }

            })


            AdminRoleMgmtFactory.createRoleReport.save(updateModel, function() {
                vm.showButtons = false;
                loadData(currentRoleID); //reload data
            });

        };

    });