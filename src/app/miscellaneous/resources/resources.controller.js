(function() {
    'use strict';

    angular.module('pdx.controllers')
        .controller('ResourcesController', function($resource, AppConst, CommonService) {
            var vm = this;

            vm.resources = [
                { id: 1, name: 'User manual', resourceURL: 'http://mris.fmhaca.gov.et/resource/usermanual.pdf',
                  description: "User manual for iimport", downloadName: "Usermanual" }
            ];

        });

})();
