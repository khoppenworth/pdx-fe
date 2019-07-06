(function(angular) {
    'use strict';

    angular.module('pdx.controllers')
        .controller('IngredientsModalController', function($uibModalInstance, product_composition) {
            var vm = this;

            vm.addActiveIngredients = _addActiveIngredients;
            vm.addExcipeintIngredients = _addExcipeintIngredients;
            vm.addDiluentIngredients = _addDiluentIngredients;
            vm.submoduleTypeCode = 'MDCN';

            init();

            function init() {
                vm.titleInn = product_composition !== null ? "Edit Active Substances" : "Add New Active Substances";
                vm.titleExi = product_composition !== null ? "Edit InActive Substances" : "Add New InActive Substances";
                vm.titleDilu = product_composition !== null ? "Edit Diluent Substances" : "Add New Diluent Substances";

                vm.productInn = product_composition;
                vm.productInnValidation = {};

                vm.productExcipeint = product_composition;
                vm.productExcipeintValidation = {};

                vm.productDiluent = product_composition;
                vm.productDiluentValidation = {};
            }

            function _addActiveIngredients() {
                vm.productInnValidation.$showError = true;
                if (vm.productInnValidation.$isValid) {
                    prepareProductInn();
                    $uibModalInstance.close(vm.productInn);
                }
            }

            function _addExcipeintIngredients() {
                vm.productExcipeintValidation.$showError = true;
                if (vm.productExcipeintValidation.$isValid) {
                    prepareProductExcipeint();
                    $uibModalInstance.close(vm.productExcipeint);
                }
            }

            function _addDiluentIngredients() {
                vm.productDiluentValidation.$showError = true;
                if (vm.productDiluentValidation.$isValid) {
                    prepareProductDiluent();
                    $uibModalInstance.close(vm.productDiluent);
                }
            }

            function prepareProductInn() {
                vm.productInn.dosageUnitID = vm.productInn.dosageUnit.id;
                vm.productInn.pharmacopoeiaStandardID = vm.productInn.pharmacopoeiaStandard.id;
                vm.productInn.innID = vm.productInn.inn.id;
                vm.productInn.dosageStrengthID = vm.productInn.dosageStrengthObj.id;
                vm.productInn.isActiveComposition = true;
            }

            function prepareProductExcipeint() {
                vm.productExcipeint.dosageUnitID = vm.productExcipeint.dosageUnit.id;
                vm.productExcipeint.pharmacopoeiaStandardID = vm.productExcipeint.pharmacopoeiaStandard.id;
                vm.productExcipeint.excipientID = vm.productExcipeint.excipient.id;
                vm.productExcipeint.dosageStrengthID = vm.productExcipeint.dosageStrengthObj.id;
                vm.productExcipeint.isActiveComposition = false;
            }

            function prepareProductDiluent() {
                vm.productDiluent.dosageUnitID = vm.productDiluent.dosageUnit.id;
                vm.productDiluent.pharmacopoeiaStandardID = vm.productDiluent.pharmacopoeiaStandard.id;
                vm.productDiluent.excipientID = vm.productDiluent.excipient.id;
                vm.productDiluent.dosageStrengthID = vm.productDiluent.dosageStrengthObj.id;
                vm.productDiluent.isActiveComposition = false;
                vm.productDiluent.isDiluent = true;
            }

        });
})(window.angular);