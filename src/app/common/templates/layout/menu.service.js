'use strict';

angular.module('pdx.services')
    .service('MenuService', function() {

        this.menuItems = [];

        var $menuItemsRef = this;

        var menuItemObj = {
            parent: null,

            title: '',
            link: '',
            state: '',
            icon: '',

            isActive: false,
            label: null,

            menuItems: [],

            setLabel: function(label, color, hideWhenCollapsed) {
                if (typeof hideWhenCollapsed == 'undefined')
                    hideWhenCollapsed = true;

                this.label = {
                    text: label,
                    classname: color,
                    collapsedHide: hideWhenCollapsed
                };

                return this;
            },

            addItem: function(title, link, icon) {
                var parent = this,
                    item = angular.extend(angular.copy(menuItemObj), {
                        parent: parent,

                        title: title,
                        link: parent.link == '' ? link : parent.link + '/' + link,
                        icon: icon
                    });

                if (item.link) {
                    if (item.link.match(/^\./))
                        item.link = parent.link + item.link.substring(1, link.length);

                    if (item.link.match(/^-/))
                        item.link = parent.link + '-' + item.link.substring(2, link.length);

                    item.state = $menuItemsRef.toStatePath(item.link);
                }

                this.menuItems.push(item);

                return item;
            }
        };

        function unflatten(array, parent, tree) {

            tree = typeof tree !== 'undefined' ? tree : [];
            parent = typeof parent !== 'undefined' ? parent : { id: null };

            var children = _.filter(array, function(child) { return child.parentMenuID == parent.id; });

            if (!_.isEmpty(children)) {
                if (_.isNull(parent.id)) {
                    tree = children;
                } else {
                    parent['Children'] = children
                }
                _.each(children, function(child) { unflatten(array, child) });
            }

            return tree;
        }

        function addSubMenu(parentMenu, subMenus) {
            _.each(subMenus, function(submenu) {
                var parentSubMenu = parentMenu.addItem(submenu.name, submenu.url, submenu.icon);
                if (typeof submenu.Children !== 'undefined') {
                    addSubMenu(parentSubMenu, submenu.Children)
                }
            });
        }

        this.addItem = function(title, link, icon) {
            var item = angular.extend(angular.copy(menuItemObj), {
                title: title,
                link: link,
                state: this.toStatePath(link),
                icon: icon
            });

            this.menuItems.push(item);
            return item;
        };

        this.prepareMenus = function(menus) {
            var unflattenMenus = unflatten(menus);
            for (var i = 0; i < unflattenMenus.length; i++) {
                var parent = unflattenMenus[i];
                var parentMenu = this.addItem(parent.name, parent.url, parent.icon);
                addSubMenu(parentMenu, parent.Children);
            }
            return this;
        };

        this.toStatePath = function(path) {
            return path.replace(/\//g, '.').replace(/^\./, '');
        };

        this.getAll = function() {
            return this.menuItems;
        };

        this.instantiate = function() {
            return angular.copy(this);
        };

        this.setActive = function(path) {
            this.iterateCheck(this.menuItems, this.toStatePath(path));
        };

        this.setActiveParent = function(item) {
            item.isActive = true;
            item.isOpen = true;

            if (item.parent)
                this.setActiveParent(item.parent);
        };

        this.iterateCheck = function(menuItems, currentState) {
            angular.forEach(menuItems, function(item) {
                if (item.state == currentState) {
                    item.isActive = true;

                    if (item.parent != null)
                        $menuItemsRef.setActiveParent(item.parent);
                } else {
                    item.isActive = false;
                    item.isOpen = false;

                    if (item.menuItems.length) {
                        $menuItemsRef.iterateCheck(item.menuItems, currentState);
                    }
                }
            });
        };

    });