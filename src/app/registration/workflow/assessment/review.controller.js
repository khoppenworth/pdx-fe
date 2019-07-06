(function() {
    'use strict';

    angular.module('pdx.controllers')
        .controller('ReviewerController', function(AccountService, RegistrationConst, $stateParams, MAFactory, NotificationService,
            $filter, $ngConfirm, $scope, $state, RegistrationFactory, $uibModal, $q) {
            var vm = this;
            vm.maId = $stateParams.maId;
            vm.submoduleCode = $stateParams.submoduleCode;
            vm.submoduleTypeCode = $stateParams.submoduleTypeCode;
            vm.userInfo = AccountService.userInfo();
            vm.maStatusModel = {};
            vm.reviewSecResult = {};
            vm.reviewPriResult = {};
            vm.maregistrationValidation = { checklist: {}, review: {} }
            vm.saveAsDraft = _saveAsDraft;
            vm.submitForApproval = _submitForApproval;
            vm.approve = _approve;
            vm.submitForRejection = _submitForRejection;
            vm.reject = _reject;
            vm.suggestForRTPS = _suggestForRTPS;
            vm.returnToPrimary = _returnToPrimary;
            vm.returnToAss = _returnToAss;
            vm.return = _return;
            vm.suggestForFir = _suggestForFir;
            vm.sFir = _sFir;
            vm.submitForFIR = _submitForFIR;
            vm.fir = _fir;
            vm.maStatusModel.ma = {};
            vm.changeMAStatus = _changeMAStatus;
            vm.saveMAField = _saveMAField;
            vm.reviewComment = '<ol><li>Test</li></ol>';
            vm.tlStatusVisibility = _tlStatusVisibility;
            vm.disableNonSelectedVariationFields = _disableNonSelectedVariationFields;

            init();


            function init() {
                vm.assesserType = MAFactory.maUserResponderType.get({ maId: vm.maId, userId: vm.userInfo.id });
                vm.currentStatus = RegistrationFactory.currentMaStatus.get({ maID: vm.maId }).$promise;
                vm.checklistWithReview = MAFactory.maReviewWithChecklist.query({
                    maId: vm.maId,
                    submoduleCode: vm.submoduleCode
                }).$promise;
                vm.groupedAssignment = RegistrationFactory.maAssignGroup.get({ maid: vm.maId });

                $q.all([vm.checklistWithReview, vm.currentStatus]).then(function(results) {
                    var data = results[0];
                    var currentStatus = results[1];
                    vm.reviewResult = $filter('filter')(data, { responderType: { responderTypeCode: vm.assesserType.responderTypeCode } })[0];
                    vm.reviewSecResult = $filter('filter')(data, { responderType: { responderTypeCode: RegistrationConst.RESPONDER_TYPE.SECONDARY_ASSESSOR } })[0];
                    vm.reviewPriResult = $filter('filter')(data, { responderType: { responderTypeCode: RegistrationConst.RESPONDER_TYPE.PRIMARY_ASSESSOR } })[0];
                    if (vm.assesserType.responderTypeCode == RegistrationConst.RESPONDER_TYPE.TEAM_LEADER) {
                        if (vm.reviewResult.maReview == null || (!vm.reviewResult.maReview.isActive && currentStatus.maStatusCode == RegistrationConst.MA_STATUS.STL))
                            vm.maStatusModel.comment = vm.reviewSecResult.maReview != null && vm.reviewSecResult.maReview.isActive ? vm.reviewSecResult.maReview.comment :
                            vm.reviewPriResult.maReview != null && vm.reviewPriResult.maReview.isActive ? vm.reviewPriResult.maReview.comment : null;
                        else vm.maStatusModel.comment = vm.reviewResult.maReview.comment;
                    } else vm.maStatusModel.comment = vm.reviewResult.maReview != null ? vm.reviewResult.maReview.comment : '';
                    vm.checklistWithReview = data;
                    vm.currentStatus = currentStatus;
                    vm.maStatusModel.comment = vm.maStatusModel.comment + $stateParams.firCommentHtml;
                });
                RegistrationFactory.maFieldByType.query({ isVariationType: "null", submoduleTypeCode: vm.submoduleTypeCode }, function(data) {
                    vm.data = data;
                });
            }

            function _saveAsDraft() {
                vm.maregistrationValidation.review.$showError = true;
                if (vm.maregistrationValidation.review.$isValid) {
                    vm.maStatusModel.isDraft = true;
                    vm.changeMAStatus(null, false);
                }
            }

            function _submitForApproval() {
                vm.maregistrationValidation.review.$showError = true;
                if (vm.maregistrationValidation.review.$isValid) {
                    if (vm.maStatusModel.ma.isNotificationType) {
                        $uibModal.open({
                            backdrop: 'static',
                            templateUrl: 'app/registration/workflow/assessment/templates/notificationApprove.modal.html',
                            size: 'lg',
                            resolve: {},
                            controller: 'ReviewerController',
                            controllerAs: 'vm'
                        }).result.then(function() {
                            // reloadData()
                        }, function() {});
                    } else {
                        ManageWorkFlow('Submit Registration For Approval', 'green', 'Approve', 'btn-primary', 'Are you sure you want to submit this registration for approval?', vm.approve);
                    }
                } else return;
            }

            function _approve() {
                var changeStatus = vm.assesserType.responderTypeCode == RegistrationConst.RESPONDER_TYPE.TEAM_LEADER ? true : false;
                vm.changeMAStatus(RegistrationConst.MA_STATUS.SFA, changeStatus);
            }

            function _submitForRejection() {
                vm.maregistrationValidation.review.$showError = true;
                if (vm.maregistrationValidation.review.$isValid) {
                    ManageWorkFlow('Submit Registration For Rejection', 'red', 'Reject', 'btn-danger', 'Are you sure you want to submit this registration for rejection?', vm.reject);
                } else return;
            }

            function _reject() {
                var changeStatus = vm.assesserType.responderTypeCode == RegistrationConst.RESPONDER_TYPE.TEAM_LEADER ? true : false;
                vm.changeMAStatus(RegistrationConst.MA_STATUS.SFR, changeStatus);
            }


            function _suggestForRTPS() {
                vm.maregistrationValidation.review.$showError = true;
                if (vm.maregistrationValidation.review.$isValid) {
                    ManageWorkFlow('Return to Primary Assesor', 'orange', 'Return', 'btn-warning', 'Are you sure you want to return this registration?', vm.returnToPrimary)

                } else return;
            }

            function _returnToPrimary() {
                //var changeStatus = vm.assesserType.responderTypeCode == 'TLD' ? true : false
                vm.changeMAStatus(RegistrationConst.MA_STATUS.RTAS, true);
            }

            function _returnToAss() {
                vm.maregistrationValidation.review.$showError = true;
                if (vm.maregistrationValidation.review.$isValid) {
                    ManageWorkFlow('Return to Assessors', 'orange', 'Return', 'btn-warning', 'Are you sure you want to return this registration?', vm.return);
                } else return;
            }

            function _return() {
                var changeStatus = vm.assesserType.responderTypeCode == RegistrationConst.RESPONDER_TYPE.TEAM_LEADER ? true : false;
                vm.changeMAStatus(RegistrationConst.MA_STATUS.RTAS, changeStatus);
            }

            function _suggestForFir() {
                vm.maregistrationValidation.review.$showError = true;
                if (vm.maregistrationValidation.review.$isValid) {
                    ManageWorkFlow('Further Information Required', 'orange', 'FIR', 'btn-warning', 'Are you sure you want to require further information?', vm.sFir);
                } else return;
            }

            function _sFir() {
                vm.changeMAStatus(RegistrationConst.MA_STATUS.FIR, false);
            }

            function _submitForFIR() {
                vm.datePickerOptions = {
                    minDate: new Date()
                };
                vm.showFIRDueDate = true;
                vm.maregistrationValidation.review.$showError = true;
                if (vm.maregistrationValidation.review.$isValid) {
                    var firModal = $ngConfirm({
                        title: 'Further Information Required',
                        contentUrl: 'app/registration/workflow/modals/fields.html',
                        type: 'orange',
                        typeAnimated: true,
                        closeIcon: true,
                        scope: $scope,
                        columnClass: 'col-md-6 col-md-offset-3',
                        buttons: {
                            update: {
                                text: 'Submit',
                                btnClass: 'btn-warning',
                                action: function() {
                                    var allFieldsSelected = RegistrationFactory.allFieldsSelected(vm.data);
                                    if (allFieldsSelected) {
                                        $ngConfirm({
                                            title: "You selected all fields. Please confirm",
                                            type: 'yellow',
                                            typeAnimated: true,
                                            scope: $scope,
                                            buttons: {
                                                confirm: {
                                                    text: "confirm",
                                                    btnClass: 'btn-primary',
                                                    action: function() {
                                                        vm.maStatusModel.maid = vm.maId;
                                                        vm.maStatusModel.responderID = vm.userInfo.id;
                                                        vm.maStatusModel.responderTypeID = vm.assesserType.id;
                                                        vm.fir();
                                                        firModal.close();
                                                    }
                                                },
                                                cancel: {
                                                    back: "back",
                                                    btnClass: 'btn-warning',
                                                }
                                            }
                                        });
                                        return false; // prevents the "firModal" modal from closing by default, it will be closed in the second confirm modal
                                    } else {
                                        vm.maStatusModel.maid = vm.maId;
                                        vm.maStatusModel.responderID = vm.userInfo.id;
                                        vm.maStatusModel.responderTypeID = vm.assesserType.id;
                                        vm.fir();
                                    }
                                }
                            }
                        }
                    });
                } else return;
            }

            function _fir() {
                vm.saveMAField(saveMAFieldSuccess, saveMAFieldFailed);

                function saveMAFieldSuccess() {
                    var changeStatus = vm.assesserType.responderTypeCode == RegistrationConst.RESPONDER_TYPE.TEAM_LEADER ? true : false;
                    vm.changeMAStatus(RegistrationConst.MA_STATUS.FIR, changeStatus);
                }

                function saveMAFieldFailed() {
                    NotificationService.notify('Unable to save maField. Please try again!', 'alert-danger');
                }
            }


            function _changeMAStatus(statusCode, changeStatus) {
                vm.maStatusModel.toStatusCode = statusCode;
                vm.maStatusModel.changedByUserID = vm.userInfo.id;
                vm.maStatusModel.responderID = vm.userInfo.id;
                vm.maStatusModel.responderTypeID = vm.assesserType.id;
                vm.maStatusModel.suggestedStatusCode = statusCode;
                vm.maStatusModel.ma.modifiedByUserID = vm.userInfo.id;
                vm.maStatusModel.ma.id = vm.maId;
                vm.maStatusModel.maId = vm.maId;
                MAFactory.maChangReviewStatus.save({ changeStatus: changeStatus }, vm.maStatusModel, function(data) {
                    if (data) {
                        if (vm.maStatusModel.ma.isNotificationType) {
                            MAFactory.ma.update(vm.maStatusModel.ma, function() {
                                NotificationService.notify('Successfully Updated', 'alert-success');
                            });
                        }
                        NotificationService.notify('Successfully Submitted', 'alert-success');
                        vm.maregistrationValidation.review.$showError = false;
                        $state.go('maregistration.assessment', { maId: vm.maId, submoduleCode: vm.submoduleCode });
                    }
                });
            }


            function _saveMAField(success, failed) {
                var maFields = [];
                var selectedFields = _.filter(vm.data, function(d) {
                    return d.isSelected == true;
                });
                _.each(selectedFields, function(d) {
                    var maField = {};
                    maField.maid = vm.maId;
                    maField.createdByUserID = vm.userInfo.id;
                    maField.fieldSubmoduleType = d;
                    maField.fieldSubmoduleTypeID = d.id;
                    maFields.push(maField);
                });
                RegistrationFactory.maFieldInsertUpdate.save(maFields, success, failed);
            }


            function ManageWorkFlow(title, type, buttonText, btnClass, content, functionCall) {
                $ngConfirm({
                    title: title,
                    content: content,
                    type: type,
                    typeAnimated: true,
                    closeIcon: true,
                    scope: $scope,
                    columnClass: 'col-md-6 col-md-offset-3',
                    buttons: {
                        update: {
                            text: buttonText,
                            btnClass: btnClass,
                            action: function() {
                                vm.maStatusModel.maid = vm.maId;
                                vm.maStatusModel.responderID = vm.userInfo.id;
                                vm.maStatusModel.responderTypeID = vm.assesserType.id;
                                functionCall();
                            }
                        }
                    }
                })
            }

            function _tlStatusVisibility(statusCode, responderType) {
                if (responderType == RegistrationConst.RESPONDER_TYPE.TEAM_LEADER) {
                    if (vm.currentStatus.maStatusCode == RegistrationConst.MA_STATUS.RTL) return false;
                    if (vm.groupedAssignment != null && vm.groupedAssignment.reviewers != null && vm.reviewPriResult.maReview != null && vm.groupedAssignment.reviewers.length == 1 && vm.reviewPriResult.maReview.suggestedStatus.maStatusCode == statusCode)
                        return true;
                    if (vm.reviewSecResult.maReview != null && vm.reviewPriResult.maReview != null && vm.reviewSecResult.maReview.suggestedStatus.maStatusCode == vm.reviewPriResult.maReview.suggestedStatus.maStatusCode && vm.reviewSecResult.maReview.suggestedStatus.maStatusCode == statusCode)
                        return true;
                    else return false;
                } else {
                    if (vm.assesserType.responderTypeCode == RegistrationConst.RESPONDER_TYPE.PRIMARY_ASSESSOR) return true;
                    if (vm.assesserType.responderTypeCode == RegistrationConst.RESPONDER_TYPE.SECONDARY_ASSESSOR && vm.reviewPriResult.maReview != null && vm.reviewPriResult.maReview.suggestedStatus.maStatusCode == statusCode) return true;
                }
            }

            function _disableNonSelectedVariationFields(node) {
                if (!vm.isVariationType || vm.isVariationType === 'null') return false;
                return RegistrationFactory.disableNonSelectedVariationFields(node, vm.currentMAFieldState);
            }

        });

})();
