angular.module('pdx.directives')
    .directive('tmpl', detail);

function detail($compile) {
    console.log('sss');
    var directive = {};

    directive.restrict = 'A';
    directive.templateUrl = 'app/importPermit/list/templates/_childIpermit.html';
    directive.transclude = true;
    directive.link = function(scope, element, attrs) {

    }
    return directive;
}
