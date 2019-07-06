'use strict';

angular.module('pdx.factories')
    .factory('LookUpFactory', function($resource, AppConst, CommonService) {
        var lookUpFactory = {};

        lookUpFactory.currency = $resource(CommonService.buildUrl(AppConst.API_URL.LookUp.Currency), { id: "@id" }, AppConst.ResourceMethods.Readonly);
        lookUpFactory.paymentmode = $resource(CommonService.buildUrl(AppConst.API_URL.LookUp.PaymentMode), { id: "@id" }, AppConst.ResourceMethods.Readonly);
        lookUpFactory.portofentry = $resource(CommonService.buildUrl(AppConst.API_URL.LookUp.PortOfEntry), { id: "@id" }, AppConst.ResourceMethods.Readonly);
        lookUpFactory.shipingPortofentry = $resource(CommonService.buildUrl(AppConst.API_URL.LookUp.ShippingPortOfEntry), { id: "@shippingID" }, AppConst.ResourceMethods.Readonly);

        lookUpFactory.shippingmethod = $resource(CommonService.buildUrl(AppConst.API_URL.LookUp.ShippingMethod), { id: "@id" }, AppConst.ResourceMethods.Readonly);
        lookUpFactory.importPermitDelivery = $resource(CommonService.buildUrl(AppConst.API_URL.LookUp.ImportPermitDelivery), { id: "@id" }, AppConst.ResourceMethods.Readonly);
        lookUpFactory.paymentterm = $resource(CommonService.buildUrl(AppConst.API_URL.LookUp.PaymentTerm), { id: "@id" }, AppConst.ResourceMethods.Readonly);
        lookUpFactory.feeType = $resource(CommonService.buildUrl(AppConst.API_URL.LookUp.FeeType), { id: "@id" }, AppConst.ResourceMethods.All);
        lookUpFactory.country = $resource(CommonService.buildUrl(AppConst.API_URL.LookUp.Country), { id: "@id" }, AppConst.ResourceMethods.Readonly);
        lookUpFactory.manufacturer = $resource(CommonService.buildUrl(AppConst.API_URL.LookUp.Manufacturer), { id: "@id" }, AppConst.ResourceMethods.Readonly);
        lookUpFactory.manufacturerSearch = $resource(CommonService.buildUrl(AppConst.API_URL.LookUp.ManufacturerSearch), { query: "@query", pageNo: "@pageNo", pageSize: "@pageSize" }, AppConst.ResourceMethods.Search);
        lookUpFactory.manufacturerAddressSearch = $resource(CommonService.buildUrl(AppConst.API_URL.LookUp.ManufacturerAddressSearch), { query: "@query", pageNo: "@pageNo", pageSize: "@pageSize" }, AppConst.ResourceMethods.Search);
        lookUpFactory.manufacturerType = $resource(CommonService.buildUrl(AppConst.API_URL.LookUp.ManufacturerType), { id: "@id" }, AppConst.ResourceMethods.Readonly);
        lookUpFactory.maType = $resource(CommonService.buildUrl(AppConst.API_URL.LookUp.MaType), { id: "@id" }, AppConst.ResourceMethods.Readonly);
        lookUpFactory.moduleMaType = $resource(CommonService.buildUrl(AppConst.API_URL.LookUp.ModuleMaType), { moduleCode: "@moduleCode" }, AppConst.ResourceMethods.Readonly);
        lookUpFactory.packSize = $resource(CommonService.buildUrl(AppConst.API_URL.LookUp.PackSize), {}, AppConst.ResourceMethods.Readonly);

        lookUpFactory.foreignStatus = $resource(CommonService.buildUrl(AppConst.API_URL.LookUp.ForeignApplicationStatus), { id: "@id" }, AppConst.ResourceMethods.Readonly);

        lookUpFactory.subModuleType = $resource(CommonService.buildUrl(AppConst.API_URL.LookUp.SubmoduleType), {}, AppConst.ResourceMethods.Readonly);

        return lookUpFactory;
    });