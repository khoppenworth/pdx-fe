'use strict';

angular.module('pdx.controllers')
    .controller('SupplierNewController', function($scope,AppConst, CommonService, SupplierFactory,$uibModalInstance, NotificationService, LookUpFactory) {
        var vm = this;

        vm.title= "Create License Holder"

        vm.countryList= LookUpFactory.country.query();
        vm.countryModel = {};
        vm.supplier={
          name:undefined,
          description:undefined,
          phone:undefined,
          email:undefined,
          website:undefined,
          fax:undefined,
          address:{
              countryID:undefined
          }
        };
        vm.morePhones=[]; //Holds additional phone numbers. (2-extra)

        vm.supplierValidation={};

        vm.createSupplier=function(){
          vm.supplierValidation.$showError=true;
          if(vm.supplierValidation.$isValid && $scope.createSupplier.$valid){
              vm.supplier.address.countryID = vm.countryModel.id;
              if(vm.morePhones.length>0){
                vm.supplier.phone2=vm.morePhones[0].phoneNumber;
                if(vm.morePhones.length>1){
                  vm.supplier.phone3=vm.morePhones[1].phoneNumber;
                }
              }
              SupplierFactory.supplier.save({id:""},vm.supplier,function () {
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
