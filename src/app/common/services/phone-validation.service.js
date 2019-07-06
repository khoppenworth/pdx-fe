'use strict';

angular.module('pdx.services')
  .service('PhoneValidationService', function(AppConst) {
    var phoneValidationService = {};

    phoneValidationService.isValidNumber = function (number){
      //First check if the number length is valid - As defined in AppConst for each regex.
      //    If invalid number length, then Skip pattern matching for the sake of performance;
      //If there is valid lenght, proceed to pattering matching :  Loop through all the whitelist regex
      // checking a match of the given number in the white lists
      // If a match is found, return
      var i;
      for ( i=0; i<AppConst.PhoneWhiteList.length; i++) {
        if((number.length < AppConst.PhoneWhiteList[i].minLength) ||  (number.length > AppConst.PhoneWhiteList[i].maxLength)){
          continue;
        }
        var test = AppConst.PhoneWhiteList[i].pattern.exec(number);
        if(!_.isNull(test)){
          return true;
        }
      }

      return false;
    }

    return phoneValidationService;
  });
