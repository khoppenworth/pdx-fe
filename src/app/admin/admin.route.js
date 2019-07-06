(function() {
    'use strict';

    angular
        .module('pdx')
        .config(adminRoute);

    /** @ngInject */
    function adminRoute($stateProvider, $urlRouterProvider, $httpProvider) {
        $stateProvider
            .state('settings', {
                url: '/settings',
                parent: 'app',
                views: {
                    'contentContainer@app': {
                        templateUrl: 'app/admin/admin.html',
                        controller: 'AdminController',
                        controllerAs: 'vm'
                    }
                },
                redirectTo: "settings.users",
                ncyBreadcrumb: {
                    label: 'Settings',
                    pageTitle: 'Settings'
                }
            })
            .state('users', {
                url: '/users',
                parent: 'app',
                views: {
                    'contentContainer@app': {
                        templateUrl: 'app/admin/usermgmt/list/list.html',
                        controller: 'UserListController',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Users',
                    pageTitle: 'User Managment'
                }
            })
            .state('system_settings', {
                url: '/system_settings',
                parent: 'settings',
                views: {
                    'adminApp@settings': {
                        templateUrl: 'app/admin/system_settings/system_settings.html',
                        controller: 'SystemSettingsController',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'System Settings',
                    pageTitle: 'System Settings'
                }
            })
            .state('settings.roles', {
                url: '/roles',
                parent: 'settings',
                views: {
                    'adminApp@settings': {
                        templateUrl: 'app/admin/rolemgmt/role.html',
                        controller: 'RoleListController',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: "Roles",
                    pageTitle: 'Role Management'
                }
            })
            .state('settings.modulesettings', {
                url: '/modules',
                parent: 'settings',
                params: {
                    activeTab: 0
                },
                views: {
                    'adminApp@settings': {
                        templateUrl: 'app/admin/modulesettings/module_settings.html',
                        controller: 'ModuleSettingsController',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: "Module",
                    pageTitle: 'Module Settings'
                }
            })
            .state('settings.checklist', {
                url: '/checklist',
                parent: 'settings',
                views: {
                    'adminApp@settings': {
                        templateUrl: 'app/admin/checklistmgmt/checklist.html',
                        controller: 'ChecklistController',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: "Checklists",
                    pageTitle: 'Checklist Management'
                }
            })
            .state('sra', {
              url: '/sra',
              parent: 'settings',
              views: {
                'adminApp@settings': {
                  templateUrl: 'app/admin/sra/sra.html',
                  controller: 'SRAController',
                  controllerAs: 'vm'
                }
              },
              ncyBreadcrumb: {
                label: 'SRA',
                pageTitle: 'SRA'
              }
            })
            .state('fast_tracking', {
              url: '/fast_tracking',
              parent: 'settings',
              views: {
                'adminApp@settings': {
                  templateUrl: 'app/admin/fastTracking/fastTracking.html',
                  controller: 'FastTrackingController',
                  controllerAs: 'vm'
                
                }
              },
              ncyBreadcrumb: {
                label: 'Fast Tracking Item',
                pageTitle: 'Fast Tracking Item'
              }
          }) 
          .state('lookups', {
            url: '/lookups',
            parent: 'settings',
            views: {
              'adminApp@settings': {
                templateUrl: 'app/admin/lookupManager/templates/lookupManager.html',
                controller: 'LookupManagerController',
                controllerAs: 'vm'       
              }
            },
            ncyBreadcrumb: {
              label: 'Lookup Management',
              pageTitle: 'Lookup Management'
            }
        })
        .state('lookups.detail', {
          url: '/detail/:id',
          parent: 'lookups',
          views: {
            'adminApp@settings': {
              templateUrl: 'app/admin/lookupManager/detail/detail.html',
              controller: 'LookupTableDetailController',
              controllerAs: 'vm'
            }
          },
          ncyBreadcrumb: {
            label: 'Lookup Detail',
            pageTitle: 'Lookup Detail'
          }
        });

    }

})();
