'use strict';

angular.module('pdx.pushNotification')
    .factory('PushNotificationFactory', function($resource, AppConst, CommonService, $q) {

        var pushNotificationFactory = {};

        var constants = {
            config: {
                apiKey: "AIzaSyB2yzReuwm1WSjrW91wpzLqxqzzz-Kl8zg",
                authDomain: "jsi-ethiopia-notification.firebaseapp.com",
                databaseURL: "https://jsi-ethiopia-notification.firebaseio.com",
                projectId: "jsi-ethiopia-notification",
                storageBucket: "jsi-ethiopia-notification.appspot.com",
                messagingSenderId: "545048901387"
            }, //Obtained from Firebase project
            publicToken: 'BLNiYjYeJ8STEz976cmzRHuKvXwyy85uSauIG7jibWxf784nAMgqGIZ6EyZVOzpKlykCe28BU3ujCHq3Ozy1IjU', //Obtain from Firebase project
            serviceWorker: '/notification.sw.js'
        };

        pushNotificationFactory.init = function() {
            return $q(function(resolve, reject) {
                if ('serviceWorker' in navigator && 'PushManager' in window) {
                    navigator.serviceWorker.register(constants.serviceWorker, { scope: '/' })
                        .then(function(sw) {
                            var messaging = !firebase.apps.length ? null : firebase.messaging();
                            if (!messaging) {
                                //If firebase app is not already inialized, do so.
                                firebase.initializeApp(constants.config);

                                // Retrieve Firebase Messaging object.
                                messaging = firebase.messaging();

                                messaging.useServiceWorker(sw);

                                messaging.usePublicVapidKey(constants.publicToken);
                            }

                            // Get Instance ID token. Initially this makes a network call, once retrieved
                            // subsequent calls to getToken will return from cache.
                            messaging.getToken().then(function(currentToken) {
                                if (currentToken) {
                                    // Token successfully obtained.
                                    // Set Messaging Instance.
                                    // Resolve request.
                                    resolve(currentToken);
                                } else {
                                    //console.log('No Instance ID token available. Request permission to generate one.');
                                    // reject('No Instance ID token available. Request permission to generate one.')
                                    reject('Unable to get token id');
                                }
                            }).catch(function(err) {
                                // console.log('An error occurred while retrieving token. ', err);
                                // showToken('Error retrieving Instance ID token. ', err);
                                reject(err);
                            });
                        }, function(err) {
                            //Service worker registration failed.
                            reject(err);
                        });
                } else {
                    // reject('Service worker not available!');
                    var err = 'Service not supported by browser';
                    // reject(err);
                }
            });
        };

        pushNotificationFactory.requestPushPermission = function() {
            return Notification.requestPermission();
        };

        pushNotificationFactory.permissionStatus = function() {
            return Notification.permission == 'default' ? null : (Notification.permission == 'granted' ? true : false);
        }

        pushNotificationFactory.unregisterServiceWorker = function() {
          if(angular.isUndefined(navigator.serviceWorker)){
            return;
          }

          navigator.serviceWorker.getRegistrations().then(function(sws) {
                _.each(sws, function(sw) {
                    if (sw.active.scriptURL.includes('notification.sw.js')) {
                        sw.unregister();
                    }
                })
            }, function() {
                //Error occurred during finding registrations.
            });
        }

        pushNotificationFactory.updateSubscriptionOnServer = $resource('http://api.notification.hcmis.org/api/User/Mobile', {}, AppConst.ResourceMethods.Save);

        pushNotificationFactory.unreadCount = $resource(CommonService.buildUrl(AppConst.API_URL.Notification.UnreadCount), {}, AppConst.ResourceMethods.Readonly);

        pushNotificationFactory.notification = $resource(CommonService.buildUrl(AppConst.API_URL.Notification.Notification), { id: "@id" }, AppConst.ResourceMethods.Readonly);

        pushNotificationFactory.notificationList = $resource(CommonService.buildUrl(AppConst.API_URL.Notification.List), {}, AppConst.ResourceMethods.Save);

        pushNotificationFactory.recentNotifications = $resource(CommonService.buildUrl(AppConst.API_URL.Notification.Recent), {}, AppConst.ResourceMethods.Readonly);

        pushNotificationFactory.markAsRead = $resource(CommonService.buildUrl(AppConst.API_URL.Notification.MarkAsRead), {}, AppConst.ResourceMethods.All);

        pushNotificationFactory.markAllAsRead = $resource(CommonService.buildUrl(AppConst.API_URL.Notification.MarkAllAsRead), {}, AppConst.ResourceMethods.All);


        return pushNotificationFactory;


    });
