'use strict';

angular.module('pdx.controllers')
    .controller('PipDetailController', function(ImportPermitFactory, $state, $stateParams, $uibModal,
        $http, $sce, AppConst, CommonService, $ngConfirm, $scope, StorageService, AgentFactory, NotificationService,
        SupplierFactory, AccountService, ModuleSettingsFactory, $filter, $window, PIPConst) {
        var vm = this;

        vm.CONSTANT = PIPConst;

        vm.showHistory = false;
        vm.userInfo = AccountService.userInfo();


        vm.commodityType = {};
        vm.importPermit = ImportPermitFactory.importPermit.get({
            id: $stateParams.pipId
        }, function(data) {
            vm.agent = AgentFactory.agent.get({ id: data.agentID }, function(agent) {
                vm.module = ModuleSettingsFactory.moduleByCode.get({ code: AppConst.Modules.PreImportPermit }, function(mod) {
                    vm.commodityTypes = ModuleSettingsFactory.subModuleByModule.query({
                        id: mod.id
                    }, function(data) {
                        vm.commodityType.selected = $filter("filter")(data, { submoduleCode: agent.agentType.agentTypeCode })[0];
                        vm.ipermitStatusModel.submoduleCode = vm.commodityType.selected.submoduleCode;
                    });
                });
                vm.moduleDocuments = ImportPermitFactory.submoduleAttachment.query({
                    submoduleCode: agent.agentType.agentTypeCode,
                    referenceId: $stateParams.pipId
                });

                return agent;
            });

            vm.supplier = SupplierFactory.supplier.get({ id: data.supplierID });
            vm.agentSupplier = SupplierFactory.supplierByAgent.get({ supplierID: data.supplierID, agentID: data.agentID })
            vm.showCreatePermission = vm.userInfo.id == data.createdByUserID ? true : false;
            return data;
        });

        vm.openFileModal = function(document) {
            $http.post(CommonService.buildUrlObj(AppConst.API_URL.Attachment.AttachmentSingleByPermission, {
                    id: document.id,
                    userId: vm.userInfo.id,
                    permission: 'PIPPrint'
                }), {}, {
                    responseType: 'arraybuffer'
                })
                .success(function(response) {
                    var file = new Blob([response], {
                        type: document.fileType
                    });
                    var fileURL = URL.createObjectURL(file);
                    document.fileContent = $sce.trustAsResourceUrl(fileURL);
                });

            //Open modal
            $uibModal.open({
                templateUrl: "app/importPermit/list/modals/fileModal.html",
                size: 'lg',
                resolve: {
                    document: document
                },
                controller: function($scope, document) {
                    $scope.document = document;
                }
            });
        }

        vm.downloadAttachment = function(idocument) {
            var a = document.createElement("a");
            document.body.appendChild(a);
            $http.post(CommonService.buildUrlObj(AppConst.API_URL.Attachment.AttachmentSingleByPermission, {
                    id: idocument.id,
                    userId: vm.userInfo.id,
                    permission: 'PIPPrint'
                }), {}, {
                    responseType: 'arraybuffer'
                })
                .success(function(response) {
                    var file = new Blob([response], {
                        type: idocument.fileType
                    });
                    vm.fileURL = URL.createObjectURL(file);
                    vm.fileContent = $sce.trustAsResourceUrl(vm.fileURL);
                    a.href = vm.fileContent;
                    a.download = idocument.moduleDocument.documentType.name;
                    a.click();
                })
        };

        vm.printAttachment = function(doc) {
            $http.post(CommonService.buildUrl(AppConst.API_URL.Attachment.AttachmentDownload, doc.id), {}, {
                responseType: 'arraybuffer'
            }).success(function(data, status, headers, config) {
                var pdfFile = new Blob([data], {
                    type: doc.fileType
                });
                var pdfUrl = URL.createObjectURL(pdfFile);
                var fileContent = $sce.trustAsResourceUrl(pdfUrl);
                var printwWindow = $window.open(fileContent, '_blank');
                printwWindow.print();
            }).error(function(data, status, headers, config) {
                alert('Sorry, something went wrong')
            });
        };

        vm.ipermitHistory = [];
        vm.showHistoryTimeLine = function() {
            vm.showHistory = !vm.showHistory;
            vm.ipermitHistory = ImportPermitFactory.history.query({
                ipermitId: $stateParams.pipId,
                isAgent: vm.userInfo.isAgent
            });
        }
        vm.ipermitHistory = ImportPermitFactory.history.query({
            ipermitId: $stateParams.pipId,
            isAgent: vm.userInfo.isAgent
        });

        ///Change Status Modals
        vm.ipermitStatusModel = {
            ID: $stateParams.pipId,
            ChangedBy: StorageService.get(AppConst.StorageKeys.UserInfo).id
        }
        vm.updateStatusLogValidation = {}

        //call update
        vm.editIPermit = function() {
            $state.go('pip.update', { pipId: $stateParams.pipId });
        };

        //WorkFlow functions
        vm.RequestIPermit = function() {
            if (vm.importPermit.importPermitStatus.importPermitStatusCode == 'RTA') {
                ManageWorkFlow("Submit Import Permit", 'green', "Submit", 'btn-primary', vm.requestIPermit);
            } else vm.requestIPermit();
        }

        vm.requestIPermit = function() {
            ImportPermitFactory.submitImportPermit.save(vm.ipermitStatusModel, function(data) {
                if (data) {
                    $state.reload();
                    NotificationService.notify("Successfully Requested", 'alert-success');
                }
                vm.ipermitStatusModel.Comment = undefined;
                vm.updateStatusLogValidation.$showError = false;
            });
        }

        vm.WithdrawIPermit = function() {
            ManageWorkFlow("Withdraw Pre Import Permit", 'orange', "Withdraw", 'btn-warning', vm.withdrawIPermit);
        }
        vm.withdrawIPermit = function() {
            ImportPermitFactory.withdrawImportPermit.save(vm.ipermitStatusModel, function(data) {
                if (data) {
                    vm.importPermit = ImportPermitFactory.importPermit.get({
                        id: $stateParams.pipId
                    });
                    vm.ipermitHistory = ImportPermitFactory.history.query({
                        ipermitId: $stateParams.pipId
                    });
                    NotificationService.notify("Successfully Withdrawn", 'alert-success');
                }
                vm.ipermitStatusModel.Comment = undefined;
                vm.updateStatusLogValidation.$showError = false;
            });
        }
        vm.SubmitIPermitForApproval = function() {
            ManageWorkFlow("Submit for Approval", 'green', "Submit", 'btn-primary', vm.submitForApproval);
        }
        vm.submitForApproval = function() {
            ImportPermitFactory.submitImportPermitForApproval.save(vm.ipermitStatusModel, function(data) {
                if (data) {
                    vm.importPermit = ImportPermitFactory.importPermit.get({
                        id: $stateParams.pipId
                    });
                    vm.ipermitHistory = ImportPermitFactory.history.query({
                        ipermitId: $stateParams.pipId
                    });
                    NotificationService.notify("Successfully Submitted", 'alert-success');
                }
                vm.ipermitStatusModel.Comment = undefined;
                vm.updateStatusLogValidation.$showError = false;
            });
        }

        vm.SubmitIPermitForRejection = function() {
            ManageWorkFlow("Submit for Rejection", 'red', "Submit", 'btn-danger', vm.submitForRejection);
        }
        vm.submitForRejection = function() {
            ImportPermitFactory.submitImportPermitForRejection.save(vm.ipermitStatusModel, function(data) {
                if (data) {
                    vm.importPermit = ImportPermitFactory.importPermit.get({
                        id: $stateParams.pipId
                    });
                    vm.ipermitHistory = ImportPermitFactory.history.query({
                        ipermitId: $stateParams.pipId
                    });
                    NotificationService.notify("Successfully Submitted", 'alert-success');
                }
                vm.ipermitStatusModel.Comment = undefined;
                vm.updateStatusLogValidation.$showError = false;
            });
        }

        vm.ReturnIPermitToAgent = function() {
            ManageWorkFlow("Return to Applicant", 'orange', "Return", 'btn-warning', vm.returnToAgent);
        }
        vm.returnToAgent = function() {
            ImportPermitFactory.returnImportPermitToAgent.save(vm.ipermitStatusModel, function(data) {
                if (data) {
                    vm.importPermit = ImportPermitFactory.importPermit.get({
                        id: $stateParams.pipId
                    });
                    vm.ipermitHistory = ImportPermitFactory.history.query({
                        ipermitId: $stateParams.pipId
                    });
                    NotificationService.notify("Successfully Returned", 'alert-success');
                }
                vm.ipermitStatusModel.Comment = undefined;
                vm.updateStatusLogValidation.$showError = false;
            });
        }

        vm.ReturnIPermitToCSO = function() {
            ManageWorkFlow("Return to CSO", 'orange', "Return", 'btn-warning', vm.returnToCSO);
        }
        vm.returnToCSO = function() {
            ImportPermitFactory.returnImportPermitToCSO.save(vm.ipermitStatusModel, function(data) {
                if (data) {
                    vm.importPermit = ImportPermitFactory.importPermit.get({
                        id: $stateParams.pipId
                    });
                    vm.ipermitHistory = ImportPermitFactory.history.query({
                        ipermitId: $stateParams.pipId
                    });

                    NotificationService.notify("Successfully Returned", 'alert-success');
                }
                vm.ipermitStatusModel.Comment = undefined;
                vm.updateStatusLogValidation.$showError = false;
            });
        }
        vm.ApproveIPermit = function() {
            ManageWorkFlow("Approve", 'green', "Approve", 'btn-primary', vm.approve);
        }
        vm.approve = function() {
            ImportPermitFactory.approveImportPermit.save(vm.ipermitStatusModel, function(data) {
                if (data) {
                    $state.reload();
                    NotificationService.notify("Successfully Approved", 'alert-success');
                }
                vm.ipermitStatusModel.Comment = undefined;
                vm.updateStatusLogValidation.$showError = false;
            });
        }

        vm.RejectIPermit = function() {
            ManageWorkFlow("Reject", 'red', "Reject", 'btn-danger', vm.reject);
        }
        vm.reject = function() {
            ImportPermitFactory.rejectImportPermit.save(vm.ipermitStatusModel, function(data) {
                if (data) {
                    $state.reload();
                    NotificationService.notify("Successfully Rejected", 'alert-success');
                }
                vm.ipermitStatusModel.Comment = undefined;
                vm.updateStatusLogValidation.$showError = false;
            });
        }

        var voidIpermit = function() {
            ImportPermitFactory.voidImportPermit.save(vm.ipermitStatusModel, function(data) {
                if (data) {
                    $state.reload();
                    NotificationService.notify("Void was successful!", 'alert-success');
                }
                vm.ipermitStatusModel.Comment = undefined;
                vm.updateStatusLogValidation.$showError = false;
            });
        }

        vm.VoidIPermit = function() {
            ManageWorkFlow("Void", 'red', "Void", 'btn-danger', voidIpermit);
        }

        function ManageWorkFlow(title, type, buttonText, btnClass, functionCall) {
            $ngConfirm({
                title: title,
                contentUrl: 'app/importPermit/list/modals/changeIPermitStatus.html',
                type: type,
                typeAnimated: true,
                closeIcon: true,
                scope: $scope,
                columnClass: 'col-md-6 col-md-offset-3',
                buttons: {
                    update: {
                        text: buttonText,
                        btnClass: btnClass,
                        action: function() {
                            vm.updateStatusLogValidation.$showError = true;
                            if (vm.updateStatusLogValidation.$isValid) {
                                vm.ipermitStatusModel.ID = vm.importPermit.id;
                                functionCall();
                            } else {
                                return false;
                            }
                        }
                    }
                }
            });
        }

    });
