'use strict';

angular.module('pdx.controllers')
  .controller('AgentDetailController', function ($state, $filter, $stateParams, AgentFactory, $uibModal, $ngConfirm, $scope, AdminUserMgmtFactory, CommonService) {
    var vm = this;

    vm.agentID = $stateParams.id;

    //Agent status model
    vm.agentStatus = {
      true: {action: "Suspend", actionCode: false},
      false: {action: "Activate", actionCode: true}
    };

    //A call back when tab changes in tabbed view
    vm.tabChanged = function (tabIndex) {
      switch (tabIndex) {
        case 0:
          loadAgentData();
          break;
        case 1:
          loadAgentUserData();
          break;
        case 2:
          loadAgentSupplierData();
          break;
        default:
          loadAgentData();
      }
    };

    //Creates a ui and its logic to update supplier
    vm.updateAgent = function () {
      //Open modal
      $uibModal.open({
        backdrop: "static",
        templateUrl: "app/agent/template/agent.modal.template.html",
        size: 'lg',
        windowClass: 'supplierModalClass',
        resolve: {
          agent: angular.copy(vm.agent)
        },
        controller: "AgentUpdateController",
        controllerAs: 'vm'
      }).result.then(function (received) {
        //Modal successfully close .. Reload data!
        loadAgentData();
      });
    };

    //Creates a ui and its logic to suspend supplier
    vm.suspend = function () {
      $ngConfirm({
        title: 'This will ' + vm.agentStatus[vm.agent.isActive].action.toLowerCase() + ' agent',
        // contentUrl: 'app/admin/usermgmt/template/updatepassword.html',
        // type: 'red',
        closeIcon: true,
        typeAnimated: true,
        scope: $scope,
        buttons: {
          update: {
            text: vm.agentStatus[vm.agent.isActive].action,
            btnClass: 'btn-primary',
            action: function () {
              var agent = angular.copy(vm.agent);
              agent.isActive = vm.agentStatus[vm.agent.isActive].actionCode;
              AgentFactory.agent.update({id: ''}, agent, function () {
                loadAgentData();
                return true;
              });
            }
          }
        }
      });
    };


    vm.LinkAgentAndUser = function () {
      //Link Agent and User section
      vm.linkAgentAndUserValidation = {};
      vm.selectedAgentUser = undefined;
      AgentFactory.userForAgent.query(function (users) {
        vm.userList = $filter('orderBy')(users, 'firstName');
        if (vm.userList.length <= 0) {
          jc.buttons.Link.setDisabled(true);
        }
      });

      var jc = $ngConfirm({
        title: 'Add Users to Applicant',
        contentUrl: 'app/agent/template/agent.LinkAgentAndUser.template.html',
        // type: 'red',
        closeIcon: true,
        columnClass: 'col-md-5 col-md-offset-4',
        typeAnimated: true,
        scope: $scope,
        buttons: {
          Link: {
            text: 'Link',
            btnClass: 'btn-primary',
            action: function () {
              vm.linkAgentAndUserValidation.$showError = true;
              if (vm.linkAgentAndUserValidation.$isValid) {
                var agentUser = {
                  userID: vm.selectedAgentUser.id,
                  agentID: vm.agentID

                };
                AgentFactory.createAgentUser.save(agentUser, function () {
                  //If user is successfully linked, remove it from userList
                  var index = vm.userList.indexOf(vm.selectedAgentUser);
                  vm.userList.splice(index, 1)
                  loadAgentUserData();
                });
              } else {
                return false; //Do not close modal
              }

            }
          }
        }
      });
    };

    //Group function by First Letter of first name
    vm.firstLetterGroupFn = function (item) {
      return item.firstName.length > 0 ? item.firstName[0].toUpperCase() : item.firstName;
    };

    //Data for agent detail tab
    function loadAgentData() {
      AgentFactory.agent.get({id: vm.agentID}, function (agent) {
        vm.agent = agent;
        vm.morePhones = []; //Holds additional phone numbers. (2-extra)
        if (CommonService.checkUndefinedOrNull(vm.agent.phone2)) {
          vm.morePhones.push({phoneNumber: vm.agent.phone2})
        }
        if (CommonService.checkUndefinedOrNull(vm.agent.phone3)) {
          vm.morePhones.push({phoneNumber: vm.agent.phone3})
        }
      });
    }

    //Data for Agent Users List
    function loadAgentUserData() {
      AgentFactory.agentUsers.query({agentID: vm.agentID}, function(data){
        //TODO:: This is probably easier done on  BE.
        //Due to jsonModel returned from API, need to reconstruct the object model.
        // api response -> List of users with their userAgent's list. like =>   [{user, userRoles, agent, userAgents];
        // What is needed -> List of agentUsers with the detail of agent and user. like => [{userAgent, user, agent];
        // So the below method converts the api response to what is required.
        var users = _.uniq(data, function(d){
          return d.id;
        });
        vm.agentUsers = [];
        _.each(users , function(u){
          var userAgents = angular.copy(u.userAgents); //Copy userAgents
          u.userAgents = null; //Set user.userAgents to null;
          _.each(userAgents,function(uA){
             uA.user = u; //Set user to userAgent
             vm.agentUsers.push(uA); //Finally push it to agentUser models.
          });
        });
      });
    }

    //Data for Agent Suplier List
    function loadAgentSupplierData() {
      AgentFactory.agentSupplierByAgent.query({agentID: vm.agentID}, function (supplierAgent) {
        vm.agentSuppliers = $filter('orderBy')(supplierAgent, '-isActive');
      });
    }

    //By default tab 0 is opened!
    vm.activeTab = 0;

    vm.unlinkAgentUser = function (agentUser) {
      vm.unlinkAgentUserValidation = {};
      vm.remark = null;
      $ngConfirm({
        title: 'Unlink User!',
        contentUrl: 'app/agent/template/agent.unlinkAgentsAndUser.template.html',
        // type: 'red',
        closeIcon: true,
        typeAnimated: true,
        scope: $scope,
        buttons: {
          unlink: {
            text: "Unlink",
            btnClass: 'btn-primary',
            action: function () {
              vm.unlinkAgentUserValidation.$showError = true;
              if (vm.unlinkAgentUserValidation.$isValid) {
                var aUser = {
                  id : agentUser.id,
                  userID: agentUser.userID,
                  agentID: agentUser.agentID,
                  isActive: false,
                  remark: vm.remark
                }
                AgentFactory.createAgentUser.save(aUser, function () {
                  loadAgentUserData();
                  vm.remark = null;
                });
              } else {
                return false;
              }

            }
          }
        }
      })
    }


  });
