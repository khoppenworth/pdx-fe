'use strict';

angular.module('pdx.controllers')
    .controller('fieldsModalModifiedController', function($scope, $timeout) {

        var fvm = this;
        // !important create a variable
        fvm.data = $scope.$parent.vm.data;
        // MA Editable Fields

        fvm.notify = function(node) {
            notifyChildren(node);

            notifyParent(node.parentFieldID);
        }

        function notifyChildren(node) {
            // node.isEditable = node.isSelected;
            if (node.children.length > 0) {
                _.each(node.children, function(ch) {
                    if (!ch.isDisabled) {
                        ch.isSelected = node.isSelected;
                        // ch.isEditable = ch.isSelected;
                    }
                    notifyChildren(ch);
                });
            }
        }

        function notifyParent(parentId) {
            if (!(_.isUndefined(parentId) || _.isNull(parentId))) {
                var parent = findParentById(fvm.data, parentId);

                parent.isSelected = false;
                _.each(parent.children, function(ch) {
                    if (ch.children.length > 0) {
                        //parent.isSelected = false;
                        ch.isSelected = false;
                        _.each(ch.children, function(grandCh) {
                            if (grandCh.isSelected) {
                                if (!ch.isDisabled) {
                                    ch.isSelected = true;
                                    // ch.isEditable = ch.isSelected;
                                    parent.isSelected = true;
                                    // parent.isEditable = parent.isEditable;
                                }
                            }
                        });
                    }

                    if (ch.isSelected) {
                        parent.isSelected = true;
                        // parent.isEditable = parent.isSelected;
                    }

                });

                notifyParent(parent.parentFieldID);
            }
        }

        function findParentById(tree, parentId) {
            var parent = _.find(tree, function(tempParent) {
                return tempParent.field.id === parentId;
            })

            var isParentFound = (parent === undefined);

            if (isParentFound) {
                _.each(tree, function(node) {
                    if (parent === undefined) {
                        parent = findParentById(node.children, parentId);
                    }
                });
            }
            return parent;
        }

        // until replaced by a custom filter
        // Adds space between words in camel case
        fvm.formatCamelCase = function(camelCase) {
            return camelCase.replace(/([a-z])([A-Z])/g, '$1 $2');
        };

        fvm.changed = true;

        fvm.toggle = function(scope) {
            scope.toggle();
            $timeout(function() { fvm.changed = !fvm.changed; }, 0, true);

        };

        fvm.nonSelectableVariation = function(fieldCode) {
            return _.contains(['ma', 'product'], fieldCode.toLowerCase());
        }

    });