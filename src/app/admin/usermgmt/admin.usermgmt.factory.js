'use strict';

angular.module('pdx.factories')
    .factory('AdminUserMgmtFactory', function($resource, $http, AppConst, CommonService) {
        var adminUsermgmtFactory = {};

        //1. Get all user

        //2. Create user
        adminUsermgmtFactory.user = $resource(CommonService.buildUrl(AppConst.API_URL.Account.Users), { id: "@id" }, AppConst.ResourceMethods.All);

        //3. Roles
        adminUsermgmtFactory.role = $resource(CommonService.buildUrl(AppConst.API_URL.Account.Roles), { id: "@id" }, AppConst.ResourceMethods.Readonly);

        //. UserTypes
        adminUsermgmtFactory.userTypes = $resource(CommonService.buildUrl(AppConst.API_URL.LookUp.UserTypes), { id: "@id" }, AppConst.ResourceMethods.Readonly);

        // Users By Role
        adminUsermgmtFactory.userRole = $resource(CommonService.buildUrl(AppConst.API_URL.Account.UserRole), { roleID: "@roleID" }, AppConst.ResourceMethods.Readonly);

        return adminUsermgmtFactory;
    });