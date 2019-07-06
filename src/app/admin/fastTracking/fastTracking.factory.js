'use strict';

angular.module('pdx.factories')
  .factory('FastTrackingFactory', function ($resource, AppConst, CommonService) {
    var fastTrackingFactory = {};

    fastTrackingFactory.fastTracking = $resource(CommonService.buildUrl(AppConst.API_URL.FastTracking.FastTracking), {id: "@id"}, AppConst.ResourceMethods.All);
    fastTrackingFactory.therapeuticGroup = $resource(CommonService.buildUrl(AppConst.API_URL.FastTracking.TherapeuticGroup), {id: "@id"}, AppConst.ResourceMethods.Readonly);
    fastTrackingFactory.inn = $resource(CommonService.buildUrl(AppConst.API_URL.Commodity.INN), {}, AppConst.ResourceMethods.Readonly);

    return fastTrackingFactory;
  });
