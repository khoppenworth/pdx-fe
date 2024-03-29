'use strict'
angular.module('pdx.filters')
  .filter('propsFilter', function () {
    return function (items, props) {
      var out = [];

      if (angular.isArray(items)) {
        var keys = Object.keys(props);

        items.forEach(function (item) {
          var itemMatches = false;

          for (var i = 0; i < keys.length; i++) {
            var prop = keys[i];
            var text = props[prop].toLowerCase();
            if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
              itemMatches = true;
              break;
            }
          }

          if (itemMatches) {
            out.push(item);
          }
        });
      } else {
        // Let the output be the input untouched
        out = items;
      }

      return out;
    };

  })
  .filter('countDown', function () {
    function padLeft(nr, n, str) {
      return new Array(n - String(nr).length + 1).join(str || '0') + nr;
    }

    return function (countdown) {
      var remaining = {totalSeconds: countdown};
      remaining.minutes = Math.floor(countdown / 60);
      remaining.seconds = padLeft(countdown - remaining.minutes * 60, 2);
      return remaining.minutes + ':' + remaining.seconds;
    };

  })
  .filter('typeof', function ($filter) {
    return function (obj) {
      var object = obj;
      var type = typeof obj;

      function isInt(value) {
        return !isNaN(value) &&
          parseInt(Number(value)) == value &&
          !isNaN(parseInt(value, 10));
      }

      switch (type) {
        case 'string':
          //Check if obj is date string
          if (moment(obj, moment.ISO_8601, true).isValid()) {
            object = $filter('date')(obj, "dd/MM/yyyy");
          }
          break;
        case 'object':
          if (_.isDate(obj)) {
            object = $filter('date')(obj, "dd/MM/yyyy");
          }
          break;
        case 'boolean':
          object = obj == true ? 'Yes' : 'No';
          break;
        case 'number':
          object = $filter('number')(obj, isInt(obj) ? 0 : 2);
          break;
      }

      return object;
    }
  })

  //this filter shortens .. such formats (2 day(s), 5 minutes(s) ..   to 2 d, 5 m ...  like that)
  // which usually are generated by duration.humanize() methods of moment library
  // It retains unchanged values like a day , a minute...
  .filter('shortenDuration', function () {
    var re = /(\d+\s+)(months?|days?|seconds?|years?|minutes?|hours?)/gi;
    var extracFirtLetter = function (match, offset, string) {
      return offset + string.charAt(0).toLowerCase();
    }
    return function (value) {
      var data = value.replace(re, extracFirtLetter);
      return data;
    }
  })

  .filter('filterNull', function () {

    return function (data) {
      return (data && data !== "null") ? data : '-';
    }
  })
  .filter('applicationType', function () {

    return function (data) {
      if (data == "REN") {
        return "Renewal"
      } else if (data == 'NMR') {
        return 'New Application'
      } else if (data == 'VAR') {
        return 'Variation'
      } else {
        return '-';
      }

    }
  })

  .filter('capitalizeFirstLetter', function () {

    return function (data) {
      if (typeof(data) === "string") {
        if (data.length <= 1) {
          return data.toUpperCase()
        }
        return data.substring(0, 1).toUpperCase() + data.substring(1);
      } else {
        return data;
      }

    }
  })

  .filter('fromNow', function () {
    return function (date, from) {
      var a = new moment(date);
      from = from ? from : new Date();
      var b = new moment(from);
      return a.from(b);
    }
  })


  .filter('reportFilter', function ($filter) {
    return function (obj, type) {
      var filtered;
      type = type.toLowerCase();
      switch (type) {
        case 'string':
          filtered = obj;
          break;
        case 'boolean':
          filtered = obj == true ? 'Yes' : 'No';
          break;

        case 'numeric':
        case 'integer':
          filtered = $filter('number')(obj, 0);
          break;
        case 'decimal':
          filtered = $filter('number')(obj, 2);
          break;

        case 'daterange':
          filtered = $filter('date')(obj);
          break;
        default:
          filtered = obj; //No match so just return itself;

      }

      return filtered;
    }
  })
