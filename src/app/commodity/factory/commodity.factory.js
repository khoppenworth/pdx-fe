'use strict';

angular.module('pdx.factories')
    .factory('CommodityFactory', function($resource, AppConst, CommonService) {
        var commodityFactory = {};
        commodityFactory.product = $resource(CommonService.buildUrl(AppConst.API_URL.Commodity.Product), { id: "@id" }, AppConst.ResourceMethods.Readonly);
        commodityFactory.product.Create = $resource(CommonService.buildUrl(AppConst.API_URL.Commodity.ProductCreate), {}, AppConst.ResourceMethods.Readonly);
        commodityFactory.agentProduct = $resource(CommonService.buildUrl(AppConst.API_URL.Commodity.AgentProduct), { agentID: "@agentID" }, AppConst.ResourceMethods.Readonly);
        commodityFactory.productManufacturer = $resource(CommonService.buildUrl(AppConst.API_URL.Commodity.ProductManufacturer), { productID: "@productID" }, AppConst.ResourceMethods.Readonly);
        commodityFactory.productManufacturerAddress = $resource(CommonService.buildUrl(AppConst.API_URL.Commodity.ProductManufacturerAddress), { id: "@id" }, AppConst.ResourceMethods.Readonly);

        //lookups

        commodityFactory.sra = $resource(CommonService.buildUrl(AppConst.API_URL.Commodity.SRA), {}, AppConst.ResourceMethods.Readonly);
        commodityFactory.adminRoute = $resource(CommonService.buildUrl(AppConst.API_URL.Commodity.AdminRoute), {}, AppConst.ResourceMethods.Readonly);
        commodityFactory.ageGroup = $resource(CommonService.buildUrl(AppConst.API_URL.Commodity.AgeGroup), {}, AppConst.ResourceMethods.Readonly);
        commodityFactory.atc = $resource(CommonService.buildUrl(AppConst.API_URL.Commodity.ATC), {}, AppConst.ResourceMethods.Readonly);
        commodityFactory.containerType = $resource(CommonService.buildUrl(AppConst.API_URL.Commodity.ContainerType), {}, AppConst.ResourceMethods.Readonly);
        commodityFactory.dosageForm = $resource(CommonService.buildUrl(AppConst.API_URL.Commodity.DosageForm), {}, AppConst.ResourceMethods.Readonly);
        commodityFactory.dosageUnit = $resource(CommonService.buildUrl(AppConst.API_URL.Commodity.DosageUnit), {}, AppConst.ResourceMethods.Readonly);
        commodityFactory.excipient = $resource(CommonService.buildUrl(AppConst.API_URL.Commodity.Excipient), {}, AppConst.ResourceMethods.Readonly);
        commodityFactory.inn = $resource(CommonService.buildUrl(AppConst.API_URL.Commodity.INN), {}, AppConst.ResourceMethods.Readonly);
        commodityFactory.pharmacologicalClassification = $resource(CommonService.buildUrl(AppConst.API_URL.Commodity.PharmacologicalClassification), {}, AppConst.ResourceMethods.Readonly);
        commodityFactory.pharmacopoeiaStandard = $resource(CommonService.buildUrl(AppConst.API_URL.Commodity.PharmacopoeiaStandard), {}, AppConst.ResourceMethods.Readonly);
        commodityFactory.productCategory = $resource(CommonService.buildUrl(AppConst.API_URL.Commodity.ProductCategory), {}, AppConst.ResourceMethods.Readonly);
        commodityFactory.productCategoryBySubmoduleTypeCode = $resource(CommonService.buildUrl(AppConst.API_URL.Commodity.ProductCategoryBySubmoduleTypeCode), {}, AppConst.ResourceMethods.Readonly);
        commodityFactory.productType = $resource(CommonService.buildUrl(AppConst.API_URL.Commodity.ProductType), {}, AppConst.ResourceMethods.Readonly);
        commodityFactory.productTypeBySubmodule = $resource(CommonService.buildUrl(AppConst.API_URL.Commodity.ProductTypeBySubmodule), {}, AppConst.ResourceMethods.Readonly);
        commodityFactory.shelfLife = $resource(CommonService.buildUrl(AppConst.API_URL.Commodity.ShelfLife), {}, AppConst.ResourceMethods.Readonly);
        commodityFactory.useCategory = $resource(CommonService.buildUrl(AppConst.API_URL.Commodity.UseCategory), {}, AppConst.ResourceMethods.Readonly);
        commodityFactory.deviceClass = $resource(CommonService.buildUrl(AppConst.API_URL.Commodity.DeviceClass), {}, AppConst.ResourceMethods.Readonly);
        commodityFactory.deviceClassBySubmoduleCode = $resource(CommonService.buildUrl(AppConst.API_URL.Commodity.DeviceClassBySubmoduleCode), { submoduleCode: "@submoduleCode" }, AppConst.ResourceMethods.Readonly);
        commodityFactory.mDGrouping = $resource(CommonService.buildUrl(AppConst.API_URL.Commodity.MDGrouping), {}, AppConst.ResourceMethods.Readonly);
        commodityFactory.accessoryType = $resource(CommonService.buildUrl(AppConst.API_URL.Commodity.AccessoryType), {}, AppConst.ResourceMethods.Readonly);
        commodityFactory.productDevicePresentation = $resource(CommonService.buildUrl(AppConst.API_URL.Commodity.ProductDevicePresentation), { mdDevicePresentationID: "@mdDevicePresentationID" }, AppConst.ResourceMethods.Readonly);


        return commodityFactory;
    });