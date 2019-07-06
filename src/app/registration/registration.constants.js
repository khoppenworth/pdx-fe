(function() {
    'use strict';

    angular.module('pdx')
        .constant('RegistrationConst', {
            SUB_MODULE_TYPE: {
                FOOD: 'FD',
                MEDICINE: 'MDCN',
                MEDICAL_DEVICE: 'MD'
            },
            SUBMODULE: {
                RENEWAL: 'RREN',
                RENEWAL_FOOD: 'FRREN',
                RENEWAL_MD_IVD: 'IVDRREN',
                RENEWAL_MD_NON_IVD: 'NIVDRREN',
                RENEWAL_MD_NOTIFICATION_IVD: 'NTIVDRREN',
                RENEWAL_MD_NOTIFICATION_NON_IVD: 'NTNIVDRREN',
                MINOR_VARIATION: 'VMIN',
                MAJOR_VARIATION: 'VMAJ',
                MINOR_FOOD_VARIATION: 'VFMIN',
                MAJOR_FOOD_VARIATION: 'VFMAJ',
                MINOR_MEDICAL_DEVICE_VARIATION: 'MDVMIN',
                MAJOR_MEDICAL_DEVICE_VARIATION: 'MDVMAJ',
                NEW_MOLECULE: 'NNM',
                GENERIC_WITH_BIO: 'NGWB',
                GENERIC_WITHOUT_BIO: 'NGWOB',
                BABY_FOOD: 'BFD',
                FOOD_SUPPLEMENT: 'FSP',
                THERAPEUTIC_FOOD: 'TFD',
                LOCAL_FOOD: 'LFD',
                IMPORTED_FOOD: 'IFD',
                HOUSEHOLD_WATER_TREATMENT: 'HWT',
                FOOD_NOTIFICATION: 'FNT', 
                NEW_IVD: 'IVD',
                NEW_NON_IVD: 'NIVD',
                NOTIFICATION_IVD: 'NTIVD',
                NOTIFICATION_NON_IVD: 'NTNIVD',
            },
            MA_STATUS: {
                DRFT: 'DRFT',
                RQST: 'RQST',
                PRSC: 'PRSC',
                FATCH: 'FATCH',
                RTA: 'RTA',
                FIR: 'FIR',
                SFA: 'SFA',
                SFR: 'SFR',
                VER: 'VER',
                WITH: 'WITH',
                REJ: 'REJ',
                VOID: 'VOID',
                APR: 'APR',
                FIRR: 'FIRR',
                RTAR: 'RTAR',
                RTAS: 'RTAS',
                RTL: 'RTL',
                URVW: 'URVW',
                ASD: 'ASD',
                ARCH: 'ARCH',
                STL: 'STL'
            },
            RESPONDER_TYPE: {
                APPLICANT: 'APL',
                PRE_SCREENER: 'PRSC',
                PRIMARY_ASSESSOR: 'PRAS',
                SECONDARY_ASSESSOR: 'SCAS',
                TEAM_LEADER: 'TLD'
            },
            DOCUMENT_TYPE: {
                PAYMENT_RECEIPT_EVALUATION: 'RFR',
                CLINICAL_REVIEW: 'CLRVW',
                LAB_TEST_RESULT: 'LABR',
                PRE_MARKET_LAB_SAMPLE_REQUEST_LETTER: 'PMNL'
            },
            COLOR_MAP: {
                DRFT: 'badge',
                RQST: 'badge badge-info',
                PRSC: 'badge badge-primary',
                FATCH: 'badge badge-info',
                RTA: 'badge badge-warning',
                FIR: 'badge badge-warning',
                SFA: 'badge badge-primary',
                SFR: 'badge badge-danger',
                VER: 'badge badge-primary',
                WITH: 'badge badge-warning',
                REJ: 'badge badge-danger',
                VOID: 'badge badge-danger',
                APR: 'badge badge-primary',
                FIRR: 'badge badge-warning',
                RTAR: 'badge badge-warning',
                RTAS: 'badge badge-warning',
                RTL: 'badge badge-warning',
                URVW: 'badge badge-info',
                ASD: 'badge badge-info',
                ARCH: 'badge',
                STL: 'badge badge-info'
            },
            ACCESSORY_TYPE: {
                STANDARD: 'STND',
                COMPONENTS: 'CMP',
                SPARE_PART: 'SPR',
                ROW_MATERIALS: 'RMT',
                SUPPLIES: 'SPLS'
            },
            FOOD_COMPOSITION_TYPE: {
                COMPOSITION: {
                    NAME: 'Composition',
                    CODE: 'COMPOSITION'
                },
                NUTRITIONAL_FACT: {
                    NAME: 'Nutrition Fact',
                    CODE: 'NUTRITIONAL_FACT'
                }
            },
            StorageKeys: {
                SubmoduleTypeRegistration: "SubmoduleTypeRegistration",
                SubmoduleTypeProduct: "SubmoduleTypeProduct"
            }
        });

})();
