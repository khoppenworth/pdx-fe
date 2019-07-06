'use strict';

angular.module('pdx.filters')
    .filter('AttachmentSource', function() {

        return function(input) {
            input = input || '';
            var out = '';
            if (input == false) out = 'Uploaded';
            else out = 'System Generated';
            return out;
        }
    })
    .filter('IpermitStatus', function() {

        return function(input) {
            input = input || '';
            var out = '';
            if (input == 'Under Assessment') {
                out = 'UAS';
            }
            return out;
        }
    });