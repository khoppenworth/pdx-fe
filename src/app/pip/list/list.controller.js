'use strict';

angular.module('pdx.controllers')
  .controller('PipListController', function ($scope, AppConst, AccountService, CommonService, AgentFactory, $state, $uibModal, DTOptionsBuilder, DTColumnBuilder,
                                             $q, $compile, $filter, NotificationService, $ngConfirm, AdminUserMgmtFactory, RoleService, PipFactory, ImportPermitFactory, WIPFactory) {


    var vm = this;
    vm.descriptionText = 'Pre Import Permit Page'
    var titleHtml = '';

    vm.userInfo = AccountService.userInfo();

    vm.wips = [];

    //WIP controlls
    function loadWIP() {
      WIPFactory.getAllWIP.query({type: AppConst.Modules.PreImportPermit, userID: vm.userInfo.id}, function (data) {
        vm.wips = data;
      });
    }

    loadWIP();


    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions()
      .withOption('ajax', {

        url: CommonService.buildUrl(AppConst.API_URL.ImportPermit.PIPList),
        type: 'POST',
        headers: {
          Authorization: AccountService.token()
        },
        data: {
          userID: vm.userInfo.id
        }
      })
      // or here
      .withOption('createdRow', function (row, data, dataIndex) {
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


    vm.dtColumns = [
      DTColumnBuilder.newColumn('id').withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
          return '<button class="btn btn-primary btn-outline btn-xs"  title="Click to view more" ng-click="vm.childInfo(' + data + ', $event)"><i class="fa fa-plus"></button>';
        }),
      DTColumnBuilder.newColumn('importPermitNumber').withTitle('Pre Import Permit').withOption('width', '14.5%')
        .renderWith(function (data, type, full, meta) {
          return '<a class=""  title="Click to view more" ng-click="vm.showPIPDetail(' + full.id + ', $event)">' + data + '</a>';
        }),
      DTColumnBuilder.newColumn('importPermitStatusCode').withTitle('Status').withOption('width', '9.5%')
        .renderWith(function (data, type, full, meta) {
          return '<span  data-ng-class="vm.getStatusColor(&#39;' + data + '&#39;)" title="' + full.importPermitStatus + '">' + data + '</span>';
        }),
      DTColumnBuilder.newColumn('importPermitStatusDisplayName').withTitle('Status').withOption('width', '9.5%')
        .renderWith(function (data, type, full, meta) {
          return '<span  data-ng-class="vm.getAgentStatusColor(&#39;' + data + '&#39;,&#39;' + full.importPermitStatusCode + '&#39;)" title="' + data +
            '" data-ng-bind="&#39;' + data + '&#39;==&#39;Under Assessment&#39;?&#39;UAS&#39;:&#39;' + full.importPermitStatusCode + '&#39;">' + data + '</span>';
        }),
      DTColumnBuilder.newColumn('performaInvoiceNumber').withTitle('Performa Invoice No.'),
      DTColumnBuilder.newColumn('assignedUser').withTitle('Assignee'),
      DTColumnBuilder.newColumn('portOfEntrySH').withTitle('Entry'),
      DTColumnBuilder.newColumn('supplierName').withTitle('License Holder'),
      DTColumnBuilder.newColumn('agentName').withTitle('Applicant')
        .renderWith(function (data, type, full, meta) {
          return '<span   ng-bind="&#39;' + data + '&#39;|limitTo:13" title="' + data + '"></span>';
        }),
      DTColumnBuilder.newColumn('submissionDate').withTitle('Application').renderWith(function (data, type) {
        return $filter('date')(data, 'MMM d, y');
      }),
      DTColumnBuilder.newColumn('decisionDate').withTitle('Decision').renderWith(function (data, type, full) {
        return full.decisionDate ? ($filter)('shortenDuration')(((moment.duration(new moment(full.decisionDate) - new moment(full.submissionDate))).humanize())) : '-';
      }),
      DTColumnBuilder.newColumn('amount').withTitle('Amount')
        .renderWith(function (data, type, full, meta) {
          return $filter('currency')(data, full.currencySymbol, 0);
        }),
      DTColumnBuilder.newColumn('id').withTitle('')
        .renderWith(function (data, type, full, meta) {
          return '<button   hideon="&#39;' + full.importPermitStatusCode + '&#39;" buttonFunction="Assign" class="btn btn-warning btn-outline btn-xs" title="Assign to cso" ng-click="vm.assign(' + data + ', $event)" permission="permissions.PreImportPermit.AssignPIP"><i class="fa fa-check"></i></button>';
        }).withOption('width', '3%').notSortable()
    ];


    vm.dtColumns[2].visible = !vm.userInfo.isAgent; //importPermitStatusCode
    vm.dtColumns[3].visible = vm.userInfo.isAgent; //importPermitStatusDisplayName
    vm.dtColumns[4].visible = vm.userInfo.isAgent; //performa Invoice Number
    vm.dtColumns[5].visible = !vm.userInfo.isAgent && !RoleService.setVisibility(['ROLE_INSPECTOR']);
    vm.dtColumns[8].visible = RoleService.setVisibility(['CSD', 'CST', 'ADM', 'SADM', 'CSO', 'ROLE_INSPECTOR']); //agent
    vm.dtColumns[6].visible = RoleService.setVisibility(['ROLE_INSPECTOR']); //Port Inpsectors

    vm.childInfo = function (ipermit, event) {

      var scope = $scope.$new(true);

      var link = angular.element(event.currentTarget),
        tr = link.parent().parent(),
        table = vm.dtInstance.DataTable,
        row = table.row(tr),
        icon = (row.child.isShown() ? link.find('.fa-minus') : link.find('.fa-plus')); //find current icon , i.e plus or minus;

      //if detail is shown
      if (row.child.isShown()) {
        icon.removeClass('fa-minus').addClass('fa-plus'); //show plus icon
        row.child.hide();
        tr.removeClass('shown');
      } else {
        //get data
        scope.ipermit = ImportPermitFactory.importPermit.get({id: ipermit});
        scope.ipermit.$promise.then(function (result) {
          icon.removeClass('fa-plus').addClass('fa-minus'); //show minus icon
          row.child($compile('<div tmpl class="clearfix" style="padding: 0 0 0 40px;"></div>')(scope), 'no-padding').show();
          tr.addClass('shown');
        });
      }
    };


    vm.showPIPDetail = function (data, event) {
      $state.go('pip.list.info', {pipId: data});
    };

    vm.AssignValidation = {};
    vm.assign = function (aData, event) {
      vm.ipermitAssigned = ImportPermitFactory.importPermit.get({id: aData});
      AdminUserMgmtFactory.role.query(function (data) {
        vm.roles = $filter('orderBy')(data, 'name');
        vm.roleSelected = $filter("filter")(vm.roles, {roleCode: "CSO"})[0];
        vm.onRoleSelected(vm.roleSelected);
      });
      vm.users = [];
      $ngConfirm({
        title: "Assign to CSO",
        contentUrl: 'app/importPermit/list/modals/assignIPermit.html',
        type: "orange",
        typeAnimated: true,
        closeIcon: true,
        scope: $scope,
        columnClass: 'col-md-6 col-md-offset-3',
        buttons: {
          update: {
            text: "Assign",
            btnClass: "btn-warning",
            action: function () {
              vm.AssignValidation.$showError = true;
              if (vm.AssignValidation.$isValid) {
                vm.ipermitAssigned.assignedUserID = vm.ipermitAssigned.assignedUserID.id;
                vm.assignToCSO();
                vm.AssignValidation.$showError = true;
              } else {
                return false;
              }
            }
          }
        }
      });

    }

    vm.assignToCSO = function () {
      vm.ipermitAssigned.modifiedByUserID = vm.userInfo.id;
      ImportPermitFactory.assign.update(vm.ipermitAssigned, function (data) {
        NotificationService.notify("Successfully Assigned", 'alert-success');
        $state.reload();
      }, function (eror) {
        NotificationService.notify("Unabel to Assign Import Permit", 'alert-danger');

      });

    }

    vm.onRoleSelected = function (role) {
      AdminUserMgmtFactory.userRole.query({roleID: role.id}, function (users) {
        vm.users = $filter('orderBy')(users, 'firstName');
      });
    }

    vm.getStatusColor = function (status) {
      return PipFactory.colorMap[status];
    }
    vm.getAgentStatusColor = function (status, statusCode) {
      if (status == 'Under Assessment') {
        return PipFactory.colorMap['UAS'];
      } else return PipFactory.colorMap[statusCode];
    }

    vm.discardDraft = function (draft) {
      $ngConfirm({
        title: "Discard application",
        content: "Are you sure you want to delete this application?",
        type: 'red',
        typeAnimated: true,
        scope: $scope,
        buttons: {
          confirm: {
            text: "Confirm",
            btnClass: 'btn-warning',
            action: function (scope) {
              WIPFactory.deleteWIP.delete({id: draft.id}, function () {
                NotificationService.notify("Application succesfully discarded", "alert-success");
                loadWIP();
              }, function () {
                NotificationService.notify("Cannot discard draft. Please try again!", "alert-danger");
              });
            }
          },
          cancel: {
            back: "Cancel"
          }
        }
      });

    }

    vm.displayWipActiveDate = CommonService.draftActiveNumberOfDate;

  });
