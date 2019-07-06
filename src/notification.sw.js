// // Import and configure the Firebase SDK

importScripts('/bower_components/firebase/firebase.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
// Initialize Firebase
var config = {
  apiKey: "AIzaSyB2yzReuwm1WSjrW91wpzLqxqzzz-Kl8zg",
  authDomain: "jsi-ethiopia-notification.firebaseapp.com",
  databaseURL: "https://jsi-ethiopia-notification.firebaseio.com",
  projectId: "jsi-ethiopia-notification",
  storageBucket: "jsi-ethiopia-notification.appspot.com",
  messagingSenderId: "545048901387"
};
firebase.initializeApp(config);
// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
var messaging = firebase.messaging();


//TODO:: Find a way to unregister this service worker once it is the tab is closed
