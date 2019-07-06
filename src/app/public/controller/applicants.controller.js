'use strict';

angular.module('pdx.controllers')
    .controller('ApplicantsListController', function(AppConst, CommonService, DTOptionsBuilder, DTColumnBuilder,
                                                     $compile, $scope, $state, $filter) {
      var vm = this;
      vm.descriptionText = 'agent manamgement page';

      vm.dtInstance = {};
      vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
          // Either you specify the AjaxDataProp here
          // dataSrc: 'data',
          url: CommonService.buildUrl(AppConst.API_URL.Public.AgentList),
          type: 'POST'
        })
        .withOption('createdRow', function(row, data, dataIndex) {
          // Recompiling so we can bind Angular directive to the DT
          $compile(angular.element(row).contents())($scope);
        })
        .withDataProp('data')
        .withDisplayLength(25)
        .withOption("stateSave", true)
        .withOption('stateSaveCallback', CommonService.SaveDataTableStatus)
        .withOption("stateLoadCallback", CommonService.LoadSavedDataTableStatus)
        .withOption('processing', true)
        .withOption('serverSide', true)
        .withOption('responsive', true)
        .withOption('language', AppConst.UIConfig.DataTable.Language)
        .withPaginationType('full_numbers')
        .withDOM(AppConst.UIConfig.DataTable.DOM.All);


      vm.dtColumns = [
        DTColumnBuilder.newColumn('id').withTitle('').notSortable()
          .renderWith(CommonService.displayRowNumber),
        DTColumnBuilder.newColumn('name').withTitle('Name')
          .renderWith(function(data, type, full, meta) {
            return '<a title="' + data + '" ui-sref="applicant_detail({id:'+full.id+'})">'+$filter("limitTo")(data,20)+'</a>';

          }),
        DTColumnBuilder.newColumn('contactPerson').withTitle('Contact Name'),
        DTColumnBuilder.newColumn('phone').withTitle('Phone'),
        DTColumnBuilder.newColumn('email').withTitle('Email'),
        DTColumnBuilder.newColumn('agentTypeName').withTitle('Type'),
        DTColumnBuilder.newColumn('countryName').withTitle('Country'),
        DTColumnBuilder.newColumn('isActive').withTitle('Status')
          .renderWith(function(data, type, full, meta) {
            return (data ? "Active" : "Inactive");

          })
      ];

      //Route to supplier detail page
      vm.showDetail = function(agentID) {
        $state.go('agent.detail', { id: agentID });
      };


  });
