'use strict';

angular.module('pdx.services')
    .service('NotificationService', function(notify) {

        var NotificationService = {};

        NotificationService.notify = function(message, cls, duration,container) {
            notify({
                message: message,
                classes: cls,
                templateUrl: "app/common/templates/layout/notify.html",
                position: 'right',
                duration: duration,
                container: container
            });
        };

        return NotificationService;
    })
