'use strict';

angular.module('pdx.controllers')
  .controller('SupplierDetailController', function ($state, $stateParams, SupplierFactory, $uibModal,
                                                    AppConst, $sce, $http, ModuleSettingsFactory, RegistrationFactory,
                                                    $ngConfirm, $scope, AgentFactory, $filter, CommonService, AccountService) {
    var vm = this;

    vm.supplierID = $stateParams.id;

    vm.supplierHistory = [];
    vm.agentUnderSupplierHistory = [];
    vm.showSupplierHistory = false;
    vm.showAgentUnderSupplierHistory = false;
    var supplierHistoryLoaded = false;

    ModuleSettingsFactory.moduleDocumentByDocumentTypeCode.get({
      submoduleCode: 'AGEN',
      documentTypeCode: 'AGEN'
    }, function (data) {
      var md = data;
      md.required = md.isRequired ? 'Yes' : 'No';
      md.attachmentInfo = {
        moduleDocumentID: md.id,
        createdBy: AccountService.userInfo().id,
        updatedBy: AccountService.userInfo().id,
        filePath: 'filePath',
        tempFileName: md.documentType != null ? md.documentType.name : ""
      };
      vm.agencyAgreement = md;
    });


    //Supplier status model
    vm.supplierStatus = {
      true: {action: "Suspend", actionCode: false},
      false: {action: "Activate", actionCode: true}
    };

    //A call back when tab changes in tabbed view
    vm.tabChanged = function (tabIndex) {
      switch (tabIndex) {
        case 0:
          loadSupplierData();
          break;
        case 1:
          loadSupplierAgentData();
          break;
        case 2:
          loadSupplierProductData();
          break;
        default:
          loadSupplierData();
      }
    };

    //Creates a ui and its logic to update supplier
    vm.updateSupplier = function () {
      //Open modal
      $uibModal.open({
        backdrop: "static",
        templateUrl: "app/supplier/template/supplier.modal.template.html",
        size: 'lg',
        windowClass: 'supplierModalClass',
        resolve: {
          supplier: angular.copy(vm.supplier)
        },
        controller: "SupplierUpdateController",
        controllerAs: 'vm'
      }).result.then(function (received) {
        //Modal successfully close .. Reload data!
        loadSupplierData();
      });
    };

    //Creates a ui and its logic to suspend supplier
    vm.suspend = function () {
      vm.suspendSupplierValidation = {};
      vm.suspendReason = undefined;

      $ngConfirm({
        title: 'This will ' + vm.supplierStatus[vm.supplier.isActive].action.toLowerCase() + ' supplier',
        contentUrl: 'app/supplier/template/supplier.suspendSupplier.template.html',
        type: vm.supplierStatus[vm.supplier.isActive].actionCode ? 'green' : 'red',
        closeIcon: true,
        typeAnimated: true,
        scope: $scope,
        buttons: {
          update: {
            text: vm.supplierStatus[vm.supplier.isActive].action,
            btnClass: 'btn-primary',
            action: function () {
              vm.suspendSupplierValidation.$showError = true;
              if (vm.suspendSupplierValidation.$isValid) {
                var supplier = angular.copy(vm.supplier);
                supplier.isActive = vm.supplierStatus[vm.supplier.isActive].actionCode;
                supplier.remark = vm.suspendReason;
                supplier.userID = AccountService.userInfo().id;
                supplier.address.modifiedDate = undefined;
                supplier.address.rowGuid = undefined;
                supplier.address.createdDate = undefined;
                supplier.address.country = undefined;
                SupplierFactory.supplier.update({id: ''}, supplier, function () {
                  loadSupplierData();
                  loadSupplierHistory();
                  return true;
                });
              } else {
                return false;
              }
            }
          }
        }
      });
    };


    //Create a UI and logic to link Supplier and Agent

    vm.LinkSupplierAndAgent = function () {
      vm.datePickerOptionsStartDate = {
        minDate: undefined
      };
      vm.datePickerOptionsEndDate = {
        minDate: undefined
      };


      vm.linkSupplierAndAgentValidation = {}
      vm.linkSupplierAndAgentDateRangeValidation = true; //  Initially, assume that start date is less than end date
      vm.selectedSupplierAgent = {startDate: {date: undefined}, endDate: {date: undefined}, agent: {}, agentType: {}};
      AgentFactory.agent.query(function (agents) {
        var approvedAgents = $filter('filter')(agents, {isApproved: true, isActive:true});
        vm.agentList = $filter('orderBy')(approvedAgents, 'name');

      });

      AgentFactory.agentLevel.query(function (agentTypes) {
        vm.agentTypeList = $filter('orderBy')(agentTypes, 'name');
        var firstAgentExists = checkForFirstAgent(vm.supplierAgent);
        if (firstAgentExists) {
          vm.agentTypeList.splice(0, 1); //First Agent already Exists ... Therefore, Remove FirstAgent Option from list;
        }
      });

      $ngConfirm({
        title: 'Add Applicants to License Holder',
        contentUrl: 'app/supplier/template/supplier.LinkSupplierAndAgent.template.html',
        // type: 'red',
        closeIcon: true,
        columnClass: 'col-md-5 col-md-offset-4',
        typeAnimated: true,
        scope: $scope,
        buttons: {
          update: {
            text: 'Link',
            btnClass: 'btn-primary',
            action: function () {
              vm.linkSupplierAndAgentValidation.$showError = true;
              if (vm.linkSupplierAndAgentValidation.$isValid && $scope.linkSupplierAndAgentForm.endDate.$valid) {
                //Check if start date is less than end date! If not display error message
                if (vm.selectedSupplierAgent.startDate.date < vm.selectedSupplierAgent.endDate.date) {
                  var supplierAgent = {
                    supplierID: vm.supplierID,
                    agentID: vm.selectedSupplierAgent.agent.id,
                    agentLevelID: vm.selectedSupplierAgent.agentType.id,
                    startDate: vm.selectedSupplierAgent.startDate.date,
                    endDate: vm.selectedSupplierAgent.endDate.date,
                    isActive: true
                  }
                  AgentFactory.createOrUpdateSupplierAgent.save(supplierAgent, function () {
                    loadSupplierAgentData();
                    return true; // Close the modal
                  });
                } else {
                  //Start date is not less than end date.
                  // so return to modal and display error!
                  vm.linkSupplierAndAgentDateRangeValidation = false;
                  return false;
                }
              } else {
                //Don't close the modal
                return false;
              }
            }
          }
        }
      });
    };


    //Group function by First Letter of name of the agent
    vm.firstLetterGroupFn = function (item) {
      return item.name[0].toUpperCase();
    };


    vm.showSupplierHistoryTimeLine = function () {
      vm.showSupplierHistory = !vm.showSupplierHistory;
      //Load history if only we are showing history and history data is not already available. Else skip data loading.
      if (vm.showSupplierHistory && !supplierHistoryLoaded) {
        loadSupplierHistory();
      }

    }

    vm.showAgentUnderSupplierHistoryTimeLine = function (data) {
      vm.showAgentUnderSupplierHistory = true;
      //Load history if only we are showing history and history data is not already available. Else skip data loading.
      if (vm.showAgentUnderSupplierHistory) {
        loadAgentUnderSupplierHistory(data.id);
      }
    }


    //Data for supplier detail tab
    function loadSupplierData() {
      SupplierFactory.supplier.get({id: vm.supplierID}, function (data) {
        vm.supplier = data;
        vm.morePhones = []; //Holds additional phone numbers. (2-extra)
        if (CommonService.checkUndefinedOrNull(vm.supplier.phone2)) {
          vm.morePhones.push({phoneNumber: vm.supplier.phone2})
        }
        if (CommonService.checkUndefinedOrNull(vm.supplier.phone3)) {
          vm.morePhones.push({phoneNumber: vm.supplier.phone3})
        }
      });
    }

    //Data for SupplierAgentList
    function loadSupplierAgentData() {
      //Load those agents registered this supplier
      //and filter out those which are only active
      SupplierFactory.agentUnderSupplier.query({supplierID: vm.supplierID}, function (allSupplierAgents) {
        vm.allAgentsUnderSupplier = allSupplierAgents;
        // var actvieSupplierAgents= $filter('filter')(allSupplierAgents,{isActive:true});
        vm.supplierAgent = $filter('orderBy')(vm.allAgentsUnderSupplier, "agentLevelID");
        _.each(vm.supplierAgent,function(sA){

              sA.agencyAgreement = angular.copy(vm.agencyAgreement);
              sA.agencyAgreement.attachmentInfo.document = sA.agencyAgreementDoc;
              sA.agencyAgreement.attachmentInfo.referenceID = sA.id;
              sA.agencyAgreement.attachmentInfo.tempFolderName = sA.rowGuid;

        });
      });

    }

    function loadSupplierProductData() {
      SupplierFactory.supplierProduct.query({supplierID: vm.supplierID}, function (data) {
        vm.supplierProduct = $filter('orderBy')(data, 'isExpired');
      });
    }

    // Data for Supplier History (activate/suspend)
    function loadSupplierHistory() {
      SupplierFactory.supplierHistory.query({supplierID: vm.supplierID}, function (historyData) {
        vm.supplierHistory = $filter('orderBy')(historyData, 'createdDate');
        supplierHistoryLoaded = true;
      })
    }

    // Data for AgentsUnderSupplier History (activate/suspend)
    function loadAgentUnderSupplierHistory(id) {
      AgentFactory.agentUnderSupplierHistory.query({agentSupplierID: id}, function (historyData) {
        vm.agentUnderSupplierHistory = $filter('orderBy')(historyData, 'createdDate');
      })
    }


    function checkForFirstAgent(supplierAgents) {
      //Check if first agent already exists for this supplier
      //Returns boolean, true if firstAgent Exists
      var firstAgent = _.filter(supplierAgents, function (value) {
        return value.agentLevelID === 1 && value.isActive; // This is the ID for First Agent ( id===1);
      })
      return firstAgent.length > 0;
    }

    //By default tab 0 is opened!
    vm.activeTab = 0;
    vm.unlinkAgentSupplier = {};
    vm.remark = "";

    vm.unlinkAgentFromSupplier = function (data) {
      $ngConfirm({
        title: 'Unlink Applicant!',
        contentUrl: 'app/supplier/template/supplier.unlinkAgentsAndSupplier.template.html',
        // type: 'red',
        closeIcon: true,
        typeAnimated: true,
        scope: $scope,
        buttons: {
          unlink: {
            text: "Unlink",
            btnClass: 'btn-primary',
            action: function () {
              vm.unlinkAgentSupplier.$showError = true;
              if (vm.unlinkAgentSupplier.$isValid) {
                var supplierAgent = {
                  supplierID: vm.supplierID,
                  agentID: data.agent.id,
                  agentLevelID: data.agentLevelID,
                  startDate: data.startDate,
                  endDate: data.endDate,
                  isActive: false,
                  id: data.id,
                  remark: vm.remark
                }
                AgentFactory.createOrUpdateSupplierAgent.save(supplierAgent, function () {
                  loadSupplierAgentData();
                  loadAgentUnderSupplierHistory(data.id);
                  return true
                });
              } else {
                return false;
              }

            }
          }
        }
      })
    }

    vm.openFileModal = function(document) {
      $http.post(CommonService.buildUrlObj(AppConst.API_URL.Attachment.AttachmentSingle, {
        id: document.id,
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
    };

    vm.downloadAttachment = function(idocument) {
      if(!idocument.moduleDocument){
        idocument.moduleDocument = vm.agencyAgreement;
      }
      var a = document.createElement('a')
      document.body.appendChild(a)
      $http.post(CommonService.buildUrlObj(AppConst.API_URL.Attachment.AttachmentSingle, {
        id: idocument.id,
      }), {}, {
        responseType: 'arraybuffer'
      })
        .success(function(response) {
          var file = new Blob([response], {
            type: idocument.fileType
          });
          vm.fileURL = URL.createObjectURL(file);
          vm.fileContent = $sce.trustAsResourceUrl(vm.fileURL);
          a.href = vm.fileContent;
          a.download = idocument.moduleDocument.documentType.name;
          a.click();
        })
    }

  });
