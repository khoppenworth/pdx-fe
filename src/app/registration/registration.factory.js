'use strict'

angular.module('pdx.factories')
    .factory('RegistrationFactory', function($resource, $http, AppConst, CommonService, $filter, $uibModal, $sce, NotificationService, $state, WIPFactory, RegistrationConst, CommodityFactory, StorageService) {

        var registrationFactory = {};

        registrationFactory.manufacturer = $resource(CommonService.buildUrl(AppConst.API_URL.LookUp.Manufacturer), { id: "@id" }, AppConst.ResourceMethods.Save);
        registrationFactory.detail = $resource(CommonService.buildUrl(AppConst.API_URL.MA.MASingle), { id: "@id" }, AppConst.ResourceMethods.Readonly);
        registrationFactory.maForRenewal = $resource(CommonService.buildUrl(AppConst.API_URL.MA.MAForRenewal), { userId: "@userID" }, AppConst.ResourceMethods.Readonly);
        registrationFactory.maForVariation = $resource(CommonService.buildUrl(AppConst.API_URL.MA.MAForVariation), { userId: "@userID" }, AppConst.ResourceMethods.Readonly);
        registrationFactory.renewal = $resource(CommonService.buildUrl(AppConst.API_URL.MA.MARenewal), {}, AppConst.ResourceMethods.All);
        registrationFactory.variation = $resource(CommonService.buildUrl(AppConst.API_URL.MA.MAVariation), {}, AppConst.ResourceMethods.All);
        registrationFactory.maAssign = $resource(CommonService.buildUrl(AppConst.API_URL.MAAssignment.MAAssignment), {}, AppConst.ResourceMethods.Save);
        registrationFactory.maAssignGroup = $resource(CommonService.buildUrl(AppConst.API_URL.MAAssignment.Grouped), { maid: "@maid" }, AppConst.ResourceMethods.Save);
        registrationFactory.maAssignmentHistory = $resource(CommonService.buildUrl(AppConst.API_URL.MAAssignment.History), { maid: "@maid" }, AppConst.ResourceMethods.Readonly);

        registrationFactory.responderType = $resource(CommonService.buildUrl(AppConst.API_URL.ResponderType.ResponderType), {}, AppConst.ResourceMethods.Readonly);
        registrationFactory.maField = $resource(CommonService.buildUrl(AppConst.API_URL.Field.Field), {}, AppConst.ResourceMethods.All);
        registrationFactory.maFieldById = $resource(CommonService.buildUrl(AppConst.API_URL.Field.MAFieldById), { id: "@id" , isVariationType: "@isVariationType", submoduleTypeCode: "@submoduleTypeCode" }, AppConst.ResourceMethods.All);
        registrationFactory.maSavedMAField = $resource(CommonService.buildUrl(AppConst.API_URL.Field.SavedMAField), {
            id: "@id",
            isVariationType: "@isVariationType"
        }, AppConst.ResourceMethods.All);
        registrationFactory.maFieldByType = $resource(CommonService.buildUrl(AppConst.API_URL.Field.FieldByType), { isVariationType: "@isVariationType", submoduleTypeCode: "@submoduleTypeCode" }, AppConst.ResourceMethods.Save);
        registrationFactory.maFieldInsertUpdate = $resource(CommonService.buildUrl(AppConst.API_URL.Field.InsertUpdate), {}, AppConst.ResourceMethods.Save);
        registrationFactory.maFieldSave = $resource(CommonService.buildUrl(AppConst.API_URL.Field.SaveField), {}, AppConst.ResourceMethods.Save);
        registrationFactory.updateAttachment = $resource(CommonService.buildUrl(AppConst.API_URL.Attachment.Attachment), {}, AppConst.ResourceMethods.All);
        registrationFactory.currentMaStatus = $resource(CommonService.buildUrl(AppConst.API_URL.MA.CurrentStatus), {}, AppConst.ResourceMethods.All);
        registrationFactory.generateLabRequest = $resource(CommonService.buildUrl(AppConst.API_URL.MA.GenerateLabRequest), {
            maID: "@maID",
            userID: "@userID"
        }, AppConst.ResourceMethods.All);

        registrationFactory.subModuleTypeByUserPrivilage = $resource(CommonService.buildUrl(AppConst.API_URL.LookUp.SubmoduleTypeByUserPrivilage), {}, AppConst.ResourceMethods.Readonly);

        registrationFactory.colorMap = RegistrationConst.COLOR_MAP;

        /*
         * -------------------Manufacturer Helpers---------------------------------------
         * */
        registrationFactory.initManufacturer = function(vm, LookUpFactory) {
            vm.allSelectedManufacturerTypes = [];
            vm.manufacturerT = [];
            vm.manu = {};

            if (vm.manufacturers === undefined || vm.manufacturers === null || vm.manufacturers.length === 0) {
                registrationFactory.searchManufacturer(vm, LookUpFactory, "");
            }
            if (vm.manufacturerTypes === undefined || vm.manufacturerTypes === null || vm.manufacturerTypes.length === 0) {
                LookUpFactory.manufacturerType.query(function(manuTypes) {
                    vm.manufacturerTypes = manuTypes;
                    switch (vm.submoduleTypeCode) {
                        case RegistrationConst.SUB_MODULE_TYPE.FOOD:
                            vm.manufacturerTypes = _.reject(manuTypes, function(mt) { return mt.manufacturerTypeCode === 'COMP_MATER_MANUF' });
                            break;
                        case RegistrationConst.SUB_MODULE_TYPE.MEDICAL_DEVICE:
                            vm.manufacturerTypes = _.reject(manuTypes, function(mt) { return mt.manufacturerTypeCode === 'API_MANUF' || mt.manufacturerTypeCode === 'ROW_MATERIAL_MANUF'; });
                            break;
                        default:
                            vm.manufacturerTypes = _.reject(manuTypes, function(mt) { return mt.manufacturerTypeCode === 'COMP_MATER_MANUF' || mt.manufacturerTypeCode === 'ROW_MATERIAL_MANUF'; });
                            break;
                    }
                });
            }
        }

        registrationFactory.validateManufacturer = function(data) {
            var fisnhedProduct = _.find(data, function(man) {
                return man.manufacturerType.manufacturerTypeCode == "FIN_PROD_MANUF";
            });

            return fisnhedProduct ? true : false;
        };
        registrationFactory.addManufacturerToList = function(vm) {
            //Loop through all selected
            if (vm.manu == undefined || vm.manu == null || vm.manu.length == 0) {
                NotificationService.notify("Please select manufacturer!", "alert-danger");
                return;
            }
            if (vm.manufacturerT.length <= 0) {
                NotificationService.notify("Please select  manufacturer type!", "alert-danger");
                return;
            }
            if (!CommonService.checkUndefinedOrNull(vm.maregistration.product.productManufacturers)) {
                vm.maregistration.product.productManufacturers = [];
            }
            _.each(vm.manufacturerT, function(data) {
                //Construct model according to db requirements. Check Product.ProductManufacturer db Model;
                var model = {
                    manufacturerAddressID: vm.manu.id,
                    manufacturerTypeID: data.id,
                    manufacturerType: data,
                    manufacturerAddress: {
                        address: {
                            id: vm.manu.addressID,
                            country: {
                                name: vm.manu.country,
                            },
                            city: vm.manu.city,
                            zipCode: vm.manu.zipCode,
                            region: vm.manu.region,
                            line1: vm.manu.line1,
                            line2: vm.manu.line2,
                            subCity: vm.manu.subCity,
                            woreda: vm.manu.woreda
                        },
                        manufacturer: {}
                    }
                };

                model.manufacturerAddress.manufacturer = Object.assign(model.manufacturerAddress.manufacturer, vm.manu);

                vm.maregistration.product.productManufacturers.push(model);
            });

            vm.manu = undefined;
            vm.manufacturerT = undefined;
        };
        registrationFactory.deleteManufacturerFromList = function(vm, data, validationIdx) {
            var index = vm.maregistration.product.productManufacturers.indexOf(data);
            if (index >= 0) {
                //Remove from dataModel;
                vm.maregistration.product.productManufacturers.splice(index, 1);
            }

            if (validationIdx >= 0) {
                vm.maregistrationValidation.productManu.splice(validationIdx, 1);
            }
        }
        registrationFactory.searchManufacturer = function(vm, LookUpFactory, keyWords, $event) {
            if (keyWords == "") {
                keyWords = " ";
            }
            if (!$event) {
                vm.pageNo = 0;
            } else {
                $event.stopPropagation();
                $event.preventDefault();
                vm.pageNo++;
            }

            LookUpFactory.manufacturerAddressSearch.search({
                query: keyWords,
                pageNo: vm.pageNo,
                pageSize: 10
            }, function(manufacturers) {
                if ($event) {
                    if (!vm.manufacturers) {
                        vm.manufacturers = [];
                    } //Initialize incase its undefined or null.
                    vm.manufacturers = vm.manufacturers.concat(manufacturers);

                } else {
                    vm.manufacturers = manufacturers;
                }

            });
        }
        registrationFactory.registerNewManufacturer = function() {
            $uibModal.open({
                backdrop: "static",
                templateUrl: "app/registration/templates/manufacturer.modal.template.html",
                size: 'lg',
                windowClass: 'supplierModalClass',
                controller: "ManufacturerModalController",
                controllerAs: 'vm'
            }).result.then(function() {
                NotificationService.notify("Manufacturer Successfully Registered.", "alert-success");
            }, function() {

            });
        }

        //        -------------  end of manufacturer helpers ------------------------

        /*
         * ---------------  Registration related form helpers   ----------------------
         * */
        registrationFactory.recursiveFunction = function(checklist) {
            var userChecklist = $filter('filter')(checklist.maChecklists, { responderType: { responderTypeCode: "APL", } })[0];
            checklist.optionID = CommonService.checkUndefinedOrNull(userChecklist) ? userChecklist.optionID : null
            if (checklist.children.length > 0) {
                _.each(checklist.children, function(ch) {
                    registrationFactory.recursiveFunction(ch);
                });
            }
        }
        registrationFactory.findField = function(vm, fieldCode) {
            var found = _.find(vm.currentMAFieldState, function(fieldSubmoduleType) {
                return fieldSubmoduleType.field.fieldCode === fieldCode;
            });

            return found;
        }
        registrationFactory.flattenField = function(fields, flattenedCollection) {
            if (!CommonService.checkUndefinedOrNull(flattenedCollection)) {
                flattenedCollection = [];
            }
            _.each(fields, function(data) {
                if (data.children.length > 0) {
                    return registrationFactory.flattenField(data.children, flattenedCollection)
                } else {
                    flattenedCollection.push(data);
                }
            })

            return flattenedCollection;
        }
        registrationFactory.selectedField = function(flatFields) {
            var selectedFields = _.filter(flatFields, function(field) {
                return field.isSelected === true;
            });
            return selectedFields;
        }
        registrationFactory.selectedFieldCount = function(fields) {
            var flatFields = registrationFactory.flattenField(fields);
            var selectedFields = registrationFactory.selectedField(flatFields);
            return selectedFields.length;
        }
        registrationFactory.allFieldsSelected = function(fields) {
            var flatFields = registrationFactory.flattenField(fields);
            var allSelected = _.all(flatFields, function(field) {
                return field.isSelected === true;
            })
            return allSelected;
        }

        registrationFactory.isAllChildrenChanged = function(vm, fieldSubmoduleType) {
            var changed = true;
            var numOfChildren = 0;
            _.each(vm.currentMAFieldState, function(ch) {
                if (fieldSubmoduleType.field.id == ch.parentFieldID) {
                    numOfChildren++;
                    if (ch.isIntact === undefined) {
                        changed = false;
                    }
                }
            });

            if (changed && numOfChildren > 0) {
                fieldSubmoduleType.isIntact = false;
            }
        }
        registrationFactory.onChange = function(vm, fieldCode) {
            var found = registrationFactory.findField(vm, fieldCode);
            found.isIntact = false;
        }
        registrationFactory.hasError = function(vm, name) {
            return !registrationFactory.isInputDisabled(vm, name) && registrationFactory.isInputIntact(vm, name);
        }
        registrationFactory.isInputIntact = function(vm, fieldCode) {
            var found = registrationFactory.findField(vm, fieldCode);
            registrationFactory.isAllChildrenChanged(vm, found);
            return (found !== undefined && found.isIntact !== undefined) ? found.isIntact : true;
        }
        registrationFactory.isInputDisabled = function(vm, fieldCode) {
            var found = registrationFactory.findField(vm, fieldCode);
            return found !== undefined ? !found.field.isEditable : true;
        }

        registrationFactory.isInputVisible = function(vm, fieldCode) {
            var result = true;
            var submoduleTypeCode = vm.submoduleTypeCode; // vm.subModuleType.submoduleTypeCode;
            var submoduleCode = vm.maregistration.ma.maType.maTypeCode;

            if (submoduleTypeCode === RegistrationConst.SUB_MODULE_TYPE.FOOD) {
                if (fieldCode === 'DosageStrength') {
                    if (submoduleCode !== RegistrationConst.SUBMODULE.FOOD_SUPPLEMENT && submoduleCode !== RegistrationConst.SUBMODULE.THERAPEUTIC_FOOD) {
                        delete vm.maregistrationValidation.productdetail.dosageStrength;
                        result = false;
                    }
                }
            }

            return result;
        }

        registrationFactory.firstLetterGroupFn = function(item) {
            return item ? item.country.name : "";
        };

        // ---------------------End Registration related form helpers --------------------


        // ---------------- Product Composition Helpers ----------------------------
        registrationFactory.addActiveSubstances = function(vm) {
            $uibModal.open({
                backdrop: 'static',
                templateUrl: 'app/registration/templates/activesubstances.modal.template.html',
                size: 'md',
                controller: 'IngredientsModalController',
                controllerAs: 'vm',
                resolve: {
                    product_composition: null,
                    subModuleType: vm.subModuleType
                }
            }).result.then(function(received) {
                vm.productInns.push(received);
            }, function() {});
        }
        registrationFactory.editActiveSubstances = function(vm, data) {
            var index = vm.productInns.indexOf(data)
            $uibModal.open({
                backdrop: 'static',
                templateUrl: 'app/registration/templates/activesubstances.modal.template.html',
                size: 'md',
                controller: 'IngredientsModalController',
                controllerAs: 'vm',
                resolve: {
                    product_composition: data,
                    subModuleType: vm.subModuleType
                }
            }).result.then(function(received) {
                vm.productInns[index] = received
            }, function() {});
        }
        registrationFactory.removeActiveSubstance = function(vm, data) {
            var index = vm.productInns.indexOf(data)
            if (index >= 0) {
                vm.productInns.splice(index, 1);
            }
        }
        registrationFactory.addExceipientSubstances = function(vm) {
            $uibModal.open({
                backdrop: 'static',
                templateUrl: 'app/registration/templates/exceipientsubstances.modal.template.html',
                size: 'md',
                controller: 'IngredientsModalController',
                controllerAs: 'vm',
                resolve: {
                    product_composition: null
                }
            }).result.then(function(received) {
                vm.productExcipeints.push(received);
            }, function() {});
        };
        registrationFactory.editExceipientSubstances = function(vm, data) {
            var index = vm.productInns.indexOf(data);
            $uibModal.open({
                backdrop: 'static',
                templateUrl: 'app/registration/templates/exceipientsubstances.modal.template.html',
                size: 'md',
                controller: 'IngredientsModalController',
                controllerAs: 'vm',
                resolve: {
                    product_composition: data
                }
            }).result.then(function(received) {
                vm.productExcipeints[index] = received;
            }, function() {});
        }
        registrationFactory.removeExceipientSubstances = function(vm, data) {
            var index = vm.productExcipeints.indexOf(data)
            if (index >= 0) {
                vm.productExcipeints.splice(index, 1);
            }
        }

        registrationFactory.addDiluentSubstances = function(vm) {
            $uibModal.open({
                backdrop: 'static',
                templateUrl: 'app/registration/templates/diluentsubstances.modal.template.html',
                size: 'md',
                controller: 'IngredientsModalController',
                controllerAs: 'vm',
                resolve: {
                    product_composition: null
                }
            }).result.then(function(received) {
                vm.productDiluents.push(received);
            }, function() {});
        }
        registrationFactory.editDiluentSubstances = function(vm, data) {
            var index = vm.productInns.indexOf(data);
            $uibModal.open({
                backdrop: 'static',
                templateUrl: 'app/registration/templates/diluentsubstances.modal.template.html',
                size: 'md',
                controller: 'IngredientsModalController',
                controllerAs: 'vm',
                resolve: {
                    product_composition: data
                }
            }).result.then(function(received) {
                vm.productDiluents[index] = received;
            }, function() {});
        }
        registrationFactory.removeDiluentSubstances = function(vm, data) {
            var index = vm.productDiluents.indexOf(data)
            if (index >= 0) {
                vm.productDiluents.splice(index, 1);
            }
        }


        //  product ATC Helpers
        registrationFactory.addAtcProduct = function(vm) {
            vm.productAtcValidation.$showError = true;
            if (vm.productAtcValidation.$isValid) {
                vm.productAtc.atcID = vm.productAtc.atc.id;
                vm.maregistration.product.productATCs.push(vm.productAtc);
                vm.productAtc = {};
            } else {
                return;
            }
        }
        registrationFactory.removeAtcProduct = function(vm, data) {
            var index = vm.maregistration.product.productATCs.indexOf(data)
            if (index >= 0) {
                vm.maregistration.product.productATCs.splice(index, 1);
            }
        }

        // foreign application status helpers
        registrationFactory.addForeignApplicationStatus = function(vm) {
            $uibModal.open({
                backdrop: 'static',
                templateUrl: 'app/registration/templates/foreignstatus.modal.template.html',
                size: 'md',
                controller: 'ForeignStatusModalController',
                controllerAs: 'vm',
                resolve: {
                    foreignApplicationStatus: null
                }
            }).result.then(function(received) {
                vm.maregistration.ma.foreignApplications.push(received);
            }, function() {});
        }
        registrationFactory.editForeignApplicationStatus = function(vm, data) {
            var index = vm.maregistration.ma.foreignApplications.indexOf(data)
            $uibModal.open({
                backdrop: 'static',
                templateUrl: 'app/registration/templates/foreignstatus.modal.template.html',
                size: 'md',
                controller: 'ForeignStatusModalController',
                controllerAs: 'vm',
                resolve: {
                    foreignApplicationStatus: data
                }
            }).result.then(function(received) {
                vm.maregistration.ma.foreignApplications[index] = received;
            }, function() {});
        }
        registrationFactory.removeForeignApplicationStatus = function(vm, data) {
            var index = vm.maregistration.ma.foreignApplications.indexOf(data)
            if (index >= 0) {
                vm.maregistration.ma.foreignApplications.splice(index, 1);
            }
        }

        // ----------------------  Prepare Registration Helpers ---------------------------- //

        //prepare document
        registrationFactory.prepareDocument = function(moduleDocuments, firDocs) {
            var documents = [];
            _.each(moduleDocuments, function(md) {
                if (md.attachmentInfo.document) {
                    var doc = angular.copy(md.attachmentInfo.document);
                    doc.moduleDocument = null;
                    documents.push(doc);
                }
            });

            _.each(firDocs, function(md) {
                if (md.attachmentInfo.document) {
                    md.attachmentInfo.document.moduleDocument = null;
                    documents.push(md.attachmentInfo.document);
                }
            });
            return documents;
        };

        //prepare Dossiers
        registrationFactory.prepareDossier = function(dossiers) {
            var recursiveFlatten = function(docs, flattenDocs) {
                //NOTE for type==assessment, @param userId will be scope vm !!!
                if (!CommonService.checkUndefinedOrNull(flattenDocs)) {
                    flattenDocs = [];
                }
                _.each(docs, function(d) {
                    //If it has children, recurse;
                    if (d.children && d.children.length > 0) {
                        return recursiveFlatten(d.children, flattenDocs)
                    } else {
                        flattenDocs.push(d);
                    }
                });

                return flattenDocs;
            };
            var dossierDocs = recursiveFlatten(dossiers);
            var dos = [];
            _.each(dossierDocs, function(d) {
                if (d.attachmentInfo.document) {
                    d.attachmentInfo.document.moduleDocument = null;
                    dos.push(d.attachmentInfo.document);
                }
            });
            return dos;
        };

        registrationFactory.prepareRegistration = function(maregistration, vm, type, instance) {
            //copy view model to model variable.
            var model = angular.copy(maregistration);
            model.submoduleCode = angular.isDefined(model.ma.maType.maTypeCode) ? model.ma.maType.maTypeCode : undefined;
            model.ma.supplierID = angular.isDefined(model.ma.supplier) ? model.ma.supplier.id : undefined;
            model.ma.maTypeID = angular.isDefined(model.ma.maType) ? model.ma.maType.id : undefined;
            model.ma.agentID = angular.isDefined(vm.agent.selected) ? vm.agent.selected.id : undefined;
            // Shared Product attribute across all sub module types
            var prod = model.product;
            model.product.dosageFormID = (angular.isDefined(prod.dosageFormObj) && prod.dosageFormObj !== null) ? prod.dosageFormObj.id : undefined;
            model.product.dosageStrengthID = (angular.isDefined(prod.dosageStrengthObj) && prod.dosageStrengthObj !== null) ? prod.dosageStrengthObj.id : undefined;
            model.product.shelfLifeID = (angular.isDefined(prod.shelfLifeObj) && prod.shelfLifeObj !== null) ? prod.shelfLifeObj.id : undefined;
            model.product.productTypeID = (angular.isDefined(prod.productType) && prod.productType !== null) ? prod.productType.id : undefined;
            model.product.useCategoryID = (angular.isDefined(prod.useCategory) && prod.useCategory !== null) ? prod.useCategory.id : undefined;
            model.product.innID = angular.isDefined(prod.inn) ? prod.inn.id : undefined;

            //SRA - comma separated
            var sra = null;
            _.each(model.ma.sralist, function(sr) {
                if (sra == null) sra = sr.name;
                else sra = sra + "," + sr.name
            });
            model.ma.sra = sra;

            switch (vm.submoduleTypeCode) {
                case RegistrationConst.SUB_MODULE_TYPE.FOOD:
                    model.product.foodCompositions = vm.foodCompositions;
                    break;
                case RegistrationConst.SUB_MODULE_TYPE.MEDICAL_DEVICE:
                    model.product.productCategoryID = angular.isDefined(model.product.productCategory) ? model.product.productCategory.id : undefined;
                    model.product.productMD.mdGroupingID = angular.isDefined(model.product.productMD.mdGrouping) ? model.product.productMD.mdGrouping.id : undefined;
                    model.product.productMD.deviceClassID = angular.isDefined(model.product.productMD.deviceClass) ? model.product.productMD.deviceClass.id : undefined;
                    model.product.productMD.familyName = model.product.productMD.mdGrouping.mdGroupingCode === 'FAML' ? model.product.productMD.familyName : null;
                    model.product.mdModelSizes = vm.deviceModelSizes;
                    model.product.deviceAccessories = vm.deviceAccessories;
                    model.product.productType = $filter('filter')(vm.productTypes, { productTypeCode: 'MDS' })[0];
                    model.product.productTypeID = model.product.productType.id;
                    break;
                default:
                    //product
                    model.product.productCategoryID = angular.isDefined(model.product.productCategory) ? model.product.productCategory.id : undefined;
                    model.product.pharmacopoeiaStandardID = angular.isDefined(model.product.pharmacopoeiaStandard) ? model.product.pharmacopoeiaStandard.id : undefined;
                    model.product.dosageUnitID = angular.isDefined(model.product.dosageUnitObj) ? model.product.dosageUnitObj.id : undefined;

                    model.product.adminRouteID = angular.isDefined(model.product.adminRoute) ? model.product.adminRoute.id : undefined;
                    model.product.ageGroupID = angular.isDefined(model.product.ageGroup) ? model.product.ageGroup.id : undefined;
                    model.product.pharmacologicalClassificationID = angular.isDefined(model.product.pharmacologicalClassification) ? model.product.pharmacologicalClassification.id : undefined;
                    //product composition and atc
                    model.product.productCompositions = _.union(vm.productInns, vm.productExcipeints, vm.productDiluents);
                    break;
            }

            //presentations
            var packSizes = [];
            _.each(model.product.presentations, function(present) {
                var ps = {};
                ps.packSizeID = present.id;
                ps.packaging = model.product.containerType;
                ps.dosageUnitID = model.product.dosageUnitID;
                ps.packSize = present;
                packSizes.push(ps);
            });
            model.product.presentations = packSizes;

            //Checklist
            model.ma.maChecklists = registrationFactory.recursiveFlatten(vm.submoduleCheckList, vm.user.id, type);
            //Prepare Documents
            model.documents = registrationFactory.prepareDocument(vm.moduleDocuments, vm.firDoc);
            model.dossiers = registrationFactory.prepareDossier(vm.dossierDocuments);

            //For variation / renewal, set original maID
            if (type == 'new' && _.contains(['variation', 'renewal'], instance)) {
                model.ma.originalMAID = vm.originalMA.ma.id;
            }

            if (_.contains(['variations', 'renewal']), instance) {
                model.ma.sra = null
                model.ma.isSRA = false;
            }

            if (_.contains(['variation']), instance) {
                // Set variation summary information
                model.ma.maVariationSummary = vm.variationInformation.maVariationSummary;
                //checklist
                vm.checklists = _.flatten(_.map(model.checklists, "children"));

                if (vm.isLegacy) {
                    model.ma.maChecklists = registrationFactory.recursiveFlatten(model.checklists, vm.user.id, 'new');
                } else {
                    model.ma.maChecklists = registrationFactory.recursiveFlatten(model.checklists, vm.user.id, 'update');
                }
            }

            return model;
        };

        registrationFactory.prepareRenewal = function(maregistration, vm, type) {
            var model = angular.copy(maregistration);
            model.ma.originalMAID = model.previousAppDetail.ma.id;
            model.ma.originalMA = model.previousAppDetail.ma;
            model.ma.createdByUserID = vm.user.id;
            model.ma.agentID = model.previousAppDetail.ma.agentID;
            model.ma.supplierID = model.previousAppDetail.ma.supplierID;
            //sra is set to null by default for renewal and variation
            model.ma.sra = null;
            model.ma.isSRA = false;
            //attachment
            model.documents = registrationFactory.prepareDocument(vm.moduleDocuments);
            model.dossiers = registrationFactory.prepareDossier(vm.dossierDocuments);
            //checklists
            model.ma.maChecklists = registrationFactory.recursiveFlatten(vm.submoduleCheckList, vm.user.id, type);
            return model;
        };


        // File modal helper
        registrationFactory.openFileModal = function(moduleDocument) {
            var document = moduleDocument.attachmentInfo.document
            document.title = moduleDocument.documentType.name

            $http.post(CommonService.buildUrl(AppConst.API_URL.Attachment.AttachmentSingle, document.id), {}, { responseType: 'arraybuffer' })
                .success(function(response) {
                    var file = new Blob([response], { type: document.fileType })
                    var fileURL = URL.createObjectURL(file)
                    document.fileContent = $sce.trustAsResourceUrl(fileURL)
                })

            // Open modal
            $uibModal.open({
                templateUrl: 'app/importPermit/new/modals/fileModal.html',
                size: 'lg',
                resolve: {
                    document: document
                },
                controller: function($scope, document) {
                    $scope.document = document
                }
            })
        }
        registrationFactory.submitMAResponse = function(response, route, draft) {
            if (response.isSuccess === true) {
                if (draft) {
                    NotificationService.notify("Successfully Saved", "alert-success");
                } else {
                    NotificationService.notify("MA application submitted successfully", "alert-success");
                    $state.go(route.stateName, route.params);
                }
            } else {
                NotificationService.notify('Error occurred. Please try again!', "alert-danger");
            }
        }
        registrationFactory.saveDraft = function(WIPModel, autosave) {
            var successMessage = "Successfully saved!",
                errorMessage = "Unable to save data. Please try again!";
            if (autosave) {
                successMessage = "Auto saved!";
                errorMessage = "";
            }
            WIPFactory.saveWIP.save(WIPModel, function() {
                NotificationService.notify(successMessage, "alert-success");
            }, function() {
                NotificationService.notify(errorMessage, "alert-danger", 1000);
            });
        }
        registrationFactory.isVariationType = function(code) {
            var variationTypes = [
                RegistrationConst.SUBMODULE.MAJOR_VARIATION,
                RegistrationConst.SUBMODULE.MINOR_VARIATION,
                RegistrationConst.SUBMODULE.MINOR_FOOD_VARIATION,
                RegistrationConst.SUBMODULE.MAJOR_FOOD_VARIATION,
                RegistrationConst.SUBMODULE.MINOR_MEDICAL_DEVICE_VARIATION,
                RegistrationConst.SUBMODULE.MAJOR_MEDICAL_DEVICE_VARIATION
            ];
            return _.contains(variationTypes, code) ? true : 'null';
        }
        registrationFactory.isFoodType = function(submoduleTypeCode) {
            return submoduleTypeCode === RegistrationConst.SUB_MODULE_TYPE.FOOD ? true : null;
        }
        registrationFactory.disableNonSelectedVariationFields = function(node, variationFields) {
            if (_.contains(['MA', 'Product'], node.field.fieldCode)) {
                return true;
            }

            if (_.contains(['Documents', 'Checklists', 'Dossier'], node.field.fieldCode)) {
                return false;
            }

            var n = _.find(variationFields, function(d) {
                return d.field.fieldCode === node.field.fieldCode;
            });
            return !angular.isDefined(n);
        };


        //Checklist helper
        registrationFactory.showAnswerButton = function(checklist) {
            return checklist.children.length <= 0 && checklist.optionGroup && checklist.optionGroup.possibleOptions && checklist.optionGroup.possibleOptions.length > 0;
        }
        registrationFactory.recursiveFlatten = function(checklist, userId, type, flattenedChecklists) {
            //NOTE for type==assessment, @param userId will be scope vm !!!
            if (!CommonService.checkUndefinedOrNull(flattenedChecklists)) {
                flattenedChecklists = [];
            }
            _.each(checklist, function(ch) {
                //If it has children, recurse;
                if (ch.children.length > 0) {
                    return registrationFactory.recursiveFlatten(ch.children, userId, type, flattenedChecklists)
                } else {
                    //check if the checklist is answerable, if not skip.
                    if (ch.optionGroup || ch.answerType) {
                        var checklist = {};
                        if (type == 'prescreen') {
                            _.each(ch.maChecklists, function(c) {
                                flattenedChecklists.push(c);
                            });
                        } else if (type == 'assessment') {
                            //Note, for this scenario, userId == vm [scope variable]!!
                            checklist.checklistID = ch.id;
                            checklist.responderID = userId.userInfo.id;
                            checklist.responderTypeID = userId.assesserType.id;
                            checklist.maId = userId.maId;
                            checklist.answer = ch.answer;
                            checklist.optionID = ch.optionID;
                            checklist.id = ch.maChecklistID;
                            flattenedChecklists.push(checklist);
                        } else {
                            if (type == 'update') {
                                var maCheckList = $filter('filter')(ch.maChecklists, { responderType: { responderTypeCode: 'APL' } })[0];
                                checklist.checklistID = ch.id;
                                checklist.optionID = maCheckList == undefined ? ch.optionID : maCheckList.optionID;
                                checklist.id = maCheckList == undefined ? 0 : maCheckList.id;
                            } else {
                                checklist.checklistID = ch.id;
                                checklist.optionID = ch.optionID;
                            }
                            checklist.responderID = userId;
                            checklist.responderTypeID = 1;
                            flattenedChecklists.push(checklist);
                        }
                    }
                }
            });

            return flattenedChecklists;
        };
        registrationFactory.flattenChecklist = function(checklist, flattenedChecklists) {
            if (!CommonService.checkUndefinedOrNull(flattenedChecklists)) {
                flattenedChecklists = [];
            }
            _.each(checklist, function(ch) {
                if (ch.children.length > 0) {
                    var children = ch.children;
                    ch.children = [];
                    flattenedChecklists.push(ch);
                    return registrationFactory.flattenChecklist(children, flattenedChecklists)
                } else {
                    flattenedChecklists.push(ch);
                }
            });

            return flattenedChecklists;
        };


        registrationFactory.getFirDoc = function(vm, ModuleSettingsFactory, maStatusCode, type) {
            var app;
            var documentTypeCode = maStatusCode == RegistrationConst.MA_STATUS.FIR ? RegistrationConst.MA_STATUS.FIRR : RegistrationConst.MA_STATUS.RTAR;
            if (type == 'renewal') {
                app = vm.marenewal;
            } else {
                app = vm.maregistration;
            }
            ModuleSettingsFactory.moduleDocumentByDocumentTypeCode.get({
                submoduleCode: app.submoduleCode,
                documentTypeCode: documentTypeCode
            }, function(data) {
                var md = data;
                md.required = md.isRequired ? 'Yes' : 'No';
                md.repeaterId = md.id;
                md.attachmentInfo = {
                    moduleDocumentID: md.id,
                    createdBy: vm.user.id,
                    updatedBy: vm.user.id,
                    tempFolderName: app.identifier,
                    filePath: 'filePath',
                    tempFileName: md.documentType != null ? md.documentType.name : ""
                };
                vm.fDoc = md;

            });
        }

        registrationFactory.addFirDoc = function(vm) {
            var doc = angular.copy(vm.fDoc);
            doc.id = 0;
            doc.attachmentInfo.tempFileName += ('_' + vm.firGeneratedCount + '_' + vm.firDoc.length);
            vm.firDoc.push(doc);
        }

        registrationFactory.editLegacyData = function(ma) {
            if (!registrationFactory.allowEditLegacyData(ma)) {
                NotificationService.notify('This Data is already edited. You cannot edit it again!', 'alert-warning');
                return;
            }
            $state.go('maregistration.newApplication.update', { maId: ma.id })
        };

        registrationFactory.allowEditLegacyData = function(ma) {
            var LegacyDataRegex = /(\/LD)$/gm;
            return LegacyDataRegex.test(ma.maNumber) && ma.maStatus.maStatusCode == 'APR' && ma.isLegacyUpdated === false;
        };


        registrationFactory.isLegacyDataEdited = function(ma) {
            var LegacyDataRegex = /(\/LD)$/gm;
            return LegacyDataRegex.test(ma.maNumber) && ma.maStatus.maStatusCode == 'APR' && ma.isLegacyUpdated === true;
        };

        registrationFactory.legacyFIRorRTA = function(ma) {
            var LegacyDataRegex = /(\/LD)$/gm;
            return LegacyDataRegex.test(ma.maNumber);
        };


        //Module Document Helpers
        registrationFactory.initAttachment = function(vm, ModuleSettingsFactory, type) {
            ModuleSettingsFactory.moduleDocumentBySubModuleCodeSRA.query({
                code: vm.maregistration.ma.maType.maTypeCode,
                isSra: vm.maregistration.ma.isSRA
            }, function(data) {
                vm.moduleDocuments = _.filter(data, function(md) {
                    return md.documentType.isSystemGenerated == false && md.documentType.isDossier === false;
                });
                registrationFactory.prepareModuleDocs(vm, type);

                var dossiers = _.filter(data, function(md) {
                    return md.documentType.isSystemGenerated == false && md.documentType.isDossier === true;
                });
                registrationFactory.prepareDossierDocs(vm, dossiers, ModuleSettingsFactory, type);

            });
        };

        registrationFactory.prepareModuleDocs = function(vm, type, mode) {
            var objectModel = vm.maregistration;
            if (mode == 'renewal') {
                objectModel = vm.marenewal;
            }
            _.each(vm.moduleDocuments, function(md) {
                md.required = md.isRequired ? 'Yes' : 'No';
                md.attachmentInfo = {
                    moduleDocumentID: md.id,
                    createdBy: vm.user.id,
                    updatedBy: vm.user.id,
                    tempFolderName: vm.identifier,
                    filePath: "filePath",
                    tempFileName: md.documentType.name
                };
                if (type !== 'new') {
                    //If appliction type is not new (wip or update), populate attached documents
                    _.each(objectModel.uploadedDocuments, function(ud) {
                        if (ud.moduleDocumentID == md.id) {
                            ud.moduleDocument = null;
                            ud.createdByUser = null;
                            ud.updatedByUser = null;
                            md.tempFolderName = vm.identifier;
                            md.attachmentInfo.document = ud;
                        }
                    });
                }
            });
        };

        registrationFactory.prepareDossierDocs = function(vm, dossiers, ModuleSettingsFactory, type, mode) {
            var objectModel = vm.maregistration;
            if (mode == 'renewal') {
                objectModel = vm.marenewal;
            }
            _.each(dossiers, function(md) {
                md.required = md.isRequired ? 'Yes' : 'No';
                md.attachmentInfo = {
                    moduleDocumentID: md.id,
                    createdBy: vm.user.id,
                    updatedBy: vm.user.id,
                    tempFolderName: vm.identifier,
                    filePath: "filePath",
                    tempFileName: md.documentType.name
                };
                if (type !== 'new') {
                    //If application type is not new (wip or update), populate attached documents
                    _.each(objectModel.uploadedDocuments, function(ud) {
                        if (ud.moduleDocumentID == md.id) {
                            ud.moduleDocument = null;
                            ud.createdByUser = null;
                            ud.updatedByUser = null;
                            md.tempFolderName = vm.identifier;
                            md.attachmentInfo.document = ud;
                        }
                    });
                }
            });
            vm.dossierDocuments = ModuleSettingsFactory.constructorHeirarchy(dossiers);


        };

        registrationFactory.initAttachmentRenewal = function(vm, ModuleSettingsFactory, type) {
            ModuleSettingsFactory.moduleDocumentBySubModuleCodeSRA.query({
                code: vm.marenewal.submoduleCode,
                isSra: false
            }, function(data) {
                vm.moduleDocuments = _.filter(data, function(md) {
                    return md.documentType.isSystemGenerated == false && md.documentType.isDossier === false;
                });
                registrationFactory.prepareModuleDocs(vm, type, 'renewal');

                var dossiers = _.filter(data, function(md) {
                    return md.documentType.isSystemGenerated == false && md.documentType.isDossier === true;
                });
                registrationFactory.prepareDossierDocs(vm, dossiers, ModuleSettingsFactory, type, 'renewal');

            });
        };
        registrationFactory.stateToGo = function(states, submoduleTypeCode, nextState) {
            var stateToGo = "";
            if (!CommonService.checkUndefinedOrNull(submoduleTypeCode) ||
                !CommonService.checkUndefinedOrNull(states) || !CommonService.checkUndefinedOrNull(nextState)) return;

            // set next state based on submodule type
            switch (submoduleTypeCode) {
                case RegistrationConst.SUB_MODULE_TYPE.FOOD:
                    if (nextState === states.product) {
                        stateToGo = states.foodproduct;
                    } else if (nextState === states.productdetailContinued) {
                        stateToGo = states.foodproductContinued;
                    } else if (nextState === states.composition) {
                        stateToGo = states.foodcomposition;
                    } else if (nextState === states.termsAndConditions) {
                        stateToGo = states.foodTermsConditions;
                    } else {
                        stateToGo = nextState;
                    }
                    break;
                case RegistrationConst.SUB_MODULE_TYPE.MEDICAL_DEVICE:
                    if (nextState === states.product) {
                        stateToGo = states.deviceProduct;
                    } else if (nextState === states.productdetailContinued) {
                        stateToGo = states.deviceProductContinued;
                    } else if (nextState === states.composition) {
                        stateToGo = states.deviceComposition;
                    } else if (nextState === states.termsAndConditions) {
                        stateToGo = states.deviceTermsConditions;
                    } else {
                        stateToGo = nextState;
                    }
                    break;
                default:
                    stateToGo = nextState;
                    break;
            }
            return stateToGo;
        };

        registrationFactory.setRenewalSubmoduleCodeBySubmoduleType = function(submoduleTypeCode, submoduleCode) {
            if (!CommonService.checkUndefinedOrNull(submoduleTypeCode)) return;
            var submoduleTypeCodes = {
                'MDCN': function() {
                    return RegistrationConst.SUBMODULE.RENEWAL;
                },
                'FD': function() {
                    return RegistrationConst.SUBMODULE.RENEWAL_FOOD;
                },
                'MD': function() {
                    if (!CommonService.checkUndefinedOrNull(submoduleCode)) return;
                    return submoduleCode.indexOf('RREN') !== -1 ? submoduleCode : submoduleCode + 'RREN';
                }
            };
            return submoduleTypeCodes[submoduleTypeCode]();
        };

        registrationFactory.constructDossierDocuments = function(vm, ModuleSettingsFactory, submoduleCode, children) {
            var helper = function(files) {
                var nodes = {};
                return files.filter(function(obj) {
                    var id = obj["moduleDocument"]["documentType"]["id"],
                        parentId = obj["moduleDocument"]["documentType"]["parentDocumentTypeID"];

                    nodes[id] = _.defaults(obj, nodes[id], { children: [] });
                    parentId && (nodes[parentId] = (nodes[parentId] || { children: [] }))["children"].push(obj);

                    return !parentId;
                });
            }

            ModuleSettingsFactory.moduleDocumentBySubModuleCode.query({ code: submoduleCode }, function(documents) {

                var lists = _.filter(documents, function(doc) { return doc.documentType.isDossier == true });
                var filtered = _.filter(lists, function(l) {
                    return !_.some(children, function(c) {
                        return c.moduleDocument.documentTypeID == l.documentTypeID;
                    });
                });
                var fil = _.map(filtered, function(f) { return { isParent: true, moduleDocumentID: f.id, moduleDocument: f } });
                fil = fil.concat(children);

                vm.dossierDocuments = helper(fil);
            });
        };

        registrationFactory.getProductTypes = function(vm) {
            var productTypes = [];
            if (vm.submoduleTypeCode === RegistrationConst.SUB_MODULE_TYPE.MEDICAL_DEVICE) {
                productTypes = CommodityFactory.productTypeBySubmodule.query({ submoduleTypeCode: vm.submoduleTypeCode });
            } else {
                productTypes = CommodityFactory.productTypeBySubmodule.query({ submoduleTypeCode: vm.submoduleTypeCode, submoduleCode: vm.maregistration.ma.maType.maTypeCode });
            }
            return productTypes;
        }

        registrationFactory.getDeviceClasses = function(vm, clearPrevious) {
            var deviceClasses = [];
            if (vm.submoduleTypeCode === RegistrationConst.SUB_MODULE_TYPE.MEDICAL_DEVICE) {
                if (clearPrevious) {
                    vm.maregistration.product.productMD.deviceClass = {}; // reset currently selected device class
                }

                deviceClasses = CommodityFactory.deviceClassBySubmoduleCode.query({ submoduleCode: vm.maregistration.ma.maType.maTypeCode });
            }
            return deviceClasses;
        }

        registrationFactory.isCompositionToManufacturersValid = function(vm) {
            var isCompositionValid = false; // by default set validation to false

            switch (vm.submoduleTypeCode) {
                case RegistrationConst.SUB_MODULE_TYPE.FOOD:
                case RegistrationConst.SUB_MODULE_TYPE.MEDICAL_DEVICE:
                    isCompositionValid = true; // no validation is needed for medical device
                    break;
                default:
                    vm.maregistrationValidation.productInn.$showError = true;
                    if (vm.maregistrationValidation.productInn.$isValid && vm.productInns.length > 0) {
                        isCompositionValid = true;
                    } else {
                        if (!vm.maregistrationValidation.productInn.$isValid || vm.productInns.length == 0) NotificationService.notify("Please add one or more Active Ingredients", "alert-warning");
                        return;
                    }
                    break;
            }
            return isCompositionValid;
        }

        registrationFactory.getMaListApplicationFilter = function() {
            var result = StorageService.get(RegistrationConst.StorageKeys.SubmoduleTypeRegistration);
            return result ? result.submoduleTypeCode : null;
        }

        registrationFactory.getProductListApplicationFilter = function() {
            var result = StorageService.get(RegistrationConst.StorageKeys.SubmoduleTypeProduct);
            return result ? result.submoduleTypeCode : null;
        }
        registrationFactory.isMaNotificationType = function(maTypeCode) {
            var notificationMaTypes = [RegistrationConst.SUBMODULE.FOOD_NOTIFICATION, RegistrationConst.SUBMODULE.NOTIFICATION_IVD, RegistrationConst.SUBMODULE.NOTIFICATION_NON_IVD];
            return _.contains(notificationMaTypes, maTypeCode);
        }

        registrationFactory.setFinishedManufacturer = function(vm) {
            var fisnhedManuf;
            if(!_.isUndefined(vm.maregistration)) {
                     fisnhedManuf= _.find( vm.maregistration.product.productManufacturers, function(man) {
                        return man.manufacturerType.manufacturerTypeCode == "FIN_PROD_MANUF";
                    });
            } else if(!_.isUndefined(vm.marenewal)) { 
                fisnhedManuf= _.find( vm.marenewal.previousAppDetail.product.productManufacturers, function(man) {
                    return man.manufacturerType.manufacturerTypeCode == "FIN_PROD_MANUF";
                });
            }
            vm.finishedProductManufacturer = fisnhedManuf;
        }

        
        return registrationFactory;

    });
