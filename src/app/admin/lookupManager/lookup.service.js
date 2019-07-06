'use strict';

angular.module('pdx.services')
  .service('LookupService', function (NotificationService, $resource, LookupConst, CommonService, AppConst) {

    var Constants = LookupConst;
    var _allLookupResources = {
      userType: $resource(CommonService.buildUrl(Constants.API_URL.UserType), {
        id: '@id'
      }, AppConst.ResourceMethods.All),
      manufacturerType: $resource(CommonService.buildUrl(Constants.API_URL.ManufacturerType), {
        id: '@id'
      }, AppConst.ResourceMethods.All),
      payment: $resource(CommonService.buildUrl(Constants.API_URL.PaymentMode), {
        id: '@id'
      }, AppConst.ResourceMethods.All),
      importPermitType: $resource(CommonService.buildUrl(Constants.API_URL.ImportPermitTypes), {
        id: '@id'
      }, AppConst.ResourceMethods.All),
      paymentTerm: $resource(CommonService.buildUrl(Constants.API_URL.PaymentTerm), {
        id: '@id'
      }, AppConst.ResourceMethods.All),
      maType: $resource(CommonService.buildUrl(Constants.API_URL.MaType), {
        id: '@id'
      }, AppConst.ResourceMethods.All),
      subModuleType: $resource(CommonService.buildUrl(Constants.API_URL.SubmoduleType), {
        id: '@id'
      }, AppConst.ResourceMethods.All),
    }

    this.allLookupResources = _allLookupResources;

    this.alertResult = _alertResult;

    this.mapToOptions = _mapToOptions;

    function _mapToOptions (datum){
      return {
          label: datum.name,
          submoduleTypeID: datum.id,
          // submoduleTypeCode: datum.submoduleTypeCode
        }
    }

    function _alertResult(success, success_message) {
      if (success) {
        NotificationService.notify("Successfully " + success_message + "!", "alert-success");
      } else {
        NotificationService.notify("Unable to save data. Please try again!", "alert-danger");
      }
    }

  });
