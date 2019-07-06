(function() {
    'use strict';

    angular
        .module('pdx')
        .config(ipermitRouterConfig);

    /** @ngInject */
    function ipermitRouterConfig($stateProvider, $urlRouterProvider, $httpProvider, $compileProvider) {
        // $compileProvider.aHrefSanitizationWhitelist(/^\s*(|blob|):/);
        $stateProvider
            .state('ipermit', {
                url: '/ipermit',
                parent: 'app',
                views: {
                    'contentContainer@app': {
                        templateUrl: 'app/importPermit/importPermit.html',
                        controllerAs: 'vm'
                    }
                },
                redirectTo: 'ipermit.list',
                ncyBreadcrumb: {
                    label: 'Import Permit',
                    pageTitle: 'Import Permit'
                }
            })
            .state('ipermit.list', {
                url: '/list',
                parent: 'ipermit',
                views: {
                    'ipermitApp@ipermit': {
                        templateUrl: 'app/importPermit/list/list.html',
                        controller: 'ImportPermitListController',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'List',
                    pageTitle: 'Import Permit List'
                }
            })
            .state('ipermit.list.info', {
                url: '/:ipermitId',
                parent: 'ipermit.list',
                params: {
                    ipermitId: null
                },
                views: {
                    'ipermitApp@ipermit': {
                        templateUrl: 'app/importPermit/list/detail/detail.html',
                        controller: 'ImportPermitDetailController',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Detail',
                    pageTitle: 'Import Permit Detail'
                }
            })

             //New states
            .state('ipermit.new', {
                url: '/new',
                parent: 'ipermit',
                views: {
                    'ipermitApp@ipermit': {
                        templateUrl: 'app/importPermit/new/new.html',
                        controller: 'ImportPermitNewController',
                        controllerAs: 'vm'
                    }
                },
                redirectTo: 'ipermit.new.header',
                ncyBreadcrumb: {
                    label: 'New',
                    pageTitle: 'New Import Permit'
                }
            })
            .state('ipermit.new.header', {
                url: '/header',
                parent: 'ipermit.new',
                views: {
                    'ipSteps@ipermit.new': {
                        templateUrl: 'app/importPermit/new/templates/header.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Header',
                    pageTitle: 'New Import Permit Header'
                }
            })
            .state('ipermit.new.detail', {
                url: '/detail',
                parent: 'ipermit.new',
                views: {
                    'ipSteps@ipermit.new': {
                        templateUrl: 'app/importPermit/new/templates/detail.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Detail',
                    pageTitle: 'New Import Permit Detail'
                }
            })
            .state('ipermit.new.attachments', {
                url: '/attachments',
                parent: 'ipermit.new',
                views: {
                    'ipSteps@ipermit.new': {
                        templateUrl: 'app/importPermit/new/templates/attachments.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Attachments',
                    pageTitle: 'New Import Permit Attachments'
                }
            })
            .state('ipermit.new.terms', {
                url: '/termsandconditions',
                parent: 'ipermit.new',
                views: {
                    'ipSteps@ipermit.new': {
                        templateUrl: 'app/importPermit/new/templates/termsAndConditions.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Terms and Conditions',
                    pageTitle: 'Terms and Conditions'
                }
            })

             //Update states
            .state('ipermit.update', {
                url: '/update/:ipermitId',
                parent: 'ipermit',
                views: {
                    'ipermitApp@ipermit': {
                        templateUrl: 'app/importPermit/update/update.html',
                        controller: 'ImportPermitUpdateController',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    ipermitId: null,
                },
                ncyBreadcrumb: {
                    label: 'Update',
                    pageTitle: 'Update Import Permit'
                }
            })
            .state('ipermit.update.header', {
                url: '/header',
                parent: 'ipermit.update',
                views: {
                    'ipSteps@ipermit.update': {
                        templateUrl: 'app/importPermit/update/templates/header.html',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    ipermitId: null
                },
                ncyBreadcrumb: {
                    label: 'Header',
                    pageTitle: 'Update Import Permit Header'
                }
            })
            .state('ipermit.update.detail', {
                url: '/detail',
                parent: 'ipermit.update',
                views: {
                    'ipSteps@ipermit.update': {
                        templateUrl: 'app/importPermit/update/templates/detail.html',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    ipermitId: null
                },
                ncyBreadcrumb: {
                    label: 'Detail',
                    pageTitle: 'Update Import Permit Detail'
                }
            })
            .state('ipermit.update.attachments', {
                url: '/attachments',
                parent: 'ipermit.update',
                views: {
                    'ipSteps@ipermit.update': {
                        templateUrl: 'app/importPermit/update/templates/attachments.html',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    ipermitId: null
                },
                ncyBreadcrumb: {
                    label: 'Attachments',
                    pageTitle: 'Update Import Permit Attachments'
                }
            })
            .state('ipermit.update.terms', {
                url: '/termsandconditions',
                parent: 'ipermit.update',
                views: {
                    'ipSteps@ipermit.update': {
                        templateUrl: 'app/importPermit/update/templates/termsAndConditions.html',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    ipermitId: null
                },
                ncyBreadcrumb: {
                    label: 'Terms and Conditions',
                    pageTitle: 'Terms and Conditions'
                }
            })

            //wip states
            .state('ipermit.wip', {
                url: '/wip/:ipermitId',
                parent: 'ipermit',
                views: {
                  'ipermitApp@ipermit': {
                    templateUrl: 'app/importPermit/wip/wip.html',
                    controller: 'ImportPermitWIPController',
                    controllerAs: 'vm'
                  }
                },
                params: {
                  ipermitId: null,
                },
                ncyBreadcrumb: {
                  label: 'Draft',
                  pageTitle: 'Draft Import Permit'
                }
            })
            .state('ipermit.wip.header', {
                url: '/header',
                parent: 'ipermit.wip',
                views: {
                  'ipSteps@ipermit.wip': {
                    templateUrl: 'app/importPermit/wip/templates/header.html',
                    controllerAs: 'vm'
                  }
                },
                params: {
                  ipermitId: null
                },
                ncyBreadcrumb: {
                  label: 'Header',
                  pageTitle: 'Draft Import Permit Header'
                }
            })
            .state('ipermit.wip.detail', {
              url: '/detail',
              parent: 'ipermit.wip',
              views: {
                'ipSteps@ipermit.wip': {
                  templateUrl: 'app/importPermit/wip/templates/detail.html',
                  controllerAs: 'vm'
                }
              },
              params: {
                ipermitId: null
              },
              ncyBreadcrumb: {
                label: 'Detail',
                pageTitle: 'Draft Import Permit Detail'
              }
            })
            .state('ipermit.wip.attachments', {
              url: '/attachments',
              parent: 'ipermit.wip',
              views: {
                'ipSteps@ipermit.wip': {
                  templateUrl: 'app/importPermit/wip/templates/attachments.html',
                  controllerAs: 'vm'
                }
              },
              params: {
                ipermitId: null
              },
              ncyBreadcrumb: {
                label: 'Attachments',
                pageTitle: 'Draft Import Permit Attachments'
              }
            })
            .state('ipermit.wip.terms', {
              url: '/termsandconditions',
              parent: 'ipermit.wip',
              views: {
                'ipSteps@ipermit.wip': {
                  templateUrl: 'app/importPermit/wip/templates/termsAndConditions.html',
                  controllerAs: 'vm'
                }
              },
              params: {
                ipermitId: null
              },
              ncyBreadcrumb: {
                label: 'Terms and Conditions',
                pageTitle: 'Terms and Conditions'
              }
            });
    }

})();
