/**
 * Created by abenitrust on 4/5/17.
 */
'use strict';

angular.module('pdx.factories')
  .factory('AdminSystemSettingsFactory', function($resource, $http, AppConst, CommonService) {
    var adminSettings = {};

    //1. Settings
    adminSettings.settings=$resource(CommonService.buildUrl(AppConst.API_URL.SystemSettings.SystemSettings),{ id: "@id" },AppConst.ResourceMethods.All);

   //2. Update Settings
    adminSettings.updateSettings=$resource(CommonService.buildUrl(AppConst.API_URL.SystemSettings.UpdateSystemSettings),{ id: "@id" },AppConst.ResourceMethods.save);


    return adminSettings;
  });
