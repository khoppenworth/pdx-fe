(function(angular) {
    'use strict';

    angular
        .module('pdx')
        .config(newApplicationRouterConfig);

    function newApplicationRouterConfig($stateProvider, registrationRouteProvider) {
        $stateProvider
            .state('maregistration.renewal.new.deviceProduct', registrationRouteProvider.getState('deviceProduct', 'new', 'renewal'))
            .state('maregistration.renewal.update.deviceProduct', registrationRouteProvider.getState('deviceProduct', 'update', 'renewal'))
            .state('maregistration.renewal.wip.deviceProduct', registrationRouteProvider.getState('deviceProduct', 'wip', 'renewal'))
            .state('maregistration.renewal.new.deviceProductContinued', registrationRouteProvider.getState('deviceProductContinued', 'new', 'renewal'))
            .state('maregistration.renewal.update.deviceProductContinued', registrationRouteProvider.getState('deviceProductContinued', 'update', 'renewal'))
            .state('maregistration.renewal.wip.deviceProductContinued', registrationRouteProvider.getState('deviceProductContinued', 'wip', 'renewal'))
            .state('maregistration.renewal.new.deviceComposition', registrationRouteProvider.getState('deviceComposition', 'new', 'renewal'))
            .state('maregistration.renewal.update.deviceComposition', registrationRouteProvider.getState('deviceComposition', 'update', 'renewal'))
            .state('maregistration.renewal.wip.deviceComposition', registrationRouteProvider.getState('deviceComposition', 'wip', 'renewal'))
            .state('maregistration.renewal.new.deviceTermsConditions', registrationRouteProvider.getState('deviceTermsConditions', 'new', 'renewal'))
            .state('maregistration.renewal.update.deviceTermsConditions', registrationRouteProvider.getState('deviceTermsConditions', 'update', 'renewal'))
            .state('maregistration.renewal.wip.deviceTermsConditions', registrationRouteProvider.getState('deviceTermsConditions', 'wip', 'renewal'));

    }
})(window.angular);