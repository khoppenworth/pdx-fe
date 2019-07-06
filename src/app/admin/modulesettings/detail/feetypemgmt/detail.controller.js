/**
 * Created by abenitrust on 4/5/17.
 */
'use strict';

angular.module('pdx.controllers')
    .controller('FeeTypeDetailController', function($scope, LookUpFactory,
        ModuleSettingsFactory, $q, NotificationService) {
        var vm = this;
        var currentSubmodule = undefined; //Holds the currently selected Module

        function loadData(submodule) {
            vm.subModuleID = angular.isDefined(submodule) ? submodule.id : 1; //If subModuleID is not de`fined ... by default use 1.
            vm.subModuleCode = angular.isDefined(submodule) ? submodule.submoduleCode : 'IPRM'; //if subModuleCode is not defined ... by default use IPRM;

            vm.showButtons = false; //flag to show/hide action buttons ... activated when there is atleast one change on permission status
            vm.changedFeeTypes = []; //Holds those menus whose permission for the user has changed!


            var allFeeTypes = LookUpFactory.feeType.query().$promise;
            var moduleFeeTypes = ModuleSettingsFactory.submoduleFeeTypes.query({ id: vm.subModuleID, active: 12 }).$promise;

            //Chain the promises together ... because data manipulation requires that both be resolved!
            $q.all([allFeeTypes, moduleFeeTypes]).then(function(results) {
                vm.allFeeTypes = results[0];
                vm.submoduleFeeTypes = results[1];

                _.each(vm.allFeeTypes, function(FeeType) {
                    var currentSubmoduleFeeType = _.find(vm.submoduleFeeTypes, function(mFeeType) {
                        return mFeeType.feeTypeID === FeeType.id;
                    });
                    if (angular.isObject(currentSubmoduleFeeType)) {
                        var feeTypeModel = {
                            "submoduleID": vm.subModuleID,
                            "isActive": currentSubmoduleFeeType.isActive,
                            "fee": currentSubmoduleFeeType.fee,
                            "id": currentSubmoduleFeeType.id,
                            "feeTypeID": FeeType.id
                        };
                        FeeType.submoduleFeeTypes = feeTypeModel;
                    } else {
                        feeTypeModel = {
                            "submoduleID": vm.subModuleID,
                            "isActive": false,
                            "feeTypeID": FeeType.id
                        };
                        FeeType.submoduleFeeTypes = feeTypeModel;
                    }

                });

            });
        }

        var broadCastListener = $scope.$on('ModuleSettings', function(event, subModule) {
            currentSubmodule = subModule; //update the current Module
            loadData(subModule);
        })

        loadData();


        // declares that changes has been made. Therefore add changes to a list, and also show action buttons.
        vm.notify = function(changed) {
            if (!vm.showButtons) {
                //If button is not already shown .... show it.
                vm.showButtons = true;
            }
            if (vm.changedFeeTypes.indexOf(changed) === -1) {
                //data is not in the changed list .. so add it.
                vm.changedFeeTypes.push(changed);
            }
        };

        // Update the data
        vm.updateSubmoduleFeeType = function() {
            var updateModel = [];
            _.each(vm.changedFeeTypes, function(data) {
                updateModel.push(data.submoduleFeeTypes);
            })

            ModuleSettingsFactory.insertOrUpdateSubmoduleFeeType.save(updateModel, function() {
                loadData(currentSubmodule); //Load data of the current module
                vm.changedFeeTypes = [];
                vm.showButtons = false;
                NotificationService.notify('Settings successfully updated', 'alert-success');
            })
        };

    });