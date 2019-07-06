'use strict';

angular.module('pdx.controllers')
    .controller('ShipmentController', function($scope) {

        /*
         * Store renewal state definitions
         * It will be shared by new, wip, and update
         * */
        $scope.shipmentStates = {
            new: {
                parent: 'shipment.new',
                registered: 'shipment.new.registered',
                general: 'shipment.new.general',
                detail: 'shipment.new.detail'
            },
            update: {
                parent: 'maregistration.renewal.new',
                registered: 'maregistration.renewal.update',
                general: 'maregistration.renewal.update.previous',
                detail: 'maregistration.renewal.update.attachments'
            }

        }
    });