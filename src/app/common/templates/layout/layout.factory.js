'use strict';

angular.module('pdx.factories')
    .factory('LayoutFactory', function($resource, AppConst, CommonService) {
        var layoutFactory = {};
        layoutFactory.menusByUser = $resource(CommonService.buildUrl(AppConst.API_URL.Menus.MenusByUser), { userID: "@userID" }, AppConst.ResourceMethods.Readonly);

        return layoutFactory;
    });