angular.module('pdx.directives')
    .directive('ma', maChildDetail)
    .directive('maChildMedicalDevice', maChildMedicalDevice);

function maChildDetail() {
    var directive = {};
    directive.restrict = 'A';
    directive.templateUrl = 'app/registration/list/templates/_childMA.html';
    directive.transclude = true;
    return directive;
}

//ma child product list for medical devices
function maChildMedicalDevice() {
  var directive = {};
  directive.restrict = 'A';
  directive.templateUrl = 'app/registration/list/templates/_childMA_MedicalDevice.html';
  directive.transclude = true;
  return directive;
}
