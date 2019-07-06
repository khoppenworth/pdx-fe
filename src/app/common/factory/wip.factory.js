'use strict';

angular.module('pdx.factories')
    .factory('WIPFactory', function($resource, AppConst, CommonService) {
        var WIPFactory = {};

        WIPFactory.saveWIP = $resource(CommonService.buildUrl(AppConst.API_URL.WIP.InsertOrUpdateWIP),{}, AppConst.ResourceMethods.Save);
        WIPFactory.getWIPByID = $resource(CommonService.buildUrl(AppConst.API_URL.WIP.WIPById),{id:"@id"}, AppConst.ResourceMethods.Readonly);
        WIPFactory.getAllWIP = $resource(CommonService.buildUrl(AppConst.API_URL.WIP.AllWIPByUser), { type: "@type", userID: "@userID" }, AppConst.ResourceMethods.Readonly);
        WIPFactory.deleteWIP = $resource(CommonService.buildUrl(AppConst.API_URL.WIP.WIPById  ), { id:'@id' }, AppConst.ResourceMethods.Delete);

        return WIPFactory;
    });
