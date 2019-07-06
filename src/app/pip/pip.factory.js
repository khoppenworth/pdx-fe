'use strict';

angular.module('pdx.factories')
    .factory('PipFactory', function($resource, AppConst, CommonService, PIPConst, $state, LookUpFactory, $filter) {
        var pipFactory = {};

        pipFactory.ProductSearch = $resource(CommonService.buildUrl(AppConst.API_URL.Commodity.ProductSearchAll), { query: "@query", productTypeCode: "@productTypeCode", importPermitTypeCode: 'PIP', supplierID: "@supplierID" }, AppConst.ResourceMethods.Search);
        pipFactory.ImportPermitType = $resource(CommonService.buildUrl(AppConst.API_URL.LookUp.ImportPermitType), { code: "@code" }, AppConst.ResourceMethods.Readonly);
        pipFactory.AgentByType = $resource(CommonService.buildUrl(AppConst.API_URL.Agent.AgentByType), { code: "@code" }, AppConst.ResourceMethods.Readonly);

        pipFactory.colorMap = {
            DRFT: 'badge',
            RQST: 'badge badge-info',
            RTA: 'badge badge-warning',
            RTC: 'badge badge-warning',
            SFA: 'badge badge-info',
            SFR: 'badge badge-warning',
            APR: 'badge badge-primary',
            REJ: 'badge badge-danger',
            WITH: 'badge badge-warning',
            UAS: 'badge badge-info',
            VOID: 'badge badge-danger'
        };

        pipFactory.prepareProduct = _prepareProduct;
        pipFactory.goToProductAddPage = _goToProductAddPage;
        pipFactory.getSubmoduleTypes = _getSubmoduleTypes;
        pipFactory.getProductTypeCode = _getProductTypeCode;
        pipFactory.searchProducts = _searchProducts;

        function _prepareProduct(vm) {
            var product = vm.product;
            var productModel = {};
            productModel.productTypeCode = vm.productTypeCode;
            productModel.createdByUserID = vm.user.id;
            productModel.supplierID = vm.supplierID;
            productModel.brandName = product.brandName;
            productModel.innid = product.inn.id;
            productModel.genericName = product.inn.name;
            productModel.manufacturerAddressID = product.manufacturer.id;

            // Medicine
            if (vm.productTypeCode !== PIPConst.PRODUCT_TYPE.MEDICAL_DEVICE) {
                productModel.dosageStrengthID = product.dosageStrengthObj.id;
                productModel.dosageFormID = product.dosageFormObj.id;
                productModel.dosageUnitID = product.dosageUnitObj.id;

                //presentations
                var packSizes = [];
                _.each(product.presentations, function(present) {
                    var ps = {};
                    ps.packSizeID = present.id;
                    ps.packaging = present.name;
                    packSizes.push(ps);
                });
                productModel.presentations = packSizes;
            }

            // Medical Device
            if (vm.productTypeCode === PIPConst.PRODUCT_TYPE.MEDICAL_DEVICE) {
                //presentations
                var mdDevicePresentations = [];
                productModel.mdModelSizes = [];
                productModel.mdModelSizes.push({
                    size: product.size,
                    model: product.model
                });
                _.each(product.presentations, function(present) {
                    var ps = { packSizeID: present.id };
                    mdDevicePresentations.push(ps);
                });
                //here we only have one model/Size record
                productModel.mdModelSizes[0].mdDevicePresentations = mdDevicePresentations;

            }

            return productModel;
        }

        function _goToProductAddPage(vm, fromState) {
            $state.go('pip.' + fromState.toLowerCase() + '.detail.product', { "supplierID": vm.supplier.selected.id, "submoduleTypeCode": vm.subModuleType.selected.submoduleTypeCode });
        }

        function _getSubmoduleTypes(vm, initialize) {
            LookUpFactory.subModuleType.query(function(data) {
                vm.listOfSubModuleTypes = _.filter(data, function(d) {
                    return d.submoduleTypeCode == PIPConst.SUB_MODULE_TYPE.MEDICINE || d.submoduleTypeCode == PIPConst.SUB_MODULE_TYPE.MEDICAL_DEVICE;
                });
                if (initialize) {
                    vm.subModuleType.selected = $filter("filter")(data, { submoduleTypeCode: PIPConst.SUB_MODULE_TYPE.MEDICINE })[0];
                }
            });
        }

        function _getProductTypeCode(submoduleTypeCode) {
            var productTypeCode = null;
            if (submoduleTypeCode === PIPConst.SUB_MODULE_TYPE.MEDICINE) {
                productTypeCode = PIPConst.PRODUCT_TYPE.MEDICINE;
            } else if (submoduleTypeCode === PIPConst.SUB_MODULE_TYPE.MEDICAL_DEVICE) {
                productTypeCode = PIPConst.PRODUCT_TYPE.MEDICAL_DEVICE;
            }
            return productTypeCode;
        }

        function _searchProducts(vm, keyWords) {
            var productTypeCode = _getProductTypeCode(vm.subModuleType.selected.submoduleTypeCode);
            this.ProductSearch.search({ query: keyWords, productTypeCode: productTypeCode, supplierID: vm.supplier.selected.id }, function(filteredProdcuts) {
                vm.products = filteredProdcuts;
            });
        }
        return pipFactory;
    });