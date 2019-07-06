/**
 * Created by abenitrust on 7/5/17.
 */
(function() {
    'use strict';

    angular
        .module('pdx')
        .config(changelogRouterConfig);

    function changelogRouterConfig($stateProvider) {
        $stateProvider

        //ChangeLog
            .state('changelog', {
                url: '/changelog',
                parent: 'miscellaneous',
                views: {
                    'miscellaneousContent@miscellaneous': {
                        templateUrl: 'app/miscellaneous/changelog/changelog.html',
                    },
                },
                redirectTo: 'changelog.list',
                ncyBreadcrumb: {
                    label: 'Changelog',
                    pageTitle: 'Changelog'
                }
            })
            .state('changelog.list', {
                url: '/list',
                parent: 'changelog',
                views: {
                    'changelogContent@changelog': {
                        templateUrl: 'app/miscellaneous/changelog/list/changelog_list.html',
                        controller: 'ChangelogListController',
                        controllerAs: 'vm'
                    },
                },
                ncyBreadcrumb: {
                    label: 'List',
                    pageTitle: 'Changelogs'
                }


            })
            .state('changelog.new', {
                url: '/new',
                parent: 'changelog',
                views: {
                    'changelogContent@changelog': {
                        templateUrl: 'app/miscellaneous/changelog/new/changelog_new.html',
                        controller: 'ChangelogNewController',
                        controllerAs: 'vm'
                    },
                },
                ncyBreadcrumb: {
                    label: 'Add',
                    pageTitle: 'Add Changelog'
                }
            })

        //Resources
        .state('resources', {
            url: '/resources',
            parent: 'miscellaneous',
            views: {
                'miscellaneousContent@miscellaneous': {
                    templateUrl: 'app/miscellaneous/resources/resources.html',
                    controller: 'ResourcesController',
                    controllerAs: 'vm'
                },
            },
            ncyBreadcrumb: {
                label: 'Resources',
                pageTitle: 'Resources'
            }
        });

    }

})();