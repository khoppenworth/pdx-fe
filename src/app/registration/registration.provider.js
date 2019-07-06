(function(angular) {
    'use strict';

    angular.module('pdx')
        .provider('registrationRoute', function() {
            // The provider must include a $get() method This $get() method
            // will be invoked using $injector.invoke() and can therefore use
            // dependency-injection.
            this.$get = function() { return {}; };
            // Construct the states from different parameters
            this.getState = _getState;

            function _getState(stateType, type, moduleText) {
                // maregistration.renewal.new
                // renewalSteps
                var parent = 'maregistration.' + moduleText + '.' + type;
                var templateUrl = getTemplateUrl(moduleText, stateType);

                var state = {
                    url: '/' + stateType,
                    parent: parent,
                    ncyBreadcrumb: getBreadCrumb(stateType),
                    views: getView(type, templateUrl, moduleText)
                };  
                return state;
            }

            function getTemplateUrl(moduleText, stateType) {
                var commonTemplateUrl = 'app/registration/';
                var templates = {
                    'foodTermsConditions': getRenewalTemplatePath,
                    'deviceTermsConditions': getRenewalTemplatePath,
                    'deviceProduct': getRenewalUpdateTemplatePath,
                    'foodproduct': getRenewalUpdateTemplatePath,
                    'default': function() {
                        return commonTemplateUrl + 'templates/steps/' + stateType + '.html';
                    }
                };
                function getRenewalTemplatePath() {
                    return commonTemplateUrl + moduleText + '/templates/' + stateType + '.html';
                }
                function getRenewalUpdateTemplatePath() {
                    return commonTemplateUrl + moduleText + '/update/templates/' + stateType + '.html';
                }
                if (moduleText === 'renewal') {
                    return (templates[stateType] || templates['default'])();
                } else {
                    return templates['default']();
                }

            }

            function getView(type, templateUrl, moduleText) {
                var stepName = moduleText === 'newApplication' ? 'newSteps' : moduleText === 'renewal' ? 'renewalSteps' : moduleText === 'variation' ? 'variationSteps' : '';
                var text = stepName + '@maregistration.' + moduleText + '.' + type;
                var view = {};
                view[text] = {
                    templateUrl: templateUrl,
                    controllerAs: 'vm'
                };
                return view;
            }

            function getBreadCrumb(stateType) {
                var breadcrumb;

                switch (stateType) {
                    case "product":
                    case "deviceProduct":
                    case 'deviceProductContinued':
                    case 'foodProduct':
                    case 'foodproductcontinued':
                    case 'productcontinued':
                        breadcrumb = {
                            label: 'Product',
                            pageTitle: 'Product Detail'
                        };
                        break;
                    case 'composition':
                    case 'foodcomposition':
                    case 'devicecomposition':
                        breadcrumb = {
                            label: 'Composition',
                            pageTitle: 'Composition'
                        };
                        break;
                    case 'foodTermsConditions':
                    case 'termsConditions':
                    case 'deviceTermsConditions':
                        breadcrumb = {
                            label: 'Terms and Conditions',
                            pageTitle: 'Terms and Conditions'
                        };
                        break;
                    default:
                        breadcrumb = { label: '-', pageTitle: '-' };
                }
                return breadcrumb;
            }

        });
})(window.angular);
