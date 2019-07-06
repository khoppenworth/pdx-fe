/**
 * Created by abenitrust on 4/5/17.
 */
'use strict';

angular.module('pdx.controllers')
    .controller('ModuleSettingsController', function($scope, CommonService, $state, ModuleSettingsFactory,
        $filter, $ngConfirm, $stateParams, LookUpFactory) {
        var vm = this;
        var broadcaster;
        ModuleSettingsFactory.submodules.query(function(submodules) {
            // vm.moduleList=$filter('orderBy')(modules,'id');
            var grouped = _.groupBy(submodules, function(data) {
                return data.module.name;
            });
            var unorderedGroupedList = _.values(grouped);
            vm.groupedList = $filter('orderBy')(unorderedGroupedList, function(data) {
                return data[0].module.name;
            });
            vm.selectedModuleID = vm.groupedList[0][0].moduleID;
            vm.selectedSubModuleID = vm.groupedList[0][0].id;
            vm.selectedSubmodule = vm.groupedList[0][0];
        });
        vm.tabVisibility = {
            documents: ['IPRM', 'PIP', 'NMR', 'REN', 'VAR', 'MISC'],
            feeType: ['NMR', 'REN', 'VAR'],
            checklist: ['NMR', 'REN', 'VAR'],
            dossier: ['NMR', 'REN', 'VAR']
        };

        vm.selectedModuleID = 1;
        vm.selectedSubModuleID = 1;
        vm.selectedSubmodule = null;
        vm.activeTab = CommonService.checkUndefinedOrNull($stateParams.activeTab) ? $stateParams.activeTab : 0;

        vm.subModuleChanged = function(submodule) {
            vm.selectedSubmodule = submodule;
            vm.selectedModuleID = submodule.moduleID;
            vm.selectedSubModuleID = submodule.id;
            ModuleSettingsFactory.setSubmodule(submodule);
            broadcaster = $scope.$broadcast('ModuleSettings', submodule);
        };
        $scope.$on('ModuleSettingsEmitted', function() {
            vm.subModuleChanged(vm.selectedSubmodule);
        });
        vm.createNewDocumentValidation = {};
        vm.createNewFeeTypeValidation = {};
        vm.documentToBeAdded = {
            isSystemGenerated: false,
            name: undefined,
            description: undefined
        };
        vm.feeTypeToBeAdded = {
            name: undefined,
            currencyType: undefined
        };

        vm.setTabVisibility = function(array) {
            if (!vm.selectedSubmodule) {
                return false;
            }
            return _.contains(array, vm.selectedSubmodule.module.moduleCode);
        };

        vm.add = function() {
            switch (vm.activeTab) {
                case 0:
                    addNewDocument();
                    break;
                case 1:
                    addNewFeeType();
                    break;
                case 2:
                    addNewCheckList();
                    break;
                default:
                    addNewDocument();
            }
        };

        function addNewDocument() {
            $ngConfirm({
                title: 'Add Document',
                contentUrl: 'app/admin/modulesettings/detail/documentmgmt/add_document.html',
                columnClass: 'medium', // to make the width wider.
                animation: 'zoom',
                closeIcon: true,
                // type: 'btn-primary',
                scope: $scope,
                buttons: {
                    Add: {
                        title: "Add",
                        btnClass: "btn-primary",
                        action: function() {
                            vm.createNewDocumentValidation.$showError = true;
                            if (vm.createNewDocumentValidation.$isValid) {
                                vm.documentToBeAdded.parentDocumentTypeId = null;
                                vm.documentToBeAdded.isDossier = false;

                                ModuleSettingsFactory.documents.save({ id: '' }, vm.documentToBeAdded, function() {
                                    reloadCurrentState();
                                    return true;
                                });
                            } else {
                                return false;
                            }
                        }
                    }
                }
            });
        }

        function addNewCheckList() {
            $state.go('settings.checklist');
        }

        function addNewFeeType() {
            LookUpFactory.currency.query(function(data) {
                vm.currency = data;
                vm.feeTypeToBeAdded.currencyType = data[0];
            });
            $ngConfirm({
                title: 'Add Fee Type',
                contentUrl: 'app/admin/modulesettings/detail/feetypemgmt/add_feetype.html',
                columnClass: 'medium', // to make the width wider.
                animation: 'zoom',
                closeIcon: true,
                // type: 'btn-primary',
                scope: $scope,
                buttons: {
                    Add: {
                        title: "Add",
                        btnClass: "btn-primary",
                        action: function() {
                            vm.createNewFeeTypeValidation.$showError = true;
                            if (vm.createNewFeeTypeValidation.$isValid) {
                                var model = {
                                    name: vm.feeTypeToBeAdded.name,
                                    currencyID: vm.feeTypeToBeAdded.currencyType.id,
                                    isActive: true
                                };
                                LookUpFactory.feeType.save({ id: '' }, model, function() {
                                    reloadCurrentState();
                                    return true;
                                });
                            } else {
                                return false;
                            }
                        }
                    }
                }
            });
        }

        function reloadCurrentState() {
            //TODO: Perform this reload with $sate.reload. The idea is to reload the current state, but also pass the current active tab as param.
            $state.go($state.current, { activeTab: vm.activeTab }, { reload: true, inherit: false, notify: true })
        }


    });