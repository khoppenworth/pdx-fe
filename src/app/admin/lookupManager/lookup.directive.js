angular.module('pdx.directives')
    .directive('dynamicField', function(LookupService) {
        return {
            restrict: 'E',
            transclude: true,
            require: "?^form",
            scope: {
                fieldConfig: '=',
                fieldValue: '=',
                editMode: '=',
                id: '='
            },
            link: function(scope, element, attr, form) {
                scope.bind = {
                    popup: {},
                    disabled: scope.editMode && !scope.fieldConfig.editable,
                    // isGeneric: _.includes(['text', 'number', 'checkbox'], scope.fieldConfig.type),
                    isGeneric: false,
                    openPopup: _openPopup
                }
                scope.form = form;
                if (scope.fieldConfig.model == 'submoduleType') {
                    LookupService.allLookupResources['subModuleType'].query({}).$promise.then(function(data) {
                        scope.fieldConfig.options = _.map(data, LookupService.mapToOptions);
                    });
                }

                function _openPopup(id) {
                    scope.bind.popup[id] = { opened: true };
                }
            },
            templateUrl: 'app/admin/lookupManager/templates/modalFormFields.html'
        };
    });