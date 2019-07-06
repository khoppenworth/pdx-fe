'use strict';

angular.module('pdx.controllers')
  .controller('ProductDetailController', function ($state, $filter, $stateParams, PublicFactory, $http, AppConst, CommonService, $sce, $uibModal) {
    var vm = this;

    vm.productID = $stateParams.id;

    //A call back when tab changes in tabbed view
    vm.tabChanged = function (tabIndex) {
      switch (tabIndex) {
        case 0:
          if (!vm.product || vm.product.length == 0) {
            loadProductData();
          }
          break;
        case 1:
          if (!vm.product || vm.product.length == 0) {
            loadProductData();
          }
          break;
        case 2:
          if(!vm.moduleDocuments || vm.moduleDocuments.length == 0 ){
            loadProductAttachment();
          }
          break;
        case 3:
          if (!vm.agents || vm.agents.length == 0) {
            loadProductAgents();
          }
          break;
        default:
          if (!vm.product || vm.product.length == 0) {
            loadProductData();
          }
      }
    };

    //Data for agent detail tab
    function loadProductData() {
      vm.product = PublicFactory.productDetail.get({id: vm.productID});
    }

    //By default tab 0 is opened!
    vm.activeTab = 0;

    function loadProductAgents() {
      vm.agents = PublicFactory.productAgent.query({productId: vm.productID});
    }

    function loadProductAttachment() {
      vm.productAttachments = PublicFactory.productAttachment.query({productId: vm.productID});
    };


    vm.openFileModal = function(document) {
      $http.post(CommonService.buildUrlObj(AppConst.API_URL.Attachment.AttachmentSingle, {
        id: document.id,
      }), {}, {
        responseType: 'arraybuffer'
      })
        .success(function(response) {
          var file = new Blob([response], {
            type: document.fileType
          })
          var fileURL = URL.createObjectURL(file)
          document.fileContent = $sce.trustAsResourceUrl(fileURL)
        })

      // Open modal
      $uibModal.open({
        templateUrl: 'app/importPermit/list/modals/fileModal.html',
        size: 'lg',
        resolve: {
          document: document
        },
        controller: function($scope, document) {
          $scope.document = document
        }
      })
    }
    vm.downloadAttachment = function(idocument) {
      var a = document.createElement('a')
      document.body.appendChild(a)
      $http.post(CommonService.buildUrlObj(AppConst.API_URL.Attachment.AttachmentSingle, {
        id: idocument.id,
      }), {}, {
        responseType: 'arraybuffer'
      })
        .success(function(response) {
          var file = new Blob([response], {
            type: idocument.fileType
          })
          vm.fileURL = URL.createObjectURL(file)
          vm.fileContent = $sce.trustAsResourceUrl(vm.fileURL)
          a.href = vm.fileContent
          a.download = idocument.moduleDocument.documentType.name
          a.click()
        })
    }




  });
