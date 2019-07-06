(function () {
  'use strict';

  angular
    .module('pdx')
    .run(runBlock)
    .config(config);

  /** @ngInject */
  function runBlock($log, StorageService, AppConst, $rootScope, $state, AccountService, Idle, $filter, pendingRequests,
                    $ngConfirm, NotificationService, CommonService, $location, app_version, $templateCache, $window, AuthorizationService) {

    pendingRequests.cancelAll();
    $rootScope.$state = $state;
    $rootScope.app_version = app_version;

    var idleWaringModal = undefined;

    $rootScope.$on("$stateChangeStart",
      function (event, toState, toParams, fromState, fromParams) {

        $rootScope.currentState = toState;
        $rootScope. test = $state.href(toState, toParams);
        pendingRequests.cancelAll();

        var requireLogin = toState.data == undefined ? false : toState.data.RequireLogin;
        var token = StorageService.get(AppConst.StorageKeys.Token);

        if (requireLogin) {

          //Start watching user for idleness, if not already ... only for those states which require login
          if (!Idle.running()) {
            Idle.watch()
          }
          if (_.isUndefined(token)) {
            //Set return url in storage.
            CommonService.setReturnUrl($location.url());
            event.preventDefault();
            $state.go('login');
          }
        } else {
          //If the page doesn't require login and if Idle is running, stop it.
          if (Idle.running()) {
            Idle.unwatch();
          }
          StorageService.removeAllExcept(["ReturnUrl", "SubmoduleTypePublic"]);
        }
        if (toState.redirectTo) {
          event.preventDefault();
          $state.go(toState.redirectTo, toParams, {location: 'replace'})
        }

        //If state requires logging in check further permission to access the state.
        if(requireLogin){
          AuthorizationService.loadUserMenu().then(function(userMenus){
            //User menus successfully loaded. Proceed to check validations
            if(!AuthorizationService.handleStateAuthorization(toState, toParams, fromState, fromParams)){
              //Route is not authorized, therefore reroute to login page.
              event.preventDefault();
              $state.go('login');
            }
          }, function(err){
            //Can't load userMenus (api error call or something). See the service implementation for details
            //TODO:: handle failure to load userMenus; either block the user from proceeding or allow them without validation.
          });


          if(toState.name =='reports.reportsDetail'){
            AuthorizationService.loadUserReport().then(function(){
              //User menus successfully loaded. Proceed to check validations
              if(!AuthorizationService.handleReportStateAuthorization(toState, toParams, fromState, fromParams)){
                //Route is not authorized, therefore reroute to login page.
                event.preventDefault();
                $state.go('login');
              }
            }, function(err){
              //Can't load userMenus (api error call or something). See the service implementation for details
              //TODO:: handle failure to load userMenus; either block the user from proceeding or allow them without validation.
            });
          }
        }


      });
    $rootScope.$on("$stateChangeError",
      function (event, toState, toParams, fromState, fromParams) {
        var x = toState.name;
      })

    $rootScope.$on("$locationChangeStart",
      function (event, next, current) {
        var x = next;
      })

    $rootScope.$on('IdleStart', function () {
      //Idle time count started
      idleWaringModal = $ngConfirm({
        title: 'Session Timeout',
        type: 'orange',
        content: "<div class='text-center'><span>You're being timed out due to inactivity</span><br/><span> You will be logged off until you start interacting with this page.</span></div>",
        backgroundDismiss: true

      });
    });

    $rootScope.$on('IdleTimeout', function () {
      //Time out ...so reroute to login
      idleWaringModal.close();
      Idle.unwatch();
      AccountService.logout("Timeout");
      $state.go('login');
      NotificationService.notify('You have been logged off because your session ended! \n Please login to continue.', 'alert-danger', 1000 * 3600 * 5);
      //display this for 5 hours.

    });


    $rootScope.$on('IdleWarn', function (e, countdown) {
      // follows after the IdleStart event, but includes a countdown until the user is considered timed out
      // the countdown arg is the number of seconds remaining until then.
      // you can change the title or display a warning dialog from here.
      // you can let them resume their session by calling Idle.watch
      idleWaringModal.setTitle('Session Timeout in ' + $filter('countDown')(countdown));
    });

    $rootScope.$on('IdleEnd', function () {
      // the user has come back from AFK and is doing stuff. if you are warning them, you can use this to hide the dialog
      idleWaringModal.close();
    });

    $window.onbeforeunload = function (event) {
      //Unregister notification service worker.
      // return PushNotificationFactory.unregisterServiceWorker();

    };


    setupUiSelectCustomTemplate($templateCache);


  }

  /** @ngInject */
  function config(cfpLoadingBarProvider, $breadcrumbProvider, KeepaliveProvider, IdleProvider, TitleProvider,
                  ChartJsProvider, AppConst, $locationProvider, blockUIConfig, uiSelectConfig) {
    //angular loading bar
    cfpLoadingBarProvider.includeSpinner = false;

    //angular breadcrumb
    $breadcrumbProvider.setOptions({
      prefixStateName: 'home',
      template: 'bootstrap2'
    });

    //angular chart
    //Default colors for all charts
    ChartJsProvider.setOptions({
      chartColors: AppConst.ColorPallets.Chart
    });

    IdleProvider.idle(60 * 15); //10 minutes Idle time
    IdleProvider.timeout(30); //after 30 seconds of being idle, the timer starts
    KeepaliveProvider.interval(60 * 5); //5 minutes keep alive ping

    $locationProvider.html5Mode(true);


    // Enable browser navigation blocking
    blockUIConfig.blockBrowserNavigation = true;
    blockUIConfig.message = 'Please wait ...';
    blockUIConfig.cssClass = 'block-ui'; // Apply these classes to al block-ui elements

    //configure to block only post and put methods
    blockUIConfig.requestFilter = function (config) {
      var block = _.contains(['POST', 'DELETE', 'PUT'], config.method);
      return block;
    };


    uiSelectConfig.theme = 'bootstrap';
    // uiSelectConfig.resetSearchInput = false;


  }


  function setupUiSelectCustomTemplate($templateCache) {
    $templateCache.put("bootstrap_custom/select.tpl.html", '<div class="ui-select-container ui-select-bootstrap dropdown" ng-class="{open: $select.open}"><div class="ui-select-match"></div><span ng-show="$select.open && $select.refreshing && $select.spinnerEnabled"  class="ui-select-refreshing {{$select.spinnerClass}}"></span> <div ng-class="{\'input-group\':$select.allowUserInput}"><input type="search" autocomplete="off" tabindex="-1" aria-expanded="true" aria-label="{{ $select.baseTitle }}" aria-owns="ui-select-choices-{{ $select.generatedId }}" class="form-control ui-select-search" ng-class="{\'ui-select-search-hidden\' : !$select.searchEnabled }" placeholder="{{$select.placeholder}}" ng-model="$select.search" ng-show="$select.open"><span ng-if="$select.allowUserInput" ng-class="{\'ui-disabled\': $select.items.length>0 && $select.disableAddButton}" ng-click="$select.addNewLookup($select.search)"  ng-show="$select.open" title="Add New Value" class="input-group-addon btn-primary" id="basic-addon3" disabled><i class="fa fa-plus"></i></span></div><div class="ui-select-choices"></div><div class="ui-select-no-choice"></div></div>');
    $templateCache.put("bootstrap_custom/match-multiple.tpl.html", "<span class=\"ui-select-match\"><span ng-repeat=\"$item in $select.selected track by $index\"><span class=\"ui-select-match-item btn btn-default btn-xs\" tabindex=\"-1\" type=\"button\" ng-disabled=\"$select.disabled\" ng-click=\"$selectMultiple.activeMatchIndex = $index;\" ng-class=\"{\'btn-primary\':$selectMultiple.activeMatchIndex === $index, \'select-locked\':$select.isLocked(this, $index)}\" ui-select-sort=\"$select.selected\"><span class=\"close ui-select-match-close\" ng-hide=\"$select.disabled\" ng-click=\"$selectMultiple.removeChoice($index)\">&nbsp;&times;</span> <span uis-transclude-append=\"\"></span></span></span></span>");
    $templateCache.put("bootstrap_custom/match.tpl.html", "<div class=\"ui-select-match\" ng-hide=\"$select.open && $select.searchEnabled\" ng-disabled=\"$select.disabled\" ng-class=\"{\'btn-default-focus\':$select.focus}\"><span tabindex=\"-1\" class=\"btn btn-default form-control ui-select-toggle\" aria-label=\"{{ $select.baseTitle }} activate\" ng-disabled=\"$select.disabled\" ng-click=\"$select.activate()\" style=\"outline: 0;\"><span ng-show=\"$select.isEmpty()\" class=\"ui-select-placeholder text-muted\">{{$select.placeholder}}</span> <span ng-hide=\"$select.isEmpty()\" class=\"ui-select-match-text pull-left\" ng-class=\"{\'ui-select-allow-clear\': $select.allowClear && !$select.isEmpty()}\" ng-transclude=\"\"></span> <i class=\"caret pull-right\" ng-click=\"$select.toggle($event)\"></i> <a ng-show=\"$select.allowClear && !$select.isEmpty() && ($select.disabled !== true)\" aria-label=\"{{ $select.baseTitle }} clear\" style=\"margin-right: 10px\" ng-click=\"$select.clear($event)\" class=\"btn btn-xs btn-link pull-right\"><i class=\"glyphicon glyphicon-remove\" aria-hidden=\"true\"></i></a></span></div>");
    $templateCache.put("bootstrap_custom/no-choice.tpl.html", "<ul class=\"ui-select-no-choice dropdown-menu\" ng-show=\"$select.items.length == 0\"><li ng-transclude=\"\"></li></ul>");
    $templateCache.put("bootstrap_custom/select-multiple.tpl.html", "<div class=\"ui-select-container ui-select-multiple ui-select-bootstrap_custom dropdown form-control\" ng-class=\"{open: $select.open}\"><div><div class=\"ui-select-match\"></div><input type=\"search\" autocomplete=\"off\" autocorrect=\"off\" autocapitalize=\"off\" spellcheck=\"false\" class=\"ui-select-search input-xs\" placeholder=\"{{$selectMultiple.getPlaceholder()}}\" ng-disabled=\"$select.disabled\" ng-click=\"$select.activate()\" ng-model=\"$select.search\" role=\"combobox\" aria-expanded=\"{{$select.open}}\" aria-label=\"{{$select.baseTitle}}\" ng-class=\"{\'spinner\': $select.refreshing}\" ondrop=\"return false;\"></div><div class=\"ui-select-choices\"></div><div class=\"ui-select-no-choice\"></div></div>");
    $templateCache.put("bootstrap_custom/choices.tpl.html", "<ul class=\"ui-select-choices ui-select-choices-content ui-select-dropdown dropdown-menu\" ng-show=\"$select.open && $select.items.length > 0\"><li class=\"ui-select-choices-group\" id=\"ui-select-choices-{{ $select.generatedId }}\"><div class=\"divider\" ng-show=\"$select.isGrouped && $index > 0\"></div><div ng-show=\"$select.isGrouped\" class=\"ui-select-choices-group-label dropdown-header\" ng-bind=\"$group.name\"></div><div ng-attr-id=\"ui-select-choices-row-{{ $select.generatedId }}-{{$index}}\" class=\"ui-select-choices-row\" ng-class=\"{active: $select.isActive(this), disabled: $select.isDisabled(this)}\" role=\"option\"><span class=\"ui-select-choices-row-inner\"></span></div></li></ul>");
    $templateCache.put("bootstrap_custom/select-multiple.tpl.html", '<div class="ui-select-container ui-select-multiple ui-select-bootstrap dropdown form-control" ng-class="{open: $select.open}"><div class="ui-select-match"></div><div><div ng-class="{\'input-group\':$select.allowUserInput}"><input type="search" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" class="ui-select-search form-control" placeholder="{{$selectMultiple.getPlaceholder()}}" ng-disabled="$select.disabled" ng-click="$select.activate()" ng-model="$select.search" aria-expanded="{{$select.open}}" aria-label="{{$select.baseTitle}}" ng-class="{\'spinner\': $select.refreshing}" ondrop="return false;"><span  ng-class="{\'ui-disabled\': $select.items.length>0}" ng-click="$select.addNewLookup($select.search)"  title="Add New Value" class="input-group-addon btn-primary" ng-show="$select.open && $select.allowUserInput" id="basic-addon3" disabled><i class="fa fa-plus"></i></span></div></div><div class="ui-select-choices"></div><div class="ui-select-no-choice"></div></div>'
    );
  }
})();
