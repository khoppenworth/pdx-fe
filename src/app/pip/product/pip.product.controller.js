(function() {
    'use strict';

    angular.module('pdx.controllers')
        .controller('PipProductController', function($uibModal, CommodityFactory, NotificationService, RegistrationFactory, LookUpFactory, PipFactory, AccountService, $state, $stateParams, $scope, blockUI) {
            var vm = this;

            vm.productValidation = {};

            vm.productType = {};
            vm.product = {};
            vm.supplierID = null;

            //lookup lists
            vm.listOfProductTypes = [];
            vm.manufacturers = [];

            vm.searchManufacturer = _searchManufacturer;
            vm.onProductTypeSelected = _onProductTypeSelected;
            vm.openManufacturerModal = _openManufacturerModal;
            vm.save = _saveProduct;
            vm.cancel = _cancel;

            init();

            function init() {
                vm.supplierID = $stateParams.supplierID;
                vm.submoduleTypeCode = $stateParams.submoduleTypeCode;
                vm.productTypeCode = PipFactory.getProductTypeCode(vm.submoduleTypeCode);

                if (angular.isUndefined(vm.supplierID) || vm.supplierID == null) {
                    _cancel();
                }
                vm.user = AccountService.userInfo();
                loadLookups();
            }

            function loadLookups() {
                vm.listOfProductTypes = CommodityFactory.productType.query();
            }

            function _searchManufacturer(keyWords, $event) {
                RegistrationFactory.searchManufacturer(vm, LookUpFactory, keyWords, $event);
            }

            function _onProductTypeSelected() {
                vm.productValidation = {};
                vm.product = {};
            }

            function _openManufacturerModal() {
                $uibModal.open({
                    backdrop: "static",
                    templateUrl: "app/registration/templates/manufacturer.modal.template.html",
                    size: 'lg',
                    windowClass: 'supplierModalClass',
                    controller: "ManufacturerModalController",
                    controllerAs: 'vm'
                }).result.then(function() {
                    NotificationService.notify("Manufacturer Successfully Registered.", "alert-success");
                }, function() {

                });
            }

            function _saveProduct() {
                vm.productValidation.$showError = true;
                if (vm.productValidation.$isValid) {
                    //Save Product
                    var productModel = PipFactory.prepareProduct(vm);
                    blockUI.start();
                    CommodityFactory.product.Create.save(productModel, function(data) {
                        blockUI.stop();
                        if (data.statusCode == 200) {
                            data.result.presentations = productModel.presentations;
                            $state.go($state.current.parent);
                            $scope.$parent.vm.onProductAddFinished(data.result);
                            NotificationService.notify("Successfully Saved", 'alert-success');
                        } else {
                            NotificationService.notify("Unable to save Product", 'alert-danger');
                        }
                    }, function() {
                        blockUI.stop();
                        NotificationService.notify("Unable to save Product", 'alert-danger');
                    });
                }
            }

            function _cancel() {
                $state.go($state.current.parent);
            }
        })
})();
