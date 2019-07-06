'use strict';

angular.module('pdx.controllers')
    .controller('FastTrackingController', function(FastTrackingFactory, $uibModal, $scope, $ngConfirm, NotificationService) {
        var vm = this;

      getFastTrackingList();

      function getFastTrackingList(){
        vm.fastTrackings = FastTrackingFactory.fastTracking.query({}, function (data) {
          return data;
        });
      }

      //Open modal for new Fast Tracking Item
        vm.openFTModal = function(ft) {
          var modalInstance = $uibModal.open({
                templateUrl: "app/admin/fastTracking/templates/fastTrackingAddModal.html",
                size: 'lg',

                controller: "FastTrackingModalController",
                controllerAs: 'vm',
                resolve: {
                    FastTracking: function() {
                        return ft;
                    }
                }
            });
          modalInstance.result.then(function(){
            getFastTrackingList();
          })
        };

        //Remove Fast Tracking Item
        vm.removeFT = function(ft,value) {
            $ngConfirm({
                title: !value?"Deactivate Fast Tracking Item":"Activate Fast Tracking Item",
                contentUrl: 'app/admin/fastTracking/templates/fastTrackingRemoveModal.html',
                type: !value?"red":"green",
                typeAnimated: true,
                closeIcon: true,
                scope: $scope,
                columnClass: 'col-md-6 col-md-offset-3',
                buttons: {
                    update: {
                        text: "Ok",
                        btnClass: "btn-danger",
                        action: function() {

                            ft.therapeuticGroupID =ft.therapeuticGroup.id;
                            ft.innid = ft.inn.id;
                            var model = angular.copy(ft);
                            model.therapeuticGroup = null;
                            model.inn = null;
                            model.isActive=value;
                            FastTrackingFactory.fastTracking.update({ id:""}, model, function(data) {
                                NotificationService.notify(!value?"Successfully deactivated!":"Successfully Activated", "alert-success");
                                getFastTrackingList();
                            }, function() {
                                NotificationService.notify("Unable to update data. Please try again!", "alert-danger");
                            });
                        }
                    }
                }
            });
        };

    });
