(function() {
    'use strict';

    angular
        .module('pdx')
        .config(supplierRouterConfig);

    /** @ngInject */
    function supplierRouterConfig($stateProvider) {
        $stateProvider
            .state('supplier', {
                url: '/supplier',
                parent: 'app',
                views: {
                    'contentContainer@app': {
                        templateUrl: 'app/supplier/supplier.html'
                    }
                },
                redirectTo: 'supplier.list',
                ncyBreadcrumb: {
                    label: 'License Holders',
                    pageTitle: 'License Holder'
                }
            })
            .state('supplier.list', {
                url: '/list',
                parent: 'supplier',
                views: {
                    'supplierList@supplier': {
                        templateUrl: 'app/supplier/list/list.html',
                        controller: 'SupplierListController',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'License Holders',
                    pageTitle: 'License Holder List'
                }
            })
            .state('supplier.detail', {
                url: '/detail/:id',
                parent: 'supplier',
                views: {
                    'supplierList@supplier': {
                        templateUrl: 'app/supplier/detail/detail.html',
                        controller: 'SupplierDetailController',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Detail',
                    pageTitle: 'License Holder Detail'
                }
            });
    }

})();
