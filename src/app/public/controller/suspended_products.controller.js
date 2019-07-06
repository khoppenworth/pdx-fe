'use strict';

angular.module('pdx.controllers')
    .controller('SuspendedProductListController', function(AppConst, CommonService, DTOptionsBuilder, DTColumnBuilder,
                                                  $compile, $scope, $state, $filter) {
      var vm = this;

      vm.dtInstance = {};
      vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
          // Either you specify the AjaxDataProp here
          // dataSrc: 'data',
          url: CommonService.buildUrl(AppConst.API_URL.Public.ProductLists),
          type: 'POST'
        })
        // or here
        .withOption('createdRow', function(row, data, dataIndex) {
          // Recompiling so we can bind Angular directive to the DT
          $compile(angular.element(row).contents())($scope);
        })
        .withDataProp('data')
        .withOption('processing', true)
        .withDisplayLength(25)
        .withOption("stateSave", true)
        .withOption('stateSaveCallback', CommonService.SaveDataTableStatus)
        .withOption("stateLoadCallback", CommonService.LoadSavedDataTableStatus)
        .withOption('serverSide', true)
        .withOption('language', AppConst.UIConfig.DataTable.Language)
        .withPaginationType('full_numbers')
        .withDOM(AppConst.UIConfig.DataTable.DOM.All);


      vm.dtColumns = [
        DTColumnBuilder.newColumn('id').withTitle('').notSortable()
          .renderWith(CommonService.displayRowNumber),
        DTColumnBuilder.newColumn('brandName').withTitle('Brand')
          .renderWith(function(data, type, full, meta) {
            return '<a title="' + data + '" ui-sref="product_detail({id:'+full.id+'})">'+$filter("limitTo")(data,13)+'</a>';
          }),
        DTColumnBuilder.newColumn('fullItemName').withTitle('Item')
          .renderWith(function(data, type, full, meta) {
            return '<span  title="' + data + '">'+$filter("limitTo")(data,13)+'</span>';
          }),
        DTColumnBuilder.newColumn('commodityTypeName').withTitle(' Product Category'),
        DTColumnBuilder.newColumn('agentName').withTitle('Applicant')
          .renderWith(function(data, type, full, meta) {
            return '<span  title="' + data + '">'+$filter("limitTo")(data,13)+'</span>';
        }),
        DTColumnBuilder.newColumn('registrationDate').withTitle('Approval date')
          .renderWith(function(data,type,full) { return $filter('date')(data, 'MMM d, y'); }),
        DTColumnBuilder.newColumn('expiryDate').withTitle('Expiry date')
          .renderWith(function(data) { return $filter('date')(data, 'MMM d, y'); }),
        DTColumnBuilder.newColumn('supplierName').withTitle('License Holder')
          .renderWith(function(data, type, full, meta) {
            return '<span  title="' + data + '">'+$filter("limitTo")(data,13)+'</span>';
          }),
        DTColumnBuilder.newColumn('manufacturerName').withTitle('Manufacturer')
          .renderWith(function(data, type, full, meta) {
            return '<span  title="' + data + '">'+$filter("limitTo")(data,13)+'</span>';
          }),
        DTColumnBuilder.newColumn('countryName').withTitle('Country')
      ];

});
