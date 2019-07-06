(function() {
    'use strict';

    angular.module('pdx.controllers')
        .controller('FoodCompositionModalController', function($uibModalInstance, RegistrationConst, food_composition, composition_type) {
            var vm = this;

            vm.addFoodComposition = _addFoodComposition;
            vm.editMode = food_composition != null;
            vm.title = vm.editMode ? "Edit Nutrition Fact" : "Add New Nutrition Fact";

            vm.food_composition = food_composition;
            vm.foodCompositionValidation = {};

            _init();

            function _init() {
                var foodCompositionTypeObj = getCompositionType();
                if (!vm.editMode) {
                    vm.food_composition = {};
                    vm.food_composition.compositionType = foodCompositionTypeObj.CODE;
                }
                vm.title = (vm.editMode ? "Edit " : "Add New ") + foodCompositionTypeObj.NAME;
            }

            function _addFoodComposition() {
                vm.foodCompositionValidation.$showError = true;
                if (vm.foodCompositionValidation.$isValid) {
                    $uibModalInstance.close(vm.food_composition);
                } else return;
            }

            function getCompositionType() {
                var result = null;
                angular.forEach(RegistrationConst.FOOD_COMPOSITION_TYPE, function(value, key) {
                    if (key == composition_type) { result = value; }
                });
                return result;
            }


        });
})();