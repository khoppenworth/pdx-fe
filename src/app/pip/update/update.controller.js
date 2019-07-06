'use strict';

angular.module('pdx.controllers')
    .controller('PipUpdateController', function(LookUpFactory, CommodityFactory, ImportPermitFactory, ProcurementHelper,
        AppConst, CommonService, AgentFactory, $state, $stateParams, $uibModal, $http, $sce, $filter,
        NotificationService, AccountService, SupplierFactory, ModuleSettingsFactory, PipFactory, $scope, blockUI, $ngConfirm, PIPConst) {
        var vm = this;
        var importPermit;
        $state.go('pip.update.header', { pipId: $stateParams.pipId });

        vm.CONSTANT = PIPConst;

        //initialize import permit
        vm.importPermit = {
            importPermit: {},
            documents: [],
            uploadedDocuments: []
        };

        vm.user = AccountService.userInfo();
        //Look ups
        vm.importPermits = [];
        vm.agents = [];
        vm.agent = {};
        vm.suppliers = [];
        vm.supplier = {};
        vm.getSuppliers = function() {
            SupplierFactory.supplier.query(function(data) {
                vm.suppliers = data;
            });
        }
        vm.getSuppliers();
        vm.commodityType = {};

        vm.addNewProduct = _addNewProduct;
        vm.onProductAddFinished = _onProductAddFinished;

        vm.module = ModuleSettingsFactory.moduleByCode.get({ code: AppConst.Modules.PreImportPermit }, function(data) {
            vm.commodityTypes = ModuleSettingsFactory.subModuleByModule.query({ id: data.id }, function(data) {
                //vm.commodityType.selected = $filter("filter")(data, { submoduleCode: "MED" })[0];
                return data;
            });
            return data
        })


        vm.agent.selected = {};

        vm.currencies = LookUpFactory.currency.query();
        LookUpFactory.portofentry.query(function(data) {
            vm.ports = data;
            vm.importPermit.importPermit.portOfEntry = $filter("filter")(vm.ports, { portCode: "AAB" })[0];
        });
        LookUpFactory.paymentmode.query(function(data) {
            vm.paymentmodes = data;
            vm.importPermit.importPermit.paymentMode = $filter("filter")(vm.paymentmodes, { paymentCode: "LC" })[0]
        });
        vm.shippingmethod = {};
        vm.importPermitDeliveries = LookUpFactory.importPermitDelivery.query();
        vm.importPermitDelivery = {};
        vm.importPermit.importPermit.deliverySelected = {};
        vm.product = {};
        vm.products = [];
        vm.importPermitDetail = [];
        vm.manufacturers = [];



        vm.listOfSubModuleTypes = [];
        vm.subModuleType = { selected: null };
        PipFactory.getSubmoduleTypes(vm);

        ImportPermitFactory.importPermitSingle.get({ id: $stateParams.pipId }, function(data) {
            SupplierFactory.supplier.get({ id: data.importPermit.supplierID }, function(supplier) {
                vm.supplier.selected = supplier;
            });
            AgentFactory.agent.get({
                id: data.importPermit.agentID
            }, function(agent) {
                vm.agent.selected = agent;

                vm.module = ModuleSettingsFactory.moduleByCode.get({ code: AppConst.Modules.PreImportPermit }, function(data) {
                    vm.commodityTypes = ModuleSettingsFactory.subModuleByModule.query({ id: data.id }, function(data) {
                        vm.commodityType.selected = $filter("filter")(data, { submoduleCode: agent.agentType.agentTypeCode })[0];
                        vm.getDocuments();
                        return data;
                    });
                    return data
                })
            });
            vm.importPermit = data;
            vm.showHeaderDiscount = vm.importPermit.importPermit.discount != 0 && vm.importPermit.importPermit.discount !== null && vm.importPermit.importPermit.discount !== undefined ? true : false;
            vm.importPermit.importPermit.commoditytypeid = 1;
            vm.importPermit.importPermit.deliverySelected = $filter("filter")(vm.importPermitDeliveries, { name: data.importPermit.delivery })[0] == undefined ?
                new LookUpFactory.importPermitDelivery({ name: data.importPermit.delivery }) : $filter("filter")(vm.importPermitDeliveries, { name: data.importPermit.delivery })[0]
            vm.onDeliverySelected(vm.importPermit.importPermit.deliverySelected);

            vm.importPermitDetail = data.importPermit.importPermitDetails;
            _.each(vm.importPermitDetail, function(pod) {
                if (pod.discount == true || pod.discount > 0) {
                    vm.showDetailDiscount = true;
                }
                CommodityFactory.productManufacturerAddress.query({ id: pod.productID }, function(data) {
                    pod.manufacturers = data;
                    pod.product.manufacturer = $filter("filter")(pod.manufacturers, { id: pod.manufacturerAddressID })[0];
                });

                // MEDICAL DEVICE
                if (pod.mdDevicePresentationID) {
                    CommodityFactory.productDevicePresentation.query({ mdDevicePresentationID: pod.mdDevicePresentationID }, function(data) {
                        pod.product.mdDevicePresentations = data;
                        pod.product.mdDevicePresentation = $filter("filter")(pod.product.mdDevicePresentations, { id: pod.mdDevicePresentationID })[0];
                    });
                }
            });

            LookUpFactory.shippingmethod.query(function(data) {
                vm.shippingmethods = data;
                vm.onShippingMethodSelected();
            });

            vm.subModuleType.selected = $filter("filter")(vm.listOfSubModuleTypes, { submoduleTypeCode: vm.importPermit.importPermit.submoduleTypeCode })[0];
        });

        vm.searchProducts = function(keyWords) {
            PipFactory.searchProducts(vm, keyWords);
        };


        vm.resetImportPermit = function() {
            vm.importPermit = {
                importPermit: { commoditytypeid: 1 },
                documents: [],
                uploadedDocuments: []
            };
            vm.importPermitValidation = { header: {}, detail: [], attachment: {} };
        };

        vm.resetImportPermit();


        ///state transition
        vm.headerToDetail = function() {
            vm.importPermitValidation.header.$showError = true;
            ProcurementHelper.checkDuplicateProforma(vm.importPermit.importPermit.performaInvoiceNumber, vm.supplier.selected, vm.agent.selected, vm.importPermit.importPermit.id)
                .then(function(response) {
                    vm.duplicatePerformaInvoice = response;
                    if (response) {
                        NotificationService.notify("There is an active application by this invoice number under " + vm.supplier.selected.name, 'alert-danger');
                    }
                    if (vm.importPermitValidation.header.$isValid && !vm.duplicatePerformaInvoice) {
                        $state.go('pip.update.detail', { pipId: $stateParams.pipId });
                    } else return;
                }, function(error) {
                    vm.duplicatePerformaInvoice = false;
                    if (vm.importPermitValidation.header.$isValid && !vm.duplicatePerformaInvoice) {
                        $state.go('pip.update.detail', { pipId: $stateParams.pipId });
                    } else return;
                })
        };

        vm.backToHeader = function() {
            $state.go('pip.update.header', { pipId: $stateParams.pipId });
        }

        vm.detailToAttachment = function() {

            vm.importPermitValidation.detail.$showError = true;
            if (vm.importPermitValidation.detail.$isValid) {
                var totalDiscountValidation = ProcurementHelper.validateTotalDiscount(vm.importPermitDetail, vm.importPermit.importPermit.freightCost, vm.importPermit.importPermit.discount, vm.showHeaderDiscount)

                if (totalDiscountValidation.status) {
                    //Valid total discount ... so proceed to attachments
                    $state.go('pip.update.attachments', { pipId: $stateParams.pipId });
                } else {
                    //TotalDiscount is greater than total Price. Notify the user to fix the issue;
                    ProcurementHelper.showTotalDiscountValidationError(totalDiscountValidation.totalPrice, vm.importPermit.importPermit.discount);
                    return;
                }

            } else return;
        };


        vm.attachmentToTerms = function() {
            vm.importPermitValidation.attachment.$showError = true;
            if (vm.importPermitValidation.attachment.$isValid) {
                $state.go('pip.update.terms', { pipId: $stateParams.pipId });
            } else return;
        };

        vm.onSupplierSelected = function() {
            vm.importPermitDetail = []; //reset products, because products are loaded based on supplier
        }

        vm.onShippingMethodSelected = function() {
            LookUpFactory.shipingPortofentry.query({ shippingID: vm.importPermit.importPermit.shippingMethodID }, function(data) {
                vm.importPermit.importPermit.portOfEntry = {};
                vm.ports = data;

                vm.importPermit.importPermit.portOfEntry = $filter("filter")(vm.ports, { portCode: "AAB" })[0] != undefined ?
                    $filter("filter")(vm.ports, { portCode: "AAB" })[0] : $filter("filter")(vm.ports, { portCode: "KAL" })[0];
            });
        };

        vm.onDeliverySelected = function(item) {
            vm.importPermit.importPermit.delivery = angular.copy(item.name);
        };

        vm.onProductSelected = function() {
            vm.product.selected.productID = vm.product.selected.id;
            var detail = {};

            // FOR MEDICAL DEVICE
            if (vm.product.selected.mdDevicePresentations) {
                vm.product.selected.mdDevicePresentation = angular.copy(vm.product.selected.mdDevicePresentations[0]); //select the first packsize by default
            }

            CommodityFactory.productManufacturerAddress.query({ id: vm.product.selected.id }, function(data) {
                vm.product.selected.manufacturers = data;
                vm.product.selected.manufacturer = vm.product.selected.manufacturers[0];
                detail.manufacturers = data;
                detail.product = vm.product.selected;
                detail.productID = vm.product.selected.id;
            });
            vm.importPermitDetail.push(detail);
        };
        vm.showDetailDiscount = false;
        vm.onDetailDiscount = function() {
            if (!vm.showDetailDiscount) {
                _.each(vm.importPermitDetail, function(pd) {
                    pd.discount = null;
                })
            };
        }

        vm.showHeaderDiscount = false;
        vm.onHeaderDiscount = function() {
            if (!vm.showHeaderDiscount) {
                vm.importPermit.importPermit.discount = null;
            };
        }

        vm.RemoveProductFromList = function($index) {
            $ngConfirm({
                title: 'Remove Product',
                content: '<span>This will remove the product.</span><br/><span>Are you sure you want to proceed?</span>',
                // type: 'red',
                closeIcon: true,
                typeAnimated: true,
                scope: $scope,
                buttons: {
                    proceed: {
                        text: "Yes",
                        btnClass: 'btn-primary',
                        action: function() {
                            vm.importPermitDetail.splice($index, 1);
                            vm.importPermitValidation.detail.splice($index, 1);
                            vm.product = {};
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

        vm.duplicatePerformaInvoice = false;
        vm.CheckDuplicates = function() {
            ProcurementHelper.checkDuplicateProforma(vm.importPermit.importPermit.performaInvoiceNumber, vm.supplier.selected, vm.agent.selected, vm.importPermit.importPermit.id)
                .then(function(response) {
                    vm.duplicatePerformaInvoice = response;
                    if (response) {
                        NotificationService.notify("There is an active application by this invoice number under " + vm.supplier.selected.name, 'alert-danger');
                    }
                }, function(error) {
                    vm.duplicatePerformaInvoice = false;
                })
        }


        //Modals
        vm.openFileModal = function(moduleDocument) {
            var document = moduleDocument.attachmentInfo.document;
            document.title = moduleDocument.documentType.name;

            $http.post(CommonService.buildUrl(AppConst.API_URL.Attachment.AttachmentSingle, document.id), {}, { responseType: 'arraybuffer' })
                .success(function(response) {
                    var file = new Blob([response], { type: document.fileType });
                    var fileURL = URL.createObjectURL(file);
                    document.fileContent = $sce.trustAsResourceUrl(fileURL);
                });

            //Open modal
            $uibModal.open({
                templateUrl: "app/importPermit/new/modals/fileModal.html",
                size: 'lg',
                resolve: {
                    document: document
                },
                controller: function($scope, document) {
                    $scope.document = document;
                }
            });
        };

        vm.openAgentModal = function() {
            $uibModal.open({
                templateUrl: "app/importPermit/new/modals/agentModal.html",
                size: 'md',
                resolve: {
                    agent: vm.agent.selected
                },
                controller: function($scope, agent) {
                    $scope.agent = agent;
                }
            });
        };

        vm.openProductModal = function(product) {
            $uibModal.open({
                templateUrl: "app/importPermit/new/modals/productModal.html",
                size: 'md',
                resolve: {
                    product: product.product != null ? product.product : product
                },
                controller: function($scope, product) {
                    $scope.product = product;
                }
            });
        }

        function _addNewProduct() {
            PipFactory.goToProductAddPage(vm, 'UPDATE');
        }

        function _onProductAddFinished(addedProduct) {
            vm.product.selected = addedProduct;
            vm.onProductSelected();
        }

        //documents
        vm.getDocuments = function() {

            PipFactory.AgentByType.query({ code: vm.commodityType.selected.submoduleCode }, function(data) {
                vm.agents = data;
            });
            ModuleSettingsFactory.moduleDocumentBySubModule.query({
                id: vm.commodityType.selected.id,
                active: true
            }, function(data) {
                vm.moduleDocuments = _.filter(data, function(md) {
                    return md.documentType.isSystemGenerated == false && md.documentType.isDossier === false;
                });
                _.each(vm.moduleDocuments, function(md) {
                    md.required = md.isRequired ? 'Yes' : 'No';
                    md.attachmentInfo = {
                        moduleDocumentID: md.id,
                        createdBy: vm.user.id,
                        updatedBy: vm.user.id,
                        tempFolderName: vm.importPermit.identifier,
                        filePath: "filePath",
                        tempFileName: md.documentType.name
                    };
                    _.each(vm.importPermit.uploadedDocuments, function(ud) {
                        if (ud.moduleDocumentID == md.id) {

                            ud.moduleDocument = null;
                            ud.createdByUser = null;
                            ud.updatedByUser = null;

                            md.tempFolderName = vm.importPermit.identifier;
                            md.attachmentInfo.document = ud;
                        }
                    });

                });
            });
        }

        vm.downloadAttachment = function(idocument) {
            var documentVar = idocument.attachmentInfo.document;
            var a = document.createElement("a");
            document.body.appendChild(a);
            $http.post(CommonService.buildUrl(AppConst.API_URL.Attachment.AttachmentSingle, documentVar.id), {}, {
                    responseType: 'arraybuffer'
                })
                .success(function(response) {
                    var file = new Blob([response], {
                        type: idocument.attachmentInfo.document.fileType
                    });
                    vm.fileURL = URL.createObjectURL(file);
                    vm.fileContent = $sce.trustAsResourceUrl(vm.fileURL);
                    a.href = vm.fileContent;
                    a.download = idocument.documentType.name;
                    a.click();
                });

        };

        var prepareDocuments = function() {
            var documents = [];
            _.each(vm.moduleDocuments, function(md) {
                if (md.attachmentInfo.document) {
                    md.attachmentInfo.document.moduleDocument = null;
                    documents.push(md.attachmentInfo.document);
                }
            });
            vm.importPermit.documents = documents;
        };

        var prepareImportPermit = function() {
            importPermit = angular.copy(vm.importPermit);
            importPermit.importPermit.agentID = vm.agent.selected.id;
            importPermit.importPermit.supplierID = vm.supplier.selected.id;
            importPermit.importPermit.importPermitType = null;
            importPermit.importPermit.portOfEntryID = vm.importPermit.importPermit.portOfEntry.id;
            importPermit.importPermit.portOfEntry = null;
            importPermit.importPermit.paymentModeID = vm.importPermit.importPermit.paymentMode.id;
            importPermit.importPermit.paymentMode = null;
            importPermit.importPermit.currencyID = vm.importPermit.importPermit.currency.id;
            importPermit.importPermit.currency = null;
            importPermit.importPermit.importPermitStatus = null;
            importPermit.importPermit.shippingMethod = null;
            importPermit.importPermit.user = null;
            importPermit.importPermit.agent = null;
            importPermit.importPermit.assignedUser = null;
            importPermit.importPermit.supplier = null;
            importPermit.importPermit.modifiedByUserID = vm.user.id;
            importPermit.importPermit.importPermitDetails = [];
            importPermit.importPermit.importPermitType = null;

            _.each(vm.importPermitDetail, function(pd) {
                var ipermitDetail = {
                    id: pd.id,
                    importPermitID: pd.importPermitID,
                    productID: pd.product.id,
                    manufacturerAddressID: pd.product.manufacturer.id,
                    unitPrice: pd.unitPrice,
                    quantity: pd.quantity,
                    amount: pd.unitPrice * pd.quantity,
                    discount: pd.discount,
                    mdDevicePresentationID: pd.product.mdDevicePresentation ? pd.product.mdDevicePresentation.id : null
                };
                importPermit.importPermit.importPermitDetails.push(ipermitDetail);
            });
        };

        vm.UpdateImportPermit = function(redirect) {
            redirect = CommonService.checkUndefinedOrNull(redirect) ? redirect : true; //avoid redirect if from autosave.
            vm.importPermitValidation.attachment.$showError = true;
            if (vm.importPermitValidation.$isValid) {
                blockUI.start();
                prepareDocuments();
                prepareImportPermit();
                ImportPermitFactory.importPermit.update(importPermit, function(data) {
                    blockUI.stop();
                    if (redirect) {
                        vm.resetImportPermit();
                        NotificationService.notify("Successfully Updated", 'alert-success');
                        $state.go('pip.list.info', { pipId: $stateParams.pipId });
                    } else {
                        NotificationService.notify("Auto save", 'alert-success');
                    }
                }, function(error) {
                    blockUI.stop();
                    NotificationService.notify("Unable to  update! Please try again later", 'alert-danger');
                });
            } else return;

        };


        //Register to autosave counter  [fired from keepalive (part of ngIdle)]
        $scope.$on('Keepalive', function() {
            vm.UpdateImportPermit(false); //autosave (no redirect)
        });


    });