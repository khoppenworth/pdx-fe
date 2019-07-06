'use strict';

angular.module('pdx.controllers')
  .controller('ForeignStatusModalController', function ($scope, AppConst, CommonService, $uibModalInstance, NotificationService, LookUpFactory, CommodityFactory, foreignApplicationStatus) {
    var vm = this;

    vm.title = foreignApplicationStatus != null ? "Edit Active Substances" : "Add New Active Substances";

    vm.foreignStatuses = LookUpFactory.foreignStatus.query();
    vm.countries = LookUpFactory.country.query();

    vm.foreignApplicationStatus = foreignApplicationStatus;
    if(vm.foreignApplicationStatus && vm.foreignApplicationStatus.decisionDate) {
      vm.foreignApplicationStatus.decisionDate = new Date (vm.foreignApplicationStatus.decisionDate);
    }
    vm.foreignApplicationStatusValidation = {};


    vm.addForeignApplicationStatus = function () {
      vm.foreignApplicationStatusValidation.$showError = true;
      if (vm.foreignApplicationStatusValidation.$isValid) {
        prepareforeignApplicationStatus();
        $uibModalInstance.close(vm.foreignApplicationStatus);
      } else return;

    };

    var prepareforeignApplicationStatus = function () {
      vm.foreignApplicationStatus.foreignApplicationStatusID = vm.foreignApplicationStatus.foreignApplicationStatus.id;
      vm.foreignApplicationStatus.countryID = vm.foreignApplicationStatus.country.id;
    }

    vm.dateOptions = {
      initDate: new Date(),
      maxDate:  new Date()
    };


  });
