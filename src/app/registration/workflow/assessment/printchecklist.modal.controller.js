'use strict';

angular.module('pdx.controllers')
    .controller('PrintChecklistModalController', function($scope, $uibModalInstance, $stateParams, $q, NotificationService, AccountService, MAFactory) {
        var vm = this;

        vm.maId = $stateParams.maId;
        vm.submoduleCode = $stateParams.submoduleCode;
        vm.today = new Date();
        vm.userInfo = AccountService.userInfo();
        vm.maregistration = MAFactory.maProduct.get({ id: vm.maId }, function(data) {
            return data;
        });

        vm.checklistPrintAnswer = MAFactory.maReviewPrintChecklist.query({
            maID: vm.maId,
            submoduleCode: vm.submoduleCode,
            checklistTypeCode: "RVIW"
        });

        vm.printPreview = function() {
            var printContents = document.getElementById('printPreview').innerHTML;
            var headContent = document.getElementsByTagName('head')[0].innerHTML;
            headContent = '<style type="text/css"> body {background: white !important;}</style>' + headContent;
            var popupWin = window.open('', '_blank', 'width=800,height=600');
            popupWin.document.open();
            popupWin.document.write('<html><head>' + headContent + '</head><body onload="window.print()">' + printContents + '</body></html>');
            popupWin.document.close()
        }
    });