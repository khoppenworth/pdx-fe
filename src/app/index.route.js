(function() {
    'use strict';

    angular
        .module('pdx')
        .config(routerConfig);

    /** @ngInject */
    function routerConfig($stateProvider, $urlRouterProvider, $httpProvider) {

        //http request and error interceptors
        $httpProvider.interceptors.push('httpInterceptor');

        //Anonymous routes
        $stateProvider
            .state('login', {
                url: '/login',
                views: {
                    'appContainer': {
                        templateUrl: 'app/account/login.html',
                        controller: 'LoginController',
                        controllerAs: 'vm'
                    }
                }
            })
            .state('logout', {
                url: '/logout',
                views: {
                    'appContainer': {
                        controller: 'LogoutController'
                    }
                }
            })
            .state('reset', {
                url: '/reset/:id/:token',
                views: {
                    'appContainer': {
                        templateUrl: 'app/account/reset.html',
                        controller: 'ResetController',
                        controllerAs: 'vm'
                    }
                },
                resolve: {
                    validateToken: function($http, $stateParams, AppConst, StorageService, EnvironmentConfig) {
                        StorageService.set(AppConst.StorageKeys.Token, { access_token: $stateParams.token });
                        return $http.get(EnvironmentConfig.RootAPIURL + AppConst.API_URL.Account.ValidateToken)
                    }
                }
            })
            .state('forgot', {
                url: '/forgot',
                views: {
                    'appContainer': {
                        templateUrl: 'app/account/forgot.html',
                        controller: 'ForgotController',
                        controllerAs: 'vm'
                    }
                }
            })
            .state('404', {
                url: "/404",
                views: {
                    'appContainer': {
                        templateUrl: 'app/common/templates/404.html'
                    }
                },
                data: { pageTitle: '404', specialClass: 'gray-bg' }
            });

        //Application States
        $stateProvider
            .state('app', {
                abstract: true,
                views: {
                    'appContainer': {
                        templateUrl: 'app/common/templates/layout/content.html'
                    }
                },
                data: {
                    RequireLogin: true
                },
                resolve: {
                    permissionAndSettings: getPermissionAndSettings
                }
            })
            .state('home', {
                url: '/home',
                parent: 'app',
                views: {
                    'contentContainer@app': {
                        templateUrl: 'app/home/home.html',
                        controller: 'HomeController',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Home',
                    pageTitle: 'Home'
                }
            })
            .state('miscellaneous', {
                url: '/miscellaneous',
                parent: 'app',
                views: {
                    'contentContainer@app': {
                        templateUrl: 'app/miscellaneous/miscellaneous.html',
                    },
                },
                redirectTo: 'changelog',
                ncyBreadcrumb: {
                    label: 'miscellaneous',
                    pageTitle: 'Miscellaneous'

                }
            })
            .state('error', {
                url: '/error',
                parent: 'app',
                params: {
                    errorCode: 403,
                },
                views: {
                    'contentContainer@app': {
                        templateUrl: 'app/common/templates/layout/error_page.html',
                        controller: 'ErrorPageController',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Home',
                    pageTitle: 'Home'
                }
            })

        $urlRouterProvider.otherwise('/public');
    }

    var getPermissionAndSettings = function($rootScope, $q, AdminRoleMgmtFactory, AdminSystemSettingsFactory, Keepalive) {
        if (angular.isDefined(($rootScope.permissions) && angular.isDefined($rootScope.settings))) {
            return;
        } else {
            var permissions = {};
            $rootScope.settings = {}
            var perm = AdminRoleMgmtFactory.permissions.query().$promise;
            var sett = AdminSystemSettingsFactory.settings.query().$promise;
            return $q.all([perm, sett]).then(function(results) {
                var permission = results[0];
                var settings = results[1];
                var groupedPermissions = _
                    .chain(permission)
                    .groupBy('category')
                    .map(function(value, key) {
                        var internalObj = {};
                        //arrays to object using permissionCode as a key
                        _.each(value, function(val) {
                            internalObj[val.permissionCode] = val.name;
                        });

                        return {
                            category: key.split(' ').join(''),
                            permissions: internalObj
                        }
                    })
                    .value();

                //convert
                _.each(groupedPermissions, function(gPrm) {
                    permissions[gPrm.category] = gPrm.permissions;
                });
                $rootScope.permissions = permissions;

                _.each(settings, function(data) {
                    $rootScope.settings[data.systemSettingCode] = data.value;
                });
                var autosaveInterval = Number($rootScope.settings.AUI);
                //Type cast to number (originally, server sends string)
                //If cast is not successful for any reason , do not change autosave interval
                //  Type guard!
                if (isNaN(autosaveInterval)) {

                } else {
                    Keepalive.setInterval(60 * autosaveInterval);
                    Keepalive.start();
                }

                return;
            }, function(error) {
                return error;
            });
        }
    }

})();