(function(angular) {
    'use strict';

    angular.module('pdx.controllers')
        .controller('ChecklistController', function(AdminFactory, ChecklistFactory, $ngConfirm, $scope, NotificationService, ModuleSettingsFactory, $rootScope) {
            var vm = this;
            vm.dynamicPopover = {
                templateUrl: 'myPopoverTemplate.html',
                templateGroupUrl: 'myPopoverGroupTemplate.html',
                title: 'Title'
            };
            vm.subModuleChecklist = {};

            vm.newnode = { children: [] };
            vm.newnodeValidation = {};
            vm.toggle = _toggle;

            vm.newSubItem = _newChecklist;
            vm.editItem = _editItem;
            vm.remove = _removeChecklist;
            vm.filterChecklist = _filterChecklist;
            vm.saveChecklists = _saveChecklists;

            vm.mapChecklistWithSubModule = _mapChecklistWithSubModule;
            var prepareChecklist = _prepareChecklist;
            // default values
            var defaultChecklistTypeCode = 'PSCR';
            var defaultSubmoduleTypeCode = 'MDCN';


            init();

            function init() {
                vm.filterObject = {};
                //look ups
                vm.answerTypes = ChecklistFactory.AnswerType.query();
                vm.checklistTypes = ChecklistFactory.ChecklistType.query({},
                    function(data) {
                        vm.filterObject.checklistType = _.find(data, function(checklist) {
                            return checklist.checklistTypeCode === defaultChecklistTypeCode;
                        });
                    }
                );
                vm.optionGroups = ChecklistFactory.OptionGroup.query();
                vm.subModules = ModuleSettingsFactory.submodules.query();
                vm.submoduleTypes = AdminFactory.subModuleType.query({},
                    function(data) {
                        vm.filterObject.submoduleType = _.find(data, function(type) {
                            return type.submoduleTypeCode === defaultSubmoduleTypeCode;
                        });
                    }
                );

                getChecklists();
            }

            function getChecklists() {
                //checklist
                vm.list = ChecklistFactory.ChecklistBySubmoduleType.query({
                    checklistTypeCode: vm.filterObject.checklistType ? vm.filterObject.checklistType.checklistTypeCode : defaultChecklistTypeCode,
                    submoduleTypeCode: vm.filterObject.submoduleType ? vm.filterObject.submoduleType.submoduleTypeCode : defaultSubmoduleTypeCode
                }, function(data) {
                    $scope.$broadcast('angular-ui-tree:collapse-all');
                    return data;
                });
            }

            function _filterChecklist() {
                getChecklists();
            }

            function _toggle(scope) {
                scope.label = "oi0";
                scope.toggle();
            }

            function _removeChecklist(node) {
                $ngConfirm({
                    title: "Delete Checklist",
                    contentUrl: 'app/admin/checklistmgmt/modals/checklistDelete.html',
                    type: "red",
                    typeAnimated: true,
                    closeIcon: true,
                    scope: $scope,
                    columnClass: 'col-md-6 col-md-offset-3',
                    buttons: {
                        update: {
                            text: "Ok",
                            btnClass: "btn-danger",
                            action: function() {
                                var nodeData = node.$modelValue;
                                nodeData.isActive = false;
                                ChecklistFactory.ChecklistInsertOrUpdate.save(nodeData, function() {
                                    NotificationService.notify("Successfully saved!", "alert-success");
                                    vm.list = ChecklistFactory.Checklist.query();
                                }, function() {
                                    NotificationService.notify("Unable to save data. Please try again!", "alert-danger");
                                });
                            }
                        }
                    }
                });
            }

            function _newChecklist(node) {
                vm.newnode = { children: [] };
                $ngConfirm({
                    title: "Add Checklist",
                    contentUrl: 'app/admin/checklistmgmt/modals/checklistAdd.html',
                    type: "green",
                    typeAnimated: true,
                    closeIcon: true,
                    scope: $scope,
                    columnClass: 'col-md-6 col-md-offset-3',
                    buttons: {
                        update: {
                            text: "Save",
                            btnClass: "btn-primary",
                            action: function() {
                                vm.newnodeValidation.$showError = true;
                                if (vm.newnodeValidation.$isValid) {
                                    prepareChecklist();
                                    if (node == null) {
                                        vm.newnode.depth = 0;
                                        vm.list.push(vm.newnode);
                                        vm.newnodeValidation.$showError = false;
                                    } else {
                                        var nodeData = node.$modelValue;
                                        vm.newnode.depth = nodeData.depth + 1;
                                        nodeData.children.push(vm.newnode);
                                        vm.newnodeValidation.$showError = false;
                                    }
                                    vm.newnode = { children: [] };
                                    $scope.$apply();
                                } else {
                                    return false;
                                }
                            }
                        }
                    }
                });
            }

            function _editItem(node) {
                vm.newnode = node.$modelValue;
                $ngConfirm({
                    title: "Add Checklist",
                    contentUrl: 'app/admin/checklistmgmt/modals/checklistAdd.html',
                    type: "green",
                    typeAnimated: true,
                    closeIcon: true,
                    scope: $scope,
                    columnClass: 'col-md-6 col-md-offset-3',
                    buttons: {
                        update: {
                            text: "Save",
                            btnClass: "btn-primary",
                            action: function() {
                                vm.newnodeValidation.$showError = true;
                                if (vm.newnodeValidation.$isValid) {
                                    prepareChecklist();
                                    $scope.$apply();
                                    vm.newnodeValidation.$showError = false;
                                } else {
                                    return false;
                                }
                            }
                        }
                    }
                });
            }

            function _saveChecklists() {
                ChecklistFactory.ChecklistInsertOrUpdate.save(vm.list, function() {
                    NotificationService.notify("Successfully saved!", "alert-success");
                    getChecklists();
                }, function() {
                    NotificationService.notify("Unable to save data. Please try again!", "alert-danger");
                });
            }

            function _mapChecklistWithSubModule(node) {
                vm.subModuleChecklist.checklistID = node.id;
                vm.subModuleChecklist.checklist = node;
                ChecklistFactory.SubModuleChecklist.save(vm.subModuleChecklist, function() {
                    NotificationService.notify("Successfully saved!", "alert-success");
                    //vm.list = ChecklistFactory.Checklist.query();
                }, function() {
                    NotificationService.notify("Unable to save data. Please try again!", "alert-danger");
                });
            }

            function _prepareChecklist() {
                vm.newnode.checklistTypeID = vm.newnode.checklistType.id;
                vm.newnode.answerTypeID = vm.newnode.answerType != null ? vm.newnode.answerType.id : null;
                vm.newnode.optionGroupID = vm.newnode.optionGroup != null ? vm.newnode.optionGroup.id : null;
                vm.newnode.submoduleType = vm.filterObject.submoduleType;
                vm.newnode.SubmoduleTypeID = vm.newnode.submoduleType.id;
            }


        });
})(window.angular);