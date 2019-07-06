(function(angular) {
    'use strict';

    angular.module('pdx.controllers')
        .controller('MAListController', function(AppConst, CommonService, AccountService, DTOptionsBuilder, DTColumnBuilder, $q,
            $compile, $scope, $state, $uibModal, RegistrationFactory, AdminUserMgmtFactory, $filter, $rootScope, $ngConfirm, NotificationService, WIPFactory, RoleService, RegistrationConst) {
            var vm = this;
            //Assign MA to CSO
            vm.assignCSO = _assignCSO;
            //Assign MA to Medicine Dossier Assesssor
            vm.assignMDA = _assignMDA;
            vm.onRoleSelected = _onRoleSelected;
            vm.assessorChanged = _assessorChanged;

            vm.discardDraft = _discardDraft;
            vm.gotoDraft = _gotoDraft;

            vm.suspend = _suspend;
            vm.cancel = _cancelApplication;

            vm.childInfo = _childInfo;
            vm.showRegistrationDetail = _showRegistrationDetail;

            vm.getStatusColor = _getStatusColor;
            vm.getAgentStatusColor = _getAgentStatusColor;
            vm.getAssessmentColor = _getAssessmentColor;


            init();

            function init() {
                vm.AssignValidation = {};
                vm.roleCode = '';
                vm.maAssigned = {};
                //for secondary assessor
                vm.maAssignedSecondary = {};
                vm.userInfo = AccountService.userInfo();
                vm.dtInstance = {};
                vm.CONSTANT = RegistrationConst;
                vm.datePickerOptions = {
                    minDate: new Date()
                };
                vm.displayWipActiveDate = CommonService.draftActiveNumberOfDate;
                loadWIP();
            }



            function loadWIP() {
                // vm.wips = [];
                var newApplicationWIP = WIPFactory.getAllWIP.query({
                    type: AppConst.Modules.NewApplication,
                    userID: vm.userInfo.id
                }).$promise;
                var renewal = WIPFactory.getAllWIP.query({ type: AppConst.Modules.Renewal, userID: vm.userInfo.id }).$promise;
                var variation = WIPFactory.getAllWIP.query({ type: AppConst.Modules.Variation, userID: vm.userInfo.id }).$promise;
                $q.all([newApplicationWIP, renewal, variation]).then(function(data) {
                    vm.wips = _.union(data[0], data[1], data[2]);
                });
            }



            vm.dtOptions = DTOptionsBuilder.newOptions()
                .withOption('ajax', {
                    url: CommonService.buildUrl(AppConst.API_URL.MA.MAList),
                    type: 'POST',
                    headers: {
                        Authorization: AccountService.token()
                    },
                    data: {
                        submoduleTypeCode: RegistrationFactory.getMaListApplicationFilter()
                    }
                })
                // or here
                .withOption('createdRow', function(row, data, dataIndex) {
                    // Recompiling so we can bind Angular directive to the DT
                    $compile(angular.element(row).contents())($scope);
                    if (data.expiryDays > 0) {
                        $(row).addClass('redClass');
                    } else if (($rootScope.settings.MANET * -1) < data.expiryDays && data.expiryDays < 0) {
                        $(row).addClass('yellowClass');
                    } else if (data.isFastTracking) {
                        $(row).addClass('blueClass');
                        // } else if (RoleService.setVisibility(['CST']) && true) {
                        //     $(row).addClass('redClass');
                    } else if (data.isSRA) {
                        $(row).addClass('greenClass');
                    }

                })
                .withOption("stateSave", true)
                .withOption('stateSaveCallback', CommonService.SaveDataTableStatus)
                .withOption("stateLoadCallback", CommonService.LoadSavedDataTableStatus)
                .withDataProp('data')
                .withOption('processing', true)
                .withOption('serverSide', true)
                .withOption('language', AppConst.UIConfig.DataTable.Language)
                .withPaginationType('full_numbers')
                .withDOM(AppConst.UIConfig.DataTable.DOM.All);

            vm.dtColumns = [
                /* 0*/
                DTColumnBuilder.newColumn('id').withTitle('').notSortable()
                .renderWith(function(data) {
                    return '<button class="btn btn-primary btn-outline btn-xs"  title="Click to view more" ng-click="vm.childInfo(' + data + ', $event)"><i class="fa fa-plus"></button>';
                }),
                /* 1*/
                DTColumnBuilder.newColumn('maNumber').withTitle('Application Number')
                .renderWith(function(data, type, full) {
                    return '<a class=""  title="Click to view more" ng-click="vm.showRegistrationDetail(' + full.id + ', $event)">' + data + '</a>';
                }),
                /* 2*/
                DTColumnBuilder.newColumn('verificationNumber').withTitle('Ver.No'),
                /* 3*/
                DTColumnBuilder.newColumn('maStatusCode').withTitle('Status')
                .renderWith(function(data, type, full) {
                    return '<span  data-ng-class="vm.getStatusColor(&#39;' + data + '&#39;)" title="' + full.maStatus + '">' + data + '</span>';
                }),
                /* 4*/
                DTColumnBuilder.newColumn('maStatusDisplayName').withTitle('Status')
                .renderWith(function(data, type, full) {
                    return '<span  data-ng-class="vm.getAgentStatusColor(&#39;' + data + '&#39;,&#39;' + full.maStatusCode + '&#39;)" title="' + data + '" data-ng-bind="&#39;' + data + '&#39;==&#39;Under Review&#39;?&#39;URVW&#39;:&#39;' + full.maStatusCode + '&#39;">' + data + '</span>';
                }),
                /* 5*/
                DTColumnBuilder.newColumn('brandName').withTitle('Brand Name')
                .renderWith(function(data, type, full) {
                    return '<span  title="' + data + '" ng-bind="&#39;' + data + '&#39;| filterNull">' + '</span>';
                }),
                /* 6*/
                DTColumnBuilder.newColumn('genericName').withTitle('Generic Name')
                .renderWith(function(data, type, full) {
                    return '<span  title="' + data + '" ng-bind="&#39;' + data + '&#39;| filterNull">' + '</span>';
                }),
                /* 7*/
                DTColumnBuilder.newColumn('applicationType').withTitle('Type'),
                /* 8*/
                DTColumnBuilder.newColumn('supplierName').withTitle('License Holder'),
                /* 9*/
                DTColumnBuilder.newColumn('agentName').withTitle('Applicant'),
                /*10*/
                DTColumnBuilder.newColumn('prescreener').withTitle('Screener'),
                /*11*/
                DTColumnBuilder.newColumn('primaryAssessor').withTitle('Assessor')
                .renderWith(function(data, type, full) {
                    return '<span  data-ng-class="vm.getAssessmentColor(&#39;' + full.isPrimaryAssessed + '&#39;,&#39;' + full.primaryAssessorDueDate + '&#39;)" title="' + full.primaryAssessor + '" ng-bind="&#39;' + full.primaryAssessor + '&#39;|filterNull">' + '</span>' +
                        '<br/><span  data-ng-class="vm.getAssessmentColor(&#39;' + full.isSecondaryAssessed + '&#39;,&#39;' + full.secondaryAssessorDueDate + '&#39;)" title="' + full.secondaryAssessor + '" ng-bind="&#39;' + full.secondaryAssessor + '&#39;|filterNull">' + '</span>';
                }),
                /*12*/
                DTColumnBuilder.newColumn('isLabRequested').withTitle('Lab Request')
                .renderWith(getLabrequestStatus),
                /*13*/
                DTColumnBuilder.newColumn('firRepliedDate').withTitle('FIR-Reply Date')
                .renderWith(function(data, type, full) {
                    return $filter('filterNull')($filter('date')(data, 'MMM d, y'));
                }),
                /*14*/
                DTColumnBuilder.newColumn('submissionDate').withTitle('Submission Date').renderWith(function(data) {
                    return $filter('date')(data, 'MMM d, y');
                }),
                /*15*/
                DTColumnBuilder.newColumn('decisionDate').withTitle('Decision Date').renderWith(function(data) {
                    return $filter('date')(data, 'MMM d, y');
                }),
                DTColumnBuilder.newColumn('id').withTitle('').withClass('button-width').renderWith(function(data, type, full) {
                    return '<button style="margin-right:5px;"   buttonFunction="AssignToCSO" class="btn btn-warning btn-outline btn-xs" title="Assign to cso" ng-click="vm.assignCSO(' + data + ', $event,' + "'CSO'" + ')" permission="permissions.MA.MAAssignToCSO" hideon-maType="&#39;' + full.maTypeCode + '&#39;"><i class="fa fa-check"></i></button>'
                        //assign to Medicine Dossier Assessor
                        +
                        '  ' + '<button style="margin-right:5px;" class="btn btn-warning btn-outline btn-xs" title="Assign to assessor" ng-click="vm.assignMDA(' + data + ', $event,' + "'ROLE_REVIEWER'" + ')" permission="permissions.MA.MAAssignToAssessors" hideon-registration="&#39;' + full.maStatusCode + '&#39;" hideon-maType="&#39;' + full.maTypeCode + '&#39;" buttonFunction="AssignToAssessors"><i class="fa fa-sticky-note-o"></i></button>';
                }).withOption('width', '8%').notSortable()
            ];

            vm.dtColumns[2].visible = RoleService.setVisibility(['IPA', 'CSO', 'CSD', 'CST', 'ROLE_MODERATOR', 'ROLE_REVIEWER', 'ROLE_HEAD']); //Verification Number
            vm.dtColumns[3].visible = !vm.userInfo.isAgent; //StatusCode
            vm.dtColumns[4].visible = vm.userInfo.isAgent; //StatusDisplayName
            vm.dtColumns[5].visible = RoleService.setVisibility(['ROLE_MODERATOR', 'ROLE_REVIEWER', 'ROLE_HEAD']); //Brand Name
            vm.dtColumns[6].visible = RoleService.setVisibility(['ROLE_MODERATOR', 'ROLE_REVIEWER', 'ROLE_HEAD']); //Generic Name
            vm.dtColumns[9].visible = RoleService.setVisibility(['ROLE_MODERATOR', 'ROLE_REVIEWER', 'ROLE_HEAD']); //Agent Name
            vm.dtColumns[10].visible = RoleService.setVisibility(['CSD', 'CST']); //Screener
            vm.dtColumns[11].visible = RoleService.setVisibility(['ROLE_MODERATOR', 'ROLE_REVIEWER', 'ROLE_HEAD']); //Assessor
            vm.dtColumns[12].visible = RoleService.setVisibility(['ROLE_MODERATOR', 'ROLE_HEAD']); //Lab request
            vm.dtColumns[13].visible = RoleService.setVisibility(['ROLE_MODERATOR', 'ROLE_REVIEWER', 'ROLE_HEAD']); //FIR Reply Date
            vm.dtColumns[15].visible = vm.userInfo.isAgent; //Decision Date

            function _childInfo(ma, event) {
                var scope = $scope.$new(true);

                var link = angular.element(event.currentTarget),
                    tr = link.parent().parent(),
                    table = vm.dtInstance.DataTable,
                    row = table.row(tr),
                    icon = (row.child.isShown() ? link.find('.fa-minus') : link.find('.fa-plus')); //find current icon , i.e plus or minus

                //if detail is shown
                if (row.child.isShown()) {
                    icon.removeClass('fa-minus').addClass('fa-plus'); //show plus icon
                    row.child.hide();
                    tr.removeClass('shown');
                } else {
                    //get result and determine directive to use for child detail
                    RegistrationFactory.detail.get({ maId: ma }).$promise.then(function(response) {
                        scope.MADetail = response.result;
                        var productTypeCode = scope.MADetail.product.productType.productTypeCode;

                        //if product type is Medical Device
                        if (productTypeCode === 'MDS') {
                            row.child($compile('<div ma-child-medical-device class="clearfix" style="padding: 0 0 0 40px;"></div>')(scope), 'no-padding');
                        } else {
                            row.child($compile('<div ma class="clearfix" style="padding: 0 0 0 40px;"></div>')(scope), 'no-padding');
                        }

                        icon.removeClass('fa-plus').addClass('fa-minus'); //show minus icon
                        row.show();
                        tr.addClass('shown');
                    });

                }
            }



            function _showRegistrationDetail(data, event) {
                $state.go('maregistration.list.info', { maId: data });
            }


            function _getStatusColor(status) {
                return RegistrationFactory.colorMap[status];
            }

            function _getAgentStatusColor(status, statusCode) {
                if (status == 'Under Review') {
                    return RegistrationFactory.colorMap['URVW'];
                } else return RegistrationFactory.colorMap[statusCode];
            }

            function _getAssessmentColor(assessed, dueDate) {
                if (assessed == "true") return RegistrationFactory.colorMap['APR'];
                if (!dueDate) {
                    return; //Due date not provided
                }
                //Compare today (new Date() ) with dueDate ( new Date(dueDate) );
                //If today is gretor (later than due date), then due date has passed.
                if (new Date() > new Date(dueDate)) {
                    //primary assessor due date passed.
                    return RegistrationFactory.colorMap['WITH'];
                }
            }

            function _assignCSO(maid, event, role, ma) {
                var title = "Assign to Dossier Screener";
                vm.roleCode = 'CSO';
                vm.csoChanged = {
                    exists: false,
                    changed: false,
                    reason: undefined
                };
                vm.dueDate = null;
                vm.assignedUser = null;
                vm.AssignValidation = {};

                var maToAssign = RegistrationFactory.detail.get({ maId: maid }).$promise;
                var roleToAssign = AdminUserMgmtFactory.role.query().$promise;
                $q.all([maToAssign, roleToAssign]).then(function(results) {
                    vm.maToAssign = results[0].result;
                    var preScreener = _.find(vm.maToAssign.ma.maAssignments, function(assignment) {
                        return assignment.isActive && assignment.responderType.responderTypeCode === vm.CONSTANT.RESPONDER_TYPE.PRE_SCREENER;
                    });
                    if (preScreener) {
                        vm.csoChanged.exists = true;
                    }
                    var data = results[1];
                    vm.roles = $filter('orderBy')(data, 'name');
                    vm.roleSelected = $filter("filter")(vm.roles, { roleCode: vm.roleCode })[0];
                    vm.onRoleSelected(vm.roleSelected, preScreener, 'cso');
                });
                vm.users = [];
                $ngConfirm({
                    title: title,
                    contentUrl: 'app/registration/list/modals/assignMA.html',
                    type: "orange",
                    typeAnimated: true,
                    closeIcon: true,
                    scope: $scope,
                    columnClass: 'col-md-6 col-md-offset-3',
                    buttons: {
                        update: {
                            text: "Assign",
                            roleCode: vm.roleCode,
                            btnClass: "btn-warning",
                            action: function() {
                                vm.AssignValidation.$showError = true;
                                if (vm.AssignValidation.$isValid) {
                                    saveAssignCSO(maid);

                                } else {
                                    return false;
                                }
                            }
                        }
                    }
                });

            }


            function _assignMDA(maid, event) {
                var title = "Assign to Dossier Assessor";
                vm.roleCode = 'ROLE_REVIEWER';
                var assessors = {};
                vm.dueDatePrimary = null;
                vm.assignedUser = null;
                vm.dueDateSecondary = null;
                vm.assignedUserSecondary = null;
                vm.showAddSecondaryAssessors = false;
                vm.assessorsChanged = {
                    primaryExists: false,
                    secondaryExists: false,
                    primaryChanged: false,
                    secondaryChanged: false
                }
                vm.assignedUserChangeReason = {
                    primary: null,
                    secondary: null
                };
                vm.AssignValidation = {};
                var maToAssign = RegistrationFactory.detail.get({ maId: maid }).$promise;
                var roleToAssign = AdminUserMgmtFactory.role.query().$promise;
                $q.all([maToAssign, roleToAssign]).then(function(results) {
                    vm.maToAssign = results[0].result;
                    assessors.primary = _.find(vm.maToAssign.ma.maAssignments, function(assignment) {
                        return assignment.isActive && assignment.responderType.responderTypeCode === vm.CONSTANT.RESPONDER_TYPE.PRIMARY_ASSESSOR;
                    });
                    if (assessors.primary) {
                        vm.assessorsChanged.primaryExists = true;
                    }
                    assessors.secondary = _.find(vm.maToAssign.ma.maAssignments, function(assignment) {
                        return assignment.isActive && assignment.responderType.responderTypeCode === vm.CONSTANT.RESPONDER_TYPE.SECONDARY_ASSESSOR;
                    });
                    if (assessors.secondary) {
                        vm.assessorsChanged.secondaryExists = true;
                    }

                    var data = results[1];
                    vm.roles = $filter('orderBy')(data, 'name');
                    vm.roleSelected = $filter("filter")(vm.roles, { roleCode: vm.roleCode })[0];
                    vm.onRoleSelected(vm.roleSelected, assessors, 'assessor');
                });
                vm.users = [];
                $ngConfirm({
                    title: title,
                    contentUrl: 'app/registration/list/modals/assignMA.html',
                    type: "orange",
                    typeAnimated: true,
                    closeIcon: true,
                    scope: $scope,
                    columnClass: 'col-md-6 col-md-offset-3',
                    buttons: {
                        update: {
                            text: "Assign",
                            roleCode: vm.roleCode,
                            btnClass: "btn-warning",
                            action: function() {
                                vm.AssignValidation.$showError = true;

                                if (vm.AssignValidation.$isValid) {
                                    saveAssignMDA(maid, assessors);
                                } else {
                                    return false;
                                }
                            }
                        }
                    }
                });

            }


            function _onRoleSelected(role, assessor, mode) {
                AdminUserMgmtFactory.userRole.query({ roleID: role.id }, function(users) {
                    vm.users = $filter('orderBy')(users, 'firstName');

                    //Popuplate selected users (if already)
                    if (mode === 'cso' && assessor) {
                        vm.assignedUser = _.find(vm.users, function(user) {
                            return user.id === assessor.assignedToUserID;
                        });
                        vm.dueDate = assessor.dueDate;
                    }
                    if (mode === 'assessor') {
                        if (assessor.primary) {
                            vm.assignedUser = _.find(vm.users, function(user) {
                                return user.id === assessor.primary.assignedToUserID;
                            });
                            vm.dueDatePrimary = new Date(assessor.primary.dueDate);
                        }
                        if (assessor.secondary) {
                            vm.assignedUserSecondary = _.find(vm.users, function(user) {
                                return user.id === assessor.secondary.assignedToUserID;
                            });
                            vm.dueDateSecondary = new Date(assessor.secondary.dueDate);
                            //If valid secondary assessor, set display to true;
                            if (vm.assignedUserSecondary) {
                                vm.showAddSecondaryAssessors = true;

                            }
                        }
                    }

                });
            }


            function _discardDraft(draft) {
                $ngConfirm({
                    title: "Discard application",
                    content: "Are you sure you want to delete this application?",
                    type: 'red',
                    typeAnimated: true,
                    scope: $scope,
                    buttons: {
                        confirm: {
                            text: "Confirm",
                            btnClass: 'btn-warning',
                            action: function(scope) {
                                WIPFactory.deleteWIP.delete({ id: draft.id }, function() {
                                    NotificationService.notify("Application succesfully discarded", "alert-success");
                                    loadWIP();
                                }, function() {
                                    NotificationService.notify("Cannot discard draft. Please try again!", "alert-danger");
                                });
                            }
                        },
                        cancel: {
                            back: "Cancel"
                        }
                    }
                });

            }



            function _gotoDraft(wip) {
                if (wip.type == 'NMR') {
                    $state.go('maregistration.newApplication.wip', { id: wip.id });
                } else if (wip.type == 'REN') {
                    $state.go('maregistration.renewal.wip', { id: wip.id });
                } else if (wip.type == 'VAR') {
                    $state.go('maregistration.variation.wip', { id: wip.id });
                }
            }

            // Medicine Dossier Assesssor
            function saveAssignMDA(maid, previousAssessor) {

                //arrayto hold secondary and primary assessor
                vm.assigned = [];
                //assign responder type
                RegistrationFactory.responderType.query(function(data) {
                    vm.maAssigned.responderTypeID = $filter("filter")(data, { responderTypeCode: vm.CONSTANT.RESPONDER_TYPE.PRIMARY_ASSESSOR })[0].id;
                    vm.maAssignedSecondary.responderTypeID = $filter("filter")(data, { responderTypeCode: vm.CONSTANT.RESPONDER_TYPE.SECONDARY_ASSESSOR })[0].id;

                    vm.maAssigned.assignedToUserID = vm.assignedUser.id;
                    vm.maAssigned.assignedByUserID = vm.userInfo.id;
                    vm.maAssigned.maid = maid;
                    vm.maAssigned.dueDate = vm.dueDatePrimary;
                    vm.maAssigned.isActive = true;
                    vm.maAssigned.comment = vm.assessorsChanged.primaryExists ? vm.assignedUserChangeReason.primary : "New Primary Reviewer Assigned";
                    vm.assigned.push(vm.maAssigned);

                    if (vm.assignedUserSecondary) {
                        vm.maAssignedSecondary.assignedByUserID = vm.userInfo.id;
                        vm.maAssignedSecondary.maid = maid;
                        vm.maAssignedSecondary.isActive = true;
                        vm.maAssignedSecondary.assignedToUserID = vm.assignedUserSecondary.id;
                        vm.maAssignedSecondary.dueDate = vm.dueDateSecondary;
                        vm.maAssignedSecondary.comment = vm.assessorsChanged.secondaryExists ? vm.assignedUserChangeReason.secondary : "New Secondary Reviewer Assigned";
                        vm.assigned.push(vm.maAssignedSecondary);
                    } else {
                        //If previous secondary assessor exists, set it  to false;
                        if (previousAssessor.secondary) {
                            vm.maAssignedSecondary.assignedByUserID = previousAssessor.secondary.assignedByUserID;
                            vm.maAssignedSecondary.maid = maid;
                            vm.maAssignedSecondary.isActive = false;
                            vm.maAssignedSecondary.assignedToUserID = previousAssessor.secondary.assignedToUserID;
                            vm.maAssignedSecondary.dueDate = previousAssessor.secondary.dueDate;
                            vm.assigned.push(vm.maAssignedSecondary);
                        }
                    }


                    RegistrationFactory.maAssign.save(vm.assigned, function() {
                        NotificationService.notify("Successfully Assigned", 'alert-success');
                        vm.assignedUserChangeReason = {
                            primary: null,
                            secondary: null
                        };
                        reloadMaList();

                    }, function() {
                        NotificationService.notify("Unable to Assign MA", 'alert-danger');

                    });

                });

            }

            //Customer Service officer
            function saveAssignCSO(maid) {
                RegistrationFactory.responderType.query(function(data) {
                    vm.maAssigned.responderTypeID = $filter("filter")(data, { responderTypeCode: vm.CONSTANT.RESPONDER_TYPE.PRE_SCREENER })[0].id;

                    vm.maAssigned.assignedToUserID = vm.assignedUser.id;
                    vm.maAssigned.assignedByUserID = vm.userInfo.id;
                    vm.maAssigned.maid = maid;
                    vm.maAssigned.dueDate = vm.dueDatePrimary;
                    vm.maAssigned.comment = vm.csoChanged.exists ? vm.csoChanged.reason : "New CSO Assigned";

                    RegistrationFactory.maAssign.save([vm.maAssigned], function() {
                        NotificationService.notify("Successfully Assigned", 'alert-success');
                        vm.csoChanged = {
                            exists: false,
                            changed: false,
                            reason: null
                        };
                        reloadMaList();
                    }, function() {
                        NotificationService.notify("Unable to Assign MA", 'alert-danger');

                    });
                });
            }

            function _suspend(id) {
                $ngConfirm({
                    title: "Suspend application",
                    content: "Are you sure you want to Suspend this application?",
                    type: 'orange',
                    typeAnimated: true,
                    scope: $scope,
                    buttons: {
                        confirm: {
                            text: "Confirm",
                            btnClass: 'btn-warning',
                            action: function(scope) {
                                /*WIPFactory.deleteWIP.delete({id: draft.id}, function () {
                                 NotificationService.notify("Application succesfully discarded", "alert-success");
                                 loadWIP();
                                 }, function () {
                                 NotificationService.notify("Cannot discard draft. Please try again!", "alert-danger");
                                 });*/
                            }
                        },
                        cancel: {
                            back: "Cancel"
                        }
                    }
                });
            }

            function _cancelApplication(id) {
                $ngConfirm({
                    title: "Cancel application",
                    content: "Are you sure you want to Cancel this application?",
                    type: 'red',
                    typeAnimated: true,
                    scope: $scope,
                    buttons: {
                        confirm: {
                            text: "Confirm",
                            btnClass: 'btn-danger',
                            action: function(scope) {
                                /*WIPFactory.deleteWIP.delete({id: draft.id}, function () {
                                 NotificationService.notify("Application succesfully discarded", "alert-success");
                                 loadWIP();
                                 }, function () {
                                 NotificationService.notify("Cannot discard draft. Please try again!", "alert-danger");
                                 });*/
                            }
                        },
                        cancel: {
                            back: "Cancel"
                        }
                    }
                });
            }

            function _assessorChanged(type) {
                if (type == 'primary') {
                    vm.assessorsChanged.primaryChanged = true;
                } else if (type == 'secondary') {
                    vm.assessorsChanged.secondaryChanged = true;
                } else if (type == 'cso') {
                    vm.csoChanged.changed = true;
                }
            }

            function getLabrequestStatus(data, type, full) {
                var IsLabRequested = full.isLabRequested,
                    IsLabResultUploaded = full.isLabResultUploaded;
                var status = (IsLabRequested == true && IsLabResultUploaded == true) ? 'uploaded' : ((IsLabRequested == true && IsLabResultUploaded == false) ? 'requested' : 'non-requested');
                var label = status == 'uploaded' ? 'U' : (status == 'requested' ? 'R' : 'N');
                var title = status == 'uploaded' ? 'Lab Request Uploaded' : (status == 'requested' ? 'Lab Request Generated' : 'Lab Request Not Generated');
                var badge = status == 'uploaded' ? 'badge badge-primary' : (status == 'requested' ? 'badge badge-warning' : 'badge badge-info');

                return '<span   title="' + title + '" class="' + badge + '"><strong>' + label + '</strong></span>';
            }

            function reloadMaList() {
                vm.dtInstance.reloadData();
            }

        });

})(window.angular);
