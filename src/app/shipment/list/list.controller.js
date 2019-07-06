'use strict';

angular.module('pdx.controllers')
    .controller('ShipmentListController', function(AppConst, CommonService, AccountService, DTOptionsBuilder, DTColumnBuilder,
        $compile, $scope, $state, $filter, ShipmentFactory) {

        var vm = this;
        vm.userInfo = AccountService.userInfo();
        vm.dtOptions = DTOptionsBuilder.newOptions()
            .withOption('ajax', {
                url: CommonService.buildUrl(AppConst.API_URL.Shipment.ShipmentList),
                type: 'POST',
                headers: {
                    Authorization: AccountService.token()
                },
                data: {
                    userID: vm.userInfo.id
                }
            })
            // or here
            .withOption('createdRow', function(row, data, dataIndex) {
                // Recompiling so we can bind Angular directive to the DT
                $compile(angular.element(row).contents())($scope);

            })
            .withOption("stateSave", true)
            .withOption('stateSaveCallback', CommonService.SaveDataTableStatus)
            .withOption("stateLoadCallback", CommonService.LoadSavedDataTableStatus)
            .withDataProp('data')
            .withOption('processing', true)
            .withOption('serverSide', true)
            .withOption('language', AppConst.UIConfig.DataTable.Language)
            .withPaginationType('full_numbers')
            .withDOM(AppConst.UIConfig.DataTable.DOM.All);

        vm.dtColumns = [
            /* 0*/
            DTColumnBuilder.newColumn('id').withTitle('').notSortable()
            .renderWith(CommonService.displayRowNumber),
            /* 1*/
            DTColumnBuilder.newColumn('releaseNumber').withTitle('Release Number')
            .renderWith(function(data, type, full) {
                return '<a class=""  title="Click to view more" ng-click="vm.shipmentDetail(' + full.id + ', $event)">' + data + '</a>';
            }),
            /* 2*/
            DTColumnBuilder.newColumn('importPermitNumber').withTitle('Application Nunmber'),
            /* 3*/
            DTColumnBuilder.newColumn('shipmentStatusCode').withTitle('Status')
            .renderWith(function(data, type, full) {
                return '<span  data-ng-class="vm.getStatusColor(&#39;' + data + '&#39;)" title="' + full.maStatus + '">' + data + '</span>';
            }),
            /* 5*/
            DTColumnBuilder.newColumn('performaInvoiceNumber').withTitle('Invoice Number')
            .renderWith(function(data, type, full) {
                return '<span  title="' + data + '" ng-bind="&#39;' + data + '&#39;| filterNull">' + '</span>';
            }),
            /*6*/
            DTColumnBuilder.newColumn('applicationDate').withTitle('Application Date').renderWith(function(data) {
                return $filter('date')(data, 'MMM d, y');
            }),
            /*7*/
            DTColumnBuilder.newColumn('inspectedStartDate').withTitle('Inspection S.Date').renderWith(function(data) {
                return $filter('date')(data, 'MMM d, y, h:mm:ss a');
            }),
            /*8*/
            DTColumnBuilder.newColumn('inspectedEndDate').withTitle('Inspection E.Date').renderWith(function(data) {
                return $filter('date')(data, 'MMM d, y, h:mm:ss a');
            }),
            /*9*/
            DTColumnBuilder.newColumn('releasedDate').withTitle('Released Date').renderWith(function(data) {
                return $filter('date')(data, 'MMM d, y, h:mm:ss a');
            }),
            /*10*/
            DTColumnBuilder.newColumn('createdDate').withTitle('Transaction Date').renderWith(function(data) {
                return $filter('date')(data, 'MMM d, y');
            }),
        ];

        vm.shipmentDetail = function(shipmentId, event) {
            $state.go('shipment.list.info', { shipmentId: shipmentId });
        };

        vm.getStatusColor = function(status) {
            return ShipmentFactory.colorMap[status];
        }
    });