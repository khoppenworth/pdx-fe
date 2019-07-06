'use strict';

angular.module('pdx.services')
    .factory('StorageService', function($localStorage) {
        var storageService = {};

        //read value from localStorage by a key
        storageService.get = function(key) {
            if ($localStorage[key] != undefined) return angular.fromJson($localStorage[key]);
            return undefined;
        };
        //store any value in localStorage by a given key
        storageService.set = function(key, value) {
            $localStorage[key] = angular.toJson(value);
        };
        //remove stored value
        storageService.remove = function(key) {
            delete $localStorage[key];
        };

        storageService.removeAll = function() {
            delete $localStorage.$reset();
        };

        storageService.removeAllExcept = function(exceptions) {
            var temp = [];
            var vm = this;
            if (angular.isArray(exceptions)) {
                _.each(exceptions, function(except) {
                    temp.push({ key: except, value: vm.get(except) });
                })
                vm.removeAll();
                _.each(temp, function(rebuild) {
                    vm.set(rebuild.key, rebuild.value);
                })
            } else {
                temp = { key: exceptions, value: vm.get(exceptions) };
                vm.removeAll();
                vm.set(temp.key, temp.value);
            }
        }

        return storageService;
    });
