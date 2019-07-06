/**
 * Created by abenitrust on 4/5/17.
 */
'use strict';

angular.module('pdx.controllers')
    .controller('SystemSettingsController', function(AdminSystemSettingsFactory, $filter, NotificationService) {
        var vm = this;
        vm.descriptionText = 'admin setting managment page'
            // vm.title="Manage role menus";

        vm.showButtons = false;
        vm.updateList = [];

        function loadSettings() {
            AdminSystemSettingsFactory.settings.query(function(setting) {
                //Type Casting and filtering.
                _.each(setting, function(data) {
                    var inputType = mapDataTypeToInputType(data.dataType);
                    data.inputType = inputType;
                    if (inputType == 'date') {
                        data.valueObj = new Date(data.valueObj);
                    }
                });
                vm.systemSettings = $filter('orderBy')(setting, 'id');
            });
        }

        loadSettings();
        vm.notify = function(changedSetting) {
            if (!vm.showButtons) {
                //If button is not already shown .... show it.
                vm.showButtons = true;
            }
            if (vm.updateList.indexOf(changedSetting) === -1) {
                //the setting is not in update list .. so add it.
                vm.updateList.push(changedSetting);
            }
        }

        vm.cancelUpdate = function() {
            vm.updateList = [];
            vm.showButtons = false;
            loadSettings();
        }

        vm.updateSystemSetting = function() {
            _.each(vm.updateList, function(d) {
                d.value = d.valueObj;
            });
            AdminSystemSettingsFactory.updateSettings.save(vm.updateList, function() {
                vm.updateList = [];
                loadSettings();
                NotificationService.notify('Settings successfully updated', 'alert-success');
            })
        }

        var mapDataTypeToInputType = function(data) {
            var inputType = "text"; //default to text;
            switch (data.toLowerCase()) {
                case "integer":
                case "float":
                case "double":
                case "number":
                    inputType = "number";
                    break;
                case "boolean":
                    inputType = "boolean";
                    break;
                case "string":
                case "text":
                case "char":
                    inputType = "text";
                    break;
                case "date":
                case "date-time":
                    inputType = "date";
                    break;
                default:
                    inputType = "text";

            }


            return inputType
        }

    });