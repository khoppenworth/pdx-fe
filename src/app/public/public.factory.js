/**
 * Created by abenitrust on 5/22/17.
 */

'use strict';

angular.module('pdx.factories')
    .factory('PublicFactory', function($resource, StorageService, AppConst, CommonService, $location, PublicConst) {
        var publicFactory = {};

        //1. Product Detail
        publicFactory.productDetail = $resource(CommonService.buildUrl(AppConst.API_URL.Public.ProductDetail), { id: "@id" }, AppConst.ResourceMethods.Readonly);

        //2. Agent Detail
        publicFactory.agentDetail = $resource(CommonService.buildUrl(AppConst.API_URL.Public.AgentDetail), { id: "@id" }, AppConst.ResourceMethods.Readonly);

        //3. Agent Product
        publicFactory.agentProdcut = $resource(CommonService.buildUrl(AppConst.API_URL.Public.ProductByAgent), { id: "@id" }, AppConst.ResourceMethods.Readonly);

        //4. Product Agent (Agents linked with a product)
        publicFactory.productAgent = $resource(CommonService.buildUrl(AppConst.API_URL.Public.ProductAgent), { productId: "@productId" }, AppConst.ResourceMethods.Readonly);

        //5. Product Attachments
        publicFactory.productAttachment = $resource(CommonService.buildUrl(AppConst.API_URL.Public.ProductAttachment), { productId: "@productId" }, AppConst.ResourceMethods.Readonly);


        publicFactory.daysRemaining = function daysRemaining() {
            var eventdate = moment("2019-05-01");
            var todaysdate = moment();
            return eventdate.diff(todaysdate, 'days');
        }

        publicFactory.showBanner = function showBanner() {
            var host = $location.host();
            var isValidHost = host.includes("mris");
            return publicFactory.daysRemaining() > 0 && isValidHost;
        }

        publicFactory.getProductListApplicationFilter = function() {
            var result = StorageService.get(PublicConst.StorageKeys.SubmoduleType);
            return result ? result.submoduleTypeCode : null;
        }

        return publicFactory;
    });
