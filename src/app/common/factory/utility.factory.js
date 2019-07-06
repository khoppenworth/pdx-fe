'use strict';

angular.module('pdx.factories')
    .factory('UtilityFactory', function($resource, AppConst, CommonService) {
        var utilityFactory = {};

        utilityFactory.identifier = $resource(CommonService.buildUrl(AppConst.API_URL.Utility.Identifier), { key: "@key" }, AppConst.ResourceMethods.Readonly);
        return utilityFactory;
    });
