'use strict';

angular.module('pdx.factories')
    .factory('SupplierFactory', function($resource, $http, AppConst, CommonService) {
        var supplierFactory = {};

        //Supplier CRUD
        supplierFactory.supplier = $resource(CommonService.buildUrl(AppConst.API_URL.Supplier.Supplier), { id: "@id" }, AppConst.ResourceMethods.All);

        supplierFactory.supplierSearch = $resource(CommonService.buildUrl(AppConst.API_URL.Supplier.SupplierSearch), { query: "@query", pageNumber: "@pageNumber", pageSize: "@pageSize" }, AppConst.ResourceMethods.Save);

        //Supplier Agents
        supplierFactory.supplierAgent = $resource(CommonService.buildUrl(AppConst.API_URL.Agent.SupplierAgent), { supplierID: "@supplierID" }, AppConst.ResourceMethods.Readonly);

        //Agent Supplier
        supplierFactory.agentSupplier = $resource(CommonService.buildUrl(AppConst.API_URL.Agent.AgentSupplier), { agentID: "@agentID", agentLevelCode: "@agentLevelCode",productTypeCode:"@productTypeCode"  }, AppConst.ResourceMethods.Readonly);

        //AgentsUnderSupplier
        supplierFactory.agentUnderSupplier = $resource(CommonService.buildUrl(AppConst.API_URL.Agent.AgentUnderSupplier), { agentID: "@supplierID" }, AppConst.ResourceMethods.Readonly);

        //Supplier Products
        supplierFactory.supplierProduct = $resource(CommonService.buildUrl(AppConst.API_URL.Supplier.SupplierProduct), { supplierID: "@supplierID" }, AppConst.ResourceMethods.Readonly);

        //Supplier Agent
        supplierFactory.supplierByAgent = $resource(CommonService.buildUrl(AppConst.API_URL.Supplier.AgentSupplier), { supplierID: "@supplierID", agentID: "@agentID" }, AppConst.ResourceMethods.Readonly);

        supplierFactory.supplierHistory = $resource(CommonService.buildUrl(AppConst.API_URL.Supplier.SupplierHistory), { supplierID: "@supplierID" }, AppConst.ResourceMethods.Readonly);





        return supplierFactory;
    });