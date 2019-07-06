(function() {
    'use strict';

    angular.module('pdx.controllers')
        .controller('MADetailController', function(AppConst, CommonService, AccountService,
            $scope, $state, $uibModal, $stateParams, MAFactory, $filter, ModuleSettingsFactory, ImportPermitFactory, $http, $sce,
            RegistrationFactory, NotificationService, $ngConfirm, $window, StorageService, $location, ConfirmationService, RegistrationConst) {
            var vm = this;
            // EDIT MA
            vm.editMa = _editMa;
            // SUBMIT
            vm.submitMa = _submitMa;
            vm.submit = _submit;
            // PRE SCREEN
            vm.preScreen = _preScreen;
            vm.backToPreScreen = _backToPreScreen;
            vm.changeToPrescreen = _changeToPrescreen;
            // VERIFY
            vm.verifyMa = _verifyMa;
            vm.verify = _verify;
            // WITHDRAW
            vm.withdrawMa = _withdrawMa;
            vm.withdraw = _withdraw;
            // DELETE MA functions
            vm.deleteMa = _deleteMa;
            vm.delete = _delete;
            // RE-PRINT
            vm.reprintMA = _reprintMA;
            vm.reprint = _reprint;
            // CHANGE MA STATUS
            vm.changeMAStatus = _changeMAStatus;
            // GENERATE LAB REQUEST
            vm.generateLabRequest = _generateLabRequest;
            vm.generateNotificationLetter = _generateNotificationLetter;

            vm.back = _back;
            vm.gotoOriginalMA = _gotoOriginalMA;
            //  LEGACY DATA RELATED
            vm.allowEditLegacyData = _allowEditLegacyData;
            vm.editLegacyData = _editLegacyData;
            vm.filterVariationFields = _filterVariationFields;
            vm.fieldEditedInLegacyUpdate = _fieldEditedInLegacyUpdate;
            vm.isLegacyData = _isLegacyData;

            vm.getStatusColor = _getStatusColor;
            vm.showAnswerButton = RegistrationFactory.showAnswerButton;
            vm.dossierCustomFilterFunction = _dossierCustomFilterFunction;

            // Document Related
            vm.openFileModal = _openFileModal; //MAPrint
            vm.openUploadedModal = _openUploadedDocumentModal;
            vm.getDocument = _getDocument;
            vm.saveDocument = _saveDocument;
            vm.downloadAttachment = _downloadAttachment;
            vm.printAttachment = _printAttachment;
            vm.savePaymentReceipt = _uploadPaymentReceipt;

            init();



            function init() {
                vm.CONSTANT = RegistrationConst;
                vm.userInfo = AccountService.userInfo();
                vm.maId = $stateParams.maId;
                vm.assesserType = MAFactory.maUserResponderType.get({ maId: vm.maId, userId: vm.userInfo.id });
                vm.feeDocument = [];
                vm.labDocument = [];
                vm.labrequest = [];
                vm.isVariationType = "null";
                vm.updateStatusLogValidation = {};
                vm.feeUpload = {};
                vm.maStatusModel = {};
            }


            // ma-registrationf
            var reloadMA = function() {
                vm.feeDocument = [];
                vm.labDocument = [];
                vm.clinicalReviewDocument = [];
                vm.labrequest = [];

                MAFactory.maSingle.get({ maId: vm.maId }).$promise.then(
                    function(response) {
                        vm.dataAvailability = {
                            isAvailable: response.isSuccess,
                            message: ""
                        };
                        if (vm.dataAvailability.isAvailable) {

                            vm.maregistration = response.result; 
                            vm.submoduleTypeCode = vm.maregistration.submoduleTypeCode;


                            vm.productExcipeints = $filter('filter')(vm.maregistration.product.productCompositions, {
                                excipientID: '!!',
                                isDiluent: false
                            });
                            vm.productInns = $filter('filter')(vm.maregistration.product.productCompositions, { innid: '!!' });
                            vm.productDiluents = $filter('filter')(vm.maregistration.product.productCompositions, { excipientID: '!!', isDiluent: true });
                            ImportPermitFactory.submoduleAttachment.query({
                                submoduleCode: vm.maregistration.ma.maType.maTypeCode,
                                referenceId: vm.maId
                            }, function(uploadedDocuments) {
                                vm.moduleDocuments = $filter('filter')(uploadedDocuments, { moduleDocument: { documentType: { isDossier: false } } });
                                var dossiers = $filter('filter')(uploadedDocuments, { moduleDocument: { documentType: { isDossier: true } } });
                                RegistrationFactory.constructDossierDocuments(vm, ModuleSettingsFactory, vm.maregistration.submoduleCode, dossiers);
                            });

                            vm.assignedCSOUser = $filter('filter')(vm.maregistration.ma.maAssignments, { responderType: { responderTypeCode: RegistrationConst.RESPONDER_TYPE.PRE_SCREENER } })[0];
                            
                            vm.isMaNotificationType = RegistrationFactory.isMaNotificationType(vm.maregistration.ma.maType.maTypeCode); //used for Generate Notification button visibility
                            //check if the MA is variation type by using submodule Code
                            vm.isVariationType = RegistrationFactory.isVariationType(vm.maregistration.submoduleCode);
                            vm.isLegacyEdited = RegistrationFactory.isLegacyDataEdited(vm.maregistration.ma);
                            if (vm.isVariationType === true) {
                                vm.maFields = RegistrationFactory.maFieldById.query({
                                    id: vm.maregistration.ma.originalMAID,
                                    isVariationType: true,
                                    submoduleTypeCode: vm.submoduleTypeCode 
                                });

                                vm.variationSummary = vm.maregistration.ma.maVariationSummary;
                                vm.submoduleFeeGrandTotal = 0;
                                _.each(vm.maregistration.ma.maPayments, function(fee) {
                                    if (fee.submoduleFee.feeType.name.toLowerCase() == 'evaluation fee' && fee.submoduleFee.submodule.submoduleCode == RegistrationConst.SUBMODULE.MINOR_VARIATION) {
                                        fee.submoduleFee.feeType.name = 'Evaluation Fee (Minor Variation)';
                                    }
                                    if (fee.submoduleFee.feeType.name.toLowerCase() == 'evaluation fee' && fee.submoduleFee.submodule.submoduleCode == RegistrationConst.SUBMODULE.MAJOR_VARIATION) {
                                        fee.submoduleFee.feeType.name = 'Evaluation Fee (Major Variation)';
                                    }
                                    fee.submoduleFee.subTotal = fee.quantity * fee.submoduleFee.fee;
                                    vm.submoduleFeeGrandTotal += fee.submoduleFee.subTotal;
                                });
                            }
                            if (vm.isLegacyEdited === true) {
                                vm.currentMAFieldState = RegistrationFactory.maFieldById.query({ id: vm.maregistration.ma.id, isVariationType: "null" ,
                                    submoduleTypeCode: vm.submoduleTypeCode  });
                            }

                            vm.getDocument(RegistrationConst.DOCUMENT_TYPE.PAYMENT_RECEIPT_EVALUATION, vm.feeDocument, vm.maregistration);
                            vm.getDocument(RegistrationConst.DOCUMENT_TYPE.LAB_TEST_RESULT, vm.labDocument, vm.maregistration);
                            vm.getDocument(RegistrationConst.DOCUMENT_TYPE.CLINICAL_REVIEW, vm.clinicalReviewDocument, vm.maregistration);
                            vm.getDocument(RegistrationConst.DOCUMENT_TYPE.PRE_MARKET_LAB_SAMPLE_REQUEST_LETTER, vm.labrequest, vm.maregistration);

                            vm.maregistration.product.presentationP = "";
                            _.each(vm.maregistration.product.presentations, function(present) {
                                vm.maregistration.product.presentation = present.packaging
                                vm.maregistration.product.presentationP = vm.maregistration.product.presentationP = "" ? present.packSize.name + ',<br/>' :
                                    vm.maregistration.product.presentationP + present.packSize.name + ',<br/>'
                            });
                            vm.maregistration.product.presentationP = vm.maregistration.product.presentationP.substring(0, vm.maregistration.product.presentationP.length - 1);
                            _.each(vm.maregistration.checklists, function(ch) {
                                recursiveFunction(ch)
                            });
                        } else {
                            vm.dataAvailability.message = response.message;
                        }
                    }
                );
            };

            reloadMA();
            var recursiveFunction = function(checklist) {
                if (checklist.optionGroup != null) {
                    var prescreenPossible = angular.copy(checklist.optionGroup.possibleOptions)
                    checklist.optionGroup.prePossibleOptions = prescreenPossible
                }
                if (checklist.children.length > 0) {
                    _.each(checklist.children, function(ch) {
                        recursiveFunction(ch);
                    });
                }
            }

            // get MA timeline status
            vm.matimeline = MAFactory.maLogStatus.query({ maID: vm.maId }, function(data) {})
            vm.maCommentTimeline = MAFactory.maCommentTimeline.query({ maID: vm.maId, statusID: 'null' }, function(data) {});
            vm.maAssignmentHistory = RegistrationFactory.maAssignmentHistory.query({ maid: vm.maId });


            function _getDocument(documentcode, objectParam, data) {
                ModuleSettingsFactory.moduleDocumentByDocumentTypeCode.get({
                    submoduleCode: data.ma.maType.maTypeCode,
                    documentTypeCode: documentcode
                }, function(dataDocument) {
                    objectParam.push(dataDocument)
                    _.each(objectParam, function(md) {
                        md.required = md.isRequired ? 'Yes' : 'No'
                        md.attachmentInfo = {
                            moduleDocumentID: md.id,
                            createdBy: vm.userInfo.id,
                            updatedBy: vm.userInfo.id,
                            tempFolderName: data.identifier,
                            filePath: 'filePath',
                            tempFileName: md.documentType != null ? md.documentType.name : ""
                        }
                        _.each(data.uploadedDocuments, function(ud) {
                            if (ud.moduleDocumentID == md.id) {
                                ud.moduleDocument = null
                                ud.createdByUser = null
                                ud.updatedByUser = null
                                md.tempFolderName = vm.maregistration.identifier
                                md.attachmentInfo.document = ud
                            }
                        });
                    });
                });
            }

            function _getStatusColor(status) {
                return RegistrationFactory.colorMap[status];
            }

            function _openFileModal(document) {
                $http.post(CommonService.buildUrlObj(AppConst.API_URL.Attachment.AttachmentSingleByPermission, {
                        id: document.id,
                        userId: vm.userInfo.id,
                        permission: 'MAPrint'
                    }), {}, {
                        responseType: 'arraybuffer'
                    })
                    .success(function(response) {
                        var file = new Blob([response], {
                            type: document.fileType
                        })
                        var fileURL = URL.createObjectURL(file)
                        document.fileContent = $sce.trustAsResourceUrl(fileURL)
                    })

                // Open modal
                $uibModal.open({
                    templateUrl: 'app/importPermit/list/modals/fileModal.html',
                    size: 'lg',
                    resolve: {
                        document: document
                    },
                    controller: function($scope, document) {
                        $scope.document = document
                    }
                })
            }

            function _openUploadedDocumentModal(moduleDocument) {
                var document = moduleDocument.attachmentInfo.document;
                document.title = moduleDocument.documentType.name;

                $http.post(CommonService.buildUrlObj(AppConst.API_URL.Attachment.AttachmentSingleByPermission, {
                        id: document.id,
                        userId: vm.userInfo.id,
                        permission: 'MAPrint'
                    }), {}, { responseType: 'arraybuffer' })
                    .success(function(response) {
                        var file = new Blob([response], { type: document.fileType })
                        var fileURL = URL.createObjectURL(file)
                        document.fileContent = $sce.trustAsResourceUrl(fileURL)
                    });

                // Open modal
                $uibModal.open({
                    templateUrl: 'app/importPermit/new/modals/fileModal.html',
                    size: 'lg',
                    resolve: {
                        document: document
                    },
                    controller: function($scope, document) {
                        $scope.document = document
                    }
                });
            }


            function _downloadAttachment(idocument) {
                var a = document.createElement('a');
                document.body.appendChild(a);
                $http.post(CommonService.buildUrlObj(AppConst.API_URL.Attachment.AttachmentSingleByPermission, {
                        id: idocument.id,
                        userId: vm.userInfo.id,
                        permission: 'MAPrint'
                    }), {}, {
                        responseType: 'arraybuffer'
                    })
                    .success(function(response) {
                        var file = new Blob([response], {
                            type: idocument.fileType
                        });
                        vm.fileURL = URL.createObjectURL(file);
                        vm.fileContent = $sce.trustAsResourceUrl(vm.fileURL);
                        a.href = vm.fileContent;
                        a.download = idocument.moduleDocument.documentType.name;
                        a.click();
                    });
            }

            function _printAttachment(doc) {
                $http.post(CommonService.buildUrl(AppConst.API_URL.Attachment.AttachmentDownload, doc.id), {}, {
                    responseType: 'arraybuffer'
                }).success(function(data, status, headers, config) {
                    var pdfFile = new Blob([data], {
                        type: doc.fileType
                    });
                    var pdfUrl = URL.createObjectURL(pdfFile);
                    var fileContent = $sce.trustAsResourceUrl(pdfUrl);
                    var printwWindow = $window.open(fileContent, '_blank');
                    printwWindow.print();
                }).error(function(data, status, headers, config) { 
                    NotificationService.notify('Sorry, something went wrong', 'alert-danger');
                });
            }


            function _editMa() {
                switch (vm.maregistration.submoduleCode) {
                    case RegistrationConst.SUBMODULE.RENEWAL:
                    case RegistrationConst.SUBMODULE.RENEWAL_FOOD:
                    case RegistrationConst.SUBMODULE.RENEWAL_MD_IVD:
                    case RegistrationConst.SUBMODULE.RENEWAL_MD_NON_IVD:
                    case RegistrationConst.SUBMODULE.RENEWAL_MD_NOTIFICATION_IVD:
                    case RegistrationConst.SUBMODULE.RENEWAL_MD_NOTIFICATION_NON_IVD:
                        $state.go('maregistration.renewal.update', { maId: vm.maId });
                        break;
                    case RegistrationConst.SUBMODULE.MAJOR_VARIATION:
                    case RegistrationConst.SUBMODULE.MINOR_VARIATION:
                    case RegistrationConst.SUBMODULE.MAJOR_FOOD_VARIATION:
                    case RegistrationConst.SUBMODULE.MINOR_FOOD_VARIATION:
                    case RegistrationConst.SUBMODULE.MAJOR_MEDICAL_DEVICE_VARIATION:
                    case RegistrationConst.SUBMODULE.MINOR_MEDICAL_DEVICE_VARIATION:
                        // if application is withdrawn, then go to info page to add variation information
                        if (vm.maregistration.ma.maStatus.maStatusCode === RegistrationConst.MA_STATUS.WITH) {
                            $state.go('maregistration.variation.variationInformation', { id: vm.maId, isUpdate: true });
                        } else {
                            // go to edit variation page
                            $state.go('maregistration.variation.update', {
                                maId: vm.maId,
                                variationInformation: undefined
                            });
                        }
                        break;
                    default:
                        //TODO: implement properly, here new application is used as a fallback case
                        $state.go('maregistration.newApplication.update', { maId: vm.maId });
                        break;
                }
            }

            function _preScreen() {
                $state.go('maregistration.prescreen', { maId: vm.maId });
            }

            function _backToPreScreen() {
                ManageWorkFlow("Back to Screen", 'orange', "Screen", 'btn-warning', vm.changeToPrescreen);
            }

            function _verifyMa() {
                ManageWorkFlow("Verify Registration", 'green', "Verify", 'btn-primary', vm.verify);
            }

            function _verify() {
                var confirm = ConfirmationService.confirm('Verify?');
                confirm.onAction = function(scope, btnName) {
                    if (btnName == 'yes') {
                        vm.changeMAStatus(RegistrationConst.MA_STATUS.VER);
                    }
                };
            }

            function _changeToPrescreen() {
                vm.changeMAStatus(RegistrationConst.MA_STATUS.PRSC);
            }


            function _withdrawMa() {
                ManageWorkFlow("Withdraw Registration", 'orange', "Withdraw", 'btn-warning', vm.withdraw);
            }

            function _withdraw() {
                vm.maStatusModel.toStatusCode = RegistrationConst.MA_STATUS.WITH;
                vm.maStatusModel.changedByUserID = vm.userInfo.id
                MAFactory.maChangeStatus.save(vm.maStatusModel, function(data) {
                    if (data) {
                        NotificationService.notify('Successfully Withdrawn', 'alert-success');
                        reloadMA();
                    }
                })
                vm.updateStatusLogValidation.$showError = false
            }

            function _reprintMA() {
                ManageWorkFlow("Re-print Registration", 'green', "Reprint", 'btn-primary', vm.reprint);
            }

            function _reprint() {
                MAFactory.reprintMA.get({
                    maID: vm.maId,
                    userID: vm.userInfo.id
                }, function(data) {
                    if (data) {
                        NotificationService.notify('Successfully generated', 'alert-success');
                        reloadMA();
                    }
                }, function() {
                    NotificationService.notify('Unable to generate document. Please try again!', 'alert-danger')
                })
                vm.updateStatusLogValidation.$showError = false
            }


            function _submitMa() {
                ManageWorkFlow("Submit Registration", 'green', "Submit", 'btn-primary', vm.submit);
            }

            function _submit() {
                vm.maStatusModel.toStatusCode = RegistrationConst.MA_STATUS.RQST;
                vm.maStatusModel.changedByUserID = vm.userInfo.id;
                MAFactory.maChangeStatus.save(vm.maStatusModel, function(data) {
                    if (data) {
                        NotificationService.notify('Successfully Submitted', 'alert-success');
                        reloadMA();
                    }
                });
                vm.updateStatusLogValidation.$showError = false;
            }


            function _deleteMa() {
                ManageWorkFlow("Delete Registration", 'danger', "Delete", 'btn-danger', vm.delete);
            }

            function _delete() {
                vm.maStatusModel.changedByUserID = vm.userInfo.id;
                MAFactory.maDelete.save(vm.maStatusModel, function(data) {
                    if (data) {
                        NotificationService.notify('Successfully Deleted', 'alert-success');
                        $state.go('maregistration.list');
                    }
                });
                vm.updateStatusLogValidation.$showError = false;
            }


            function _changeMAStatus(statusCode) {
                vm.maStatusModel.toStatusCode = statusCode;
                vm.maStatusModel.changedByUserID = vm.userInfo.id;
                vm.maStatusModel.responderID = vm.userInfo.id;
                vm.maStatusModel.responderTypeID = vm.assesserType.id;
                vm.maStatusModel.suggestedStatusCode = statusCode;
                MAFactory.maChangReviewStatus.save({ changeStatus: true }, vm.maStatusModel, function(data) {
                    if (data) {
                        var NotificationMessage = "Successfully Submitted";
                        switch (statusCode) {
                            case RegistrationConst.MA_STATUS.VER:
                                NotificationMessage = "Successfully Verified";
                                break;
                            default:
                                NotificationMessage = "Successfully Submitted";
                        }
                        NotificationService.notify(NotificationMessage, 'alert-success');
                        vm.maStatusModel.Comment = undefined;
                        vm.updateStatusLogValidation.$showError = false;
                        $state.reload();
                    }
                });
            }


            function _uploadPaymentReceipt() {
                vm.feeUpload.$showError = true
                if (vm.feeUpload.$isValid) {
                    var documents = []
                    _.each(vm.feeDocument, function(md) {
                        if (md.attachmentInfo.document) {
                            md.attachmentInfo.document.moduleDocument = null
                            md.attachmentInfo.document.referenceID = vm.maId
                            documents.push(md.attachmentInfo.document)
                        }
                    })
                    RegistrationFactory.updateAttachment.update(documents[0], function() {
                        vm.maStatusModel.toStatusCode = RegistrationConst.MA_STATUS.FATCH;
                        vm.maStatusModel.changedByUserID = vm.userInfo.id;
                        vm.maStatusModel.maid = vm.maId;
                        MAFactory.maChangeStatus.save(vm.maStatusModel, function(data) {
                            if (data) {
                                NotificationService.notify('Fee submitted successfully', 'alert-success');
                                $state.reload();
                            }
                        })
                    }, function() {
                        NotificationService.notify('Error occurred, Please try again!', 'alert-danger');
                    })
                } else return
            }

            function _saveDocument(documentAttached) {
                vm.feeUpload.$showError = true
                if (vm.feeUpload.$isValid) {
                    var documents = []
                    _.each(documentAttached, function(md) {
                        if (md.attachmentInfo.document) {
                            md.attachmentInfo.document.moduleDocument = null
                            md.attachmentInfo.document.referenceID = vm.maId
                            documents.push(md.attachmentInfo.document)
                        }
                    })
                    RegistrationFactory.updateAttachment.update(documents[0], function() {
                        NotificationService.notify('Successfully updated', 'alert-success');
                        $state.reload();
                    }, function() {
                        NotificationService.notify('Unable to save data. Please try again!', 'alert-danger');
                    })
                } else return
            }

            function _generateLabRequest() {
                RegistrationFactory.generateLabRequest.get({
                    maID: vm.maId,
                    userID: vm.userInfo.id
                }, function(data) {
                    if (data) {
                        NotificationService.notify('Successfully generated', 'alert-success');
                        reloadMA();
                    }
                }, function() {
                    NotificationService.notify('Unable to generate document. Please try again!', 'alert-danger')
                })
            }

            function _generateNotificationLetter() {
                WorkFlowConfirmModal("Approve Registration and Generate Notification Letter", 'green', "Approve", 'btn-primary', 'Are you sure you want to approve this registration?', approveAndGenerateNotification);
            }

            function approveAndGenerateNotification() {
                vm.maregistration.toStatusCode = RegistrationConst.MA_STATUS.APR;
                vm.maregistration.ma.modifiedByUserID = vm.userInfo.id;
                vm.maregistration.ma.id = vm.maId;
                MAFactory.approveNotification.save(vm.maregistration, function(response) {
                    if (response.isSuccess === true) {
                        NotificationService.notify('Successfully Generated Notification Letter', 'alert-success');
                        reloadMA();
                    }
                }, function() {
                    NotificationService.notify('Unable to approve and generate notification letter. Please try again!', 'alert-danger');
                });
            }


            function ManageWorkFlow(title, type, buttonText, btnClass, functionCall) {
                vm.commentTitle = title == "Withdraw Registration" ? "Reason" : "Comment";
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
                                    vm.maStatusModel.modifiedByUserID = vm.userInfo.id
                                    functionCall();
                                } else {
                                    return false;
                                }
                            }
                        }
                    }
                });
            }

            function WorkFlowConfirmModal(title, type, buttonText, btnClass, content, functionCall) {
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
                });
            }

            function _back() {
                var currentMAID = $stateParams.currentMAID;
                var previousMAID = $stateParams.previousMAID;
                if (currentMAID && currentMAID > 0) {
                    //The previous page was from another detail (probably variation or renewal) to go back to it.
                    $state.go('maregistration.list.info', { maId: currentMAID, currentMAID: previousMAID });
                    //Remove data from localStorage
                    StorageService.remove(AppConst.StorageKeys.CurrentMAID);
                } else if (currentMAID) {
                    //the previous page was from renewal/variation applications, to go back to it, return one step in browser history.
                    $location.url(currentMAID);
                } else {
                    //If no currrentMAID is found, just go to ma lists!
                    $state.go('maregistration.list');
                }
            }

            function _gotoOriginalMA(maID) {
                var currentMAID = vm.maregistration.ma.id;
                var previousMAID = $stateParams.currentMAID;
                $state.go('maregistration.list.info', { maId: maID, currentMAID: currentMAID, previousMAID: previousMAID });
            }

            function _filterVariationFields(value) {
                return value.isVariationType === true && value.fieldCode !== 'MA' && value.fieldCode !== 'Product'

            }



            function _allowEditLegacyData() {
                RegistrationFactory.allowEditLegacyData(vm.maregistration.ma);
            }



            function _editLegacyData() {
                RegistrationFactory.editLegacyData(vm.maregistration.ma);
            }



            //TODO:: Added to handle Dossier document tab. Remove when better option is found!
            function _dossierCustomFilterFunction(value) {
                //Check if document has children, or it has an uploaded file without children; If not both, returns false;
                var hasChildren = value.children && value.children.length > 0;
                if (!hasChildren) {
                    return value.isParent !== true || value.filePath ? true : false;
                } else {
                    return true;
                }
            }

            function _fieldEditedInLegacyUpdate(value) {
                return !RegistrationFactory.isInputDisabled(vm, value);
            }

            function _isLegacyData() {
                var LegacyDataRegex = /(\/LD)$/gm;
                return LegacyDataRegex.test(vm.maregistration.ma.maNumber);
            }


        });
})();