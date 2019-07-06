/**
 * Created by abenitrust on 4/5/17.
 */
'use strict';

angular.module('pdx.controllers')
    .controller('DocumentDetailController', function($scope, ModuleSettingsFactory, $q, $filter, NotificationService) {
        var vm = this;
        vm.descriptionText = 'admin documents managment page';
        var currentSubmodule = undefined; //Holds the currently selected Module


        function loadData(submodule) {
            vm.subModuleID = angular.isDefined(submodule) ? submodule.id : 1; //If subModuleID is not de`fined ... by default use 1.
            vm.subModuleCode = angular.isDefined(submodule) ? submodule.submoduleCode : 'IPRM'; //if subModuleCode is not defined ... by default use IPRM;
            vm.sraAvailable = _.contains(['VMAJ', 'VMIN', 'NNM', 'NGWB', 'NGWOB', 'RREN'], vm.subModuleCode);

            vm.showButtons = false; //flag to show/hide action buttons ... activated when there is atleast one change on permission status
            vm.changedDocuments = []; //Holds those menus whose permission for the user has changed!


            var allDocuments = ModuleSettingsFactory.documentsByDossier.query({ isDossier: false }).$promise;
            var moduleDocuments = ModuleSettingsFactory.moduleDocumentBySubModule.query({ id: vm.subModuleID, active: 'null', isDossier: false }).$promise;
            var sraOptions = ModuleSettingsFactory.sraOption;

            //Chain the promises together ... because data manipulation requires that both be resolved!
            $q.all([allDocuments, moduleDocuments]).then(function(results) {
                vm.allDocuments = $filter('filter')(results[0], { isSystemGenerated: false });
                vm.subModuleDocuments = results[1];

                _.each(vm.allDocuments, function(doc) {
                    doc.sraOptions = angular.copy(sraOptions);
                    var currentSubmoduleDocument = _.find(vm.subModuleDocuments, function(mDoc) {
                        return mDoc.documentTypeID === doc.id;
                    });
                    if (angular.isObject(currentSubmoduleDocument)) {
                        var docModel = {
                            "submoduleID": vm.subModuleID,
                            "documentTypeID": doc.id,
                            "isRequired": currentSubmoduleDocument.isRequired,
                            "isActive": currentSubmoduleDocument.isActive,
                            "id": currentSubmoduleDocument.id,
                            'isSra': currentSubmoduleDocument.isSRA
                        };
                        doc.subModuleDocuments = docModel;
                    } else {
                        docModel = {
                            "submoduleID": vm.subModuleID,
                            "documentTypeID": doc.id,
                            "isRequired": false,
                            "isActive": false,
                            'isSra': null
                        };
                        doc.subModuleDocuments = docModel;
                    }

                });

            });
        }

        vm.sraAvailable = false;

        var broadCastListener = $scope.$on('ModuleSettings', function(event, subModule) {
            currentSubmodule = subModule; //update the current Module
            loadData(subModule);
        });

        loadData();


        // declares that changes has been made. Therefore add changes to a list, and also show action buttons.
        vm.notify = function(changedDoc) {
            if (!vm.showButtons) {
                //If button is not already shown .... show it.
                vm.showButtons = true;
            }
            if (vm.changedDocuments.indexOf(changedDoc) === -1) {
                //the menu is not in changed list .. so add it.
                vm.changedDocuments.push(changedDoc);
            }
        };

        // Update the data
        vm.updateDocuments = function() {
            var updateModel = [];
            _.each(vm.changedDocuments, function(data) {
                updateModel.push(data.subModuleDocuments);
            });

            ModuleSettingsFactory.updateModuleDoc.save(updateModel, function() {
                loadData(currentSubmodule); //Load data of the current module
                vm.changedDocuments = [];
                vm.showButtons = false;
                NotificationService.notify('Settings successfully updated', 'alert-success');
            });
        };




    });