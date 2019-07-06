/**
 * Created by abenitrust on 5/22/17.
 */
(function() {
    'use strict';

    angular
        .module('pdx')
        .config(publicConfig);

    /** @ngInject */
    function publicConfig($stateProvider) {
        $stateProvider
            .state('public', {
                url: '/public',
                views: {
                    'appContainer': {
                        templateUrl: 'app/public/view/public.html',
                        controller: 'PublicController',
                        controllerAs: 'vm'
                    }
                },
                redirectTo: 'publicHome',
                ncyBreadcrumb: {
                    label: 'Public',
                    pageTitle: 'Public'
                }
            })
            .state('registration', {
                url: '/registration',
                parent: 'public',
                views: {
                    'publicView@public': {
                        templateUrl: 'app/public/view/registration.html'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Public',
                    pageTitle: 'Public'
                }
            })
            .state('publicHome', {
                url: '/home',
                parent: 'public',
                views: {
                    'publicView@public': {
                        templateUrl: 'app/public/view/home.html'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Public',
                    pageTitle: 'Public'
                }
            })
            .state('products', {
                url: '/products',
                parent: 'public',
                views: {
                    'publicView@public': {
                        templateUrl: 'app/public/view/products.html',
                        controller: 'ProductListController',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Public',
                    pageTitle: 'Public'
                }
            })
            .state('product_detail', {
                url: '/product_detail/:id',
                parent: 'public',
                views: {
                    'publicView@public': {
                        templateUrl: 'app/public/view/detail/product.detail.html',
                        controller: 'ProductDetailController',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Public',
                    pageTitle: 'Public'
                }
            })
            .state('applicants', {
                url: '/applicants',
                parent: 'public',
                views: {
                    'publicView@public': {
                        templateUrl: 'app/public/view/applicants.html',
                        controller: 'ApplicantsListController',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Public',
                    pageTitle: 'Public'
                }
            })
            .state('applicant_detail', {
                url: '/applicant_detail/:id',
                parent: 'public',
                views: {
                    'publicView@public': {
                        templateUrl: 'app/public/view/detail/applicant.detail.html',
                        controller: 'ApplicantDetailController',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Public',
                    pageTitle: 'Public'
                }
            })
            .state('suspended_products', {
                url: '/suspended_products',
                parent: 'public',
                views: {
                    'publicView@public': {
                        templateUrl: 'app/public/view/suspended_products.html',
                        controller: 'SuspendedProductListController',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Public',
                    pageTitle: 'Public'
                }
            })
            .state('canceled_products', {
                url: '/canceled_products',
                parent: 'public',
                views: {
                    'publicView@public': {
                        templateUrl: 'app/public/view/canceled_products.html',
                        controller: 'CanceledProductListController',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Public',
                    pageTitle: 'Public'
                }
            })
            .state('about', {
                url: '/about',
                parent: 'public',
                views: {
                    'publicView@public': {
                        templateUrl: 'app/public/view/about.html'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Public',
                    pageTitle: 'Public'
                }
            })
            .state('contactAs', {
                url: '/contactAs',
                parent: 'public',
                views: {
                    'publicView@public': {
                        templateUrl: 'app/public/view/contact.html'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Public',
                    pageTitle: 'Public'
                }
            })
    }

})();