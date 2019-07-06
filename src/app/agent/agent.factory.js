'use strict';

angular.module('pdx.factories')
    .factory('AgentFactory', function($resource, $http, AppConst, CommonService) {
        var AgentFactory = {};

        //Agent Type lookup
        AgentFactory.agentType = $resource(CommonService.buildUrl(AppConst.API_URL.LookUp.AgentType), { id: "@id" }, AppConst.ResourceMethods.Readonly);

        //Agent Level lookup
        AgentFactory.agentLevel = $resource(CommonService.buildUrl(AppConst.API_URL.LookUp.AgentLevel), { id: "@id" }, AppConst.ResourceMethods.Readonly);

        //List of users available for agent linking
        AgentFactory.userForAgent = $resource(CommonService.buildUrl(AppConst.API_URL.Agent.UsersForAgent), { id: "@id" }, AppConst.ResourceMethods.Readonly);

        //Suppliers that are linked to agetn
        AgentFactory.agentSupplierByAgent = $resource(CommonService.buildUrl(AppConst.API_URL.Agent.AgentSupplierByAgent), { agentID: "@agentID" }, AppConst.ResourceMethods.Readonly);

        //Agent CRUD
        AgentFactory.agent = $resource(CommonService.buildUrl(AppConst.API_URL.Agent.Agent), { id: "@id" }, AppConst.ResourceMethods.All);

        //User Agent
        AgentFactory.userAgent = $resource(CommonService.buildUrl(AppConst.API_URL.Agent.UserAgent), { userID: "@userID" }, AppConst.ResourceMethods.Readonly);

        //Create AgentUser
        AgentFactory.createAgentUser = $resource(CommonService.buildUrl(AppConst.API_URL.Agent.CreateAgentUsers), {}, AppConst.ResourceMethods.Save);

        //Create AgentUser
        AgentFactory.createOrUpdateSupplierAgent = $resource(CommonService.buildUrl(AppConst.API_URL.Agent.CreateOrUpdateSupplierAgent), AppConst.ResourceMethods.Save);


        AgentFactory.agentUsers = $resource(CommonService.buildUrl(AppConst.API_URL.Agent.AgentUsers), { agentID: "@agentID" }, AppConst.ResourceMethods.Readonly);


        AgentFactory.agentHistory = $resource(CommonService.buildUrl(AppConst.API_URL.Agent.AgentHistory), { agentID: "@agentID" }, AppConst.ResourceMethods.Readonly);

        //
        AgentFactory.agentUnderSupplierHistory = $resource(CommonService.buildUrl(AppConst.API_URL.Agent.AgentUnderSupplierHistory), { agentSupplierID: "@agentSupplierID"}, AppConst.ResourceMethods.Readonly);


        return AgentFactory;
    });
