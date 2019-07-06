(function() {

    'use strict';

    angular.module('pdx.controllers')
        .controller('MAVariationController', function($scope) {
            /*
             * Store variation state definitions
             * It will be shared by new, wip, and update
             * */
            $scope.variationStates = {
                new: {
                    parent: "maregistration.variation.new",
                    general: "maregistration.variation.new.general",
                    product: "maregistration.variation.new.product",
                    productdetailContinued: "maregistration.variation.new.productcontinued",
                    composition: "maregistration.variation.new.composition",
                    foreignStatus: "maregistration.variation.new.foreignstatus",
                    manufacturer: "maregistration.variation.new.manufacturers",
                    attachment: "maregistration.variation.new.attachment",
                    dossier: "maregistration.variation.new.dossier",
                    checklist: "maregistration.variation.new.checklist",
                    termsAndConditions: "maregistration.variation.new.termsAndConditions",
                    foodproduct: "maregistration.variation.new.foodproduct",
                    foodproductContinued: "maregistration.variation.new.foodproductcontinued",
                    foodcomposition: "maregistration.variation.new.foodcomposition",
                    foodTermsConditions: "maregistration.variation.new.foodTermsConditions",

                    deviceProduct: "maregistration.variation.new.deviceProduct",
                    deviceProductContinued: "maregistration.variation.new.deviceProductContinued",
                    deviceComposition: "maregistration.variation.new.deviceComposition",
                    deviceTermsConditions: "maregistration.variation.new.deviceTermsConditions"
                },
                update: {
                    parent: "maregistration.variation.update",
                    general: "maregistration.variation.update.general",
                    product: "maregistration.variation.update.product",
                    productdetailContinued: "maregistration.variation.update.productcontinued",
                    composition: "maregistration.variation.update.composition",
                    foreignStatus: "maregistration.variation.update.foreignstatus",
                    manufacturer: "maregistration.variation.update.manufacturers",
                    attachment: "maregistration.variation.update.attachment",
                    dossier: "maregistration.variation.update.dossier",
                    checklist: "maregistration.variation.update.checklist",
                    foodcomposition: "maregistration.variation.update.foodcomposition",
                    foodproduct: "maregistration.variation.update.foodproduct",
                    foodproductContinued: "maregistration.variation.update.foodproductcontinued",

                    deviceProduct: "maregistration.variation.update.deviceProduct",
                    deviceProductContinued: "maregistration.variation.update.deviceProductContinued",
                    deviceComposition: "maregistration.variation.update.deviceComposition"
                },

                wip: {
                    parent: "maregistration.variation.wip",
                    general: "maregistration.variation.wip.general",
                    product: "maregistration.variation.wip.product",
                    productdetailContinued: "maregistration.variation.wip.productcontinued",
                    composition: "maregistration.variation.wip.composition",
                    foreignStatus: "maregistration.variation.wip.foreignstatus",
                    manufacturer: "maregistration.variation.wip.manufacturers",
                    attachment: "maregistration.variation.wip.attachment",
                    dossier: "maregistration.variation.wip.dossier",
                    checklist: "maregistration.variation.wip.checklist",
                    termsAndConditions: "maregistration.variation.wip.termsAndConditions",
                    foodproduct: "maregistration.variation.wip.foodproduct",
                    foodproductContinued: "maregistration.variation.wip.foodproductcontinued",
                    foodcomposition: "maregistration.variation.wip.foodcomposition",
                    foodTermsConditions: "maregistration.variation.wip.foodTermsConditions",

                    deviceProduct: "maregistration.variation.wip.deviceProduct",
                    deviceProductContinued: "maregistration.variation.wip.deviceProductContinued",
                    deviceComposition: "maregistration.variation.wip.deviceComposition",
                    deviceTermsConditions: "maregistration.variation.wip.deviceTermsConditions"
                }
            };

        });


})();
