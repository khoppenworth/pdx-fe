(function() {
    'use strict';

    angular
        .module('pdx')
        .config(newApplicationRouterConfig);

    function newApplicationRouterConfig($stateProvider, registrationRouteProvider) {
        $stateProvider
            .state('maregistration.newApplication.new.deviceProduct', registrationRouteProvider.getState('deviceProduct', 'new', 'newApplication'))
            .state('maregistration.newApplication.update.deviceProduct', registrationRouteProvider.getState('deviceProduct', 'update', 'newApplication'))
            .state('maregistration.newApplication.wip.deviceProduct', registrationRouteProvider.getState('deviceProduct', 'wip', 'newApplication'))
            .state('maregistration.newApplication.new.deviceProductContinued', registrationRouteProvider.getState('deviceProductContinued', 'new', 'newApplication'))
            .state('maregistration.newApplication.update.deviceProductContinued', registrationRouteProvider.getState('deviceProductContinued', 'update', 'newApplication'))
            .state('maregistration.newApplication.wip.deviceProductContinued', registrationRouteProvider.getState('deviceProductContinued', 'wip', 'newApplication'))
            .state('maregistration.newApplication.new.deviceComposition', registrationRouteProvider.getState('deviceComposition', 'new', 'newApplication'))
            .state('maregistration.newApplication.update.deviceComposition', registrationRouteProvider.getState('deviceComposition', 'update', 'newApplication'))
            .state('maregistration.newApplication.wip.deviceComposition', registrationRouteProvider.getState('deviceComposition', 'wip', 'newApplication'))
            .state('maregistration.newApplication.new.deviceTermsConditions', registrationRouteProvider.getState('deviceTermsConditions', 'new', 'newApplication'))
            .state('maregistration.newApplication.update.deviceTermsConditions', registrationRouteProvider.getState('deviceTermsConditions', 'update', 'newApplication'))
            .state('maregistration.newApplication.wip.deviceTermsConditions', registrationRouteProvider.getState('deviceTermsConditions', 'wip', 'newApplication'));
    }
})();