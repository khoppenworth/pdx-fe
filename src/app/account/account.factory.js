'use strict';

angular.module('pdx.factories')
    .factory('AccountFactory', function($resource, AppConst, CommonService) {
        var accountFactory = {};
        accountFactory.users = $resource(CommonService.buildUrl(AppConst.API_URL.Account.Users), { id: "@id" }, AppConst.ResourceMethods.All);
        accountFactory.authenticate = $resource(CommonService.buildUrl(AppConst.API_URL.Account.Autenticate), {}, AppConst.ResourceMethods.Post);
        accountFactory.token = $resource(CommonService.buildUrl(AppConst.API_URL.Account.Token), {}, AppConst.ResourceMethods.Post);
        accountFactory.validateToken = $resource(CommonService.buildUrl(AppConst.API_URL.Account.ValidateToken), {}, AppConst.ResourceMethods.Readonly);
        accountFactory.changePassword = $resource(CommonService.buildUrl(AppConst.API_URL.Account.ChangePassword), {}, AppConst.ResourceMethods.save);
        accountFactory.resetPassword = $resource(CommonService.buildUrl(AppConst.API_URL.Account.ResetPassword), { username: "@username" }, AppConst.ResourceMethods.save);
        accountFactory.logout = $resource(CommonService.buildUrl(AppConst.API_URL.Account.Logout), { userID: "@userID" }, AppConst.ResourceMethods.save);

        return accountFactory;
    });