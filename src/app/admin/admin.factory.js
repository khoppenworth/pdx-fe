(function() {
    'use strict';

    angular.module('pdx.factories')
        .factory('AdminFactory', function($resource, CommonService, AppConst) {
            var adminFactory = {};
            adminFactory.subModuleType = $resource(CommonService.buildUrl(AppConst.API_URL.Submodule.SubmoduleType), { id: "@id" }, AppConst.ResourceMethods.All);
            return adminFactory;
        });
})();