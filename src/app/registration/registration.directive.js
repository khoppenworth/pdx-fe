(function() {

    "use strict";

    angular.module('pdx.directives')
        .directive("applicationTypeFilter", function(RegistrationFactory, StorageService, RegistrationConst) {
            return {
                restrict: 'E',
                templateUrl: 'app/registration/templates/directives/application-type-filter.html',
                link: function($scope, element, attributes) {
                    var vm = $scope.vm;
                    var StorageKey = attributes.src == 'MA_LIST' ? RegistrationConst.StorageKeys.SubmoduleTypeRegistration : RegistrationConst.StorageKeys.SubmoduleTypeProduct;

                    RegistrationFactory.subModuleTypeByUserPrivilage.query().$promise.then(function(data) {
                        vm.applicationList = data;
                        vm.applicationList.push({ name: 'All', submoduleTypeCode: null }); // used to bring all data without filter

                        var currentSubmoduleType = StorageService.get(StorageKey); //get currently selected type
                        vm.selectedSubmoduleType = currentSubmoduleType ? currentSubmoduleType : null;
                    });

                    vm.onSubmoduleTypeSelected = function() {
                        vm.dtOptions.ajax.data.submoduleTypeCode = vm.selectedSubmoduleType.submoduleTypeCode; //Setting this will make api call (ajax, datatable)
                        StorageService.set(StorageKey, vm.selectedSubmoduleType);
                    };
                }
            };
        });

})();
