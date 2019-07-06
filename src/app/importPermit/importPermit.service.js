'use strict';

angular.module('pdx.services')
    .service('RoleService', function(AccountService) {

        var roleService = {}

        roleService.setVisibility = function(permittedRoles) {
            var userInfo = AccountService.userInfo()
            var roles = userInfo.roles;
            var show = false;
            _.each(roles, function(r) {
                if (!show) {
                    show = _.contains(permittedRoles, r.roleCode);
                }
            })
            return show;
        }
        return roleService;
    })
    .service('ProcurementHelper', function($q, ImportPermitFactory, $http, CommonService, AppConst, $ngConfirm) {
        var procurementHelper = {};

        procurementHelper.checkDuplicateProforma = function(proformaNumber, supplier, agent, ip) {
            return $q(function(resolve, reject) {
                if (proformaNumber == "" || supplier == undefined || agent == undefined) {
                    resolve(false); // return false as an indication of inability to check duplicate.
                    // Simply it means there is an unfilled filled to check duplicate
                    //Handle this by the validation handles in the form
                } else {
                    // Check for duplicate using api.
                    // Return (resolve) true/false if api successfully returns response
                    // Return (reject) error directly if api is not successful
                    var CheckDuplicates = {
                        importPermitId: ip,
                        supplierId: supplier.id,
                        agentId: agent.id,
                        PerformaInvoiceNumber: proformaNumber
                    }
                    $http({
                        method: 'POST',
                        url: CommonService.buildUrl(AppConst.API_URL.ImportPermit.CheckInvoiceDuplicate),
                        data: CheckDuplicates
                    }).success(function(response) {
                        resolve(response)
                    }).error(function(error) {
                        reject(error);
                    })
                }
            })
        }

        //Calculates total amount(price) for IP/PIP, make sures total discount enters is not more than that of total price
        /*
         *Inputs:
         *    1. products (Array of objects)  Each object should contain: unit price, quantity, and product level discount for each item
         *    2. freightCost (number) : freight cost for the procurement
         *    3. totalDiscount (number) : total discount for the procurment
         *    4. showHeaderDiscount (boolean?undefined?null)  : if total discount is selected or not. if not selected, short circuit the operation.
         *
         *Outputs: obj({status:true/false,  totalDiscount:amount}(true/totalPrice) :
         *     Status;  true -> total discount is equal to or less than total procurement price [or totalDiscount is not selected at all]
         *       fale -> total discount is more than total procurement discount.
         *
         *
         *NB. during current implementation, we cannot have both totalDiscount and productDiscount.
         * This implies if headerDiscount is selected, there is no need to subtract detail discounts.
         * */
        procurementHelper.validateTotalDiscount = function(products, freightCost, totalDiscount, showHeaderDiscount) {
            //Check if headerDiscount is selected; if not short circuit. (return true).
            if (!CommonService.checkUndefinedOrNull(showHeaderDiscount) || showHeaderDiscount == false) {
                return { status: true, totalPrice: 0 };
            }
            var totalPrice = freightCost;
            _.each(products, function(pd) {
                totalPrice = totalPrice + (pd.quantity * pd.unitPrice)
            });


            return { status: ((totalPrice - totalDiscount) >= 0), totalPrice: totalPrice }; // return true if totalDiscount is greaterthan or equal to totalPrice .. else false;

        }

        procurementHelper.showTotalDiscountValidationError = function(totalPrice, totalDiscount) {
            $ngConfirm({
                title: 'Total Discount Error!',
                content: '<div>Total discount you entered is greater than total price.</div>' +
                    '<div>Please check the total discount in General Requirement\'s Page</div>' +
                    '<div>Or Each product price in this page!</div><br/>' +
                    '<div>Total Price: ' + totalPrice + '</div>' +
                    '<div>Total Discount: ' + totalDiscount + '</div>',
                type: 'red',
                closeIcon: true
            })
        }


        return procurementHelper;
    })
    .service('ImportPermitService', function(ImportPermitFactory, IMPORT_PERMIT_CONST, NotificationService, $state) {
        return {
            autoGenerateImportPermit: autoGenerateImportPermit,
            autoGenerateForRequestedImportPermit: autoGenerateForRequestedImportPermit
        };

        function autoGenerateImportPermit(importPermit, blockUI) {
            blockUI.start('Processing Import Permit...');
            var errorMessage = "Unable to finish generating Import Permit. Please try again!";
            importPermit.currentStatusCode = IMPORT_PERMIT_CONST.CURRENT_STATUS_CODE.Requested;
            ImportPermitFactory.autoImportPermit.save(importPermit, function(response) {
                // Import Permit Requested
                if (!response.isSuccess) return;
                blockUI.message(response.message);
                importPermit = response.result;
                importPermit.currentStatusCode = IMPORT_PERMIT_CONST.CURRENT_STATUS_CODE.SubmittedForApproval;
                ImportPermitFactory.autoImportPermit.save(importPermit, function(response) {
                    //Import Permit Submitted for Approval 
                    blockUI.message(response.message);
                    importPermit = response.result;
                    importPermit.currentStatusCode = IMPORT_PERMIT_CONST.CURRENT_STATUS_CODE.Approved;
                    ImportPermitFactory.autoImportPermit.save(importPermit, function(response) {
                        //Import Permit Submitted for Approval 
                        blockUI.message(response.message);
                        NotificationService.notify("Import Permit Certificate Generated Successfully, Please Print and use it for your purpose", 'alert-warning', 60000); //duration = 0 will prevent auto close
                        blockUI.stop();
                        $state.go('ipermit.list.info', { ipermitId: importPermit.importPermit.id });

                    }, function() {
                        blockUI.stop();
                        NotificationService.notify(errorMessage, 'alert-danger');
                    });

                }, function() {
                    blockUI.stop();
                    NotificationService.notify(errorMessage, 'alert-danger');
                });

            }, function() {
                blockUI.stop();
                NotificationService.notify(errorMessage, 'alert-danger');
            });

        }

        function autoGenerateForRequestedImportPermit(importPermit, blockUI) {
            blockUI.start('Resubmitting Import Permit...');
            var errorMessage = "Unable to finish generating Import Permit. Please try again!";
            importPermit.currentStatusCode = IMPORT_PERMIT_CONST.CURRENT_STATUS_CODE.SubmittedForApproval;
            ImportPermitFactory.autoImportPermit.save(importPermit, function(response) {
                //Import Permit Submitted for Approval 
                blockUI.message(response.message);
                importPermit = response.result;
                importPermit.currentStatusCode = IMPORT_PERMIT_CONST.CURRENT_STATUS_CODE.Approved;
                ImportPermitFactory.autoImportPermit.save(importPermit, function(response) {
                    //Import Permit Submitted for Approval 
                    blockUI.message(response.message);
                    NotificationService.notify("Import Permit Certificate Generated Successfully, Please Print and use it for your purpose", 'alert-warning', 60000); //duration = 0 will prevent auto close
                    blockUI.stop();
                    $state.reload();
                }, function() {
                    blockUI.stop();
                    NotificationService.notify(errorMessage, 'alert-danger');
                });
            }, function() {
                blockUI.stop();
                NotificationService.notify(errorMessage, 'alert-danger');
            });

        }
    });