'use strict';

angular.module('pdx.directives')
    //Directive used to set metisMenu and minimalize button
    .directive('metis', function($timeout) {
        return function($scope, $element, $attrs) {
            if ($scope.$last == true) {
                $timeout(function() {
                    angular.element('#side-menu').metisMenu();
                }, 250)
            }
        };
    })
    .directive('minimalizaSidebar', function($timeout) {
        return {
            restrict: 'A',
            template: '<a class="navbar-minimalize minimalize-styl-2 btn btn-primary " href="" ng-click="minimalize()"><i class="fa fa-bars"></i></a>',
            controller: function($scope) {
                $scope.minimalize = function() {
                    angular.element('body').toggleClass('mini-navbar');
                    if (!angular.element('body').hasClass('mini-navbar') || angular.element('body').hasClass('body-small')) {
                        // Hide menu in order to smoothly turn on when maximize menu
                        angular.element('#side-menu').hide();
                        // For smoothly turn on menu
                        $timeout(function() {
                            angular.element('#side-menu').fadeIn(400);
                        }, 200);
                    } else {
                        // Remove all inline style from jquery fadeIn function to reset menu state
                        angular.element('#side-menu').removeAttr('style');
                    }
                };
            }
        };
    })
    .directive('buttonGroup', function($timeout, $filter) {
        return {
            restrict: 'E',
            require: "ngModel",
            replace: true,
            templateUrl: 'app/common/directives/templates/buttonGroup.html',
            scope: {
                lookups: '<lookups',
                model: '=ngModel',
                style: '<?groupStyle'
            },
            link: function(scope, element, attrs, ngModelCtrl) {

                // scope.lookups = $filter('orderBy')(scope.lookups, 'priority');
                resetClass();

                scope.onClick = function(model) {
                    ngModelCtrl.$setViewValue(model);
                    setActiveClass(model);
                };

                scope.$watchCollection('lookups', function(newValue, oldValue) {
                    if (!(_.isUndefined(newValue) || _.isNull(newValue) || newValue.length == 0)) {
                        scope.lookups = $filter('orderBy')(scope.lookups, 'priority');
                        setActiveClass(scope.model);
                    }
                });

                scope.$watch('model', function(newValue, oldValue) {
                    if (!(_.isUndefined(newValue) || _.isNull(newValue))) {
                        setActiveClass(scope.model);
                    }
                }, true);

                function setActiveClass(model) {
                    var lookup = _.find(scope.lookups, function(lk) {
                        return lk.id == model;
                    });
                    resetClass();
                    if (lookup) {
                        lookup.class = 'active';
                    }
                };

                function resetClass() {
                    _.each(scope.lookups, function(lk) {
                        lk.class = '';
                    });
                }
            }
        };
    })
    .directive('fileUploader', function() {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'app/common/directives/templates/fileUploader.html',
            scope: {
                attachmentInfo: '=',
                largeFile: '@'
            },
            controller: function($scope, $rootScope, Upload, $timeout, $location, CommonService, AppConst) {
                //take Maximum allowed file size from system settings
                var maxSize = $scope.largeFile == "true" ? $rootScope.settings.DFS + "MB" : $rootScope.settings.UFS + "MB";
                $scope.uploaderConfig = {
                    maxSize: maxSize,
                    accept: "'image/*,application/pdf'"
                };

                $scope.uploadFiles = function(file, errFiles) {
                    $scope.f = file;
                    $scope.errFile = errFiles && errFiles[0];
                    if (file) {

                        var data = angular.extend({ file: file }, $scope.attachmentInfo);
                        data.fileType = file.type;
                        data.originalFileName = file.name;
                        data.document = undefined;

                        file.upload = Upload.upload({
                            url: CommonService.buildUrl(AppConst.API_URL.Attachment.Attachment),
                            data: data
                        });

                        file.upload.then(function(response) {
                            $timeout(function() {
                                if (response.status == 200) {
                                    file.result = response.data;
                                    $scope.attachmentInfo.document = file.result;
                                    $scope.attachmentInfo.fileName = file.name;
                                    $scope.$emit('fileUploadedSuccessfully', file);
                                }
                            });

                        }, function(error) {
                            if (error.status > 0)
                                $scope.errorMsg = error.status + ': ' + error.data;

                        }, function(evt) {
                            file.progress = Math.min(100, parseInt(100.0 *
                                evt.loaded / evt.total));
                        });
                    } else if ($scope.errFile) {
                        $scope.errorMsg = 'Error in uploading your file. Please check file size does not exceed ' + maxSize + '.';
                    }
                }
            }
        };
    })
    .directive('ngValidate', function(CommonService, $parse) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, element, attrs, ngModel) {
                if (!ngModel) return;

                scope.$watch(function() {
                    return ngModel.$modelValue;
                }, function(newValue) {
                    var isValid = CommonService.validateSingleObject(newValue);
                    var model = $parse(attrs.ngValidate);
                    model.assign(scope, isValid);
                });

            }
        };
    })
    .directive('ngValidateForm', function(CommonService) {
        return {
            restrict: 'A',
            scope: {
                ngValidateForm: '='
            },
            link: function(scope, element, attr) {
                scope.$watch('ngValidateForm', function(newValue) {
                    if (!_.isUndefined(newValue) && !_.isNull(newValue)) {
                        scope.ngValidateForm.$isValid = CommonService.validate(newValue);
                    }
                }, true);

            }
        };
    })
    .directive('file', function() {
        return {
            restrict: 'E',
            scope: {
                value: '=',
                type: '='
            },
            link: function(scope, element, attrs) {
                scope.$watch('value', function(newValue) {
                    if (newValue) {
                        element.replaceWith('<object type="' + scope.type + '" data="' + newValue + '" style=" width: 210mm; min-height: 297mm;" align="center"></object>');
                    }
                }, true);

            }
        };
    })
    .directive('permission', function(AccountService) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {

                scope.$watch(attrs.permission, function(value) {
                    var permission = value;
                    var hasPermission = false;
                    if (_.isString(permission)) {
                        hasPermission = AccountService.hasThisPermission(permission)
                    } else if (_.isArray(permission)) {

                        hasPermission = AccountService.hasThesePermissions(permission) //multiple permissions
                    }

                    toggleVisibility(hasPermission);
                });

                function toggleVisibility(hasPermission) {
                    if (hasPermission) {
                        element.show();
                    } else {
                        element.hide();
                    }
                }
            }
        };
    })
    .directive('reportWidget', function($timeout, $compile, $filter) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                reportData: '=reportData'
            },
            link: function($scope, element, attrs) {

                $scope.$watch('reportData', function(reportData) {

                    if (reportData) {
                        //set widget width
                        var width = _.isNull(reportData.width) || _.isUndefined(reportData.width) ? 4 : reportData.width;
                        $scope.colWidth = "col-lg-" + width + " col-md-" + width + " col-sm-12 col-xs-12";

                        var reportType = reportData.reportType.toLowerCase();
                        $scope.dynamicTemplateUrl = 'app/common/directives/templates/report/' + reportType + '.tmpl.html';
                        $timeout(function() {
                            $scope.reportOptions = getExtraReportOptions(reportData, $filter);
                        }, 0);
                    }
                }, true);
            },

            template: '<ng-include src="dynamicTemplateUrl"></ng-include>'
        };
    })
    .directive('reportFilter', function($timeout, $compile) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                filterData: '=filterData'
            },
            link: function($scope, element, attrs) {

                $scope.date = { startDate: null, endDate: null };
                $scope.opts = {
                    ranges: {
                        'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                        'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                        'Last 3 Months': [moment().subtract(3, 'months'), moment()],
                        'Last 6 Months': [moment().subtract(6, 'months'), moment()]
                    }
                };

                $scope.$watch('filterData', function(filterData) {
                    if (filterData) {
                        var type = filterData.type.toLowerCase();
                        arrangeFilterValue(filterData);
                        $scope.dynamicTemplateUrl = 'app/common/directives/templates/reportFilters/' + type + '.tmpl.html';
                    }
                });
            },

            template: '<ng-include src="dynamicTemplateUrl"></ng-include>'
        };
    })
    .directive('icheck', function($timeout, $compile) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function($scope, element, $attrs, ngModel) {
                return $timeout(function() {
                    var value;
                    value = $attrs['value'];

                    $scope.$watch($attrs['ngModel'], function(newValue) {
                        $(element).iCheck('update');
                    })

                    return $(element).iCheck({
                        checkboxClass: 'icheckbox_square-green',
                        radioClass: 'iradio_square-green'

                    }).on('ifChanged', function(event) {
                        if ($(element).attr('type') === 'checkbox' && $attrs['ngModel']) {
                            $scope.$apply(function() {
                                return ngModel.$setViewValue(event.target.checked);
                            });
                        }
                        if ($(element).attr('type') === 'radio' && $attrs['ngModel']) {
                            return $scope.$apply(function() {
                                return ngModel.$setViewValue(value);
                            });
                        }
                    });
                });
            }
        };
    })
    .directive('showOn', function() {
        return function(scope, element, attrs) {
            var test = scope.$eval(attrs.showOn);
            if (test === true) {
                element.show()
            } else {
                element.hide()
            }
        };

    })
    .directive('boxTools', function($timeout) {
        return {
            restrict: 'A',
            scope: true,
            templateUrl: 'app/common/directives/templates/box_tools.html',
            controller: function($scope, $element) {
                // Function for collapse ibox
                $scope.showhide = function() {
                    var ibox = $element.closest('div.ibox');
                    var icon = $element.find('i:first');
                    var content = ibox.find('div.ibox-content');
                    content.slideToggle(200);
                    // Toggle icon from up to down
                    icon.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
                    ibox.toggleClass('').toggleClass('border-bottom');
                    $timeout(function() {
                        ibox.resize();
                        ibox.find('[id^=map-]').resize();
                    }, 50);
                };
                // Function for close ibox
                $scope.closebox = function() {
                    var ibox = $element.closest('div.ibox');
                    ibox.remove();
                };
            }
        };
    })


