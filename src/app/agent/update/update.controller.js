'use strict';

angular.module('pdx.controllers')
    .controller('AgentUpdateController', function($scope,AppConst, CommonService, AgentFactory,$state,agent, $uibModalInstance, NotificationService, LookUpFactory) {
        var vm = this;

        LookUpFactory.country.query(function (countries) {
          vm.countryList= countries;
          var agentCountry = _.find(vm.countryList,function (country) {
            return country.id === vm.agent.address.countryID;
          });
          vm.countryModel = agentCountry;
        });
        AgentFactory.agentType.query(function (agentTypes) {
          vm.agentTypeList= agentTypes;
          var agentType = _.find(vm.agentTypeList,function (agent) {
            return agent.id === vm.agent.agentTypeID;
          });
          vm.agentTypeModel = agentType;
        });
        vm.countryModel = {};
        vm.agentTypeModel = {};
        vm.agent= agent; //agent is resolved from the parent controller and is injected in this controller!
        vm.agentValidation={};
        vm.morePhones=[]; //Holds additional phone numbers. (2-extra)
        if(CommonService.checkUndefinedOrNull(vm.agent.phone2)){
          vm.morePhones.push({phoneNumber:vm.agent.phone2})
        }
        if(CommonService.checkUndefinedOrNull(vm.agent.phone3)){
          vm.morePhones.push({phoneNumber:vm.agent.phone3})
        }

        vm.title= "Update Applicant";

        vm.updateAgent=function(){
          vm.agentValidation.$showError=true;
          if(vm.agentValidation.$isValid &&  $scope.createAgent.$valid){
              //Manipulate model, ... set to undefined unwanted properties
              vm.agent.address.countryID = vm.countryModel.id;
              vm.agent.agentTypeID = vm.agentTypeModel.id;
              vm.agent.modifiedDate = undefined;
              vm.agent.rowGuid = undefined;
              vm.agent.createdDate= undefined;
              vm.agent.address.modifiedDate = undefined;
              vm.agent.address.rowGuid = undefined;
              vm.agent.address.createdDate= undefined;
              vm.agent.address.country=undefined;
              vm.agent.address.isActive = undefined;
              vm.agent.agentType = undefined;
              if(vm.morePhones.length>0){
                vm.agent.phone2=vm.morePhones[0].phoneNumber;
                if(vm.morePhones.length>1){
                  vm.agent.phone3=vm.morePhones[1].phoneNumber;
                }
              }
              AgentFactory.agent.update({id:""},vm.agent,function () {
                $uibModalInstance.close('Successful');
              });
          }else{
            return;
          }

        };

        vm.addMorePhone = function(){
          if(vm.morePhones.length >=2 ){
            NotificationService.notify("Cannot have more than 3 phone numbes", "alert-warning");
            return;
          }
          vm.morePhones.push({phoneNumber:undefined});
        }

        vm.removeAdditionalPhone = function (extraPhone) {
          var index= vm.morePhones.indexOf(extraPhone);
          if(index !=undefined && index!=null){
            vm.morePhones.splice(index,1);
          }
        }


    });
