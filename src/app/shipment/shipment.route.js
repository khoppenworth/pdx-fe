(function() {
    'use strict';

    angular
        .module('pdx')
        .config(shipmentRouterConfig);

    /** @ngInject */
    function shipmentRouterConfig($stateProvider) {

        $stateProvider.state('shipment', {
                url: '/portclearance',
                parent: 'app',
                views: {
                    'contentContainer@app': {
                        templateUrl: 'app/shipment/shipment.html',
                        controller: 'ShipmentController',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Shipment',
                    pageTitle: 'Shipment'
                }
            })
            .state('shipment.list', {
                url: '/list',
                parent: 'shipment',
                views: {
                    'shipmentApp@shipment': {
                        templateUrl: 'app/shipment/list/list.html',
                        controller: 'ShipmentListController',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Shipment',
                    pageTitle: 'Shipment List'
                }
            })
            .state('shipment.list.info', {
                url: '/info/:shipmentId',
                parent: 'shipment.list',
                views: {
                    'shipmentApp@shipment': {
                        templateUrl: 'app/shipment/list/detail/detail.html',
                        controller: 'ShipmentDetailController',
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
            .state('shipment.new', {
                url: '/new',
                parent: 'shipment',
                views: {
                    'shipmentApp@shipment': {
                        templateUrl: 'app/shipment/new/new.html',
                        controller: 'ShipmentNewController',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'NewShipment',
                    pageTitle: 'New Shipment'
                }
            })
            .state('shipment.new.registered', {
                url: '/registered',
                parent: 'shipment.new',
                views: {
                    'shipmentSteps@shipment.new': {
                        templateUrl: 'app/shipment/new/templates/registered.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Registered',
                    pageTitle: 'Registered Shipment'
                }
            })
            .state('shipment.new.general', {
                url: '/general',
                parent: 'shipment.new',
                views: {
                    'shipmentSteps@shipment.new': {
                        templateUrl: 'app/shipment/new/templates/general.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'General',
                    pageTitle: 'General Information'
                }
            })
            .state('shipment.new.detail', {
                url: '/detail',
                parent: 'shipment.new',
                views: {
                    'shipmentSteps@shipment.new': {
                        templateUrl: 'app/shipment/new/templates/detail.html',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Detail',
                    pageTitle: 'Detail Information'
                }
            })

    }
})();