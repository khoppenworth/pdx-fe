(function(angular) {
    'use strict';

    angular.module('pdx.controllers')
        .controller('PreScreenController', function(AppConst, CommonService, AccountService,
            $scope, $state, $uibModal, RegistrationFactory, $filter, RegistrationConst, $stateParams, MAFactory, ImportPermitFactory,
            NotificationService, $ngConfirm, ModuleSettingsFactory, $http, $sce, $q) {
            var vm = this;
            var checklistChanged = false;

            vm.CompareCheckList = _compareCheckList;
            vm.completePrescreen = _completePrescreen;
            vm.completeMA = _completeMA;
            vm.returnMa = _returnMa;
            vm.returnToAgent = _returnToAgent;
            vm.verifyMa = _verifyMa;
            vm.verify = _verify;

            vm.notifyChecklistChanged = _notifyChecklistChanged;
            vm.saveChecklist = _saveChecklist;
            vm.changeMAStatus = _changeMAStatus;

            vm.openUploadedModal = _openUploadedModal;
            // MA Editable Fields
            vm.saveMAField = _saveMAField;
            vm.disableNonSelectedVariationFields = _disableNonSelectedVariationFields;
            vm.showAnswerButton = RegistrationFactory.showAnswerButton;

            init();
            reloadMARegistration();

            function init() {
                vm.userInfo = AccountService.userInfo();
                vm.maId = $stateParams.maId;
                vm.assesserType = MAFactory.maUserResponderType.get({ maId: vm.maId, userId: vm.userInfo.id });
                vm.isVariationType = "null";
                vm.prescreenValidation = { checklist: [] };
                vm.deficiencyCheckLists = [];
                vm.updateStatusLogValidation = {};
                vm.maStatusValidation = {};
                vm.showComment = true;
                vm.CONSTANT = RegistrationConst;

                $state.go('maregistration.prescreen.prescreen', { maId: vm.maId });
            }


            function reloadMARegistration() {
                MAFactory.maSingle.get({ maId: vm.maId }).$promise.then(
                    function(response) {
                        var data = response.result;
                        vm.maregistration = data;
                        vm.submoduleTypeCode = vm.maregistration.submoduleTypeCode;
                        // get all documents
                        vm.moduleDocuments = ImportPermitFactory.submoduleAttachment.query({
                            submoduleCode: data.ma.maType.maTypeCode,
                            referenceId: vm.maId
                        });
                        // get all fields related to submoduleType for screener to pick
                        vm.isVariationType = RegistrationFactory.isVariationType(data.ma.maType.maTypeCode);
                        RegistrationFactory.maFieldByType.query({ isVariationType: vm.isVariationType, submoduleTypeCode: vm.submoduleTypeCode }, function(data) {
                            // !important don't rename this. It's required by fields.html modal
                            vm.data = data;
                        });

                        _.each(data.checklists, function(ch) {
                            recursiveFunction(ch);
                        });

                        if (vm.isVariationType) {
                            vm.currentMAFieldState = RegistrationFactory.maFieldById.query({
                                id: data.ma.originalMAID,
                                isVariationType: vm.isVariationType,
                                submoduleTypeCode: vm.submoduleTypeCode 
                            });
                        }

                        prepareModuleDocuments(data);

                        return data;
                    }
                );
            }

            function prepareModuleDocuments(data) {
                ModuleSettingsFactory.moduleDocumentByDocumentTypeCode.get({
                    submoduleCode: data.ma.maType.maTypeCode,
                    documentTypeCode: vm.CONSTANT.DOCUMENT_TYPE.PAYMENT_RECEIPT_EVALUATION
                }, function(dataDocument) {
                    vm.feeDocument = dataDocument;
                    vm.feeDocument.required = vm.feeDocument.isRequired ? 'Yes' : 'No';
                    vm.feeDocument.attachmentInfo = {
                        moduleDocumentID: vm.feeDocument.id,
                        createdBy: vm.userInfo.id,
                        updatedBy: vm.userInfo.id,
                        tempFolderName: data.identifier,
                        filePath: "filePath",
                        tempFileName: vm.feeDocument.documentType.name
                    };
                    _.each(data.uploadedDocuments, function(ud) {
                        if (ud.moduleDocumentID == vm.feeDocument.id) {
                            ud.moduleDocument = null;
                            ud.createdByUser = null;
                            ud.updatedByUser = null;
                            vm.feeDocument.tempFolderName = vm.maregistration.identifier;
                            vm.feeDocument.attachmentInfo.document = ud;
                        }
                    });
                });
            }


            function recursiveFunction(checklist) {
                var preScreenCheckList = $filter('filter')(checklist.maChecklists, { responderType: { responderTypeCode: vm.CONSTANT.RESPONDER_TYPE.PRE_SCREENER } });
                if (checklist.optionGroup != null) {
                    var prescreenPossible = angular.copy(checklist.optionGroup.possibleOptions);
                    checklist.optionGroup.prePossibleOptions = prescreenPossible;
                }
                if (preScreenCheckList == null || preScreenCheckList.length == 0) {
                    var prescreenchk = angular.copy(checklist.maChecklists)[0];
                    if (prescreenchk != null) {
                        prescreenchk.id = 0;
                        prescreenchk.optionID = null;
                        prescreenchk.responderTypeID = 2;
                        prescreenchk.responderType = { responderTypeCode: vm.CONSTANT.RESPONDER_TYPE.PRE_SCREENER };
                        checklist.maChecklists = checklist.maChecklists.concat(prescreenchk);
                    }
                }


                if (checklist.children.length > 0) {
                    _.each(checklist.children, function(ch) {
                        recursiveFunction(ch);
                    })
                }
            }

            function _compareCheckList() {
                vm.deficiencyCheckLists = [];
                vm.prescreenValidation.checklist.$showError = true;
                if (vm.prescreenValidation.checklist.$isValid) {
                    _.each(vm.maregistration.checklists, function(ch) {
                        recursiveCompare(ch)
                    })
                } else return;

            }

            function _completePrescreen() {
                vm.prescreenValidation.checklist.$showError = true;
                vm.deficiencyCheckLists = [];
                if (vm.prescreenValidation.checklist.$isValid) {
                    _.each(vm.maregistration.checklists, function(ch) {
                        recursiveCompare(ch)
                    });
                    if (vm.deficiencyCheckLists.length > 0) {
                        NotificationService.notify("There are discrepancies, you ve to return the application!", "alert-danger");
                    } else {
                        //update Status
                        ManageWorkFlow("Complete Screening", 'green', "Submit", 'btn-primary', vm.completeMA);
                        //$state.go('maregistration.prescreen.verification', { maId: vm.maId });
                    }
                } else return;
            }


            function _completeMA() {
                vm.changeMAStatus(RegistrationConst.MA_STATUS.PRSC);
            }



            function _returnMa() {
                vm.prescreenValidation.checklist.$showError = true;
                vm.deficiencyCheckLists = [];
                if (vm.prescreenValidation.checklist.$isValid) {
                    _.each(vm.maregistration.checklists, function(ch) {
                        recursiveCompare(ch)
                    })
                    var returnConfirm = $ngConfirm({
                        title: "Return to Applicant",
                        contentUrl: 'app/registration/workflow/modals/fields.html',
                        type: 'orange',
                        typeAnimated: true,
                        closeIcon: true,
                        scope: $scope,
                        columnClass: 'col-md-6 col-md-offset-3',
                        buttons: {
                            update: {
                                text: "Return",
                                btnClass: 'btn-warning',
                                action: function() {
                                    vm.updateStatusLogValidation.$showError = true;
                                    if (vm.updateStatusLogValidation.$isValid) {
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
                                                            returnConfirm.close();
                                                            vm.maStatusModel.maid = vm.maregistration.ma.id;
                                                            if (checklistChanged) vm.saveChecklist().then(function() { vm.returnToAgent(); }, function() {});
                                                            else vm.returnToAgent();
                                                        }
                                                    },
                                                    cancel: {
                                                        back: "back",
                                                        btnClass: 'btn-warning',
                                                    }
                                                }
                                            });
                                            return false;
                                        } else {
                                            vm.maStatusModel.maid = vm.maregistration.ma.id;
                                            if (checklistChanged) vm.saveChecklist().then(function() { vm.returnToAgent(); }, function() {});
                                            else vm.returnToAgent();
                                        }
                                    } else {
                                        return false;
                                    }
                                }
                            }
                        }

                    });

                }
            }


            function _returnToAgent() {
                vm.saveMAField(saveMAFieldSuccess, saveMAFieldFailed);
            }

            function saveMAFieldSuccess() {
                vm.changeMAStatus(RegistrationConst.MA_STATUS.RTA);
            }

            function saveMAFieldFailed() {
                NotificationService.notify("Unable to save maField. Please try again!", "alert-danger");
            }

            function _verifyMa() {
                ManageWorkFlow("Verify Registration", 'green', "Verify", 'btn-primary', vm.verify);
            }

            function _verify() {
                vm.changeMAStatus(RegistrationConst.MA_STATUS.VER);
            }

            function recursiveCompare(checklist) {
                if (checklist.children.length > 0) {
                    _.each(checklist.children, function(ch) {
                        recursiveCompare(ch);
                    })
                    return;
                }
                if (checklist.maChecklists != null && checklist.maChecklists.length > 0) {
                    var prescreenerResult = $filter('filter')(checklist.maChecklists, { responderType: { responderTypeCode: vm.CONSTANT.RESPONDER_TYPE.PRE_SCREENER } })[0];
                    prescreenerResult.option = checklist.optionGroup != null && prescreenerResult.optionID != null ? $filter('filter')(checklist.optionGroup.possibleOptions, { id: prescreenerResult.optionID })[0] : {};
                    var applicantResult = $filter('filter')(checklist.maChecklists, { responderType: { responderTypeCode: vm.CONSTANT.RESPONDER_TYPE.APPLICANT } })[0];
                    checklist.isMatch = prescreenerResult.option.name === "No" && applicantResult.option.name === "Yes" ? false : true; // applicant yes pres-screen no ;
                }
                if (checklist.isMatch != null && !checklist.isMatch) vm.deficiencyCheckLists.push(checklist);
            }



            function _notifyChecklistChanged() {
                checklistChanged = true;
            }


            function _saveChecklist() {
                return $q(function(resolve, reject) {
                    prepareChecklist();
                    MAFactory.maChecklist.save(vm.maregistration.ma.maChecklists, function() {
                        NotificationService.notify("Successfully saved checklist!", "alert-success");
                        reloadMARegistration();
                        checklistChanged = false;
                        resolve();
                    }, function() {
                        NotificationService.notify("Unable to save data. Please try again!", "alert-danger");
                        reject();
                    });
                });
            }



            function _changeMAStatus(statusCode) {
                vm.maStatusModel.toStatusCode = statusCode;
                vm.maStatusModel.changedByUserID = vm.userInfo.id;
                vm.maStatusModel.responderID = vm.userInfo.id;
                vm.maStatusModel.responderTypeID = vm.assesserType.id;
                vm.maStatusModel.suggestedStatusCode = statusCode;
                MAFactory.maChangReviewStatus.save({ changeStatus: true }, vm.maStatusModel, function(data) {
                    if (data) {
                        NotificationService.notify("Successfully Submitted", 'alert-success');
                        vm.maStatusModel.Comment = undefined;
                        vm.updateStatusLogValidation.$showError = false;
                        $state.go('maregistration.list.info', { maId: vm.maId });
                    }
                });
            }

            function prepareChecklist() {
                vm.maregistration.ma.maChecklists = RegistrationFactory.recursiveFlatten(vm.maregistration.checklists, 0, 'prescreen');
            }


            function ManageWorkFlow(title, type, buttonText, btnClass, functionCall) {
                $ngConfirm({
                    title: title,
                    contentUrl: 'app/registration/workflow/modals/changeMAStatus.html',
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
                                vm.updateStatusLogValidation.$showError = true;
                                if (vm.updateStatusLogValidation.$isValid) {
                                    vm.maStatusModel.maid = vm.maregistration.ma.id;
                                    if (checklistChanged) vm.saveChecklist().then(function() { functionCall(); }, function() {});
                                    else functionCall();
                                } else {
                                    return false;
                                }
                            }
                        }
                    }
                });
            }

            function _openUploadedModal(moduleDocument) {
                var document = moduleDocument.attachmentInfo.document;
                document.title = moduleDocument.documentType.name;

                $http.post(CommonService.buildUrl(AppConst.API_URL.Attachment.AttachmentSingle, document.id), {}, { responseType: 'arraybuffer' })
                    .success(function(response) {
                        var file = new Blob([response], { type: document.fileType });
                        var fileURL = URL.createObjectURL(file);
                        document.fileContent = $sce.trustAsResourceUrl(fileURL);
                    });

                //Open modal
                $uibModal.open({
                    templateUrl: "app/importPermit/new/modals/fileModal.html",
                    size: 'lg',
                    resolve: {
                        document: document
                    },
                    controller: function($scope, document) {
                        $scope.document = document;
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
                    maField.isVariationType = "null";
                    maFields.push(maField);

                });

                RegistrationFactory.maFieldInsertUpdate.save(maFields, success, failed);
            }


            function _disableNonSelectedVariationFields(node) {
                if (!vm.isVariationType || vm.isVariationType === 'null') return false;
                return RegistrationFactory.disableNonSelectedVariationFields(node, vm.currentMAFieldState);
            }


        });
})(window.angular);
