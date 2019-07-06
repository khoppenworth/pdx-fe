(function(angular) {
    'use strict';

    angular.module('pdx.controllers')
        .controller('MAVariationWIPController', function($scope, LookUpFactory, ChecklistFactory, RegistrationFactory, CommodityFactory, $ngConfirm,
            ModuleSettingsFactory, AppConst, AccountService, SupplierFactory, NotificationService, $state, CommonService, AgentFactory,
            $stateParams, $filter, VariationService, maVariation, RegistrationConst, blockUI, MAFactory) {

            blockUI.stop(); //stop ui blocker if it is running.  Its started in route (see variation.route) till resolves are completed.

            var vm = this;
            //Flag that determines whether an application creation is in process or not. If in process cancel all save draft requests.
            // Needed to include this because wip is again created for a submitted application because save draft was called once an application was created.
            // Check this on create app api call.
            var applicationInProgress = false;
            // State definitions; Obtained from parent controller (MAVariationController controller; see definitions there!)
            vm.states = $scope.variationStates.wip;
            //  agent functions
            vm.onAgentSelected = _onAgentSelected;
            vm.getAgents = _getAgents;
            //  Manufacturer related functions
            vm.searchManufacturer = _searchManufacturer;
            vm.registerNewManufacturer = _registerNewManufacturer;
            vm.addManufacturerToList = _addManufacturerToList;
            vm.deleteManufacturerFromList = _deleteManufacturerFromList;
            vm.firstLetterGroupFn = _firstLetterGroupFn;

            // foreign application status
            vm.addForeignApplicationStatus = _addForeignApplicationStatus;
            vm.editForeignApplicationStatus = _editForeignApplicationStatus;
            vm.removeForeignApplicationStatus = _removeForeignApplicationStatus;
            vm.addAtcProduct = _addAtcProduct;
            vm.removeAtcProduct = _removeAtcProduct;
            // Substances related functions (Product Composition)
            vm.addActiveSubstances = _addActiveSubstances;
            vm.editActiveSubstances = _editActiveSubstances;
            vm.removeActiveSubstance = _removeActiveSubstance;
            // Exceipient Substance
            vm.addExceipientSubstances = _addExceipientSubstances;
            vm.editExceipientSubstances = _editExceipientSubstances;
            vm.removeExceipientSubstances = _removeExceipientSubstances;
            // Diluent Substance
            vm.addDiluentSubstances = _addDiluentSubstances;
            vm.editDiluentSubstances = _editDiluentSubstances;
            vm.removeDiluentSubstances = _removeDiluentSubstances;
            //Attachments
            vm.getDocuments = _getDocuments;
            vm.openFileModal = _openFileModal;

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

            vm.SubmitNewApplication = _submitNewApplication;
            vm.SubmitReturnedApplication = _submitReturnedApplication;
            vm.isInputDisabled = _isInputDisabled;
            vm.hasError = _hasError;
            vm.onChange = _onLookupChange;
            vm.showAnswerButton = RegistrationFactory.showAnswerButton;
            vm.saveDraft = _saveDraft;

            init();

            prepareProductInfo();

            initForGeneralInfo();

            function init() {
                vm.CONSTANT = RegistrationConst;
                vm.currentMAFieldState = [];
                vm.currentMAFieldState = RegistrationFactory.maFieldById.query({
                    id: maVariation.contentObject.ma.id,
                    isVariationType: true,
                    submoduleTypeCode: vm.submoduleTypeCode 
                });
                vm.maregistration = maVariation.contentObject;
                vm.identifier = vm.maregistration.identifier;
                vm.submoduleTypeCode = vm.maregistration.submoduleTypeCode;
                vm.maId = vm.maregistration.ma.id;
                vm.user = AccountService.userInfo();
                //set SRA to false manually.
                vm.maregistration.ma.isSRA = false;
                vm.maregistration.ma.sra = null;

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
                    checklist: [],
                    terms: {}
                };
                //general Info
                //lookups for general info
                vm.agents = [];
                vm.agent = {};

                vm.deviceModelSizes = [];
                vm.deviceAccessories = []; // use for medical Device accessories and spare parts

                //Manufacturer
                //lookups
                vm.pageNo = 0;
                vm.pageSize = 50;

                vm.allSelectedManufacturerTypes = [];
                vm.manufacturer_and_type = [];
                vm.manufacturerT = [];
                vm.manu = [];
                // Product ATC related variables
                vm.productAtc = {};
                vm.productAtcValidation = {};
                vm.dynamicPopover = {
                    templateUrl: 'myPopoverTemplate.html'
                };
                // composition
                vm.productInn = {};
                // ma status related variables
                vm.updateStatusLogValidation = {};
                vm.maStatusModel = {};
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
                if (angular.isDefined(vm.maregistration.ma.sra) && vm.maregistration.ma.sra != null) {
                    vm.maregistration.ma.sralist = [];
                    var array = vm.maregistration.ma.sra.split(',');
                    angular.forEach(array, function(sra) {
                            this.push({ name: sra });
                        },
                        vm.maregistration.ma.sralist);
                }

                var presentations = [];
                _.each(vm.maregistration.product.presentations, function(present) {
                    presentations.push(present.packSize);
                });
                vm.maregistration.product.presentations = presentations;
                vm.maregistration.uploadedDocuments = vm.maregistration.documents;
            }

            function _onAgentSelected() {
                if (vm.agent.selected != undefined) {
                    SupplierFactory.agentSupplier.query({ agentID: vm.agent.selected.id, agentLevelCode: "FAG" }, function(data) {
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

            function initForGeneralInfo() {
                if (vm.applicationTypes == undefined) {
                    vm.applicationTypes = LookUpFactory.moduleMaType.query({ moduleCode: AppConst.Modules.Variation, submoduleTypeCode: vm.submoduleTypeCode });
                }

                if (vm.suppliers == undefined) {
                    vm.getAgents();
                }
                if (vm.sras == undefined) {
                    vm.sras = CommodityFactory.sra.query();
                }
                vm.getDocuments();
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

            function initManufacturer() {
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

            function _deleteManufacturerFromList(data, idx) {
                RegistrationFactory.deleteManufacturerFromList(vm, data, idx);
            }

            function _firstLetterGroupFn(item) {
                RegistrationFactory.firstLetterGroupFn(item);
            }

            function _getDocuments() {
                RegistrationFactory.initAttachment(vm, ModuleSettingsFactory, 'wip');
            }

            function _openFileModal(moduleDocument) {
                RegistrationFactory.openFileModal(moduleDocument);
            }

            //checklist
            function initChecklist() {
                ChecklistFactory.ChecklistBySubmodule.query({
                    submoduleCode: vm.maregistration.submoduleCode,
                    checklistTypeCode: "PSCR",
                    isSra: vm.maregistration.ma.isSRA
                }, function(data) {
                    vm.submoduleCheckList = data;
                    _.each(vm.submoduleCheckList, function(checklist) {
                        recursiveFunction(checklist);
                    });
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
                vm.slickIndex = 0;
                vm.value = 0;
                var prevState = RegistrationFactory.stateToGo(vm.states, vm.submoduleTypeCode, vm.states.product);
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
                    vm.value = 99;
                    vm.slickIndex = 9;
                } else return;
            }

            function _submitNewApplication() {
                vm.maregistrationValidation.terms.$showError = true;
                if (vm.maregistrationValidation.$isValid) {
                    //Flag application progress to true;
                    applicationInProgress = true;
                    var model = RegistrationFactory.prepareRegistration(vm.maregistration, vm, 'wip', 'variation');
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

            function _submitReturnedApplication() {
                vm.maregistrationValidation.checklist.$showError = true;
                if (vm.maregistrationValidation.$isValid) {
                    $ngConfirm({
                        title: "Reply",
                        contentUrl: 'app/registration/workflow/modals/changeMAStatus.html',
                        type: "green",
                        typeAnimated: true,
                        closeIcon: true,
                        scope: $scope,
                        columnClass: 'col-md-6 col-md-offset-3',
                        buttons: {
                            update: {
                                text: "Submit",
                                btnClass: "btn-primary",
                                action: function() {
                                    // if (vm.updateStatusLogValidation.$isValid) {
                                    var model = RegistrationFactory.prepareRegistration(vm.maregistration, vm, 'wip');
                                    vm.maregistration.comment = vm.maStatusModel.Comment;
                                    RegistrationFactory.variation.update(model, function() {
                                        NotificationService.notify('Successfully updated!', 'alert-success')
                                        $state.go('maregistration.list.info', { maId: $stateParams.maId })
                                    }, function() {
                                        NotificationService.notify('Unable to save data. Please try again!', 'alert-danger')
                                    });
                                    //} else return false;
                                }
                            }
                        }
                    });
                } else return;
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

            function _onLookupChange(fieldCode) {
                if (fieldCode == 'isSra') {
                    initChecklist();
                    vm.getDocuments();
                    return;
                }
                VariationService.onChange(vm, fieldCode);
            }

            function recursiveFunction(checklist) {
                var userChecklist = $filter("filter")(vm.maregistration.ma.maChecklists, { checklistID: checklist.id })[0];
                checklist.optionID = userChecklist != null ? userChecklist.optionID : null;
                if (checklist.children.length > 0) {
                    _.each(checklist.children, function(ch) {
                        recursiveFunction(ch);
                    })
                }
            }

            function _saveDraft(autosave) {
                if (applicationInProgress == true) {
                    return; //If application is in progress (SubmitNewApplication is called, cancel all WIP).
                }

                /* if($state.current.name.toLowerCase()=="maregistration.renewal.wip.previous"){
                   return;
                 }*/

                var model = RegistrationFactory.prepareRegistration(vm.maregistration, vm, 'wip', 'variation');

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