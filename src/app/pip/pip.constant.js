(function() {
    'use strict';

    angular.module('pdx')
        .constant('PIPConst', {
            SUB_MODULE_TYPE: {
                MEDICINE: 'MDCN',
                MEDICAL_DEVICE: 'MD'
            },
            PRODUCT_TYPE: {
                MEDICINE: 'MED',
                MEDICAL_DEVICE: 'MDS'
            }
        });
})();
