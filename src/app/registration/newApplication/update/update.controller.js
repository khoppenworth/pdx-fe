(function (angular) {
  'use strict';

  angular.module('pdx.controllers')
    .controller('MAUpdateController', function ($scope, LookUpFactory, ChecklistFactory, RegistrationFactory, CommodityFactory,
      ModuleSettingsFactory, AppConst, AccountService, SupplierFactory, NotificationService, $state, MAFactory, AgentFactory,
      $stateParams, $filter, $ngConfirm, maRegistration, $rootScope, RegistrationConst) {

      var vm = this;
      var submitModel;
      var isWithdrawn;
      var maStatusCode;

      vm.onAgentSelected = _onAgentSelected;
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
      vm.getDocuments = _getDocuments;
      vm.openFileModal = _openFileModal;

      //navigation methods
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
      vm.SubmitNewApplication = _SubmitNewApplication;
      vm.SubmitReturnedApplication = _SubmitReturnedApplication;
      vm.isInputDisabled = _isInputDisabled;
      vm.addFirDoc = _addFirDoc;
      vm.hasError = _hasError;
      vm.onChange = _onChange;
      vm.isInputVisible = _isInputVisible;
      vm.saveDraft = _saveDraft;
      vm.showAnswerButton = RegistrationFactory.showAnswerButton;

      init();

      function init() {
        /*
         * State definitions; Obtained from parent controller (MANewApplicationController controller; see definitions there!)
         * */
        vm.states = $scope.newApplicationStates.update;
        vm.CONSTANT = RegistrationConst;

        vm.isUpdateMode = true;
        vm.currentMAFieldState = {};

        vm.user = AccountService.userInfo();

        // slick setting
        vm.slickConfig = {
          enabled: true,
          method: {}
        };
        vm.slickIndex = 0;


        // validation model
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
          checklist: []
        };


        // general Info
        // lookups for general info
        vm.agents = [];
        vm.agent = {};

        // calculate fee
        vm.showCalculateFeeResult = false;

        vm.deviceModelSizes = [];

        // composition
        vm.productInn = {};
        vm.foodCompositions = [];
        vm.deviceAccessories = []; // use for medical Device accessories and spare parts

        // product ATC
        vm.productAtc = {};
        vm.productAtcValidation = {};
        vm.dynamicPopover = {
          templateUrl: 'myPopoverTemplate.html'
        };

        // /Manufacturer
        // lookups
        vm.pageNo = 0;
        vm.pageSize = 50;
        vm.manufacturer_and_type = [];
        vm.manufacturerValidation = {};

        vm.updateStatusLogValidation = {};
        vm.maStatusModel = {};


        /*
         * -------------- Load MA details ----------------------------------------------------
         * */

        //Obtain maRegistration from route resolve
        vm.maregistration = maRegistration;
        vm.identifier = vm.maregistration.identifier;
        vm.isLegacy = RegistrationFactory.allowEditLegacyData(maRegistration.ma);
        $rootScope.isLegacy = vm.isLegacy;

        vm.applicationList = RegistrationFactory.subModuleTypeByUserPrivilage.query();
        vm.maregistration.application = maRegistration.ma.maType.submoduleType;
        vm.submoduleTypeCode = maRegistration.ma.maType.submoduleType.submoduleTypeCode;
        vm.productTypes = RegistrationFactory.getProductTypes(vm);
        vm.deviceClasses = RegistrationFactory.getDeviceClasses(vm);

        loadProductLookups();

        getMaFieldBasedOnStatus();

        getProductInfo();

        _.each(vm.maregistration.checklists, function (checklist) {
          RegistrationFactory.recursiveFunction(checklist);
        });

        if (angular.isDefined(vm.maregistration.ma.sra) && vm.maregistration.ma.sra !== null) {
          vm.maregistration.ma.sralist = [];
          var array = vm.maregistration.ma.sra.split(',');
          angular.forEach(array, function (sra) {
              this.push({
                name: sra
              });
            },
            vm.maregistration.ma.sralist);
        }

        /*
         * --------------end of ma detail -------------------
         * */


        disableValidations();

        initForGeneralInfo();

      }


      function getMaFieldBasedOnStatus() {
        //Check status of the application (whether it came to update from withdrawal or from assessors)
        maStatusCode = vm.maregistration.ma.maStatus.maStatusCode;

        isWithdrawn = !(maStatusCode === vm.CONSTANT.MA_STATUS.FIR || maStatusCode === vm.CONSTANT.MA_STATUS.RTA || vm.isLegacy); //If status code is not "FIR" or "RTA", it
        vm.firOrRta = !isWithdrawn;

        if (isWithdrawn) {
          vm.warning = '';
          vm.currentMAFieldState = [];
        } else {
          vm.warning = 'has-warning'; //Warning class;
          vm.currentMAFieldState = RegistrationFactory.maFieldById.query({
            id: $stateParams.maId,
            isVariationType: "null",
            submoduleTypeCode: vm.submoduleTypeCode
          });
          vm.isLegacy = RegistrationFactory.legacyFIRorRTA(maRegistration.ma);
          $rootScope.isLegacy = vm.isLegacy;
        }
      }

      function getProductInfo() {
        switch (vm.submoduleTypeCode) {
          case RegistrationConst.SUB_MODULE_TYPE.MEDICINE:
            //Populate data
            vm.productExcipeints = $filter('filter')(vm.maregistration.product.productCompositions, {
              excipientID: '!!',
              isDiluent: false
            });
            vm.productInns = $filter('filter')(vm.maregistration.product.productCompositions, {
              innid: '!!'
            });
            vm.productDiluents = $filter('filter')(vm.maregistration.product.productCompositions, {
              excipientID: '!!',
              isDiluent: true
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

        var presentations = [];

        _.each(vm.maregistration.product.presentations, function (present) {
          //vm.maregistration.product.presentation = present.packaging;
          present.packSize.presentId = present.id;
          presentations.push(present.packSize);
        });
        vm.maregistration.product.presentations = presentations;
      }

      function _onAgentSelected() {
        if (vm.agent.selected !== undefined) {
          SupplierFactory.agentSupplier.query({
            agentID: vm.agent.selected.id,
            agentLevelCode: "FAG"
          }, function (data) {
            vm.suppliers = data;
          });
        }
      }

      function _getAgents() {
        if (vm.user.isAgent) {
          AgentFactory.userAgent.query({
            userID: vm.user.id
          }, function (data) {
            vm.agents = data;
            vm.agent.selected = vm.agents[0]
            vm.onAgentSelected();
          })
        } else {
          vm.agent.selected = undefined;
          vm.onAgentSelected();
        }
      }

      function _calculateFee() {
        if (vm.maregistration.ma.maType === null) {
          NotificationService.notify('Select Application Type', 'alert-warning')
          return;
        } else {
          vm.submoduleFeeType = MAFactory.submoduleFee.query({
            submoduleCode: vm.maregistration.ma.maType.maTypeCode
          })
          initChecklist();
          vm.showCalculateFeeResult = true;
        }
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

      function _addForeignApplicationStatus() {
        RegistrationFactory.addForeignApplicationStatus(vm);
      }

      function _editForeignApplicationStatus(data) {
        RegistrationFactory.editForeignApplicationStatus(vm, data);
      }

      function _removeForeignApplicationStatus(data) {
        RegistrationFactory.removeForeignApplicationStatus(vm, data);
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
        RegistrationFactory.initAttachment(vm, ModuleSettingsFactory, 'update');
      }

      function _openFileModal(moduleDocument) {
        RegistrationFactory.openFileModal(moduleDocument);
      }

      function _generalToProduct() {
        vm.maregistrationValidation.generalInfo.$showError = true;
        if (vm.maregistrationValidation.generalInfo.$isValid) {

          initProductDetail();
          vm.value = 10;
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
          vm.value = 20;
          var nextState = RegistrationFactory.stateToGo(vm.states, vm.submoduleTypeCode, vm.states.productdetailContinued);
          $state.go(nextState);
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
          vm.slickIndex = 5;
        } else {
          NotificationService.notify('Please add one or more Manufacturers', 'alert-warning')
          return;
        }
      }

      function _foreignToAttachment() {
        if (vm.moduleDocuments == null || vm.moduleDocuments == undefined) vm.getDocuments()
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

      function _SubmitNewApplication() {
        vm.maregistrationValidation.checklist.$showError = true;
        if (vm.maregistrationValidation.$isValid) {
          submitWithNoStatusChange();
        } else return
      }

      function _SubmitReturnedApplication() {
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
            columnClass: 'col-md-6 col-md-offset-3',
            buttons: {
              update: {
                text: "Submit",
                btnClass: "btn-primary",
                action: function () {
                  // if (vm.updateStatusLogValidation.$isValid) {
                  prepareRegistration();
                  submitModel.comment = vm.maStatusModel.Comment;
                  MAFactory.maNewApplication.update(submitModel, function (response) {
                    RegistrationFactory.submitMAResponse(response, {
                      stateName: 'maregistration.list.info',
                      params: {
                        maId: $stateParams.maId
                      }
                    });
                  }, function () {
                    NotificationService.notify('Unable to save data. Please try again!', 'alert-danger')
                  })
                  //} else return false;
                }
              }
            }
          })
        } else return
      }

      function _isInputDisabled(fieldCode) {
        // if from withdrawn, no input is disabled, except sra
        // if its legacy data, manufacturer tab should be enabled
        if (fieldCode == 'isSRA') {
          return true;
        }
        if (isWithdrawn ||
          (vm.isLegacy && fieldCode == 'Manufacturers')
        ) {
          return false;
        }
        return RegistrationFactory.isInputDisabled(vm, fieldCode);
      }

      function _addFirDoc() {
        vm.firGeneratedCount = vm.maregistration.firGeneratedCount;
        RegistrationFactory.addFirDoc(vm);
      }

      function _hasError(name) {
        // if from withdrawn, no input hasError
        if (isWithdrawn) {
          return false;
        }
        return RegistrationFactory.hasError(vm, name);
      }

      function _onChange(fieldCode) {
        if (fieldCode === 'MAType') {
          vm.productTypes = RegistrationFactory.getProductTypes(vm);
          vm.deviceClasses = RegistrationFactory.getDeviceClasses(vm, true);
        } else if (fieldCode === 'Application') {
          vm.submoduleTypeCode = vm.maregistration.application.submoduleTypeCode;

          vm.maregistration.ma.maType = undefined; //Reset Application Type UI Select
          initForGeneralInfo();
          loadProductLookups();
        }
      }

      function _isInputVisible(fieldCode) {
        return RegistrationFactory.isInputVisible(vm, fieldCode);
      }

      function _saveDraft() {
        if (vm.firOrRta) {
          //For fir or rta status, no draft is supported because api will make status change for such cases.
          NotificationService.notify('Cannot save draft for FIR or RTA applications', 'alert-warning');
          return;
        }
        submitWithNoStatusChange(true);
      }

      function disableValidations() {
        //Set all validations to true; Assuming that all fields are properly filled for a submitted application;
        _.each(vm.maregistrationValidation, function (value, key, list) {
          list[key].$isValid = true;
        });
      }

      function initForGeneralInfo() {

        vm.applicationTypes = LookUpFactory.moduleMaType.query({
          moduleCode: AppConst.Modules.NewApplication,
          submoduleTypeCode: vm.submoduleTypeCode
        });

        if (vm.suppliers === undefined) {
          _getAgents();
        }
        if (vm.sras === undefined) {
          vm.sras = CommodityFactory.sra.query();
        }
      }

      function initProductDetail() {
        if (vm.productCategories == undefined) vm.productCategories = CommodityFactory.productCategoryBySubmoduleTypeCode.query({
          submoduleTypeCode: vm.submoduleTypeCode
        });
        if (vm.ageGroupes == undefined) vm.ageGroupes = CommodityFactory.ageGroup.query();

        if (vm.submoduleTypeCode === RegistrationConst.SUB_MODULE_TYPE.MEDICAL_DEVICE) {
          if (vm.deviceGroups == undefined) vm.deviceGroups = CommodityFactory.mDGrouping.query();
        }
      }

      //loads product lookups based on selected application(i.e submoduleTypeCode)
      function loadProductLookups() {
        vm.useCategories = CommodityFactory.useCategory.query({
          submoduleTypeCode: vm.submoduleTypeCode
        });
        if (vm.accessoryTypes == undefined) vm.accessoryTypes = CommodityFactory.accessoryType.query();
      }

      function initChecklist() {
        vm.submoduleCheckList = ChecklistFactory.ChecklistBySubmodule.query({
          submoduleCode: vm.maregistration.ma.maType.maTypeCode,
          checklistTypeCode: 'PSCR',
          isSra: vm.maregistration.ma.isSRA
        });
      }

      function initManufacturer() {
        RegistrationFactory.initManufacturer(vm, LookUpFactory);
      }

      function getFirDoc() {
        RegistrationFactory.getFirDoc(vm, ModuleSettingsFactory, maStatusCode);
      }

      // prepare data for saving
      function prepareRegistration() {
        submitModel = RegistrationFactory.prepareRegistration(vm.maregistration, vm, 'update');

        var documents = angular.copy(submitModel.documents);
        //Add FIR documents
        _.each(vm.firDoc, function (md) {
          if (md.attachmentInfo.document) {
            md.attachmentInfo.document.moduleDocument = null;
            documents.push(md.attachmentInfo.document);
          }
        });
        submitModel.documents = documents;

        // checklist
        if (vm.isLegacy) {
          submitModel.ma.maChecklists = RegistrationFactory.recursiveFlatten(submitModel.checklists, vm.user.id, 'new');
        } else {
          submitModel.ma.maChecklists = RegistrationFactory.recursiveFlatten(submitModel.checklists, vm.user.id, 'update');
        }
      }

      function submitWithNoStatusChange(draft) {
        prepareRegistration();
        if (draft) {
          MAFactory.maNewApplication.update(submitModel, function (response) {
            RegistrationFactory.submitMAResponse(response, {}, draft);
          }, function () {
            NotificationService.notify('Unable to update data. Please try again!', 'alert-danger')
          });
        } else {
          if (vm.isLegacy) {
            submitModel.ma.isLegacyUpdated = true;
          }
          MAFactory.maNewApplication.update(submitModel, function (response) {
            RegistrationFactory.submitMAResponse(response, {
              stateName: 'maregistration.list.info',
              params: {
                maId: $stateParams.maId
              }
            });
          }, function () {
            NotificationService.notify('Unable to update data. Please try again!', 'alert-danger')
          });
        }
      }

    });
})(window.angular);
