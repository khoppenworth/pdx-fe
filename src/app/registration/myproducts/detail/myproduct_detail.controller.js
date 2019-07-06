'use strict';

angular.module('pdx.controllers')
    .controller('MyProductDetailController', function(AppConst, CommonService, AccountService, DTOptionsBuilder, DTColumnBuilder, CommodityFactory,
        $compile, $scope, $state, $uibModal, $stateParams, MAFactory, $filter, ModuleSettingsFactory, ImportPermitFactory, $http, $sce,
        RegistrationFactory, NotificationService, $ngConfirm) {
        var vm = this;
        vm.userInfo = AccountService.userInfo();
        vm.productID = $stateParams.id;
        vm.feeDocument = [];

        // ma-registration
        var reloadMA = function() {
            vm.product = CommodityFactory.product.get({ id: vm.productID }, function(data) {
                vm.productExcipeints = $filter("filter")(data.productCompositions, { excipientID: "!!" });
                vm.productInns = $filter("filter")(data.productCompositions, { innid: '!!' });
                vm.product.presentation = "";
                _.each(data.presentations, function(present) {
                    vm.product.presentation = present.packaging;
                    vm.product.presentationP = vm.product.presentation + "," + present.packSize.name
                });
            })
        }
        reloadMA();
        /*
              vm.getStatusColor = function(status) {
                return RegistrationFactory.colorMap[status];
              }*/
    });