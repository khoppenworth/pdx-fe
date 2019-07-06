(function(angular) {
    'use strict';

    angular.module('pdx.controllers')
        .controller('MANewRenewalWIPController', function(RegistrationFactory, AccountService, $state, $stateParams, $scope,
            ModuleSettingsFactory, RegistrationConst, AppConst, WIPFactory,
            ChecklistFactory, NotificationService, $q, blockUI, MAFactory) {

            var vm = this;
            //Flag that determines whether an application creation is in process or not. If in process cancel all save draft requests.
            // Needed to include this because wip is again created for a submitted application because save draft was called once an application was created.
            // Check this on create app api call.
            var applicationInProgress = false;
            //Navigation functions
            vm.previousApp = _previousApp;
            vm.previousAppToAttachement = _previousAppToAttachement;
            vm.backToPreviousApp = _backToPreviousApp;
            vm.attachmentToDossier = _attachmentToDossier;
            vm.dossierToChecklist = _dossierToChecklist;
            vm.checklistToTerms = _checklistToTerms;
            vm.saveDraft = _saveDraft;
            //Save new renewal
            vm.SubmitNewApplication = _submitNewApplication;
            vm.gotoOriginalMA = _gotoOriginalMA;
            vm.showAnswerButton = RegistrationFactory.showAnswerButton;
            vm.calculateFee = _calculateFee;
            //Document preview modal
            vm.openFileModal = _openFileModal;

            init();
            loadData();

            function init() {
                vm.user = AccountService.userInfo();
                vm.CONSTANT = RegistrationConst;
                /*
                 * State definitions; Obtained from parent controller (MARenewal controller; see definitions there!)
                 * Format { previous:'...',  attachment:' ... ',  checklist: ' ... ' }
                 * */
                vm.states = $scope.renewalStates.wip;

                vm.marenewal = {
                    ma: {},
                    documents: [],
                    submoduleCode: '',
                    identifier: vm.identifier
                };

                vm.registrationRenewal = {
                    previousApplication: {},
                    attachment: [],
                    checklist: [],
                    dossier: [],
                    terms: {}
                }; //Validation object
                //calculate fee
                vm.showCalculateFeeResult = false;
                vm.slickIndex = 0;
            }

            function loadData() {
                var prevApp = RegistrationFactory.maForRenewal.query({ userID: vm.user.id }).$promise;
                var wip = WIPFactory.getWIPByID.get({ id: $stateParams.id }).$promise;
                blockUI.start();
                $q.all([prevApp, wip]).then(function(results) {
                    vm.previousApps = results[0];
                    var data = results[1];
                    populateUpdateData(data.contentObject);
                }, function() {
                    blockUI.stop();
                    //Data load Failed!
                    //TODO : properly handle failure!
                });
            }

            function _openFileModal(moduleDocument) {
                RegistrationFactory.openFileModal(moduleDocument);
            }

            function _previousApp() {
                vm.slickIndex = 5;
                $state.go(vm.states.previous);
            }
            function _backToPreviousApp() {
                vm.slickIndex = 0; //This will be used on file attachement step
                $state.go(vm.states.previous);
            }

            function _previousAppToAttachement() {
                vm.slickIndex = 6;
                $state.go(vm.states.attachment);
            }

            function _attachmentToDossier() {
                vm.registrationRenewal.attachment.$showError = true;
                if (vm.registrationRenewal.attachment.$isValid) {
                    vm.slickIndex = 7;
                    $state.go(vm.states.dossier);
                } else {
                    return;
                }
            }

            function _dossierToChecklist() {
                vm.registrationRenewal.dossier.$showError = true;
                if (vm.registrationRenewal.dossier.$isValid) {
                    vm.slickIndex = 8;
                    $state.go(vm.states.checklist);
                } else {
                    return;
                }
            }

            function _checklistToTerms() {
                vm.registrationRenewal.checklist.$showError = true;
                if (vm.registrationRenewal.checklist.$isValid) {
                    RegistrationFactory.setFinishedManufacturer(vm);
                    var nextState = RegistrationFactory.stateToGo(vm.states, vm.submoduleTypeCode, vm.states.termsAndConditions);
                    vm.slickIndex = 9;
                    $state.go(nextState);
                } else return;

            }

            function _saveDraft(autosave) {
                if (applicationInProgress == true) {
                    return; //If application is in progress (SubmitNewApplication is called, cancel all WIP).
                }
                if ($state.current.name.toLowerCase() === vm.states.previous) {
                    return;
                }

                var model = RegistrationFactory.prepareRenewal(vm.marenewal, vm, 'wip');
                var WIPModel = {
                    type: AppConst.Modules.Renewal,
                    userID: vm.user.id,
                    contentObject: model,
                    rowguid: model.identifier
                };

                RegistrationFactory.saveDraft(WIPModel, autosave);

            }

            function _submitNewApplication() {
                vm.registrationRenewal.terms.$showError = true;
                if (vm.registrationRenewal.$isValid) {
                    //Flag application progress to true;
                    applicationInProgress = true;
                    var model = RegistrationFactory.prepareRenewal(vm.marenewal, vm, 'wip');
                    RegistrationFactory.renewal.save(model, function(response) {
                        //Flag application progress to false;
                        applicationInProgress = false;
                        RegistrationFactory.submitMAResponse(response, { stateName: 'maregistration.list' });
                    }, function() {
                        //Flag application progress to false;
                        applicationInProgress = false;
                        NotificationService.notify("Error, Please try again!", "alert-danger");
                    });
                } else {
                    return;
                }
            }
            //Attachments
            function initAttachment() {
                RegistrationFactory.initAttachmentRenewal(vm, ModuleSettingsFactory, 'wip');
            }

            function populateUpdateData(data) {
                vm.marenewal.ma = data.ma;
                vm.marenewal.identifier = data.identifier;
                vm.identifier = vm.marenewal.identifier;
                vm.marenewal.documents = data.documents;
                vm.marenewal.product = data.product;
                data.dossiers = data.dossiers ? data.dossiers : [];
                vm.marenewal.uploadedDocuments = data.documents.concat(data.dossiers);
                vm.submoduleTypeCode = data.submoduleTypeCode;
                vm.marenewal.submoduleTypeCode = data.submoduleTypeCode;
                vm.marenewal.submoduleCode = data.submoduleCode;

                //sra is manually set to null for for renewal and variation // No sra concepts
                vm.marenewal.ma.isSRA = false;
                vm.marenewal.ma.sra = null;
                initAttachment();
                initChecklist();

                RegistrationFactory.detail.get({ maId: vm.marenewal.ma.originalMAID }, function(data) {
                    vm.marenewal.previousAppDetail = data.result;
                    vm.selectedApp = vm.marenewal.previousAppDetail;
                    blockUI.stop();
                }, function() {
                    blockUI.stop();
                }); //Load original MA

            }

            function recursiveFunction(checklist) {
                _.each(vm.marenewal.ma.maChecklists, function(mac) {
                    if (mac.checklistID === checklist.id) {
                        checklist.optionID = mac.optionID;
                    }
                });
                if (checklist.children.length > 0) {
                    _.each(checklist.children, function(ch) {
                        recursiveFunction(ch);
                    });
                }
            }

            function _gotoOriginalMA(maID) {
                var currentMAID = -1; //This means just, its from application!
                $state.go('maregistration.list.info', { maId: maID, currentMAID: currentMAID });
            }

            function initChecklist() {
                vm.submoduleCheckList = ChecklistFactory.ChecklistBySubmodule.query({
                    submoduleCode: vm.marenewal.submoduleCode,
                    checklistTypeCode: "PSCR",
                    isSra: false
                }, function(data) {
                    _.each(data, function(ch) {
                        recursiveFunction(ch);
                    });
                    return data;
                });
            }

            function _calculateFee() {
                if (vm.marenewal.submoduleCode == null || !vm.selectedApp) {
                    NotificationService.notify("Select Application", "alert-warning");
                    return;
                } else {
                    vm.submoduleFeeType = MAFactory.submoduleFee.query({ submoduleCode: vm.marenewal.submoduleCode });
                    initChecklist();
                    vm.showCalculateFeeResult = true;
                }
            }
            //Register to autosave counter  [fired from keepalive (part of ng
            $scope.$on('Keepalive', function() {
                // do something to keep the user's session alive
                vm.saveDraft(true);
            });
        });

})(window.angular);
