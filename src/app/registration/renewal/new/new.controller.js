(function(angular) {
    'use strict';

    angular.module('pdx.controllers')
        .controller('MANewRenewalController', function(RegistrationFactory, AccountService, $state, $scope,
            ModuleSettingsFactory, AppConst, MAFactory,
            ChecklistFactory, NotificationService, UtilityFactory, RegistrationConst, $stateParams) {

            var vm = this;
            //Flag that determines whether an application creation is in process or not. If in process cancel all save draft requests.
            // Needed to include this because wip is again created for a submitted application because save draft was called once an application was created.
            // Check this on create app api call.
            var applicationInProgress = false;
            vm.showAnswerButton = RegistrationFactory.showAnswerButton;
            //Document preview modal
            vm.openFileModal = _openFileModal;
            //Navigation functions
            vm.previousApp = _previousApp;
            vm.onApplicationSelected = _onApplicationSelected;
            /** state browsers*/
            vm.previousAppToAttachement = _previousAppToAttachment;
            vm.backToPreviousApp = _previousApp;
            vm.attachmentToDossier = _attachmentToDossier;
            vm.dossierToChecklist = _dossierToChecklist;
            vm.checklistToTerms = _checklistToTerms;
            vm.saveDraft = _saveDraft;
            //Save new renewal
            vm.SubmitNewApplication = _submitNewApplication;
            vm.gotoOriginalMA = _gotoOriginalMA;
            vm.editLegacyData = _editLegacyData;
            vm.allowEditLegacyData = _allowEditLegacyData;
            vm.calculateFee = _calculateFee;

            init();


            function init() {
                vm.CONSTANT = RegistrationConst;
                vm.marenewal = {
                    ma: {
                        originalMA: null,
                        isSRA: false
                    },
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
                vm.editMode = false;
                //calculate fee
                vm.showCalculateFeeResult = false;

                vm.user = AccountService.userInfo();
                vm.selectedMAId = $stateParams.id;

                /*
                 * State definitions; Obtained from parent controller (MARenewal controller; see definitions there!)
                 * Format { previous:'...',  attachment:' ... ',  checklist: ' ... ' }
                 * */
                vm.states = $scope.renewalStates.new;
                $state.go(vm.states.previous);
                vm.slickIndex = 0;

                UtilityFactory.identifier.get({ key: "MarketAuthorization" }, function(data) {
                    vm.identifier = data.data;
                    vm.marenewal.identifier = vm.identifier;
                });

                //Load MA applications for renewal
                RegistrationFactory.maForRenewal.query({ userID: vm.user.id }, function(data) {
                    vm.previousApps = data;
                    if (vm.selectedMAId) {
                        vm.selectedApp = _.find(vm.previousApps, function(d) {
                            return d.ma.id == vm.selectedMAId;
                        });
                        if (vm.selectedApp) {
                            vm.onApplicationSelected();
                        }
                    }
                });

            }

            function _onApplicationSelected() {
                if (vm.selectedApp === null) {
                    return;
                }
                vm.submoduleTypeCode = vm.selectedApp.submoduleTypeCode;
                vm.marenewal.submoduleTypeCode = vm.selectedApp.submoduleTypeCode;
                vm.marenewal.submoduleCode = RegistrationFactory.setRenewalSubmoduleCodeBySubmoduleType(vm.submoduleTypeCode, vm.selectedApp.submoduleCode);
                vm.marenewal.previousAppDetail = vm.selectedApp;
                vm.marenewal.ma.supplier = vm.selectedApp.ma.supplier;
                vm.selectedMAId = vm.selectedApp.ma.id;
                initAttachment();
                initChecklist();
                // vm.allowEditLegacyData();
            }
            //Attachments
            function initAttachment() {
                RegistrationFactory.initAttachmentRenewal(vm, ModuleSettingsFactory, 'new');
            }

            function _openFileModal(moduleDocument) {
                RegistrationFactory.openFileModal(moduleDocument);
            }

            function _previousApp() {
                vm.slickIndex = 0;
                $state.go(vm.states.previous);
            }

            function _previousAppToAttachment() {
                if (vm.allowEditLegacyData()) {
                    return;
                }
                vm.registrationRenewal.previousApplication.$showError = true;
                if (vm.registrationRenewal.previousApplication.$isValid) {
                    vm.slickIndex = 6;
                    $state.go(vm.states.attachment);
                } else {
                    return;
                }
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
                var model = RegistrationFactory.prepareRenewal(vm.marenewal, vm, 'new');
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
                    var model = RegistrationFactory.prepareRenewal(vm.marenewal, vm, 'new');
                    RegistrationFactory.renewal.save(model, function(response) {
                        //Flag application progress to false;
                        applicationInProgress = false;
                        RegistrationFactory.submitMAResponse(response, { stateName: 'maregistration.list' });
                    }, function() {
                        //Flag application progress to false;
                        applicationInProgress = false;
                        NotificationService.notify("Unable to save data. Please try again!", "alert-danger");
                    });
                } else {
                    return;
                }
            }

            function _gotoOriginalMA(maID) {
                var currentMAID = '/registration/renewal/new/' + vm.selectedMAId + '/previous'; //Append selected ma id to url path.
                $state.go('maregistration.list.info', { maId: maID, currentMAID: currentMAID });
            }

            function _editLegacyData() {
                if (!vm.selectedApp) {
                    return;
                }
                return RegistrationFactory.editLegacyData(vm.selectedApp.ma);
            }

            function _allowEditLegacyData() {
                if (!vm.selectedApp) {
                    return;
                }
                return RegistrationFactory.allowEditLegacyData(vm.selectedApp.ma);
            }

            function initChecklist() {
                vm.submoduleCheckList = ChecklistFactory.ChecklistBySubmodule.query({
                    submoduleCode: vm.marenewal.submoduleCode,
                    checklistTypeCode: "PSCR",
                    isSra: false
                });
            }

            function _calculateFee() {
                if (vm.marenewal.submoduleCode == null || !vm.selectedApp) {
                    NotificationService.notify("Select Application", "alert-warning");
                    return;
                } else {
                    vm.submoduleFeeType = MAFactory.submoduleFee.query({ submoduleCode: vm.marenewal.submoduleCode });
                    vm.showCalculateFeeResult = true;
                }
            }

            //Register to autosave counter  [fired from keepalive (part of ng
            $scope.$on('Keepalive', function() {
                vm.saveDraft(true);
            });

        });

})(window.angular);
