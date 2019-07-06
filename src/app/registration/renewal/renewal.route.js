(function() {
    'use strict';

    angular
        .module('pdx')
        .config(renewalRouterConfig);

    /** @ngInject */
    function renewalRouterConfig($stateProvider) {
        $stateProvider

        //Ma Renewal new
            .state('maregistration.renewal.new', {
                url: '/new/:id',
                parent: 'maregistration.renewal',
                views: {
                    'renewalApp@maregistration.renewal': {
                        templateUrl: 'app/registration/renewal/templates/steps.html',
                        controller: 'MANewRenewalController',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    id: null,
                },
                redirectTo: 'maregistration.renewal.new.previous',
                ncyBreadcrumb: {
                    label: 'New',
                    pageTitle: 'New'
                }
            })
            .state('maregistration.renewal.new.previous', {
                url: '/previous',
                parent: 'maregistration.renewal.new',
                views: {
                    'renewalSteps@maregistration.renewal.new': {
                        templateUrl: 'app/registration/renewal/templates/previousApplication.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Original',
                    pageTitle: 'Original'
                }
            })
            .state('maregistration.renewal.new.attachments', {
                url: '/attachment',
                parent: 'maregistration.renewal.new',
                views: {
                    'renewalSteps@maregistration.renewal.new': {
                        templateUrl: 'app/registration/renewal/templates/attachements.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Attachments',
                    pageTitle: 'Attachments'
                }
            })
            .state('maregistration.renewal.new.dossier', {
                url: '/dossier',
                parent: 'maregistration.renewal.new',
                views: {
                    'renewalSteps@maregistration.renewal.new': {
                        templateUrl: 'app/registration/renewal/templates/dossier.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Dossiers',
                    pageTitle: 'Dossier'
                }
            })
            .state('maregistration.renewal.new.checklist', {
                url: '/checklist',
                parent: 'maregistration.renewal.new',
                views: {
                    'renewalSteps@maregistration.renewal.new': {
                        templateUrl: 'app/registration/renewal/templates/checklist.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Checklist',
                    pageTitle: 'Checklist'
                }
            })
            .state('maregistration.renewal.new.termsAndConditions', {
                url: '/terms',
                parent: 'maregistration.renewal.new',
                views: {
                    'renewalSteps@maregistration.renewal.new': {
                        templateUrl: 'app/registration/renewal/templates/termsConditions.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Terms',
                    pageTitle: 'Terms and Conditions'
                }
            })
            .state('maregistration.renewal.new.foodTermsConditions', {
                url: '/foodTermsConditions',
                parent: 'maregistration.renewal.new',
                views: {
                    'renewalSteps@maregistration.renewal.new': {
                        templateUrl: 'app/registration/renewal/templates/foodTermsConditions.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Terms',
                    pageTitle: 'Terms and Conditions'
                }
            })

        //MA renewal wip
        .state('maregistration.renewal.wip', {
                url: '/wip/:id',
                parent: 'maregistration.renewal',
                views: {
                    'renewalApp@maregistration.renewal': {
                        templateUrl: 'app/registration/renewal/templates/steps.html',
                        controller: 'MANewRenewalWIPController',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    id: null,
                },
                redirectTo: 'maregistration.renewal.wip.previous',
                ncyBreadcrumb: {
                    label: 'Draft',
                    pageTitle: 'Draft'
                }
            })
            .state('maregistration.renewal.wip.previous', {
                url: '/previous',
                parent: 'maregistration.renewal.wip',
                views: {
                    'renewalSteps@maregistration.renewal.wip': {
                        templateUrl: 'app/registration/renewal/wip/templates/previousApplication.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Original',
                    pageTitle: 'Original'
                }
            })
            .state('maregistration.renewal.wip.attachments', {
                url: '/attachment',
                parent: 'maregistration.renewal.wip',
                views: {
                    'renewalSteps@maregistration.renewal.wip': {
                        templateUrl: 'app/registration/renewal/templates/attachements.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Attachment',
                    pageTitle: 'Attachment'
                }
            })
            .state('maregistration.renewal.wip.dossier', {
                url: '/dossier',
                parent: 'maregistration.renewal.wip',
                views: {
                    'renewalSteps@maregistration.renewal.wip': {
                        templateUrl: 'app/registration/renewal/templates/dossier.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Dossier',
                    pageTitle: 'Dossier'
                }
            })
            .state('maregistration.renewal.wip.checklist', {
                url: '/checklist',
                parent: 'maregistration.renewal.wip',
                views: {
                    'renewalSteps@maregistration.renewal.wip': {
                        templateUrl: 'app/registration/renewal/templates/checklist.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Checklist',
                    pageTitle: 'Checklist'
                }
            })
            .state('maregistration.renewal.wip.termsAndConditions', {
                url: '/terms',
                parent: 'maregistration.renewal.wip',
                views: {
                    'renewalSteps@maregistration.renewal.wip': {
                        templateUrl: 'app/registration/renewal/templates/termsConditions.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Terms',
                    pageTitle: 'Terms and Conditions'
                }
            })
            .state('maregistration.renewal.wip.foodTermsConditions', {
                url: '/foodTerms',
                parent: 'maregistration.renewal.wip',
                views: {
                    'renewalSteps@maregistration.renewal.wip': {
                        templateUrl: 'app/registration/renewal/templates/foodTermsConditions.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Terms',
                    pageTitle: 'Terms and Conditions'
                }
            })

        //MA Renewal update
        .state('maregistration.renewal.update', {
                url: '/update/:maId',
                parent: 'maregistration.renewal',
                views: {
                    'renewalApp@maregistration.renewal': {
                        templateUrl: 'app/registration/renewal/templates/steps.html',
                        controller: 'MAUpdateRenewalController',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    maId: null,
                },
                redirectTo: 'maregistration.renewal.update.previous',
                ncyBreadcrumb: {
                    label: 'Update',
                    pageTitle: 'Update'
                }
            })
            .state('maregistration.renewal.update.previous', {
                url: '/previous',
                parent: 'maregistration.renewal.update',
                views: {
                    'renewalSteps@maregistration.renewal.update': {
                        templateUrl: 'app/registration/renewal/update/templates/previousApplication.html',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    maId: null
                },
                ncyBreadcrumb: {
                    label: 'Original',
                    pageTitle: 'Original'
                }
            })
            //Product Detail
            .state('maregistration.renewal.update.product', {
                url: '/product',
                parent: 'maregistration.renewal.update',
                views: {
                    'renewalSteps@maregistration.renewal.update': {
                        templateUrl: 'app/registration/renewal/update/templates/product.html',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    maId: null
                },
                ncyBreadcrumb: {
                    label: 'Product Detail',
                    pageTitle: 'Product Detail'
                }
            })
            .state('maregistration.renewal.update.foodproduct', {
                url: '/foodproduct',
                parent: 'maregistration.renewal.update',
                views: {
                    'renewalSteps@maregistration.renewal.update': {
                        templateUrl: 'app/registration/templates/steps/foodproduct.html',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    maId: null
                },
                ncyBreadcrumb: {
                    label: 'Product Detail',
                    pageTitle: 'Product Detail'
                }
            })
            //Product Detail Continued
            .state('maregistration.renewal.update.productcontinued', {
                url: '/productcontinued',
                parent: 'maregistration.renewal.update',
                views: {
                    'renewalSteps@maregistration.renewal.update': {
                        templateUrl: 'app/registration/templates/steps/productcontinued.html',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    maId: null
                },
                ncyBreadcrumb: {
                    label: 'Product',
                    pageTitle: 'Product Detail'
                }
            })
            .state('maregistration.renewal.update.foodproductcontinued', {
                url: '/foodproductcontinued',
                parent: 'maregistration.renewal.update',
                views: {
                    'renewalSteps@maregistration.renewal.update': {
                        templateUrl: 'app/registration/templates/steps/foodproductcontinued.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Product',
                    pageTitle: 'Product Detail'
                }
            })

        //Composition
        .state('maregistration.renewal.update.composition', {
                url: '/composition',
                parent: 'maregistration.renewal.update',
                views: {
                    'renewalSteps@maregistration.renewal.update': {
                        templateUrl: 'app/registration/templates/steps/composition.html',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    maId: null
                },
                ncyBreadcrumb: {
                    label: 'Composition',
                    pageTitle: 'Composition'
                }
            })
            .state('maregistration.renewal.update.foodcomposition', {
                url: '/foodcomposition',
                parent: 'maregistration.renewal.update',
                views: {
                    'renewalSteps@maregistration.renewal.update': {
                        templateUrl: 'app/registration/templates/steps/foodcomposition.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Composition',
                    pageTitle: 'Composition'
                }
            })

        //Manufacturer
        .state('maregistration.renewal.update.manufacturer', {
            url: '/manufacturer',
            parent: 'maregistration.renewal.update',
            views: {
                'renewalSteps@maregistration.renewal.update': {
                    templateUrl: 'app/registration/templates/steps/manufacturers.html',
                    controllerAs: 'vm'
                }
            },
            params: {
                maId: null
            },
            ncyBreadcrumb: {
                label: 'Manufacturer',
                pageTitle: 'Manufacturer'
            }
        })

        //Foreign App Status
        .state('maregistration.renewal.update.foreignstatus', {
            url: '/foreignstatus',
            parent: 'maregistration.renewal.update',
            views: {
                'renewalSteps@maregistration.renewal.update': {
                    templateUrl: 'app/registration/templates/steps/foreignstatus.html',
                    controllerAs: 'vm'
                }
            },
            params: {
                maId: null
            },
            ncyBreadcrumb: {
                label: 'Manufacturer',
                pageTitle: 'Manufacturer'
            }
        })

        .state('maregistration.renewal.update.attachments', {
                url: '/attachment',
                parent: 'maregistration.renewal.update',
                views: {
                    'renewalSteps@maregistration.renewal.update': {
                        templateUrl: 'app/registration/renewal/templates/attachements.html',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    maId: null
                },
                ncyBreadcrumb: {
                    label: 'Attachment',
                    pageTitle: 'Attachment'
                }
            })
            .state('maregistration.renewal.update.dossier', {
                url: '/dossier',
                parent: 'maregistration.renewal.update',
                views: {
                    'renewalSteps@maregistration.renewal.update': {
                        templateUrl: 'app/registration/renewal/templates/dossier.html',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    maId: null
                },
                ncyBreadcrumb: {
                    label: 'Dossier',
                    pageTitle: 'Dossier'
                }
            })
            .state('maregistration.renewal.update.checklist', {
                url: '/checklist',
                parent: 'maregistration.renewal.update',
                views: {
                    'renewalSteps@maregistration.renewal.update': {
                        templateUrl: 'app/registration/renewal/update/templates/checklist.html',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    maId: null
                },
                ncyBreadcrumb: {
                    label: 'Checklist',
                    pageTitle: 'Checklist'
                }
            });
    }
})();
