'use strict';

angular.module('pdx.factories')
    .factory('ImportPermitFactory', function($resource, $http, AppConst, CommonService) {
        var importPermitFactory = {};

        importPermitFactory.moduleDocuments = $resource(CommonService.buildUrl(AppConst.API_URL.Document.ModuleDocumentBySubModule), { id: "@id" }, AppConst.ResourceMethods.Readonly);
        importPermitFactory.attachment = $resource(CommonService.buildUrl(AppConst.API_URL.Attachment.Attachment), { id: "@id" }, AppConst.ResourceMethods.Readonly);
        importPermitFactory.attachmentBase64 = $resource(CommonService.buildUrl(AppConst.API_URL.Attachment.AttachmentBase64), { id: "@id" }, AppConst.ResourceMethods.Readonly);
        importPermitFactory.importPermit = $resource(CommonService.buildUrl(AppConst.API_URL.ImportPermit.ImportPermit), { id: "@id" }, AppConst.ResourceMethods.All);
        importPermitFactory.autoImportPermit = $resource(CommonService.buildUrl(AppConst.API_URL.ImportPermit.AutoImportPermit), { id: "@id" }, AppConst.ResourceMethods.All);
        importPermitFactory.importPermitSingle = $resource(CommonService.buildUrl(AppConst.API_URL.ImportPermit.SingleImportPermit), { id: "@id" }, AppConst.ResourceMethods.All);


        importPermitFactory.agentImportPermit = $resource(CommonService.buildUrl(AppConst.API_URL.ImportPermit.AgentImportPermit), { agentID: "@agentID" }, AppConst.ResourceMethods.All);
        importPermitFactory.agentList = $resource(CommonService.buildUrl(AppConst.API_URL.ImportPermit.AgentList), {}, AppConst.ResourceMethods.Readonly);
        importPermitFactory.submoduleAttachment = $resource(CommonService.buildUrl(AppConst.API_URL.Attachment.SubmoduleAttachment), { submoduleCode: "@submoduleCode", referenceId: "@referenceId" }, AppConst.ResourceMethods.Readonly);
        importPermitFactory.attachmentDownload = $resource(CommonService.buildUrl(AppConst.API_URL.Attachment.AttachmentDownload), { id: "@id" }, AppConst.ResourceMethods.Readonly);
        importPermitFactory.attachmentSingle = $resource(CommonService.buildUrl(AppConst.API_URL.Attachment.AttachmentSingle), { id: "@id" }, AppConst.ResourceMethods.Readonly);
        importPermitFactory.history = $resource(CommonService.buildUrl(AppConst.API_URL.ImportPermit.History), {}, AppConst.ResourceMethods.Readonly);
        importPermitFactory.assign = $resource(CommonService.buildUrl(AppConst.API_URL.ImportPermit.Assign), {}, AppConst.ResourceMethods.All);
        importPermitFactory.product = $resource(CommonService.buildUrl(AppConst.API_URL.ImportPermit.SupplierProduct), { supplierID: "@supplierID", productTypeCode: "@productTypeCode" }, AppConst.ResourceMethods.All);
        importPermitFactory.ProductSearch = $resource(CommonService.buildUrl(AppConst.API_URL.Commodity.ProductSearchAll), { query: "@query", productTypeCode: "@productTypeCode", importPermitTypeCode: 'IPRM', supplierID: "@supplierID" }, AppConst.ResourceMethods.Search);
        importPermitFactory.mdproduct = $resource(CommonService.buildUrl(AppConst.API_URL.ImportPermit.SupplierMDProduct), { supplierID: "@supplierID", productTypeCode: "@productTypeCode" }, AppConst.ResourceMethods.All);

        //WorkFlow
        importPermitFactory.submitImportPermit = $resource(CommonService.buildUrl(AppConst.API_URL.ImportPermit.Submit), {}, AppConst.ResourceMethods.All);
        importPermitFactory.withdrawImportPermit = $resource(CommonService.buildUrl(AppConst.API_URL.ImportPermit.Withdraw), {}, AppConst.ResourceMethods.All);
        importPermitFactory.submitImportPermitForApproval = $resource(CommonService.buildUrl(AppConst.API_URL.ImportPermit.SubmitForApproval), {}, AppConst.ResourceMethods.All);
        importPermitFactory.submitImportPermitForRejection = $resource(CommonService.buildUrl(AppConst.API_URL.ImportPermit.SubmitForRejection), {}, AppConst.ResourceMethods.All);
        importPermitFactory.returnImportPermitToAgent = $resource(CommonService.buildUrl(AppConst.API_URL.ImportPermit.ReturnToAgent), {}, AppConst.ResourceMethods.All);
        importPermitFactory.returnImportPermitToCSO = $resource(CommonService.buildUrl(AppConst.API_URL.ImportPermit.ReturnToCSO), {}, AppConst.ResourceMethods.All);
        importPermitFactory.approveImportPermit = $resource(CommonService.buildUrl(AppConst.API_URL.ImportPermit.Approve), {}, AppConst.ResourceMethods.All);
        importPermitFactory.voidImportPermit = $resource(CommonService.buildUrl(AppConst.API_URL.ImportPermit.Void), {}, AppConst.ResourceMethods.Save);
        importPermitFactory.rejectImportPermit = $resource(CommonService.buildUrl(AppConst.API_URL.ImportPermit.Reject), {}, AppConst.ResourceMethods.All);

        importPermitFactory.checkInvoiceDuplicate = $resource(CommonService.buildUrl(AppConst.API_URL.ImportPermit.CheckInvoiceDuplicate), { supplierID: "@supplierID", performaInvoice: "@performaInvoice" }, AppConst.ResourceMethods.Readonly);


        importPermitFactory.searchProducts = function(vm, keyWords) {
            this.ProductSearch.search({ query: keyWords, productTypeCode: vm.commodityType.selected.submoduleCode, supplierID: vm.supplier.selected.id }, function(data) {
                vm.products = data;
            });
        }

        return importPermitFactory;
    });
