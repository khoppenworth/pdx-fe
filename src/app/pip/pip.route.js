(function() {
    'use strict';

    angular
        .module('pdx')
        .config(adminRoute);

    /** @ngInject */
    function adminRoute($stateProvider, $urlRouterProvider, $httpProvider) {
        $stateProvider
            .state('pip', {
                url: '/pip',
                parent: 'app',
                views: {
                    'contentContainer@app': {
                        templateUrl: 'app/pip/pip.html',
                        controllerAs: 'vm'
                    }
                },
                redirectTo: 'pip.list',
                ncyBreadcrumb: {
                    label: 'PIP',
                    pageTitle: 'Pre Import Permit'
                }
            })
            .state('pip.list', {
                url: '/list',
                parent: 'pip',
                views: {
                    'pipApp@pip': {
                        templateUrl: 'app/pip/list/list.html',
                        controller: 'PipListController',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'List',
                    pageTitle: 'Pre Import Permit List'
                }
            })
            .state('pip.list.info', {
                url: '/:pipId',
                parent: 'pip.list',
                params: {
                    pipId: null
                },
                views: {
                    'pipApp@pip': {
                        templateUrl: 'app/pip/list/detail/detail.html',
                        controller: 'PipDetailController',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Detail',
                    pageTitle: 'Pre Import Permit Detail'
                }
            })

        .state('pip.new', {
                url: '/new',
                parent: 'pip',
                views: {
                    'pipApp@pip': {
                        templateUrl: 'app/pip/new/new.html',
                        controller: 'PipNewController',
                        controllerAs: 'vm'
                    }
                },
                redirectTo: 'pip.new.header',
                ncyBreadcrumb: {
                    label: 'New',
                    pageTitle: 'New Pre Import Permit'
                }
            })
            .state('pip.new.header', {
                url: '/header',
                parent: 'pip.new',
                views: {
                    'ipSteps@pip.new': {
                        templateUrl: 'app/pip/new/templates/header.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Header',
                    pageTitle: 'New Pre Import Permit Header'
                }
            })
            .state('pip.new.detail', {
                url: '/detail',
                parent: 'pip.new',
                views: {
                    'ipSteps@pip.new': {
                        templateUrl: 'app/pip/new/templates/detail.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Detail',
                    pageTitle: 'New Pre Import Permit Detail'
                }
            })

        .state('pip.new.detail.product', {
                url: '/prod',
                parent: 'pip.new.detail',
                views: {
                    'pipApp@pip.new.detail': {
                        templateUrl: 'app/pip/product/product.html',
                        controller: 'PipProductController',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    supplierID: null,
                    submoduleTypeCode: null
                },
                ncyBreadcrumb: {
                    label: 'Product',
                    pageTitle: 'Product'
                }
            })
            .state('pip.new.attachments', {
                url: '/attachments',
                parent: 'pip.new',
                views: {
                    'ipSteps@pip.new': {
                        templateUrl: 'app/pip/new/templates/attachments.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Attachments',
                    pageTitle: 'New Pre Import Permit Attachments'
                }
            })
            .state('pip.new.terms', {
                url: '/termsandconditions',
                parent: 'pip.new',
                views: {
                    'ipSteps@pip.new': {
                        templateUrl: 'app/pip/new/templates/termsAndConditions.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Terms and Conditions',
                    pageTitle: 'Terms and Conditions'
                }
            })
            //Update pip
            .state('pip.update', {
                url: '/update/:pipId',
                parent: 'pip',
                views: {
                    'pipApp@pip': {
                        templateUrl: 'app/pip/update/update.html',
                        controller: 'PipUpdateController',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    pipId: null
                },
                redirectTo: 'pip.update.header',
                ncyBreadcrumb: {
                    label: 'Update',
                    pageTitle: 'Update Pre Import Permit'
                }
            })
            .state('pip.update.header', {
                url: '/header',
                parent: 'pip.update',
                views: {
                    'ipSteps@pip.update': {
                        templateUrl: 'app/pip/update/templates/header.html',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    pipId: null
                },
                ncyBreadcrumb: {
                    label: 'Header',
                    pageTitle: 'Update Pre Import Permit Header'
                }
            })
            .state('pip.update.detail', {
                url: '/detail',
                parent: 'pip.update',
                views: {
                    'ipSteps@pip.update': {
                        templateUrl: 'app/pip/update/templates/detail.html',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    pipId: null
                },
                ncyBreadcrumb: {
                    label: 'Detail',
                    pageTitle: 'Update Pre Import Permit Detail'
                }
            })
            .state('pip.update.detail.product', {
                url: '/prod',
                parent: 'pip.update.detail',
                views: {
                    'pipApp@pip.update.detail': {
                        templateUrl: 'app/pip/product/product.html',
                        controller: 'PipProductController',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    supplierID: null,
                    submoduleTypeCode: null
                },
                ncyBreadcrumb: {
                    label: 'Product',
                    pageTitle: 'Product'
                }
            })
            .state('pip.update.attachments', {
                url: '/attachments',
                parent: 'pip.update',
                views: {
                    'ipSteps@pip.update': {
                        templateUrl: 'app/pip/update/templates/attachments.html',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    pipId: null
                },
                ncyBreadcrumb: {
                    label: 'Attachments',
                    pageTitle: 'Update Pre Import Permit Attachments'
                }
            })
            .state('pip.update.terms', {
                url: '/termsandconditions',
                parent: 'pip.update',
                views: {
                    'ipSteps@pip.update': {
                        templateUrl: 'app/pip/update/templates/termsAndConditions.html',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    pipId: null
                },
                ncyBreadcrumb: {
                    label: 'Terms and Conditions',
                    pageTitle: 'Terms and Conditions'
                }
            })

        // wip_pip routing
        .state('pip.wip', {
                url: '/wip/:pipId',
                parent: 'pip',
                views: {
                    'pipApp@pip': {
                        templateUrl: 'app/pip/wip/wip_pip.html',
                        controller: 'PipWipController',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    pipId: null
                },
                redirectTo: 'pip.wip.header',
                ncyBreadcrumb: {
                    label: 'WIP',
                    pageTitle: 'Draft Pre Import Permit'
                }
            })
            .state('pip.wip.header', {
                url: '/header',
                parent: 'pip.wip',
                views: {
                    'ipSteps@pip.wip': {
                        templateUrl: 'app/pip/wip/templates/header.html',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    pipId: null
                },
                ncyBreadcrumb: {
                    label: 'Header',
                    pageTitle: 'Draft Pre Import Permit Header'
                }
            })
            .state('pip.wip.detail', {
                url: '/detail',
                parent: 'pip.wip',
                views: {
                    'ipSteps@pip.wip': {
                        templateUrl: 'app/pip/wip/templates/detail.html',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    pipId: null
                },
                ncyBreadcrumb: {
                    label: 'Detail',
                    pageTitle: 'Draft Pre Import Permit Detail'
                }
            })
            .state('pip.wip.detail.product', {
                url: '/prod',
                parent: 'pip.wip.detail',
                views: {
                    'pipApp@pip.wip.detail': {
                        templateUrl: 'app/pip/product/product.html',
                        controller: 'PipProductController',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    supplierID: null,
                    submoduleTypeCode: null
                },
                ncyBreadcrumb: {
                    label: 'Product',
                    pageTitle: 'Product'
                }
            })
            .state('pip.wip.attachments', {
                url: '/attachments',
                parent: 'pip.wip',
                views: {
                    'ipSteps@pip.wip': {
                        templateUrl: 'app/pip/wip/templates/attachments.html',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    pipId: null
                },
                ncyBreadcrumb: {
                    label: 'Attachments',
                    pageTitle: 'Draft Pre Import Permit Attachments'
                }
            })
            .state('pip.wip.terms', {
                url: '/termsandconditions',
                parent: 'pip.wip',
                views: {
                    'ipSteps@pip.wip': {
                        templateUrl: 'app/pip/wip/templates/termsAndConditions.html',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    pipId: null
                },
                ncyBreadcrumb: {
                    label: 'Terms and Conditions',
                    pageTitle: 'Terms and Conditions'
                }
            });
    }

})();
