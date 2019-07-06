'use strict';

angular.module('pdx.controllers')
    .controller('ImportPermitDetailController', function(ImportPermitFactory, $state, $stateParams, $uibModal,
        $http, $sce, AppConst, CommonService, $document, $ngConfirm, $scope, StorageService, AgentFactory, NotificationService, SupplierFactory,
        AccountService, blockUI, ImportPermitService, $window) {
        var vm = this;
        vm.showHistory = false;
        vm.userInfo = AccountService.userInfo();

        vm.commodityType = {};
        vm.ipermitHistory = [];
        vm.updateStatusLogValidation = {};
        vm.showHistoryTimeLine = _showHistoryTimeLine;
        vm.importPermit = ImportPermitFactory.importPermit.get({
            id: $stateParams.ipermitId
        }, function(data) {
            vm.agent = AgentFactory.agent.get({ id: data.agentID }, function(agent) {
                return agent;
            });
            vm.supplier = SupplierFactory.supplier.get({ id: data.supplierID });
            vm.agentSupplier = SupplierFactory.supplierByAgent.get({ supplierID: data.supplierID, agentID: data.agentID })
            vm.showCreatePermission = vm.userInfo.id == data.createdByUserID ? true : false;
            vm.moduleDocuments = ImportPermitFactory.submoduleAttachment.query({
                submoduleCode: data.submodule.submoduleCode,
                referenceId: $stateParams.ipermitId
            });

            ///Change Status Modals
            vm.ipermitStatusModel = {
                ID: $stateParams.ipermitId,
                ChangedBy: StorageService.get(AppConst.StorageKeys.UserInfo).id,
                submoduleCode: data.submodule.submoduleCode
            };

            return data;
        });

        vm.openFileModal = function(document) {
            $http.post(CommonService.buildUrlObj(AppConst.API_URL.Attachment.AttachmentSingleByPermission, {
                    id: document.id,
                    userId: vm.userInfo.id,
                    permission: 'IPPrint'
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
                    permission: 'IPPrint'
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
                });

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



        function _showHistoryTimeLine() {
            vm.showHistory = !vm.showHistory;
            vm.ipermitHistory = ImportPermitFactory.history.query({
                ipermitId: $stateParams.ipermitId,
                isAgent: vm.userInfo.isAgent
            });
        }
        vm.ipermitHistory = ImportPermitFactory.history.query({
            ipermitId: $stateParams.ipermitId,
            isAgent: vm.userInfo.isAgent
        });




        //call update
        vm.editIPermit = function() {
            $state.go('ipermit.update', { ipermitId: $stateParams.ipermitId });
        };

        //WorkFlow functions

        vm.RequestIPermit = function() {
            if (vm.importPermit.importPermitStatus.importPermitStatusCode == 'RTA') {
                ManageWorkFlow("Submit Import Permit", 'green', "Submit", 'btn-primary', vm.requestIPermit);
            } else vm.requestIPermit();
        }

        vm.requestIPermit = function() {
            ImportPermitService.autoGenerateForRequestedImportPermit({ importPermit: vm.importPermit }, blockUI);
        };

        vm.WithdrawIPermit = function() {
            ManageWorkFlow("Withdraw Import Permit", 'orange', "Withdraw", 'btn-warning', vm.withdrawIPermit);
        }
        vm.withdrawIPermit = function() {
            ImportPermitFactory.withdrawImportPermit.save(vm.ipermitStatusModel, function(data) {
                if (data) {
                    vm.importPermit = ImportPermitFactory.importPermit.get({
                        id: $stateParams.ipermitId
                    });
                    vm.ipermitHistory = ImportPermitFactory.history.query({
                        ipermitId: $stateParams.ipermitId
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
                        id: $stateParams.ipermitId
                    });
                    vm.ipermitHistory = ImportPermitFactory.history.query({
                        ipermitId: $stateParams.ipermitId
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
                        id: $stateParams.ipermitId
                    });
                    vm.ipermitHistory = ImportPermitFactory.history.query({
                        ipermitId: $stateParams.ipermitId
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
                        id: $stateParams.ipermitId
                    });
                    vm.ipermitHistory = ImportPermitFactory.history.query({
                        ipermitId: $stateParams.ipermitId
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
                        id: $stateParams.ipermitId
                    });
                    vm.ipermitHistory = ImportPermitFactory.history.query({
                        ipermitId: $stateParams.ipermitId
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