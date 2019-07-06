'use strict';

angular.module('pdx.directives')
    .directive('hideon', function(AccountService) {
        return function(scope, element, attrs) {
            scope.$watch(attrs.hideon, function(value, oldValue) {

                var permission = scope.$eval(attrs.permission);
                var userInfo = AccountService.userInfo();

                if ((attrs.buttonfunction == 'Submit')) {
                    if ((value == 'DRFT' || value == 'WITH' || value == "RTA") && AccountService.hasThisPermission(permission)) {
                        element.show();
                    } else {
                        element.hide();
                    }
                }
                if ((attrs.buttonfunction == 'Edit')) {
                    if ((value == 'DRFT' || value == 'WITH' || value == "RTA") && AccountService.hasThisPermission(permission)) {
                        element.show();
                    } else {
                        element.hide();
                    }
                }
                if (attrs.buttonfunction == 'Withdraw') {
                    if ((value == 'RQST' || value == 'RTC' || value == 'SFA' || value == 'VOID') && AccountService.hasThisPermission(permission)) {
                        element.show();
                    } else {
                        element.hide();
                    }
                }

                if (attrs.buttonfunction == 'Approve') {
                    if (value == 'SFA' && AccountService.hasThisPermission(permission)) {
                        element.show();
                    } else {
                        element.hide();
                    }
                }

                if (attrs.buttonfunction == 'Reject') {
                    if (value == 'SFR' && AccountService.hasThisPermission(permission)) {
                        element.show();
                    } else {
                        element.hide();
                    }
                }

                if (attrs.buttonfunction == 'SubmittedForApproval' || attrs.buttonfunction == 'SubmittedForRejection') {
                    if ((value == 'RQST' || value == 'RTC')) {
                        element.show();
                    } else {
                        element.hide();
                    }
                }

                if (attrs.buttonfunction == 'ReturnToCSO') {
                    if ((value == 'RQST' || value == 'SFA' || value == 'SFR')) {
                        element.show();
                    } else {
                        element.hide();
                    }
                }
                if (attrs.buttonfunction == 'ReturnToAgent') {
                    if ((value == 'RQST' || value == 'RTC' || (value == 'SFA' && userInfo.roleCode != 'CSO') || (value == 'SFR' && userInfo.roleCode != 'CSO'))) {
                        element.show();
                    } else {
                        element.hide();
                    }
                }
                if (attrs.buttonfunction == 'Assign') {
                    if ((value == 'SFA' || value == 'SFR' || value == 'RQST' || value == 'RTC' || value == 'RTA') && AccountService.hasThisPermission(permission)) {
                        element.show();
                    } else {
                        element.hide();
                    }
                }
                if (attrs.buttonfunction == 'Void') {
                    if ((value == 'APR') && AccountService.hasThisPermission(permission)) {
                        element.show();
                    } else {
                        element.hide();
                    }
                }
                if (attrs.buttonfunction == 'FinishProcess') {
                    if (value !== 'APR') {
                        element.show();
                    } else {
                        element.hide();
                    }
                }


            }, true);
        }
    })