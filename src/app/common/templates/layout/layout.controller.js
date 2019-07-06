'use strict';

angular.module('pdx.controllers')
    .controller('MenuController', function(MenuService, LayoutFactory, AccountService, StorageService, $location, $ngConfirm, $scope, $state, AccountFactory, NotificationService,CommonService) {

        var vm = this;

        vm.userInfo = AccountService.userInfo();

        var menuService = MenuService.instantiate();

        LayoutFactory.menusByUser.query({ userID: vm.userInfo.id }, function(data) {
            var menus = data;

            //sort menu by parentPriority and priority
            var sortedMenu = _(menus).sortBy(
                function(menu) {
                    return [menu.parentMenuPriority, menu.priority];
                });
            vm.menuItems = menuService.prepareMenus(sortedMenu).getAll();


        });

        vm.logout = function() {
            AccountService.logout("On demand");
            $location.path('/login');
            CommonService.RemoveDataTableStatus();
        }

        vm.updatePassword = function() {
            //@params ...   id -> [int] the user id

            vm.changeValidation = {}
            vm.changeModel = {};
            vm.passwordConfirmed = true;
            var hasOldPassword = true;
            $ngConfirm({
                title: 'Change password!',
                contentUrl: 'app/account/change_password.html',
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
                                        userID: AccountService.userInfo().id,
                                        oldPassword: vm.changeModel.oldPassword,
                                        newPassword: vm.changeModel.newPassword,
                                        hasOldPassword: hasOldPassword
                                    };

                                    AccountFactory.changePassword.save(model, function(result) {
                                        if (result.success) {
                                            NotificationService.notify('Password changed successfully. You need to login again!', 'alert-success', 1000 * 60 * 30); // display notification for 30 minutes.
                                            AccountService.logout("Password change");
                                            $state.go('login');
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

    })
    .controller('FooterController', function(app_version) {
        var vm = this;
        vm.year = (new Date()).getFullYear();
        vm.company = ""; //"John Snow Inc | AIDSFree Project"
    })
    .controller('TopNavBarController', function(AccountService, $location) {
        var vm = this;
    })
    .controller('BreadcrumbController', function() {


    })
    .controller('ErrorPageController', function($stateParams) {

        var vm = this;
        vm.errorCode = $stateParams.errorCode;
        vm.errorTitle = "Forbidden"
        vm.errorMessage = "Sorry, but you are not authorized to acces the page you requested.";
    });
