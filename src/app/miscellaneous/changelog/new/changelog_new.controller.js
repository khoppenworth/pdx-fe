(function() {


    'use strict';
    angular.module('pdx.controllers')
        .controller('ChangelogNewController', function(AppConst, $http, $sce, $state, ChangelogFactory, NotificationService) {
            var vm = this;
            var counter = 0;
            var index = 1;


            vm.releaseTypes = angular.copy(ChangelogFactory.releaseTypes);
            vm.Tags = angular.copy(ChangelogFactory.changelogTags);
            vm.addNewTag = function() {
                counter = counter + 1;
                index = counter % 5;
                vm.changeLog.changeLogs.push({
                    "priority": vm.Tags[index].priority,
                    "label": vm.Tags[index],
                    "logs": [{
                        "id": counter,
                        "priority": counter,
                        name: ""
                    }]
                });
            };

            var emptyChangeLog = function() {
                vm.changeLog = {
                    "version": undefined,
                    "versionNumber": undefined,
                    "releaseType": vm.releaseTypes[0],
                    "releaseTypeCode": vm.releaseTypes[0].code,
                    "releaseDate": new Date(),
                    "summary": "Major breaking changes introduced",
                    "changeLogs": [{
                        "priority": vm.Tags[0].priority,
                        "label": vm.Tags[0],
                        "logs": [{
                            "id": 1,
                            "priority": 2,
                            name: ""
                        }]
                    }]
                };
            };

            emptyChangeLog();


            vm.insertOrUpdate = function() {
                var model = {
                    "version": vm.changeLog.version,
                    "releaseDate": vm.changeLog.releaseDate,
                    "contentObject": vm.changeLog,
                    "content": "",
                    "isActive": true
                };
                ChangelogFactory.insertOrUpdate.save(model, function() {
                    NotificationService.notify("Change log successfully saved!", "alert-success");
                    emptyChangeLog();
                    $state.go('changelog.list');
                }, function() {
                    NotificationService.notify("Unable to save, pleas try again!", "alert-danger");
                });

            };

        });


})();