'use strict';

angular.module('pdx.directives')
    .directive('hideonRegistration', function(AccountService, RegistrationFactory) {
        return function(scope, element, attrs) {
            scope.$watch(attrs.hideonRegistration,
                function(value, oldValue) {

                    var permission = scope.$eval(attrs.permission);

                    if ((attrs.buttonfunction == 'Edit')) {
                        if ((value == 'DRFT' || value == 'WITH' || value == "FIR" || value == 'RTA') && AccountService.hasThisPermission(permission)) {
                            element.show();
                        } else {
                            element.hide();
                        }
                    }
                    if ((attrs.buttonfunction == 'EditLegacyData')) {
                        var ma = scope.$parent.vm.maregistration.ma;
                        if ((value == 'APR') && AccountService.hasThisPermission(permission) && RegistrationFactory.allowEditLegacyData(ma)) {
                            element.show();
                        } else {
                            element.hide();
                        }
                    }
                    if ((attrs.buttonfunction == 'Submit')) {
                        if ((value == 'DRFT' || value == 'WITH') && AccountService.hasThisPermission(permission)) {
                            element.show();
                        } else {
                            element.hide();
                        }
                    }
                    if (attrs.buttonfunction == 'Withdraw') {
                        if ((value == 'RQST') && AccountService.hasThisPermission(permission)) {
                            element.show();
                        } else {
                            element.hide();
                        }
                    }
                    if (attrs.buttonfunction === 'DeleteApplicant') {
                        if ((value == 'WITH') && AccountService.hasThisPermission(permission)) {
                            element.show();
                        } else {
                            element.hide();
                        }
                    }
                    if (attrs.buttonfunction === 'DeleteStaff') {
                        if ((value != 'WITH' || value != 'RQST') && AccountService.hasThisPermission(permission)) {
                            element.show();
                        } else {
                            element.hide();
                        }
                    }

                    if (attrs.buttonfunction == 'PreScreen') {
                        if ((value == 'RQST' || value == 'RTAR') && AccountService.hasThisPermission(permission)) {
                            element.show();
                        } else {
                            element.hide();
                        }
                    }
                    if (attrs.buttonfunction == 'Verify') {
                        if ((value == 'FATCH') && AccountService.hasThisPermission(permission)) {
                            element.show();
                        } else {
                            element.hide();
                        }
                    }

                    if (attrs.buttonfunction == 'BackToPreScreen') {
                        if ((value == 'FATCH') && AccountService.hasThisPermission(permission)) {
                            element.show();
                        } else {
                            element.hide();
                        }
                    }

                    if (attrs.buttonfunction == 'Complete') {
                        if ((value == 'RQST' || value == 'RTAR' || value == 'FIRR') && AccountService.hasThisPermission(permission)) {
                            element.show();
                        } else {
                            element.hide();
                        }
                    }
                    if (attrs.buttonfunction == 'Return') {
                        if ((value == 'RQST' || value == 'RTAR' || value == 'FIRR') && AccountService.hasThisPermission(permission)) {
                            element.show();
                        } else {
                            element.hide();
                        }
                    }
                    if (attrs.buttonfunction == 'LabRequest') {
                        if ((value == 'VER')) {
                            element.show();
                        } else {
                            element.hide();
                        }
                    }
                    if (attrs.buttonfunction == 'generateLabRequest') {
                        if (value == 'SFA' || value == 'SFR' || value == 'APR' || value == 'REJ' || value == 'VOID') {
                            element.hide();
                        } else {
                            element.show();
                        }
                    }
                    if (attrs.buttonfunction === 'generateNotificationLetter') {
                        if ((value === 'RQST') && AccountService.hasThisPermission(permission)) {
                            element.show();
                        } else {
                            element.hide();
                        }
                    }
                    if (attrs.buttonfunction == 'AssignToAssessors') {
                        var maTypeCode = scope.$eval(attrs.hideonMatype);
                        if ((value == 'VER' || value == 'FIR' || value == 'ASD' || value == 'FIRR' || value == 'RTAS' || value == 'LARQ' || value == 'LARS' || value == 'SFIR' || value == 'SFA' || value == 'SFR') && AccountService.hasThisPermission(permission) && !RegistrationFactory.isMaNotificationType(maTypeCode)) {
                            element.show();
                        } else {
                            element.hide();
                        }
                    }

                    if (attrs.buttonfunction == 'Review') {
                        if ((value == 'STL' || value == 'RTL') && AccountService.hasThisPermission(permission)) {
                            element.show();
                        } else {
                            element.hide();
                        }
                    }

                    if (attrs.buttonfunction == 'SubmittedForApproval' || attrs.buttonfunction == 'SubmittedForRejection' || attrs.buttonfunction == 'SubmittedForFIR' || attrs.buttonfunction == 'ReturnToAssessors') {
                        if ((value == 'STL' || value == 'RTL') && AccountService.hasThisPermission(permission)) {
                            element.show();
                        } else {
                            element.hide();
                        }
                    }


                    if (attrs.buttonfunction == 'SuggestSubmittedForApproval' || attrs.buttonfunction == 'SuggestSubmittedForRejection' || attrs.buttonfunction == 'SuggestSubmittedForFIR' || attrs.buttonfunction == 'SuggestSubmittedForRTPS') {
                        if ((value == 'ASD' || value == 'FIRR' || value == 'RTAS') && AccountService.hasThisPermission(permission)) {
                            element.show();
                        } else {
                            element.hide();
                        }
                    }

                    if (attrs.buttonfunction == 'Assess') {
                        if ((value == 'ASD' || value == 'STL' || value == 'RTAS' || value == 'FIRR' || value == 'SFR' || value == 'SFA' || value == 'APR' || value == 'REJ' || value == 'VOID') && AccountService.hasThisPermission(permission)) {
                            element.show();
                        } else {
                            element.hide();
                        }
                    }
                    if (attrs.buttonfunction == 'AssessTLD') {
                        if ((value == 'STL' || value == 'SFR' || value == 'SFA' || value == 'APR' || value == 'REJ' || value == 'RTL') && AccountService.hasThisPermission(permission)) {
                            element.show();
                        } else {
                            element.hide();
                        }
                    }


                    if (attrs.buttonfunction == 'Notification') {
                        if (value == 'SFA' && AccountService.hasThisPermission(permission)) {
                            element.show();
                        } else {
                            element.hide();
                        }
                    }

                    if (attrs.buttonfunction == 'Approve') {
                        if ((value == 'SFA') && AccountService.hasThisPermission(permission)) {
                            element.show();
                        } else {
                            element.hide();
                        }
                    }

                    if (attrs.buttonfunction == 'Reject') {
                        if ((value == 'SFR') && AccountService.hasThisPermission(permission)) {
                            element.show();
                        } else {
                            element.hide();
                        }
                    }

                    if (attrs.buttonfunction == 'Void') {
                        if ((value == 'APR' || value == 'REJ') && AccountService.hasThisPermission(permission)) {
                            element.show();
                        } else {
                            element.hide();
                        }
                    }
                    if (attrs.buttonfunction == 'RePrint') {
                        if ((value == 'APR' || value == 'REJ')) {
                            element.show();
                        } else {
                            element.hide();
                        }
                    }
                    if (attrs.buttonfunction == 'ReturnTL') {
                        if ((value == 'SFA' || value == 'SFR' || value == 'VOID') && AccountService.hasThisPermission(permission)) {
                            element.show();
                        } else {
                            element.hide();
                        }
                    }
                    if (attrs.buttonfunction == 'RePrint') {
                        if ((value == 'APR' || value == 'REJ')) {
                            element.show();
                        } else {
                            element.hide();
                        }
                    }

                    if (attrs.buttonfunction == 'RoleHead') {
                        if ((value == 'SFR' || value == 'SFA' || value == 'APR' || value == 'REJ' || value == 'VOID') && AccountService.hasThisPermission(permission)) {
                            element.show();
                        } else {
                            element.hide();
                        }
                    }
                    if (attrs.buttonfunction == 'Suspend' || attrs.buttonfunction == 'Cancel') {
                        if (value == 'APR' && AccountService.hasThisPermission(permission)) {
                            element.show();
                        } else {
                            element.hide();
                        }
                    }


                }, true);
        }
    })
    .directive('hideonMatype', function(AccountService, RegistrationFactory) {
        return function(scope, element, attrs) {
            scope.$watch(attrs.hideonMatype,
                function(value, oldValue) {

                    var permission = scope.$eval(attrs.permission); 
                    if (attrs.buttonfunction === 'AssignToCSO') {
                        var maTypeCode = scope.$eval(attrs.hideonMatype);
                        if (AccountService.hasThisPermission(permission) && !RegistrationFactory.isMaNotificationType(maTypeCode)) {
                            element.show();
                        } else {
                            element.hide();
                        }
                    } 

                }, true);
        }
    })
    ;