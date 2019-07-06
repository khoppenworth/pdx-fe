'use strict';

angular.module('pdx.factories')
  .factory('SRAFactory', function ($resource, AppConst, CommonService) {
    var sraFactory = {};

    sraFactory.sraTypes = $resource(CommonService.buildUrl(AppConst.API_URL.SRA.SRAType), {id: "@id"}, AppConst.ResourceMethods.Readonly);
    sraFactory.sras = $resource(CommonService.buildUrl(AppConst.API_URL.SRA.SRA), {id: "@id"}, AppConst.ResourceMethods.All);

    return sraFactory;
  });
