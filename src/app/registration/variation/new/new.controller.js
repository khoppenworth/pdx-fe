(function(angular) {
    'use strict';
    angular.module('pdx.controllers')
        .controller('MANewVariationController', function($scope, LookUpFactory, ChecklistFactory, RegistrationFactory, CommodityFactory, StorageService,
            ModuleSettingsFactory, AppConst, AccountService, SupplierFactory, NotificationService, $state, CommonService, AgentFactory,
            $stateParams, $filter, VariationService, maFields, maVariation, UtilityFactory, blockUI, RegistrationConst, MAFactory) {
            var vm = this;
            //Flag that determines whether an application creation is in process or not. If in process cancel all save draft requests.
            // Needed to include this because wip is again created for a submitted application because save draft was called once an application was created.
            // Check this on create app api call.
            var applicationInProgress = false;
            var isMajor;
            /*
             * State definitions; Obtained from parent controller (MAVariationController controller; see definitions there!)
             * */
            vm.states = $scope.variationStates.new;
            $state.go(vm.states.general);
            //stop ui blocker if it is running.
            //Its started from information controller until to prevent user from doing anything until resolves are completed
            //and page is routed to this state.
            blockUI.stop();

            vm.onAgentSelected = _onAgentSelected;
            vm.getAgents = _getAgents;

            vm.addActiveSubstances = _addActiveSubstances;
            vm.editActiveSubstances = _editActiveSubstances;
            vm.removeActiveSubstance = _removeActiveSubstance;
            vm.addExceipientSubstances = _addExceipientSubstances;
            vm.editExceipientSubstances = _editExceipientSubstances;
            vm.removeExceipientSubstances = _removeExceipientSubstances;
            vm.addDiluentSubstances = _addDiluentSubstances;
            vm.editDiluentSubstances = _editDiluentSubstances;
            vm.removeDiluentSubstances = _removeDiluentSubstances;

            vm.addAtcProduct = _addAtcProduct;
            vm.removeAtcProduct = _removeAtcProduct;

            //product detail
            //lookups
            var initProductDetail = _initProductDetail;
            //product detail continued
            //lookups
            var initProductDetailContinued = _initProductDetailContinued;
            // Manufacturer related
            var initManufacturer = _initManufacturer;
            vm.searchManufacturer = _searchManufacturer;
            vm.registerNewManufacturer = _registerNewManufacturer;
            vm.addManufacturerToList = _addManufacturerToList;
            vm.deleteManufacturerFromList = _deleteManufacturerFromList;
            vm.firstLetterGroupFn = _firstLetterGroupFn;
            vm.getDocuments = _getDocuments;
            vm.openFileModal = _openFileModal;

            // foreign application status
            vm.addForeignApplicationStatus = _addForeignApplicationStatus;
            vm.editForeignApplicationStatus = _editForeignApplicationStatus;
            vm.removeForeignApplicationStatus = _removeForeignApplicationStatus;

            //checklist
            var initChecklist = _initChecklist;
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
            vm.checklistToTerms = _checklistToTerms;
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

            vm.SubmitNewApplication = _SubmitNewApplication;
            var recursiveFunction = _recursiveFunction;

            vm.isInputDisabled = _isInputDisabled;
            vm.hasError = _hasError;
            vm.onChange = _onChange;
            vm.saveDraft = _saveDraft;
            vm.showAnswerButton = RegistrationFactory.showAnswerButton;

            init();

            prepareProductInfo();
            // initForGeneralInfo
            _initForGeneralInfo();


            function init() {
                vm.user = AccountService.userInfo();
                vm.isUpdateMode = true;
                vm.CONSTANT = RegistrationConst;

                vm.maId = $stateParams.maId;
                vm.variationInformation = $stateParams.variationInformation !== null ?
                $stateParams.variationInformation : StorageService.get('variationInformation'); // variation Information should be fetched from API

                vm.maVariationSummary = vm.variationInformation.maVariationSummary;
                vm.currentMAFieldState = maFields;
                vm.maregistration = maVariation;
                vm.submoduleTypeCode = maVariation.submoduleTypeCode;
                vm.originalMA = angular.copy(vm.maregistration);
                vm.maregistration.ma.maAssignments = null;
                vm.maregistration.ma.verificationNumber = null;
                //set SRA to false manually.
                vm.maregistration.ma.isSRA = false;
                vm.maregistration.ma.sra = null;
                //set maPayment and summary
                vm.maregistration.ma.maPayments = vm.variationInformation.ma_payment;
                vm.maregistration.comment = vm.variationInformation.summary;
                //Returns true if the application is of Major Type
                isMajor = VariationService.checkMajor({ major: vm.maVariationSummary.majorVariationCount, minor: vm.maVariationSummary.minorVariationCount });

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
                    checklist: [],
                    terms: {}
                };

                vm.checklistTypeCode = "PSCR";
                //general Info
                //lookups for general info
                vm.agents = [];
                vm.agent = {};

                vm.deviceModelSizes = [];
                vm.deviceAccessories = []; // use for medical Device accessories and spare parts

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

                vm.warning = "has-warning";
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

                vm.maregistration.ma.createdByUserID = vm.user.id;
                var presentations = [];
                _.each(vm.maregistration.product.presentations, function(present) {
                    presentations.push(present.packSize);
                });
                vm.maregistration.product.presentations = presentations;
                //Save original for history
                UtilityFactory.identifier.get({ key: "MarketAuthorization" }, function(data) {
                    vm.identifier = data.data;
                    vm.maregistration.identifier = vm.identifier;
                });
                vm.maregistration.checklists = null; //remove original checklists documents. Because new one is needed for variation

            }

            function _onAgentSelected() {
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

            function _getAgents() {
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

            function _initForGeneralInfo() {
                if (vm.applicationTypes == undefined) {
                    LookUpFactory.moduleMaType.query({ moduleCode: AppConst.Modules.Variation, submoduleTypeCode: vm.submoduleTypeCode }, function(data) {
                        vm.applicationTypes = data;
                        // NOTE: Submodule Code is the same as Ma Type Code
                        vm.maregistration.submoduleCode = VariationService.getMaTypeCode(isMajor, vm.submoduleTypeCode);
                        vm.maregistration.ma.maType = _.find(vm.applicationTypes, function(data) {
                            return data.maTypeCode === vm.maregistration.submoduleCode;
                        });
                        vm.getDocuments();
                    });
                }

                if (vm.suppliers == undefined) {
                    vm.getAgents();
                }
                if (vm.sras == undefined) {
                    vm.sras = CommodityFactory.sra.query();
                }
            }

            function _initProductDetail() {
                if (vm.productCategories == undefined) vm.productCategories = CommodityFactory.productCategoryBySubmoduleTypeCode.query({ submoduleTypeCode: vm.submoduleTypeCode });
                if (vm.ageGroupes == undefined) vm.ageGroupes = CommodityFactory.ageGroup.query();
                if (vm.deviceGroups == undefined) vm.deviceGroups = CommodityFactory.mDGrouping.query();
                if (vm.deviceClasses == undefined) vm.deviceClasses = RegistrationFactory.getDeviceClasses(vm);
            }

            function _initProductDetailContinued() {
                vm.productTypes = RegistrationFactory.getProductTypes(vm);
                if (vm.useCategories == undefined) vm.useCategories = CommodityFactory.useCategory.query();
            }

            function _addActiveSubstances() {
                RegistrationFactory.addActiveSubstances(vm);
            }

            function _editActiveSubstances(data) {
                RegistrationFactory.editActiveSubstances(vm, data);
            }

            function _removeActiveSubstance(data) {
                RegistrationFactory.removeActiveSubstance(vm, data);
            }

            function _addExceipientSubstances() {
                RegistrationFactory.addExceipientSubstances(vm);
            }

            function _editExceipientSubstances(data) {
                RegistrationFactory.editExceipientSubstances(vm, data);
            }

            function _removeExceipientSubstances(data) {
                RegistrationFactory.removeExceipientSubstances(vm, data);
            }

            function _addDiluentSubstances() {
                RegistrationFactory.addDiluentSubstances(vm);
            }

            function _editDiluentSubstances(data) {
                RegistrationFactory.editDiluentSubstances(vm, data);
            }

            function _removeDiluentSubstances(data) {
                RegistrationFactory.removeDiluentSubstances(vm, data);
            }

            function _addAtcProduct() {
                RegistrationFactory.addAtcProduct(vm);
            }

            function _removeAtcProduct(data) {
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

            function _addForeignApplicationStatus() {
                RegistrationFactory.addForeignApplicationStatus(vm);
            }

            function _editForeignApplicationStatus(data) {
                RegistrationFactory.editForeignApplicationStatus(vm, data);
            }

            function _removeForeignApplicationStatus(data) {
                RegistrationFactory.removeForeignApplicationStatus(vm, data);
            }


            function _initManufacturer() {
                RegistrationFactory.initManufacturer(vm, LookUpFactory);
            }

            function _searchManufacturer(keyWords, $event) {
                RegistrationFactory.searchManufacturer(vm, LookUpFactory, keyWords, $event);
            }

            function _registerNewManufacturer() {
                RegistrationFactory.registerNewManufacturer();
            }

            function _addManufacturerToList() {
                RegistrationFactory.addManufacturerToList(vm);
            }
            /*
             * Remove manufacturer_and_type data from the list;
             * */
            function _deleteManufacturerFromList(data, idx) {
                RegistrationFactory.deleteManufacturerFromList(vm, data, idx);
            }


            function _firstLetterGroupFn(item) {
                RegistrationFactory.firstLetterGroupFn(item);
            }

            function _getDocuments() {
                RegistrationFactory.initAttachment(vm, ModuleSettingsFactory, 'new');
            }

            function _openFileModal(moduleDocument) {
                RegistrationFactory.openFileModal(moduleDocument);
            }

            function _initChecklist() {
                // var isBothVariationType = VariationService.isBothVariationType({ major: vm.maVariationSummary.majorVariationCount, minor: vm.maVariationSummary.minorVariationCount });
                // ,isBothVariationType: isBothVariationType
                vm.submoduleCheckList = ChecklistFactory.ChecklistBySubmodule.query({
                    submoduleCode: vm.maregistration.submoduleCode,
                    checklistTypeCode: "PSCR",
                    isSra: vm.maregistration.ma.isSRA
                });
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
                var prevState = RegistrationFactory.stateToGo(vm.states, vm.submoduleTypeCode, vm.states.product);
                vm.slickIndex = 0;
                vm.value = 0;
                $state.go(prevState);
            }

            function _productToContinued() {
                vm.maregistrationValidation.productdetail.$showError = true;
                if (vm.maregistrationValidation.productdetail.$isValid) {
                    vm.slickIndex = 2;
                    vm.value = 20; //progress bar value
                    var nextState = RegistrationFactory.stateToGo(vm.states, vm.submoduleTypeCode, vm.states.productdetailContinued);
                    $state.go(nextState);
                    initProductDetailContinued();
                } else return;
            }

            function _backToProductContinued() {
                vm.value = 10; //progress bar value
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
                        NotificationService.notify("Finished Product manufacturer is required!", "alert-danger");
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
                    if (!CommonService.checkUndefinedOrNull(vm.submoduleCheckList)) initChecklist();
                    $state.go(vm.states.checklist);
                    vm.value = 90;
                    vm.slickIndex = 8;
                } else return;

            }

            function _checklistToTerms() {
                vm.maregistrationValidation.checklist.$showError = true;
                if (vm.maregistrationValidation.checklist.$isValid) {
                    RegistrationFactory.setFinishedManufacturer(vm);
                    var nextState = RegistrationFactory.stateToGo(vm.states, vm.submoduleTypeCode, vm.states.termsAndConditions);
                    $state.go(nextState);
                    vm.slickIndex = 8;
                    vm.value = 99;
                } else return;
            }

            function _SubmitNewApplication() {
                vm.maregistrationValidation.terms.$showError = true;
                if (vm.maregistrationValidation.$isValid) {
                    //Flag application progress to true;
                    applicationInProgress = true;
                    var model = RegistrationFactory.prepareRegistration(vm.maregistration, vm, 'new', 'variation');
                    // Set variation summary information
                    model.ma.maVariationSummary = vm.maVariationSummary;
                    RegistrationFactory.variation.save(model, function(response) {
                        //Flag application progress to false;
                        applicationInProgress = false;
                        RegistrationFactory.submitMAResponse(response, { stateName: 'maregistration.list' });
                    }, function() {
                        //Flag application progress to false;
                        applicationInProgress = false;
                        NotificationService.notify("Unable to save data. Please try again!", "alert-danger");
                    });
                } else return;
            }

            function _recursiveFunction(checklist) {
                var userChecklist = $filter("filter")(checklist.maChecklists, { responderType: { name: 'User' } })[0];
                checklist.optionID = userChecklist != null ? userChecklist.optionID : null;
                if (checklist.children.length > 0) {
                    _.each(checklist.children, function(ch) {
                        recursiveFunction(ch);
                    });
                }
            }

            function _isInputDisabled(fieldCode) {
                if (fieldCode == 'Checklists' || fieldCode == 'Documents' || fieldCode == 'sra' || fieldCode == 'Dossier') {
                    return false;
                }
                return VariationService.isInputDisabled(vm, fieldCode);
            }

            function _hasError(name) {
                return VariationService.hasError(vm, name);
            }

            function _onChange(fieldCode) {
                if (fieldCode == 'isSra') {
                    initChecklist();
                    vm.getDocuments();
                    return;
                }
                VariationService.onChange(vm, fieldCode);
            }

            function _saveDraft(autosave) {
                if (applicationInProgress == true) {
                    return; //If application is in progress (SubmitNewApplication is called, cancel all WIP).
                }
                var model = RegistrationFactory.prepareRegistration(vm.maregistration, vm, 'new', 'variation');
                var WIPModel = {
                    type: AppConst.Modules.Variation,
                    userID: vm.user.id,
                    contentObject: model,
                    rowguid: model.identifier
                };
                RegistrationFactory.saveDraft(WIPModel, autosave);
            }

            //Register to autosave counter  [fired from keepalive (part of ng
            $scope.$on('Keepalive', function() {
                vm.saveDraft(true);
            });

        });

})(window.angular);