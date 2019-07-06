'use strict';

angular.module('pdx.controllers')
    .controller('HomeController', function($http, $sce, $uibModal, ReportFactory, AccountService) {
        var vm = this;
        vm.descriptionText = 'Documents';
        vm.userInfo = AccountService.userInfo();

        ReportFactory.chartReports.query({ userID: vm.userInfo.id }, function(reports) {
            vm.reports = reports;

            _.each(vm.reports, function(report) {
                report.dataLoaded = false;
                report.dataAvailable = false;
                ReportFactory.chartReport.get({ id: report.reportID }, function(rp) {
                    report.data = rp.data;
                    report.dataLoaded = true;
                    report.dataAvailable = rp.data.length > 0;
                }, function() {
                    report.dataLoaded = true;
                    report.dataAvailable = false;
                });
            });

        });

    });