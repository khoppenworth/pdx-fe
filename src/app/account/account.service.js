'use strict';

angular.module('pdx.services')
    .service('AccountService', function(AppConst, AccountFactory, CommonService, StorageService, $http, PushNotificationFactory) {
        var accountService = {};
        // var deferred = $q.defer();
        accountService.login = function(loginModel) {
            return $http.post(CommonService.buildUrl(AppConst.API_URL.Account.Autenticate), loginModel)
                .then(function(response) {
                    var data = response.data;
                    StorageService.set(AppConst.StorageKeys.Token, response.data.token);
                    StorageService.set(AppConst.StorageKeys.UserInfo, response.data.user);
                    StorageService.set(AppConst.StorageKeys.Permissions, response.data.permissions);
                    return data;
                }, function(error) {
                    return error;
                });
        }

        accountService.logout = function(reason) {
            AccountFactory.logout.save({ userID: null }, { userID: this.userInfo().id, reason:reason});

            StorageService.removeAll();

            PushNotificationFactory.unregisterServiceWorker();

        }

        accountService.userInfo = function() {
            var userInfo = StorageService.get(AppConst.StorageKeys.UserInfo);
            return userInfo;
        };

        accountService.token = function() {
            var token = StorageService.get(AppConst.StorageKeys.Token);
            if (token != undefined) {
                return 'Bearer ' + token.access_token;
            }
            return null;
        }

        accountService.permissions = function() {
            var permissions = StorageService.get(AppConst.StorageKeys.Permissions);
            return permissions;
        }

        accountService.hasThisPermission = function(permission) {
            var permissions = this.permissions();
            var hasPermission = _.contains(permissions, permission);
            return hasPermission;
        }

        accountService.hasThesePermissions = function(permissions) {
            var hasPermission = false;
            _.each(permissions, function(permission) {
                //return true if user has access to one of the permissions
                hasPermission = hasPermission || accountService.hasThisPermission(permission);
            })
            return hasPermission;
        }

        return accountService;
    });
