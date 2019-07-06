(function(angular) {
    'use strict';

    angular.module('pdx.controllers')
        .controller('MARenewalController', function($scope) {
            /*
             * Store renewal state definitions
             * It will be shared by new, wip, and update
             * */
            $scope.renewalStates = {
                new: {
                    parent: 'maregistration.renewal.new',
                    previous: 'maregistration.renewal.new.previous',
                    attachment: 'maregistration.renewal.new.attachments',
                    dossier: 'maregistration.renewal.new.dossier',
                    checklist: 'maregistration.renewal.new.checklist',
                    termsAndConditions: 'maregistration.renewal.new.termsAndConditions',
                    foodTermsConditions: "maregistration.renewal.new.foodTermsConditions",
                    deviceTermsConditions: "maregistration.renewal.new.deviceTermsConditions"
                },
                wip: {
                    parent: 'maregistration.renewal.wip',
                    previous: 'maregistration.renewal.wip.previous',
                    attachment: 'maregistration.renewal.wip.attachments',
                    dossier: 'maregistration.renewal.wip.dossier',
                    checklist: 'maregistration.renewal.wip.checklist',
                    termsAndConditions: 'maregistration.renewal.wip.termsAndConditions',
                    foodTermsConditions: "maregistration.renewal.wip.foodTermsConditions",
                    deviceTermsConditions: "maregistration.renewal.wip.deviceTermsConditions"
                },
                update: {
                    parent: 'maregistration.renewal.update',
                    previous: 'maregistration.renewal.update.previous',

                    product: 'maregistration.renewal.update.product',
                    productdetailContinued: 'maregistration.renewal.update.productcontinued',
                    composition: 'maregistration.renewal.update.composition',
                    manufacturer: 'maregistration.renewal.update.manufacturer',
                    foreignStatus: 'maregistration.renewal.update.foreignstatus',

                    attachment: 'maregistration.renewal.update.attachments',
                    dossier: 'maregistration.renewal.update.dossier',
                    checklist: 'maregistration.renewal.update.checklist',

                    foodproduct: "maregistration.renewal.update.foodproduct",
                    foodproductContinued: "maregistration.renewal.update.foodproductcontinued",
                    foodcomposition: "maregistration.renewal.update.foodcomposition",

                    deviceProduct: "maregistration.renewal.update.deviceProduct",
                    deviceProductContinued: "maregistration.renewal.update.deviceProductContinued",
                    deviceComposition: "maregistration.renewal.update.deviceComposition",
                }
            };

        });


})(window.angular);