'use strict';

angular.module('pdx.controllers')
    .controller('ApplicantDetailController', function($state, $filter,$stateParams,PublicFactory) {
        var vm = this;

        vm.agentID=$stateParams.id;


        //A call back when tab changes in tabbed view
        vm.tabChanged = function (tabIndex){
          switch(tabIndex){
            case 0:
              loadAgentData();
              break;
            case 1:
              loadAgentProducts();
              break;
            default:
              loadAgentData();
          }
        };

        //Data for agent detail tab
        function loadAgentData(){
          vm.agent = PublicFactory.agentDetail.get({id:vm.agentID});
        }

        //Data for Agent Product List
        function loadAgentProducts(){
          vm.agentProduct = PublicFactory.agentProdcut.query({id:vm.agentID});
        }


        //By default tab 0 is opened!
        vm.activeTab = 0;

        //This function filters out subs from the Main and returns those values that are not in sub



    });
