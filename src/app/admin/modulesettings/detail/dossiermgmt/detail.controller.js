/**
 * Created by abenitrust on 4/5/17.
 */
'use strict';

angular.module('pdx.controllers')
    .controller('DossierDetailController', function($scope, ModuleSettingsFactory, $q, $filter, NotificationService) {
        var vm = this;
        vm.descriptionText = 'admin documents managment page';
        var currentSubmodule = undefined; //Holds the currently selected Module

        function loadData(submodule) {
            vm.subModuleID = angular.isDefined(submodule) ? submodule.id : 1; //If subModuleID is not de`fined ... by default use 1.
            vm.subModuleCode = angular.isDefined(submodule) ? submodule.submoduleCode : 'IPRM'; //if subModuleCode is not defined ... by default use IPRM;
            vm.sraAvailable = _.contains(['VMAJ', 'VMIN', 'NNM', 'NGWB', 'NGWOB', 'RREN'], vm.subModuleCode);

            vm.showButtons = false; //flag to show/hide action buttons ... activated when there is atleast one change on permission status
            vm.changedDocuments = []; //Holds those menus whose permission for the user has changed!
            vm.allDocuments = [];

            var allDocuments = ModuleSettingsFactory.documentsByDossier.query({ isDossier: true }).$promise;
            var moduleDocuments = ModuleSettingsFactory.moduleDocumentBySubModule.query({ id: vm.subModuleID, active: 'null', isDossier: true }).$promise;
            var sraOptions = ModuleSettingsFactory.sraOption;

            //Chain the promises together ... because data manipulation requires that both be resolved!
            $q.all([allDocuments, moduleDocuments]).then(function(results) {
                var all = $filter('filter')(results[0], { isSystemGenerated: false });
                vm.subModuleDocuments = results[1];

                _.each(all, function(doc) {
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

                vm.allDocuments = constructorHeirarchy(all);

            });
        }

        vm.sraAvailable = false;

        var broadCastListener = $scope.$on('ModuleSettings', function(event, subModule) {
            currentSubmodule = subModule; //update the current Module
            loadData(subModule);
        });

        if (angular.isUndefined(currentSubmodule)) {
            $scope.$emit('ModuleSettingsEmitted');
        }


        // declares that changes has been made. Therefore add changes to a list, and also show action buttons.
        vm.notify = function(changedDoc) {
            if (!vm.showButtons) {
                //If button is not already shown .... show it.
                vm.showButtons = true;
            }
            recursiveSetChildren(changedDoc, changedDoc);
            recursiveSetParent(changedDoc);
        };

        // Update the data
        vm.updateDocuments = function() {
            var updateModel = [];
            _.each(vm.changedDocuments, function(data) {
                updateModel.push(data.subModuleDocuments);
            })

            ModuleSettingsFactory.updateModuleDoc.save(updateModel, function() {
                loadData(currentSubmodule); //Load data of the current module
                vm.changedDocuments = [];
                vm.showButtons = false;
                NotificationService.notify('Settings successfully updated', 'alert-success');
            });
        };

        var constructorHeirarchy = function(files) {
            var nodes = {};
            return files.filter(function(obj) {
                var id = obj["id"],
                    parentId = obj["parentDocumentTypeID"];

                nodes[id] = _.defaults(obj, nodes[id], { children: [] });
                parentId && (nodes[parentId] = (nodes[parentId] || { children: [] }))["children"].push(obj);

                return !parentId;
            });
        };

        var recursiveSetChildren = function(node, parent) {
            //when there is no more child, push values to changedDcomentsList
            if (!_.contains(vm.changedDocuments, node)) {
                //the menu is not in changed list .. so add it.
                vm.changedDocuments.push(node);
            }
            node.subModuleDocuments.isActive = parent.subModuleDocuments.isActive;
            node.subModuleDocuments.isRequired = parent.subModuleDocuments.isRequired;
            // node.subModuleDocuments.isSra = parent.subModuleDocuments.isSra;
            //If there is child,prcceed deep down
            if (node.children && node.children.length > 0) {
                _.each(node.children, function(child) {
                    recursiveSetChildren(child, node);
                });
            }
        };

        var recursiveSetParent = function(changedDoc) {
            if (changedDoc.parentDocumentTypeID && (changedDoc.subModuleDocuments.isActive == true || changedDoc.subModuleDocuments.isRequired == true)) {
                var parent = _.find(vm.allDocuments, function(d) {
                    return d.id === changedDoc.parentDocumentTypeID;
                });

                if (parent) {
                    parent.subModuleDocuments.isActive = parent.subModuleDocuments.isActive || changedDoc.subModuleDocuments.isActive;
                    parent.subModuleDocuments.isRequired = parent.subModuleDocuments.isRequired || changedDoc.subModuleDocuments.isRequired;
                    if (!_.contains(vm.changedDocuments, parent)) {
                        //the menu is not in changed list .. so add it.
                        vm.changedDocuments.push(parent);
                    }
                    recursiveSetParent(parent);
                }
            }
        };

    });