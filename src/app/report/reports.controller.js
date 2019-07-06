'use strict';

angular.module('pdx.controllers')
    .controller('ReportsController', function(ReportFactory, AppConst, AccountService, reportList) {
        var vm = this;

        vm.colors = AppConst.ColorPallets.Chart;
        vm.reportList = reportList;
    });