function roles(Restangular, $uibModal, $q, notification, $state,$http) {
    'use strict';

    return {
        restrict: 'E',
        scope: { post: '&' },
        link: function (scope) {
            scope.goToRoles = function () {

                location.replace("/admin/#/Groups/list");

            };
        },
        template: '<a class="btn btn-default btn-md" ng-click="goToRoles()"><i class="fa fa-share fa-md"></i>&nbsp;Roles</a>'
    };
}

roles.$inject = ['Restangular', '$uibModal', '$q', 'notification', '$state','$http'];

export default roles;