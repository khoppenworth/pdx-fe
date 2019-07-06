(function(angular) {
    'use strict';

    angular
        .module('pdx')
        .config(newApplicationRouterConfig);

    function newApplicationRouterConfig($stateProvider, registrationRouteProvider) {
        $stateProvider
            .state('maregistration.variation.new.deviceProduct', registrationRouteProvider.getState('deviceProduct', 'new', 'variation'))
            .state('maregistration.variation.update.deviceProduct', registrationRouteProvider.getState('deviceProduct', 'update', 'variation'))
            .state('maregistration.variation.wip.deviceProduct', registrationRouteProvider.getState('deviceProduct', 'wip', 'variation'))
            .state('maregistration.variation.new.deviceProductContinued', registrationRouteProvider.getState('deviceProductContinued', 'new', 'variation'))
            .state('maregistration.variation.update.deviceProductContinued', registrationRouteProvider.getState('deviceProductContinued', 'update', 'variation'))
            .state('maregistration.variation.wip.deviceProductContinued', registrationRouteProvider.getState('deviceProductContinued', 'wip', 'variation'))
            .state('maregistration.variation.new.deviceComposition', registrationRouteProvider.getState('deviceComposition', 'new', 'variation'))
            .state('maregistration.variation.update.deviceComposition', registrationRouteProvider.getState('deviceComposition', 'update', 'variation'))
            .state('maregistration.variation.wip.deviceComposition', registrationRouteProvider.getState('deviceComposition', 'wip', 'variation'))
            .state('maregistration.variation.new.deviceTermsConditions', registrationRouteProvider.getState('deviceTermsConditions', 'new', 'variation'))
            .state('maregistration.variation.update.deviceTermsConditions', registrationRouteProvider.getState('deviceTermsConditions', 'update', 'variation'))
            .state('maregistration.variation.wip.deviceTermsConditions', registrationRouteProvider.getState('deviceTermsConditions', 'wip', 'variation'));

    }
})(window.angular);