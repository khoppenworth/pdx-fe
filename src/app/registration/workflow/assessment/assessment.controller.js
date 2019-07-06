(function() {
    'use strict';

    angular.module('pdx.controllers')
        .controller('AssessmentController', function(AccountService, ChecklistFactory, $stateParams, MAFactory, NotificationService, $http, AppConst,
            $filter, $ngConfirm, $scope, $state, RegistrationFactory, $uibModal, ImportPermitFactory, ModuleSettingsFactory, $sce, CommonService, RegistrationConst) {
            var vm = this;

            vm.maId = $stateParams.maId;
            vm.submoduleCode = $stateParams.submoduleCode;
            vm.maregistrationValidation = { checklist: {}, review: {} };
            vm.maFlatChecklist = [];
            vm.maStatusModel = {};

            vm.primaryReviewResult = {};
            vm.secondaryReviewResult = {};
            vm.teamLeaderReviewResult = {};

            vm.maStatusModel.ma = {};
            vm.approveValidation = {};

            var firCommentHtml = "<ul>";
            vm.showFirFlag = true;

            vm.commentTitle = "Comment";

            vm.saveChecklistForAssessment = _saveChecklistForAssessment;
            vm.reviewRegistration = _reviewRegistration;
            vm.getStatusColor = _getStatusColor;
            vm.approveMA = _approveMA;
            vm.approve = _approve;
            vm.rejectMA = _rejectMA;
            vm.reject = _reject;
            vm.returnMA = _returnMA;
            vm.return = _return;
            vm.voidMA = _voidMA;
            vm.void = _void;
            vm.changeMAStatus = _changeMAStatus;
            vm.reviewViewStatus = _reviewViewStatus;
            vm.showPrimaryAnswer = _showPrimaryAnswer;
            vm.flagChecklistFIR = _flagChecklistFIR;
            vm.reviewTabVisibility = _reviewTabVisibility;
            vm.printResponse = _printResponse;
            vm.openFileModal = _openFileModal;
            vm.downloadAttachment = _downloadAttachment;
            vm.dossierCustomFilterFunction = _dossierCustomFilterFunction;
            vm.checklistAnswerChanged = _checklistAnswerChanged;
            vm.changeNotify = _changeNotify;
            vm.pageChanged = _pageChanged;
            vm.initChecklist = _initChecklist;
            vm.canExpand = _canExpand;
            vm.canCollapse = _canCollapse;
            vm.toggleChecklistChild = _toggleChecklistChild;
            vm.canShowPrimaryAnswer = _canShowPrimaryAnswer;

            init();

            function init() {
                vm.userInfo = AccountService.userInfo();
                vm.assesserType = MAFactory.maUserResponderType.get({ maId: vm.maId, userId: vm.userInfo.id });
                vm.currentStatus = {};
                MAFactory.maSingle.get({ maId: vm.maId }).$promise.then(function(response) {
                    var data = response.result;
                    vm.ma = data;
                    vm.submoduleTypeCode = data.submoduleTypeCode;
                    vm.currentStatus = data.ma.maStatus;
                    ImportPermitFactory.submoduleAttachment.query({
                        submoduleCode: data.ma.maType.maTypeCode,
                        referenceId: vm.maId
                    }, function(uploadedDocuments) {
                        vm.moduleDocuments = $filter('filter')(uploadedDocuments, { moduleDocument: { documentType: { isDossier: false } } });
                        var dossiers = $filter('filter')(uploadedDocuments, { moduleDocument: { documentType: { isDossier: true } } });
                        RegistrationFactory.constructDossierDocuments(vm, ModuleSettingsFactory, vm.ma.submoduleCode, dossiers);
                    });
                    reloadMAChecklist();
                    return data;
                });
                vm.variationChangeList = MAFactory.maVariationChange.query({ maId: vm.maId });

                vm.checklistWithReview = MAFactory.maReviewWithChecklist.query({
                    maId: vm.maId,
                    submoduleCode: vm.submoduleCode
                }, function(data) {
                    vm.primaryReviewResult = $filter('filter')(data, { responderType: { responderTypeCode: "PRAS" } })[0];
                    vm.secondaryReviewResult = $filter('filter')(data, { responderType: { responderTypeCode: "SCAS" } })[0];
                    vm.teamLeaderReviewResult = $filter('filter')(data, { responderType: { responderTypeCode: "TLD" } })[0];
                    return data;
                });
            }

            function _saveChecklistForAssessment(type) {
                if (vm.maFlatChecklist.length == 0) return;
                MAFactory.maChecklist.save(vm.maFlatChecklist, function() {
                    NotificationService.notify("Successfully saved checklist!", "alert-success");
                    if (type != 'draft') {
                        reloadMAChecklist();
                    }
                }, function() {
                    NotificationService.notify("Unable to save data. Please try again!", "alert-danger");
                });
            }

            function _reviewRegistration() {
                vm.saveChecklistForAssessment();
                firCommentHtml = firCommentHtml != "" ? firCommentHtml + "</ul>" : "";
                $state.go('maregistration.review', { maId: vm.maId, submoduleCode: vm.submoduleCode, submoduleTypeCode: vm.submoduleTypeCode, firCommentHtml: firCommentHtml });
            }

            function _getStatusColor(status) {
                return RegistrationFactory.colorMap[status];
            }

            function _approveMA() {
                vm.ma.variationChangeList = vm.variationChangeList;
                if (vm.maStatusModel.ma.isNotificationType) {
                    $uibModal.open({
                        backdrop: "static",
                        templateUrl: "app/registration/workflow/assessment/templates/notificationApprove.modal.html",
                        size: 'lg',
                        resolve: {
                            ma: vm.ma
                        },
                        controller: "NotificationModalController",
                        controllerAs: 'vm'
                    });
                } else { manageWorkFlow("Approve Registration", 'green', "Approve", 'btn-primary', 'Are you sure you want to approve this registration?', vm.approve); }
            }

            function _approve() {
                vm.maStatusModel.toStatusCode = RegistrationConst.MA_STATUS.APR;
                vm.maStatusModel.ma.modifiedByUserID = vm.userInfo.id;
                vm.maStatusModel.ma.id = vm.maId;
                MAFactory.approve.save(vm.maStatusModel, function(response) {
                    RegistrationFactory.submitMAResponse(response, {
                        stateName: 'maregistration.list.info',
                        params: { maId: vm.maId }
                    });
                }, function() {
                    NotificationService.notify('Unable to approve. Please try again!', 'alert-danger');
                });
            }

            function _rejectMA() {
                manageWorkFlow("Reject Registration", 'red', "Reject", 'btn-danger', 'Are you sure you want to reject this registration?', vm.reject);
            }

            function _reject() {
                vm.changeMAStatus(RegistrationConst.MA_STATUS.REJ);
            }

            function _returnMA() {
                $ngConfirm({
                    title: "Return Registration To Team Leader",
                    contentUrl: 'app/registration/workflow/modals/changeMAStatus.html',
                    type: "orange",
                    typeAnimated: true,
                    closeIcon: true,
                    scope: $scope,
                    columnClass: 'col-md-6 col-md-offset-3',
                    buttons: {
                        update: {
                            text: "Return",
                            btnClass: 'btn-warning',
                            action: function() {
                                vm.maStatusModel.maid = vm.maId;
                                vm.maStatusModel.responderID = vm.userInfo.id;
                                vm.maStatusModel.responderTypeID = vm.assesserType.id;
                                vm.return();
                            }
                        }
                    }
                });
            }

            function _return() {
                vm.changeMAStatus(RegistrationConst.MA_STATUS.RTL);
            }

            function _voidMA() {
                $ngConfirm({
                    title: "Void Application",
                    contentUrl: 'app/registration/workflow/modals/changeMAStatus.html',
                    type: "red",
                    typeAnimated: true,
                    closeIcon: true,
                    scope: $scope,
                    columnClass: 'col-md-6 col-md-offset-3',
                    buttons: {
                        update: {
                            text: "Void",
                            btnClass: 'btn-danger',
                            action: function() {
                                vm.maStatusModel.maid = vm.maId;
                                vm.maStatusModel.responderID = vm.userInfo.id;
                                vm.maStatusModel.responderTypeID = vm.assesserType.id;
                                vm.void();
                            }
                        }
                    }
                });
            }

            function _void() {
                vm.changeMAStatus(RegistrationConst.MA_STATUS.VOID);
            }

            function _changeMAStatus(statusCode) {
                vm.maStatusModel.toStatusCode = statusCode;
                vm.maStatusModel.changedByUserID = vm.userInfo.id;
                vm.maStatusModel.responderID = vm.userInfo.id;
                vm.maStatusModel.suggestedStatusCode = statusCode;
                MAFactory.maChangeStatus.save(vm.maStatusModel, function(data) {
                    if (data) {
                        NotificationService.notify("Successfully Saved", 'alert-success');
                        $state.go('maregistration.list.info', { maId: vm.maId });
                    }
                });
            }

            function _reviewViewStatus() {
                if ((vm.assesserType.responderTypeCode === 'PRAS' && (vm.primaryReviewResult.maReview == null || vm.primaryReviewResult.maReview.isDraft || !vm.primaryReviewResult.maReview.isActive)))
                    return true;
                else if ((vm.assesserType.responderTypeCode === 'SCAS' && (vm.primaryReviewResult.maReview !== null && !vm.primaryReviewResult.maReview.isDraft && vm.primaryReviewResult.maReview.isActive) &&
                        (vm.secondaryReviewResult.maReview == null || vm.secondaryReviewResult.maReview.isDraft || !vm.secondaryReviewResult.maReview.isActive)))
                    return true;
                else return false;
            }

            function _showPrimaryAnswer(checklist) {
                vm.primaryAnswerChecklist = checklist;
                $ngConfirm({
                    title: "Primary Assessor Answer",
                    contentUrl: 'app/registration/workflow/assessment/templates/primaryAnswer.html',
                    type: "green",
                    typeAnimated: true,
                    closeIcon: true,
                    scope: $scope,
                    columnClass: 'col-md-6 col-md-offset-3'
                });
            }



            function _flagChecklistFIR(checklist) {
                firCommentHtml = firCommentHtml + "<li>" + checklist.answer + "</li>";
                NotificationService.notify('Checklist answer added!', 'alert-success');
                checklist.showFirFlag = true;
            }

            function _reviewTabVisibility(tab) {
                switch (tab) {
                    case "review":
                        if ((vm.assesserType.responderTypeCode === 'PRAS' || (vm.assesserType.responderTypeCode === 'SCAS' &&
                                vm.primaryReviewResult.reviewChecklists != null && vm.primaryReviewResult.reviewChecklists.length > 0 && vm.primaryReviewResult.maReview != null &&
                                !vm.primaryReviewResult.maReview.isDraft &&
                                vm.primaryReviewResult.maReview.isActive))) {
                            return true;
                        }
                        break;
                    case "reviewPrimaryNotCompleted":
                        if ((vm.assesserType.responderTypeCode === 'SCAS' &&
                                (vm.primaryReviewResult.reviewChecklists == null || vm.primaryReviewResult.maReview.isDraft ||
                                    !vm.primaryReviewResult.maReview.isActive))) {
                            return true;
                        }
                        break;
                    case "primary":
                        if ((vm.assesserType.responderTypeCode === 'PRAS' && vm.primaryReviewResult != null && vm.primaryReviewResult.reviewChecklists != null &&
                                vm.primaryReviewResult.reviewChecklists.length > 0) || (vm.primaryReviewResult != null && vm.primaryReviewResult.reviewChecklists != null &&
                                vm.primaryReviewResult.reviewChecklists.length > 0 && vm.primaryReviewResult.maReview != null && !vm.primaryReviewResult.maReview.isDraft)) {
                            return true;
                        }
                        break;
                    case "secondary":
                        if ((vm.assesserType.responderTypeCode === 'SCAS' && vm.secondaryReviewResult != null && vm.secondaryReviewResult.reviewChecklists != null &&
                                vm.secondaryReviewResult.reviewChecklists.length > 0) || (vm.secondaryReviewResult != null && vm.secondaryReviewResult.reviewChecklists != null &&
                                vm.secondaryReviewResult.reviewChecklists.length > 0 && vm.secondaryReviewResult.maReview != null && !vm.secondaryReviewResult.maReview.isDraft)) {
                            return true;
                        }
                        break;
                    case "teamleader":
                        if ((vm.teamLeaderReviewResult.maReview != null && !vm.teamLeaderReviewResult.maReview.isDraft)) {
                            return true;
                        }
                        break;
                    case "reviewNotCompletedTeamLeader":
                        if (vm.assesserType.responderTypeCode === 'SCAS' && (vm.primaryReviewResult.reviewChecklists == null || (vm.primaryReviewResult.maReview != null &&
                                vm.primaryReviewResult.maReview.isDraft) || (vm.primaryReviewResult.reviewChecklists != null &&
                                vm.primaryReviewResult.reviewChecklists.length == 0))) {
                            return true;
                        }
                        break;
                    default:
                        return false;
                }
            }

            function _printResponse() {
                vm.checklistPrintAnswer = MAFactory.maReviewPrintChecklist.query({
                    maID: vm.maId,
                    submoduleCode: vm.submoduleCode,
                    checklistTypeCode: "RVIW"
                });

                $uibModal.open({
                    backdrop: "static",
                    templateUrl: "app/registration/workflow/assessment/templates/printchecklist.modal.html",
                    size: 'lg',
                    resolve: {},
                    controller: "PrintChecklistModalController",
                    controllerAs: 'vm'
                });
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

            function _downloadAttachment(idocument) {
                var a = document.createElement('a')
                document.body.appendChild(a)
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
                        })
                        vm.fileURL = URL.createObjectURL(file)
                        vm.fileContent = $sce.trustAsResourceUrl(vm.fileURL)
                        a.href = vm.fileContent
                        a.download = idocument.moduleDocument.documentType.name
                        a.click()
                    })
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

            function _checklistAnswerChanged(checklist, type) {
                //Runs through the checklist and its children to set if the checklist should be marked as read!
                //1. If the checklist is an answer node, it should be answered
                //2. If the checklist is a parent node, all its children should be answered
                //TODO:: Currently this is used in ng-if condition so it runs every time a template re run occurs
                //  but is ORED with 'true' so ng-if will always be true. see reviewerChecklist.tempate.html for usage.
                // Resorted to this implemenation because somehow it doesn't fully work with ng-change specially in the first run.
                // So better implemented with ng-change for a proper solution
                if (checklist.children && checklist.children.length > 0) {
                    //is a parent, so check its children answered flag
                    checklist.answered = _.every(checklist.children, function(child) {
                        return vm.checklistAnswerChanged(child, type);
                    });
                } else {
                    if (type || type == 'assessment') {
                        checklist.answered = checklist.maChecklists.length > 0 ? checklist.maChecklists[0].answer || checklist.maChecklists[0].optionID : false;
                    } else {
                        checklist.answered = checklist.answer || checklist.optionID;
                    }

                }
                return checklist.answered;
            }

            function _changeNotify(changedChecklist) {
                if (changedChecklist.answer == "" || changedChecklist.answer == null) return;
                var checklist = {
                    checklistID: changedChecklist.id,
                    responderID: vm.userInfo.id,
                    responderTypeID: vm.assesserType.id,
                    maId: vm.maId,
                    answer: changedChecklist.answer,
                    optionID: changedChecklist.optionID,
                    id: changedChecklist.maChecklistID
                }
                var index = myIndexOf(checklist);
                if (index === -1) {
                    //the checklist is not in changed list .. so add it.
                    vm.maFlatChecklist.push(checklist);
                } else {
                    vm.maFlatChecklist[index] = checklist;
                }
            }

            //pagination
            function _pageChanged(pageNo, checklist) {
                checklist.children = $filter('orderBy')(checklist.children, 'priority');
                var pagedData = checklist.children.slice(
                    (pageNo - 1) * 3,
                    pageNo * 3
                );
                checklist.pagedChildren = pagedData;
            }

            //init checklist
            function _initChecklist(checklist) {
                checklist.rowExpanded = false;
                checklist.pagedChildren = checklist.children;
                checklist.currentPage = 1;
                checklist.style = 'min-width:60px';
                checklist.answered = false;
                vm.pageChanged(checklist.currentPage, checklist);
            }

            //can parent checklist expand to show child
            function _canExpand(checklist) {
                return (checklist.rowExpanded == false && checklist.children.length > 0);
            }

            //can parent checklist collapse to hide child
            function _canCollapse(checklist) {
                return (checklist.rowExpanded == true && checklist.children.length > 0);
            }

            //collapse or expand parent checklist
            function _toggleChecklistChild(checklist) {
                return checklist.rowExpanded = !checklist.rowExpanded;
            }

            //
            function _canShowPrimaryAnswer(checklist) {
                return (!checklist.children.length > 0 && vm.assesserType.responderTypeCode == 'SCAS');
            }

            //------------------------------------------------------------------------------------

            function manageWorkFlow(title, type, buttonText, btnClass, content, functionCall) {
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

            //Register to autosave counter  [fired from keepalive (part of ng
            $scope.$on('Keepalive', function() {
                vm.saveChecklistForAssessment('draft');
            });

            function myIndexOf(checklist) {
                for (var i = 0; i < vm.maFlatChecklist.length; i++) {
                    if (vm.maFlatChecklist[i].checklistID == checklist.checklistID) {
                        return i;
                    }
                }
                return -1;
            }

            function reloadMAChecklist() {
                vm.maChecklist = MAFactory.maChecklistAnswer.query({
                    maId: vm.maId,
                    submoduleCode: vm.submoduleCode,
                    userId: vm.userInfo.id,
                    isSra: vm.ma.ma.isSRA
                }, function(data) {
                    vm.submoduleCheckList = ChecklistFactory.ChecklistBySubmodule.query({
                        submoduleCode: vm.submoduleCode,
                        checklistTypeCode: "RVIW",
                        isSra: vm.ma.ma.isSRA
                    }, function(subChecklists) {
                        var checklists = RegistrationFactory.flattenChecklist(data);
                        _.each(subChecklists, function(subCh) {
                            _.each(checklists, function(ch) {
                                recursiveFunction(subCh, ch);
                            });
                        });
                        return subChecklists;
                    });
                    return data;
                });
            }

            function recursiveFunction(subModuleChecklist, checklist) {
                var answeredCheckLists = $filter('filter')(checklist.maChecklists, { responderID: vm.userInfo.id });
                var primaryanswer = vm.assesserType.responderTypeCode == 'SCAS' ? $filter('filter')(checklist.maChecklists, { responderType: { responderTypeCode: "PRAS" } }) : null
                var filteredAnswer = $filter('filter')(primaryanswer, { checklistID: subModuleChecklist.id });

                if (answeredCheckLists.length == 0 && subModuleChecklist.id === checklist.id) {
                    subModuleChecklist.primaryAnswer = vm.assesserType.responderTypeCode == 'SCAS' && filteredAnswer.length > 0 ? filteredAnswer[0].answer : null;
                }
                _.each(answeredCheckLists, function(answeredCheckList) {
                    if (answeredCheckList.checklistID == subModuleChecklist.id) {
                        subModuleChecklist.optionID = answeredCheckList.optionID;
                        subModuleChecklist.answer = answeredCheckList.answer;
                        subModuleChecklist.maChecklistID = answeredCheckList.id;
                        subModuleChecklist.primaryOptionID = vm.assesserType.responderTypeCode == 'SCAS' && filteredAnswer.length > 0 ? filteredAnswer[0].optionID : null;
                        subModuleChecklist.primaryAnswer = vm.assesserType.responderTypeCode == 'SCAS' && filteredAnswer.length > 0 ? filteredAnswer[0].answer : null;
                    }
                });

                if (subModuleChecklist.children.length > 0) {
                    _.each(subModuleChecklist.children, function(ch) {
                        recursiveFunction(ch, checklist);
                    })
                }
            }
        });
})();