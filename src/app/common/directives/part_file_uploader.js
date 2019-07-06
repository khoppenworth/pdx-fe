angular.module('pdx.directives')
//Directive used to set metisMenu and minimalize button
  .directive('partFileUploader', function ($timeout) {
    return function ($scope, $element, $attrs) {
      $scope.uploadFile = function(file){
        if(file==null) return false;
        $scope.endByte = 0;

        $scope.file = file;
        $scope.fileDetail = {
          isLastPart:false,
        };
        $scope.getPartSize();
      };


      $scope.getPartSize = function(){
        var file;
        $scope.startByte = $scope.endByte;
        $scope.endByte = $scope.endByte+102400000;
        $scope.fileDetail.part++;
        if($scope.endByte>=$scope.fileDetail.filesize){
          $scope.endByte = $scope.fileDetail.filesize;
          $scope.fileDetail.isLastPart = true;
        }
        $scope.fileDetail.startOffset = $scope.startByte;
        $scope.fileDetail.endOffset = $scope.endByte;
        file = $scope.file.slice($scope.startByte,$scope.endByte);
        $scope.upload(file);
      };


      $scope.upload = function (file) {
        if(file!=null){
          Upload.upload({
            url: 'Api Url',
            data:{
              file:file,
              'fileDetails':$scope.fileDetail,
            },
            uploadEventHandlers:{
              progress: function(e){

              }
            },
            ignoreLoadingBar: false,
          }).then(function (resp) {
            if(resp.data!=""){
              $scope.getPartSize();
            }
          }, function (resp) {}, function (evt) {});
        }
      };

    };
  })

