'use strict';

angular.module('pdx.controllers')
    .controller('fieldsModalController', function($scope, $timeout) {

        var fvm = this;


        // !important create a variable
        fvm.data = $scope.$parent.vm.data;
        // MA Editable Fields


        fvm.notify = function(node, sc) {
            notifyChildren(node, sc);

            notifyParent(node.parentFieldID);
        };

        function notifyChildren(node, sc) {
            if (node.children.length > 0) {
                // if (node.fieldCode === 'MA') {
                if (sc && sc.collapsed && node.isSelected) {
                    fvm.expandAll(sc);
                } else if (sc && !sc.collapsed && !node.isSelected) {
                    fvm.collapseAll(sc);
                }

                _.each(node.children, function(ch) {
                    ch.isSelected = node.isSelected;
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
                                ch.isSelected = true;
                                parent.isSelected = true;
                            }
                        });
                    }

                    if (ch.isSelected) {
                        parent.isSelected = true;
                    }

                });

                notifyParent(parent.parentFieldID);
            }
        }

        function findParentById(tree, parentId) {
            var parent = _.find(tree, function(tempParent) {
                return tempParent.field.id === parentId;
            });

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
            $timeout(function() {
                fvm.changed = !fvm.changed;
            }, 0, true);

        };

        fvm.expandAll = function(scope) {
            scope.$broadcast('angular-ui-tree:expand-all');
            $timeout(function() {
                fvm.changed = !fvm.changed;
            }, 100, true);
        };
        fvm.collapseAll = function(scope) {
            scope.$broadcast('angular-ui-tree:collapse-all');
            $timeout(function() {
                fvm.changed = !fvm.changed;
            }, 100, true);
        };

    });