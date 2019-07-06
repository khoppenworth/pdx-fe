(function() {
    'use strict';

    angular.module('pdx.controllers')
        .controller('ReportController', function(ReportFactory, AppConst, AccountService, CommonService, $rootScope, DTColumnBuilder, $scope, $filter,
            DTOptionsBuilder, DTColumnDefBuilder, $stateParams, $state, $compile, $sce, $http) {
            var vm = this;
            init();
            vm.onReportChanged = _onReportChanged;

            // FILTER
            vm.filterData = _filterData;
            vm.cancelFilter = _cancelFilter;
            vm.reset = _reset;
            // EXPORT
            vm.exportPDF = _exportPDF;
            vm.exportExcel = _exportExcel;

            function init() {
                vm.reportId = $stateParams.reportID;
                $rootScope.rightSidebar = false;
                vm.userInfo = AccountService.userInfo();
                vm.report = {};

                vm.showReport = false;
                vm.showReportFilter = false;
            }

            vm.reportData = ReportFactory.tabularReport.get({ id: vm.reportId }, function(data) {

                vm.dtInstance = {};
                vm.dtOptions = DTOptionsBuilder.newOptions()
                    .withOption('ajax', {
                        // Either you specify the AjaxDataProp here
                        // dataSrc: 'data',
                        url: CommonService.buildUrl(AppConst.API_URL.Report.TabularReport, vm.reportId),
                        type: 'POST',
                        headers: {
                            Authorization: AccountService.token(),
                        },
                        data: {
                            reportId: vm.reportId,
                            filters: angular.copy(data.filters) // Very important that you clone this filters or else whenever this values change, api call to reload data will be made automatically!
                        }
                    })
                    .withOption('createdRow', function(row, data, dataIndex) {
                        // Recompiling so we can bind Angular directive to the DT
                        $compile(angular.element(row).contents())($scope);
                    })
                    .withOption("stateSave", true)
                    .withOption('stateSaveCallback', CommonService.SaveDataTableStatus)
                    .withOption("stateLoadCallback", CommonService.LoadSavedDataTableStatus)
                    .withDataProp('data')
                    .withOption('responsive', true)
                    .withOption('processing', true)
                    .withOption('serverSide', true)
                    .withOption('language', AppConst.UIConfig.DataTable.Language)
                    .withPaginationType('full_numbers')
                    .withDOM(AppConst.UIConfig.DataTable.DOM.NoSearch)
                    .withButtons([{
                            text: 'PDF',
                            key: 'p',
                            action: function(e, dt, node, config) {
                                vm.exportPDF();
                            }
                        },
                        {
                            text: 'Excel',
                            key: 'e',
                            action: function(e, dt, node, config) {
                                vm.exportExcel();
                            }
                        }
                    ]);

                // dtColumns initialized with row Number
                vm.dtColumns = [
                    DTColumnBuilder.newColumn('id').withTitle('').notSortable()
                    .renderWith(CommonService.displayRowNumber)
                ];
                //Order Columns by column Index;
                var orderedColumns = $filter('orderBy')(data.report.columnDefinitions, 'ColumnIndex');
                //Build data table columns
                _.each(orderedColumns, function(column) {
                    if (column.IsVisible) {
                        var col = DTColumnBuilder.newColumn(column.FieldName).withTitle(column.Title)
                            .renderWith(function(data) {
                                return ($filter)('filterNull')(($filter)('typeof')(data));
                            });
                        //Check sorting
                        if (column.IsSortable == false) {
                            col.notSortable();
                        }

                        //Add Class according to datatype;
                        col.withClass(ReportFactory.columnClass[column.DataType]);
                        vm.dtColumns.push(col);
                    }
                });
                vm.showReport = true;
            });

            function _onReportChanged(id) {
                $state.go('reports.reportsDetail', { reportID: vm.report.selected.report.id });
            }

            function _cancelFilter() {
                $rootScope.rightSidebar = false;
            }

            function _reset() {
                resetFilters(vm.reportData.filters);
            }

            function _filterData() {
                prepareFilters(vm.reportData.filters);
                applyDTFilters();
                setReportFilterVisibility();
                $rootScope.rightSidebar = false;
            }

            function setReportFilterVisibility() {
                var count = 0;
                _.each(vm.reportData.filters, function(f) {
                    if (f.value != null) {
                        count++;
                    }
                });
                vm.showReportFilter = count > 0;
            }

            function prepareFilters(filters) {
                _.each(filters, function(filter) {
                    switch (filter.type) {
                        case "DateRange":
                            {
                                filter.value = filter.ObjectValue.startDate != null && filter.ObjectValue.endDate != null ? filter.ObjectValue.startDate.format() + "," + filter.ObjectValue.endDate.format() : null;
                                filter.displayValue = filter.ObjectValue.startDate != null && filter.ObjectValue.endDate != null ? filter.ObjectValue.startDate.format('MMMM Do YYYY') + "," + filter.ObjectValue.endDate.format('MMMM Do YYYY') : null;
                                break;
                            }
                        case "Integer":
                            {
                                filter.value = filter.ObjectValue != null ? filter.ObjectValue.id : null;
                                filter.displayValue = filter.ObjectValue != null ? filter.ObjectValue.name : null;
                                break;
                            }
                        case "String":
                            {
                                filter.value = filter.ObjectValue;
                                filter.displayValue = filter.ObjectValue;
                                break;
                            }
                        case "Date":
                            {
                                filter.value = filter.ObjectValue === undefined || filter.ObjectValue.startDate === null ? null : filter.ObjectValue.format();
                                filter.displayValue = filter.ObjectValue === undefined || filter.ObjectValue.startDate === null ? null : filter.ObjectValue.format('MMMM Do YYYY');
                                break;
                            }
                    }
                })
            }

            function resetFilters(filters) {
                _.each(filters, function(filter) {
                    switch (filter.type) {
                        case 'DateRange':
                            {
                                filter.ObjectValue = { startDate: null, endDate: null };
                                break;
                            }
                        case "Integer":
                            {
                                filter.ObjectValue = { id: null, name: null };
                                break;
                            }
                        case "String":
                            {
                                filter.ObjectValue = null;
                                break;
                            }
                        case "Date":
                            {
                                filter.ObjectValue = { startDate: null, endDate: null };
                                break;
                            }
                    }
                });
            }

            function applyDTFilters() {
                var filters = angular.copy(vm.reportData.filters); // Very important that you clone the filters and not directly copy them
                // If directly copied, whenever vm.reportData.filters changes, an api will be called to update dt table by the dt direct!!!!

                //Some modification, because somehow moment doesn't seem to be supported while sending ajax call;
                _.each(filters, function(f) {
                    f.ObjectValue = null;
                });
                vm.dtOptions.ajax.data.filters = filters; //Setting this will make api call (ajax, datatable)
            }

            function _exportPDF() {
                $http.post(CommonService.buildUrl(AppConst.API_URL.Report.ExportPDF, vm.reportId), vm.reportData.filters, {
                    responseType: 'arraybuffer'
                }).success(function(response, status, headers, config) {
                    var a = document.createElement('a');
                    document.body.appendChild(a);
                    var file = new Blob([response], { type: 'application/pdf' });
                    var fileURL = URL.createObjectURL(file)
                    var fileContent = $sce.trustAsResourceUrl(fileURL)
                    a.href = fileContent;
                    a.download = vm.reportData.report.name;

                    a.click()
                });
            }

            function _exportExcel() {
                $http.post(CommonService.buildUrl(AppConst.API_URL.Report.ExportExcel, vm.reportId), vm.reportData.filters, {
                    responseType: 'arraybuffer'
                }).success(function(response, status, headers, config) {
                    var a = document.createElement('a');
                    document.body.appendChild(a);
                    var file = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64' });
                    var fileURL = URL.createObjectURL(file)
                    var fileContent = $sce.trustAsResourceUrl(fileURL)
                    a.href = fileContent;
                    a.download = vm.reportData.report.name;

                    a.click();
                });
            }

        });
}());