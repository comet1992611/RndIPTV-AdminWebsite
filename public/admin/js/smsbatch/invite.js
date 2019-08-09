function invite(Restangular, $uibModal, $q, notification, $state,$http) {
    'use strict';

    return {
        restrict: 'E',
        scope: {
            selection: '=',
            type: '@',
            dismiss: '&'
        },
        link: function(scope, element, attrs) {

            scope.icon = 'fa fa-paper-plane fa-md';
            if (attrs.type === 'invite_users') scope.label = 'Invite';

            //modal function
            scope.modal = function () {
                $uibModal.open({
                    template:
                        '<div class="modal-header">' +
                            '<h5 class="modal-title" style="font-weight: bold;font-size: 20px;">User Invitation</h5>' +
                        '</div>' +
                        '<div class="modal-body">'+
                            '<div class="row text-center">'+
                                '<div class="btn-group" uib-dropdown is-open="status.isopen"> ' +
                                    '<button id="single-button" type="button" class="btn btn-default" uib-dropdown-toggle ng-disabled="disabled">' +
                                        '<span class="glyphicon {{icon}}"></span> {{button}} <p style="display: none;">{{group_id}}</p> <span class="caret"></span>' +
                                    '</button>' +
                                    '<ul class="dropdown-menu" uib-dropdown-menu role="menu" aria-labelledby="single-button">' +
                                        '<li role="menuitem" ng-click="change(choice.name,choice.group_id)"  ng-repeat="choice in list_of_groups">' +
                                            '<p id="paragraph_vod">{{choice.name}}</p>' +
                                        '</li>' +
                                    '</ul>' +
                                '</div>'+
                            '</div>'+
                            '<div class="row">'+
                                '<form>'+
                                    '<div class="form-group" style="padding: 20px;">'+
                                        '<input type="text" id="emailinput" class="form-control" placeholder="Please enter the email address you want to invite" id="email">'+
                                    '</div>'+
                                '</form>'+
                            '</div>'+
                        '</div>'+
                        '<div class="modal-footer">' +
                            '<button class="btn btn-primary" type="button" ng-click="ok()">OK</button>' +
                            '<button class="btn btn-warning" type="button" ng-click="cancel()">Cancel</button>' +
                        '</div>',

                    controller:('main', ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
                        //close modal
                        function closeModal() {
                            $uibModalInstance.dismiss();
                        }
                        //./close modal
                        $scope.button = 'Choose Group';

                        $scope.cancel = function () {
                            closeModal();
                        };

                        var groups_array = [];
                        $http.get('../api/groups?exclude_group=superadmin').then(function successCallback(response) {
                            var data = response.data;
                            for(var i=0;i<data.length;i++){
                                groups_array.push({name:data[i].name,group_id:data[i].id})
                            }
                        }, function errorCallback(response) {
                            notification.log(response.statusText, { addnCls: 'humane-flatty-error' });
                        });

                        $scope.list_of_groups = groups_array;

                        $scope.change = function(name,group_id){
                            $scope.button = name;
                            $scope.group_id = group_id;
                        };

                        $scope.ok = function () {
                            var email = document.getElementById('emailinput').value;

                            if ($scope.group_id >= 0){
                                if (email.length > 0){

                                    var data = { 'email': email,'group_id': $scope.group_id };
                                    $http.post("../api/users/invite", data).then(function successCallback(response) {

                                        new Promise(function(resolve, reject) {
                                            closeModal();
                                            notification.log(response.data.message, { addnCls: 'humane-flatty-success' });
                                            setTimeout(function() {
                                                resolve(window.location.reload(true));
                                            }, 1000);
                                        });

                                    },function errorCallback(response) {
                                        notification.log(response.data.message, { addnCls: 'humane-flatty-error' });
                                    });
                                } else {
                                    notification.log('Please write email', { addnCls: 'humane-flatty-error' });
                                }
                            } else {
                                notification.log('Please choose group', { addnCls: 'humane-flatty-error' });
                            }
                        };
                    }]) //./controller
                }) //./modal open
            }  //./modal function
        },
        template: '<a class="btn btn-default btn-md" ng-click="modal()"><span class="{{ icon }}" aria-hidden="true"></span>&nbsp;{{ label }}</a>'
    };
}

invite.$inject = ['Restangular', '$uibModal', '$q', 'notification', '$state','$http'];

export default invite;