'use strict';

angular.module('pdx.services')
    .factory('httpInterceptor', function($window, $q, $location, StorageService, AppConst, CommonService) {
            return {
                responseError: function(response) {
                    if ($window.location.href.indexOf("localhost") <=
                        -1) {
                        if (response != null && response.data != null)
                            var errorDesc = "Status Code:- " + response.status + ", " +
                                "Status Text:- " + response.statusText + ", " +
                                "Url causing error:- " + response.config.url + ", " +
                                "Status Message:- " + response.data.Message;
                        else if (response != null)
                            errorDesc = "Status Code: " + response.status + ", " +
                            "Status Text:- " + response.statusText + ", " +
                            "Url causing error:- " + response.config.url;
                        $window.ga('set', 'dimension5', "Status Code: " + response.status);
                        $window.ga('send', 'exception', {
                            'exDescription': errorDesc,
                            'exFatal': true
                        });
                    }
                    if ($window.location.href.indexOf("/reset/") > -1) {
                        return $q.resolve(response)
                    } else if (response.status === 401) {
                        CommonService.setReturnUrl($location.path());
                        $location.path('/login');
                        return $q.reject(response);
                    } else if (response.status === 403) {
                        $location.path('/error');
                        return $q.reject(response);
                    } else {
                        return $q.reject(response);
                    }
                },
                request: function(config) {
                    var token = StorageService.get(AppConst.StorageKeys.Token);

                    if (!_.isUndefined(token)) {
                        config.headers['Authorization'] = 'Bearer ' + token.access_token;
                    }

                    return config;
                }
            };
        }

    );