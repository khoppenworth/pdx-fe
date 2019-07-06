(function() {
    'use strict';

    angular
        .module('pdx')
        .config(newApplicationRouterConfig);

    /** @ngInject */
    function newApplicationRouterConfig($stateProvider) {

        $stateProvider
        /*
         * New route
         * */
            .state('maregistration.newApplication.new', {
                url: '/new',
                parent: 'maregistration.newApplication',
                views: {
                    'newApplication@maregistration.newApplication': {
                        templateUrl: 'app/registration/newApplication/templates/steps.html',
                        controller: 'MANewController',
                        controllerAs: 'vm'
                    }
                },
                redirectTo: 'maregistration.newApplication.new.general',
                ncyBreadcrumb: {
                    label: 'New',
                    pageTitle: 'New'
                }
            })
            .state('maregistration.newApplication.new.general', {
                url: '/general',
                parent: 'maregistration.newApplication.new',
                views: {
                    'newSteps@maregistration.newApplication.new': {
                        templateUrl: 'app/registration/templates/steps/general.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'General',
                    pageTitle: 'General Information'
                }
            })
            .state('maregistration.newApplication.new.product', {
                url: '/products',
                parent: 'maregistration.newApplication.new',
                views: {
                    'newSteps@maregistration.newApplication.new': {
                        templateUrl: 'app/registration/templates/steps/product.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Product',
                    pageTitle: 'Product Detail'
                }
            })
            .state('maregistration.newApplication.new.foodproduct', {
                url: '/foodproduct',
                parent: 'maregistration.newApplication.new',
                views: {
                    'newSteps@maregistration.newApplication.new': {
                        templateUrl: 'app/registration/templates/steps/foodproduct.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Product',
                    pageTitle: 'Product Detail'
                }
            })
            .state('maregistration.newApplication.new.productcontinued', {
                url: '/productcontinued',
                parent: 'maregistration.newApplication.new',
                views: {
                    'newSteps@maregistration.newApplication.new': {
                        templateUrl: 'app/registration/templates/steps/productcontinued.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Product',
                    pageTitle: 'Product Detail'
                }
            })
            .state('maregistration.newApplication.new.foodproductcontinued', {
                url: '/foodproductcontinued',
                parent: 'maregistration.newApplication.new',
                views: {
                    'newSteps@maregistration.newApplication.new': {
                        templateUrl: 'app/registration/templates/steps/foodproductcontinued.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Product',
                    pageTitle: 'Product Detail'
                }
            })
            .state('maregistration.newApplication.new.composition', {
                url: '/composition',
                parent: 'maregistration.newApplication.new',
                views: {
                    'newSteps@maregistration.newApplication.new': {
                        templateUrl: 'app/registration/templates/steps/composition.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Composition',
                    pageTitle: 'Composition'
                }
            })
            .state('maregistration.newApplication.new.foodcomposition', {
                url: '/foodcomposition',
                parent: 'maregistration.newApplication.new',
                views: {
                    'newSteps@maregistration.newApplication.new': {
                        templateUrl: 'app/registration/templates/steps/foodcomposition.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Composition',
                    pageTitle: 'Composition'
                }
            })
            .state('maregistration.newApplication.new.foreignstatus', {
                url: '/foreignstatus',
                parent: 'maregistration.newApplication.new',
                views: {
                    'newSteps@maregistration.newApplication.new': {
                        templateUrl: 'app/registration/templates/steps/foreignstatus.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Foreign Status',
                    pageTitle: 'Foreign Application Status'
                }
            })
            .state('maregistration.newApplication.new.manufacturers', {
                url: '/manufacturers',
                parent: 'maregistration.newApplication.new',
                views: {
                    'newSteps@maregistration.newApplication.new': {
                        templateUrl: 'app/registration/templates/steps/manufacturers.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Manufacturers',
                    pageTitle: 'Manufacturing Activity'
                }
            })
            .state('maregistration.newApplication.new.attachment', {
                url: '/attachment',
                parent: 'maregistration.newApplication.new',
                views: {
                    'newSteps@maregistration.newApplication.new': {
                        templateUrl: 'app/registration/templates/steps/attachment.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Attachment',
                    pageTitle: 'Attachment'
                }
            })
            .state('maregistration.newApplication.new.dossier', {
                url: '/dossier',
                parent: 'maregistration.newApplication.new',
                views: {
                    'newSteps@maregistration.newApplication.new': {
                        templateUrl: 'app/registration/templates/steps/dossier.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Dossier',
                    pageTitle: 'Dossier'
                }
            })
            .state('maregistration.newApplication.new.checklist', {
                url: '/checklist',
                parent: 'maregistration.newApplication.new',
                views: {
                    'newSteps@maregistration.newApplication.new': {
                        templateUrl: 'app/registration/templates/steps/checklist.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Checklist',
                    pageTitle: 'Checklist'
                }
            })
            .state('maregistration.newApplication.new.termsAndConditions', {
                url: '/termsandconditions',
                parent: 'maregistration.newApplication.new',
                views: {
                    'newSteps@maregistration.newApplication.new': {
                        templateUrl: 'app/registration/templates/steps/termsConditions.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Terms',
                    pageTitle: 'Terms'
                }
            })
            .state('maregistration.newApplication.new.foodTermsConditions', {
                url: '/foodTermsConditions',
                parent: 'maregistration.newApplication.new',
                views: {
                    'newSteps@maregistration.newApplication.new': {
                        templateUrl: 'app/registration/templates/steps/foodTermsConditions.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Terms',
                    pageTitle: 'Terms'
                }
            })

        /*
         * Update route
         * */
        .state('maregistration.newApplication.update', {
                url: '/update/:maId',
                parent: 'maregistration.newApplication',
                views: {
                    'newApplication@maregistration.newApplication': {
                        templateUrl: 'app/registration/newApplication/templates/steps.html',
                        controller: 'MAUpdateController',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    maId: null,
                },
                resolve: {
                    maRegistration: function($stateParams, MAFactory) {
                        // blockUI.start();
                        return MAFactory.maSingle.get({ maId: $stateParams.maId }).$promise.then(function(response) {
                            return response.result;
                        });
                    }
                },
                redirectTo: 'maregistration.newApplication.update.general',
                ncyBreadcrumb: {
                    label: 'Update',
                    pageTitle: 'Update'
                }
            })
            .state('maregistration.newApplication.update.general', {
                url: '/general',
                parent: 'maregistration.newApplication.update',
                views: {
                    'newSteps@maregistration.newApplication.update': {
                        templateUrl: 'app/registration/templates/steps/general.html',
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
            .state('maregistration.newApplication.update.product', {
                url: '/products',
                parent: 'maregistration.newApplication.update',
                views: {
                    'newSteps@maregistration.newApplication.update': {
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
            .state('maregistration.newApplication.update.foodproduct', {
              url: '/foodproduct',
              parent: 'maregistration.newApplication.update',
              views: {
                'newSteps@maregistration.newApplication.update': {
                  templateUrl: 'app/registration/templates/steps/foodproduct.html',
                  controllerAs: 'vm'
                }
              },
              ncyBreadcrumb: {
                label: 'Product',
                pageTitle: 'Product Detail'
              }
            })
            .state('maregistration.newApplication.update.productcontinued', {
                url: '/productcontinued',
                parent: 'maregistration.newApplication.update',
                views: {
                    'newSteps@maregistration.newApplication.update': {
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
            .state('maregistration.newApplication.update.foodproductcontinued', {
              url: '/foodproductcontinued',
              parent: 'maregistration.newApplication.update',
              views: {
                'newSteps@maregistration.newApplication.update': {
                  templateUrl: 'app/registration/templates/steps/foodproductcontinued.html',
                  controllerAs: 'vm'
                }
              },
              ncyBreadcrumb: {
                label: 'Product',
                pageTitle: 'Product Detail'
              }
            })
            .state('maregistration.newApplication.update.composition', {
                url: '/composition',
                parent: 'maregistration.newApplication.update',
                views: {
                    'newSteps@maregistration.newApplication.update': {
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
            .state('maregistration.newApplication.update.foodcomposition', {
              url: '/foodcomposition',
              parent: 'maregistration.newApplication.update',
              views: {
                'newSteps@maregistration.newApplication.update': {
                  templateUrl: 'app/registration/templates/steps/foodcomposition.html',
                  controllerAs: 'vm'
                }
              },
              ncyBreadcrumb: {
                label: 'Composition',
                pageTitle: 'Composition'
              }
            })
            .state('maregistration.newApplication.update.foreignstatus', {
                url: '/foreignstatus',
                parent: 'maregistration.newApplication.update',
                views: {
                    'newSteps@maregistration.newApplication.update': {
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
            .state('maregistration.newApplication.update.manufacturers', {
                url: '/manufacturers',
                parent: 'maregistration.newApplication.update',
                views: {
                    'newSteps@maregistration.newApplication.update': {
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
            .state('maregistration.newApplication.update.attachment', {
                url: '/attachment',
                parent: 'maregistration.newApplication.update',
                views: {
                    'newSteps@maregistration.newApplication.update': {
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
            .state('maregistration.newApplication.update.dossier', {
                url: '/dossier',
                parent: 'maregistration.newApplication.update',
                views: {
                    'newSteps@maregistration.newApplication.update': {
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
            .state('maregistration.newApplication.update.checklist', {
                url: '/checklist',
                parent: 'maregistration.newApplication.update',
                views: {
                    'newSteps@maregistration.newApplication.update': {
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

        /*
         * Wip route
         * */
        .state('maregistration.newApplication.wip', {
                url: '/wip/:id',
                parent: 'maregistration.newApplication',
                views: {
                    'newApplication@maregistration.newApplication': {
                        templateUrl: 'app/registration/newApplication/templates/steps.html',
                        controller: 'MANewWIPApplicationController',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    id: null,
                },
                redirectTo: 'maregistration.newApplication.wip.general',
                ncyBreadcrumb: {
                    label: 'New Application Draft',
                    pageTitle: 'New Application Draft'
                }
            })
            .state('maregistration.newApplication.wip.general', {
                url: '/general',
                parent: 'maregistration.newApplication.wip',
                views: {
                    'newSteps@maregistration.newApplication.wip': {
                        templateUrl: 'app/registration/templates/steps/general.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'General',
                    pageTitle: 'General Information'
                }
            })
            .state('maregistration.newApplication.wip.product', {
                url: '/products',
                parent: 'maregistration.newApplication.wip',
                views: {
                    'newSteps@maregistration.newApplication.wip': {
                        templateUrl: 'app/registration/templates/steps/product.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Product',
                    pageTitle: 'Product Detail'
                }
            })
            .state('maregistration.newApplication.wip.foodproduct', {
                url: '/foodproduct',
                parent: 'maregistration.newApplication.wip',
                views: {
                    'newSteps@maregistration.newApplication.wip': {
                        templateUrl: 'app/registration/templates/steps/foodproduct.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Product',
                    pageTitle: 'Product Detail'
                }
            })
            .state('maregistration.newApplication.wip.productcontinued', {
                url: '/productcontinued',
                parent: 'maregistration.newApplication.wip',
                views: {
                    'newSteps@maregistration.newApplication.wip': {
                        templateUrl: 'app/registration/templates/steps/productcontinued.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Product',
                    pageTitle: 'Product Detail'
                }
            })
            .state('maregistration.newApplication.wip.foodproductcontinued', {
                url: '/foodproductcontinued',
                parent: 'maregistration.newApplication.wip',
                views: {
                    'newSteps@maregistration.newApplication.wip': {
                        templateUrl: 'app/registration/templates/steps/foodproductcontinued.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Product',
                    pageTitle: 'Product Detail'
                }
            })
            .state('maregistration.newApplication.wip.composition', {
                url: '/composition',
                parent: 'maregistration.newApplication.wip',
                views: {
                    'newSteps@maregistration.newApplication.wip': {
                        templateUrl: 'app/registration/templates/steps/composition.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Composition',
                    pageTitle: 'Composition'
                }
            })
            .state('maregistration.newApplication.wip.foodcomposition', {
                url: '/foodcomposition',
                parent: 'maregistration.newApplication.wip',
                views: {
                    'newSteps@maregistration.newApplication.wip': {
                        templateUrl: 'app/registration/templates/steps/foodcomposition.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Composition',
                    pageTitle: 'Composition'
                }
            })
            .state('maregistration.newApplication.wip.foreignstatus', {
                url: '/foreignstatus',
                parent: 'maregistration.newApplication.wip',
                views: {
                    'newSteps@maregistration.newApplication.wip': {
                        templateUrl: 'app/registration/templates/steps/foreignstatus.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Foreign Status',
                    pageTitle: 'Foreign Application Status'
                }
            })
            .state('maregistration.newApplication.wip.manufacturers', {
                url: '/manufacturers',
                parent: 'maregistration.newApplication.wip',
                views: {
                    'newSteps@maregistration.newApplication.wip': {
                        templateUrl: 'app/registration/templates/steps/manufacturers.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Manufacturers',
                    pageTitle: 'Manufacturing Activity'
                }
            })
            .state('maregistration.newApplication.wip.attachment', {
                url: '/attachment',
                parent: 'maregistration.newApplication.wip',
                views: {
                    'newSteps@maregistration.newApplication.wip': {
                        templateUrl: 'app/registration/templates/steps/attachment.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Attachment',
                    pageTitle: 'Attachment'
                }
            })
            .state('maregistration.newApplication.wip.dossier', {
                url: '/dossier',
                parent: 'maregistration.newApplication.wip',
                views: {
                    'newSteps@maregistration.newApplication.wip': {
                        templateUrl: 'app/registration/templates/steps/dossier.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Dossier',
                    pageTitle: 'Dossier'
                }
            })
            .state('maregistration.newApplication.wip.checklist', {
                url: '/checklist',
                parent: 'maregistration.newApplication.wip',
                views: {
                    'newSteps@maregistration.newApplication.wip': {
                        templateUrl: 'app/registration/templates/steps/checklist.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Checklist',
                    pageTitle: 'Checklist'
                }
            })
            .state('maregistration.newApplication.wip.termsAndConditions', {
                url: '/termsandconditions',
                parent: 'maregistration.newApplication.wip',
                views: {
                    'newSteps@maregistration.newApplication.wip': {
                        templateUrl: 'app/registration/templates/steps/termsConditions.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Terms',
                    pageTitle: 'Terms'
                }
            })
            .state('maregistration.newApplication.wip.foodTermsConditions', {
                url: '/foodTermsConditions',
                parent: 'maregistration.newApplication.wip',
                views: {
                    'newSteps@maregistration.newApplication.wip': {
                        templateUrl: 'app/registration/templates/steps/foodTermsConditions.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Terms',
                    pageTitle: 'Terms'
                }
            });


    }
})();