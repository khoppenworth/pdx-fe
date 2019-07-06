(function() {
    'use strict';

    angular
        .module('pdx')
        .config(supplierRouterConfig);

    /** @ngInject */
    function supplierRouterConfig($stateProvider) {
        $stateProvider
            .state('agent', {
                url: '/agent',
                parent: 'app',
                views: {
                    'contentContainer@app': {
                        templateUrl: 'app/agent/agent.html'
                    }
                },
                redirectTo: 'agent.list',
                ncyBreadcrumb: {
                    label: 'Applicants',
                    pageTitle: 'Applicants'
                }
            })
            .state('agent.list', {
                url: '/list',
                parent: 'agent',
                views: {
                    'agentList@agent': {
                        templateUrl: 'app/agent/list/list.html',
                        controller: 'AgentListController',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'List',
                    pageTitle: 'Applicant List'
                }
            })
            .state('agent.detail', {
                url: '/agent/:id',
                parent: 'agent',
                views: {
                    'agentList@agent': {
                        templateUrl: 'app/agent/detail/detail.html',
                        controller: 'AgentDetailController',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Detail',
                    pageTitle: 'Applicant Detail'
                }
            });
    }

})();
