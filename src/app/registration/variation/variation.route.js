(function() {
    'use strict';

    angular
        .module('pdx')
        .config(variationRoute);

    /** @ngInject */
    function variationRoute($stateProvider) {

        $stateProvider

        //information route
            .state('maregistration.variation.variationInformation', {
            url: '/information/:id',
            parent: 'maregistration.variation',
            views: {
                'variation@maregistration.variation': {
                    templateUrl: 'app/registration/variation/info/info.html',
                    controller: 'MAVariationInformationController',
                    controllerAs: 'vm'
                }
            },
            params: {
                id: null,
                isUpdate: false
            },
            ncyBreadcrumb: {
                label: 'Variation',
                pageTitle: 'Variation Information'
            }
        })

        //new route
        .state('maregistration.variation.new', {
                url: '/new/:maId',
                parent: 'maregistration.variation',
                params: {
                    maId: undefined,
                    variationInformation: null
                },
                views: {
                    'variation@maregistration.variation': {
                        templateUrl: 'app/registration/variation/templates/steps.html',
                        controller: 'MANewVariationController',
                        controllerAs: 'vm'
                    }
                },
                resolve: {
                    maFields: function($stateParams, RegistrationFactory,VariationService) {
                        // include isFoodType on fieldbyid currently api doesn't support this
                        var submoduleTypeCode = VariationService.getVariationSubmoduleType();
                        return RegistrationFactory.maFieldById.query({ id: $stateParams.maId, isVariationType: true, submoduleTypeCode: submoduleTypeCode }).$promise;
                    },
                    maVariation: function($stateParams, MAFactory) {
                        return MAFactory.maSingle.get({ maId: $stateParams.maId }).$promise.then(function(response) {
                            return response.result;
                        });
                    }
                },
                redirectTo: 'maregistration.variation.new.general',
                ncyBreadcrumb: {
                    label: 'New',
                    pageTitle: 'New'
                }
            })
            .state('maregistration.variation.new.general', {
                url: '/general',
                parent: 'maregistration.variation.new',
                views: {
                    'variationSteps@maregistration.variation.new': {
                        templateUrl: 'app/registration/variation/templates/general.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'General',
                    pageTitle: 'General Information'
                }
            })
            .state('maregistration.variation.new.product', {
                url: '/products',
                parent: 'maregistration.variation.new',
                views: {
                    'variationSteps@maregistration.variation.new': {
                        templateUrl: 'app/registration/templates/steps/product.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Product',
                    pageTitle: 'Product Detail'
                }
            })
            .state('maregistration.variation.new.foodproduct', {
                url: '/foodproduct',
                parent: 'maregistration.variation.new',
                views: {
                    'variationSteps@maregistration.variation.new': {
                        templateUrl: 'app/registration/templates/steps/foodproduct.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Product',
                    pageTitle: 'Food Product Detail'
                }
            })
            .state('maregistration.variation.new.productcontinued', {
                url: '/productcontinued',
                parent: 'maregistration.variation.new',
                views: {
                    'variationSteps@maregistration.variation.new': {
                        templateUrl: 'app/registration/templates/steps/productcontinued.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Product',
                    pageTitle: 'Product Detail'
                }
            })
            .state('maregistration.variation.new.foodproductcontinued', {
                url: '/foodproductcontinued',
                parent: 'maregistration.variation.new',
                views: {
                    'variationSteps@maregistration.variation.new': {
                        templateUrl: 'app/registration/templates/steps/foodproductcontinued.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Product',
                    pageTitle: 'Food Product Detail Cont.'
                }
            })
            .state('maregistration.variation.new.composition', {
                url: '/composition',
                parent: 'maregistration.variation.new',
                views: {
                    'variationSteps@maregistration.variation.new': {
                        templateUrl: 'app/registration/templates/steps/composition.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Composition',
                    pageTitle: 'Composition'
                }
            })
            .state('maregistration.variation.new.foodcomposition', {
                url: '/foodcomposition',
                parent: 'maregistration.variation.new',
                views: {
                    'variationSteps@maregistration.variation.new': {
                        templateUrl: 'app/registration/templates/steps/foodcomposition.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Composition',
                    pageTitle: 'Composition'
                }
            })
            .state('maregistration.variation.new.foreignstatus', {
                url: '/foreignstatus',
                parent: 'maregistration.variation.new',
                views: {
                    'variationSteps@maregistration.variation.new': {
                        templateUrl: 'app/registration/templates/steps/foreignstatus.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Foreign Status',
                    pageTitle: 'Foreign Application Status'
                }
            })
            .state('maregistration.variation.new.manufacturers', {
                url: '/manufacturers',
                parent: 'maregistration.variation.new',
                views: {
                    'variationSteps@maregistration.variation.new': {
                        templateUrl: 'app/registration/templates/steps/manufacturers.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Manufacturers',
                    pageTitle: 'Manufacturing Activity'
                }
            })
            .state('maregistration.variation.new.attachment', {
                url: '/attachment',
                parent: 'maregistration.variation.new',
                views: {
                    'variationSteps@maregistration.variation.new': {
                        templateUrl: 'app/registration/templates/steps/attachment.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Attachment',
                    pageTitle: 'Attachment'
                }
            })

        .state('maregistration.variation.new.dossier', {
            url: '/dossier',
            parent: 'maregistration.variation.new',
            views: {
                'variationSteps@maregistration.variation.new': {
                    templateUrl: 'app/registration/templates/steps/dossier.html',
                    controllerAs: 'vm'
                }
            },
            ncyBreadcrumb: {
                label: 'Dossier',
                pageTitle: 'Dossier'
            }
        })

        .state('maregistration.variation.new.checklist', {
                url: '/checklist',
                parent: 'maregistration.variation.new',
                views: {
                    'variationSteps@maregistration.variation.new': {
                        templateUrl: 'app/registration/templates/steps/checklist.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Checklist',
                    pageTitle: 'Checklist'
                }
            })
            .state('maregistration.variation.new.termsAndConditions', {
                url: '/terms',
                parent: 'maregistration.variation.new',
                views: {
                    'variationSteps@maregistration.variation.new': {
                        templateUrl: 'app/registration/templates/steps/termsConditions.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Terms',
                    pageTitle: 'Terms'
                }
            })
            .state('maregistration.variation.new.foodTermsConditions', {
                url: '/foodTermsConditions',
                parent: 'maregistration.variation.new',
                views: {
                    'variationSteps@maregistration.variation.new': {
                        templateUrl: 'app/registration/templates/steps/foodTermsConditions.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Terms',
                    pageTitle: 'Terms'
                }
            })
            /*------------------------------------------------------------------------------*/


        //Update route
        .state('maregistration.variation.update', {
                url: '/update/:maId',
                parent: 'maregistration.variation',
                views: {
                    'variation@maregistration.variation': {
                        templateUrl: 'app/registration/variation/templates/steps.html',
                        controller: 'MAUpdateVariationController',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    maId: null,
                    variationInformation: null
                },
                resolve: {
                    maVariation: function($stateParams, MAFactory) {
                        // blockUI.start();
                        return MAFactory.maSingle.get({ maId: $stateParams.maId }).$promise.then(function(response) {
                            return response.result;
                        });
                    }
                },
                redirectTo: 'maregistration.variation.update.general',
                ncyBreadcrumb: {
                    label: 'Update',
                    pageTitle: 'Update'
                }
            })
            .state('maregistration.variation.update.general', {
                url: '/general',
                parent: 'maregistration.variation.update',
                views: {
                    'variationSteps@maregistration.variation.update': {
                        templateUrl: 'app/registration/variation/templates/general.html',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    maId: null,
                },
                ncyBreadcrumb: {
                    label: 'General',
                    pageTitle: 'General Information'
                }
            })
            .state('maregistration.variation.update.product', {
                url: '/products',
                parent: 'maregistration.variation.update',
                views: {
                    'variationSteps@maregistration.variation.update': {
                        templateUrl: 'app/registration/templates/steps/product.html',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    maId: null,
                },
                ncyBreadcrumb: {
                    label: 'Product',
                    pageTitle: 'Product Detail'
                }
            })
            .state('maregistration.variation.update.productcontinued', {
                url: '/productcontinued',
                parent: 'maregistration.variation.update',
                views: {
                    'variationSteps@maregistration.variation.update': {
                        templateUrl: 'app/registration/templates/steps/productcontinued.html',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    maId: null,
                },
                ncyBreadcrumb: {
                    label: 'Product',
                    pageTitle: 'Product Detail'
                }
            })
            .state('maregistration.variation.update.foodproduct', {
                url: '/foodproduct',
                parent: 'maregistration.variation.update',
                views: {
                    'variationSteps@maregistration.variation.update': {
                        templateUrl: 'app/registration/templates/steps/foodproduct.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Product',
                    pageTitle: 'Food Product Detail'
                }
            })
            .state('maregistration.variation.update.foodproductcontinued', {
                url: '/foodproductcontinued',
                parent: 'maregistration.variation.update',
                views: {
                    'variationSteps@maregistration.variation.update': {
                        templateUrl: 'app/registration/templates/steps/foodproductcontinued.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Product',
                    pageTitle: 'Food Product Detail Cont.'
                }
            })
            .state('maregistration.variation.update.composition', {
                url: '/composition',
                parent: 'maregistration.variation.update',
                views: {
                    'variationSteps@maregistration.variation.update': {
                        templateUrl: 'app/registration/templates/steps/composition.html',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    maId: null,
                },
                ncyBreadcrumb: {
                    label: 'Composition',
                    pageTitle: 'Composition'
                }
            })
            .state('maregistration.variation.update.foodcomposition', {
                url: '/foodcomposition',
                parent: 'maregistration.variation.update',
                views: {
                    'variationSteps@maregistration.variation.update': {
                        templateUrl: 'app/registration/templates/steps/foodcomposition.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Composition',
                    pageTitle: 'Composition'
                }
            })
            .state('maregistration.variation.update.foreignstatus', {
                url: '/foreignstatus',
                parent: 'maregistration.variation.update',
                views: {
                    'variationSteps@maregistration.variation.update': {
                        templateUrl: 'app/registration/templates/steps/foreignstatus.html',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    maId: null,
                },
                ncyBreadcrumb: {
                    label: 'Foreign Status',
                    pageTitle: 'Foreign Application Status'
                }
            })
            .state('maregistration.variation.update.manufacturers', {
                url: '/manufacturers',
                parent: 'maregistration.variation.update',
                views: {
                    'variationSteps@maregistration.variation.update': {
                        templateUrl: 'app/registration/templates/steps/manufacturers.html',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    maId: null,
                },
                ncyBreadcrumb: {
                    label: 'Manufacturers',
                    pageTitle: 'Manufacturing Activity'
                }
            })
            .state('maregistration.variation.update.attachment', {
                url: '/attachment',
                parent: 'maregistration.variation.update',
                views: {
                    'variationSteps@maregistration.variation.update': {
                        templateUrl: 'app/registration/templates/steps/attachment.html',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    maId: null,
                },
                ncyBreadcrumb: {
                    label: 'Attachment',
                    pageTitle: 'Attachment'
                }
            })

        .state('maregistration.variation.update.dossier', {
            url: '/dossier',
            parent: 'maregistration.variation.update',
            views: {
                'variationSteps@maregistration.variation.update': {
                    templateUrl: 'app/registration/templates/steps/dossier.html',
                    controllerAs: 'vm'
                }
            },
            params: {
                maId: null,
            },
            ncyBreadcrumb: {
                label: 'Dossier',
                pageTitle: 'Dossier'
            }
        })

        .state('maregistration.variation.update.checklist', {
                url: '/checklist',
                parent: 'maregistration.variation.update',
                views: {
                    'variationSteps@maregistration.variation.update': {
                        templateUrl: 'app/registration/newApplication/update/templates/checklist.html',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    maId: null,
                },
                ncyBreadcrumb: {
                    label: 'Checklist',
                    pageTitle: 'Checklist'
                }
            })
            .state('maregistration.variation.update.foodTermsConditions', {
                url: '/foodTermsConditions',
                parent: 'maregistration.variation.update',
                views: {
                    'variationSteps@maregistration.variation.update': {
                        templateUrl: 'app/registration/templates/steps/foodTermsConditions.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Terms',
                    pageTitle: 'Terms'
                }
            })
            /*------------------------------------------------------------------------------*/


        //Variation WIP
        .state('maregistration.variation.wip', {
                url: '/wip/:id',
                parent: 'maregistration.variation',
                views: {
                    'variation@maregistration.variation': {
                        templateUrl: 'app/registration/variation/templates/steps.html',
                        controller: 'MAVariationWIPController',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    id: null,
                },
                resolve: {
                    maVariation: function($stateParams, WIPFactory) {
                        // blockUI.start();
                        return WIPFactory.getWIPByID.get({ id: $stateParams.id }).$promise;
                    }
                },
                redirectTo: 'maregistration.variation.wip.general',
                ncyBreadcrumb: {
                    label: 'wip',
                    pageTitle: 'wip'
                }
            })
            .state('maregistration.variation.wip.general', {
                url: '/general',
                parent: 'maregistration.variation.wip',
                views: {
                    'variationSteps@maregistration.variation.wip': {
                        templateUrl: 'app/registration/variation/templates/general.html',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    id: null,
                },
                ncyBreadcrumb: {
                    label: 'General',
                    pageTitle: 'General Information'
                }
            })
            .state('maregistration.variation.wip.product', {
                url: '/products',
                parent: 'maregistration.variation.wip',
                views: {
                    'variationSteps@maregistration.variation.wip': {
                        templateUrl: 'app/registration/templates/steps/product.html',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    id: null,
                },
                ncyBreadcrumb: {
                    label: 'Product',
                    pageTitle: 'Product Detail'
                }
            })
            .state('maregistration.variation.wip.productcontinued', {
                url: '/productcontinued',
                parent: 'maregistration.variation.wip',
                views: {
                    'variationSteps@maregistration.variation.wip': {
                        templateUrl: 'app/registration/templates/steps/productcontinued.html',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    id: null,
                },
                ncyBreadcrumb: {
                    label: 'Product',
                    pageTitle: 'Product Detail'
                }
            })
            .state('maregistration.variation.wip.foodproduct', {
                url: '/foodproduct',
                parent: 'maregistration.variation.wip',
                views: {
                    'variationSteps@maregistration.variation.wip': {
                        templateUrl: 'app/registration/templates/steps/foodproduct.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Product',
                    pageTitle: 'Food Product Detail'
                }
            })
            .state('maregistration.variation.wip.foodproductcontinued', {
                url: '/foodproductcontinued',
                parent: 'maregistration.variation.wip',
                views: {
                    'variationSteps@maregistration.variation.wip': {
                        templateUrl: 'app/registration/templates/steps/foodproductcontinued.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Product',
                    pageTitle: 'Food Product Detail Cont.'
                }
            })
            .state('maregistration.variation.wip.composition', {
                url: '/composition',
                parent: 'maregistration.variation.wip',
                views: {
                    'variationSteps@maregistration.variation.wip': {
                        templateUrl: 'app/registration/templates/steps/composition.html',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    id: null,
                },
                ncyBreadcrumb: {
                    label: 'Composition',
                    pageTitle: 'Composition'
                }
            })
            .state('maregistration.variation.wip.foodcomposition', {
                url: '/foodcomposition',
                parent: 'maregistration.variation.wip',
                views: {
                    'variationSteps@maregistration.variation.wip': {
                        templateUrl: 'app/registration/templates/steps/foodcomposition.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Composition',
                    pageTitle: 'Composition'
                }
            })
            .state('maregistration.variation.wip.foreignstatus', {
                url: '/foreignstatus',
                parent: 'maregistration.variation.wip',
                views: {
                    'variationSteps@maregistration.variation.wip': {
                        templateUrl: 'app/registration/templates/steps/foreignstatus.html',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    id: null,
                },
                ncyBreadcrumb: {
                    label: 'Foreign Status',
                    pageTitle: 'Foreign Application Status'
                }
            })
            .state('maregistration.variation.wip.manufacturers', {
                url: '/manufacturers',
                parent: 'maregistration.variation.wip',
                views: {
                    'variationSteps@maregistration.variation.wip': {
                        templateUrl: 'app/registration/templates/steps/manufacturers.html',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    id: null,
                },
                ncyBreadcrumb: {
                    label: 'Manufacturers',
                    pageTitle: 'Manufacturing Activity'
                }
            })
            .state('maregistration.variation.wip.attachment', {
                url: '/attachment',
                parent: 'maregistration.variation.wip',
                views: {
                    'variationSteps@maregistration.variation.wip': {
                        templateUrl: 'app/registration/templates/steps/attachment.html',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    id: null,
                },
                ncyBreadcrumb: {
                    label: 'Attachment',
                    pageTitle: 'Attachment'
                }
            })

        .state('maregistration.variation.wip.dossier', {
            url: '/dossier',
            parent: 'maregistration.variation.wip',
            views: {
                'variationSteps@maregistration.variation.wip': {
                    templateUrl: 'app/registration/templates/steps/dossier.html',
                    controllerAs: 'vm'
                }
            },
            params: {
                id: null,
            },
            ncyBreadcrumb: {
                label: 'Dossier',
                pageTitle: 'Dossier'
            }
        })

        .state('maregistration.variation.wip.checklist', {
                url: '/checklist',
                parent: 'maregistration.variation.wip',
                views: {
                    'variationSteps@maregistration.variation.wip': {
                        templateUrl: 'app/registration/templates/steps/checklist.html',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    id: null,
                },
                ncyBreadcrumb: {
                    label: 'Checklist',
                    pageTitle: 'Checklist'
                }
            })
            .state('maregistration.variation.wip.termsAndConditions', {
                url: '/terms',
                parent: 'maregistration.variation.wip',
                views: {
                    'variationSteps@maregistration.variation.wip': {
                        templateUrl: 'app/registration/templates/steps/termsConditions.html',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    id: null,
                },
                ncyBreadcrumb: {
                    label: 'Terms',
                    pageTitle: 'Terms'
                }
            })
            .state('maregistration.variation.wip.foodTermsConditions', {
                url: '/foodTermsConditions',
                parent: 'maregistration.variation.wip',
                views: {
                    'variationSteps@maregistration.variation.wip': {
                        templateUrl: 'app/registration/templates/steps/foodTermsConditions.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Terms',
                    pageTitle: 'Terms'
                }
            });
        /*------------------------------------------------------------------------------*/


    }
})();