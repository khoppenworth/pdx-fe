'use strict';

angular.module('pdx.factories')
    .factory('ReportFactory', function($resource, AppConst, CommonService, $ngConfirm) {
        var reportFactory = {};
        reportFactory.tabularReports = $resource(CommonService.buildUrl(AppConst.API_URL.Report.TabularReports), { roleid: "@roleid" }, AppConst.ResourceMethods.Readonly);
        reportFactory.tabularReport = $resource(CommonService.buildUrl(AppConst.API_URL.Report.TabularReport), { id: "@id" }, AppConst.ResourceMethods.All);
        reportFactory.chartReports = $resource(CommonService.buildUrl(AppConst.API_URL.Report.ChartReports), { userId: "@userId" }, AppConst.ResourceMethods.Readonly);
        reportFactory.chartReport = $resource(CommonService.buildUrl(AppConst.API_URL.Report.ChartReport), { reportId: "@reportId" }, AppConst.ResourceMethods.Readonly);
        reportFactory.report = $resource(CommonService.buildUrl(AppConst.API_URL.Report.Report), { reportId: "@reportId" }, AppConst.ResourceMethods.All);
        reportFactory.reportType = $resource(CommonService.buildUrl(AppConst.API_URL.Report.ReportType), { id: "@id" }, AppConst.ResourceMethods.Readonly);

        reportFactory.columnClass = {
            Integer: 'column-right-align',
            Decimal: 'column-right-align',
            Numeric: 'column-right-align',
            String: ''
        };

        reportFactory.getColDataTypes = function() {
            return [{
                    id: '1',
                    name: 'Numeric'
                }, {
                    id: '2',
                    name: 'Integer'
                }, {
                    id: '3',
                    name: 'Decimal'
                }, {
                    id: '4',
                    name: 'String'
                }, {
                    id: '5',
                    name: 'Date'
                },
                {
                    id: '6',
                    name: 'DateRange'
                }
            ];
        };



        //Helper Methods for Add/Edit/Delete  Report Management Page
        reportFactory.basicDetailModal = function(vm, $scope) {
            vm.reportModelBasic = {
                isActive: true
            };
            if (vm.basicTabViewMode == 'Edit') {
                vm.reportModelBasic = angular.copy(vm.report);
            }
            $ngConfirm({
                title: 'Basic Info',
                contentUrl: 'app/report/templates/report.basic.details.html',
                typeAnimated: true,
                columnClass: 'col-xs-12 col-md-8 col-md-offset-2',
                scope: $scope,
                buttons: {
                    add: {
                        text: vm.basicTabViewMode == 'Edit' ? "Update" : "Add",
                        btnClass: vm.basicTabViewMode == 'Edit' ? 'btn-warning' : 'btn-primary',
                        action: function() {
                            vm.reportModalValidationBasic.$showError = true;
                            if (!vm.reportModalValidationBasic.$isValid) {
                                return false;
                            } else {
                                vm.report = angular.copy(vm.reportModelBasic);
                                vm.basicTabViewMode = (vm.report.name || vm.report.query) ? 'Edit' : 'Create';
                                $scope.$apply();
                                return true;
                            }
                        }
                    },
                    close: function() {}
                }
            });
        };

        //Add/Edit Column Definitions
        reportFactory.colDefModal = function(vm, $scope, colDef) {
            vm.reportModelColDef = {
                IsVisible: true
            };
            vm.reportModalValidationColDef = {};
            if (colDef) {
                //If in edit mode (meaning filter is passed, populate data to edit);
                vm.reportModelColDef = angular.copy(colDef);
                vm.reportModelColDef.DDataType = _.find(vm.colDefDataTypes, function(t) {
                    return t.name == vm.reportModelColDef.DataType;
                });
            }

            $ngConfirm({
                title: 'Column Definition',
                contentUrl: 'app/report/templates/report.columnDefinition.details.html',
                typeAnimated: true,
                columnClass: 'col-xs-12 col-md-8 col-md-offset-2',
                scope: $scope,
                buttons: {
                    add: {
                        text: colDef ? 'Update' : 'Add',
                        btnClass: colDef ? 'btn-warning' : 'btn-primary',
                        action: function() {
                            vm.reportModalValidationColDef.$showError = true;
                            if (!vm.reportModalValidationColDef.$isValid) {
                                return false;
                            } else {
                                vm.reportModelColDef.DataType = vm.reportModelColDef.DDataType.name;
                                if (colDef) {
                                    //meaning was called in edit mode, update existing value;
                                    var index = findArrayIndexByElement(colDef, vm.report.columnDefinitions); //Find the original item
                                    vm.report.columnDefinitions[index] = angular.copy(vm.reportModelColDef); //Update it
                                } else {
                                    //Otherwise it is a new instance so copy it to columnDefinition lists
                                    if (!vm.report.columnDefinitions || vm.report.columnDefinitions.length == 0) {
                                        //initialize new Array;
                                        vm.report.columnDefinitions = [];
                                    }
                                    vm.report.columnDefinitions.push(angular.copy(vm.reportModelColDef));
                                }
                                $scope.$apply();
                                return true;
                            }
                        }
                    },
                    close: function() {}
                }
            });
        };

        ///Delete Column Definition
        reportFactory.deleteColDef = function(vm, colDef) {
            var index = findArrayIndexByElement(colDef, vm.report.columnDefinitions);
            if (index >= 0) {
                //Filter is found, so remove it.
                vm.report.columnDefinitions.splice(index, 1);
            }
        };

        //Add/Edit Filter Columns
        reportFactory.filterColModal = function(vm, $scope, filter) {

            vm.reportModelFilCol = {};
            vm.reportModalValidationFilCol = {};
            if (filter) {
                //If in edit mode (meaning filter is passed, populate data to edit);
                vm.reportModelFilCol = angular.copy(filter);
                vm.reportModelFilCol.DType = _.find(vm.colFilterTypes, function(t) {
                    return t.name == vm.reportModelFilCol.Type;
                });
            }

            $ngConfirm({
                title: 'Filter Column',
                contentUrl: 'app/report/templates/report.filterColumns.details.html',
                typeAnimated: true,
                columnClass: 'col-xs-12 col-md-8 col-md-offset-2',
                scope: $scope,
                buttons: {
                    add: {
                        text: filter ? 'Update' : 'Add',
                        btnClass: filter ? 'btn-warning' : 'btn-primary',
                        action: function() {
                            vm.reportModalValidationFilCol.$showError = true;
                            if (!vm.reportModalValidationFilCol.$isValid) {
                                return false;
                            } else {
                                vm.reportModelFilCol.Type = vm.reportModelFilCol.DType.name;
                                if (filter) {
                                    //meaning was called in edit mode, update existing value;
                                    var index = findArrayIndexByElement(filter, vm.report.filterColumns); //Find the original item
                                    vm.report.filterColumns[index] = angular.copy(vm.reportModelFilCol); //Update it
                                } else {
                                    //Otherwise it is a new instance so copy it to filterColumn lists
                                    if (!vm.report.filterColumns || vm.report.filterColumns.length == 0) {
                                        //initialize new Array;
                                        vm.report.filterColumns = [];
                                    }
                                    vm.report.filterColumns.push(angular.copy(vm.reportModelFilCol));
                                }

                                $scope.$apply();
                                return true;
                            }
                        }
                    },
                    close: function() {}
                }
            });
        };

        ///Delete Filter Column
        reportFactory.deleteFilterCol = function(vm, filter) {
            var index = findArrayIndexByElement(filter, vm.report.filterColumns);
            if (index >= 0) {
                //Filter is found, so remove it.
                vm.report.filterColumns.splice(index, 1);
            }
        };


        function findArrayIndexByElement(obj, arr) {
            var index = arr.indexOf(obj);
            return index;
        }

        return reportFactory;
    });