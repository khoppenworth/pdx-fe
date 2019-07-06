(function() {
    'use strict';

    angular.module('pdx.controllers')
        .controller('ReportListController', function(ReportFactory) {
            var vm = this;
            vm.reports = ReportFactory.report.query();

        });
})();