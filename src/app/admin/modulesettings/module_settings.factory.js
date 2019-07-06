/**
 * Created by abenitrust on 4/5/17.
 */
'use strict';

angular.module('pdx.factories')
    .factory('ModuleSettingsFactory', function($resource, $http, AppConst, CommonService) {
        var ModuleSettingsFactory = {};
        var submodule = {};

        //1. Modules
        ModuleSettingsFactory.modules = $resource(CommonService.buildUrl(AppConst.API_URL.Module.Module), { id: "@id" }, AppConst.ResourceMethods.All);

        //2. Documents
        ModuleSettingsFactory.documents = $resource(CommonService.buildUrl(AppConst.API_URL.Document.DocumentType), { id: "@id" }, AppConst.ResourceMethods.All);

        //3. DocumentsByDossier
        ModuleSettingsFactory.documentsByDossier = $resource(CommonService.buildUrl(AppConst.API_URL.Document.DocumentTypeByDossier), { isDossier: "@isDossier" }, AppConst.ResourceMethods.All);

        //3. DocumentsByModule
        ModuleSettingsFactory.documentsByModuleCode = $resource(CommonService.buildUrl(AppConst.API_URL.Document.ModuleDocumentByModule), { code: "@code" }, AppConst.ResourceMethods.Readonly);

        //4. Module By Code
        ModuleSettingsFactory.moduleByCode = $resource(CommonService.buildUrl(AppConst.API_URL.Module.ModuleByCode), { code: "@code" }, AppConst.ResourceMethods.Readonly);

        //5. Sub Module By Module Id
        ModuleSettingsFactory.subModuleByModule = $resource(CommonService.buildUrl(AppConst.API_URL.Module.SubModuleByModule), { id: "@id" }, AppConst.ResourceMethods.Readonly);

        //6. Module Document By Sub Module id
        ModuleSettingsFactory.moduleDocumentBySubModule = $resource(CommonService.buildUrl(AppConst.API_URL.Module.ModuleDocumentBySubModule), {
            id: "@id",
            active: "@active",
            isDossier: "@isDossier"
        }, AppConst.ResourceMethods.Readonly);


        //7. Submodule list
        ModuleSettingsFactory.submodules = $resource(CommonService.buildUrl(AppConst.API_URL.Submodule.Submodule), { id: "@id" }, AppConst.ResourceMethods.Readonly);

        //8. Update ModuleDocument
        ModuleSettingsFactory.updateModuleDoc = $resource(CommonService.buildUrl(AppConst.API_URL.Module.UpdateModuleDocument), { id: "@id" }, AppConst.ResourceMethods.save);

        //9. submodule feeTypes
        ModuleSettingsFactory.submoduleFeeTypes = $resource(CommonService.buildUrl(AppConst.API_URL.Submodule.SubmoduleFeeList), {
            id: "@id",
            active: "@active"
        }, AppConst.ResourceMethods.Readonly);

        //10. Map feeType with submodule tye
        ModuleSettingsFactory.insertOrUpdateSubmoduleFeeType = $resource(CommonService.buildUrl(AppConst.API_URL.Submodule.SubmoduleFeeInsertOrUpdate), { id: "@id" }, AppConst.ResourceMethods.save);

        //11. Module Document By Sub Module Code
        ModuleSettingsFactory.moduleDocumentBySubModuleCode = $resource(CommonService.buildUrl(AppConst.API_URL.Module.ModuleDocumentBySubModuleCode), { code: "@code" }, AppConst.ResourceMethods.Readonly);

        ModuleSettingsFactory.moduleDocumentBySubModuleCodeSRA = $resource(CommonService.buildUrl(AppConst.API_URL.Module.ModuleDocumentBySubModuleCodeSRA), {
            code: "@code",
            isSra: '@isSra'
        }, AppConst.ResourceMethods.Readonly);

        //12. Module Document By Sub DocumentType Code
        ModuleSettingsFactory.moduleDocumentByDocumentTypeCode = $resource(CommonService.buildUrl(AppConst.API_URL.Module.ModuleDocumentByDocumentTypeCode), {
            submoduleCode: "@submoduleCode",
            documentTypeCode: "@documentTypeCode"
        }, AppConst.ResourceMethods.Readonly);

        //13. Module DocumentBy ModuleCode
        ModuleSettingsFactory.moduleDocumentByModueCode = $resource(CommonService.buildUrl(AppConst.API_URL.Document.ModuleDocumentByModuleCode), { code: "@code" }, AppConst.ResourceMethods.Readonly);

        //14.Module SRA
        ModuleSettingsFactory.sraOption = [
            { id: true, priority: 1, name: 'Yes', optionID: true },
            { id: false, priority: 2, name: 'No', optionID: false },
            { id: null, priority: 3, name: 'NA', optionID: null },
        ];

        ModuleSettingsFactory.constructorHeirarchy = function(files) {
            var nodes = {};
            return files.filter(function(obj) {
                var id = obj["documentType"]["id"],
                    parentId = obj["documentType"]["parentDocumentTypeID"];

                nodes[id] = _.defaults(obj, nodes[id], { children: [] });
                parentId && (nodes[parentId] = (nodes[parentId] || { children: [] }))["children"].push(obj);

                return !parentId;
            });

        };
        ModuleSettingsFactory.setSubmodule = function(newSubmodule) {
            submodule = newSubmodule;
        };
        ModuleSettingsFactory.getSubmodule = function() {
            return submodule;
        };


        return ModuleSettingsFactory;
    });