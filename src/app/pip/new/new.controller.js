'use strict';

angular.module('pdx.controllers')
    .controller('PipNewController', function(UtilityFactory, LookUpFactory, CommodityFactory, ImportPermitFactory, ProcurementHelper,
        AppConst, CommonService, AgentFactory, $state, $uibModal, $http, $sce, $filter, NotificationService,
        AccountService, SupplierFactory, ModuleSettingsFactory, PipFactory, $ngConfirm, $scope, WIPFactory, blockUI, $stateParams, PIPConst) {
        var vm = this;
        $state.go('pip.new.header');

        vm.CONSTANT = PIPConst;

        var importPermitWIP; // Holds the model for WIP(work in progress ... draft) ... so that vm.importPermit is not affected by saving draft process
        var importPermit; // Holds the model for submitting IP. ...  Done so that vm.importPermit is not affected by saving process in case saving fails.
        vm.importPermits = [];
        vm.agents = [];
        vm.agent = {};
        vm.suppliers = [];
        vm.supplier = {};
        vm.user = AccountService.userInfo();

        vm.getSuppliers = function() {
            SupplierFactory.supplier.query(function(data) {
                vm.suppliers = data;
            });

        }

        if (vm.user.isAgent) {
            AgentFactory.userAgent.query({ userID: vm.user.id }, function(agents) {
                vm.agents = agents;
                vm.agent.selected = vm.agents[0];
                vm.module = ModuleSettingsFactory.moduleByCode.get({ code: AppConst.Modules.PreImportPermit }, function(modules) {
                    vm.commodityTypes = ModuleSettingsFactory.subModuleByModule.query({
                        id: modules.id
                    }, function(data) {
                        vm.commodityType.selected = $filter("filter")(data, { submoduleCode: vm.agent.selected.agentType.agentTypeCode })[0];
                        vm.onCommodityTypeSelected();
                        return data;
                    });
                })
            });
        }
        vm.getSuppliers();

        vm.commodityType = { selected: null }

        vm.addNewProduct = _addNewProduct;
        vm.onProductAddFinished = _onProductAddFinished;

        if (!vm.user.isAgent) {
            vm.module = ModuleSettingsFactory.moduleByCode.get({ code: AppConst.Modules.PreImportPermit }, function(data) {
                vm.commodityTypes = ModuleSettingsFactory.subModuleByModule.query({
                    id: data.id
                }, function(data) {
                    return data;
                });
            })
        }
        vm.currencies = LookUpFactory.currency.query();

        LookUpFactory.portofentry.query(function(data) {
            vm.ports = data;
            vm.importPermit.importPermit.portOfEntry = $filter("filter")(vm.ports, { portCode: "AAB" })[0];
        });
        LookUpFactory.paymentmode.query(function(data) {
            vm.paymentmodes = data;
            vm.importPermit.importPermit.paymentMode = $filter("filter")(vm.paymentmodes, { paymentCode: "LC" })[0]
        });

        PipFactory.ImportPermitType.get({ code: AppConst.Modules.PreImportPermit }, function(data) {
            vm.importPermit.importPermit.importPermitTypeID = data.id;
        });

        LookUpFactory.shippingmethod.query(function(data) {
            vm.shippingmethods = data;
            vm.onShippingMethodSelected();
        });

        vm.shippingmethod = {};
        vm.importPermitDeliveries = LookUpFactory.importPermitDelivery.query();
        vm.importPermitDelivery = {};
        // vm.products = CommodityFactory.product.query(); //CommodityFactory.product.query();
        vm.products = [];
        vm.product = {};
        vm.importPermitDetail = [];
        vm.manufacturers = [];

        vm.listOfSubModuleTypes = [];
        vm.subModuleType = { selected: null };
        PipFactory.getSubmoduleTypes(vm, true);

        vm.onCommodityTypeSelected = function() {
            if (vm.commodityType.selected == null) return;

            if (!vm.user.isAgent) {
                PipFactory.AgentByType.query({ code: vm.commodityType.selected.submoduleCode }, function(data) {
                    vm.agents = data;
                });
            }
            ModuleSettingsFactory.moduleDocumentBySubModule.query({
                id: vm.commodityType.selected.id,
                active: true
            }, function(data) {
                vm.moduleDocuments = _.filter(data, function(md) { return md.documentType.isSystemGenerated == false && md.documentType.isDossier === false; });
                _.each(vm.moduleDocuments, function(md) {
                    md.required = md.isRequired ? 'Yes' : 'No';
                    md.attachmentInfo = {
                        moduleDocumentID: md.id,
                        createdBy: vm.user.id,
                        updatedBy: vm.user.id,
                        tempFolderName: vm.importPermit.Identifier,
                        filePath: "filePath",
                        tempFileName: md.documentType.name
                    }
                });
            });
        };


        vm.resetImportPermit = function() {
            vm.importPermit = {
                importPermit: {
                    importPermitNumber: vm.identifier,
                    importPermitStatusID: 1,
                    currencyID: 1,
                    shippingMethodID: 2,
                    supplierID: 1,
                    commoditytypeid: 1
                },
                documents: [],
                Identifier: vm.identifier
            };
            UtilityFactory.identifier.get({ key: 'ImportPermit' }, function(data) {
                vm.identifier = data.data;
                vm.importPermit.importPermit.importPermitNumber = vm.identifier;
                vm.importPermit.Identifier = vm.identifier;
            });
            vm.importPermitValidation = { header: {}, detail: [], attachment: {}, terms: {} };
            vm.onCommodityTypeSelected();
        };

        vm.resetImportPermit();

        ///state transition
        vm.headerToDetail = function() {
            vm.importPermitValidation.header.$showError = true;
            ProcurementHelper.checkDuplicateProforma(vm.importPermit.importPermit.performaInvoiceNumber, vm.supplier.selected, vm.agent.selected)
                .then(function(response) {
                    vm.duplicatePerformaInvoice = response;
                    if (response) {
                        NotificationService.notify("There is an active application by this invoice number under " + vm.supplier.selected.name, 'alert-danger');
                    }
                    if (vm.importPermitValidation.header.$isValid && !vm.duplicatePerformaInvoice) {
                        $state.go('pip.new.detail');
                    } else return;
                }, function(error) {
                    vm.duplicatePerformaInvoice = false;
                    if (vm.importPermitValidation.header.$isValid && !vm.duplicatePerformaInvoice) {
                        $state.go('pip.new.detail');
                    } else return;
                })

        };

        vm.backToHeader = function() {
            $state.go('pip.new.header', { pipId: $stateParams.pipId });
        }

        vm.detailToAttachment = function() {

            vm.importPermitValidation.detail.$showError = true;
            if (vm.importPermitValidation.detail.$isValid) {
                var totalDiscountValidation = ProcurementHelper.validateTotalDiscount(vm.importPermitDetail, vm.importPermit.importPermit.freightCost, vm.importPermit.importPermit.discount, vm.showHeaderDiscount)

                if (totalDiscountValidation.status) {
                    //Valid total discount ... so proceed to attachments
                    $state.go('pip.new.attachments');
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
                $state.go('pip.new.terms');
            } else return;
        };

        // on dropdown and button group selected
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
            if (item.name == 'Other') vm.importPermit.importPermit.delivery = "";
            else vm.importPermit.importPermit.delivery = angular.copy(item.name);
        };

        vm.onProductSelected = function() {
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
            ProcurementHelper.checkDuplicateProforma(vm.importPermit.importPermit.performaInvoiceNumber, vm.supplier.selected, vm.agent.selected)
                .then(function(response) {
                    vm.duplicatePerformaInvoice = response;
                    if (response) {
                        NotificationService.notify("There is an active application by this invoice number under " + vm.supplier.selected.name, 'alert-danger');
                    }
                }, function(error) {
                    vm.duplicatePerformaInvoice = false;
                })
        }

        vm.searchProducts = function(keyWords) {
            PipFactory.searchProducts(vm, keyWords);
        };


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
                    product: product
                },
                controller: function($scope, product) {
                    $scope.product = product;
                }
            });
        }

        function _addNewProduct() {
            PipFactory.goToProductAddPage(vm, 'NEW');
        }

        function _onProductAddFinished(addedProduct) {
            vm.product.selected = addedProduct;
            vm.onProductSelected();
        }

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
            importPermit.submoduleCode = vm.commodityType.selected.submoduleCode;
            importPermit.importPermit.submoduleTypeCode = vm.subModuleType.selected.submoduleTypeCode;
            importPermit.importPermit.agentID = vm.agent.selected.id;
            importPermit.importPermit.supplierID = vm.supplier.selected.id;
            importPermit.importPermit.importPermitType = null;
            importPermit.importPermit.portOfEntryID = vm.importPermit.importPermit.portOfEntry.id;
            importPermit.importPermit.portOfEntry = null;
            importPermit.importPermit.paymentModeID = vm.importPermit.importPermit.paymentMode.id;
            importPermit.importPermit.paymentMode = null;
            importPermit.importPermit.currencyID = vm.importPermit.importPermit.currency.id;
            importPermit.importPermit.currency = null;
            importPermit.importPermit.createdByUserID = vm.user.id;
            importPermit.importPermit.importPermitDetails = [];

            _.each(vm.importPermitDetail, function(pd) {
                var ipermitDetail = {
                    productID: pd.product.id,
                    manufacturerAddressID: pd.product.manufacturer.id, //TODO: from UI
                    unitPrice: pd.unitPrice,
                    quantity: pd.quantity,
                    amount: pd.unitPrice * pd.quantity,
                    discount: pd.discount,
                    mdDevicePresentationID: pd.product.mdDevicePresentation ? pd.product.mdDevicePresentation.id : null
                };
                importPermit.importPermit.importPermitDetails.push(ipermitDetail);
            });
        };

        //Same as the above, but ipermit values are not set to null, because the user hasn't finished yet.
        var prepareImportPermitForDraft = function() {
            importPermitWIP = angular.copy(vm.importPermit);
            importPermitWIP.submoduleCode = CommonService.checkUndefinedOrNull(vm.commodityType.selected) ? vm.commodityType.selected.submoduleCode : null;
            importPermitWIP.importPermit.submoduleTypeCode = vm.subModuleType.selected.submoduleTypeCode;
            importPermitWIP.importPermit.agentID = CommonService.checkUndefinedOrNull(vm.agent.selected) ? vm.agent.selected.id : null;
            importPermitWIP.importPermit.supplierID = CommonService.checkUndefinedOrNull(vm.supplier.selected) ? vm.supplier.selected.id : null;
            importPermitWIP.importPermit.portOfEntryID = CommonService.checkUndefinedOrNull(vm.importPermit.importPermit.portOfEntry) ? vm.importPermit.importPermit.portOfEntry.id : null;
            importPermitWIP.importPermit.paymentModeID = CommonService.checkUndefinedOrNull(vm.importPermit.importPermit.paymentMode) ? vm.importPermit.importPermit.paymentMode.id : null;
            importPermitWIP.importPermit.currencyID = CommonService.checkUndefinedOrNull(vm.importPermit.importPermit.currency) ? vm.importPermit.importPermit.currency.id : null;
            importPermitWIP.importPermit.createdByUserID = vm.user.id;
            importPermitWIP.importPermit.user = vm.user;
            importPermitWIP.importPermit.supplier = vm.supplier.selected;
            importPermitWIP.importPermit.agent = vm.agent.selected;
            importPermitWIP.termsAndConditions = importPermitWIP.importPermit.terms;
            _.each(vm.importPermitDetail, function(pd) {
                pd.amount = pd.unitPrice * pd.quantity,
                    pd.discount = pd.discount;
                pd.manufacturerAddressID = pd.product.manufacturer.id;
                pd.mdDevicePresentationID = pd.product.mdDevicePresentation ? pd.product.mdDevicePresentation.id : null;
            });
            importPermitWIP.importPermit.importPermitDetails = vm.importPermitDetail;
            importPermitWIP.importPermit.currency = $filter("filter")(vm.currencies, { id: vm.importPermit.importPermit.currencyID })[0];
            importPermitWIP.importPermit.shippingMethod = $filter("filter")(vm.shippingmethods, { id: vm.importPermit.importPermit.shippingMethodID })[0];
        };

        vm.SaveDraft = function() {
            if ($state.current.name.toLowerCase() == "pip.new.header") {
                return;
            }
            prepareDocuments();
            prepareImportPermitForDraft();
            var WIPModel = {
                type: AppConst.Modules.PreImportPermit,
                userID: vm.user.id,
                contentObject: importPermitWIP,
                rowguid: importPermitWIP.Identifier
            }
            WIPFactory.saveWIP.save(WIPModel, function() {
                NotificationService.notify("Successfully saved!", "alert-success");
            }, function() {
                NotificationService.notify("Unable to save data. Please try again!", "alert-danger");
            });
        };

        vm.SaveImportPermit = function(IsDraft) {
            vm.importPermitValidation.terms.$showError = true;
            vm.importPermit.isDraft = IsDraft;
            if (vm.importPermitValidation.$isValid) {
                blockUI.start();
                prepareDocuments();
                prepareImportPermit();
                ImportPermitFactory.importPermit.save(importPermit, function(data) {
                    vm.resetImportPermit();
                    blockUI.stop();
                    NotificationService.notify("Successfully Submitted", 'alert-success');
                    $state.go('pip.list');
                }, function(error) {
                    blockUI.stop();
                    NotificationService.notify("Unable to submit Pre Import Permit. Please try again!", 'alert-danger');
                });
            } else return;

        };

        //Register to autosave counter  [fired from keepalive (part of ngIdle)]
        $scope.$on('Keepalive', function() {
            // do something to keep the user's session alive
            vm.SaveDraft();
        });




    });