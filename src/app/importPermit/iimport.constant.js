(function() {
    'use strict';
    angular.module('pdx')
        .constant('IMPORT_PERMIT_CONST', {
            CURRENT_STATUS_CODE: {
                Requested: 'RQST',
                SubmittedForApproval: 'SFA',
                Approved: 'APR'
            }
        });
})();