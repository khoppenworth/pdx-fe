(function() {
    'use strict';

    angular.module('pdx.controllers')
        .controller('MANewApplicationController', function($scope) {

            /*
             * Store newApplication state definitions
             * It will be shared by new, wip, and update
             * */
            $scope.newApplicationStates = {
                new: {
                    parent: "maregistration.newApplication.new",
                    general: "maregistration.newApplication.new.general",
                    product: "maregistration.newApplication.new.product",
                    productdetailContinued: "maregistration.newApplication.new.productcontinued",
                    composition: "maregistration.newApplication.new.composition",
                    foreignStatus: "maregistration.newApplication.new.foreignstatus",
                    manufacturer: "maregistration.newApplication.new.manufacturers",
                    attachment: "maregistration.newApplication.new.attachment",
                    dossier: "maregistration.newApplication.new.dossier",
                    checklist: "maregistration.newApplication.new.checklist",
                    termsAndConditions: "maregistration.newApplication.new.termsAndConditions",

                    foodproduct: "maregistration.newApplication.new.foodproduct",
                    foodproductContinued: "maregistration.newApplication.new.foodproductcontinued",
                    foodcomposition: "maregistration.newApplication.new.foodcomposition",
                    foodTermsConditions: "maregistration.newApplication.new.foodTermsConditions",

                    deviceProduct: "maregistration.newApplication.new.deviceProduct",
                    deviceProductContinued: "maregistration.newApplication.new.deviceProductContinued",
                    deviceComposition: "maregistration.newApplication.new.deviceComposition",
                    deviceTermsConditions: "maregistration.newApplication.new.deviceTermsConditions",
                },
                update: {
                    parent: "maregistration.newApplication.update",
                    general: "maregistration.newApplication.update.general",
                    product: "maregistration.newApplication.update.product",
                    productdetailContinued: "maregistration.newApplication.update.productcontinued",
                    composition: "maregistration.newApplication.update.composition",
                    foreignStatus: "maregistration.newApplication.update.foreignstatus",
                    manufacturer: "maregistration.newApplication.update.manufacturers",
                    attachment: "maregistration.newApplication.update.attachment",
                    dossier: "maregistration.newApplication.update.dossier",
                    checklist: "maregistration.newApplication.update.checklist",

                    foodproduct: "maregistration.newApplication.update.foodproduct",
                    foodproductContinued: "maregistration.newApplication.update.foodproductcontinued",
                    foodcomposition: "maregistration.newApplication.update.foodcomposition",

                    deviceProduct: "maregistration.newApplication.update.deviceProduct",
                    deviceProductContinued: "maregistration.newApplication.update.deviceProductContinued",
                    deviceComposition: "maregistration.newApplication.update.deviceComposition",
                },

                wip: {
                    parent: "maregistration.newApplication.wip",
                    general: "maregistration.newApplication.wip.general",
                    product: "maregistration.newApplication.wip.product",
                    foodproductContinued: "maregistration.newApplication.wip.foodproductcontinued",
                    composition: "maregistration.newApplication.wip.composition",
                    foreignStatus: "maregistration.newApplication.wip.foreignstatus",
                    manufacturer: "maregistration.newApplication.wip.manufacturers",
                    attachment: "maregistration.newApplication.wip.attachment",
                    dossier: "maregistration.newApplication.wip.dossier",
                    checklist: "maregistration.newApplication.wip.checklist",
                    termsAndConditions: "maregistration.newApplication.wip.termsAndConditions",

                    foodproduct: "maregistration.newApplication.wip.foodproduct",
                    productdetailContinued: "maregistration.newApplication.wip.productcontinued",
                    foodcomposition: "maregistration.newApplication.wip.foodcomposition",
                    foodTermsConditions: "maregistration.newApplication.wip.foodTermsConditions",

                    deviceProduct: "maregistration.newApplication.wip.deviceProduct",
                    deviceProductContinued: "maregistration.newApplication.wip.deviceProductContinued",
                    deviceComposition: "maregistration.newApplication.wip.deviceComposition",
                    deviceTermsConditions: "maregistration.newApplication.wip.deviceTermsConditions",
                }
            };


        });

})();