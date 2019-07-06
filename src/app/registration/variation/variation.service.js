(function(angular) {
    'use strict';

    angular.module('pdx.services')
        .service('VariationService', function(RegistrationConst, $filter, CommonService) {
            var variationService = {};
            var tempVariationData = {
                submoduleTypeCode: ''
            };

            variationService.recursiveFunction = function(checklist) {
                var userChecklist = $filter('filter')(checklist.maChecklists, { responderType: { responderTypeCode: "APL", } })[0];
                checklist.optionID = CommonService.checkUndefinedOrNull(userChecklist) ? userChecklist.optionID : null;
                if (checklist.children.length > 0) {
                    _.each(checklist.children, function(ch) {
                        variationService.recursiveFunction(ch);
                    });
                }
            };

            variationService.findField = function(vm, fieldCode) {
                var found = _.find(vm.currentMAFieldState, function(fieldSubmoduleType) {
                    return (fieldSubmoduleType.isVariationType === true && fieldSubmoduleType.field.fieldCode === fieldCode);
                });
                return found;
            };

            variationService.flattenField = function(fields, flattenedCollection) {
                if (!CommonService.checkUndefinedOrNull(flattenedCollection)) {
                    flattenedCollection = [];
                }
                _.each(fields, function(data) {
                    if (data.children.length > 0) {
                        return variationService.flattenField(data.children, flattenedCollection);
                    } else {
                        flattenedCollection.push(data);
                    }
                });

                return flattenedCollection;
            };

            variationService.isAllChildrenChanged = function(vm, fieldSubmoduleType) {
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
            };

            variationService.onChange = function(vm, fieldCode) {
                var found = variationService.findField(vm, fieldCode);
                found.isIntact = false;
            };

            variationService.hasError = function(vm, name) {
                return !variationService.isInputDisabled(vm, name) && variationService.isInputIntact(vm, name);
            };

            variationService.isInputIntact = function(vm, fieldCode) {
                var found = variationService.findField(vm, fieldCode);
                variationService.isAllChildrenChanged(vm, found);
                return (found !== undefined && found.isIntact !== undefined) ? found.isIntact : true;
            };

            variationService.isInputDisabled = function(vm, fieldCode) {
                var found = variationService.findField(vm, fieldCode);
                return found !== undefined ? !found.field.isEditable : true;
            };
            variationService.isBothVariationType = function(variationCount) {
                return variationCount.major > 0 && variationCount.minor > 0;
            };

            variationService.checkMajor = function(variationCount) {
                return variationCount.major == 0 ? false : true; //Returns true if at least one major variation count exists
            };
            variationService.getMaTypeCode = function(isMajor, submoduleTypeCode) {
                // SET MA TYPE BASED ON SUBMODULE TYPE AND IS MAJOR
                var maTypeCode = '';
                switch (submoduleTypeCode) {
                    case RegistrationConst.SUB_MODULE_TYPE.MEDICINE:
                        maTypeCode = isMajor ? RegistrationConst.SUBMODULE.MAJOR_VARIATION : RegistrationConst.SUBMODULE.MINOR_VARIATION;
                        break;
                    case RegistrationConst.SUB_MODULE_TYPE.FOOD:
                        maTypeCode = isMajor ? RegistrationConst.SUBMODULE.MAJOR_FOOD_VARIATION : RegistrationConst.SUBMODULE.MINOR_FOOD_VARIATION;
                        break;
                    case RegistrationConst.SUB_MODULE_TYPE.MEDICAL_DEVICE:
                        maTypeCode = isMajor ? RegistrationConst.SUBMODULE.MAJOR_MEDICAL_DEVICE_VARIATION : RegistrationConst.SUBMODULE.MINOR_MEDICAL_DEVICE_VARIATION;
                        break;
                }
                return maTypeCode;
            };
            variationService.stateToGo = function(states, submoduleTypeCode, nextState) {
                var stateToGo = "";
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
                    default:
                        stateToGo = nextState;
                        break;
                }
                return stateToGo;
            };

            variationService.setVariationSubmoduleType = function (code){
                tempVariationData.submoduleTypeCode = code; 
            }
            variationService.getVariationSubmoduleType = function (){
                return tempVariationData.submoduleTypeCode;
            }

            return variationService;
        });
})(window.angular);
