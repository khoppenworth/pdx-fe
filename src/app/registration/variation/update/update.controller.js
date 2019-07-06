(function(angular) {
    'use strict';

    angular.module('pdx.controllers')
        .controller('MAUpdateVariationController', function($scope, LookUpFactory, RegistrationFactory, CommodityFactory,
            ModuleSettingsFactory, AppConst, AccountService, SupplierFactory, NotificationService, $state, AgentFactory,
            $stateParams, $filter, VariationService, maVariation, $ngConfirm, blockUI, RegistrationConst, MAFactory) {
            var vm = this;
            var isMajor;
            var maStatusCode;
            //methods
            vm.onAgentSelected = onAgentSelected;
            vm.getAgents = getAgents;
            vm.addActiveSubstances = addActiveSubstances;
            vm.editActiveSubstances = editActiveSubstances;
            vm.removeActiveSubstance = removeActiveSubstance;
            vm.addExceipientSubstances = addExceipientSubstances;
            vm.editExceipientSubstances = editExceipientSubstances;
            vm.removeExceipientSubstances = removeExceipientSubstances;
            vm.addDiluentSubstances = addDiluentSubstances;
            vm.editDiluentSubstances = editDiluentSubstances;
            vm.removeDiluentSubstances = removeDiluentSubstances;
            vm.addAtcProduct = addAtcProduct;
            vm.removeAtcProduct = removeAtcProduct;
            vm.addForeignApplicationStatus = addForeignApplicationStatus;
            vm.editForeignApplicationStatus = editForeignApplicationStatus;
            vm.removeForeignApplicationStatus = removeForeignApplicationStatus;

            vm.searchManufacturer = searchManufacturer;
            vm.registerNewManufacturer = registerNewManufacturer;
            vm.addManufacturerToList = addManufacturerToList;
            vm.deleteManufacturerFromList = deleteManufacturerFromList;
            vm.firstLetterGroupFn = firstLetterGroupFn;

            vm.getDocuments = getDocuments;
            vm.openFileModal = openFileModal;

            // -----------WIZARD STEPS START----------
            vm.generalToProduct = _generalToProduct;

            vm.productToContinued = _productToContinued;
            vm.backToProduct = _backToProduct;

            vm.productContinuedToComposition = _productContinuedToComposition;
            vm.backToProductContinued = _backToProductContinued;

            vm.compositionToManufacturers = _compositionToManufacturers;
            vm.backToComposition = _backToComposition;

            vm.manufacturersToForeignApplications = _manufacturersToForeignApplications;
            vm.backToManufacturer = _backToManufacturer;

            vm.foreignToAttachment = _foreignToAttachment;
            vm.attachmentToDossier = _attachmentToDossier;
            vm.dossierToChecklist = _dossierToChecklist;
            vm.attachmentToChecklist = _attachmentToChecklist;
            // -----------WIZARD STEPS END----------

            vm.addDeviceModelSize = _addDeviceModelSize;
            vm.editDeviceModelSize = _editDeviceModelSize;
            vm.removeDeviceModelSize = _removeDeviceModelSize;

            vm.addFoodComposition = _addFoodComposition;
            vm.editFoodComposition = _editFoodComposition;
            vm.removeFoodComposition = _removeFoodComposition;

            vm.addDeviceAccessory = _addDeviceAccessory;
            vm.editDeviceAccessory = _editDeviceAccessory;
            vm.removeDeviceAccessory = _removeDeviceAccessory;

            vm.SubmitNewApplication = SubmitNewApplication;
            vm.SubmitReturnedApplication = SubmitReturnedApplication;

            vm.isInputDisabled = isInputDisabled;
            vm.hasError = hasError;
            vm.onChange = onChange;
            vm.addFirDoc = addFirDoc;
            vm.saveDraft = saveDraft;
            vm.showAnswerButton = RegistrationFactory.showAnswerButton;

            init();

            function init() {
                blockUI.stop();
                vm.CONSTANT = RegistrationConst;
                vm.disableMAType = true;
                vm.checklistTypeCode = "PSCR";
                vm.isUpdateMode = true;
                //slick setting
                vm.slickConfig = {
                    enabled: true,
                    method: {}
                };
                vm.slickIndex = 0;
                vm.value = 0;
                //validation model
                vm.maregistrationValidation = {
                    generalInfo: {},
                    productdetail: {},
                    productdetailContinued: {},
                    foodCompositions: [],
                    deviceAccessories: [],
                    productInn: [],
                    productManu: [],
                    attachment: [],
                    dossier: [],
                    checklist: []
                };

                //general Info
                //lookups for general info
                vm.agents = [];
                vm.agent = {};

                vm.deviceModelSizes = [];
                vm.deviceAccessories = []; // use for medical Device accessories and spare parts

                // product related
                vm.productInn = {};
                vm.productAtc = {};
                vm.productAtcValidation = {};
                vm.dynamicPopover = {
                    templateUrl: 'myPopoverTemplate.html'
                };

                ///Manufacturer
                //lookups
                vm.pageNo = 0;
                vm.pageSize = 50;
                vm.allSelectedManufacturerTypes = [];
                vm.manufacturer_and_type = [];
                vm.manufacturerT = [];
                vm.manu = [];
                // status related
                vm.updateStatusLogValidation = {};
                vm.maStatusModel = {};
                // get user info
                vm.user = AccountService.userInfo();
                // set maid and variation information
                vm.maId = $stateParams.maId;
                vm.variationInformation = $stateParams.variationInformation;


                /*
                 * State definitions; Obtained from parent controller (MAVariationController controller; see definitions there!)
                 * */
                vm.states = $scope.variationStates.update;
                vm.isLegacy = RegistrationFactory.allowEditLegacyData(maVariation.ma);
                if (vm.isLegacy) {
                    $state.go(vm.states.general);
                }
                vm.maregistration = maVariation;
                vm.identifier = vm.maregistration.identifier;
                vm.submoduleTypeCode = vm.maregistration.submoduleTypeCode;
                if (vm.variationInformation != null) {
                    vm.maregistration.ma.maPayments = vm.variationInformation.ma_payment;
                    vm.maregistration.comment = vm.variationInformation.maVariationSummary.variationSummary;
                    isMajor = VariationService.checkMajor({ major: vm.variationInformation.maVariationSummary.majorVariationCount, minor: vm.variationInformation.maVariationSummary.minorVariationCount }); //Returns true if the application is of Major Type
                }
                //Check status of the application (whether it came to update from withdrawal or from assessors)
                SetMAFieldsBasedOnStatus();

                prepareProductInfo();

                initForGeneralInfo();

            }

            function SetMAFieldsBasedOnStatus() {
                maStatusCode = maVariation.ma.maStatus.maStatusCode;
                vm.isWithdrawn = !(maStatusCode === RegistrationConst.MA_STATUS.FIR || maStatusCode === RegistrationConst.MA_STATUS.RTA); //If status code is not "FIR" or "RTA", it is withdrawn.
                vm.firOrRta = !vm.isWithdrawn;
                var id, isVariationType;
                if (vm.isWithdrawn) {
                    //For a withdrawn applications, MAFields are of type variationType.
                    // MAFields should be populated by using originalMAID!!!!.
                    id = maVariation.ma.originalMAID;
                    isVariationType = true;
                } else {
                    id = $stateParams.maId;
                    isVariationType = "null";
                }
                vm.currentMAFieldState = RegistrationFactory.maFieldById.query({ id: id, isVariationType: isVariationType , submoduleTypeCode: vm.submoduleTypeCode  });
            }

            function prepareProductInfo() {
                switch (vm.submoduleTypeCode) {
                    case RegistrationConst.SUB_MODULE_TYPE.MEDICINE:
                        vm.productExcipeints = $filter("filter")(vm.maregistration.product.productCompositions, { excipientID: "!!" });
                        vm.productInns = $filter("filter")(vm.maregistration.product.productCompositions, { innid: "!!" });
                        vm.productDiluents = $filter('filter')(vm.maregistration.product.productCompositions, { excipientID: '!!', isDiluent: true });
                        break;
                    case RegistrationConst.SUB_MODULE_TYPE.FOOD:
                        vm.foodCompositions = vm.maregistration.product.foodCompositions;
                        break;
                    case RegistrationConst.SUB_MODULE_TYPE.MEDICAL_DEVICE:
                        vm.deviceModelSizes = _.isNull(vm.maregistration.product.mdModelSizes) ? [] : vm.maregistration.product.mdModelSizes;
                        vm.deviceAccessories = _.isNull(vm.maregistration.product.deviceAccessories) ? [] : vm.maregistration.product.deviceAccessories;
                        break;
                }

                var presentations = [];
                _.each(vm.maregistration.product.presentations, function(present) {
                    if (vm.maregistration.product.presentation == null) vm.maregistration.product.presentation = present.packaging;
                    presentations.push(present.packSize);
                });
                vm.maregistration.product.presentations = presentations;

                _.each(vm.maregistration.checklists, function(checklist) {
                    VariationService.recursiveFunction(checklist);
                });

                //No concept of sra for renewal and variation!
                vm.maregistration.ma.sra = null;
                vm.maregistration.ma.isSRA = false;
                setValidationForNonLegacyData();
            }


            function setValidationForNonLegacyData() {
                //Set all validations to true; Assuming that all fields are properly filled for a submitted application. Only for
                //Non legacy Data.
                if (!vm.isLegacy) {
                    _.each(vm.maregistrationValidation, function(value, key, list) {
                        list[key].$isValid = true;
                    });
                }
            }

            function initForGeneralInfo() {
                if (angular.isUndefined(vm.applicationTypes)) {
                    LookUpFactory.moduleMaType.query({ moduleCode: AppConst.Modules.Variation, submoduleTypeCode: vm.submoduleTypeCode }, function(data) {
                        vm.applicationTypes = data;
                        // NOTE: Submodule Code is the same as Ma Type Code
                        if (vm.isWithdrawn) {
                            var status = VariationService.getMaTypeCode(isMajor, vm.submoduleTypeCode);
                            vm.maregistration.submoduleCode = status;
                            vm.maregistration.ma.maType = _.find(vm.applicationTypes, function(data) {
                                return data.maTypeCode === vm.maregistration.submoduleCode;
                            });
                        }
                    });
                }

                if (angular.isUndefined(vm.suppliers)) {
                    vm.getAgents();
                }
                if (angular.isUndefined(vm.sras)) {
                    vm.sras = CommodityFactory.sra.query();
                }
                vm.getDocuments();
            }

            function getAgents() {
                if (vm.user.isAgent) {
                    AgentFactory.userAgent.query({ userID: vm.user.id }, function(data) {
                        vm.agents = data;
                        vm.agent.selected = vm.agents[0];
                        vm.onAgentSelected();
                    });

                } else {
                    // vm.agent.selected = vm.agents[0];
                    vm.agent.selected = undefined;
                    vm.onAgentSelected();
                }
            }

            function onAgentSelected() {
                if (vm.agent.selected != undefined) {
                    SupplierFactory.agentSupplier.query({ agentID: vm.agent.selected.id, agentLevelCode: "FAG" }, function(data) {
                        vm.suppliers = data;
                    });
                } else {
                    SupplierFactory.supplier.query(function(data) {
                        vm.suppliers = data;
                    });

                }
            }


            //product detail
            //lookups
            function initProductDetail() {
                if (vm.productCategories == undefined) vm.productCategories = CommodityFactory.productCategoryBySubmoduleTypeCode.query({ submoduleTypeCode: vm.submoduleTypeCode });
                if (vm.ageGroupes == undefined) vm.ageGroupes = CommodityFactory.ageGroup.query();
                if (vm.deviceGroups == undefined) vm.deviceGroups = CommodityFactory.mDGrouping.query();
                if (vm.deviceClasses == undefined) vm.deviceClasses = RegistrationFactory.getDeviceClasses(vm);
            }

            //product detail continued
            //lookups
            function initProductDetailContinued() {
                vm.productTypes = RegistrationFactory.getProductTypes(vm);
                if (vm.useCategories == undefined) vm.useCategories = CommodityFactory.useCategory.query();
            }

            function addActiveSubstances() {
                RegistrationFactory.addActiveSubstances(vm);
            }

            function editActiveSubstances(data) {
                RegistrationFactory.editActiveSubstances(vm, data);
            }

            function removeActiveSubstance(data) {
                RegistrationFactory.removeActiveSubstance(vm, data);
            }

            function addExceipientSubstances() {
                RegistrationFactory.addExceipientSubstances(vm);
            }

            function editExceipientSubstances(data) {
                RegistrationFactory.editExceipientSubstances(vm, data);
            }

            function removeExceipientSubstances(data) {
                RegistrationFactory.removeExceipientSubstances(vm, data);
            }

            function addDiluentSubstances() {
                RegistrationFactory.addDiluentSubstances(vm);
            }

            function editDiluentSubstances(data) {
                RegistrationFactory.editDiluentSubstances(vm, data);
            }

            function removeDiluentSubstances(data) {
                RegistrationFactory.removeDiluentSubstances(vm, data);
            }

            function addAtcProduct() {
                RegistrationFactory.addAtcProduct(vm);
            }

            function removeAtcProduct(data) {
                RegistrationFactory.removeAtcProduct(vm, data);
            }

            // ------------------Food Composition----------------------------

            function _addFoodComposition(food_composition_type) {
                MAFactory.addFoodComposition(vm, food_composition_type);
            }

            function _editFoodComposition(data) {
                MAFactory.editFoodComposition(vm, data);
            }

            function _removeFoodComposition(data) {
                MAFactory.removeFoodComposition(vm, data);
            }

            // ------------------Medical DeviceModel----------------------------
            function _addDeviceModelSize() {
                MAFactory.addDeviceModelSize(vm);
            }

            function _editDeviceModelSize(data) {
                MAFactory.editDeviceModelSize(vm, data);
            }

            function _removeDeviceModelSize(data) {
                MAFactory.removeDeviceModelSize(vm, data);
            }

            // ------------------Medical DeviceAccessory----------------------------
            function _addDeviceAccessory(accessory_type_code) {
                MAFactory.addDeviceAccessory(vm, accessory_type_code);
            }

            function _editDeviceAccessory(data) {
                MAFactory.editDeviceAccessory(vm, data);
            }

            function _removeDeviceAccessory(data) {
                MAFactory.removeDeviceAccessory(vm, data);
            }

            // foreign application status
            function addForeignApplicationStatus() {
                RegistrationFactory.addForeignApplicationStatus(vm);
            }

            function editForeignApplicationStatus(data) {
                RegistrationFactory.editForeignApplicationStatus(vm, data);
            }

            function removeForeignApplicationStatus(data) {
                RegistrationFactory.removeForeignApplicationStatus(vm, data);
            }

            function initManufacturer() {
                RegistrationFactory.initManufacturer(vm, LookUpFactory);
            }

            function searchManufacturer(keyWords, $event) {
                RegistrationFactory.searchManufacturer(vm, LookUpFactory, keyWords, $event);
            }

            function registerNewManufacturer() {
                RegistrationFactory.registerNewManufacturer();
            }

            function addManufacturerToList() {
                RegistrationFactory.addManufacturerToList(vm);
            }

            /*
             * Remove manufacturer_and_type data from the list;
             * */
            function deleteManufacturerFromList(data, idx) {
                RegistrationFactory.deleteManufacturerFromList(vm, data, idx);
            }

            function firstLetterGroupFn(item) {
                RegistrationFactory.firstLetterGroupFn(item);
            }
            //Attachments
            function getDocuments() {
                RegistrationFactory.initAttachment(vm, ModuleSettingsFactory, 'update');
            }

            function openFileModal(moduleDocument) {
                RegistrationFactory.openFileModal(moduleDocument);
            }

            function _generalToProduct() {
                vm.maregistrationValidation.generalInfo.$showError = true;
                if (vm.maregistrationValidation.generalInfo.$isValid) {

                    initProductDetail();
                    vm.value = 10; //progress bar value
                    vm.slickIndex = 1;
                    var nextState = RegistrationFactory.stateToGo(vm.states, vm.submoduleTypeCode, vm.states.product);
                    $state.go(nextState);
                } else return;
            }

            function _backToProduct() {
                vm.slickIndex = 0;
                vm.value = 0;
                var prevState = RegistrationFactory.stateToGo(vm.states, vm.submoduleTypeCode, vm.states.product);
                $state.go(prevState);
            }

            function _productToContinued() {
                vm.maregistrationValidation.productdetail.$showError = true;
                if (vm.maregistrationValidation.productdetail.$isValid) {
                    var nextState = RegistrationFactory.stateToGo(vm.states, vm.submoduleTypeCode, vm.states.productdetailContinued);
                    $state.go(nextState);
                    vm.slickIndex = 2;
                    vm.value = 20;
                    initProductDetailContinued();
                } else return;
            }

            function _backToProductContinued() {
                vm.value = 20; //progress bar value
                var prevState = RegistrationFactory.stateToGo(vm.states, vm.submoduleTypeCode, vm.states.productdetailContinued);
                vm.slickIndex = 2;
                $state.go(prevState);
            }

            function _productContinuedToComposition() {

                var isFormValid = true; // asume by default the form is valid
                switch (vm.submoduleTypeCode) {
                    case RegistrationConst.SUB_MODULE_TYPE.MEDICAL_DEVICE:
                        if (vm.deviceModelSizes.length === 0) {
                            NotificationService.notify("Please add one or more pack size", "alert-warning");
                            isFormValid = false;
                        }
                        if (vm.accessoryTypes == undefined) vm.accessoryTypes = CommodityFactory.accessoryType.query();
                        break;
                    default:
                        vm.maregistrationValidation.productdetailContinued.$showError = true;
                        isFormValid = vm.maregistrationValidation.productdetailContinued.$isValid;
                        break;
                }
                if (isFormValid) {
                    vm.value = 30;
                    vm.slickIndex = 3;
                    var nextState = RegistrationFactory.stateToGo(vm.states, vm.submoduleTypeCode, vm.states.composition);
                    $state.go(nextState);
                }
            }

            function _backToComposition() {
                vm.value = 30; //progress bar value
                vm.slickIndex = 3;
                var prevState = RegistrationFactory.stateToGo(vm.states, vm.submoduleTypeCode, vm.states.composition);
                $state.go(prevState);
            }

            function _compositionToManufacturers() {
                var isCompositionValid = RegistrationFactory.isCompositionToManufacturersValid(vm);
                if (isCompositionValid) {
                    initManufacturer();
                    $state.go(vm.states.manufacturer);
                    vm.value = 52;
                    vm.slickIndex = 4;
                }
            }

            function _backToManufacturer() {
                vm.value = 52;
                vm.slickIndex = 4;
                $state.go(vm.states.manufacturer);
            }

            function _manufacturersToForeignApplications() {
                vm.maregistrationValidation.productManu.$showError = true;
                if (vm.maregistrationValidation.productManu.$isValid) {
                    var validManufacturer = RegistrationFactory.validateManufacturer(vm.maregistration.product.productManufacturers);
                    if (!validManufacturer) {
                        NotificationService.notify("Finshed Product manufacturer is required!", "alert-danger");
                        return;
                    }
                    $state.go(vm.states.foreignStatus);
                    vm.value = 60;
                    vm.slickIndex = 5;
                } else {
                    NotificationService.notify("Please add one or more Manufacturers", "alert-warning");
                    return;
                }
            }

            function _foreignToAttachment() {
                if (vm.moduleDocuments == null || vm.moduleDocuments == undefined) vm.getDocuments();
                $state.go(vm.states.attachment);
                vm.value = 75;
                vm.slickIndex = 6;
            }

            function _attachmentToDossier() {
                vm.maregistrationValidation.attachment.$showError = true;
                if (vm.maregistrationValidation.attachment.$isValid) {
                    $state.go(vm.states.dossier);
                    vm.value = 80;
                    vm.slickIndex = 7;
                } else return;
            }

            function _dossierToChecklist() {
                vm.maregistrationValidation.dossier.$showError = true;
                if (vm.maregistrationValidation.dossier.$isValid) {
                    $state.go(vm.states.checklist);
                    vm.value = 90;
                    vm.slickIndex = 8;
                } else return;

            }

            function _attachmentToChecklist() {
                vm.maregistrationValidation.attachment.$showError = true;
                if (vm.maregistrationValidation.attachment.$isValid) {
                    $state.go(vm.states.checklist);
                    vm.value = 100;
                    vm.slickIndex = 7;
                } else return;

            }

            function SubmitNewApplication() {
                vm.maregistrationValidation.checklist.$showError = true;
                if (vm.maregistrationValidation.$isValid) {
                    submitWithNoStatusChange();
                } else return;
            }

            function SubmitReturnedApplication() {
                vm.maregistrationValidation.checklist.$showError = true;
                if (vm.maregistrationValidation.$isValid) {
                    vm.firDoc = [];
                    getFirDoc();
                    $ngConfirm({
                        title: "Reply",
                        contentUrl: 'app/registration/templates/changeMAStatus.html',
                        type: "green",
                        typeAnimated: true,
                        closeIcon: true,
                        scope: $scope,
                        columnClass: 'col-md-8 col-md-offset-2',
                        buttons: {
                            update: {
                                text: "Submit",
                                btnClass: "btn-primary",
                                action: function() {
                                    var saveModel = RegistrationFactory.prepareRegistration(vm.maregistration, vm, 'update', 'variation');
                                    saveModel.comment = vm.maStatusModel.Comment;
                                    RegistrationFactory.variation.update(saveModel, function(response) {
                                        RegistrationFactory.submitMAResponse(response, {
                                            stateName: 'maregistration.list.info',
                                            params: { maId: $stateParams.maId }
                                        });
                                    }, function() {
                                        NotificationService.notify('Unable to save data. Please try again!', 'alert-danger')
                                    });
                                }
                            }
                        }
                    });
                } else return;
            }

            function isInputDisabled(fieldCode) {
                // if its legacy data, manufacturer tab should be enabled
                if ((vm.isWithdrawn == true && (fieldCode == 'Checklists' || fieldCode == 'Documents'  || fieldCode == 'sra' || fieldCode == 'Dossier')) ||
                    (vm.isLegacy && fieldCode == 'Manufacturers')
                ) {
                    return false;
                }
                return VariationService.isInputDisabled(vm, fieldCode);
            }

            function hasError(name) {
                return VariationService.hasError(vm, name);
            }

            function onChange(fieldCode) {
                VariationService.onChange(vm, fieldCode);
            }

            function getFirDoc() {
                RegistrationFactory.getFirDoc(vm, ModuleSettingsFactory, maStatusCode);
            }

            function addFirDoc() {
                vm.firGeneratedCount = maVariation.firGeneratedCount;
                RegistrationFactory.addFirDoc(vm);
            }

            function saveDraft() {
                if (vm.firOrRta) {
                    //For fir or rta status, no draft is supported because api will make status change for such cases.
                    NotificationService.notify('Cannot save draft for FIR or RTA applications', 'alert-warning');
                    return;
                }
                submitWithNoStatusChange(true);
            }

            function submitWithNoStatusChange(draft) {
                var saveModel = RegistrationFactory.prepareRegistration(vm.maregistration, vm, 'update', 'variation');
                if (draft) {
                    RegistrationFactory.variation.update(saveModel, function(response) {
                        RegistrationFactory.submitMAResponse(response, {}, draft);
                    }, function() {
                        NotificationService.notify("Unable to save data. Please try again!", "alert-danger");
                    });
                } else {
                    if (vm.isLegacy) {
                        saveModel.ma.isLegacyUpdated = true;
                    }
                    RegistrationFactory.variation.update(saveModel, function(response) {
                        RegistrationFactory.submitMAResponse(response, {
                            stateName: 'maregistration.list.info',
                            params: { maId: $stateParams.maId }
                        });
                    }, function() {
                        NotificationService.notify("Unable to save data. Please try again!", "alert-danger");
                    });
                }
            }

        });

})(window.angular);