/*
 * uiSelectChoicesCustom directive *************
 * Customized for this app, specifically for Search and Refresh use of angular-uiSelect
 * Abstracted the use of refresh attribute for uiSelectChoices directive for angularUISelect
 *
 * usage ->     <ui-select-choices-custom  collection="vm.collection"   refresh-callback ="callbackapiurl"></ui-select-choices-custom>
 *
 *      where   "collection" is where the data will be put in scope (vm) variable.   For example, for a list of suppliers, vm.suppliers.
 *              if vm.suppliers is not defined in scope, it will internally be populated to []. So beware of naming.
 *
 *              "refresh-callback" is an object reference to api url for the search call back function  as to be defined in AppConst.API_URL.
 *
 *      Both attributes are required, and error will be thrown if missing
 *
 *      **  Apart from "repeat" and "refresh" attributes, all other attributes of uiSelectChoices (original) directive can also be used.
 *
 *  N.B.
 *      Currently, this directive is dependent on VM declaration of controllers (controllerAs vm). Won't work on other cases
 *      "repeat" and "refresh-callback" attributes will be overwritten internally, so setting them in html is useless.
 *      The directive interally creates callback functions and add them to scope.  For example for a "collection" vm.supplier, format of callback will be
 *                vm.vm_supplier_search();
 *      This directive relies on CommonService.SearchAndPaginate function.
 * //TODO :  modularize the code.
 * //TODO : remove dependence on "vm"  (controllerAs vm)
 * */
