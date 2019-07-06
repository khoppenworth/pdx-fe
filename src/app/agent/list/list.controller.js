'use strict';

angular.module('pdx.controllers')
  .controller('AgentListController', function (AppConst, CommonService, DTOptionsBuilder, DTColumnBuilder,
                                               $compile, $scope, $state, $uibModal, AgentFactory, AccountService, $filter, $ngConfirm, NotificationService) {
    var vm = this;
    vm.descriptionText = 'agent management  page';

    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions()
      .withOption('ajax', {
        // Either you specify the AjaxDataProp here
        // dataSrc: 'data',
        url: CommonService.buildUrl(AppConst.API_URL.Agent.AgentList),
        type: 'POST',
        headers: {
          Authorization: AccountService.token()
        },

      })
      .withOption('createdRow', function (row, data, dataIndex) {
          // Recompiling so we can bind Angular directive to the DT
          $compile(angular.element(row).contents())($scope);
          if (data.isActive === false) {
            $(row).addClass('redClass');
          }
        }
      )
      .withOption("stateSave", true)
      .withOption('stateSaveCallback', CommonService.SaveDataTableStatus)
      .withOption("stateLoadCallback", CommonService.LoadSavedDataTableStatus)
      .withDataProp('data')
      .withOption('processing', true)
      .withOption('serverSide', true)
      .withOption('language', AppConst.UIConfig.DataTable.Language)
      .withPaginationType('full_numbers')
      .withDOM(AppConst.UIConfig.DataTable.DOM.All);


    vm.dtColumns = [
      DTColumnBuilder.newColumn('id').withTitle('').notSortable()
        .renderWith(CommonService.displayRowNumber),
      DTColumnBuilder.newColumn('name').withTitle('Name')
        .renderWith(function (data, type, full, meta) {
          return '<a title="' + data + '" ui-sref="agent.detail({id:' + full.id + '})">' + $filter("limitTo")(data, 13) + '</a>';  //Incase routing is needed
          // return '<span title="' + data + '">'+$filter("limitTo")(data,13)+'</span>';
        }),
      DTColumnBuilder.newColumn('phone').withTitle('Phone')
        .renderWith(CommonService.cleanUpNull),
      DTColumnBuilder.newColumn('email').withTitle('Email')
        .renderWith(CommonService.cleanUpNull),
      DTColumnBuilder.newColumn('agentTypeName').withTitle('Type'),
      DTColumnBuilder.newColumn('countryName').withTitle('Country'),
      DTColumnBuilder.newColumn('isActive').withTitle('Status')
        .renderWith(function (data, type, full, meta) {
          return (data ? "Active" : "Inactive");

        }),
      DTColumnBuilder.newColumn('isApproved').withTitle('State')
        .renderWith(function (data, type, full, meta) {
          return (data ? "Approved" : "Not approved");

        }),
      DTColumnBuilder.newColumn('id').withTitle("").notSortable().withOption('width', '9%')
        .renderWith(function (data, type, full, meta) {
          var showApprovedButton = angular.isDefined($scope.permissions) ? !full.isApproved && AccountService.hasThisPermission($scope.permissions.Agent.ApproveAgent) : false;
          return '<a class="btn btn-primary btn-outline btn-xs"  title="Click to view detail" ng-click="vm.showDetail(' + data + ')"><i class="fa fa-eye"></i></a>' +
            '<a show-on="' + showApprovedButton + '"  class="btn btn-warning btn-outline btn-xs" ' +
            'title="Click to Approve"  ng-click="vm.approveAgent(' + data + ')"><i class="fa fa-check"></a>';
        })
    ];


    //Route to supplier detail page
    vm.showDetail = function (agentID) {
      $state.go('agent.detail', {id: agentID});
    };

    vm.createAgent = function () {
      //Open modal
      $uibModal.open({
        backdrop: "static",
        templateUrl: "app/agent/template/agent.modal.template.html",
        size: 'lg',
        windowClass: 'supplierModalClass',
        controller: "AgentNewController",
        controllerAs: 'vm'
      }).result.then(function (received) {
        //Modal is closed ... reload data
        vm.dtInstance.reloadData(function () { /*reloading Data callback*/
        }, true);
      });
    };

    vm.approveAgent = function (agentId) {
      //Open modal
      AgentFactory.agent.get({id: agentId}, function (data) {
        var agent = data;
        agent.isApproved = true;
        AgentFactory.agent.update({id: ""}, agent, function () {
          NotificationService.notify('Applicant approved!', 'alert-success');
          vm.dtInstance.reloadData(function () { /*reloading Data callback*/
          }, true);
        });
      }, function () {
        NotificationService.notify('Error occurred. Please try again!', 'alert-danger');
      });


    };

  });
