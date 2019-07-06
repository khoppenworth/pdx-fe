(function() {
    'use strict';

    angular
        .module('pdx', [
            'ngAnimate',
            'ngCookies',
            'ngTouch',
            'ngSanitize',
            'ngMessages',
            'ngAria',
            'ngResource',
            'ui.router',
            'ui.bootstrap',


            'ngStorage',
            'ui.select',
            'ngFileUpload',
            'datatables',
            'datatables.buttons',
            'angular-loading-bar',
            'uiSwitch',
            'cp.ngConfirm',
            'cgNotify',
            'ncy-angular-breadcrumb',
            'ngIdle',
            'ngIntlTelInput',
            'angularMoment',
            'chart.js',
            'daterangepicker',
            'blockUI',
            'ng.deviceDetector',
            'slick',
            'ui.tree',
            'angularTrix',
            'smart-table',
            'ui.bootstrap.datetimepicker',

            'pdx.factories',
            'pdx.services',
            'pdx.directives',
            'pdx.controllers',
            'pdx.filters',
            'pdx.config',
            'pdx.pushNotification'
        ]);

    //Init
    angular.module('pdx.factories', []);
    angular.module('pdx.services', []);
    angular.module('pdx.directives', []);
    angular.module('pdx.controllers', []);
    angular.module('pdx.filters', []);
})();