.directive('uiSelectChoicesCustom', ['uiSelectConfig', 'uisRepeatParser', 'uiSelectMinErr', '$compile', '$window', 'AppConst', 'CommonService', '$resource',
    function(uiSelectConfig, RepeatParser, uiSelectMinErr, $compile, $window, AppConst, CommonService, $resource) {

        var constructAPI = function(string) {
            var parts = string.split('.');
            var apiURL = AppConst.API_URL;
            while (parts.length > 0) {
                apiURL = apiURL[parts[0]];
                parts.shift();
            }

            return $resource(CommonService.buildUrl(apiURL), {
                query: "@query",
                pageNumber: "@pageNumber",
                pageSize: "@pageSize"
            }, AppConst.ResourceMethods.Save);
        }
        return {
            restrict: 'EA',
            require: '^uiSelect',
            replace: true,
            transclude: true,
            templateUrl: function(tElement) {
                // Needed so the uiSelect can detect the transcluded content
                tElement.addClass('ui-select-choices');

                // Gets theme attribute from parent (ui-select)
                var theme = tElement.parent().attr('theme') || uiSelectConfig.theme;
                return theme + '/choices.tpl.html';
            },

            compile: function(tElement, tAttrs) {

                if (!tAttrs.collection) throw uiSelectMinErr('collection', "Expected 'collection' expression.");
                if (!tAttrs.refreshCallback) throw uiSelectMinErr('refershCallback', "Expected 'refresh-callback' expression.");
                var collection = tAttrs.collection;
                var callBackAPI = tAttrs.refreshCallback;
                tAttrs.repeat = "item in " + tAttrs.collection + " | filter: $select.search |orderBy:'name'";
                tAttrs.refreshDelay = (tAttrs.refreshDelay != undefined || tAttrs.refreshDelay != null) ? tAttrs.refreshDelay : "500";
                var callBackFunctionName = collection.replace(/\./g, '_') + '_search';
                tAttrs.refresh = 'vm.' + callBackFunctionName + '($select)';

                // var repeat = RepeatParser.parse(attrs.repeat);
                var groupByExp = tAttrs.groupBy;
                var groupFilterExp = tAttrs.groupFilter;

                if (groupByExp) {
                    var groups = tElement.querySelectorAll('.ui-select-choices-group');
                    if (groups.length !== 1) throw uiSelectMinErr('rows', "Expected 1 .ui-select-choices-group but got '{0}'.", groups.length);
                    groups.attr('ng-repeat', RepeatParser.getGroupNgRepeatExpression());
                }

                var parserResult = RepeatParser.parse(tAttrs.repeat);

                var choices = tElement.querySelectorAll('.ui-select-choices-row');
                if (choices.length !== 1) {
                    throw uiSelectMinErr('rows', "Expected 1 .ui-select-choices-row but got '{0}'.", choices.length);
                }

                choices.attr('ng-repeat', parserResult.repeatExpression(groupByExp))
                    .attr('ng-if', '$select.open'); //Prevent unnecessary watches when dropdown is closed


                var rowsInner = tElement.querySelectorAll('.ui-select-choices-row-inner');

                if (rowsInner.length !== 1) {
                    throw uiSelectMinErr('rows', "Expected 1 .ui-select-choices-row-inner but got '{0}'.", rowsInner.length);
                }
                var rowsI = ' <div ng-hide="$select.items.length==1 && $select.items[0].name==$select.search" ng-bind-html="item.name | highlight: $select.search "></div>\n' +
                    '<div style="background-color:initial;" ng-if="$index == $select.items.length-1 && $select.items.length >= $select.pageSize && ' +
                    '$select.items.length + $select.collectionMetaData.clipped < $select.collectionMetaData.recordsFiltered ' +
                    '&& $select.items.length + $select.selected.length +  ' +
                    '$select.collectionMetaData.clipped< $select.collectionMetaData.recordsFiltered ">\n' +
                    ' <button class="btn btn-xs btn-primary" style="width: 100%; margin-top: 5px;"\n' +
                    '            ng-click="vm.' + callBackFunctionName + '($select, $event);"\n' +
                    '            ng-disabled="loading">Load more...\n' +
                    ' </button>\n' +
                    '</div>';
                rowsInner.append(rowsI);
                rowsInner.attr('uis-transclude-append', ''); //Adding uisTranscludeAppend directive to row element after choices element has ngRepeat

                // If IE8 then need to target rowsInner to apply the ng-click attr as choices will not capture the event.
                var clickTarget = $window.document.addEventListener ? choices : rowsInner;
                clickTarget.attr('ng-click', '$select.select(' + parserResult.itemName + ',$select.skipFocusser,$event)');

                return function link(scope, element, attrs, $select) {
                    attrs.minimumInputLength = parseInt(attrs.minimumInputLength) || 2;
                    $select.parseRepeatAttr(attrs.repeat, groupByExp, groupFilterExp); //Result ready at $select.parserResult
                    $select.disableChoiceExpression = attrs.uiDisableChoice;
                    $select.onHighlightCallback = attrs.onHighlight;
                    $select.minimumInputLength = attrs.minimumInputLength;
                    $select.dropdownPosition = attrs.position ? attrs.position.toLowerCase() : uiSelectConfig.dropdownPosition;

                    //Generate searchFactory from callBackAPI
                    var searchFactory = constructAPI(callBackAPI);

                    $select.pageSize = AppConst.SearchAndPaginate.PageSize;
                    $select.collectionMetaData = { draw: 0, error: null, recordsFiltered: 0, recordsTotal: 100, clipped: 0 };
                    if (attrs.userCanAdd) {
                        $select.userCanAdd = scope.$eval(attrs.userCanAdd);
                    }

                    scope.vm[callBackFunctionName] = CommonService.SearchAndPaginate(scope.vm, searchFactory, collection, $select.pageSize);

                    scope.$watch('$select.search', function(newValue) {
                        if (newValue && !$select.open && $select.multiple) $select.activate(false, true);
                        $select.activeIndex = $select.tagging.isActivated ? -1 : 0;
                        if (!attrs.minimumInputLength || $select.search.length >= attrs.minimumInputLength) {
                            $select.refresh(attrs.refresh);
                        } else {
                            // $select.items = [];
                        }
                    });

                    attrs.$observe('refreshDelay', function() {
                        // $eval() is needed otherwise we get a string instead of a number
                        var refreshDelay = scope.$eval(attrs.refreshDelay);
                        $select.refreshDelay = refreshDelay !== undefined ? refreshDelay : uiSelectConfig.refreshDelay;
                    });

                    scope.$watch('$select.open', function(open) {
                        if (open) {
                            tElement.attr('role', 'listbox');
                            //If no search was conducted, refresh the list from the api
                            //This could be used as an initialization for the first time (While no search was done)
                            if ($select.search.length == 0 && scope.$eval(collection).length == 0) {
                                $select.refresh(attrs.refresh);
                            }
                        } else {
                            element.removeAttr('role');
                        }
                    });

                    scope.$on('uis:refresh', function() {

                    });
                };
            }
        };
    }
])


