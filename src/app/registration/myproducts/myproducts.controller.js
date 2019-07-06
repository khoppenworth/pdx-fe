'use strict';

angular.module('pdx.controllers')
    .controller('MyProductListController', function(AppConst, CommonService, DTOptionsBuilder, DTColumnBuilder,
        $compile, $scope, $state, $filter, AccountService, RegistrationFactory, StorageService, RegistrationConst) {
        var vm = this;

        vm.userInfo = AccountService.userInfo();

        vm.dtInstance = {};
        vm.dtOptions = DTOptionsBuilder.newOptions()
            .withOption('ajax', {
                // Either you specify the AjaxDataProp here
                // dataSrc: 'data',
                url: CommonService.buildUrl(AppConst.API_URL.Commodity.AgentProductList),
                type: 'POST',
                headers: {
                    Authorization: AccountService.token()
                },
                data: {
                    submoduleTypeCode: RegistrationFactory.getProductListApplicationFilter()
                }
            })
            // or here
            .withOption('createdRow', function(row, data, dataIndex) {
                // Recompiling so we can bind Angular directive to the DT
                $compile(angular.element(row).contents())($scope);


            })
            .withOption('rowCallback', function(row, data, index) {
                var expiryClass = data.isExpired == true ? 'productExpired' : (data.isExpired == false ? 'productNotExpired' : 'productNotApproved');
                row.className = row.className + ' ' + expiryClass;
            })
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
            DTColumnBuilder.newColumn('fullItemName').withTitle('Item')
            .renderWith(function(data, type, full, meta) {
                return '<a title="' + data + '" ui-sref="maregistration.products.detail({id:' + full.productID + '})">' + $filter("limitTo")($filter('filterNull')(data), 13) + '</span>';
            }),
            DTColumnBuilder.newColumn('maNumber').withTitle('MA Number'),
            DTColumnBuilder.newColumn('maStatusDisplayName').withTitle('Status'),
            DTColumnBuilder.newColumn('agentName').withTitle('Applicant')
            .renderWith(function(data, type, full, meta) {
                return '<span  title="' + data + '">' + $filter("limitTo")($filter('filterNull')(data), 13) + '</span>';
            }),
            DTColumnBuilder.newColumn('registrationDate').withTitle('Approval date')
            .renderWith(function(data, type, full) { return $filter('date')(data, 'MMM d, y'); }),
            DTColumnBuilder.newColumn('expiryDate').withTitle('Expiry date')
            .renderWith(function(data) { return $filter('date')(data, 'MMM d, y'); }),
            DTColumnBuilder.newColumn('supplierName').withTitle('License Holder')
            .renderWith(function(data, type, full, meta) {
                return '<span  title="' + data + '">' + $filter("limitTo")($filter('filterNull')(data), 13) + '</span>';
            }),
            DTColumnBuilder.newColumn('manufacturerName').withTitle('Manufacturer')
            .renderWith(function(data, type, full, meta) {
                return '<span  title="' + data + '">' + $filter("limitTo")($filter('filterNull')(data), 13) + '</span>';
            })
        ];

    });
