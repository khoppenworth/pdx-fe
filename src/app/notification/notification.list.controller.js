'use strict';

angular.module('pdx.pushNotification')
  .controller('PushNotificationListController', function (PushNotificationFactory, $rootScope, AccountService, $filter,
                                                          DTOptionsBuilder, DTColumnBuilder, CommonService, AppConst, $compile, $scope) {
    var vm = this;
    vm.descriptionText = 'Admin Management Page';

    //data table objects
    vm.dtInstance = {};
    vm.dtOptions = {};
    vm.dtColumnDefs = [];

    activate();

    function activate() {
      buildDTOptions();
      buildDTColumnDefs();
    }

    //build data table options
    function buildDTOptions() {
      vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
          // Either you specify the AjaxDataProp here
          // dataSrc: 'data',
          url: CommonService.buildUrl(AppConst.API_URL.Notification.List),
          type: 'POST',
          headers: {
            Authorization: AccountService.token()
          }
        })
        .withOption('createdRow', function(row, data, dataIndex) {
          // Recompiling so we can bind Angular directive to the DT
          $compile(angular.element(row).contents())($scope);
        })
        .withOption("stateSave", true)
        .withOption('stateSaveCallback', CommonService.SaveDataTableStatus)
        .withOption("stateLoadCallback", CommonService.LoadSavedDataTableStatus)
        .withDataProp('data')
        .withOption('processing', true)
        .withOption('serverSide', true)
        .withOption('language', AppConst.UIConfig.DataTable.Language)
        .withPaginationType('full_numbers')
        .withDOM(AppConst.UIConfig.DataTable.DOM.All);
    }

    //build data table columns
    function buildDTColumnDefs(){
      vm.dtColumns = [
        DTColumnBuilder.newColumn('id').withTitle('').notSortable()
          .renderWith(CommonService.displayRowNumber),
        DTColumnBuilder.newColumn('data').withTitle('Subject').notSortable()
          .renderWith(function(data, type, full, meta) {
            return data.subject;
          }),
        DTColumnBuilder.newColumn('data').withTitle('Content').notSortable()
          .renderWith(function(data, type, full, meta) {
            return data.body;
          }),
        DTColumnBuilder.newColumn('createdDate').withTitle('Date').notSortable()
          .renderWith(function(data, type, full, meta) {
            return $filter('date')(data);
          })
      ];
    }

  });
