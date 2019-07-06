(function () {
  'use strict';

  angular.module('pdx')
    .constant('LookupConst', (function () {

      var LOOKUP_INSTANCE_FIELDS = {
        columns: function (colArray, codeName) {
          var cols = [];
          var codeCol;
          _.each(colArray, function (col) {
            codeCol = angular.copy(FIELDS[col])
            if (col == 'code')
              codeCol.model = codeName;
            cols.push(codeCol)
          })
          return cols;
        }
      }

      var LOOKUP_DEF = function (def) {
        return {
          id: def.id,
          resourceAccessName: ACCESS_ORDER[def.id - 1],
          name: def.name,
          description: '-',
          lastModified: '',
          columns: LOOKUP_INSTANCE_FIELDS.columns(def.cols, def.codeName),
          selectedLookup: {},
          data: []
        }
      }

      var ACCESS_ORDER = [
        'importPermitType',
        'manufacturerType',
        'payment',
        'userType',
        'paymentTerm',
        'subModuleType',
        'maType'
      ]

      var FIELDS = {
        name: {
          label: 'Name',
          type: 'text',
          model: 'name',
          required: true,
          editable: false,
        },
        description: {
          label: 'Description',
          type: 'text',
          model: 'description',
          required: false,
          editable: true
        },
        code: {
          label: 'Code',
          type: 'text',
          model: 'code',
          required: true,
          editable: false
        },
        shortName: {
          label: 'Short Name',
          type: 'text',
          model: 'shortName',
          required: false,
          editable: true
        },
        displayName: {
          label: 'Display Name',
          type: 'text',
          model: 'displayName',
          required: false,
          editable: true
        },
        isActive: {
          label: 'Is Active',
          type: 'checkbox',
          model: 'isActive',
          required: false,
          editable: true
        },
        submoduleTypeID: {
          label: 'Sub-Module Type',
          type: 'select',
          model: 'submoduleType',
          options: [],
          required: true,
          editable: true
        },
        dateField:  {
          label: 'Date Field Type',
          type: 'date',
          model: 'dateField',
          required: true,
          editable: true
        }
      }

      return {
        API_URL: {
          ImportPermitTypes: "ImportPermitType/:id",
          UserType: 'UserType/:id',
          ManufacturerType: 'ManufacturerType/:id',
          PaymentMode: 'PaymentMode/:id',
          PaymentTerm: 'paymentTerm/:id',
          SubmoduleType: 'SubmoduleType/:id',
          MaType: 'MAType/:id'
        },

        FIELDS: FIELDS,

        LOOKUPS: [LOOKUP_DEF({
          id: 1,
          name: 'Import Permit Type',
          cols: ['name', 'shortName', 'code', 'description', 'isActive', ],
          codeName: 'importPermitTypeCode',

        }), LOOKUP_DEF({
          id: 2,
          name: 'Manfacturer Type',
          cols: ['name', 'code', 'isActive'],
          codeName: 'manufacturerTypeCode',
        }), LOOKUP_DEF({
          id: 3,
          name: 'Payment Mode',
          cols: ['name', 'shortName', 'code', 'description', 'isActive'],
          codeName: 'paymentCode',
        }), LOOKUP_DEF({
          id: 4,
          name: 'User Type',
          cols: ['name', 'shortName', 'code', 'description', 'isActive'],
          codeName: 'userTypeCode',
        }), LOOKUP_DEF({
          id: 5,
          name: 'Payment Term',
          cols: ['name', 'shortName', 'code', 'description', 'isActive'],
          codeName: 'paymentTermCode',
        }), LOOKUP_DEF({
          id: 6,
          name: 'Submodule Type',
          cols: ['name', 'code', 'description', 'isActive'],
          codeName: 'submoduleTypeCode',
        }), LOOKUP_DEF({
          id: 7,
          name: 'MAType',
          cols: ['name', 'code', 'submoduleTypeID', 'isActive'],
          codeName: 'maTypeCode',
        })]

      }
    })())
})();
