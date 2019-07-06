'use strict';

angular.module('pdx.controllers')
    .controller('ManufacturerModalController', function($scope, AppConst, CommonService, $uibModalInstance, NotificationService, LookUpFactory, RegistrationFactory) {
        var vm = this;

        vm.title = "Register New Manufacturer";

        vm.countryList = LookUpFactory.country.query();

        vm.addresses = [{ country: null, city: null, zipCode: null }]; //At least one address is required.
        vm.manufacturer = {
            name: undefined,
            description: undefined,
            phone: undefined,
            email: undefined,
            website: undefined,
            fax: undefined,
            gmpInspectedDate: null,
            gmpCertificateNumber: null,
            isGMPInspected: false,
        };
        vm.morePhones = []; //Holds additional phone numbers. (2-extra)

        vm.manufacturerValidation = { address: [] };

        vm.gmpInspectedDate = {
            date: {}
        };

        vm.createManufacturer = function() {
            vm.manufacturerValidation.$showError = true;
            if (vm.manufacturerValidation.$isValid && $scope.createManufacturer.$valid) {
                vm.manufacturer.manufacturerAddresses = [];
                var addresses = angular.copy(vm.addresses);
                vm.manufacturer.site = addresses[0].line1; // use the first address line1 as manufacturer site address
                _.each(addresses, function(address) {
                    address.countryID = address.country.id;
                    address.country = null;
                    address.placeName = address.line1;
                    vm.manufacturer.manufacturerAddresses.push({ address: address });
                });
                //randomly select the first manufacturerAddress CountryID as a default countID; Required from BackEnd!
                vm.manufacturer.countryID = vm.manufacturer.manufacturerAddresses[0].address.countryID;
                if (vm.morePhones.length > 0) {
                    vm.manufacturer.phone2 = vm.morePhones[0].phoneNumber;
                    if (vm.morePhones.length > 1) {
                        vm.manufacturer.phone3 = vm.morePhones[1].phoneNumber;
                    }
                }
                RegistrationFactory.manufacturer.save({ id: "" }, vm.manufacturer, function() {
                    $uibModalInstance.close('Successful');
                });
            } else {
                return;
            }

        };

        vm.addMorePhone = function() {
            if (vm.morePhones.length >= 2) {
                NotificationService.notify("Cannot have more than 3 phone numbes", "alert-warning");
                return;
            }
            vm.morePhones.push({ phoneNumber: undefined });
        }

        vm.removeAdditionalPhone = function(extraPhone) {
            var index = vm.morePhones.indexOf(extraPhone);
            if (index != undefined && index != null) {
                vm.morePhones.splice(index, 1);
            }
        }

        vm.addAddress = function() {
            vm.addresses.push({ country: null, city: null, zipCode: null });
        };

        vm.removeAddress = function(address, validationIdx) {
            var index = vm.addresses.indexOf(address);
            if (index != undefined && index != null) {
                vm.addresses.splice(index, 1);
                vm.manufacturerValidation.address.splice(validationIdx, 1); //remove validation for the removed address
            }
        }

    });