/*
 * userInput directive - extending angular ui select to help users add their own lookups if not existing
 * Usage ->   to use this directive
 *              1.  First change the ui-select theme   to "bootstrap_custom"
 *              2. Add this directive to ui-select with the param api_url as   user-input="API_URL",
 *              where "API_URL" is the API url defined in AppConst to Add a new look up.
 *
 * Process
 *          1. Open modal to allow user to add a look up (only if $select.items is empty. So that user should be sure
 *             what they are looking for doesn't exist by searching)
 *          2. Call API to add the lookup to db (using the provided API_URL in user-input directive
 *          3. Call SearchAPI (which should be API_URL + /search) to populate lookups searching by the newly added name
 *          4. Update $select.items with the search results
 *          5. Update selected value ($select.selected) with the newly added value!
 * */
.directive('userInput', function uiSelectUserInput(AppConst, CommonService, $resource, $ngConfirm, $timeout, NotificationService) {

    var constructAPI = function(string) {
        var parts = string.split('.');
        var apiURL = AppConst.API_URL;
        while (parts.length > 0) {
            apiURL = apiURL[parts[0]];
            parts.shift();
        }
        return apiURL;
    }
    var RefreshAPI = function(apiURL) {
        return $resource(CommonService.buildUrl(apiURL), {
                id: "@id",
                query: "@query",
                pageNumber: "@pageNumber",
                pageSize: "@pageSize"
            },
            AppConst.ResourceMethods.All);
    }



    return {
        restrict: 'A',
        require: 'uiSelect',
        link: function($scope, element, $attrs, $select) {
            $select.disableAddButton = true;
            if ($select.multiple) {
                /* A function to override the internal sizeSearchInputMethod in uiSelect Controller*/
                var sizeWatch = null;
                var updaterScheduled = false;
                $select.sizeSearchInput = function() {

                    var input = $select.searchInput[0],
                        container = $select.searchInput.parent().parent()[0],
                        calculateContainerWidth = function() {
                            // Return the container width only if the search input is visible
                            return container.clientWidth * !!input.offsetParent;
                        },
                        updateIfVisible = function(containerWidth) {
                            if (containerWidth === 0) {
                                return false;
                            }
                            var inputWidth = containerWidth - 34.33;
                            if (inputWidth < 50) inputWidth = containerWidth;
                            $select.searchInput.css('width', inputWidth + 'px');
                            return true;
                        };

                    $select.searchInput.css('width', '100%');
                    $timeout(function() { //Give tags time to render correctly
                        if (sizeWatch === null && !updateIfVisible(calculateContainerWidth())) {
                            sizeWatch = $scope.$watch(function() {
                                if (!updaterScheduled) {
                                    updaterScheduled = true;
                                    $scope.$$postDigest(function() {
                                        updaterScheduled = false;
                                        if (updateIfVisible(calculateContainerWidth())) {
                                            sizeWatch();
                                            sizeWatch = null;
                                        }
                                    });
                                }
                            }, angular.noop);
                        }
                    });
                };
            }
            var url = constructAPI($attrs.userInput);
            $select.allowUserInput = true;
            $select.newLookUpValidation = {};
            $select.newLookUp = { name: undefined };
            $select.addNewLookup = function(userInput) {
                if (!$select.search || $select.search.length <= 1) {
                    return;
                }
                $select.disableAddButton = false;
                var regex = new RegExp('^' + $select.search.trim() + '$', 'gim');
                var exactMatch = _.some($select.items, function(data) {
                    return regex.test(data.name);
                });
                if (exactMatch) {
                    NotificationService.notify('Searched item already exists. Please check again!', 'alert-warning');
                    return;
                }
                $select.newLookUp = { name: $select.search };
                $ngConfirm({
                    title: 'Add Look Up',
                    contentUrl: 'app/registration/templates/new_lookup.html',
                    type: '',
                    typeAnimated: true,
                    closeIcon: true,
                    scope: $scope,
                    columnClass: 'col-md-6 col-md-offset-3',
                    buttons: {
                        Add: {
                            text: 'Add',
                            btnClass: 'btn-primary',
                            action: function() {
                                $select.newLookUpValidation.$showError = true;
                                if ($select.newLookUpValidation.$isValid) {
                                    var saveParams = getLookupURLParameters($scope.vm, url, AppConst);
                                    saveParams.name = $select.newLookUp.name;

                                    RefreshAPI(url).save(saveParams, function() {
                                        var searchParams = getLookupURLParameters($scope.vm, url, AppConst);
                                        searchParams.pageNumber = 0;
                                        searchParams.pageSize = 50;
                                        searchParams.query = $select.newLookUp.name;
                                        RefreshAPI(url + '/Search').save(searchParams,
                                            function(data) {
                                                $select.items = data.data;
                                                var selected = _.find($select.items, function(it) {
                                                    return it.name == $select.newLookUp.name;
                                                });
                                                $select.select(selected);

                                            });
                                    });
                                } else {
                                    return false;
                                }
                            }
                        }
                    }
                });
                $select.disableAddButton = true;
            };

        }
    };
});


