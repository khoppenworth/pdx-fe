'use strict';

angular.module('pdx.services')
    .service('CommonService', function(AppConst, StorageService, EnvironmentConfig) {
        var commonService = {};

        commonService.buildUrl = function(resourceUrl, id) {
            return commonService.buildUrlObj(resourceUrl, { id: id });
        };

        commonService.buildUrlObj = function(resourceUrl, obj) {
            var rootApiUrl = EnvironmentConfig.RootAPIURL;

            var properties = _.keys(obj);
            _.each(properties, function(prop) {
                if (!_.isUndefined(obj[prop])) {
                    resourceUrl = resourceUrl.replace(':' + prop, obj[prop]);
                }
            });

            return rootApiUrl + resourceUrl;
        };

        commonService.newGuid = function() {
            var s = [];
            var hexDigits = "0123456789abcdef";
            for (var i = 0; i < 36; i++) {
                s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
            }
            s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
            s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
            s[8] = s[13] = s[18] = s[23] = "-";
            return s.join("");
        };

        commonService.validate = function(validationObject) {
            if (commonService.isEmpty(validationObject)) {
                return true;
            }
            var stack = [];
            iterate(validationObject, '');

            //set isValid false if validationObject is empty
            var isValid = stack.length > 0;

            _.each(stack, function(s) {
                isValid = isValid && s.Value;
            });

            //flatten validation object
            function iterate(obj, stackStr) {
                var properties = _.filter(_.allKeys(obj), function(prop) { return prop.indexOf('$') < 0; });

                _.each(properties, function(property) {
                    var objValue = obj[property];
                    var newProperty = stackStr + '.' + property;
                    if (_.isObject(objValue)) {
                        iterate(objValue, newProperty);
                    } else {
                        stack.push({ Name: newProperty, Value: objValue });
                    }
                });
            }
            return isValid;
        };

        commonService.validateSingleObject = function(objValue) {
            return !commonService.isEmpty(objValue);
        };

        commonService.isEmpty = function(obj) {
            var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;

            var property = function(key) {
                return function(obj) {
                    return obj == null ? void 0 : obj[key];
                };
            };
            var getLength = property('length');
            var isArrayLike = function(collection) {
                var length = getLength(collection);
                return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
            };
            if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) {
                return obj.length === 0;
            }
            if (_.isNumber(obj)) return _.isNaN(obj);
            if (_.isDate(obj)) return _.isNull(obj.__proto__);
            if (_.isObject(obj)) {
                return _.keys(obj).length === 0;
            }
            return obj == null || _.isUndefined(obj);
        };


        commonService.displayRowNumber = function(data, type, full, meta) {
            return meta.row + meta.settings._iDisplayStart + 1;
        };

        commonService.cleanUpNull = function(data, type, full, meta) {
            return (data ? data : "-");
        };

        commonService.setReturnUrl = function(url) {
            //Do not set login as a return url.
            if (url.indexOf('/login') > 0) {
                return;
            }
            StorageService.set(AppConst.StorageKeys.ReturnUrl, url);
        };

        commonService.getReturnUrl = function() {
            return StorageService.get(AppConst.StorageKeys.ReturnUrl);
        };

        commonService.resetReturnUrl = function() {
            return StorageService.remove(AppConst.StorageKeys.ReturnUrl);
        };

        //checks if a value is Null or Undefined.
        // Returns true if data is Neither null nor undefined.
        commonService.checkUndefinedOrNull = function(data) {
            return angular.isDefined(data) && data !== null;
        };

        commonService.LoadSavedDataTableStatus = function(settings, data) {
            var o;

            o = JSON.parse(localStorage.getItem('DataTables_' + settings.sInstance + '_/' + settings.sTableId));
            return o;
        };

        commonService.SaveDataTableStatus = function(settings, data) {
            localStorage.setItem('DataTables_' + settings.sInstance + '_/' + settings.sTableId, JSON.stringify(data));
        };

        commonService.RemoveDataTableStatus = function() {
            _.each(_.allKeys(localStorage), function(key) {
                if (/^DataTables_/.test(key)) {
                    localStorage.removeItem(key);
                }
            });
        };

        //This function sets a value to internal property of an object
        /*
         * For example if vm = {data:{innerData:{internalData:[123]}}},   string = data.innerData.internalData, and data = 785,
         * calling  setInternalVMObject(vm,string,data) is equivalent to vm.data.innerData.internalData = 785;
         * Important if the string values are obtained dynamically and cannot use "dot notation'
         * Like pointer in C
         *
         * if concat is true, data is concatenated than replaced.
         * */
        commonService.setInternalVMObject = function(vm, string, data, concat, metaData) {
            var temp;
            var reference = string.split('.');
            var dataModel = vm;
            while (reference.length > 1) {
                var current = reference[0];
                if (current == 'vm' || current == 'scope' || current == '$scope') {
                    //skip vm.,  scope.  or $scope.
                } else {
                    temp = dataModel[current];
                    //If model is not found, return the previously found object!
                    if (temp == undefined) {
                        return;
                    } else {
                        dataModel = temp;
                    }
                }
                reference.shift();
            }
            if (concat === true) {
                if (dataModel[reference[0]].length >= AppConst.SearchAndPaginate.MaxDataCount) {
                    metaData.clipped += 50;
                    //Item count is very large, so remove the first 50 and append the obtained result.
                    dataModel[reference[0]] = dataModel[reference[0]].slice(50);
                }
                dataModel[reference[0]] = dataModel[reference[0]].concat(data);
            } else {
                dataModel[reference[0]] = data;
            }
        };

        //Returns a search Function with a given search api, dataModel to be updated.
        //*
        // Inputs,
        //      vm ($scope) the scope variable (needed because we need to directly update the model for view binding
        //      SearchAPI (The api that is used to search the data
        //      dataModel (String format) extract it from the binding to be updated from $scope or (vm)
        //      pageNo -> paging number
        //      pageSize -> paging size;
        // Outputs,
        //      Search callback Function to be invoked by angularUI select (uiSelectChoicesCustomized) whenever loadmore/search keyword is entered

        // */
        commonService.SearchAndPaginate = function(vm, SearchAPI, dataM, pageSize) {

            var APIFactory = SearchAPI;
            var pageNo = pageNo !== undefined ? pageNo : 0;
            var pageSize = pageSize !== undefined ? pageSize : 50;
            var temp;
            var modelName = dataM;
            var dataM = dataM.split('.');
            var VM = vm;
            var dataModel = vm;
            while (dataM.length > 0) {
                var current = dataM[0];
                if (current == 'vm' || current == 'scope' || current == '$scope') {
                    //skip vm.,  scope.  or $scope.
                } else {
                    temp = dataModel[current];
                    //If model is not initialized(or defined, initialize it to empty array).
                    if (temp == undefined) {
                        dataModel[current] = [];
                    } else {
                        dataModel = temp;
                    }
                }
                dataM.shift();
            }

            return function($select, $event) {
                var keyWords = $select.search;
                if (keyWords == "") keyWords = " ";
                if (!$event) {
                    pageNo = 0;
                } else {
                    $event.stopPropagation();
                    $event.preventDefault();
                    pageNo++;
                }
                // SubmoduleTypeCode
                var submoduleTypeCode = angular.isDefined(vm.submoduleTypeCode) ? vm.submoduleTypeCode : null;
                //SubmoduleCode
                var subModule = angular.isDefined(vm.maregistration) ? vm.maregistration.ma.maType : { maTypeCode: null };
                var subModuleCode = subModule.maTypeCode;

                APIFactory.save({ query: keyWords, pageNumber: pageNo, pageSize: pageSize, submoduleTypeCode: submoduleTypeCode, submoduleCode: subModuleCode }, function(data) {
                    var vmModel = data.data;
                    //Holds metaData information about the data!
                    var temp = $select.collectionMetaData.clipped;
                    $select.collectionMetaData = { draw: data.draw, error: data.error, recordsFiltered: data.recordsFiltered, recordsTotal: data.recordsTotal };
                    $select.collectionMetaData.clipped = temp;
                    var concat = false;
                    if ($event) {
                        concat = true;
                    }
                    commonService.setInternalVMObject(VM, modelName, vmModel, concat, $select.collectionMetaData);

                });
            };

        };

        commonService.draftActiveNumberOfDate = function(draft) {
            var durationFromToday = moment().diff(moment(draft.modifiedDate), 'days');
            var duration = durationFromToday <= 1 ? durationFromToday + ' day' : durationFromToday + ' days';
            return duration;
        };

        return commonService;
    });