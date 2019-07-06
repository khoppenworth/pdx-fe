'use strict';

angular.module('pdx.controllers')
    .controller('ReportDetailController', function(ReportFactory, $stateParams, $ngConfirm, NotificationService, $scope, $state) {
        var vm = this;

        vm.changeOccured = false; //Display action buttons based on this.

        vm.viewMode = 'Edit'; //Control and Manage some View Settings

        vm.reportID = $stateParams.reportID;
        vm.report = ReportFactory.report.get({ reportId: vm.reportID });
        vm.reportTypes = ReportFactory.reportType.query();

        $scope.$watch('vm.report', function(newVal, oldVal) {
            if (newVal && oldVal && newVal.$resolved == true && oldVal.$resolved == true) {
                vm.changeOccured = true;
            }
        }, true);

        vm.viewMode = 'Edit'; //Control and Manage some View Settings
        vm.basicTabViewMode = 'Edit';


        //Add/Edit report Basic Details

        vm.reportModalValidationBasic = {};
        vm.basicDetailModal = function() {
            ReportFactory.basicDetailModal(vm, $scope);
        };

        //Add/Edit Column Definitions
        vm.colDefDataTypes = ReportFactory.getColDataTypes();
        vm.colDefModal = function(colDef) {
            ReportFactory.colDefModal(vm, $scope, colDef);
        };

        ///Delete Column Definition
        vm.deleteColDef = function(colDef) {
            ReportFactory.deleteColDef(vm, colDef);
        };


        //Add/Edit Filter Columns
        vm.colFilterTypes = ReportFactory.getColDataTypes();
        vm.filterColModal = function(filter) {
            ReportFactory.filterColModal(vm, $scope, filter);
        };

        ///Delete Filter Column
        vm.deleteFilterCol = function(filter) {
            ReportFactory.deleteFilterCol(vm, filter);
        };


        vm.updateReport = function() {
            var reportModel = angular.copy(vm.report);
            reportModel.reportTypeID = reportModel.reportType.id;
            if (vm.report.reportType.reportTypeCode !== 'Tabular') {
                reportModel.columnDefinitions = [];
            }
            reportModel.ColumnDefinitionsStr = JSON.stringify(reportModel.columnDefinitions);
            reportModel.FilterColumnsStr = JSON.stringify(reportModel.filterColumns);
            ReportFactory.report.update({ reportId: '' }, reportModel, function(data) {
                // Report successfully Updated.
                vm.report = ReportFactory.report.get({ reportId: vm.reportID }); //Reload Data;
                NotificationService.notify('Successfully Updated', 'alert-success');
                vm.changeOccured = false;

            }, function(err) {
                // Error Updating report. Stay in the same page.
                NotificationService.notify('Error Occurred', 'alert-danger');
            });
        };


        vm.cancel = function() {
            vm.report = ReportFactory.report.get({ reportId: vm.reportID }); //Reload Data;
            vm.changeOccured = false;
        }




    });