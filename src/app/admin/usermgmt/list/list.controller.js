'use strict';

angular.module('pdx.controllers')
    .controller('UserListController', function($scope,
        AppConst, CommonService, AccountService, $uibModal, DTOptionsBuilder, DTColumnBuilder,
        $compile, $ngConfirm, $filter, AccountFactory, NotificationService) {
        var vm = this;
        vm.descriptionText = 'Admin Managment Page'
        var titleHtml = '';
        vm.dtInstance = {};
        vm.dtOptions = DTOptionsBuilder.newOptions()
            .withOption('ajax', {
                // Either you specify the AjaxDataProp here
                // dataSrc: 'data',
                url: CommonService.buildUrl(AppConst.API_URL.Account.UserList),
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
            .withDOM(AppConst.UIConfig.DataTable.DOM.All)
            

        vm.dtColumns = [
            DTColumnBuilder.newColumn('id').withTitle('').notSortable()
            .renderWith(CommonService.displayRowNumber),
            DTColumnBuilder.newColumn('firstName').withTitle('First Name'),
            DTColumnBuilder.newColumn('lastName').withTitle('Last Name'),
            DTColumnBuilder.newColumn('username').withTitle('Username'),
            DTColumnBuilder.newColumn(null).withTitle('User Type')
            .renderWith(function(data, type, full, meta) {
                var display = data.userTypeName;
                var tooltip = '';
                //Check if user is of Type agent, if so display the agent name it is linked with
                if ((data.userTypeCode.toLowerCase() === 'agn' || data.userTypeCode.toLowerCase() === 'cmp') && data.agentName !== null) {
                    tooltip = data.agentName;
                    display = display + ' [ ' + $filter('limitTo')(data.agentName, 12) + ' ] ';

                }
                return '<span title=' + tooltip + '>' + display + '</span>';
            }).notSortable(),
            DTColumnBuilder.newColumn('status').withTitle('Status'),
            DTColumnBuilder.newColumn('id').withTitle('')
            .renderWith(function(data, type, full, meta) {
                var showOverridePassword = angular.isDefined($scope.permissions) ? AccountService.hasThisPermission($scope.permissions.User.OverrideUserPassword) : false;
                return '<button class="btn btn-warning  btn-outline btn-xs"  ng-click="vm.updateModal(' + data + ')"><i class="glyphicon glyphicon-edit"></i></button> ' +
                    '<button show-on="' + showOverridePassword + '" class="btn btn-danger  btn-outline btn-xs" title="Override user password" ng-click="vm.updatePassword(' + data + ')"><i class="glyphicon glyphicon-lock"></i></button> ';
            }).notSortable()

        ];

        // vm.dtColumns[7].visible = AccountService.hasThisPermission($scope.permissions.User.OverrideUserPassword); //importPermitStatusCode

        //Opens the CreateModal View
        vm.createModal = function() {
            //Open modal
            $uibModal.open({
                backdrop: "static",
                templateUrl: "app/admin/usermgmt/template/new.modal.html",
                size: 'lg',
                resolve: {

                },
                controller: "NewUserModalController",
                controllerAs: 'vm'
            }).result.then(function(received) {
                reloadData();
            }, function(message) {

            });
        };

        //Opens the UpdateModal View
        vm.updateModal = function(id) {
            //Open modal
            $uibModal.open({
                backdrop: "static",
                templateUrl: "app/admin/usermgmt/template/new.modal.html",
                size: 'lg',
                resolve: {
                    userID: id
                },
                controller: "UpdateUserModalController",
                controllerAs: 'vm'
            }).result.then(function(received) {
                reloadData();
            }, function(message) {

            });
        };

        function reloadData() {
            vm.dtInstance.reloadData(function() { /*reloading Data callback*/ }, true);
        }

        vm.updatePassword = function(id) {
            //@params ...   id -> [int] the user id

            vm.changeValidation = {}
            vm.changeModel = {};
            vm.passwordConfirmed = true;
            var hasOldPassword = false;
            $ngConfirm({
                title: 'Change password!',
                contentUrl: 'app/admin/usermgmt/template/updatepassword.html',
                // type: 'red',
                closeIcon: true,
                typeAnimated: true,
                scope: $scope,
                buttons: {
                    update: {
                        text: "change",
                        btnClass: 'btn-primary',
                        action: function() {
                            vm.changeValidation.$showError = true;
                            if (vm.changeValidation.$isValid && $scope.changeForm.$valid) {
                                if (vm.changeModel.newPassword === vm.changeModel.Confirm) {
                                    vm.passwordConfirmed = true;
                                    var model = {
                                        userID: id,
                                        oldPassword: vm.changeModel.oldPassword,
                                        newPassword: vm.changeModel.newPassword,
                                        hasOldPassword: hasOldPassword
                                    }
                                    AccountFactory.changePassword.save(model, function(result) {
                                        if (result.success) {
                                            NotificationService.notify('Password changed successfully!', 'alert-success');
                                            return true;
                                        }
                                        return false;

                                    }, function(error) {
                                        return false;
                                    })
                                } else {
                                    vm.passwordConfirmed = false;
                                    return false;
                                }

                            } else {
                                return false;
                            }
                        }
                    }
                }
            });
        };

    });