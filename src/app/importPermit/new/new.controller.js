(function() {
    'use strict';

    angular.module('pdx.controllers')
        .controller('ImportPermitNewController', function(UtilityFactory, LookUpFactory, CommodityFactory, ImportPermitFactory,
            AppConst, CommonService, AgentFactory, $state, $uibModal, $http, $sce, $filter, NotificationService, AccountService,
            SupplierFactory, ModuleSettingsFactory, PipFactory, $ngConfirm, $scope, WIPFactory, blockUI, ProcurementHelper, ImportPermitService) {
            var vm = this;
            $state.go('ipermit.new.header');

            vm.importPermits = [];
            vm.agents = [];
            vm.agent = {};
            vm.suppliers = [];
            vm.supplier = {};
            vm.importPermitDelivery = {};
            vm.products = []; //CommodityFactory.product.query();
            vm.product = {};
            vm.importPermitDetail = [];
            vm.manufacturers = [];
            vm.user = [];
            vm.shippingmethod = {};
            vm.commodityType = { selected: null };
            vm.showDetailDiscount = false;
            vm.showHeaderDiscount = false;
            vm.duplicatePerformaInvoice = true; // Assume initially that there is a duplicate proformaNumber;

            var importPermitWIP; // Holds the model for WIP(work in progress ... draft) ... so that vm.importPermit is not affected by saving draft process
            var importPermit; // Holds the model for submitting IP. ...  Done so that vm.importPermit is not affected by saving process in case saving fails.

            //methods
            vm.onCommodityTypeSelected = onCommodityTypeSelected;
            vm.headerToDetail = headerToDetail;
            vm.backToHeader = backToHeader;
            vm.detailToAttachment = detailToAttachment;
            vm.attachmentToTerms = attachmentToTerms;
            vm.onAgentSelected = onAgentSelected;
            vm.onSupplierSelected = onSupplierSelected;
            vm.onShippingMethodSelected = onShippingMethodSelected;
            vm.onDeliverySelected = onDeliverySelected;
            vm.onProductSelected = onProductSelected;
            vm.onDetailDiscount = onDetailDiscount;
            vm.onHeaderDiscount = onHeaderDiscount;
            vm.RemoveProductFromList = RemoveProductFromList;
            vm.CheckDuplicates = CheckDuplicates;
            vm.searchProducts = _searchProducts;

            //modals
            vm.openFileModal = openFileModal;
            vm.openAgentModal = openAgentModal;
            vm.openProductModal = openProductModal;

            vm.SaveDraft = SaveDraft;
            vm.SaveImportPermit = SaveImportPermit;

            activate();

            function activate() {
                getLookups();
            }

            //gets lookups
            function getLookups() {
                vm.user = AccountService.userInfo();
                vm.module = ModuleSettingsFactory.moduleByCode.get({ code: AppConst.Modules.ImportPermit }, function(data) {
                    vm.commodityTypes = ModuleSettingsFactory.subModuleByModule.query({
                        id: data.id
                    }, function(data) {
                        vm.commodityType.selected = $filter("filter")(data, { submoduleCode: "MED" })[0];
                        vm.onCommodityTypeSelected();
                        return data;
                    });
                })

                vm.currencies = LookUpFactory.currency.query();

                LookUpFactory.portofentry.query(function(data) {
                    vm.ports = data;
                    vm.importPermit.importPermit.portOfEntry = $filter("filter")(vm.ports, { portCode: "AAB" })[0];
                });
                LookUpFactory.paymentmode.query(function(data) {
                    vm.paymentmodes = data;
                    vm.importPermit.importPermit.paymentMode = $filter("filter")(vm.paymentmodes, { paymentCode: "LC" })[0]
                });

                PipFactory.ImportPermitType.get({ code: AppConst.Modules.ImportPermit }, function(data) {
                    vm.importPermit.importPermit.importPermitTypeID = data.id;
                });
                LookUpFactory.shippingmethod.query(function(data) {
                    vm.shippingmethods = data;
                    vm.onShippingMethodSelected();
                });

                vm.importPermitDeliveries = LookUpFactory.importPermitDelivery.query();
                getAgents();

                resetImportPermit();
            }

            function getAgents() {
                if (vm.user.isAgent) {
                    AgentFactory.userAgent.query({ userID: vm.user.id }, function(data) {
                        vm.agents = data;
                        vm.agent.selected = vm.agents[0];
                        // vm.onAgentSelected();
                    });

                } else {
                    ImportPermitFactory.agentList.query(function(data) {
                        vm.agents = data;
                        // vm.agent.selected = vm.agents[0];
                        vm.agent.selected = undefined;
                        // vm.onAgentSelected();
                    });
                }
            }

            function onCommodityTypeSelected() {
                if (vm.commodityType.selected === null) return;
                vm.onAgentSelected();

                vm.importPermit.importPermit.submoduleID = vm.commodityType.selected.id;
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
                            tempFolderName: vm.importPermit.Identifier,
                            filePath: "filePath",
                            tempFileName: md.documentType.name
                        }
                    });
                });
            }

            function resetImportPermit() {
                vm.importPermit = {
                    importPermit: {
                        importPermitNumber: vm.identifier,
                        importPermitStatusID: 1,
                        currencyID: 1,
                        shippingMethodID: 2,
                        supplierID: 1,
                        commoditytypeid: 1,
                        submoduleID: 1
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
            }

            function backToHeader() {
                $state.go('ipermit.new.header');
            }
            ///state transition
            function headerToDetail() {
                //if current form is invalid, show errors
                if (!vm.importPermitValidation.header.$isValid) {
                    vm.importPermitValidation.header.$showError = true;
                    return;
                }

                ProcurementHelper.checkDuplicateProforma(vm.importPermit.importPermit.performaInvoiceNumber, vm.supplier.selected, vm.agent.selected)
                    .then(function(response) {
                        vm.duplicatePerformaInvoice = response;
                        if (vm.duplicatePerformaInvoice) {
                            NotificationService.notify("There is an active application by this invoice number under " + vm.supplier.selected.name, 'alert-danger');
                        } else {
                            $state.go('ipermit.new.detail');
                        }
                    });
            }

            function detailToAttachment() {

                vm.importPermitValidation.detail.$showError = true;
                if (vm.importPermitValidation.detail.$isValid) {
                    var totalDiscountValidation = ProcurementHelper.validateTotalDiscount(vm.importPermitDetail, vm.importPermit.importPermit.freightCost, vm.importPermit.importPermit.discount, vm.showHeaderDiscount)

                    if (totalDiscountValidation.status) {
                        //Valid total discount ... so proceed to attachments
                        $state.go('ipermit.new.attachments');
                    } else {
                        //TotalDiscount is greater than total Price. Notify the user to fix the issue;
                        ProcurementHelper.showTotalDiscountValidationError(totalDiscountValidation.totalPrice, vm.importPermit.importPermit.discount);
                    }
                }
            }

            function attachmentToTerms() {
                vm.importPermitValidation.attachment.$showError = true;

                if (vm.importPermitValidation.attachment.$isValid) {
                    $state.go('ipermit.new.terms');
                }
            }

            // on dropdown and button group selected
            function onAgentSelected() {
                SupplierFactory.agentSupplier.query({
                    agentID: vm.agent.selected.id,
                    agentLevelCode: 'null',
                    productTypeCode: vm.commodityType.selected.submoduleCode
                }, function(data) {
                    vm.suppliers = data;
                    vm.supplier.selected = vm.suppliers[0];
                    if (vm.suppliers.length) vm.onSupplierSelected();
                });

            }

            function onSupplierSelected() {
                vm.product = {};
                vm.importPermitDetail = [];
            }

            function onShippingMethodSelected() {
                LookUpFactory.shipingPortofentry.query({ shippingID: vm.importPermit.importPermit.shippingMethodID }, function(data) {
                    vm.importPermit.importPermit.portOfEntry = {};
                    vm.ports = data;

                    vm.importPermit.importPermit.portOfEntry = $filter("filter")(vm.ports, { portCode: "AAB" })[0] != undefined ?
                        $filter("filter")(vm.ports, { portCode: "AAB" })[0] : $filter("filter")(vm.ports, { portCode: "KAL" })[0];
                });
            }

            function onDeliverySelected(item) {
                if (item.name == 'Other') vm.importPermit.importPermit.delivery = "";
                else vm.importPermit.importPermit.delivery = angular.copy(item.name);
            }

            function onProductSelected() {
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
            }

            function onDetailDiscount() {
                if (!vm.showDetailDiscount) {
                    _.each(vm.importPermitDetail, function(pd) {
                        pd.discount = null;
                    })
                }
            }

            function onHeaderDiscount() {
                if (!vm.showHeaderDiscount) {
                    vm.importPermit.importPermit.discount = null;
                }
            }

            function RemoveProductFromList($index) {
                $ngConfirm({
                    title: 'Remove Product',
                    content: '<span>This will remove the product.</span><br/><span>Are you sure you want to proceed?</span>',
                    type: 'red',
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

            }

            function CheckDuplicates() {
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

            function _searchProducts(keyWords) {
                ImportPermitFactory.searchProducts(vm, keyWords);
            }

            function openFileModal(moduleDocument) {
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
            }

            function openAgentModal() {
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
            }

            function openProductModal(product) {
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

            function SaveDraft() {
                prepareDocuments();
                prepareImportPermitForDraft();
                var WIPModel = {
                    type: AppConst.Modules.ImportPermit,
                    userID: vm.user.id,
                    contentObject: importPermitWIP,
                    rowguid: importPermitWIP.Identifier
                }
                WIPFactory.saveWIP.save(WIPModel, function() {
                    NotificationService.notify("Successfully saved!", "alert-success");
                }, function() {
                    NotificationService.notify("Unable to save data. Please try again!", "alert-danger");
                });
            }

            function SaveImportPermit(IsDraft) {
                vm.importPermitValidation.terms.$showError = true;
                vm.importPermit.isDraft = IsDraft;

                if (vm.importPermitValidation.$isValid) {
                    prepareDocuments();
                    prepareImportPermit();
                    ImportPermitService.autoGenerateImportPermit(importPermit, blockUI);
                    resetImportPermit();
                } else {
                    blockUI.stop();
                    return;
                }

            }

            function prepareDocuments() {
                var documents = [];
                _.each(vm.moduleDocuments, function(md) {
                    if (md.attachmentInfo.document) {
                        md.attachmentInfo.document.moduleDocument = null;
                        documents.push(md.attachmentInfo.document);
                    }
                });
                vm.importPermit.documents = documents;
            }

            function prepareImportPermit() {
                importPermit = angular.copy(vm.importPermit);
                importPermit.submoduleCode = vm.commodityType.selected.submoduleCode;
                importPermit.importPermit.agentID = vm.agent.selected.id;
                importPermit.importPermit.supplierID = vm.supplier.selected.id;
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
                        productID: pd.productID,
                        manufacturerAddressID: pd.product.manufacturer.id, //TODO: from UI
                        unitPrice: pd.unitPrice,
                        quantity: pd.quantity,
                        amount: pd.unitPrice * pd.quantity,
                        discount: pd.discount,
                        mdDevicePresentationID: pd.product.mdDevicePresentation ? pd.product.mdDevicePresentation.id : null
                    };
                    importPermit.importPermit.importPermitDetails.push(ipermitDetail);
                });
            }

            //Same as the above, but ipermit values are not set to null, because the user hasn't finished yet.
            function prepareImportPermitForDraft() {
                importPermitWIP = angular.copy(vm.importPermit);
                importPermitWIP.submoduleCode = angular.isDefined(vm.commodityType.selected) ? vm.commodityType.selected.submoduleCode : undefined;
                importPermitWIP.importPermit.agentID = angular.isDefined(vm.agent.selected) ? vm.agent.selected.id : null;
                importPermitWIP.importPermit.supplierID = angular.isDefined(vm.supplier.selected) ? vm.supplier.selected.id : null;
                importPermitWIP.importPermit.portOfEntryID = angular.isDefined(vm.importPermit.importPermit.portOfEntry) ? vm.importPermit.importPermit.portOfEntry.id : undefined;
                importPermitWIP.importPermit.paymentModeID = angular.isDefined(vm.importPermit.importPermit.paymentMode) ? vm.importPermit.importPermit.paymentMode.id : undefined;
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
            }


            //Register to autosave counter  [fired from keepalive (part of ng
            $scope.$on('Keepalive', function() {
                // do something to keep the user's session alive
                vm.SaveDraft();
            });


        });

})();