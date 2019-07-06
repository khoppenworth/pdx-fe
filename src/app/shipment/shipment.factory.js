'use strict'

angular.module('pdx.factories')
    .factory('ShipmentFactory', function($resource, $http, AppConst, CommonService) {
        var shipmentFactory = {};

        shipmentFactory.searchImportPermits = $resource(CommonService.buildUrl(AppConst.API_URL.Shipment.SearchImportPermits), {}, AppConst.ResourceMethods.All);
        shipmentFactory.shipment = $resource(CommonService.buildUrl(AppConst.API_URL.Shipment.Shipment), {}, AppConst.ResourceMethods.All);
        shipmentFactory.shipmentList = $resource(CommonService.buildUrl(AppConst.API_URL.Shipment.ShipmentList), {}, AppConst.ResourceMethods.All);
        shipmentFactory.shipmentSingle = $resource(CommonService.buildUrl(AppConst.API_URL.Shipment.SingleShipment), { id: "@id" }, AppConst.ResourceMethods.All);

        shipmentFactory.colorMap = {
            RQST: 'badge badge-info',
            INSP: 'badge badge-success',
            RLSD: 'badge badge-primary'
        }
        return shipmentFactory;
    });