'use strict';

angular.module('pdx.controllers')
    .controller('ProductListController', function(AppConst, CommonService, DTOptionsBuilder, DTColumnBuilder,
        $compile, $scope, $state, $filter, LookUpFactory, PublicConst, StorageService, PublicFactory) {
        var vm = this;

        vm.dtInstance = {};
        vm.dtOptions = DTOptionsBuilder.newOptions()
            .withOption('ajax', {
                // Either you specify the AjaxDataProp here
                // dataSrc: 'data',
                url: CommonService.buildUrl(AppConst.API_URL.Public.ProductList),
                type: 'POST',
                data: {
                    submoduleTypeCode: PublicFactory.getProductListApplicationFilter()
                }
            })
            // or here
            .withOption('createdRow', function(row, data, dataIndex) {
                // Recompiling so we can bind Angular directive to the DT
                $compile(angular.element(row).contents())($scope);
            })
            .withDisplayLength(25)
            .withOption("stateSave", true)
            .withOption('stateSaveCallback', CommonService.SaveDataTableStatus)
            .withOption("stateLoadCallback", CommonService.LoadSavedDataTableStatus)
            .withDataProp('data')
            .withOption('processing', true)
            .withOption('responsive', true)
            .withOption('serverSide', true)
            .withOption('language', AppConst.UIConfig.DataTable.Language)
            .withPaginationType('full_numbers')
            .withDOM(AppConst.UIConfig.DataTable.DOM.All);


        vm.dtColumns = [
            DTColumnBuilder.newColumn('id').withTitle('').notSortable()
            .renderWith(CommonService.displayRowNumber),
            DTColumnBuilder.newColumn('fullItemName').withTitle('Medicine')
            .renderWith(function(data, type, full, meta) {
                return '<a title="' + data + '" ui-sref="product_detail({id:' + full.productID + '})">' + $filter("limitTo")(data, 13) + '</span>';
            }),
            DTColumnBuilder.newColumn('agentName').withTitle('Applicant')
            .renderWith(function(data, type, full, meta) {
                return '<span  title="' + data + '">' + $filter("limitTo")(data, 13) + '</span>';
            }),
            DTColumnBuilder.newColumn('registrationDate').withTitle('Approval date')
            .renderWith(function(data, type, full) { return $filter('date')(data, 'MMM d, y'); }),
            DTColumnBuilder.newColumn('expiryDate').withTitle('Expiry date')
            .renderWith(function(data) { return $filter('date')(data, 'MMM d, y'); }),
            DTColumnBuilder.newColumn('supplierName').withTitle('License Holder')
            .renderWith(function(data, type, full, meta) {
                return '<span  title="' + data + '">' + $filter("limitTo")(data, 13) + '</span>';
            }),
            DTColumnBuilder.newColumn('manufacturerName').withTitle('Manufacturer')
            .renderWith(function(data, type, full, meta) {
                return '<span  title="' + data + '">' + $filter("limitTo")(data, 13) + '</span>';
            })
        ];

        LookUpFactory.subModuleType.query().$promise.then(function(data) {
            vm.applicationList = data;
            vm.applicationList.push({ name: 'All', submoduleTypeCode: null }); // used to bring all data without filter

            var currentSubmoduleType = StorageService.get(PublicConst.StorageKeys.SubmoduleType); //get currently selected type
            vm.selectedSubmoduleType = currentSubmoduleType ? currentSubmoduleType : null;
        });

        vm.onSubmoduleTypeSelected = function() {
            vm.dtOptions.ajax.data.submoduleTypeCode = vm.selectedSubmoduleType.submoduleTypeCode; //Setting this will make api call (ajax, datatable)
            StorageService.set(PublicConst.StorageKeys.SubmoduleType, vm.selectedSubmoduleType);
        };

    });
