'use strict';

angular.module('pdx.controllers')
    .controller('SupplierListController', function(AppConst, CommonService, AccountService, DTOptionsBuilder, DTColumnBuilder,
        $compile, $scope, $state, $uibModal, SupplierFactory,$filter) {
        var vm = this;
        vm.descriptionText = 'supplier manamgement page';
        vm.dtInstance = {};
        vm.dtOptions = DTOptionsBuilder.newOptions()
            .withOption('ajax', {
                // Either you specify the AjaxDataProp here
                // dataSrc: 'data',
                url: CommonService.buildUrl(AppConst.API_URL.Supplier.SupplierList),
                type: 'POST',
                headers: {
                    Authorization: AccountService.token()
                }
            })
            .withOption('createdRow', function(row, data, dataIndex) {
                // Recompiling so we can bind Angular directive to the DT
                $compile(angular.element(row).contents())($scope);
              if (data.isActive == false) {
                $(row).addClass('redClass');
              }
            })
            .withOption("stateSave", true)
            .withOption('stateSaveCallback', CommonService.SaveDataTableStatus)
            .withOption("stateLoadCallback",CommonService.LoadSavedDataTableStatus)
            .withDataProp('data')
            .withOption('processing', true)
            .withOption('serverSide', true)
            .withOption('language', AppConst.UIConfig.DataTable.Language)
            .withPaginationType('full_numbers')
            .withDOM(AppConst.UIConfig.DataTable.DOM.All);


        vm.dtColumns = [
            DTColumnBuilder.newColumn('id').withTitle('').notSortable()
            .renderWith(CommonService.displayRowNumber),
            DTColumnBuilder.newColumn('name').withTitle('Name')
              .renderWith(function(data, type, full, meta) {
                return '<a title="' + data + '" ui-sref="supplier.detail({id:'+full.id+'})">'+$filter("limitTo")(data,13)+'</a>';  //Incase routing is needed
                // return '<span title="' + data + '">'+$filter("limitTo")(data,13)+'</span>';
              }),
            DTColumnBuilder.newColumn('phone').withTitle('Phone')
              .renderWith(CommonService.cleanUpNull),
            DTColumnBuilder.newColumn('email').withTitle('Email')
              .renderWith(CommonService.cleanUpNull),
            DTColumnBuilder.newColumn('countryName').withTitle('Country'),
            DTColumnBuilder.newColumn('agentCount').withTitle('Applicants'),
            DTColumnBuilder.newColumn('productCount').withTitle('Products'),
            DTColumnBuilder.newColumn('isActive').withTitle('Status')
            .renderWith(function(data, type, full, meta) {
                return (data ? "Active" : "Inactive");

            }),
            DTColumnBuilder.newColumn('id').withTitle("").notSortable()
            .renderWith(function(data, type, full, meta) {
                return '<a class="btn btn-primary btn-outline btn-xs"  title="Click to view detail" ng-click="vm.showDetail(' + data + ')"><i class="fa fa-eye"></a>';
            })
        ];

        //Route to supplier detail page
        vm.showDetail = function(supplierID) {
            $state.go('supplier.detail', { id: supplierID });
        };

        vm.createSupplier = function() {
            //Open modal
            $uibModal.open({
                backdrop: "static",
                templateUrl: "app/supplier/template/supplier.modal.template.html",
                size: 'lg',
                windowClass: 'supplierModalClass',
                controller: "SupplierNewController",
                controllerAs: 'vm'
            }).result.then(function(received) {
                //Modal is closed ... reload data
                vm.dtInstance.reloadData(function() { /*reloading Data callback*/ }, true);
            });
        };

    });
