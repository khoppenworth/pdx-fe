(function() {
    'use strict';

    angular.module('pdx.controllers')
        .controller('ChangelogListController', function(AppConst, $http, $sce, ChangelogFactory, $location) {
            var vm = this;

            ChangelogFactory.getAllChangelogs.query(function(logs) {
                vm.changeLogs = logs;
            });

            vm.showAddButton = $location.$$absUrl.indexOf('localhost:3000') > 0 ? true : false;
        });
})();