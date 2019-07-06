'use strict';

angular.module('pdx.controllers')
    .controller('ShipmentDetailController', function(AppConst, CommonService, AccountService, DTOptionsBuilder, DTColumnBuilder, $q,
        $compile, $scope, $state, $rootScope, $ngConfirm, NotificationService, $filter, ShipmentFactory, $stateParams) {

        var vm = this;
        vm.shipmentId = $stateParams.shipmentId;

        vm.shipment = ShipmentFactory.shipmentSingle.get({ id: vm.shipmentId });


    });