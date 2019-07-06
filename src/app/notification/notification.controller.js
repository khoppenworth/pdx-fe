'use strict';

angular.module('pdx.pushNotification')
    .controller('PushNotificationController', function(PushNotificationFactory, $rootScope, AccountService, $scope, $ngConfirm, $state) {
        var vm = this;

        vm.unreadCount = 0;
        vm.notifications = [];
        vm.bellOpened = false;

        //methods
        vm.markAsRead = markAsRead;
        vm.seeAllNotifictions = seeAllNotifictions;
        vm.requestPermission = requestPermission;

        activate();

        function activate() {
            loadRecentNotifications();
            loadUnreadNotificationCount();
            initPushNotification();
        }


        function markAsRead(notification) {
            $state.go('notification');
            if (notification.isRead === false) {
                PushNotificationFactory.markAsRead.update({}, notification, function() {
                    //If successfully marked as read, reload unread count;
                    vm.unreadCount = (vm.unreadCount - 1) < 0 ? 0 : vm.unreadCount - 1;

                    notification.isRead = true;
                });
            }
        }

        function seeAllNotifictions() {
            $state.go('notification');

            var unreadNotifications = _.filter(vm.notifications, function(notification) {
                return !notification.isRead;
            });

            PushNotificationFactory.markAllAsRead.update({}, {}, function() {
                vm.unreadCount = 0;

                //Mark as read locally
                _.each(unreadNotifications, function(notification) {
                    notification.isRead = true;
                });
            });
        }

        function requestPermission(open) {
            //If notification modal is opened and Notification permission is not chosen by user, ask for notification permission.
            if (open && PushNotificationFactory.permissionStatus() === null) {
                $ngConfirm({
                    title: 'Allow notifications',
                    contentUrl: 'app/notification/templates/request_permission.html',
                    closeIcon: true,
                    type: 'blue',
                    icon: 'fa fa-info',
                    typeAnimated: true,
                    scope: $scope,
                    autoClose: 'later|7000',
                    buttons: {
                        ok: {
                            text: "Yes",
                            btnClass: 'btn-primary',
                            action: function() {
                                vm.bellOpened = false;
                                $scope.$apply();
                                PushNotificationFactory.requestPushPermission().then(function(status) {
                                    //If permission is granted, init pushNotification.
                                    if (status === 'granted') {
                                        //Notification is allowed, so Initialized it.
                                        initPushNotification();
                                    } else if (status === 'denied') {

                                        //TODO:: Properly Inform user that he/she opted not to receive notification and can only change that on browser setting
                                        $ngConfirm({
                                            title: 'Notifications blocked!',
                                            icon: 'fa fa-warning',
                                            content: '<p>You opted not to receive notification. You will not be able to receive real time notification.</p>' +
                                                '<p> If you change your mind you will have to allow it from the browser setting. </p>',
                                            type: 'red',
                                        });
                                    }
                                });
                                return true;
                            }
                        },
                        later: {
                            text: "Later",
                            btnClass: 'btn-warning',
                            action: function() {
                                return true;
                            }
                        }
                    }
                });

            }
        }

        function fcmSuccess(token) {
            $rootScope.fcmToken = token;
            var messaging = firebase.messaging(); //Get messaging instance.
            var subscriptionModel = {
                username: AccountService.userInfo().rowGuid,
                address: token,
                applicationCode: "eRIS"
            };
            PushNotificationFactory.updateSubscriptionOnServer.save({}, subscriptionModel);

            //What to do when a new message is received
            messaging.onMessage(function(payload) {
                vm.unreadCount = vm.unreadCount + 1;
                loadRecentNotifications();
                $scope.$apply();
            });

            // Callback fired if Instance ID token is updated.
            messaging.onTokenRefresh(function() {
                messaging.getToken().then(function(refreshedToken) {
                    var subscriptionModel = {
                        username: AccountService.userInfo().rowGuid,
                        address: refreshedToken,
                        applicationCode: "eRIS"
                    };
                    PushNotificationFactory.updateSubscriptionOnServer.save({}, subscriptionModel);
                }).catch(function(err) {
                    //Error occured in refreshing token;
                });
            });
        }

        function fcmErr(err) {}

        function loadRecentNotifications() {
            PushNotificationFactory.recentNotifications.save({}, {
                page: 1,
                pageSize: 5
            }, function(data) {
                vm.notifications = data.data;
            });
        }

        function loadUnreadNotificationCount() {
            PushNotificationFactory.unreadCount.get(function(data) {
                vm.unreadCount = data.unreadNotifications;
            });
        }

        function initPushNotification() {
            //if messaging is not already activated && Notification Permission is allowed, initialize it.
            PushNotificationFactory.init(AccountService.userInfo()).then(fcmSuccess, fcmErr);
        }

    });