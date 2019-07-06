(function(angular) {
    'use strict';

    angular.module('pdx.controllers')
        .controller('MAVariationInformationController', function($state, CommonService, $scope, RegistrationFactory, AccountService, $ngConfirm, StorageService, $stateParams,
            NotificationService, ChecklistFactory, MAFactory, VariationService, $q, $filter, blockUI, RegistrationConst) {
            var vm = this;

            // methods
            vm.showVariations = _showVariations;
            vm.onApplicationSelected = _onApplicationSelected;
            vm.proceedToApplication = _proceedToApplication;
            vm.calculateFee = _calculateFee;
            vm.editLegacyData = _editLegacyData;
            vm.allowEditLegacyData = _allowEditLegacyData;
            vm.gotoOriginalMA = _gotoOriginalMA;
            vm.applicationType = _applicationType;

            init();


            function init() {
                vm.CONSTANT = RegistrationConst;
                vm.user = AccountService.userInfo();
                vm.maTypeCode = "VAR";
                vm.checklistTypeCode = "PSCR";
                vm.evaluationFeeNaming = {
                    major: "Evaluation Fee (Major Variation)",
                    minor: "Evaluation Fee (Minor Variation)"
                };
                vm.variationCount = { major: null, minor: null };
                vm.maVariation = {};
                vm.variationInformationValidation = {};
                vm.selectedMAId = $stateParams.id;
                // used to differentiate between add new variation and editing existing
                vm.editMode = $stateParams.isUpdate;
                resetButtons();
                //load variations for new variation
                if (!vm.editMode) {
                    loadVariationsForMa();
                } else {
                    //we are updating variation
                    vm.selectedApp = { ma: { id: vm.selectedMAId } }; //initialize selected app with ma id
                    vm.onApplicationSelected();
                }
            }

            //Load MA applications for variation
            function loadVariationsForMa() {
                //Load MA applications for variation
                blockUI.start();
                RegistrationFactory.maForVariation.query({ userID: vm.user.id }, function(data) {
                    vm.previousApps = data;
                    blockUI.stop();
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

            function _showVariations() {
                if (CommonService.checkUndefinedOrNull(vm.data) && vm.data.length > 0) {
                    openVariationFieldsModal();
                } else {
                    RegistrationFactory.maFieldByType.query({ isVariationType: true, submoduleTypeCode: vm.submoduleTypeCode }, function(data) {
                        // !important don't rename this. It's required by fields.html modal
                        vm.data = data;
                        // buildMaFieldFromPrevious();
                        openVariationFieldsModal();
                    });
                }
            }

            function _onApplicationSelected() {
                if (vm.selectedApp === null) return;
                vm.selectedMAId = vm.selectedApp.ma.id;
                //check for legacy data
                blockUI.start();
                MAFactory.maSingle.get({ maId: vm.selectedApp.ma.id }).$promise.then(function(response) {
                    blockUI.stop();
                    vm.maVariation = response.result;
                    vm.submoduleTypeCode = vm.maVariation.submoduleTypeCode;
                    if (vm.editMode) {
                        vm.selectedApp = response.result;
                        //preload existing variation information
                        if (!_.isNull(vm.maVariation.ma.maVariationSummary)) {
                            vm.variationCount = { major: vm.maVariation.ma.maVariationSummary.majorVariationCount, minor: vm.maVariation.ma.maVariationSummary.minorVariationCount };
                            vm.variationSummary = vm.maVariation.ma.maVariationSummary.variationSummary;
                        }
                        vm.maVariationSummary = vm.maVariation.ma.maVariationSummary;
                    }
                    if (vm.allowEditLegacyData()) {
                        vm.showButtons.showLegacyEdit = true;
                        return;
                    }
                });

                resetButtons();
                vm.showCalculateFeeResult = false;
                vm.data = undefined;
                vm.showButtons.variation = true;
            }

            //1. Store variations selected by User
            //2. Route to Application processing.
            function _proceedToApplication() {
                if (!variationValid()) return;
                var maField = {};
                maField.maid = (vm.editMode ? vm.selectedApp.ma.originalMAID : vm.selectedApp.ma.id);
                maField.createdByUserID = vm.user.id;
                maField.fieldSubmoduleType = vm.data[0];
                maField.fieldSubmoduleTypeID = vm.data[0].id;
                maField.isVariation = true;
                blockUI.start();
                RegistrationFactory.maFieldSave.save([maField], function() {
                    var ma_payment = [];
                    _.each(vm.submoduleFeeType, function(fee) {
                        ma_payment.push({ submoduleFeeId: fee.id, quantity: fee.quantity });

                    });
                    //Set variationInformation in local storage (to persist it for the next state)
                    //ma_payment : holds detail of payment details for the variation
                    //summary (vm.variationSummary, hold the variation summary the user provides
                    StorageService.remove('variationInformation');
                    //Set variationSummary to " " if its undefined; because its required at the backend.
                    vm.variationSummary = CommonService.checkUndefinedOrNull(vm.variationSummary) ? vm.variationSummary : " ";
                    vm.maVariationSummary = {
                        majorVariationCount: vm.variationCount.major,
                        minorVariationCount: vm.variationCount.minor,
                        variationSummary: vm.variationSummary
                    };
                    
                    StorageService.set('variationInformation', {
                        ma_payment: ma_payment,
                        maVariationSummary: vm.maVariationSummary
                    });
                    var stateToProceed = "maregistration.variation.new";
                    if (vm.editMode) {
                        stateToProceed = "maregistration.variation.update";
                    }
                    VariationService.setVariationSubmoduleType(vm.submoduleTypeCode);
                    var isFood = RegistrationFactory.isFoodType(vm.maVariation.submoduleTypeCode);
                    $state.go(stateToProceed, {
                        maId: vm.selectedApp.ma.id,
                        isFoodType: isFood,
                        variationInformation: {
                            ma_payment: ma_payment,
                            maVariationSummary: vm.maVariationSummary
                        }
                    });

                }, function() {
                    blockUI.stop();
                    NotificationService.notify('Error occurred. Please try again!', 'alert-danger');
                    return;
                });

            }

            function _calculateFee() {
                //Check if atleast one variation is selected
                if (!variationValid()) return;

                /*
                 * Current implementation,
                 * Make call to both major and minor fees
                 * Take only "Minor Variation Fee" from minor fee lists
                 * Take all fess from major fee lists
                 * */
                var isMajor = VariationService.checkMajor(vm.variationCount);
                var submoduleCodes = {
                    majorSubmoduleCode: VariationService.getMaTypeCode(true, vm.submoduleTypeCode),
                    minorSubmoduleCode: VariationService.getMaTypeCode(false, vm.submoduleTypeCode)
                };
                var majorFee = MAFactory.submoduleFee.query({ submoduleCode: submoduleCodes.majorSubmoduleCode }).$promise;
                var minorFee = MAFactory.submoduleFee.query({ submoduleCode: submoduleCodes.minorSubmoduleCode }).$promise;
                //Obtain all Fees associated with major and minor variation
                $q.all([majorFee, minorFee]).then(function(results) {
                    var minor = $filter('filter')(results[1], { $: "Evaluation fee" })[0];
                    if (!minor) {
                        NotificationService.notify("Please Contact System Administrator!", 'alert-warning');
                        // Fee calculation error occurred. Don't proceed, ideally the application shouldn't proceed.
                        //TODO : Find a better way to handle fee error!
                        return;
                    }
                    minor.feeType.name = vm.evaluationFeeNaming.minor;
                    //Add minor variation quantity
                    minor.quantity = vm.variationCount.minor;
                    // Select out major variation fee from "VMAJ" submodule
                    var major = $filter('filter')(results[0], { $: "Evaluation fee" })[0];
                    major.feeType.name = vm.evaluationFeeNaming.major;

                    // Add major variation quantity
                    major.quantity = vm.variationCount.major;

                    if (isMajor) {
                        vm.submoduleFeeType = $filter('filter')(results[0], { isActive: true, $: "!Evaluation fee" });
                    } else {
                        vm.submoduleFeeType = $filter('filter')(results[1], { isActive: true, $: "!Evaluation fee" });
                    }

                    vm.submoduleFeeType.push(major);
                    vm.submoduleFeeType.push(minor);

                    vm.submoduleFeeGrandTotal = 0;
                    _.each(vm.submoduleFeeType, function(fee) {
                        fee.quantity = angular.isDefined(fee.quantity) ? fee.quantity : 1;
                        fee.subTotal = fee.quantity * fee.fee;
                        vm.submoduleFeeGrandTotal += fee.subTotal;
                    });
                    vm.showCalculateFeeResult = true;
                    vm.showButtons.proceed = true;
                });

                initChecklist(isMajor);
            }

            function _editLegacyData() {
                return RegistrationFactory.editLegacyData(vm.selectedApp.ma);
            }

            function _allowEditLegacyData() {
                if (!vm.selectedApp) {
                    return false;
                }
                return RegistrationFactory.allowEditLegacyData(vm.selectedApp.ma);
            }

            function _gotoOriginalMA(maID) {
                var currentMAID = '/registration/variation/information/' + vm.selectedMAId; //This means just, its from application!
                $state.go('maregistration.list.info', { maId: maID, currentMAID: currentMAID });
            }

            function resetButtons() {
                vm.showButtons = {
                    variation: false,
                    calculateFee: false,
                    proceed: false,
                    fee: false,
                    variationIntialized: false,
                    showLegacyEdit: false,
                };
            }

            function initChecklist(major) {
                vm.submoduleCode = VariationService.getMaTypeCode(major, vm.submoduleTypeCode);
                vm.submoduleCheckList = ChecklistFactory.ChecklistBySubmodule.query({
                    submoduleCode: vm.submoduleCode,
                    checklistTypeCode: vm.checklistTypeCode,
                    isSra: false
                });
            }

            function variationValid() {
                /*
                 * Checks the count for variations.
                 * */
                if (vm.variationCount.major < 1 && vm.variationCount.minor < 1) {
                    //No variation is selected; Either in the form of fields or variation count. So notify the user to selected
                    //some variation before allowing it to proceed!
                    NotificationService.notify("Please check variation counts. Both can't be zero!", 'alert-warning');
                    return false;
                }
                return true;
            }

            function openVariationFieldsModal() {
                $ngConfirm({
                    title: "Select Variations",
                    contentUrl: 'app/registration/variation/modals/fields.html',
                    type: 'green',
                    typeAnimated: true,
                    closeIcon: true,
                    scope: $scope,
                    columnClass: 'col-md-8 col-md-offset-2',
                    buttons: {
                        update: {
                            text: "proceed",
                            btnClass: 'btn-primary',
                            action: function(scope) {
                                vm.variationInformationValidation.$showError = true;
                                if (!vm.variationInformationValidation.$isValid) {
                                    return false;
                                } else if (!variationValid()) {
                                    return false;
                                }
                                vm.showButtons.fee = true;
                                // vm.showButtons.proceed=true;
                                vm.showButtons.variationIntialized = true;
                                vm.showCalculateFeeResult = false;
                                scope.$apply();
                            }
                        }
                    }
                });
            }

            function _applicationType() {
                if (vm.variationCount.major == null || vm.variationCount.minor == null) {
                    return null;
                }
                var isMajorApplication = VariationService.checkMajor(vm.variationCount);
                return isMajorApplication == true ? 'Major Variation' : 'Minor Variation';
            }
        });

})(window.angular);