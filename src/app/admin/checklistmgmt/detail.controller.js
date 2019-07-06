/**
 * Created by abenitrust on 4/5/17.
 */
(function(angular) {
    'use strict';

    angular.module('pdx.controllers')
        .controller('ChecklistDetailController', function($scope, NotificationService, ChecklistFactory, $ngConfirm, ModuleSettingsFactory) {
            var vm = this;
            var currentSubmodule = undefined; //Holds the currently selected Module
            loadData(ModuleSettingsFactory.getSubmodule());

            function loadData(submodule) {
                vm.subModuleID = angular.isDefined(submodule) ? submodule.id : 1; //If subModuleID is not de`fined ... by default use 1.
                vm.subModuleCode = angular.isDefined(submodule) ? submodule.submoduleCode : ''; //if subModuleCode is not defined ... by default use IPRM;

                vm.submoduleCheckList = ChecklistFactory.ChecklistBySubmodule.query({ submoduleCode: vm.subModuleCode, checklistTypeCode: "null", isSra: "null" }, function(data) {
                    return data;
                });
            }

            var broadCastListener = $scope.$on('ModuleSettings', function(event, subModule) {
                currentSubmodule = subModule; //update the current Module
                loadData(subModule);
            });

            vm.deleteSubmodule = function(checklist) {
                $ngConfirm({
                    title: "Remove Checklist from Module",
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
                                var checklistSubmodule = {
                                    checklist: checklist,
                                    checklistID: checklist.id,
                                    submoduleID: vm.subModuleID
                                };

                                ChecklistFactory.DeleteSubModuleChecklist.save(checklistSubmodule, function() {
                                    NotificationService.notify("Successfully saved!", "alert-success");
                                    checklist.deleted = true;
                                }, function() {
                                    NotificationService.notify("Unable to save data. Please try again!", "alert-danger");
                                });
                            }
                        }
                    }
                });

            };

        });
})(window.angular);