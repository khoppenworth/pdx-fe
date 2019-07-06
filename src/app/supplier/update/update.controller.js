'use strict';

angular.module('pdx.controllers')
    .controller('SupplierUpdateController', function($scope,AppConst, CommonService, SupplierFactory,$state,supplier, $uibModalInstance, NotificationService, LookUpFactory) {
        var vm = this;

        LookUpFactory.country.query(function (countries) {
          vm.countryList= countries;
          var supplierCountry = _.filter(vm.countryList,function (country) {
            return country.id === vm.supplier.address.countryID;
          });
          vm.countryModel = supplierCountry[0];
        });
        vm.countryModel = {};
        vm.supplier= supplier; //supplier is resolved from the parent controller and is injected in this controller!
        vm.supplierValidation={};

        vm.morePhones=[]; //Holds additional phone numbers. (2-extra)
        if(CommonService.checkUndefinedOrNull(vm.supplier.phone2)){
          vm.morePhones.push({phoneNumber:vm.supplier.phone2})
        }
        if(CommonService.checkUndefinedOrNull(vm.supplier.phone3)){
          vm.morePhones.push({phoneNumber:vm.supplier.phone3})
        }


      vm.title= "Update License Holder";

        vm.updateSupplier=function(){
          vm.supplierValidation.$showError=true;
          if(vm.supplierValidation.$isValid && $scope.createSupplier.$valid){
              //Manipulate model, ... set to undefined unwanted properties
              vm.supplier.address.countryID = vm.countryModel.id;
              vm.supplier.modifiedDate = undefined;
              vm.supplier.rowGuid = undefined;
              vm.supplier.createdDate= undefined;
              vm.supplier.address.modifiedDate = undefined;
              vm.supplier.address.rowGuid = undefined;
              vm.supplier.address.createdDate= undefined;
              vm.supplier.address.country=undefined;
              vm.supplier.address.isActive = undefined;
              if(vm.morePhones.length>0){
                vm.supplier.phone2=vm.morePhones[0].phoneNumber;
                if(vm.morePhones.length>1){
                  vm.supplier.phone3=vm.morePhones[1].phoneNumber;
                }
              }
              SupplierFactory.supplier.update({id:""},vm.supplier,function () {
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
