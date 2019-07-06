(function () {
  'use strict';

  angular
    .module('pdx')
    .config(notificationRouterConfig);

  /** @ngInject */
  function notificationRouterConfig($stateProvider) {
    $stateProvider
      .state('notification', {
        url: '/notification',
        parent: 'app',
        views: {
          'contentContainer@app': {
            templateUrl: 'app/notification/notification.list.html',
            controller: 'PushNotificationListController',
            controllerAs: 'vm'
          }
        },
        ncyBreadcrumb: {
          label: 'Notifications',
          pageTitle: 'Notifications'
        }
      });
  }

})();
