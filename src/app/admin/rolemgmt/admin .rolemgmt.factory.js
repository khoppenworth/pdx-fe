/**
 * Created by abenitrust on 4/5/17.
 */
'use strict';

angular.module('pdx.factories')
  .factory('AdminRoleMgmtFactory', function($resource, $http, AppConst, CommonService) {
    var adminRolemgmtFactory = {};

    //1. Roles
    adminRolemgmtFactory.roles=$resource(CommonService.buildUrl(AppConst.API_URL.Account.Roles),{ id: "@id" },AppConst.ResourceMethods.All);

    //2. Menus
    adminRolemgmtFactory.menus=$resource(CommonService.buildUrl(AppConst.API_URL.Menus.Menus),{ id: "@id" },AppConst.ResourceMethods.All);

    //3. Permissions
    adminRolemgmtFactory.permissions=$resource(CommonService.buildUrl(AppConst.API_URL.Permissions.Permissions),{ id: "@id" },AppConst.ResourceMethods.Readonly);

    //4. MenusByRole
    adminRolemgmtFactory.menusByRole=$resource(CommonService.buildUrl(AppConst.API_URL.Menus.MenusByRole),{ roleID: "@roleID" },AppConst.ResourceMethods.All);

    //5. RoleMenus
    adminRolemgmtFactory.createRoleMenu=$resource(CommonService.buildUrl(AppConst.API_URL.Menus.UpdateRoleMenu),{ id: "@id" },AppConst.ResourceMethods.save);


    //6. RolePermissions
    adminRolemgmtFactory.createRolePermissions=$resource(CommonService.buildUrl(AppConst.API_URL.Permissions.CreateRolePermissions),{ id: "@id" },AppConst.ResourceMethods.save);


    //7. RoleReports
    adminRolemgmtFactory.reports=$resource(CommonService.buildUrl(AppConst.API_URL.Report.Report),{ id: "@id" },AppConst.ResourceMethods.Readonly);

    //8. RolePermissions
    adminRolemgmtFactory.createRoleReport=$resource(CommonService.buildUrl(AppConst.API_URL.Report.UpdateRoleReport),{ id: "@id" },AppConst.ResourceMethods.save);


    return adminRolemgmtFactory;
  });
