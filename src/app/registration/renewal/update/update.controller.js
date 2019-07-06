(function(angular) {
    'use strict';

    angular.module('pdx.controllers')
        .controller('MAUpdateRenewalController', function(RegistrationFactory, AccountService, $state, $scope, $ngConfirm,
            ModuleSettingsFactory, NotificationService, $stateParams, CommodityFactory, $filter, LookUpFactory, RegistrationConst,MAFactory) {

            var vm = this;
            var saveModel; // model to save changes
            var maStatusCode;
            //Methods
            //Navigation Methods
            vm.previousApp = _previousApp; 
            vm.previousAppToAttachment = _previousAppToAttachment; 
            vm.attachmentToDossier = _attachmentToDossier;
            vm.dossierToChecklist = _dossierToChecklist;
            vm.productToContinued = _productToContinued;
            vm.productContinuedToComposition = _productContinuedToComposition;
            vm.compositionToManufacturers = _compositionToManufacturers;
            vm.manufacturersToForeignApplications = _manufacturersToForeignApplications;
            vm.foreignToAttachment = _foreignToAttachment;
            
            vm.backToProduct = _backToProduct;
            vm.backToProductContinued = _backToProductContinued;
            vm.backToComposition = _backToComposition;
            vm.backToPreviousApp = _previousApp;


            vm.openFileModal = _openFileModal;
            vm.SubmitNewApplication = _SubmitNewApplication;
            vm.SubmitReturnedApplication = _SubmitReturnedApplication;
            vm.isInputDisabled = _isInputDisabled;
            vm.hasError = _hasError;
            vm.onChange = _onChange;
            vm.gotoOriginalMA = _gotoOriginalMA;
            vm.addFirDoc = _addFirDoc;
            vm.saveDraft = _saveDraft;

            //Product Composition Methods
            vm.addActiveSubstances = _addActiveSubstances;
            vm.editActiveSubstances = _editActiveSubstances;
            vm.removeActiveSubstance = _removeActiveSubstance;
            vm.addExceipientSubstances = _addExceipientSubstances;
            vm.editExceipientSubstances = _editExceipientSubstances;
            vm.removeExceipientSubstances = _removeExceipientSubstances;
            vm.addDiluentSubstances = _addDiluentSubstances;
            vm.editDiluentSubstances = _editDiluentSubstances;
            vm.removeDiluentSubstances = _removeDiluentSubstances;

            vm.addDeviceModelSize = _addDeviceModelSize;
            vm.editDeviceModelSize = _editDeviceModelSize;
            vm.removeDeviceModelSize = _removeDeviceModelSize;

            vm.addFoodComposition = _addFoodComposition;
            vm.editFoodComposition = _editFoodComposition;
            vm.removeFoodComposition = _removeFoodComposition;

            vm.addDeviceAccessory = _addDeviceAccessory;
            vm.editDeviceAccessory = _editDeviceAccessory;
            vm.removeDeviceAccessory = _removeDeviceAccessory;

            //Manufacturer
            vm.addManufacturerToList = _addManufacturerToList;
            vm.searchManufacturer = _searchManufacturer;
            vm.registerNewManufacturer = _registerNewManufacturer;
            vm.deleteManufacturerFromList = _deleteManufacturerFromList;

            // foreign application status methods
            vm.addForeignApplicationStatus = _addForeignApplicationStatus;
            vm.editForeignApplicationStatus = _editForeignApplicationStatus;
            vm.removeForeignApplicationStatus = _removeForeignApplicationStatus;

            vm.showAnswerButton = RegistrationFactory.showAnswerButton;

            init();

            function init() {
                vm.CONSTANT = RegistrationConst;
                vm.user = AccountService.userInfo();
                //MA id from state param
                vm.id = $stateParams.maId;
                vm.isUpdate = true;
                /*
                 * State definitions; Obtained from parent controller (MARenewal controller; see definitions there!)
                 * Format { previous:'...',  attachment:' ... ',  checklist: ' ... ' }
                 * */
                vm.states = $scope.renewalStates.update;

                //validation model
                vm.registrationRenewal = {
                    previousApplication: {},
                    attachment: [],
                    dossier: [],
                    checklist: []
                }; //Validation object

                vm.maregistrationValidation = {
                    productdetail: {},
                    productdetailContinued: {},
                    productInn: [],
                    productManu: []
                };

                vm.isWithdrawn = true;
                vm.firOrRta = false;

                vm.editMode = true;
                vm.marenewal = {};
                vm.maregistration = {}; // same as marenewal
                vm.productInns = {};
                vm.maStatusModel = {};


                //Set all validations to true; Assuming that all fields are properly filled for a submitted application.
                _.each(vm.registrationRenewal, function(value, key, list) {
                    list[key].$isValid = true;
                }); 
                //Load MA data
                RegistrationFactory.detail.get({ maId: vm.id },
                    function(response) {
                        var data = response.result;
                        vm.marenewal = data;
                        vm.maregistration = vm.marenewal;
                        vm.submoduleTypeCode = vm.marenewal.submoduleTypeCode;
                        vm.identifier = vm.maregistration.identifier;

                        _.each(vm.marenewal.checklists, function(checklist) {
                            RegistrationFactory.recursiveFunction(checklist);
                        });
                        vm.isLegacy = RegistrationFactory.allowEditLegacyData(data.ma);
                        //Check status of the application (whether it came to update from withdrawal or from assessors)
                        getMaFieldBasedOnStatus();
                        initAttachment(); 
                        initProductDetail();
                    });
            }

            function getMaFieldBasedOnStatus() {
                maStatusCode = vm.marenewal.ma.maStatus.maStatusCode;
                vm.isWithdrawn = !(maStatusCode === vm.CONSTANT.MA_STATUS.FIR || maStatusCode === vm.CONSTANT.MA_STATUS.RTA); //If status code is not "FIR" or "RTA", it is withdrawn.
                vm.firOrRta = !vm.isWithdrawn; 
                if (vm.isWithdrawn) {
                    vm.warning = '';
                    vm.currentMAFieldState = []; 
                } else {
                    vm.warning = 'has-warning'; //Warning class;
                    vm.currentMAFieldState = RegistrationFactory.maFieldById.query({
                        id: $stateParams.maId,
                        isVariationType: "null",
                        submoduleTypeCode: vm.submoduleTypeCode 
                    }) ;
                }
            }
 
            //-------------------------Navigation functions-------------------------
            function _previousApp() {
                vm.slickIndex = 0;
                $state.go(vm.states.previous);

            } 
            function _previousAppToAttachment() {
                if (vm.isLegacy) {
                    return;
                }
                vm.registrationRenewal.previousApplication.$showError = true;
                vm.registrationRenewal.previousApplication.$isValid = true;
                if (vm.registrationRenewal.previousApplication.$isValid) {
                    vm.slickIndex = 6;
                    $state.go(vm.states.attachment);
                } else {
                    return;
                }
            }
 

            function _backToProduct() {
                vm.slickIndex = 0;
                var prevState = RegistrationFactory.stateToGo(vm.states, vm.submoduleTypeCode, vm.states.product);
                $state.go(prevState);
            }
 
            function _productToContinued() {
                vm.maregistrationValidation.productdetail.$showError = true;
                if (vm.maregistrationValidation.productdetail.$isValid) {
                    var nextState = RegistrationFactory.stateToGo(vm.states, vm.submoduleTypeCode, vm.states.productdetailContinued);
                    $state.go(nextState);
                    initProductDetailContinued();
                    vm.slickIndex = 2;
                }
            }

            function _backToProductContinued() {
                var prevState = RegistrationFactory.stateToGo(vm.states, vm.submoduleTypeCode, vm.states.productdetailContinued);
                vm.slickIndex = 1;
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

            function _manufacturersToForeignApplications() {
                vm.maregistrationValidation.productManu.$showError = true;
                if (vm.maregistrationValidation.productManu.$isValid) {
                    var validManufacturer = RegistrationFactory.validateManufacturer(vm.maregistration.product.productManufacturers);
                    if (!validManufacturer) {
                        NotificationService.notify("Finished Product manufacturer is required!", "alert-danger");
                        return;
                    }
                    $state.go(vm.states.foreignStatus);
                    vm.slickIndex = 5;
                } else {
                    NotificationService.notify("Please add one or more Manufacturers", "alert-warning");
                }
            }

            function _foreignToAttachment() {
                if (vm.moduleDocuments == null || vm.moduleDocuments == undefined) vm.getDocuments();
                $state.go(vm.states.attachment);
                vm.slickIndex = 6;
            }

            function _attachmentToDossier() {
                vm.registrationRenewal.attachment.$showError = true;
                if (vm.registrationRenewal.attachment.$isValid) {
                    $state.go(vm.states.dossier);
                    vm.slickIndex = 7;
                }
            }

            function _dossierToChecklist() {
                vm.registrationRenewal.dossier.$showError = true;
                if (vm.registrationRenewal.dossier.$isValid === true) {
                    $state.go(vm.states.checklist);
                    vm.slickIndex = 8;
                }
            }

            //---------------------------------------------------------------------------

            //product detail
            //lookups
            function initProductDetail() {
                switch (vm.submoduleTypeCode) { 
                    case vm.CONSTANT.SUB_MODULE_TYPE.FOOD: 
                        break;  
                    case vm.CONSTANT.SUB_MODULE_TYPE.MEDICAL_DEVICE:
                            if (vm.deviceGroups == undefined) vm.deviceGroups = CommodityFactory.mDGrouping.query();
                                vm.deviceClasses = RegistrationFactory.getDeviceClasses(vm);
                        break; 
                    default: 
                        if (vm.productCategories === undefined) vm.productCategories = CommodityFactory.productCategory.query();
                        if (vm.ageGroupes === undefined) vm.ageGroupes = CommodityFactory.ageGroup.query();
                        var presentations = [];
                        _.each(vm.maregistration.product.presentations, function(present) {
                            if (vm.maregistration.product.presentation == null) { vm.maregistration.product.presentation = present.packaging; }
                            presentations.push(present.packSize);
                        });
                        vm.maregistration.product.presentations = presentations;
                    break;
                }
            }

            //product detail continued
            //lookups
            function initProductDetailContinued() {
                initProductComposition();
                if (vm.productTypes === undefined) vm.productTypes = CommodityFactory.productType.query();
                if (vm.useCategories === undefined) vm.useCategories = CommodityFactory.useCategory.query();
            }

            //initialize product composition
            function initProductComposition() {
                switch (vm.submoduleTypeCode) {
                    case vm.CONSTANT.SUB_MODULE_TYPE.FOOD:
                        vm.foodCompositions = vm.maregistration.product.foodCompositions;
                        break;
                    case RegistrationConst.SUB_MODULE_TYPE.MEDICAL_DEVICE:
                        vm.deviceModelSizes = _.isNull(vm.maregistration.product.mdModelSizes) ? [] : vm.maregistration.product.mdModelSizes;
                        vm.deviceAccessories = _.isNull(vm.maregistration.product.deviceAccessories) ? [] : vm.maregistration.product.deviceAccessories;
                        break;    
                    default:
                        vm.productExcipeints = $filter("filter")(vm.maregistration.product.productCompositions, { excipientID: "!!" });
                        vm.productInns = $filter("filter")(vm.maregistration.product.productCompositions, { innid: "!!" });
                        vm.productDiluents = $filter('filter')(vm.maregistration.product.productCompositions, {
                            excipientID: '!!',
                            isDiluent: true
                        });
                        break;
                }
            }

            //initialize manufacturer
            function initManufacturer() {
                RegistrationFactory.initManufacturer(vm, LookUpFactory);
            }

            //initialize Attachments
            function initAttachment() {
                RegistrationFactory.initAttachmentRenewal(vm, ModuleSettingsFactory, 'update');
            }

            //Product Composition Methods
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

            // Manufacturer List
            function _addManufacturerToList() {
                RegistrationFactory.addManufacturerToList(vm);
            }

            function _registerNewManufacturer() {
                RegistrationFactory.registerNewManufacturer();
            }

            function _searchManufacturer(keyWords, $event) {
                RegistrationFactory.searchManufacturer(vm, LookUpFactory, keyWords, $event);
            }
            /*
             * Remove manufacturer_and_type data from the list;
             * */
            function _deleteManufacturerFromList(data, idx) {
                RegistrationFactory.deleteManufacturerFromList(vm, data, idx);
            }

            // foreign application status methods
            function _addForeignApplicationStatus() {
                RegistrationFactory.addForeignApplicationStatus(vm);
            }

            function _editForeignApplicationStatus(data) {
                RegistrationFactory.editForeignApplicationStatus(vm, data);
            }

            function _removeForeignApplicationStatus(data) {
                RegistrationFactory.removeForeignApplicationStatus(vm, data);
            }

            //Document preview modal
            function _openFileModal(moduleDocument) {
                RegistrationFactory.openFileModal(moduleDocument);
            }

            //Prepare data for saving
            function prepareData() {
                //general
                saveModel = angular.copy(vm.marenewal);
                prepareProductInfoForSave();
                prepareDocuments();
                //checklist
                vm.checklists = _.flatten(_.map(saveModel.checklists, "children"));

                if (vm.isLegacy) {
                    saveModel.ma.maChecklists = RegistrationFactory.recursiveFlatten(saveModel.checklists, vm.user.id, 'new');
                } else {
                    saveModel.ma.maChecklists = RegistrationFactory.recursiveFlatten(saveModel.checklists, vm.user.id, 'update');
                }

            }

            function prepareProductInfoForSave() {
                //product
                saveModel.product.innID = saveModel.product.inn.id;
              
                saveModel.product.shelfLifeID = saveModel.product.shelfLifeObj.id;
                saveModel.product.productTypeID = saveModel.product.productType.id;
                // submoduleType specific attributes
                switch (vm.submoduleTypeCode) {
                    case vm.CONSTANT.SUB_MODULE_TYPE.FOOD:
                        saveModel.product.dosageFormID = saveModel.product.dosageFormObj.id;
                        //product composition
                        saveModel.product.foodCompositions = vm.foodCompositions;
                        // Use Category
                        saveModel.product.useCategoryID = saveModel.product.useCategory.id;
                        break;
                    case vm.CONSTANT.SUB_MODULE_TYPE.MEDICINE:
                        // Dosage Form
                        saveModel.product.dosageFormID = saveModel.product.dosageFormObj.id;
                        // Use Category
                        saveModel.product.useCategoryID = saveModel.product.useCategory.id;
                        //SRA - comma separated
                        var sra = null;
                        _.each(saveModel.ma.sralist, function(sr) {
                            if (sra === null) sra = sr.name;
                            else sra = sra + "," + sr.name;
                        });
                        saveModel.ma.sra = sra;
                        saveModel.product.productCategoryID = saveModel.product.productCategory.id;
                        saveModel.product.dosageStrengthID = saveModel.product.dosageStrengthObj.id;
                        saveModel.product.adminRouteID = saveModel.product.adminRoute.id;
                        saveModel.product.ageGroupID = saveModel.product.ageGroup.id;
                        saveModel.product.dosageUnitID = saveModel.product.dosageUnitObj.id;
                        saveModel.product.pharmacologicalClassificationID = saveModel.product.pharmacologicalClassification.id;
                        saveModel.product.pharmacopoeiaStandardID = saveModel.product.pharmacopoeiaStandard.id;
                        //product composition and atc
                        saveModel.product.productCompositions = _.union(vm.productInns, vm.productExcipeints, vm.productDiluents);

                        //presentation
                        var packSizes = [];
                        _.each(saveModel.product.presentations, function(present) {
                            var ps = {};
                            ps.packSizeID = angular.isDefined(present.packSizeID) ? present.packSizeID : present.id;
                            ps.packaging = saveModel.product.containerType;
                            ps.dosageUnitID = saveModel.product.dosageUnitID;
                            packSizes.push(ps);
                        });
                        saveModel.product.presentations = packSizes;
                        break;
                    case RegistrationConst.SUB_MODULE_TYPE.MEDICAL_DEVICE:
                                saveModel.product.productCategoryID = angular.isDefined(saveModel.product.productCategory) ? saveModel.product.productCategory.id : undefined;
                                saveModel.product.productMD.mdGroupingID = angular.isDefined(saveModel.product.productMD.mdGrouping) ? saveModel.product.productMD.mdGrouping.id : undefined;
                                saveModel.product.productMD.deviceClassID = angular.isDefined(saveModel.product.productMD.deviceClass) ? saveModel.product.productMD.deviceClass.id : undefined;
                                saveModel.product.productMD.familyName = saveModel.product.productMD.mdGrouping.mdGroupingCode === 'FAML' ? saveModel.product.productMD.familyName : null;
                                saveModel.product.mdModelSizes = vm.deviceModelSizes;
                                saveModel.product.deviceAccessories = vm.deviceAccessories;

                                saveModel.product.productTypeID = saveModel.product.productType.id;
                                break; 
                    default:
                        break;
                }
            }

            function prepareDocuments() {
                //attachment
                var documents = [];
                _.each(vm.moduleDocuments, function(md) {
                    if (md.attachmentInfo.document) {
                        md.attachmentInfo.document.moduleDocument = null;
                        documents.push(md.attachmentInfo.document);
                    }
                });

                _.each(vm.firDoc, function(md) {
                    if (md.attachmentInfo.document) {
                        md.attachmentInfo.document.moduleDocument = null;
                        documents.push(md.attachmentInfo.document);
                    }
                });

                saveModel.documents = documents;
                //dossier Documents
                saveModel.dossiers = RegistrationFactory.prepareDossier(vm.dossierDocuments);
            }

            function _SubmitNewApplication() {
                vm.registrationRenewal.checklist.$showError = true;
                if (vm.registrationRenewal.$isValid) {
                    submitWithNoStatusChange();
                } else {
                    return;
                }
            }

            function _SubmitReturnedApplication() {
                vm.registrationRenewal.checklist.$showError = true;
                vm.firDoc = [];
                getFirDoc();
                if (vm.registrationRenewal.$isValid) {
                    $ngConfirm({
                        title: "Reply",
                        contentUrl: 'app/registration/templates/changeMAStatus.html',
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
                                    prepareData();
                                    saveModel.comment = vm.maStatusModel.Comment;
                                    RegistrationFactory.renewal.update(saveModel, function(response) {
                                        RegistrationFactory.submitMAResponse(response, {
                                            stateName: 'maregistration.list.info',
                                            params: { maId: $stateParams.maId }
                                        });
                                    }, function() {
                                        NotificationService.notify('Unable to save data. Please try again!', 'alert-danger');
                                    });
                                    //} else return false;
                                }
                            }
                        }
                    });
                } else {
                    return;
                }
            }

            function _isInputDisabled(fieldCode) {
                // if from withdrawn, no input is disabled
                // if its legacy data, manufacturer tab should be enabled
                if ((vm.isWithdrawn === true && (fieldCode == 'Checklists' || fieldCode == 'Documents' || fieldCode == 'sra' || fieldCode == 'Dossier')) || (vm.isLegacy && fieldCode == 'Manufacturers' )) {
                    return false;
                }
                return RegistrationFactory.isInputDisabled(vm, fieldCode);
            }

            function _hasError(name) {
                // if from withdrawn, no input hasError
                if (vm.isWithdrawn) {
                    return false;
                }
                return RegistrationFactory.hasError(vm, name);
            }

            function _onChange(fieldCode) {
                //If from withdrawn, do nothing.
                if (vm.isWithdrawn) {
                    return;
                }
                RegistrationFactory.onChange(vm, fieldCode);
            }

            function _gotoOriginalMA(maID) {
                var currentMAID = -1; //This means just, its from application!
                $state.go('maregistration.list.info', { maId: maID, currentMAID: currentMAID });
            }

            function getFirDoc() {
                RegistrationFactory.getFirDoc(vm, ModuleSettingsFactory, maStatusCode, 'renewal');
            }

            function _addFirDoc() {
                vm.firGeneratedCount = vm.marenewal.firGeneratedCount;
                RegistrationFactory.addFirDoc(vm);
            }

            function _saveDraft() {
                if (vm.firOrRta) {
                    //For fir or rta status, no draft is supported because api will make status change for such cases.
                    NotificationService.notify('Cannot save draft for FIR or RTA applications', 'alert-warning');
                    return;
                }
                submitWithNoStatusChange(true);
            }

            function submitWithNoStatusChange(draft) {
                prepareData();
                if (draft) {
                    RegistrationFactory.renewal.update(vm.marenewal, function(response) {
                        RegistrationFactory.submitMAResponse(response, {}, draft);
                    }, function() {
                        NotificationService.notify('Unable to save data. Please try again!', 'alert-danger');
                    });
                } else {
                    if (vm.isLegacy) {
                        saveModel.ma.isLegacyUpdated = true;
                    }
                    RegistrationFactory.renewal.update(saveModel, function(response) {
                        RegistrationFactory.submitMAResponse(response, {
                            stateName: 'maregistration.list.info',
                            params: { maId: $stateParams.maId }
                        });
                    }, function() {
                        NotificationService.notify('Unable to save data. Please try again!', 'alert-danger');
                    });
                }
            }

        });

})(window.angular);