'use strict';

angular.module('pdx.controllers')
  .controller('ReportNewController', function (ReportFactory, $ngConfirm, NotificationService, $scope, $state) {
    var vm = this;

    vm.changeOccured = true;

    vm.report = {
      columnDefinitions: [],
      filterColumns: []
    };

    vm.viewMode = 'Create';  //Control and Manage some View Settings
    vm.basicTabViewMode = (vm.report.name || vm.report.query) ? 'Edit' : 'Create';
    //LookUps
    vm.reportTypes = ReportFactory.reportType.query();


    vm.reportModalValidationBasic = {};
    vm.basicDetailModal = function () {
      ReportFactory.basicDetailModal(vm, $scope);
    };

    //Add/Edit Column Definitions
    vm.colDefDataTypes = ReportFactory.getColDataTypes();
    vm.colDefModal = function (colDef) {
      ReportFactory.colDefModal(vm, $scope, colDef);
    };

    ///Delete Column Definition
    vm.deleteColDef = function (colDef) {
      ReportFactory.deleteColDef(vm, colDef);
    };


    //Add/Edit Filter Columns
    vm.colFilterTypes = ReportFactory.getColDataTypes();
    vm.filterColModal = function (filter) {
      ReportFactory.filterColModal(vm, $scope, filter);
    };

    ///Delete Filter Column
    vm.deleteFilterCol = function (filter) {
      ReportFactory.deleteFilterCol(vm, filter);
    };

    vm.createNewReport = function () {
      var reportModel = angular.copy(vm.report);
      reportModel.reportTypeID = reportModel.reportType.id;
      reportModel.reportType = null;
      if (vm.report.reportType.reportTypeCode !== 'Tabular') {
        reportModel.filterColumns = [];
        reportModel.columnDefinitions = [];
      }
      reportModel.ColumnDefinitionsStr = JSON.stringify(reportModel.columnDefinitions);
      reportModel.FilterColumnsStr = JSON.stringify(reportModel.filterColumns);
      ReportFactory.report.save({reportId: ''}, reportModel, function (data) {
        // Report successfully created. Route to report lists
        NotificationService.notify('Successfully Updated', 'alert-success');
        $state.go('report.list');
      }, function (err) {
        // Error creating report. Stay in the same page.
        NotificationService.notify('Error Occurred', 'alert-danger');
      });
    };

    vm.cancel = function () {
      //Reset All Values
      vm.changeOccured = true;

      vm.report = {
        columnDefinitions: [],
        filterColumns: []
      };

      vm.viewMode = 'Create';  //Control and Manage some View Settings
      vm.basicTabViewMode = (vm.report.name || vm.report.query) ? 'Edit' : 'Create';
    }

  });
