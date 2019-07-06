(function() {
    'use strict';

    angular.module('pdx.factories')
        .factory('ChangelogFactory', function($resource, AppConst, CommonService) {
            var changeLog = {};

            changeLog.releaseTypes = [{ name: "Major", code: 1 }, { name: "Minor", code: 2 }, { name: "Hot-fix", code: 3 }];

            changeLog.changelogTags = [{ name: "Added", priority: 1 }, { name: "Changed", priority: 2 }, { name: "Fixed", priority: 3 },
                { name: "Depricated", priority: 4 }, { name: "Security", priority: 5 }
            ];

            changeLog.getAllChangelogs = $resource(CommonService.buildUrl(AppConst.API_URL.Changelog.AllChangeLogs), {}, AppConst.ResourceMethods.Readonly);

            changeLog.insertOrUpdate = $resource(CommonService.buildUrl(AppConst.API_URL.Changelog.InsertOrUpdate), {}, AppConst.ResourceMethods.Save);
            return changeLog;
        });
})();