var getExtraReportOptions = function(reportData, $filter) {
    var reportOptions = {};
    //chart variables
    var chartData = { title: reportData.title, description: reportData.description, series: [], labels: [], data: [] };
    var chartOptions = {
        legend: {
            display: true,
            position: 'bottom'
        },
        showTooltips: true,
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: {
                left: 10
            }
        }
    };

    switch (reportData.reportType) {
        case 'DoughnutChart':
        case 'PieChart':
        case 'PolarAreaChart':
            {
                //configure chart data
                _.each(reportData.data, function(d, index) {
                    chartData.labels.push(d.name);
                    chartData.data.push(d.value);
                });

                if (reportData.reportType == 'DoughnutChart') {
                    //configure chart options
                    chartOptions.cutoutPercentage = 40;
                }


                angular.extend(reportOptions, { options: chartOptions });
                angular.extend(reportOptions, chartData);
                break;
            }
        case 'LineChart':
        case 'BarChart':
        case 'StackedBarChart':
        case 'HorizontalBarChart':
        case 'RadarChart':
            {
                if (!_.isNull(reportData.series)) {
                    //series
                    chartData.series = reportData.series;

                    //configure chart data
                    _.each(reportData.series, function(sr, index) {
                        var points = [];
                        _.each(reportData.data, function(d) {
                            points.push(d[sr.toLowerCase()]);
                        });
                        chartData.data.push(points);
                    });
                } else {
                    chartOptions.legend.display = false;
                }

                //configure chart labels
                _.each(reportData.data, function(d, index) {
                    chartData.labels.push($filter('typeof')(d.name));
                    if (_.isNull(reportData.series)) {
                        chartData.data.push(d.value);
                    }
                });

                if (reportData.reportType == 'StackedBarChart') {
                    chartOptions.scales = {
                        xAxes: [{
                            stacked: true
                        }],
                        yAxes: [{
                            stacked: true
                        }]
                    };
                }
                angular.extend(reportOptions, { options: chartOptions });
                angular.extend(reportOptions, chartData);
                break;
            }
        default:
            {
                angular.extend(reportOptions, reportData);
            }

    }

    reportOptions.dataLoaded = reportData.dataLoaded;
    reportOptions.dataAvailable = reportData.dataAvailable;

    return reportOptions;
};

