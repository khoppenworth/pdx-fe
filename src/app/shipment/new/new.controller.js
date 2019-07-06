'use strict';

angular.module('pdx.controllers')
    .controller('ShipmentNewController', function($scope, $state, ShipmentFactory, $ngConfirm, AccountService, NotificationService) {
        var vm = this;

        vm.user = AccountService.userInfo();
        vm.shipmentStates = $scope.shipmentStates.new;

        $state.go('shipment.new.registered');

        vm.shipmentValidation = {
            registeredApplication: {},
            generalInformation: {inspectors:[]},
            detailInformation: []
        };
        vm.importPermit = {};
        vm.shipment = {
            shipment: {
                shipmentDetails: [],
                inspectors:[{}]
            }
        }

        //search registered 
        vm.searchRegistered = function(keyWords, $event) {
            if (keyWords == "") {
                keyWords = " ";
            }
            if (!$event) {
                vm.pageNo = 0;
            } else {
                $event.stopPropagation();
                $event.preventDefault();
                vm.pageNo++;
            }

            ShipmentFactory.searchImportPermits.save({
                query: keyWords,
                pageNo: vm.pageNo,
                pageSize: 10
            }, function(data) {
                if ($event) {
                    if (!vm.previousApps) {
                        vm.previousApps = [];
                    } //Initialize incase its undefined or null.
                    vm.previousApps = vm.previousApps.concat(data.data);

                } else {
                    vm.previousApps = data.data;
                }

            });

        };


        vm.onApplicationSelected = function() {
            if (vm.selectedApp === null) {
                return;
            }
            vm.importPermit = vm.selectedApp;

        };

        vm.registredIPsToGeneral = function() {
            vm.shipmentValidation.registeredApplication.$showError = true;
            if (vm.shipmentValidation.registeredApplication.$isValid) {
                $state.go(vm.shipmentStates.general);
            } else {
                return;
            }
        };

        vm.generalToDetail = function() {
            vm.shipmentValidation.generalInformation.$showError = true;
            if (vm.shipmentValidation.generalInformation.$isValid) {
                $state.go(vm.shipmentStates.detail);
            } else {
                return;
            }
        };

        vm.datePickerOptions = {
            // minDate: new Date()
        };

        vm.AddRemoveInspectors = function(action,$index){ 
            if(action=='add')vm.shipment.shipment.inspectors.push({});
            else {
                vm.shipment.shipment.inspectors.splice($index, 1);
                vm.shipmentValidation.generalInformation.inspectors.splice($index, 1);
            }
        }

        vm.RemoveProductFromList = function($index) {
            $ngConfirm({
                title: 'Remove Product',
                content: '<span>This will remove the product.</span><br/><span>Are you sure you want to proceed?</span>',
                type: 'red',
                closeIcon: true,
                typeAnimated: true,
                scope: $scope,
                buttons: {
                    proceed: {
                        text: "Yes",
                        btnClass: 'btn-primary',
                        action: function() {
                            vm.importPermit.importPermitDetails.splice($index, 1);
                            vm.shipmentValidation.detailInformation.splice($index, 1);

                            $scope.$apply(); // Added this because changes need to take effect (removal) as soon as this is done.
                            //Somehow the change is not taking effect without it.
                        }
                    },
                    cancel: {
                        text: "No",
                        btnClass: 'btn-warning',
                        action: function() {
                            return true;
                        }
                    }
                }
            });

        };

        vm.Split = function($index) {
            var product = vm.importPermit.importPermitDetails[$index];
            var productCopy = angular.copy(product)
            productCopy.batchNumber = null;
            productCopy.expiryDate = null;
            productCopy.unitQuantity = null;
            productCopy.totalQuantity = null;
            vm.importPermit.importPermitDetails = vm.importPermit.importPermitDetails.concat(productCopy);

        };

        vm.saveShipment = function() {
            vm.shipmentValidation.detailInformation.$showError = true;
            if (vm.shipmentValidation.detailInformation.$isValid) {
                if (checkDuplicates()) {
                    prepareShipment();
                    ShipmentFactory.shipment.save(vm.shipment, function(response) {
                        if (response.isSuccess) NotificationService.notify("Successfully Saved!", "alert-success");
                        else NotificationService.notify("Unable to save data. Please try again!", "alert-danger");
                        $state.go('shipment.list');
                    }, function() {
                        NotificationService.notify("Unable to save data. Please try again!", "alert-danger");
                    });
                } else {
                    NotificationService.notify("Please check duplicates for batch and expiry!", "alert-warning");
                };
            } else {
                return;
            }
        };

        var checkDuplicates = function() {
            if (vm.importPermit.importPermitDetails.length <= 1) return true;
            var unique = _.uniq(vm.importPermit.importPermitDetails, true, function(pod) {
                return JSON.stringify(_.pick(pod, ['productID', 'expiryDate', 'batchNumber']))
            });
            if (unique.length < vm.importPermit.importPermitDetails.length) return false;
            else return true;
        }

        var prepareShipment = function() {
            vm.shipment.shipment.importPermitID = vm.importPermit.id;
            vm.shipment.shipment.createdByUserID = vm.user.id;
            var inspectors = null;
            _.each(vm.shipment.shipment.inspectors, function (ins) {
                if (inspectors == null) inspectors = ins.name;
                else inspectors = inspectors + "," + ins.name
            });
            vm.shipment.shipment.inspectors = inspectors;
            var shipmentDetails = [];
            _.each(vm.importPermit.importPermitDetails, function(pod) {
                var sd = {};
                sd.importPermitDetailID = pod.id,
                    sd.unitQuantity = pod.unitQuantity,
                    sd.expiryDate = pod.expiryDate,
                    sd.batchNumber = pod.batchNumber,
                    sd.quantity = pod.totalQuantity
                shipmentDetails.push(sd);
            });
            vm.shipment.shipment.shipmentDetails = shipmentDetails;
        }

    });