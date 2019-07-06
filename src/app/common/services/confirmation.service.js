'use strict';

angular.module('pdx.services')
    .service('ConfirmationService', function($ngConfirm) {

        var confirmationService = {};
        confirmationService.confirm = function(title,content,timeout){
          var confirmationModal = $ngConfirm({
            title: title,
            content: 'Are you sure you want to proceed?',
            autoClose: 'cancel|10000',
            closeIcon: true,
            type: 'orange',
            buttons: {
              yes: {
                text: 'yes',
                btnClass: 'btn-green',
                action: function () {
                    return true;
                }
              },
              cancel: function () {
                    return true;
              }
            }
          });
          return confirmationModal;
        };
        return confirmationService;


    })
