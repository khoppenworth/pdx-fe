'use strict';

angular.module('pdx.controllers')
    .controller('LoginController', function(AccountService, CommonService, $log, $state, Title, $location, deviceDetector, AuthorizationService, PublicFactory) {
        var vm = this;
        vm.year = (new Date()).getFullYear();
        vm.company = "John Snow Inc | AIDSFree Project";

        vm.showBanner = PublicFactory.showBanner();

        //build logger
        vm.data = deviceDetector;
        //build the login Model
        vm.loginModel = {
            clientInfo: {
                os: vm.data.os,
                osVersion: vm.data.os_version,
                deviceType: vm.data.isDesktop() ? "Desktop" : vm.data.device,
                browser: vm.data.browser,
                browserVersion: vm.data.browser_version
            }
        };

        vm.loginModelValidation = {};


        vm.showError = false;
        vm.loginFailed = false;

        vm.Authenticate = function() {
            AuthorizationService.setForcedReload(true); //Force reload userMenu and userReports;
            vm.showError = true;
            var pageTitle = Title.original();
            if (pageTitle !== "eRIS - Electronic Regulatory Information System") { //If original title stored is not "iImport", set it to "iImport".
                Title.original("eRIS - Electronic Regulatory Information System");
            }
            Title.restore();
            if (vm.loginModelValidation.$isValid) {
                AccountService.login(vm.loginModel)
                    .then(function(result) {
                        //redirect to main
                        if (result.token != undefined && result.token.access_token != undefined) {
                            //check if there exists a return url and route to there ... or else route to home.
                            var returnUrl = CommonService.getReturnUrl();
                            if (angular.isDefined(returnUrl)) {
                                $location.path(returnUrl);
                                //Reset the return ulr once its consumed.
                                CommonService.resetReturnUrl();

                            } else {
                                $state.go('home');
                            }

                        } else {
                            vm.loginFailed = true;
                        }
                    }, function(error) {
                        //show alert or something
                        $log.log(error);
                    })
            }
        }

    });