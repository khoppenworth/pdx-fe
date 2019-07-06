'use strict';

angular.module('pdx.controllers')
    .controller('SRAController', function(SRAFactory, $uibModal, $scope, $ngConfirm, NotificationService) {
        var vm = this;

      getSRAList();

      function getSRAList(){
        vm.sras = SRAFactory.sras.query({}, function (data) {
          return data;
        });
      }

      //Open modal for new SRA
        vm.openSRAModal = function(sra) {
          var modalInsatnce = $uibModal.open({
                templateUrl: "app/admin/sra/templates/sraAddModal.html",
                size: 'lg',

                controller: "SRAModalController",
                controllerAs: 'vm',
                resolve: {
                    SRA: function() {
                        return sra;
                    }
                }
            });
          modalInsatnce.result.then(function(){
            getSRAList();
          })
        };

        //Remove SRA
        vm.removeSRA = function(SRA) {
            $ngConfirm({
                title: "Delete SRA",
                contentUrl: 'app/admin/sra/templates/sraRemoveModal.html',
                type: "red",
                typeAnimated: true,
                closeIcon: true,
                scope: $scope,
                columnClass: 'col-md-6 col-md-offset-3',
                buttons: {
                    update: {
                        text: "Ok",
                        btnClass: "btn-danger",
                        action: function() {
                            SRAFactory.sras.delete({ id: SRA.id }, function(data) {
                                NotificationService.notify("Successfully deleted!", "alert-success");
                                getSRAList();
                            }, function() {
                                NotificationService.notify("Unable to delete data. Please try again!", "alert-danger");
                            });
                        }
                    }
                }
            });
        };

    });
