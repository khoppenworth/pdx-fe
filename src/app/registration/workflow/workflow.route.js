(function() {
    'use strict';

    angular
        .module('pdx')
        .config(workflowRouterConfig);

    /** @ngInject */
    function workflowRouterConfig($stateProvider) {

        $stateProvider
            .state('maregistration.prescreen.prescreen', {
                url: '/checklist',
                parent: 'maregistration.prescreen',
                views: {
                    'prescreenSteps@maregistration.prescreen': {
                        templateUrl: 'app/registration/workflow/prescreen/checklist.html',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    maId: null,
                },
                ncyBreadcrumb: {
                    label: 'New',
                    pageTitle: 'New'
                }
            })
            .state('maregistration.prescreen.verification', {
                url: '/verify',
                parent: 'maregistration.prescreen',
                views: {
                    'prescreenSteps@maregistration.prescreen': {
                        templateUrl: 'app/registration/workflow/prescreen/verification.html',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    maId: null,
                },
                ncyBreadcrumb: {
                    label: 'New',
                    pageTitle: 'New'
                }
            });
    }
})();
