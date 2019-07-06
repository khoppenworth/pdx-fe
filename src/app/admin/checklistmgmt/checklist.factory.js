'use strict';

angular.module('pdx.factories')
    .factory('ChecklistFactory', function($resource, $http, AppConst, CommonService) {
        var checklistFactory = {};
        //answer Types
        checklistFactory.AnswerType = $resource(CommonService.buildUrl(AppConst.API_URL.Checklist.AnswerType), { id: "@id" }, AppConst.ResourceMethods.All);

        checklistFactory.OptionGroup = $resource(CommonService.buildUrl(AppConst.API_URL.Checklist.OptionGroup), { id: "@id" }, AppConst.ResourceMethods.All);
        checklistFactory.ChecklistType = $resource(CommonService.buildUrl(AppConst.API_URL.Checklist.ChecklistType), { id: "@id" }, AppConst.ResourceMethods.All);
        checklistFactory.ChecklistBySubmodule = $resource(CommonService.buildUrl(AppConst.API_URL.Checklist.ChecklistBySubmodule), { submoduleCode: "@submoduleCode", checklistTypeCode: "@checklistTypeCode", isSra: "@isSra" }, AppConst.ResourceMethods.Readonly);
        checklistFactory.ChecklistByModule = $resource(CommonService.buildUrl(AppConst.API_URL.Checklist.ChecklistByModule), { moduleCode: "@moduleCode", checklistTypeCode: "@checklistTypeCode", isSra: "@isSra" }, AppConst.ResourceMethods.Readonly);

        checklistFactory.Checklist = $resource(CommonService.buildUrl(AppConst.API_URL.Checklist.Checklist), { id: "@id" }, AppConst.ResourceMethods.All);
        checklistFactory.ChecklistBySubmoduleType = $resource(CommonService.buildUrl(AppConst.API_URL.Checklist.ChecklistBySubmoduleType), { checklistTypeCode: "@checklistTypeCode", submoduleTypeCode: "@submoduleTypeCode" }, AppConst.ResourceMethods.All);
        checklistFactory.SubModuleChecklist = $resource(CommonService.buildUrl(AppConst.API_URL.Checklist.SubModuleChecklist), { moduleCode: "@moduleCode", checklistTypeCode: "@checklistTypeCode", isSra: "@isSra" }, AppConst.ResourceMethods.All);
        checklistFactory.DeleteSubModuleChecklist = $resource(CommonService.buildUrl(AppConst.API_URL.Checklist.DeleteSubModuleChecklist), {}, AppConst.ResourceMethods.Save);
        checklistFactory.ChecklistInsertOrUpdate = $resource(CommonService.buildUrl(AppConst.API_URL.Checklist.ChecklistInsertOrUpdate), {}, AppConst.ResourceMethods.Save);
        return checklistFactory;
    });