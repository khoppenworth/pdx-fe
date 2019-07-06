(function(angular) {
    'use strict';

    angular.module('pdx.controllers')
        .controller('PublicController', function(EnvironmentConfig, $uibModal, PublicFactory) {
            var vm = this;
            vm.test = 'testing my controller';
            vm.iLicense_url = EnvironmentConfig.iLicense_url;

            vm.showBanner = PublicFactory.showBanner();

            if (vm.showBanner) {
                $uibModal.open({
                    templateUrl: "app/public/view/temp_banner_modal.html",
                    size: 'lg',
                    controller: MyModalController,
                    controllerAs: 'vm'
                });
            }

            function MyModalController() {
                var vm = this;
                vm.daysLeft = PublicFactory.daysRemaining();
            }
        });
})(window.angular);