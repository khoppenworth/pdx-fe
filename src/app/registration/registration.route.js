(function() {
    'use strict';

    angular
        .module('pdx')
        .config(registrationRouterConfig);

    /** @ngInject */
    function registrationRouterConfig($stateProvider) {

        $stateProvider
            .state('maregistration', {
                url: '/registration',
                parent: 'app',
                views: {
                    'contentContainer@app': {
                        templateUrl: 'app/registration/registration.html'
                    }
                },
                redirectTo: 'maregistration.list',
                ncyBreadcrumb: {
                    label: 'Registration',
                    pageTitle: 'Product Registration'
                }
            })
            .state('maregistration.list', {
                url: '/list',
                parent: 'maregistration',
                views: {
                    'registrationApp@maregistration': {
                        templateUrl: 'app/registration/list/list.html',
                        controller: 'MAListController',
                        controllerAs: 'vm'
                    }
                },

                ncyBreadcrumb: {
                    label: 'Registration',
                    pageTitle: 'Product Registration'
                }
            })
            .state('maregistration.list.info', {
                url: '/info/:maId',
                parent: 'maregistration.list',
                views: {
                    'registrationApp@maregistration': {
                        templateUrl: 'app/registration/list/detail/detail.html',
                        controller: 'MADetailController',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    maId: null,
                    currentMAID: null,
                    previousMAID: null
                },
                ncyBreadcrumb: {
                    label: 'Detail',
                    pageTitle: 'Product Registration'
                }
            })
            //PreScreening
            .state('maregistration.prescreen', {
                url: '/prescreen/:maId',
                parent: 'maregistration',
                views: {
                    'registrationApp@maregistration': {
                        templateUrl: 'app/registration/workflow/prescreen/prescreen.html',
                        controller: 'PreScreenController',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    maId: null,
                },
                ncyBreadcrumb: {
                    label: 'Prescreen',
                    pageTitle: 'Prescreen'
                }
            })
            //PreScreening
            .state('maregistration.assessment', {
                url: '/assessment/:maId/:submoduleCode',
                parent: 'maregistration',
                views: {
                    'registrationApp@maregistration': {
                        templateUrl: 'app/registration/workflow/assessment/assessment.html',
                        controller: 'AssessmentController',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    maId: null,
                    submoduleCode: null
                },
                ncyBreadcrumb: {
                    label: 'Assessment',
                    pageTitle: 'Assessment'
                }
            })
            // Review
            .state('maregistration.review', {
                url: '/maassessment/review/:maId/:submoduleCode/:submoduleTypeCode',
                parent: 'maregistration',
                views: {
                    'registrationApp@maregistration': {
                        templateUrl: 'app/registration/workflow/assessment/review.html',
                        controller: 'ReviewerController',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    maId: null,
                    submoduleCode: null,
                    firCommentHtml: ""
                },
                ncyBreadcrumb: {
                    label: 'Review',
                    pageTitle: 'Review'
                }
            })

        //MA NewApplication
        .state('maregistration.newApplication', {
            url: '/newapplication',
            parent: 'maregistration',
            views: {
                'registrationApp@maregistration': {
                    templateUrl: 'app/registration/newApplication/newapplication.html',
                    controller: 'MANewApplicationController',
                    controllerAs: 'vm'
                }
            },
            redirectTo: 'maregistration.newApplication.new',
            ncyBreadcrumb: {
                label: 'New Application',
                pageTitle: 'New Application'
            }
        })

        //Ma Renewal
        .state('maregistration.renewal', {
            url: '/renewal',
            parent: 'maregistration',
            views: {
                'registrationApp@maregistration': {
                    templateUrl: 'app/registration/renewal/renewal.html',
                    controller: 'MARenewalController',
                    controllerAs: 'vm'
                }
            },
            redirectTo: 'maregistration.renewal.new',
            ncyBreadcrumb: {
                label: 'Renewal',
                pageTitle: 'Renewal'
            }
        })

        //MA Variation
        .state('maregistration.variation', {
            url: '/variation',
            parent: 'maregistration',
            views: {
                'registrationApp@maregistration': {
                    templateUrl: 'app/registration/variation/variation.html',
                    controller: 'MAVariationController',
                    controllerAs: 'vm'
                }
            },
            redirectTo: 'maregistration.variation.variationInformation',
            ncyBreadcrumb: {
                label: 'Product Variation',
                pageTitle: 'Product Variation'
            }
        })

        //MA myProducts by agent [product registered by agent]
        .state('maregistration.products', {
            url: '/products',
            parent: 'maregistration',
            views: {
                'registrationApp@maregistration': {
                    templateUrl: 'app/registration/myproducts/myproducts.html',
                    controller: 'MyProductListController',
                    controllerAs: 'vm'
                }
            },
            ncyBreadcrumb: {
                label: 'Agent Product',
                pageTitle: 'Agent Product'
            }
        })

        .state('maregistration.products.detail', {
            url: '/products/detail/:id',
            parent: 'maregistration.products',
            views: {
                'registrationApp@maregistration': {
                    templateUrl: 'app/registration/myproducts/detail/myproduct.detail.html',
                    controller: 'MyProductDetailController',
                    controllerAs: 'vm'
                }
            },
            ncyBreadcrumb: {
                label: 'Product Detail',
                pageTitle: 'Product Detail'
            }
        })
    }
})();