/**
 * Created by abenitrust on 7/10/17.
 */
'use strict';

//
//This service is responsible for handling routing authorizations
angular.module('pdx.services')
  .service('AuthorizationService', function ($rootScope, LayoutFactory, AdminRoleMgmtFactory, $q, AccountService, $state, MenuService) {
    var authorizationService = {};

    var _userMenus = undefined;
    var _userReports = undefined;
    var _flattendUserMenu = undefined;
    var _forceReload  = false; //Flag to forceReload user menu. Important to set this to true when a new user logs in.

    authorizationService.setForcedReload = function(value) {
      _forceReload = value;
    };

    authorizationService.isUserMenusLoaded = function () {
      return angular.isDefined(_userMenus);
    };

    authorizationService.isUserReportsLoaded = function () {
      return angular.isDefined(_userReports);
    };

    authorizationService.loadUserMenu = function () {
      return $q(function(resolve, reject) {
        if (!_forceReload && authorizationService.isUserMenusLoaded()) {
          //Menu is already loaded, so return that immediately
          resolve(_userMenus);
        } else {
          LayoutFactory.menusByUser.query({userID: AccountService.userInfo().id}, function (data) {
            _userMenus = data;
            _flattendUserMenu = flatten(angular.copy(_userMenus)); //Important to copy this inorder not to modify the original
            _flattendUserMenu.push({
              isActive: true,
              name: "Home",
              parentMenuID: null,
              url: "home"
            }); //Manually add Home page. It is(should be) available for all users since login redirects them to this page.;
            _forceReload = false; // Set forcedReload to false;
            resolve(_userMenus);
          }, function (err) {
            reject(err);
          });
        }
      })
    };

    authorizationService.loadUserReport = function () {
      return $q(function(resolve, reject) {
        if (!_forceReload && authorizationService.isUserReportsLoaded()) {
          //UserReports is already loaded, so return that immediately
          resolve(_userReports);
        } else {
          AdminRoleMgmtFactory.roles.get({id: AccountService.userInfo().roleID}, function (data) {
            _userReports = data.reportRoles;
            resolve(_userReports);
          }, function (err) {
            reject(err);
          });
        }
      })
    };


    var flatten = function (array){
      var result = [];
      array.forEach(function (a) {
        result.push(a);
        if (Array.isArray(a.menuItems)) {
          result = result.concat(flatten(a.menuItems));
        }
      });
      return result;
    }

    /*
    * Handles the logic to authorized or not state routing.
    * Tests the if the Routing state name exists inside the array of preparedUserMenus(flattend)
    * */
    authorizationService.handleStateAuthorization = function(toState, toParams, fromState, fromParams) {

      var routingStateUrl = $state.href(toState, toParams);
      //Match current url from the list of userMenu urls;
      var testRoute = _.find(_flattendUserMenu, function(userMenu){
        if(userMenu.parentMenuID){
          return false;  //Do not check child paths, they will definitely fail the test; (regexr match)
        }
        var testUrlRegx = new RegExp('^/'+userMenu.url);
        var pathExists = testUrlRegx.test(routingStateUrl);
        return pathExists;
      });
      //If one such is found, the route is authorized, thus return true; else return false;
      return angular.isDefined(testRoute) ? true : false;

    };

    /*
    * Handles the logic to authorize or not Report page routing.
    * */
    authorizationService.handleReportStateAuthorization = function(toState, toParams, fromState, fromParams) {
        var routingStateUrl = $state.href(toState, toParams);
        //Match current url from the list of userMenu urls;
        var parentUrl = '/reports/';
        var testRoute = _.find(_userReports, function(userReport){
          var testUrlRegx = new RegExp('^'+parentUrl + userReport.reportID);
          var pathExists = testUrlRegx.test(routingStateUrl);
          return pathExists;
        });
        //If one such is found, the route is authorized, thus return true; else return false;
        return angular.isDefined(testRoute) ? true : false;
    };

    return authorizationService;

  });
