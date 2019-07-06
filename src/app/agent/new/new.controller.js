'use strict';

angular.module('pdx.controllers')
    .controller('AgentNewController', function($scope,AppConst, CommonService, AgentFactory,$uibModalInstance, NotificationService, LookUpFactory) {
        var vm = this;

        vm.title= "Create Applicant"

        vm.countryList= LookUpFactory.country.query();
        vm.agentTypeList= AgentFactory.agentType.query();
        vm.countryModel = {};
        vm.agentTypeModel = {};
        vm.agent={
          name:undefined,
          description:undefined,
          phone:undefined,
          email:undefined,
          website:undefined,
          fax:undefined,
          licenseNumber:undefined,
          agentTypeID:undefined,
          address:{
              countryID:undefined
          }
        };
        vm.morePhones=[]; //Holds additional phone numbers. (2-extra)

        vm.agentValidation={};

        vm.createAgent=function(){
          vm.agentValidation.$showError=true;
          if(vm.agentValidation.$isValid && $scope.createAgent.$valid){
              vm.agent.address.countryID = vm.countryModel.id;
              vm.agent.agentTypeID = vm.agentTypeModel.id;
              if(vm.morePhones.length>0){
                vm.agent.phone2=vm.morePhones[0].phoneNumber;
                if(vm.morePhones.length>1){
                  vm.agent.phone3=vm.morePhones[1].phoneNumber;
                }
              }
              AgentFactory.agent.save({id:""},vm.agent,function () {
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
