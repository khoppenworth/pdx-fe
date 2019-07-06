(function() {
    'use strict';

    angular
        .module('pdx')
        .config(reportRouteConfig);

    /** @ngInject */
    function reportRouteConfig($stateProvider) {
        $stateProvider
            .state('reports', {
                url: '/reports',
                parent: 'app',
                views: {
                    'contentContainer@app': {
                        templateUrl: 'app/report/report_parent.html',
                        controller: 'ReportsController',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Reports',
                    pageTitle: 'Reports'
                },
                resolve: {
                    reportList: function(ReportFactory, AccountService) {
                        var user = AccountService.userInfo();
                        return ReportFactory.tabularReports.query({ userID: user.id }).$promise;
                    }
                }
            })
            .state('reports.reportsDetail', {
                url: '/:reportID',
                parent: 'reports',
                views: {
                    'contentContainer@app': {
                        templateUrl: 'app/report/report.html',
                        controller: 'ReportController',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Report',
                    pageTitle: 'Report'
                }
            })
            .state('report', {
                url: '/report',
                parent: 'settings',
                views: {
                    'adminApp@settings': {
                        templateUrl: 'app/report/management/report.html'
                    }
                },
                redirectTo: 'report.list',
                ncyBreadcrumb: {
                    label: 'Report',
                    pageTitle: 'Report'
                }
            })
            .state('report.list', {
                url: '/list',
                parent: 'report',
                views: {
                    'reportManagement@report': {
                        templateUrl: 'app/report/management/report.list.html',
                        controller: 'ReportListController',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'List',
                    pageTitle: 'Report List'
                }
            })
            .state('report.new', {
                url: '/new',
                parent: 'report',
                views: {
                    'reportManagement@report': {
                        templateUrl: 'app/report/management/report.detail.html',
                        controller: 'ReportNewController',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Create',
                    pageTitle: 'New Report'
                }
            })
            .state('report.detail', {
                url: '/:reportID',
                parent: 'report',
                views: {
                    'reportManagement@report': {
                        templateUrl: 'app/report/management/report.detail.html',
                        controller: 'ReportDetailController',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Detail',
                    pageTitle: 'Report Detail'
                }
            });
    }
})();