var arrangeFilterValue = function(filter) {
    switch (filter.type) {
        case 'DateRange':
            {
                filter.ObjectValue = { startDate: null, endDate: null };
                break;
            }
        case "Integer":
            {
                filter.ObjectValue = { id: null, name: null };
                break;
            }
        case "String":
            {
                filter.ObjectValue = null;
                break;
            }
        case "Date":
            {
                filter.ObjectValue = { startDate: null, endDate: null };
                break;
            }
    }
};

function getLookupURLParameters(vm, url, AppConst) {
    // SubmoduleTypeCode
    var submoduleTypeCode = angular.isDefined(vm.submoduleTypeCode) ? vm.submoduleTypeCode : null;
    //SubmoduleCode
    vm.subModule = angular.isDefined(vm.maregistration) ? vm.maregistration.ma.maType : { maTypeCode: null };

    var params = {};

    //lookups that use submoduleType
    if (url === AppConst.API_URL.Commodity.INN || url === AppConst.API_URL.LookUp.PackSize) {
        params.submoduleTypeCode = submoduleTypeCode;
    } else if (url === AppConst.API_URL.Commodity.ProductType) { //lookups that use submoduleTypeCode and submodule
        params.submoduleTypeCode = submoduleTypeCode;
        params.submoduleCode = vm.subModule.maTypeCode;
    }
    return params;
}