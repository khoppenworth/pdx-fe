(function(angular) {
    'use strict';
    angular.module('pdx.controllers')
        .controller('MANewWIPApplicationController', function($scope, LookUpFactory, PipFactory, ChecklistFactory, RegistrationFactory, CommodityFactory,
            ModuleSettingsFactory, AppConst, AccountService, SupplierFactory, NotificationService, $state, RegistrationConst, MAFactory,
            AgentFactory, $stateParams, WIPFactory) {

            var vm = this;
            //Flag that determines whether an application creation is in process or not. If in process cancel all save draft requests.
            // Needed to include this because wip is again created for a submitted application because save draft was called once an application was created.
            // Check this on create app api call.
            var applicationInProgress = false;

            vm.onAgentSelected = _onAgentSelected;
            vm.onChange = _onChange;
            vm.isInputVisible = _isInputVisible;
            vm.getAgents = _getAgents;
            vm.calculateFee = _calculateFee;

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

            vm.addForeignApplicationStatus = _addForeignApplicationStatus;
            vm.editForeignApplicationStatus = _editForeignApplicationStatus;
            vm.removeForeignApplicationStatus = _removeForeignApplicationStatus;

            vm.searchManufacturer = _searchManufacturer;
            vm.registerNewManufacturer = _registerNewManufacturer;
            vm.addManufacturerToList = _addManufacturerToList;
            vm.deleteManufacturerFromList = _deleteManufacturerFromList;

            vm.firstLetterGroupFn = _firstLetterGroupFn;
            vm.openFileModal = _openFileModal;

            vm.generalToProduct = _generalToProduct;
            vm.backToProduct = _backToProduct;
            vm.productToContinued = _productToContinued;
            vm.backToProductContinued = _backToProductContinued;
            vm.productContinuedToComposition = _productContinuedToComposition;
            vm.compositionToManufacturers = _compositionToManufacturers;
            vm.backToManufacturer = _backToManufacturer;

            vm.addDeviceModelSize = _addDeviceModelSize;
            vm.editDeviceModelSize = _editDeviceModelSize;
            vm.removeDeviceModelSize = _removeDeviceModelSize;

            vm.addFoodComposition = _addFoodComposition;
            vm.editFoodComposition = _editFoodComposition;
            vm.removeFoodComposition = _removeFoodComposition;

            vm.addDeviceAccessory = _addDeviceAccessory;
            vm.editDeviceAccessory = _editDeviceAccessory;
            vm.removeDeviceAccessory = _removeDeviceAccessory;

            vm.backToComposition = _backToComposition;
            vm.manufacturersToForeignApplications = _manufacturersToForeignApplications;
            vm.foreignToAttachment = _foreignToAttachment;
            vm.attachmentToDossier = _attachmentToDossier;
            vm.dossierToChecklist = _dossierToChecklist;
            vm.checklistToTerms = _checklistToTerms;

            vm.SubmitNewApplication = _SubmitNewApplication;
            vm.saveDraft = _saveDraft;

            init();

            function init() {
                vm.user = AccountService.userInfo();
                vm.CONSTANT = RegistrationConst;

                /*
                 * State definitions; Obtained from parent controller (MANewApplicationController controller; see definitions there!)
                 * */
                vm.states = $scope.newApplicationStates.wip;

                //slick setting
                vm.slickConfig = {
                    enabled: true,
                    method: {}
                };
                vm.slickIndex = 0;

                vm.deviceModelSizes = [];

                //composition
                vm.productInns = [];
                vm.productInn = {};
                vm.foodCompositions = [];
                vm.deviceAccessories = []; // use for medical Device accessories and spare parts

                vm.productExcipeints = [];
                vm.productDiluents = [];

                vm.productAtcs = [];
                vm.productAtc = {};

                vm.pageNo = 0;
                vm.pageSize = 50;

                //validation model
                vm.maregistrationValidation = {
                    generalInfo: {},
                    productdetail: {},
                    productdetailContinued: {},
                    productInn: [],
                    foodCompositions: [],
                    deviceAccessories: [],
                    productManu: [],
                    attachment: [],
                    dossier: [],
                    checklist: [],
                    terms: {}
                };

                //ma registration model
                vm.maregistration = {
                    ma: { foreignApplications: [], createdByUserID: vm.user.id, maChecklists: [], isSRA: false },
                    product: { productCompositions: [], productATCs: [], productManufacturers: [], commodityTypeID: 1 },
                    documents: [],
                    uploadedDocuments: [],
                    submoduleCode: "NGWB"
                };


                //general Info
                //lookups for general info
                vm.agents = [];
                vm.agent = {};

                vm.value = 0;

                vm.showCalculateFeeResult = false;

                vm.productAtcValidation = {};
                vm.dynamicPopover = {
                    templateUrl: 'myPopoverTemplate.html',
                };

                //foreign application status
                vm.foreignApplicationStatuses = [];
                vm.foreignApplicationStatus = {};

                vm.showAnswerButton = RegistrationFactory.showAnswerButton;

                if (vm.applicationList == undefined) {
                    vm.applicationList = RegistrationFactory.subModuleTypeByUserPrivilage.query();
                }

                vm.sras = CommodityFactory.sra.query();

                loadWIPData();
            }


            $scope.$on('Keepalive', function() {
                vm.saveDraft(true);
            });

            function _onAgentSelected() {
                if (vm.agent.selected != undefined) {
                    SupplierFactory.agentSupplier.query({ agentID: vm.agent.selected.id, agentLevelCode: "FAG" }, function(data) {
                        vm.suppliers = data;
                    });
                }
            }

            function _onChange(type) {
                if (type === 'MAType') {
                    initAttachment();
                    initChecklist();
                    vm.productTypes = RegistrationFactory.getProductTypes(vm);
                    vm.deviceClasses = RegistrationFactory.getDeviceClasses(vm, true);
                } else if (type == 'isSra') {
                    initChecklist();
                    initAttachment();
                    if (!vm.maregistration.ma.isSRA) {
                        //remove validation property if sra is no longer selected.
                        delete vm.maregistrationValidation.generalInfo.sraList;
                    }
                } else if (type == 'Application') {
                    vm.submoduleTypeCode = vm.maregistration.application.submoduleTypeCode;
                    initForGeneralInfo();
                    loadProductLookups();
                }

            }

            function _isInputVisible(fieldCode) {
                return RegistrationFactory.isInputVisible(vm, fieldCode);
            }

            function _getAgents() {
                if (vm.user.isAgent) {
                    AgentFactory.userAgent.query({ userID: vm.user.id }, function(data) {
                        vm.agents = data;
                        vm.agent.selected = vm.agents[0];
                        vm.onAgentSelected();
                    });
                }
            }

            function initForGeneralInfo() {
                vm.maregistration.ma.maType = undefined; //Reset Application Type UI Select
                vm.applicationTypes = LookUpFactory.moduleMaType.query({ moduleCode: AppConst.Modules.NewApplication, submoduleTypeCode: vm.submoduleTypeCode });

                if (vm.suppliers == undefined) {
                    vm.getAgents();
                }
                if (vm.sras == undefined) {
                    vm.sras = CommodityFactory.sra.query();
                }
            }

            //calculate fee
            function _calculateFee() {
                if (vm.maregistration.ma.maType == null) {
                    NotificationService.notify("Select Application Type", "alert-warning");
                    return;
                } else {
                    vm.submoduleFeeType = MAFactory.submoduleFee.query({ submoduleCode: vm.maregistration.ma.maType.maTypeCode });
                    initChecklist();
                    vm.showCalculateFeeResult = true;
                }
            }

            //product detail
            //lookups
            function initProductDetail() {
                if (vm.productCategories == undefined) vm.productCategories = CommodityFactory.productCategoryBySubmoduleTypeCode.query({ submoduleTypeCode: vm.submoduleTypeCode });
                if (vm.ageGroupes == undefined) vm.ageGroupes = CommodityFactory.ageGroup.query();

                if (vm.submoduleTypeCode === RegistrationConst.SUB_MODULE_TYPE.MEDICAL_DEVICE) {
                    if (vm.deviceGroups == undefined) vm.deviceGroups = CommodityFactory.mDGrouping.query();
                }
            }

            //loads product lookups based on selected application(i.e submoduleTypeCode)
            function loadProductLookups() {
                vm.useCategories = CommodityFactory.useCategory.query({ submoduleTypeCode: vm.submoduleTypeCode });
                if (vm.accessoryTypes == undefined) vm.accessoryTypes = CommodityFactory.accessoryType.query();
            }

            //checklist
            function initChecklist() {
                vm.submoduleCheckList = ChecklistFactory.ChecklistBySubmodule.query({
                    submoduleCode: vm.maregistration.ma.maType.maTypeCode,
                    checklistTypeCode: "PSCR",
                    isSra: vm.maregistration.ma.isSRA
                }, function(data) {

                    _.each(data, function(ch) {
                        recursiveFunction(ch);
                    });
                    return data;
                });
            }

            function loadWIPData() {
                WIPFactory.getWIPByID.get({ id: $stateParams.id }, function(data) {
                    populateWipData(data.contentObject);
                });
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

            // Foreign Application
            function _addForeignApplicationStatus() {
                RegistrationFactory.addForeignApplicationStatus(vm);
            }

            function _editForeignApplicationStatus(data) {
                RegistrationFactory.editForeignApplicationStatus(vm, data);
            }

            function _removeForeignApplicationStatus(data) {
                RegistrationFactory.removeForeignApplicationStatus(vm, data);
            }

            ///Manufacturer
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

            //Attachments
            function initAttachment() {
                RegistrationFactory.initAttachment(vm, ModuleSettingsFactory, 'wip');
            }

            function _openFileModal(moduleDocument) {
                RegistrationFactory.openFileModal(moduleDocument);
            }

            function _generalToProduct() {
                vm.maregistrationValidation.generalInfo.$showError = true;
                if (vm.maregistrationValidation.generalInfo.$isValid) {
                    vm.value = 13;
                    vm.slickIndex = 1;
                    var nextState = RegistrationFactory.stateToGo(vm.states, vm.submoduleTypeCode, vm.states.product);
                    $state.go(nextState);
                    initProductDetail();
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
                    vm.value = 26;
                    vm.slickIndex = 2;
                    var nextState = RegistrationFactory.stateToGo(vm.states, vm.submoduleTypeCode, vm.states.productdetailContinued);
                    $state.go(nextState);
                } else return;
            }

            function _backToProductContinued() {
                vm.value = 10; //progress bar value
                vm.slickIndex = 2;
                var prevState = RegistrationFactory.stateToGo(vm.states, vm.submoduleTypeCode, vm.states.productdetailContinued);
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
                vm.value = 40;
                vm.slickIndex = 4;
                $state.go(vm.states.manufacturer);
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

            function _manufacturersToForeignApplications() {
                vm.maregistrationValidation.productManu.$showError = true;
                if (vm.maregistrationValidation.productManu.$isValid) {
                    var validManufacturer = RegistrationFactory.validateManufacturer(vm.maregistration.product.productManufacturers);
                    if (!validManufacturer) {
                        NotificationService.notify("Finished Product manufacturer is required!", "alert-danger");
                        return;
                    }
                    $state.go(vm.states.foreignStatus);
                    vm.value = 65;
                    vm.slickIndex = 5;
                } else {
                    NotificationService.notify("Please add one or more Manufacturers", "alert-warning");
                    return;
                }
            }

            function _foreignToAttachment() {
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
                    vm.value = 87;
                    vm.slickIndex = 8;
                } else return;
            }

            function _checklistToTerms() {
                vm.maregistrationValidation.checklist.$showError = true;
                if (vm.maregistrationValidation.checklist.$isValid) {
                    RegistrationFactory.setFinishedManufacturer(vm);
                    var prevState = RegistrationFactory.stateToGo(vm.states, vm.submoduleTypeCode, vm.states.termsAndConditions);
                    $state.go(prevState);

                    vm.value = 93;
                    vm.slickIndex = 9;
                } else return;
            }

            function _SubmitNewApplication() {
                vm.maregistrationValidation.terms.$showError = true;
                if (vm.maregistrationValidation.$isValid) {
                    //Flag application progress to true;
                    applicationInProgress = true;
                    var model = RegistrationFactory.prepareRegistration(vm.maregistration, vm, 'wip');
                    vm.value = 100;
                    MAFactory.maNewApplication.save(model, function(response) {
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

            function populateWipData(data) {
                vm.identifier = data.identifier;
                vm.maregistration.identifier = vm.identifier;
                vm.maregistration.ma.isSRA = data.ma.isSRA;
                vm.maregistration.ma.sralist = [];
                vm.maregistration.ma.maType = data.ma.maType;
                vm.maregistration.ma.supplier = data.ma.supplier;
                vm.maregistration.ma.foreignApplications = data.ma.foreignApplications;
                vm.maregistration.ma.checklists = data.ma.maChecklists;

                // _.each(vm.maregistration.ma.checklists, function (checklist) {
                //   RegistrationFactory.recursiveFunction(checklist);
                // })
                if (angular.isDefined(data.ma.sra) && data.ma.sra != null) {
                    var array = data.ma.sra.split(',');
                    angular.forEach(array, function(sra) {
                            this.push({ name: sra });
                        },
                        vm.maregistration.ma.sralist);
                }

                //submodule type and application
                vm.maregistration.application = data.ma.maType.submoduleType;
                vm.submoduleTypeCode = vm.maregistration.application.submoduleTypeCode;
                vm.applicationTypes = LookUpFactory.moduleMaType.query({ moduleCode: AppConst.Modules.NewApplication, submoduleTypeCode: vm.submoduleTypeCode });
                vm.productTypes = RegistrationFactory.getProductTypes(vm);
                vm.deviceClasses = RegistrationFactory.getDeviceClasses(vm);
                angular.copy(data.product, vm.maregistration.product);


                loadProductLookups();

                prepareProductInfo(data);

                data.dossiers = data.dossiers ? data.dossiers : [];
                vm.maregistration.uploadedDocuments = data.documents.concat(data.dossiers);

                if (vm.suppliers == undefined) {
                    vm.getAgents();
                }

                initAttachment();
                initChecklist();

            }

            function prepareProductInfo(data) {
                switch (vm.submoduleTypeCode) {
                    case RegistrationConst.SUB_MODULE_TYPE.MEDICINE:
                        _.each(vm.maregistration.product.productCompositions, function(pc) {
                            if (pc.isActiveComposition) {
                                vm.productInns.push(pc);
                            } else if (!pc.isActiveComposition && !pc.isDiluent) {
                                vm.productExcipeints.push(pc);
                            } else if (!pc.isActiveComposition && pc.isDiluent) {
                                vm.productDiluents.push(pc);
                            }
                        });
                        break;
                    case RegistrationConst.SUB_MODULE_TYPE.FOOD:
                        vm.foodCompositions = vm.maregistration.product.foodCompositions;
                        break;
                    case RegistrationConst.SUB_MODULE_TYPE.MEDICAL_DEVICE:
                        vm.deviceModelSizes = _.isNull(vm.maregistration.product.mdModelSizes) ? [] : vm.maregistration.product.mdModelSizes;
                        vm.deviceAccessories = _.isNull(vm.maregistration.product.deviceAccessories) ? [] : vm.maregistration.product.deviceAccessories;
                        break;
                }

                vm.maregistration.product.presentations = [];
                _.each(data.product.presentations, function(present) {
                    vm.maregistration.product.containerType = present.packaging;
                    vm.maregistration.product.presentations.push(present.packSize);
                });

            }

            function _saveDraft(autosave) {
                if (applicationInProgress == true) {
                    return; //If application is in progress (SubmitNewApplication is called, cancel all WIP).
                }
                if ($state.current.name.toLowerCase() == vm.states.general) {
                    return;
                }
                var model = RegistrationFactory.prepareRegistration(vm.maregistration, vm, 'wip');

                var WIPModel = {
                    type: AppConst.Modules.NewApplication,
                    userID: vm.user.id,
                    contentObject: model,
                    rowguid: model.identifier
                };

                RegistrationFactory.saveDraft(WIPModel, autosave);

            }

            function recursiveFunction(checklist) {
                _.each(vm.maregistration.ma.checklists, function(mac) {
                    if (mac.checklistID === checklist.id) {
                        checklist.optionID = mac.optionID;
                    }
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
        });

})(window.angular);